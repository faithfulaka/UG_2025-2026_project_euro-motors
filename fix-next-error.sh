#!/bin/bash

# Fix Next.js routes-manifest.json error
echo "🔧 Fixing Next.js build cache error..."

# Kill any running Next.js processes
echo "1. Stopping any running Next.js processes..."
pkill -f "next dev" 2>/dev/null || true

# Remove corrupted build directory
echo "2. Removing corrupted .next directory..."
rm -rf .next

# Clear npm cache
echo "3. Clearing npm cache..."
npm cache clean --force

# Clear any other caches
echo "4. Clearing other caches..."
rm -rf node_modules/.cache 2>/dev/null || true

echo "✅ Cache cleared! Now run:"
echo "   npm run dev"
echo ""
echo "If you still get errors, run:"
echo "   rm -rf node_modules && npm install"
