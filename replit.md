# HospiTime — ICU Visitor Booking System

## Project Overview

HospiTime is a full-stack ICU Visitor Booking System built as a final-year Computer Science dissertation project for Sedat Kucuk (Student ID: 23002046) at the University of Hertfordshire.

**Purpose:** Structured ICU visiting — giving families a clear, fair way to request visits and hospital staff a simple management console.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite, TailwindCSS, shadcn/ui, Framer Motion, wouter
- **Backend**: Express 5, Node.js
- **Database**: PostgreSQL + Drizzle ORM
- **Authentication**: Cookie-based session (bcrypt + signed cookies)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (port 8080)
│   └── hospitime/          # React + Vite frontend (port 25433, served at /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
└── package.json
```

## Key Features

- **Dual-role authentication**: Visitor (family) and Hospital Staff
- **Session management**: Cookie-based, 7-day sessions
- **Visitor dashboard**: Stats summary, booking request form, booking history with status badges
- **Staff dashboard**: Management console with approve/reject/cancel actions, status filtering
- **Visit bookings**: Date, time (08:00–17:30, 30-min slots), duration (30/60/90 min), patient name, ward, notes
- **Status lifecycle**: pending → approved/rejected/cancelled
- **Dashboard stats**: Visitor stats, staff overview, recent activity

## Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| staff@hospitime.demo | Staff2024! | Hospital Staff |
| staff2@hospitime.demo | Staff2024! | Hospital Staff |
| visitor@hospitime.demo | Visitor2024! | Family/Visitor |
| emily@hospitime.demo | Visitor2024! | Family/Visitor |

## Staff Code (for registration)

`HOSP2024` — required when registering as Hospital Staff

## API Routes

All routes under `/api`:
- `POST /auth/register` — Register with name, email, password, role, staffCode?
- `POST /auth/login` — Login
- `POST /auth/logout` — Logout
- `GET /auth/me` — Current session user
- `GET /bookings?status=` — Get bookings (visitors see own, staff see all)
- `POST /bookings` — Create booking request
- `GET /bookings/:id` — Get single booking
- `PATCH /bookings/:id/approve` — Approve (staff only)
- `PATCH /bookings/:id/reject` — Reject with optional reason (staff only)
- `PATCH /bookings/:id/cancel` — Cancel
- `GET /dashboard/visitor-stats` — Visitor stats
- `GET /dashboard/staff-stats` — Staff overview stats
- `GET /dashboard/recent-activity` — Recent activity feed

## DB Schema

- `users` — id, name, email, passwordHash, role, createdAt
- `bookings` — id, userId, visitorName, visitorEmail, visitDate, visitTime, durationMinutes, patientName, ward, notes, status, rejectionReason, requestedAt, reviewedAt, reviewedBy

## Design

- **Colour palette**: Deep clinical teal-blue (hsl 185 65% 25%) with clean warm grays
- **Typography**: Plus Jakarta Sans (Google Fonts)
- **Theme**: Calm, professional healthcare aesthetic — NHS-inspired with premium finish
- **Motion**: Framer Motion page transitions and form animations

## Run Commands

```bash
pnpm --filter @workspace/api-server run dev     # Start API server
pnpm --filter @workspace/hospitime run dev       # Start frontend
pnpm --filter @workspace/db run push             # Push DB schema
pnpm --filter @workspace/api-spec run codegen    # Regenerate API hooks
```
