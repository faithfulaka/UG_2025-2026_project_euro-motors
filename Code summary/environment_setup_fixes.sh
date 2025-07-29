# 1. Create proper .env file
cat > .env << 'EOF'
# Database Configuration
DATABASE_URL="mysql://root:Faithful123!@localhost:3306/euro_motors"

# JWT Secret (change in production)
JWT_SECRET="euro_motors_jwt_secret_2024_change_in_production"

# Development/Production Mode
NODE_ENV="development"

# Scraper Configuration
SCRAPER_DELAY_MS=2000
SCRAPER_TIMEOUT_MS=30000
SCRAPER_MAX_RETRIES=3
SCRAPER_USER_AGENT="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

# Rate Limiting
CARQUERY_RATE_LIMIT_MS=1000
MANUFACTURER_RATE_LIMIT_MS=5000

# Puppeteer Configuration
PUPPETEER_HEADLESS=true
EOF

# 2. Install missing dependencies
npm install --save-dev @types/node @types/react @types/react-dom

# 3. Update package.json with proper Puppeteer version
npm install puppeteer@^21.0.0

# 4. Test database connection
npx prisma generate
npx prisma db push
npx prisma db seed

# 5. Fix file permissions if needed
chmod 644 src/app/admin/supercar-pricing/page.tsx
chmod 644 src/types/spa.ts
chmod 644 src/lib/carquery.ts

# 6. Clear Next.js cache
rm -rf .next
npm run build

# 7. Test the application
npm run dev