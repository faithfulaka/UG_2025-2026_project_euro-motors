// src/lib/scrapers/market-scrapers.ts - FULLY FIXED VERSION
// DYNAMIC IMPORT: Do not statically import puppeteer to avoid client bundle issues
import type { Browser, Page } from 'puppeteer';

// FIXED: Remove unused MarketListing interface - define only what's needed locally
interface MarketData {
  source: string;
  listings: Array<{
    title: string;
    price: number;
    mileage?: number;
    location: string;
    dealerName: string;
    listingUrl: string;
    images: string[];
    year: number;
  }>;
  averagePrice: number;
  priceRange: string;
  inventoryCount: number;
  priceDistribution: {
    min: number;
    max: number;
    median: number;
    q1?: number;
    q3?: number;
  };
  dataSource: string;
  searchParams: {
    make: string;
    model: string;
    year?: number;
  };
  timestamp: string;
}

interface SPAServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    retryAfter?: number;
  };
  processingTime: number;
  cached: boolean;
}

interface MarketScraper {
  name: string;
  baseUrl: string;
  selectors: {
    listings: string;
    title: string;
    price: string;
    mileage?: string;
    location?: string;
    dealer?: string;
    image?: string;
    url?: string;
    daysOnMarket?: string;
  };
  searchUrlBuilder: (make: string, model: string, year?: number) => string;
  priceExtractor: (text: string) => number;
  cookieSelector?: string;
}

class MarketScraperService {
  private browser: Browser | null = null;
  private cache = new Map<string, { data: MarketData; expiresAt: number }>();
  private cacheTimeout = 45 * 60 * 1000; // 45 minutes cache for market data

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 🏪 MARKET DATA SOURCES CONFIGURATION
  private marketScrapers: Record<string, MarketScraper> = {
    autotrader: {
      name: 'Autotrader UK',
      baseUrl: 'https://www.autotrader.co.uk',
      selectors: {
        listings: '[data-testid="trader-seller-listing"], .search-listing',
        title: 'h3, .listing-title, [data-testid="search-listing-title"]',
        price: '[data-testid="search-listing-price"], .vehicle-price, .price-text',
        mileage: '.vehicle-mileage, .mileage, [data-testid="mileage"]',
        location: '.seller-location, .dealer-location',
        dealer: '.dealer-name, .seller-name',
        image: '.listing-image img, .vehicle-image img',
        url: 'a[href*="/car-details/"]'
      },
      searchUrlBuilder: (make, model, year) => {
        let url = `https://www.autotrader.co.uk/car-search?make=${encodeURIComponent(make)}`;
        if (model) url += `&model=${encodeURIComponent(model)}`;
        if (year) url += `&year-from=${year}&year-to=${year}`;
        url += '&sort=relevance&radius=1500&postcode=sw1a1aa';
        return url;
      },
      priceExtractor: (text: string) => {
        const match = text.match(/£([\d,]+)/);
        return match ? parseInt(match[1].replace(/,/g, '')) : 0;
      },
      cookieSelector: '#onetrust-accept-btn-handler, .accept-cookies'
    },

    carscom: {
      name: 'Cars.com',
      baseUrl: 'https://www.cars.com',
      selectors: {
        listings: '.vehicle-card, .vehicle-listing',
        title: '.vehicle-details-link, .listing-title',
        price: '.primary-price, .vehicle-price',
        mileage: '.vehicle-mileage, .mileage-display',
        location: '.dealer-name, .vehicle-location',
        dealer: '.dealer-name',
        image: '.vehicle-image img',
        url: '.vehicle-details-link'
      },
      searchUrlBuilder: (make, model, year) => {
        let url = `https://www.cars.com/shopping/results/?make_model_id=${encodeURIComponent(make)}`;
        if (model) url += `_${encodeURIComponent(model)}`;
        if (year) url += `&year_min=${year}&year_max=${year}`;
        url += '&dealer_id=&keyword=&list_price_max=&list_price_min=&maximum_distance=all&mileage_max=&sort=best_match_desc&zip=10001';
        return url;
      },
      priceExtractor: (text: string) => {
        const match = text.match(/\$?([\d,]+)/);
        if (match) {
          const usdPrice = parseInt(match[1].replace(/,/g, ''));
          return Math.round(usdPrice * 0.79);
        }
        return 0;
      },
      cookieSelector: '.privacy-consent-accept, #consent-accept'
    },

    classiccom: {
      name: 'Classic.com',
      baseUrl: 'https://classic.com',
      selectors: {
        listings: '.sale-item, .auction-listing',
        title: '.vehicle-title, .sale-title',
        price: '.sale-price, .final-price',
        location: '.sale-location',
        dealer: '.auction-house, .seller-name',
        image: '.vehicle-image img',
        url: '.sale-link'
      },
      searchUrlBuilder: (make, model, year) => {
        let url = `https://classic.com/search?q=${encodeURIComponent(make)}`;
        if (model) url += `+${encodeURIComponent(model)}`;
        if (year) url += `+${year}`;
        return url;
      },
      priceExtractor: (text: string) => {
        const match = text.match(/[\$£]([\d,]+)/);
        if (match) {
          const price = parseInt(match[1].replace(/,/g, ''));
          return text.includes('$') ? Math.round(price * 0.79) : price;
        }
        return 0;
      }
    },

    bringatrailer: {
      name: 'Bring a Trailer',
      baseUrl: 'https://bringatrailer.com',
      selectors: {
        listings: '.auction-item, .listing-item',
        title: '.listing-title, .auction-title',
        price: '.final-price, .current-bid',
        location: '.listing-location',
        dealer: '.seller-info',
        image: '.listing-image img',
        url: '.listing-link'
      },
      searchUrlBuilder: (make, model, year) => {
        let searchTerm = make;
        if (model) searchTerm += ` ${model}`;
        if (year) searchTerm += ` ${year}`;
        return `https://bringatrailer.com/search/?q=${encodeURIComponent(searchTerm)}`;
      },
      priceExtractor: (text: string) => {
        const match = text.match(/\$?([\d,]+)/);
        if (match) {
          const usdPrice = parseInt(match[1].replace(/,/g, ''));
          return Math.round(usdPrice * 0.79);
        }
        return 0;
      }
    }
  };

