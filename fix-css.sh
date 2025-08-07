#!/bin/bash

echo "🔧 Euro Motors CSS Fix Script"
echo "=============================="
echo ""

# Stop if any command fails
set -e

echo "📦 Step 1: Stopping any running dev servers..."
pkill -f "next dev" 2>/dev/null || true
sleep 2

echo "🗑️  Step 2: Cleaning build cache and dependencies..."
rm -rf .next
rm -rf node_modules
rm -rf .swc
rm package-lock.json

echo "📥 Step 3: Installing exact dependencies..."
npm install next@14.1.0 react@18.2.0 react-dom@18.2.0
npm install -D tailwindcss@3.4.0 postcss@8.4.32 autoprefixer@10.4.16
npm install -D @types/react @types/react-dom @types/node typescript

echo "🎨 Step 4: Regenerating Tailwind CSS..."
npx tailwindcss init -p --force

echo "✅ Step 5: Verifying installations..."
npm list tailwindcss postcss autoprefixer

echo "🔨 Step 6: Building the project..."
npm run build

echo ""
echo "✅ Fix complete! Now run: npm run dev"
echo ""
echo "If CSS still doesn't work, check:"
echo "1. http://localhost:3000/css-test"
echo "2. Browser console for errors"
echo "3. Network tab for 404s"
