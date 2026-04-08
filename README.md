# HospiTime — ICU Visitor Coordination System

HospiTime is a role-based web application for coordinating family and visitor access to Intensive Care Unit (ICU) patients. It replaces informal, error-prone phone-based visit management with a structured digital workflow: visitors submit requests, staff review and approve or decline them, and both sides have a clear, auditable record of every decision.

Built as a BSc Computer Science final year dissertation project at the University of Hertfordshire.

---

## Key Features

**Visitor-facing**
- Register and log in as a family member or carer
- Browse ward availability in the advisory slot planner (08:00–18:00)
- Submit visit requests with patient details, relationship, visitor count, and duration
- Receive arrival instructions from ward staff on approval
- View and manage booking history; cancel pending or approved visits

**Staff-facing**
- Review all pending visit requests across wards
- Approve requests and attach personalised arrival instructions (quick chips + free text)
- Reject requests with an optional written reason
- Create and remove operational restrictions (procedures, rest periods, infection control, etc.) on the ward schedule
- View a visual per-ward timeline and a recent activity feed

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS 4, shadcn/ui |
| Routing | Wouter |
| Server state | TanStack React Query v5 |
| Backend | Express 5, Node 22, TypeScript |
| Database | PostgreSQL, Drizzle ORM |
| Auth | Custom signed httpOnly cookie session, bcryptjs (cost 12) |
| API contract | OpenAPI 3.1, Orval (generated React Query hooks + Zod schemas) |
| Monorepo | pnpm workspaces |

---

## Repository Structure

