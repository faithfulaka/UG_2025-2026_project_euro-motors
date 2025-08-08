#!/bin/bash
# Clean TypeScript and Next.js caches

echo "🧹 Cleaning TypeScript and Next.js caches..."
echo "============================================"

# Navigate to project directory
cd /Users/daddy/Documents/euro-motors-fresh/euro-motors

# Remove TypeScript cache
echo "1. Removing TypeScript build info..."
rm -f tsconfig.tsbuildinfo
rm -f .tsbuildinfo

# Remove Next.js cache
echo "2. Removing Next.js build cache..."
rm -rf .next

# Remove node_modules/.cache if it exists
echo "3. Removing node_modules cache..."
rm -rf node_modules/.cache

# Check for any files importing non-existent modules
echo "4. Checking for imports of removed modules..."
echo ""

# Search for any references to removed APIs
echo "Searching for references to 'new-apis'..."
grep -r "new-apis" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || echo "✅ No references to 'new-apis' found"

echo ""
echo "Searching for references to 'maximum-data-aggregator'..."
grep -r "maximum-data-aggregator" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || echo "✅ No references to 'maximum-data-aggregator' found"

echo ""
echo "Searching for references to 'comprehensive-aggregator'..."
grep -r "comprehensive-aggregator" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || echo "✅ No references to 'comprehensive-aggregator' found"

# List actual API routes
echo ""
echo "5. Actual API routes in /api/spa/:"
echo "===================================="
ls -la src/app/api/spa/ 2>/dev/null || echo "Directory not found"

# Check if phantom directories exist
echo ""
echo "6. Checking for phantom directories:"
echo "====================================="
if [ -d "src/app/api/spa/carquery" ]; then
  echo "❌ Found phantom directory: src/app/api/spa/carquery"
  echo "   Contents:"
  ls -la src/app/api/spa/carquery/
else
  echo "✅ No carquery directory found"
fi

if [ -d "src/app/api/spa/maximum" ]; then
  echo "❌ Found phantom directory: src/app/api/spa/maximum"
  echo "   Contents:"
  ls -la src/app/api/spa/maximum/
else
  echo "✅ No maximum directory found"
fi

# Check TypeScript version
echo ""
echo "7. TypeScript Configuration:"
echo "============================"
echo "TypeScript version:"
npx tsc --version 2>/dev/null || echo "TypeScript not found"

echo ""
echo "✅ Cache cleaning complete!"
echo ""
echo "Next steps:"
echo "1. Restart your IDE/VSCode"
echo "2. Run: npm run dev"
echo "3. If errors persist, run: npm run build"
