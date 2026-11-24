# TriageSync

Full-stack support-ticket triage and resource-slot booking application, built for the ENGN-F1 Full Stack Developer assessment (48-hour build).

- Support agents get tickets imported idempotently, auto-categorised, and reviewed with an audit trail.
- Users book 30-minute slots on shared resources (rooms, labs, equipment) with race-safe booking.

---

## 1. Overview

| Area | What it does |
|---|---|
| Ticket triage | Idempotent feed import, deterministic auto-triage (category + priority), human-override protection, immutable `autoCategory`, `ticket_events` audit trail, injection-safe combined filters, stats with model agreement rate |
| Resource booking | Resource CRUD (admin), availability by date range, bookings on a 30-minute grid, overlap prevention under concurrency, PENDING -> APPROVED / REJECTED / CANCELLED workflow, per-user limits |
| Security | bcrypt passwords, stateless JWT (24h), role-based access (USER / ADMIN), global error contract |

## 2. Live Links

Coming soon. Deployment is in progress; links will be added here before the deadline.

| Part | URL |
|---|---|
| Frontend | Coming soon |
| Backend API base | Coming soon | 
| Database | Hosted PostgreSQL (Coming soon) |
| Repository | `https://github.com/dulal-jgec/engnf1-fullstack-dulal-jgec` |

## 3. Seeded Credentials

| Role | Email | Password |
|---|---|---|
| ADMIN | `admin@triagesync.test` | `Admin@123` |
| USER | `user@triagesync.test` | `User@123` |

Seed data also includes 6 resources (at least 2 per type, 1 inactive) and 15 tickets covering all categories and priorities, including one ticket with a raw `<script>` payload (XSS check) and 3 already-reviewed tickets.

## 4. Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.3.5, Java 17, Maven |
| Persistence | Spring Data JPA / Hibernate, PostgreSQL |
| Security | Spring Security, JWT, bcrypt |
| Boilerplate | Lombok |
| Frontend | Next.js (React), React Query for server state and optimistic updates |
| Hosting | Frontend, backend and database each hosted over HTTPS |

Monorepo: `backend/` and `frontend/` folders (as allowed by rule Q2).

## 5. Folder Structure

```
engnf1-fullstack-<username>/
├── backend/
│   ├── src/main/java/com/triagesync/backend/
│   │   ├── config/        ApplicationConfig, DataSeeder, SecurityConfig
│   │   ├── controller/    Auth, Booking, Resource, Stats, Ticket controllers
│   │   ├── dto/           PageResponse + auth / booking / resource / ticket DTOs
│   │   ├── entity/        User, Ticket, TicketEvent, Resource, Booking
│   │   ├── enums/         BookingStatus, Category, Priority, ResourceType, Role, TicketStatus
│   │   ├── exception/     GlobalExceptionHandler
│   │   ├── mapper/        Booking, Resource, Ticket mappers
│   │   ├── repository/    JPA repositories (+ specification/TicketSpecification)
│   │   ├── security/      AuthUtil, JwtAuthenticationFilter, JwtService
│   │   └── service/       AuthService, BookingService, ResourceService, TicketService
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── application.properties.example
│   └── pom.xml
├── frontend/              Next.js app
├── README.md
├── SOLUTION.md
├── AI_USAGE.md
├── .env.example
└── .gitignore
```

Request flow: `Controller -> Service -> Repository -> PostgreSQL`. Entities are never returned directly; DTOs are used for every response.

## 6. Local Setup & Idempotent Seed Command

### Prerequisites
Java 17, Maven 3.9+, Node 18+, a PostgreSQL database (local or hosted).

### Backend
```bash
cd backend
cp src/main/resources/application.properties.example src/main/resources/application.properties
# set DB URL / user / password and the JWT secret through environment variables (see .env.example)
mvn spring-boot:run
```
Runs on `http://localhost:8080`.

### Frontend
```bash
cd frontend
cp .env.example .env.local     # set NEXT_PUBLIC_API_URL=http://localhost:8080/api
npm install
npm run dev
```
Runs on `http://localhost:3000`.

### Seeding (idempotent)
`DataSeeder` implements `CommandLineRunner` and runs on every application start. It checks for existing users, resources and tickets (by email, case-insensitive name and `externalId`) before inserting, so running it twice creates no duplicates.

To re-run it manually, restart the backend (`mvn spring-boot:run`).

### Environment variables
See `.env.example`. No secrets are committed to the repository.

## 7. Database Schema

