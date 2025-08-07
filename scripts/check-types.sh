#!/bin/bash
# scripts/check-types.sh
# Run with: bash scripts/check-types.sh

echo "🔍 Checking TypeScript types..."
echo "================================"

cd /Users/daddy/Documents/euro-motors-fresh/euro-motors

# Check if TypeScript is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js"
    exit 1
fi

# Run TypeScript compiler in check mode
echo "Running TypeScript compiler..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ All TypeScript types are valid!"
else
    echo "❌ TypeScript compilation errors found"
    echo "Please fix the errors above"
    exit 1
fi

echo ""
echo "🔍 Checking specific files..."
echo "------------------------------"

# Check if our new files exist
files=(
    "src/lib/db-helpers.ts"
    "src/app/api/spa/search/route.ts"
    "src/app/api/cars/route.ts"
    "src/app/api/rentals/route.ts"
    "scripts/enrich-cars-with-spa.ts"
    "scripts/test-type-alignment.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file not found"
    fi
done

echo ""
echo "================================"
echo "Type checking complete!"
