# Zana — School Management System

A minimal, full-stack School Management System built as a pnpm + TypeScript monorepo.

## What’s implemented

- Students: create/list/delete
- Classes: create/list/delete
- Enrollments: assign a student to a class
- Attendance: mark daily attendance per enrollment (upsert by date)
- Teachers: create/list/delete
- Subjects: create/list/delete
- Gradebook: assign subjects to classes, create assessments, enter grades
- Auth: JWT login + role-based API access (Admin/Staff/Teacher)

## Tech

- API: Fastify + Prisma (SQLite)
- Web: Vite + React + React Router + TanStack Query
- Shared validation/types: Zod (`packages/shared`)

## Prerequisites

- Node `>=20.11` (this repo works great on Node 22)
- pnpm `9.x`

## Getting started

1) Install deps:

```bash
pnpm install
```

2) Create the API database and Prisma client:

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed
```

Default seeded admin (override via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `apps/api/.env`):

- Email: `admin@zana.local`
- Password: `ChangeMe123!`

3) Run the API and web apps (two terminals):

Terminal A:
```bash
pnpm dev:api
```

Terminal B:
```bash
pnpm dev:web
```

- API: `http://localhost:4000/health`
- Web: `http://localhost:5173/`

## Environment variables

- API example: `apps/api/.env.example`
- Web example: `apps/web/.env.example`

By default, the web app uses `http://localhost:4000`.

## Workspace layout

- `apps/api` — Fastify API + Prisma schema/migrations
- `apps/web` — React UI
- `packages/shared` — shared Zod schemas + types

## Quality checks

```bash
pnpm typecheck
pnpm lint
pnpm build
```