| Table | Key columns | Notes |
|---|---|---|
| `users` | id, name, email (unique, lowercase), passwordHash, role, createdAt | passwordHash is never exposed |
| `tickets` | id, externalId (unique), subject, body, autoCategory, category, isHumanOverride, priority, status, assigneeId, isReviewed, createdAt, updatedAt | `autoCategory` is immutable |
| `ticket_events` | id, ticketId, field, oldValue, newValue, actor, createdAt | append-only audit trail |
| `resources` | id, name (unique, case-insensitive), type, capacity, description, isActive, createdAt | |
| `bookings` | id, resourceId, userId, ticketId (nullable), startTime, endTime, purpose, status, decisionNote, createdAt | indexed on resourceId / startTime / endTime / status |

Relations use UUID foreign keys (no eager `@ManyToOne` / `@OneToMany` mappings) to avoid N+1 queries; related data is merged in the service layer or fetched with explicit queries. Indexes: `tickets.externalId`, `resources.name`, `bookings.resourceId` (plus time and status), and a composite index on `tickets(status, category, priority)`.

## 8. API Summary

Base path `/api`. Paginated shape: `{ data, page, pageSize, total, totalPages }`. Errors: `{ error: { code, message } }` with `VALIDATION_ERROR`, `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`.

| # | Endpoint | Access |
|---|---|---|
| 1 | `POST /auth/register` | Public |
| 2 | `POST /auth/login` | Public |
| 3 | `GET /auth/me` | Logged in |
| 4 | `POST /tickets/import` | Logged in |
| 5 | `GET /tickets` (status, category, priority, q, page, limit) | Logged in |
| 6 | `GET /tickets/:id` | Logged in |
| 7 | `PATCH /tickets/:id` (+ `X-Agent` header) | Logged in |
| 8 | `GET /stats` | Logged in |
| 9 | `GET /resources` | Logged in |
| 10 | `GET /resources/:id` | Logged in |
| 11 | `POST /resources` | ADMIN |
| 12 | `PATCH /resources/:id` | ADMIN |
| 13 | `GET /resources/:id/availability` | Logged in |
| 14 | `POST /bookings` | Logged in |
| 15 | `GET /bookings/mine` | Logged in |
| 16 | `GET /bookings/:id` | Owner / ADMIN |
| 17 | `GET /bookings` | ADMIN |
| 18 | `PATCH /bookings/:id/cancel` | Owner |
| 19 | `PATCH /bookings/:id/approve` | ADMIN |
| 20 | `PATCH /bookings/:id/reject` | ADMIN |
| 21 | `GET /admin/stats` | ADMIN |

Order of checks: 401 -> 403 (role) -> 404 (path id) -> 403 (ownership) -> 400/422 (validation) -> 404 (referenced id) -> 409 (conflict). `/bookings/mine` is mapped before `/bookings/:id`.

## 9. Completed Features Checklist

**Backend**
- [x] Register / login / me, bcrypt, JWT (24h), role-based access
- [x] Idempotent ticket import with deterministic auto-triage (T-B1, T-B2)
- [x] Human-override protection (T-B2)
- [x] Agent PATCH with `ticket_events` audit trail and `isReviewed` (T-B3)
- [x] Injection-safe combined filters and `q` search (T-B4)
- [x] `/stats` with `modelAgreementRate`
- [x] Resource CRUD and availability (max 7-day range)
- [x] Bookings: grid, duration, future window, overlap, 3-booking limit, lifecycle (B1-B12)
- [x] Race-safe booking creation (B6)
- [x] Admin stats
- [x] Global error contract
- [x] Idempotent seed script

**Frontend**
- [ ] Login and Register
- [ ] Triage queue, stats strip, dynamic filters, Re-Import button
- [ ] Ticket detail panel with audit history
- [ ] Optimistic UI with rollback and visible error message
- [ ] XSS-safe ticket rendering
- [ ] Resources list, detail, availability, booking form
- [ ] My Bookings, Admin Resources / Bookings / Analytics
- [ ] Loading / empty / error states; responsive at 375 / 768 / 1280 px

**Deliverables**
- [x] README.md, SOLUTION.md, AI_USAGE.md
- [ ] Live deployment (HTTPS, seeded)

## 10. Known Limitations

- The frontend and the live deployment are still in progress (see the checklist above).
- Ticket search (`q`) uses a case-insensitive substring match; for very large datasets a trigram or full-text index would be better.
- XSS safety relies on the frontend rendering ticket text as escaped text (React default); the API returns raw data by design.
- Free-tier hosting may cold-start, so the first request after idle can be slow.
- No refresh tokens; the JWT simply expires after 24 hours.
- No automated integration test suite yet; the concurrency behaviour was checked manually.
