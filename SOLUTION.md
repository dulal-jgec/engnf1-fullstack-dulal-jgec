# SOLUTION.md

## Part A: Architecture & Ticket-to-Dashboard Trace

### A.1 Architecture (ASCII)

```
┌──────────────────────────┐        HTTPS / JSON (JWT in Authorization header)
│  Next.js Frontend        │ ─────────────────────────────────────────────┐
│  React Query (cache,     │                                              │
│  optimistic updates)     │                                              ▼
└──────────────────────────┘                    ┌────────────────────────────────────────────┐
                                                │ Spring Boot Backend                        │
                                                │                                            │
                                                │  JwtAuthenticationFilter -> SecurityContext│
                                                │        │                                   │
                                                │  SecurityConfig (RBAC: USER / ADMIN)       │
                                                │        │                                   │
                                                │  Controllers (Auth, Ticket, Resource,      │
                                                │               Booking, Stats)              │
                                                │        │  DTO validation                   │
                                                │  Services (AuthService, TicketService,     │
                                                │            ResourceService, BookingService)│
                                                │        │  @Transactional                   │
                                                │  Repositories (JPA, TicketSpecification)   │
                                                │        │                                   │
                                                │  GlobalExceptionHandler (error contract)   │
                                                └────────┼───────────────────────────────────┘
                                                         ▼
                                              ┌──────────────────────┐
                                              │ PostgreSQL           │
                                              │ users, tickets,      │
                                              │ ticket_events,       │
                                              │ resources, bookings  │
                                              └──────────────────────┘
```

### A.2 Function-by-function trace: an imported ticket reaching the dashboard

Example feed item: `{ externalId: "EXT-1001", subject: "My package has not arrived", body: "Tracking shows nothing for 10 days" }`

| Step | Where                                                                                         | What happens                                                                                                                                                                                                                                              |
| ---- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Frontend "Re-Import Feed" button                                                              | Sends `POST /api/tickets/import` with `{ tickets: [...] }` and the JWT                                                                                                                                                                                    |
| 2    | `JwtAuthenticationFilter` + `JwtService`                                                      | Validates the token and sets the `SecurityContext` (401 if invalid)                                                                                                                                                                                       |
| 3    | `TicketController` (import endpoint)                                                          | Receives the `TicketImportRequest` DTO; subject (3-150) and body (5-2000) are validated and trimmed, 400/422 on failure                                                                                                                                   |
| 4    | `TicketService` (import logic)                                                                | For each item, looks up `externalId` through `TicketRepository`                                                                                                                                                                                           |
| 5a   | New `externalId`                                                                              | `classifyTicket(subject, body)` assigns `autoCategory` and `priority` from the keyword rules (T-B1). `category = autoCategory`, `isHumanOverride = false`, `status = OPEN`, `isReviewed = false`. Saved, `importedCount++`                                |
| 5b   | Existing `externalId`, not overridden                                                         | If subject/body changed, they are updated and classification re-runs; `updatedCount++`                                                                                                                                                                    |
| 5c   | Existing `externalId`, `isHumanOverride == true`                                              | Subject/body update only; category and priority are not touched; `skippedOverrideCount++`                                                                                                                                                                 |
| 6    | Response                                                                                      | `200 { importedCount, updatedCount, skippedOverrideCount, total }`                                                                                                                                                                                        |
| 7    | Frontend                                                                                      | Invalidates the React Query keys for tickets and stats, so both refetch                                                                                                                                                                                   |
| 8    | `GET /api/tickets?...` through `TicketController` -> `TicketService` -> `TicketSpecification` | Builds a dynamic JPA `Specification` (status, category, priority, `q`) combined with AND; every value is bound as a parameter. `TicketRepository` runs it with a `Pageable`, `TicketMapper` converts to DTOs, and the result is wrapped in `PageResponse` |
| 9    | `GET /api/stats` through `StatsController`                                                    | Returns `byCategory`, `byPriority`, `byStatus`, `reviewedCount`, `modelAgreementRate` for the stats strip                                                                                                                                                 |
| 10   | Frontend table                                                                                | Renders subject/body as escaped text (React default escaping), so `<script>` payloads show as text and never execute (T-B5)                                                                                                                               |

