# Euro Motors SPA - Final Error Fixes Guide

## TypeScript & ESLint Error Resolution

### 1. Fix Missing Exports in `src/types/spa.ts`

**ADD this missing interface to the END of spa.ts:**

```typescript
// ADD this missing interface:
export interface SPASearchResponse {
  success: boolean;
  data?: ComprehensiveSPAData;
  error?: SPAError;
  meta: {
    searchQuery: SPASearchParams;
    executionTime: number;
    timestamp: string;
    version: string;
  };
}
```

### 2. Fix `src/app/admin/supercar-pricing/page.tsx`

**REMOVE unused variables:**
```typescript
// DELETE this line (around line 58):
// const [showYearDropdown, setShowYearDropdown] = useState(false);

// REMOVE unused ref:
// const yearDropdownRef = useRef<HTMLDivElement>(null);
```

**FIX explicit typing on line 254:**
```typescript
// CHANGE this line:
{supercarData.popularOptions?.map((option: { name: string; source: string }, index: number) => (
```

**UPDATE loadYears function (around line 158):**
```typescript
// REMOVE make, model parameters:
const loadYears = async () => {  // REMOVE: (make: string, model: string)
  try {
    setAutoComplete(prev => ({ ...prev, yearsLoading: true }));
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
    setAutoComplete(prev => ({ ...prev, years, yearsLoading: false }));
  } catch (error) {
    console.error('Error loading years:', error);
    setAutoComplete(prev => ({ ...prev, yearsLoading: false }));
  }
};
```

**REMOVE ref from year select div:**
```typescript
// CHANGE this:
<div className="relative" ref={yearDropdownRef}>
// TO this:
<div className="relative">
```

### 3. Fix `src/app/api/spa/manufacturer/route.ts`

**FIX line 80 type issue:**
```typescript
// CHANGE from:
} catch (error: any) {
// TO:
} catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  console.error('🚨 Manufacturer Scraper API Error:', errorMessage);
```

### 4. Fix `src/app/api/spa/search/route.ts`

**FIX import error - CHANGE line 7:**
```typescript
// CHANGE from:
import { SPASearchResponse, ComprehensiveSPAData, SPASearchParams } from '@/types/spa';
// TO:
import { ComprehensiveSPAData, SPASearchParams } from '@/types/spa';
// Note: SPASearchResponse should now be available after adding it to spa.ts
```

**FIX null assignment issue around line 207:**
```typescript
// CHANGE from:
searchQuery: { make, model, year: null, dataSource: 'market' },
// TO:
searchQuery: { make, model, year: year || undefined, dataSource: 'market' },
```

**FIX the searchMarketData function to match Autotrader return structure:**
```typescript
// REPLACE the entire searchMarketData function with:
async function searchMarketData(make: string, model: string, year?: number): Promise<ComprehensiveSPAData | null> {
  try {
    const marketResult = await autotraderScraper.searchCars(make, model, year);
    
    if (!marketResult.success || !marketResult.data) return null;

    // FIX: Use .data instead of .marketData (Autotrader returns { success, data })
    const marketData = marketResult.data;

    return {
      make,
      model,
      year: year || 2022,
      
      pricingData: {
        baseMSRP: 0,
        currentMarketRange: marketData.priceRange,
        averageDealerPrice: marketData.averagePrice,
        dealerInventoryCount: marketData.inventoryCount,
        priceTrend: 'Based on current market listings'
      },
      
      marketData: {
        listings: marketData.listings,
        averagePrice: marketData.averagePrice,
        priceRange: marketData.priceRange,
        inventoryCount: marketData.inventoryCount,
        dataSource: marketData.dataSource,
        searchParams: { make, model, year },
        timestamp: marketData.timestamp
      },

      dataSources: {
        database: false,
        carQuery: false,
        manufacturer: false,
        market: true
      },
      
      dataSource: 'Autotrader UK Market Data',
      searchQuery: { make, model, year: year || undefined, dataSource: 'market' },
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Market search error:', error);
    return null;
  }
}
```

**FIX listings mapping with explicit typing (around line 377):**
```typescript
// CHANGE the listings mapping to:
listings: marketData.listings.map((listing: { title: string; price: string; specs?: string; url: string }) => ({
  title: listing.title,
  price: listing.price,
  priceNumeric: parseFloat(listing.price.replace(/[^\d]/g, '')) || 0,
  specs: listing.specs,
  url: listing.url
})),
```

**FIX DELETE function - REMOVE unused variables:**
```typescript
// CHANGE the DELETE function signature:
export async function DELETE() {  // REMOVE: (request: NextRequest)
  try {
    COMPREHENSIVE_SEARCH_CACHE.clear();
    console.log('🧹 SPA search cache cleared');
    
    return NextResponse.json({
      success: true,
      message: 'Search cache cleared successfully'
    });
    
  } catch (err) {  // RENAME 'error' to 'err' to avoid unused variable warning
    console.error('Cache clear error:', err);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
```

## Summary of Issues Fixed

1. **Missing SPASearchResponse export** - Added to spa.ts
2. **Unused variables** - Removed showYearDropdown, yearDropdownRef, and function parameters
3. **Implicit 'any' types** - Added explicit typing for error handling and map functions
4. **Autotrader return structure mismatch** - Fixed searchMarketData to use `.data` instead of `.marketData`
5. **Null assignment issues** - Changed to `undefined` for optional parameters
6. **Unused function parameters** - Removed from DELETE function

All errors from the TypeScript compilation should now be resolved.
