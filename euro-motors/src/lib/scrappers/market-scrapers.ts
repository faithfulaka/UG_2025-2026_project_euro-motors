// src/lib/scrapers/market-scrapers.ts
import puppeteer, { Browser, Page } from 'puppeteer';
import { MarketData, SPAServiceResponse } from '@/types/spa';

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

class EnhancedMarketScraperService {
  private browser: Browser | null = null;
  private cache = new Map<string, { data: MarketData; expiresAt: number }>();
  private cacheTimeout = 45 * 60 * 1000; // 45 minutes cache for market data

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
        url += '&sort=relevance&radius=1500&postcode=sw1a1aa'; // London postcode for nationwide search
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
          return Math.round(usdPrice * 0.79); // Convert USD to GBP (rough)
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
          return text.includes('$') ? Math.round(price * 0.79) : price; // Convert if USD
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
          return Math.round(usdPrice * 0.79); // Convert USD to GBP
        }
        return 0;
      }
    }
  };

  // 🚀 INITIALIZE BROWSER
  private async initBrowser(): Promise<Browser> {
    if (this.browser && this.browser.isConnected()) {
      return this.browser;
    }

    this.browser = await puppeteer.launch({
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

  // 🔍 SCRAPE INDIVIDUAL MARKET SOURCE
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

      // Handle cookie consent
      if (scraper.cookieSelector) {
        try {
          await page.waitForSelector(scraper.cookieSelector, { timeout: 3000 });
          await page.click(scraper.cookieSelector);
          await page.waitForTimeout(1000);
        } catch (e) {
          console.log(`⚠️ No cookie banner found for ${scraper.name}`);
        }
      }

      // Wait for listings to load
      try {
        await page.waitForSelector(scraper.selectors.listings, { timeout: 10000 });
      } catch (e) {
        console.log(`⚠️ No listings found for ${scraper.name}`);
        return null;
      }

      // Extract listing data
      const listings = await page.evaluate((selectors, priceExtractorStr) => {
        const priceExtractor = new Function('text', priceExtractorStr);
        const listingElements = document.querySelectorAll(selectors.listings);
        const results = [];

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
            
            results.push({
              title,
              price,
              mileage: mileageMatch ? parseInt(mileageMatch[1].replace(/,/g, '')) : undefined,
              location: locationElement?.textContent?.trim() || '',
              dealerName: dealerElement?.textContent?.trim() || '',
              listingUrl: urlElement?.href || urlElement?.getAttribute('href') || '',
              images: imageElement ? [imageElement.src || imageElement.getAttribute('src')] : []
            });
          }
        }

        return results;
      }, scraper.selectors, scraper.priceExtractor.toString().replace(/^[^{]*{|}[^}]*$/g, ''));

      // Calculate market analysis
      const validListings = listings.filter(l => l.price > 0);
      const prices = validListings.map(l => l.price);
      const mileages = validListings.map(l => l.mileage).filter(m => m !== undefined) as number[];

      const marketAnalysis = {
        averagePrice: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0,
        priceRange: {
          min: prices.length > 0 ? Math.min(...prices) : 0,
          max: prices.length > 0 ? Math.max(...prices) : 0
        },
        inventoryCount: validListings.length,
        averageMileage: mileages.length > 0 ? Math.round(mileages.reduce((a, b) => a + b, 0) / mileages.length) : undefined,
        pricePerMile: mileages.length > 0 && prices.length > 0 ? 
          Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) / (mileages.reduce((a, b) => a + b, 0) / mileages.length) * 1000) / 1000 : undefined
      };

      console.log(`✅ ${scraper.name}: Found ${validListings.length} listings, avg price: £${marketAnalysis.averagePrice.toLocaleString()}`);

      return {
        source: sourceKey as any,
        listings: validListings.map(listing => ({
          ...listing,
          year: year || new Date().getFullYear()
        })),
        marketAnalysis
      };

    } catch (error: any) {
      console.error(`🚨 Error scraping ${scraper.name}:`, error.message);
      return null;
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (e) {
          console.log(`⚠️ Error closing page for ${scraper.name}`);
        }
      }
    }
  }

  // 🌐 SCRAPE ALL MARKET SOURCES
  async scrapeAllMarketData(
    make: string, 
    model: string, 
    year?: number
  ): Promise<SPAServiceResponse<MarketData[]>> {
    const startTime = Date.now();
    const cacheKey = `market-${make}-${model}-${year || 'all'}`;

    // Check cache
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

    // Scrape all sources concurrently (with some delay to avoid being blocked)
    const results: (MarketData | null)[] = [];
    const sourceKeys = Object.keys(this.marketScrapers);

    for (const sourceKey of sourceKeys) {
      try {
        const result = await this.scrapeMarketSource(sourceKey, make, model, year);
        results.push(result);
        
        // Small delay between sources to be respectful
        if (sourceKey !== sourceKeys[sourceKeys.length - 1]) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`❌ Failed to scrape ${sourceKey}:`, error);
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
          recoverable: true,
          retryAfter: 300
        },
        processingTime: Date.now() - startTime,
        cached: false
      };
    }

    // Aggregate the data for caching
    const aggregatedData: MarketData = {
      source: 'autotrader', // Primary source
      listings: validResults.flatMap(r => r.listings),
      marketAnalysis: {
        averagePrice: Math.round(
          validResults.reduce((sum, r) => sum + r.marketAnalysis.averagePrice, 0) / validResults.length
        ),
        priceRange: {
          min: Math.min(...validResults.map(r => r.marketAnalysis.priceRange.min).filter(p => p > 0)),
          max: Math.max(...validResults.map(r => r.marketAnalysis.priceRange.max))
        },
        inventoryCount: validResults.reduce((sum, r) => sum + r.marketAnalysis.inventoryCount, 0),
        averageMileage: validResults
          .map(r => r.marketAnalysis.averageMileage)
          .filter((m): m is number => m !== undefined)
          .reduce((sum, m, _, arr) => sum + m / arr.length, 0) || undefined
      }
    };

    // Cache the aggregated result
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

  // 🧹 CLEANUP
  async cleanup(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
        this.browser = null;
        console.log('✅ Market scraper browser closed');
      } catch (error) {
        console.error('❌ Error closing market scraper browser:', error);
      }
    }
  }

  // 📊 CACHE STATS
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

// Export singleton
export const marketScraperService = new EnhancedMarketScraperService();

// Cleanup on exit
process.on('exit', () => {
  marketScraperService.cleanup();
});

process.on('SIGINT', async () => {
  await marketScraperService.cleanup();
  process.exit(0);
});