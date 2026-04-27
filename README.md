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

Git automatically creates a folder named after the repository name on GitLab/GitHub not what you call your local working folder. So whoever clones it gets a folder called: UG_2025-2026_project_euro-motors
Clone orject your repo in your dev or work environment

```bash
git clone <your-repo-url> 
cd UG_2025-2026_project_euro-motors
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

> **Note:** All commands should be run using the `npm` scripts.
> Equivalent `npx` alternatives exist but use the above for consistency.

npm script
- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Sync Prisma schema to DB
- `npm run db:seed` - Seed database
- `npm run db:studio` - Open Prisma Studio


Alternative
- `npx next dev` - Start development server
- `npx next build` - Production build
- `npx next start` - Start production server
- `npx next lint` - Run ESLint
- `npx prisma generate`  - Generate Prisma client
- `npx prisma db push` - Sync Prisma schema to DB
- `npx prisma db seed` - Seed database
- `npx prisma studio`  - Open Prisma Studio

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

---

## Project Development Log

A chronological record of the development journey from initial setup to final submission.

### Phase 1 — Project Inception & Stack Decision (Feb – Mar 2025)

The project began in February 2025. An initial attempt using Django was abandoned in favour of Next.js 15 with the App Router, giving the project a unified full-stack TypeScript codebase. The core project structure, folder layout, and configuration files were established in March 2025.

Key commits:
- `django projected recommited in correct repository` — initial Django attempt
- `I am still sticking with react for my frontend...` — confirmed switch to Next.js
- `Setup Process; Creating files and folders for my revamped project` — Next.js project scaffolded

### Phase 2 — Authentication & API Routing (Mar 2025)

JWT-based authentication was built from scratch using the `jose` library. Login and register components were created alongside the first API route handlers. TypeScript strict mode was enforced throughout and early type errors resolved.

Key commits:
- `creating the authentication components`
- `working on authentication components`
- `Fixing TypeScript error "Unexpected any. Specify a different type"`
- `upadating project structure and api routing`
- `Debugging`

### Phase 3 — Core Pages: Buy, Rent, Homepage & Gallery (Mar – Apr 2025)

The customer-facing pages were built: the homepage with a featured cars gallery and slideshow, the Buy and Rent listing pages, and individual car detail pages with a multi-image slideshow. The quote finance form with an installment term slider was added to the buy flow.

Key commits:
- `Rentals and Buys`
- `working on homepage` / `final homepage fixes`
- `Gallry being added into rootlayout`
- `new slideshow component for individual car pages, creating input for cash and...`
- `making term slider to pick months for installment & updating tsconfig`
- `fixing errors in car details page`
- `buy and rental pages`

### Phase 4 — Database, Admin Panel & Image Management (Apr – May 2025)

Prisma ORM with SQLite was integrated for data persistence. The admin panel was built with a sidebar, car management (create, read, update, delete), and car image upload and gallery management. API routing was expanded across all admin namespaces.

Key commits:
- `working with databases`
- `fetching data from mysql`
- `api routing` / `working on rental page`
- `admin page work` (multiple commits across May)
- `admin page and project structure work`
- `api, image and data handling`
- `image and data handling p2`
- `slideshows` / `checking util`
- `backend work` / `backend improvements on api routing and admin page`

### Phase 5 — Supercar Pricing Aggregator Integration (Jun – Jul 2025)

The Supercar Pricing Aggregator (SPA) external API was integrated to enrich car listings with live market pricing data. The CarQuery API was also integrated using a custom JSONP adapter (axios + regex). This phase involved significant troubleshooting of TypeScript errors, Edge Runtime compatibility issues, and JSON/JSONP parsing challenges.

Key commits:
- `integrating the Supercar Pricing Agrregator`
- `Add complete SPA integration with enhanced seed data`
- `Backend and dependencies`
- `COMPLETE REAL SPA IMPLEMENTATION - STARTING NOW`
- `enchnaicng spa` / `final stages of the SPA implementation`
- `json and typescript error handling`
- `moving from scraper to pure api`
- `final troubleshooting for SPA`
- `trouble shooting typescript errors`
- `node and lib` / `spa` / `typescrit error handling`

### Phase 6 — Stabilisation & Clean Rebuild (Jul – Aug 2025)

A clean rebuild was performed to resolve accumulated build errors and dependency conflicts. The database was migrated from MySQL to SQLite for local development simplicity. Authentication was confirmed working end-to-end. CSS and API fixes were applied across the application.

Key commits:
- `Clean commit: Euro Motors app with SQLite, fixed build errors, working auth`
- `Merge branch 'clean-rebuild' into 'main'`
- `Add latest incoming files as new codebase`
- `commititing fixed, css, and api's`
- `spa` / `commit` (stabilisation commits Aug 2025)

### Phase 7 — UI Polish, Rental Flow & Feature Completion (Feb – Mar 2026)

The remaining customer-facing features were completed: the full rental booking multi-step form with calendar date selection, co-renter split payment support, cart and checkout flow, trade-in request submission, and the complete admin dashboard with reports, user management, rental management, and gallery image ordering. The colour theme was standardised to red throughout.

Key commits:
- `landing pages and the admin panel in pogress`
- `sibebar fix and alignment`
- `admin gallery page`
- `build fixes` / `build fixes continues`
- `gallery creation completed`
- `car image gallery update and delete`
- `car rental creation`
- `rental image upload`
- `main image display`
- `rental ui update and cart drop down`
- `checkout page`
- `general refactoring`
- `cart and rental setup`
- `auth debug removal`
- `cleanup blue color to red`
- `clean up`
- `fix: admin login, password hashing, seed config, and README cleanup`

### Phase 8 — Stripe Payment Integration & Submission (Apr 2026)

Stripe Checkout was integrated across all three payment flows: rental bookings (including co-renter split payments), direct car purchase deposits, and trade-in balance payments. Two API routes were created (`/api/payments/create-session` and `/api/payments/create-quote-session`) along with a webhook handler (`/api/payments/webhook`) and payment confirmation pages (`/payment/success`, `/payment/cancel`). Final cleanup removed build artifacts and lock files from version control.

Key commits:
- `Stripe Installion` — Stripe SDK, create-session, create-quote-session, webhook, success/cancel pages
- `chore: remove build artifacts, lock files and docs from tracking`
