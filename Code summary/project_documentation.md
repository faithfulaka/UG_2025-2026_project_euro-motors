
# Euro Motors SPA Project Documentation

## 1. Project Overview
This is a Single‑Page Application (SPA) built with Next.js (App Router) that allows users to fetch vehicle data—makes, models, and years—from multiple sources:
- **CarQuery API** (public JSONP API for technical specs)
- **Manufacturer** (official configurators via headless browser scraping)
- **Market Data** (live listings via headless browser scraping)
- **Local Database** (MySQL via Prisma ORM)

The UI lets you choose a data source, then dynamically fetch and display lists of makes, models, and production years. Finally, it runs a combined search to surface pricing or spec data.

## 2. Tech Stack
- **Next.js** (v14+) with App Router (`src/app/…`)
- **TypeScript** for type safety
- **Prisma ORM** for database access
- **MySQL** (or compatible) as the local fallback database
- **Puppeteer** (or Playwright) for scraper implementations
- **Tailwind CSS** for styling
- **React** (client components) for dynamic UI
- **Node.js** (serverless functions) for API routes

## 3. Folder Structure
```
/
├─ prisma/
│  └─ schema.prisma         # DB schema: buyCar & rentalCar tables
├─ public/
├─ src/
│  ├─ lib/
│  │   └─ prisma.ts         # Prisma client export
│  ├─ components/
│  │   └─ SupercarPricing.tsx  # Main UI
│  ├─ app/
│  │   ├─ api/
│  │   │   └─ spa/
│  │   │      ├─ makes/route.ts
│  │   │      ├─ models/route.ts
│  │   │      ├─ years/route.ts
│  │   │      ├─ suggestions/route.ts
│  │   │      └─ search/route.ts
│  │   └─ page.tsx         # SPA entrypoint
│  ├─ styles/
│  └─ ...
├─ next.config.ts
├─ package.json
└─ README.md
```

## 4. Database Schema
In `prisma/schema.prisma`:
```prisma
model buyCar {
  id        Int      @id @default(autoincrement())
  make      String
  model     String
  year      Int
  price     Float?
  createdAt DateTime @default(now())
}
model rentalCar {
  id        Int      @id @default(autoincrement())
  make      String
  model     String
  year      Int
  dailyRate Float?
  createdAt DateTime @default(now())
}
```

## 5. API Routes
All under `src/app/api/spa/…` as **Next.js Route Handlers**:

1. **GET /api/spa/makes?source=…**  
   - `source=database`: fetch distinct makes from `buyCar` table  
   - otherwise: combine DB makes + CarQuery API makes  

2. **GET /api/spa/models?make=…&source=…**  
   - `source=database`: fetch distinct models for the make from DB  
   - otherwise: combine DB models + CarQuery API models  

3. **GET /api/spa/years?make=…&model=…&source=…**  
   - `source=database`: proxy to existing `/api/spa/suggestions?type=year` endpoint  
   - otherwise: stub last 6 calendar years  

4. **GET /api/spa/suggestions?type=year|make|model…**  
   - utility endpoint that scrapes CarQuery API responses or other sources  
   - returns arrays of suggestions  

5. **POST /api/spa/search**  
   - orchestrates one of: CarQuery API lookup, manufacturer scraper, market scraper, or DB query  
   - returns combined vehicle data (pricing, specs, inventory)

## 6. Frontend (SupercarPricing.tsx)
- **State hooks**:
  - `dataSource`: `'combined'|'carquery'|'manufacturer'|'market'|'database'`
  - `makes`, `models`, `years`: arrays for dropdowns
  - `selMake`, `selModel`, `selYear`: selected values
- **Effects**:
  1. Load makes when `dataSource` changes  
  2. Load models when `selMake` or `dataSource` changes  
  3. Load years when `selMake`, `selModel`, or `dataSource` changes  

- **Fetch calls** use dynamic query params, e.g.:  
  ```ts
  fetch(\`/api/spa/models?make=\${selMake}&source=\${dataSource}\`)
  ```

- **Search button** invokes:
  ```ts
  fetch('/api/spa/search', {
    method: 'POST',
    body: JSON.stringify({ make: selMake, model: selModel, year: selYear, source: dataSource })
  })
  ```

## 7. Scraper Implementation
- **Manufacturer & Market** sources use Puppeteer  
- **Issues**: bundling Chromium for Vercel, slow function cold starts  
- **Possible Quick Fix**: switch to Playwright + `@sparticuz/chromium`  

## 8. Known Issues & Fixes
1. **Filename mismatch**: rename `routes.ts` → `route.ts` under makes/models  
2. **Hard‑coded source**: update fetch calls to use `dataSource` state  
3. **Years endpoint**: add `src/app/api/spa/years/route.ts` to proxy DB to suggestions  
4. **Scraper bundling**: migrate to cloud‑friendly headless or external service  
5. **Prisma CLI**: use `npx prisma studio` (not `prima`)

## 9. Running Locally
```bash
npm install
npx prisma migrate dev
npx prisma db seed
npx prisma studio
npm run dev
```

---

*This document was auto‑generated based on the codebase and conversation context.*