  private async initBrowser(): Promise<Browser> {
    if (this.browser && this.browser.isConnected()) {
      return this.browser;
    }

    const puppeteerModule = await import('puppeteer');
    this.browser = await puppeteerModule.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--window-size=1366,768',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      ]
    });

    return this.browser;
  }

  private async scrapeMarketSource(
    sourceKey: string, 
    make: string, 
    model: string, 
    year?: number
  ): Promise<MarketData | null> {
    const scraper = this.marketScrapers[sourceKey];
    if (!scraper) return null;

    let page: Page | null = null;

    try {
      const browser = await this.initBrowser();
      page = await browser.newPage();
      
      await page.setViewport({ width: 1366, height: 768 });
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-GB,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      });

      const searchUrl = scraper.searchUrlBuilder(make, model, year);
      console.log(`🔍 Searching ${scraper.name}: ${searchUrl}`);

      await page.goto(searchUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });

      if (scraper.cookieSelector) {
        try {
          await page.waitForSelector(scraper.cookieSelector, { timeout: 3000 });
          await page.click(scraper.cookieSelector);
          await this.delay(1000);
        } catch {
          console.log(`⚠️ No cookie banner found for ${scraper.name}`);
        }
      }

      try {
        await page.waitForSelector(scraper.selectors.listings, { timeout: 10000 });
      } catch {
        console.log(`⚠️ No listings found for ${scraper.name}`);
        return null;
      }

      // FIXED: Properly typed page.evaluate
      const listings = await page.evaluate((
        selectors: {
          listings: string;
          title: string;
          price: string;
          mileage?: string;
          location?: string;
          dealer?: string;
          image?: string;
          url?: string;
        }, 
        priceExtractorStr: string
      ) => {
        const priceExtractor = new Function('text', `return (${priceExtractorStr})(text)`);
        const listingElements = document.querySelectorAll(selectors.listings);
        const results: Array<{
          title: string;
          price: number;
          mileage?: number;
          location: string;
          dealerName: string;
          listingUrl: string;
          images: string[];
        }> = [];

        for (let i = 0; i < Math.min(listingElements.length, 20); i++) {
          const element = listingElements[i];
          
          const titleElement = element.querySelector(selectors.title);
          const priceElement = element.querySelector(selectors.price);
          const mileageElement = selectors.mileage ? element.querySelector(selectors.mileage) : null;
          const locationElement = selectors.location ? element.querySelector(selectors.location) : null;
          const dealerElement = selectors.dealer ? element.querySelector(selectors.dealer) : null;
          const imageElement = selectors.image ? element.querySelector(selectors.image) : null;
          const urlElement = selectors.url ? element.querySelector(selectors.url) : null;

          const title = titleElement?.textContent?.trim() || '';
          const priceText = priceElement?.textContent?.trim() || '';
          const price = priceExtractor(priceText);

          if (title && price > 0) {
            const mileageText = mileageElement?.textContent?.trim() || '';
            const mileageMatch = mileageText.match(/(\d+(?:,\d+)*)/);
            
            // FIXED: Proper null handling for URL
            let listingUrl = '';
            if (urlElement) {
              const href = (urlElement as HTMLAnchorElement).href;
              const attrHref = urlElement.getAttribute('href');
              listingUrl = href || attrHref || '';
            }
            
            // FIXED: Proper null handling for images
            const imageUrls: string[] = [];
            if (imageElement) {
              const src = (imageElement as HTMLImageElement).src;
              const attrSrc = imageElement.getAttribute('src');
              const finalSrc = src || attrSrc;
              if (finalSrc) {
                imageUrls.push(finalSrc);
              }
            }
            
            results.push({
              title,
              price,
              mileage: mileageMatch ? parseInt(mileageMatch[1].replace(/,/g, '')) : undefined,
              location: locationElement?.textContent?.trim() || '',
              dealerName: dealerElement?.textContent?.trim() || '',
              listingUrl,
              images: imageUrls
            });
          }
        }

        return results;
      }, scraper.selectors, scraper.priceExtractor.toString());

      const validListings = listings.filter(l => l.price > 0);
      const prices = validListings.map(l => l.price);

      const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
      
      // FIXED: Calculate median properly
      const sortedPrices = [...prices].sort((a, b) => a - b);
      const median = sortedPrices.length > 0 ? sortedPrices[Math.floor(sortedPrices.length / 2)] : 0;
      const q1 = sortedPrices.length > 0 ? sortedPrices[Math.floor(sortedPrices.length * 0.25)] : 0;
      const q3 = sortedPrices.length > 0 ? sortedPrices[Math.floor(sortedPrices.length * 0.75)] : 0;

      console.log(`✅ ${scraper.name}: Found ${validListings.length} listings, avg price: £${avgPrice.toLocaleString()}`);

      return {
        source: sourceKey,
        listings: validListings.map(listing => ({
          ...listing,
          year: year || new Date().getFullYear()
        })),
        averagePrice: avgPrice,
        priceRange: `£${minPrice.toLocaleString()} - £${maxPrice.toLocaleString()}`,
        inventoryCount: validListings.length,
        priceDistribution: {
          min: minPrice,
          max: maxPrice,
          median,
          q1,
          q3
        },
        dataSource: scraper.name,
        searchParams: { make, model, year },
        timestamp: new Date().toISOString()
      };

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`🚨 Error scraping ${scraper.name}:`, errorMessage);
      return null;
    } finally {
      if (page) {
        try {
          await page.close();
        } catch {
          console.log(`⚠️ Error closing page for ${scraper.name}`);
        }
      }
    }
  }

  async scrapeAllMarketData(
    make: string, 
    model: string, 
    year?: number
  ): Promise<SPAServiceResponse<MarketData[]>> {
    const startTime = Date.now();
    const cacheKey = `market-${make}-${model}-${year || 'all'}`;

    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return {
        success: true,
        data: [cached.data],
        processingTime: Date.now() - startTime,
        cached: true
      };
    }

    console.log(`🔍 Starting market data scraping for ${make} ${model} ${year || 'all years'}`);

    const results: (MarketData | null)[] = [];
    const sourceKeys = Object.keys(this.marketScrapers);

    for (const sourceKey of sourceKeys) {
      try {
        const result = await this.scrapeMarketSource(sourceKey, make, model, year);
        results.push(result);
        
        if (sourceKey !== sourceKeys[sourceKeys.length - 1]) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (marketError) {
        console.error(`❌ Failed to scrape ${sourceKey}:`, marketError);
        results.push(null);
      }
    }

    const validResults = results.filter((result): result is MarketData => result !== null);

    if (validResults.length === 0) {
      return {
        success: false,
        error: {
          code: 'NO_DATA_FOUND',
          message: `No market data found for ${make} ${model}`,
          retryAfter: 300
        },
        processingTime: Date.now() - startTime,
        cached: false
      };
    }

    // FIXED: Proper aggregation with all required properties
    const minPrices = validResults
      .map(r => r.priceDistribution.min)
      .filter(p => p > 0);
    const maxPrices = validResults
      .map(r => r.priceDistribution.max);
    const allMedians = validResults
      .map(r => r.priceDistribution.median)
      .filter(m => m > 0);

    const aggregatedData: MarketData = {
      source: 'autotrader',
      listings: validResults.flatMap(r => r.listings),
      averagePrice: Math.round(
        validResults.reduce((sum, r) => sum + r.averagePrice, 0) / validResults.length
      ),
      priceRange: `£${Math.min(...minPrices).toLocaleString()} - £${Math.max(...maxPrices).toLocaleString()}`,
      inventoryCount: validResults.reduce((sum, r) => sum + r.inventoryCount, 0),
      priceDistribution: {
        min: Math.min(...minPrices),
        max: Math.max(...maxPrices),
        median: allMedians.length > 0 ? Math.round(allMedians.reduce((a, b) => a + b, 0) / allMedians.length) : 0,
        q1: validResults.reduce((sum, r) => sum + (r.priceDistribution.q1 || 0), 0) / validResults.length,
        q3: validResults.reduce((sum, r) => sum + (r.priceDistribution.q3 || 0), 0) / validResults.length
      },
      dataSource: 'Multi-source aggregation',
      searchParams: { make, model, year },
      timestamp: new Date().toISOString()
    };

    this.cache.set(cacheKey, {
      data: aggregatedData,
      expiresAt: Date.now() + this.cacheTimeout
    });

    console.log(`✅ Market data scraping complete: ${validResults.length} sources, ${aggregatedData.listings.length} listings`);

    return {
      success: true,
      data: validResults,
      processingTime: Date.now() - startTime,
      cached: false
    };
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
        this.browser = null;
        console.log('✅ Market scraper browser closed');
      } catch (cleanupError) {
        console.error('❌ Error closing market scraper browser:', cleanupError);
      }
    }
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      sources: Object.keys(this.marketScrapers),
      cacheKeys: Array.from(this.cache.keys())
    };
  }

  clearCache(): void {
    this.cache.clear();
    console.log('✅ Market data cache cleared');
  }
}

export const marketScraperService = new MarketScraperService();

process.on('exit', () => {
  marketScraperService.cleanup();
});

process.on('SIGINT', async () => {
  await marketScraperService.cleanup();
  process.exit(0);
});