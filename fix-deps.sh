#!/bin/bash

# Fix caniuse-lite issue and clean dependencies
echo "🔧 Fixing dependency issues..."

# Remove node_modules and package-lock
echo "Removing node_modules and package-lock.json..."
rm -rf node_modules
rm -f package-lock.json

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force

# Update caniuse-lite specifically
echo "Updating caniuse-lite..."
npx update-browserslist-db@latest

# Reinstall dependencies
echo "Reinstalling dependencies..."
npm install

# Update caniuse-lite again after install
echo "Final caniuse-lite update..."
npx update-browserslist-db@latest

echo "✅ Dependencies fixed!"
echo "You can now run: npm run dev"
