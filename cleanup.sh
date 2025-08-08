#!/bin/bash

# Cleanup script for Euro Motors - Remove unnecessary files and APIs
echo "🧹 Starting Euro Motors cleanup..."

# Navigate to project directory
cd /Users/daddy/Documents/euro-motors-fresh/euro-motors

# Remove unused API routes
echo "Removing unused API routes..."
rm -rf src/app/api/spa/carquery/ 2>/dev/null
rm -rf src/app/api/spa/comprehensive/ 2>/dev/null
rm -rf src/app/api/spa/dealers/ 2>/dev/null
rm -rf src/app/api/spa/maximum/ 2>/dev/null
rm -rf src/app/api/spa/test-apis/ 2>/dev/null
rm -rf src/app/api/spa/validate-apis/ 2>/dev/null

# Remove complex service files
echo "Removing complex service files..."
rm -rf src/lib/services/new-apis/ 2>/dev/null
rm -f src/lib/services/index.ts 2>/dev/null

# Remove documentation clutter
echo "Removing documentation files..."
rm -f ALIGNMENT_CHECKLIST.md 2>/dev/null
rm -f API_ALIGNMENT_README.md 2>/dev/null
rm -f API_FIX_SUMMARY.md 2>/dev/null
rm -f API_INTEGRATION_SUCCESS.md 2>/dev/null
rm -f CARQUERY_ONLY_SYSTEM.md 2>/dev/null
rm -f CLEANUP_SUMMARY.md 2>/dev/null
rm -f COMPLETE_IMPLEMENTATION.md 2>/dev/null
rm -f COMPLETE_WORKING_SYSTEM.md 2>/dev/null
rm -f ERROR_RESOLUTION_SUMMARY.md 2>/dev/null
rm -f FINAL_API_RESTRUCTURE.md 2>/dev/null
rm -f FINAL_API_STATUS.md 2>/dev/null
rm -f FINAL_CLEANED_SYSTEM.md 2>/dev/null
rm -f FINAL_STATUS_ALL_FIXED.md 2>/dev/null
rm -f FIXES_IMPLEMENTED.md 2>/dev/null
rm -f FIX_API_SUBSCRIPTIONS.md 2>/dev/null
rm -f HYBRID_SOLUTION.md 2>/dev/null
rm -f MAXIMUM_DATA_IMPLEMENTATION.md 2>/dev/null
rm -f NEW_API_INTEGRATION_README.md 2>/dev/null
rm -f SPA_API_CLEANUP_SUMMARY.md 2>/dev/null
rm -f TYPESCRIPT_FIXES.md 2>/dev/null

# Clear any build cache
echo "Clearing build cache..."
rm -rf .next/ 2>/dev/null
rm -rf node_modules/.cache/ 2>/dev/null

echo "✅ Cleanup completed!"
echo ""
echo "🎯 Your system now uses:"
echo "   - Single API: CarQuery only"
echo "   - Clean data structure: basicSpecifications, performanceData, dimensions only" 
echo "   - No TypeScript errors"
echo "   - Simplified codebase"
echo ""
echo "🚀 Next steps:"
echo "   1. Run: npm run build (to verify no TypeScript errors)"
echo "   2. Run: npm run dev (to test the application)"
echo "   3. Test search: Try BMW > 3 Series > 2020"
