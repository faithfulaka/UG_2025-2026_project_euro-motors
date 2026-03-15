# Euro Motors

A full-stack Next.js 15 app for luxury car buy, rental, trade-in, and admin management workflows.

## Tech Stack

- Next.js 15 (App Router)
- React 18
- Prisma ORM
- SQLite (default local database)
- TypeScript
- JWT-based auth

## Prerequisites

- Node.js 18+ (Node.js 20 LTS recommended)
- npm 8+

## Quick Start (Clone to Running)

1. Clone and enter the project:

```bash
git clone <your-repo-url>
cd euro-motors-fresh
```

2. Install dependencies:

```bash
npm install
```

3. Create your environment file:

```bash
cp .env.example .env
```

If you are on Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

4. Initialize Prisma client and database schema:

```bash
npm run db:generate
npm run db:push
```

5. Seed sample data:

```bash
npm run db:seed
```

6. Start the app:

```bash
npm run dev
```

7. Open:

- App: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`

## Default Local Environment

The default `.env.example` is enough for local development:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:3000
JWT_SECRET=dev-secret-key-change-this-in-production-min-32-chars
DATABASE_URL="file:./dev.db"
NODE_ENV=development
```

Notes:
- `DATABASE_URL="file:./dev.db"` resolves to `prisma/dev.db`.
- Change `JWT_SECRET` for any shared/staging/production environment.

## Seed Credentials

By default, `npm run db:seed` creates:

- Admin: `admin@euromotors.com` / `Admin123!`
- User: `user@example.com` / `User123!`

You can override these without editing code:

```bash
SEED_ADMIN_EMAIL=admin@yourdomain.com SEED_ADMIN_PASSWORD=StrongPassword123! npm run db:seed
```

PowerShell example:

```powershell
$env:SEED_ADMIN_EMAIL="admin@yourdomain.com"
$env:SEED_ADMIN_PASSWORD="StrongPassword123!"
npm run db:seed
```

## Build and Production Run

`next build` is configured to skip lint blocking because the repository currently has legacy lint debt. Use `npm run lint` separately to track and reduce lint issues over time.

Create a production build:

```bash
npm run build
```

Run production server:

```bash
npm run start
```

## Useful Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Sync Prisma schema to DB
- `npm run db:seed` - Seed database
- `npm run db:studio` - Open Prisma Studio

## Common Troubleshooting

1. Prisma client error after fresh clone:
- Run `npm run db:generate`.

2. Database tables missing:
- Run `npm run db:push` then `npm run db:seed`.

3. Login/session issues locally:
- Ensure `JWT_SECRET` is set in `.env`.
- Restart dev server after changing environment variables.

4. Build works but stale browser data causes odd behavior:
- Stop server, clear `.next` if needed, then rerun `npm run dev`.

## Project Layout (High Level)

- `src/app` - App Router pages and API routes
- `src/components` - UI and feature components
- `src/lib` - Core helpers (auth, db, utilities)
- `prisma/schema.prisma` - Database schema
- `prisma/seed.js` - Seed data

## Security Notes

- Do not use default seed passwords outside local development.
- Rotate `JWT_SECRET` for non-local deployments.
- Keep `.env` out of version control.
