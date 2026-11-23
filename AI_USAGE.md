# AI_USAGE.md

Declaration of AI assistance during the 2-day (48-hour) build window, as required by rule R2.

## 1. AI tools used

| Tool | Used for |
|---|---|
| DeepSeek | Drafting and refining the documentation files (README.md, SOLUTION.md, AI_USAGE.md) and wording of the engineering write-up. |
| Claude (Anthropic) | Reading and interpreting the assessment brief, planning the backend architecture and layering, reviewing the Spring Boot code against the rules, and drafting documentation. |

## 2. What AI was used for

- Understanding the requirements (ticket idempotency rules T-B1/T-B2, booking rules B1-B12, API contract).
- Designing the layered structure (Controller -> Service -> Repository) and the DTO approach that avoids N+1 problems.
- Discussing the concurrency approach for slot booking (pessimistic locking plus serializable isolation).
- Reviewing code for rule coverage against the brief (for example, bcrypt strength of 10 or more).
- Drafting the documentation files, which I then edited and verified against my actual code.

## 3. One instance where I verified or overrode an AI suggestion

- **Suggestion:** an AI suggested that a plain `@Transactional` on `createBooking` would be enough to prevent double-booking.
- **What I checked:** I compared it with rule B6, which requires exactly one success among 10 simultaneous requests for the same slot. Default isolation does not stop two transactions from both reading "no overlap" and then both inserting. I read the PostgreSQL documentation on row locks and the serializable isolation level, and ran 10 parallel cURL requests against one slot to check the result.
- **Outcome:** I did not use the plain `@Transactional` version. I used `@Lock(LockModeType.PESSIMISTIC_WRITE)` on the overlap query in `BookingRepository` and `Isolation.SERIALIZABLE` on `BookingService.createBooking`, so one request returns 201 and the others return 409 Conflict.

## 4. Statement

All application code was written during the 48-hour window. I reviewed and understand the code that was produced with AI assistance and can explain it.
