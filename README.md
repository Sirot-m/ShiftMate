# ShiftMate

A working hour calculator built with Next.js 16 (App Router), TypeScript, Tailwind CSS, Shadcn UI, Supabase, and Vitest.

Log a week of shifts (start, end, and break per day) and see daily totals, decimal hours, the weekly total, and an estimated gross based on your hourly rate.

## Getting started

```bash
npm install
cp .env.example .env.local   # then add Supabase keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command            | Description            |
| ------------------ | ---------------------- |
| `npm run dev`      | Dev server (Turbopack) |
| `npm run build`    | Production build       |
| `npm run lint`     | ESLint                 |
| `npm run test`     | Vitest (watch)         |
| `npm run test:run` | Vitest (CI)            |

## Folder structure

- `app/` — routes and layouts
- `components/ui/` — Shadcn atomic components
- `components/shared/` — reusable business components
- `lib/` — utilities, time and pay calculations, Supabase clients
- `hooks/` — custom React hooks
- `types/` — shared TypeScript types

## Supabase schema

When you create a Supabase project, run the migration in
`supabase/migrations/20260731120000_create_shift_entries.sql` (SQL Editor or CLI).
This creates `shift_entries` with RLS so each user only sees their own rows.

Guest users store the current week in `localStorage` until Google sign-in is added.

## Add Shadcn components

```bash
npx shadcn@latest add button
```