Agent edit trace: `PATCH /api/tickets/:id` goes to `TicketService`, which loads the ticket, compares old and new values for `category / priority / status / assigneeId`, writes one `TicketEvent` per changed field (actor = `X-Agent` header, otherwise the user's email), sets `isHumanOverride = true` if the category changed, sets `isReviewed = true` per the definition below, saves, and returns `{ ticket, events }`.

### A.3 Definition of "reviewed"

A ticket is **reviewed** (`isReviewed = true`) when an agent, through `PATCH /api/tickets/:id`, either:

1. changes its **category**, or
2. moves its **status away from `OPEN`** (for example `OPEN -> IN_PROGRESS` or `OPEN -> RESOLVED`).

Changing only priority or assignee does not mark a ticket reviewed. Once set, `isReviewed` is never reset by a re-import.

`modelAgreementRate` is the percentage of reviewed tickets whose current `category` still equals the immutable `autoCategory`, meaning the classifier and the human agent agree.

---

## Part B: Concurrency (B6) & Idempotent Human Override (T-B2) Design

### B.1 Race-safe booking (B6)

**Problem:** two or more concurrent requests for overlapping slots on the same resource can both pass a plain "check, then insert" and double-book.

**Design:**

1. `BookingService.createBooking()` runs in a transaction with `Isolation.SERIALIZABLE`.
2. The overlap query in `BookingRepository` uses `@Lock(LockModeType.PESSIMISTIC_WRITE)`, which issues `SELECT ... FOR UPDATE` on the matching bookings of that resource.
3. The overlap predicate is `newStart < existingEnd AND newEnd > existingStart`, restricted to `PENDING` and `APPROVED` bookings, so back-to-back slots pass and rejected/cancelled bookings free the slot (B5).
4. If any row overlaps, a conflict exception is thrown and `GlobalExceptionHandler` maps it to `409 CONFLICT`. Otherwise the booking is inserted as `PENDING` and the transaction commits.
5. A serialization failure under contention is also mapped to 409, so a losing request never produces a 500.

**Expected result for 10 simultaneous requests on one slot:** exactly one commits (201) and the other nine return 409.

**Design note (viva):** `FOR UPDATE` only locks rows that already exist. For the very first booking of an empty slot there is no row to lock, so the `SERIALIZABLE` isolation level, which makes PostgreSQL detect conflicting predicate reads and writes and abort one transaction, is what protects that case. A stricter alternative is a PostgreSQL exclusion constraint on `(resource_id, tsrange(start_time, end_time))`, listed in Part D.

**How the check is run:**

```bash
seq 10 | xargs -P10 -I{} curl -s -o /dev/null -w "%{http_code}\n" \
  -X POST "$API/bookings" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"resourceId":"<id>","startTime":"<ISO>","endTime":"<ISO>","purpose":"race test"}'
# expected output: one 201 and nine 409
```

### B.2 Idempotent import with human-override protection (T-B2)

- **Idempotency key:** `tickets.externalId` has a unique constraint and index. Import looks the ticket up by `externalId` first, so re-importing the same feed never creates duplicates; the unique constraint is the safety net if two imports race.
- **Override flag:** `isHumanOverride` becomes `true` the first time an agent changes the category through `PATCH`.
- **Re-import rule:** subject and body may update if changed, but category and priority are re-classified only when `isHumanOverride == false`. When the flag is true the ticket is counted in `skippedOverrideCount` and the category stays as the agent set it.
- **Immutable baseline:** `autoCategory` is never modified after creation, so the agreement rate stays meaningful and the original prediction is preserved.
- **Audit:** every agent change is appended to `ticket_events` (field, oldValue, newValue, actor, createdAt); events are never updated or deleted.

---

## Part C: Measure First, Then Optimise

**Target:** `GET /api/tickets?limit=100` on a dataset of 500+ tickets.

### C.1 Method

1. Load 500+ tickets (import a generated feed through `POST /api/tickets/import`).
2. Measure end-to-end latency with 30 runs against the same running backend, discarding a warm-up request, and take p50 and p95:
   ```bash
   for i in $(seq 30); do
     curl -s -o /dev/null -w "%{time_total}\n" -H "Authorization: Bearer $TOKEN" "$API/tickets?limit=100"
   done | sort -n
   ```
3. Look at the plan of the generated query with `EXPLAIN (ANALYZE, BUFFERS)`.
4. Add the index below, restart, and repeat steps 2 and 3 with the same data.

### C.3 Optimisation applied

A composite index on `tickets(status, category, priority)`, declared with `@Table(indexes = ...)` on the `Ticket` entity, so the combined filters built by `TicketSpecification` can use an index scan instead of scanning the whole table. The list endpoint maps directly to DTOs and does not load related entities per row, so there is no N+1 behaviour to remove.

### C.4 One trade-off

Every index slows writes slightly: each insert or update in `POST /api/tickets/import` must also update the B-tree. The system is read-heavy (agents browsing and filtering the queue) compared with periodic feed imports, so the read gain outweighs the write cost. The index does not help the `q` search, because a substring match (`LIKE '%term%'`) cannot use a normal B-tree index.

---

## Part D: What I Would Improve With One More Day

1. **Booking uniqueness at the database level:** add a PostgreSQL exclusion constraint on `(resource_id, tsrange(start_time, end_time))` for PENDING/APPROVED rows, so correctness no longer depends only on application locking. See `backend/src/main/java/com/triagesync/backend/entity/Booking.java` and `.../service/BookingService.java`.
2. **Rate limiting and abuse protection:** add per-IP limiting (Caffeine for one instance, Redis for several) in front of the auth endpoints. See `.../config/SecurityConfig.java`.
3. **Full-text / trigram search:** use the `pg_trgm` extension with a GIN index for ticket `q`. See `.../repository/specification/TicketSpecification.java`.
4. **Automated integration tests:** Testcontainers tests for the 10-request booking race and for re-import with human override. See `backend/src/test/java/`.
5. **Refresh tokens:** a refresh-token flow instead of a single 24-hour JWT. See `.../security/JwtService.java`.