```
Care-Flow-Manager/
├── artifacts/
│   ├── hospitime/          # React frontend SPA
│   │   ├── src/
│   │   │   ├── pages/      # auth, visitor-dashboard, staff-dashboard
│   │   │   ├── components/ # ward-schedule, visitor-planner, layout-wrapper, ui/
│   │   │   ├── hooks/      # use-auth, use-toast
│   │   │   └── lib/        # booking-utils (domain logic, notes encoding)
│   │   ├── public/         # favicon.svg, auth-bg.png
│   │   └── index.html
│   └── api-server/         # Express REST API
│       └── src/
│           ├── routes/     # auth, bookings, blocked-slots, dashboard, health
│           ├── middlewares/ # requireAuth, requireStaff
│           └── lib/        # session.ts, logger.ts
├── lib/
│   ├── db/                 # Drizzle schema (users, bookings, blocked_slots)
│   ├── api-spec/           # OpenAPI 3.1 YAML + Orval config
│   ├── api-client-react/   # Generated TanStack Query hooks (do not edit)
│   └── api-zod/            # Generated Zod schemas (do not edit)
├── scripts/                # Workspace utilities
├── seed.sql                # Demo data (7 users, 7 bookings)
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

**Most important files:**
- `artifacts/api-server/src/lib/session.ts` — custom cookie session
- `artifacts/api-server/src/middlewares/auth.ts` — RBAC middleware
- `artifacts/api-server/src/routes/bookings.ts` — visit request lifecycle
- `artifacts/api-server/src/routes/blocked-slots.ts` — ward restrictions
- `artifacts/hospitime/src/lib/booking-utils.ts` — domain utilities
- `artifacts/hospitime/src/components/visitor-planner.tsx` — slot planner
- `artifacts/hospitime/src/components/ward-schedule.tsx` — staff timeline
- `lib/db/src/schema/` — database schema (source of truth)
- `lib/api-spec/openapi.yaml` — API contract
- `seed.sql` — demo accounts and sample bookings

---

## Prerequisites

- **Node.js** 22+
- **pnpm** 9+ (`npm install -g pnpm`)
- **PostgreSQL** 14+ running locally

---

## Installation

From the repository root:

```bash
pnpm install
```

---

## Environment Variables

### Backend — `artifacts/api-server/.env`

Copy the example file and edit:

```bash
cp artifacts/api-server/.env.example artifacts/api-server/.env
```

```env
PORT=8080
NODE_ENV=development
DATABASE_URL=postgresql://localhost/hospitime
SESSION_SECRET=change-this-to-a-long-random-string
```

The `SESSION_SECRET` can be any long random string. In development the app falls back to `"hospitime-secret"` if this is absent, but setting it explicitly is recommended.

If your local PostgreSQL uses a different user/host/password, update `DATABASE_URL` in `.env` accordingly. The backend and the database push command must use the same exact `DATABASE_URL`.

### Frontend — `artifacts/hospitime/.env`

The defaults are correct for local development; no changes needed:

```env
PORT=5173
BASE_PATH=/
```

---

## Database Setup

### 1. Create the database

```bash
createdb hospitime
```

### 2. Sync the schema

Run from the repository root (requires the `DATABASE_URL` env var):

```bash
DATABASE_URL=postgresql://localhost/hospitime pnpm --filter @workspace/db push
```

This uses Drizzle Kit to create or update the three tables (`users`, `bookings`, `blocked_slots`).

### 3. Seed demo data (optional but recommended)

```bash
psql hospitime -f seed.sql
```

---

## Running the System

Open two terminals.

### Terminal 1 — Backend

```bash
cp artifacts/api-server/.env.example artifacts/api-server/.env
cd artifacts/api-server
pnpm dev
```

The API server starts on **http://localhost:8080**.

### Terminal 2 — Frontend

```bash
cp artifacts/hospitime/.env.example artifacts/hospitime/.env
cd artifacts/hospitime
pnpm dev
```

The frontend starts on **http://localhost:5173**.

The Vite development server proxies all `/api/*` requests to `http://localhost:8080`, so cookies work correctly without any CORS configuration.

If either port is already in use:

```bash
lsof -ti tcp:8080 | xargs kill -9 2>/dev/null || true
lsof -ti tcp:5173 | xargs kill -9 2>/dev/null || true
```

---

## Demo Accounts

These accounts are created by `seed.sql`:

| Role | Email | Password |
|---|---|---|
| Staff | `staff@hospitime.demo` | `staff123` |
| Visitor | `visitor@hospitime.demo` | `visitor123` |
| Staff | `staff2@hospitime.demo` | *(bcrypt hash — register a new staff account if needed)* |
| Visitor | `emily@hospitime.demo` | *(bcrypt hash — register a new visitor account if needed)* |

To register a new **staff** account, use the registration form with role "Hospital Staff" and the authorisation code: `HOSP2024`.

---

## Using the System

### As a Visitor

1. Log in as `visitor@hospitime.demo` (or register a new visitor account)
2. Use **Plan a Visit** to browse ward availability — select a date, choose a ward, and click an available (green) slot
3. Click **Request this slot** to open the request form pre-filled with that date and time
4. Complete the form (patient name, relationship, visitor count, duration) and acknowledge the ICU guidelines
5. Submit — the request appears in **Booking History** with a Pending status
6. Once a staff member approves the request, return to the dashboard to see the green **Arrival Instructions** panel on the booking card

### As Staff

1. Log in as `staff@hospitime.demo`
2. The **Visitor Requests** tab shows all pending bookings — review and click **Approve** or **Decline**
3. On approval, select arrival instruction chips and/or add a custom note before confirming
4. Use the **Ward Schedule** tab to navigate days, see approved visits alongside restrictions, and add or remove operational blocks (procedures, infection control, rest periods, etc.)
5. The **Recent Activity** tab shows the last 20 booking events across all visitors

---

## Known Limitations

- **Advisory planner only** — the slot planner shows current restrictions as guidance; it does not make hard reservations. Staff approval is always required.
- **No real-time notifications** — visitors must refresh the dashboard to see status changes.
- **No email or SMS** — notification delivery is out of scope for this prototype.
- **No EHR integration** — patient names are free text; there is no link to hospital patient records.
- **No automated test suite** — the system has been tested manually; automated tests are future work.
- **Session is stateless** — sessions cannot be invalidated server-side without a token blocklist (not implemented).
- **Hardcoded staff code** — `HOSP2024` is a fixed registration gate; a real system would require admin-managed codes.

---

## TypeScript Validation

To confirm the project compiles cleanly:

```bash
# Check all libraries
pnpm typecheck:libs

# Check frontend
cd artifacts/hospitime && pnpm typecheck

# Check backend
cd artifacts/api-server && pnpm typecheck
```

---

*HospiTime — University of Hertfordshire · BSc Computer Science · Dissertation Project · Sedat Kucuk · 23002046*
