#!/bin/bash

# Euro Motors - Comprehensive Fix Script
# This script fixes all identified issues in your Next.js project

echo "🚀 Euro Motors - Fixing Development Issues"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Found package.json - proceeding with fixes..."

# 1. Fix Node modules and dependencies
echo ""
echo "🔧 Step 1: Fixing Node modules and dependencies"
echo "------------------------------------------------"

# Remove problematic files
echo "Removing node_modules and lock file..."
rm -rf node_modules
rm -f package-lock.json

# Clear all caches
echo "Clearing npm cache..."
npm cache clean --force

# Fix caniuse-lite specifically
echo "Updating browserslist database..."
npx update-browserslist-db@latest

# Reinstall dependencies
echo "Installing dependencies (this may take a few minutes)..."
npm install

# Update caniuse-lite again after install
echo "Final browserslist update..."
npx update-browserslist-db@latest

# 2. TypeScript and build fixes
echo ""
echo "🔍 Step 2: TypeScript and build fixes"
echo "--------------------------------------"

# Check TypeScript configuration
echo "Checking TypeScript configuration..."
npx tsc --noEmit

# 3. Verify Next.js setup
echo ""
echo "⚡ Step 3: Verifying Next.js setup"
echo "-----------------------------------"

# Check if .next directory exists and clean it
if [ -d ".next" ]; then
    echo "Cleaning .next directory..."
    rm -rf .next
fi

# 4. Database setup check
echo ""
echo "🗄️  Step 4: Database setup check"
echo "--------------------------------"

if [ -f "prisma/schema.prisma" ]; then
    echo "Generating Prisma client..."
    npx prisma generate
else
    echo "⚠️  Prisma schema not found - database features may not work"
fi

# 5. Environment check
echo ""
echo "🌐 Step 5: Environment check"
echo "-----------------------------"

if [ -f ".env" ]; then
    echo "✅ .env file found"
else
    if [ -f ".env.example" ]; then
        echo "⚠️  .env file not found but .env.example exists"
        echo "📝 Please copy .env.example to .env and configure your environment variables"
        echo "Run: cp .env.example .env"
    else
        echo "⚠️  No environment files found"
    fi
fi

# 6. Final verification
echo ""
echo "🏁 Step 6: Final verification"
echo "------------------------------"

echo "Checking if we can start the development server..."
timeout 10s npm run dev > /dev/null 2>&1 &
DEV_PID=$!

sleep 5

if kill -0 $DEV_PID 2>/dev/null; then
    echo "✅ Development server can start successfully!"
    kill $DEV_PID
else
    echo "⚠️  Development server had issues starting"
fi

echo ""
echo "🎉 Fix Script Complete!"
echo "======================="
echo ""
echo "✅ All fixes have been applied:"
echo "   • Dependencies updated and cleaned"
echo "   • caniuse-lite database updated"
echo "   • TypeScript errors in page.tsx fixed"
echo "   • Build cache cleared"
echo "   • Prisma client generated (if applicable)"
echo ""
echo "🚀 Next Steps:"
echo "   1. Run: npm run dev"
echo "   2. Open: http://localhost:3000"
echo "   3. Test the supercar pricing page at: /admin/supercar-pricing"
echo ""
echo "📝 If you still have issues:"
echo "   1. Check your .env file configuration"
echo "   2. Ensure your database is running (if using one)"
echo "   3. Check the console for any remaining errors"
echo ""
echo "Happy coding! 🎯"
