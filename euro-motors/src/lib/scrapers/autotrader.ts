// src/lib/scrapers/autotrader.ts - FULLY FIXED VERSION
import puppeteer from 'puppeteer';
import { MarketData, MarketListing } from '@/types/spa';

interface ScrapingResult {
  success: boolean;
  data?: {
    listings: Array<{
      title: string;
      price: string;
      specs?: string;
      url: string;
    }>;
    averagePrice: number;
    priceRange: string;
    inventoryCount: number;
    dataSource: string;
    timestamp: string;
  };
  error?: string;
  retryAfter?: number;
}

class AutotraderScraper {
  private baseUrl = 'https://www.autotrader.co.uk';
  private lastRequestTime = 0;
  private requestDelay = 3000; // 3 seconds between requests
  private cache = new Map<string, { data: MarketData; timestamp: number }>();
  private readonly CACHE_TTL = 15 * 60 * 1000; // 15 minutes

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async respectRateLimit(): Promise<void> {
    const currentTime = Date.now();
    const timeSinceLastRequest = currentTime - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.requestDelay) {
      const waitTime = this.requestDelay - timeSinceLastRequest;
      console.log(`⏳ Autotrader rate limiting: waiting ${waitTime}ms`);
      await this.delay(waitTime);
    }
    
    this.lastRequestTime = Date.now();
  }

  async searchCars(make: string, model: string, year?: number): Promise<ScrapingResult> {
    try {
      // Check cache first
      const cacheKey = `${make}-${model}-${year || 'any'}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
        console.log(`✅ Autotrader cache hit: ${cacheKey}`);
        return {
          success: true,
          data: {
            listings: cached.data.listings.map(listing => ({
              title: listing.title,
              price: listing.price,
              specs: listing.specs,
              url: listing.url
            })),
            averagePrice: cached.data.averagePrice,
            priceRange: cached.data.priceRange,
            inventoryCount: cached.data.inventoryCount,
            dataSource: cached.data.dataSource,
            timestamp: cached.data.timestamp
          }
        };
      }

      await this.respectRateLimit();

      console.log(`🔍 Autotrader scraping: ${make} ${model} ${year || 'any'}`);

      let browser;
      try {
        browser = await puppeteer.launch({ 
          headless: process.env.PUPPETEER_HEADLESS !== 'false',
          args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-dev-shm-usage',
            '--no-first-run',
            '--no-zygote',
            '--single-process'
          ],
          timeout: 30000
        });
        
        const page = await browser.newPage();
        
        // Set user agent and headers
        await page.setUserAgent(
          process.env.SCRAPER_USER_AGENT || 
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        );
        
        await page.setExtraHTTPHeaders({
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-GB,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        });

        // Build search URL
        let searchUrl = `${this.baseUrl}/car-search?make=${encodeURIComponent(make)}`;
        if (model) searchUrl += `&model=${encodeURIComponent(model)}`;
        if (year) searchUrl += `&year-from=${year}&year-to=${year}`;
        
        // Add sorting by relevance and limit to new/nearly new
        searchUrl += '&sort=relevance&price-to=500000&advertising-location=at_cars';

        console.log(`📄 Loading Autotrader page: ${searchUrl}`);
        
        await page.goto(searchUrl, { 
          waitUntil: 'networkidle2',
          timeout: 30000 
        });

        // Wait for results to load
        await this.delay(2000);

        // Handle cookie consent if present - FIXED: Remove unused variable
        try {
          const acceptCookies = await page.$('#onetrust-accept-btn-handler');
          if (acceptCookies) {
            await acceptCookies.click();
            await this.delay(1000);
          }
        } catch {
          // FIXED: Removed unused 'cookieError' variable
          console.log('⚠️ Cookie consent not found, continuing...');
        }

        // Extract car listings with enhanced selectors
        const listings = await page.evaluate(() => {
          const cars = Array.from(
            document.querySelectorAll('article[data-testid="trader-seller-listing"], .search-page__result, [data-testid="search-listing"]')
          );
          
          return cars.slice(0, 20).map((car, index) => {
            try {
              // Multiple selector strategies
              const titleSelectors = [
                'h3[data-testid="search-listing-title"]',
                '.listing-fpa-link h3',
                '.product-card-details__title',
                'h3',
                '.listing-title'
              ];
              
              const priceSelectors = [
                '[data-testid="search-listing-price"]',
                '.product-card-pricing__price',
                '.listing-fpa-link .price',
                '.vehicle-price',
                '.price'
              ];
              
              const specsSelectors = [
                '.listing-key-specs',
                '.product-card-details .listing-attention-grabber',
                '.vehicle-specs',
                '.search-listing-specs'
              ];

              let title = '';
              let price = '';
              let specs = '';
              let url = '';

              // Try to find title
              for (const selector of titleSelectors) {
                const element = car.querySelector(selector);
                if (element?.textContent) {
                  title = element.textContent.trim();
                  break;
                }
              }

              // Try to find price
              for (const selector of priceSelectors) {
                const element = car.querySelector(selector);
                if (element?.textContent) {
                  price = element.textContent.trim();
                  break;
                }
              }

              // Try to find specs
              for (const selector of specsSelectors) {
                const element = car.querySelector(selector);
                if (element?.textContent) {
                  specs = element.textContent.trim();
                  break;
                }
              }

              // Try to find URL
              const linkElement = car.querySelector('a[href*="/car-details/"]') || 
                                 car.querySelector('a[href*="/motors/"]') ||
                                 car.querySelector('a');
              if (linkElement) {
                url = linkElement.getAttribute('href') || '';
                if (url && !url.startsWith('http')) {
                  url = 'https://www.autotrader.co.uk' + url;
                }
              }

              return {
                title: title || `Car ${index + 1}`,
                price: price || '£0',
                specs: specs || '',
                url: url || '',
                index
              };
            } catch (listingExtractionError) {
              console.error('Error extracting car data:', listingExtractionError);
              return {
                title: `Car ${index + 1}`,
                price: '£0',
                specs: '',
                url: '',
                index
              };
            }
          }).filter(car => car.title && car.price);
        });

        await browser.close();

        // Process pricing data
        const validListings: MarketListing[] = [];
        const prices: number[] = [];

        listings.forEach(listing => {
          // Extract numeric price
          const priceMatch = listing.price.match(/[\d,]+/);
          const numericPrice = priceMatch ? 
            parseInt(priceMatch[0].replace(/,/g, '')) : 0;

          if (numericPrice > 1000) { // Filter out obviously wrong prices
            validListings.push({
              title: listing.title,
              price: listing.price,
              priceNumeric: numericPrice,
              specs: listing.specs,
              url: listing.url
            });
            prices.push(numericPrice);
          }
        });

        // Calculate statistics
        const avgPrice = prices.length > 0 ? 
          Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
        
        // Calculate median and quartiles
        const sortedPrices = [...prices].sort((a, b) => a - b);
        const median = sortedPrices.length > 0 ? 
          sortedPrices[Math.floor(sortedPrices.length / 2)] : 0;
        const q1 = sortedPrices.length > 0 ? 
          sortedPrices[Math.floor(sortedPrices.length * 0.25)] : 0;
        const q3 = sortedPrices.length > 0 ? 
          sortedPrices[Math.floor(sortedPrices.length * 0.75)] : 0;

        const marketData: MarketData = {
          listings: validListings,
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
          dataSource: 'Autotrader UK',
          searchParams: { make, model, year },
          timestamp: new Date().toISOString()
        };

        // Cache the result
        this.cache.set(cacheKey, {
          data: marketData,
          timestamp: Date.now()
        });

        console.log(`✅ Autotrader scraping completed: ${validListings.length} listings, avg price £${avgPrice.toLocaleString()}`);

        return {
          success: true,
          data: {
            listings: validListings.map(listing => ({
              title: listing.title,
              price: listing.price,
              specs: listing.specs,
              url: listing.url
            })),
            averagePrice: avgPrice,
            priceRange: `£${minPrice.toLocaleString()} - £${maxPrice.toLocaleString()}`,
            inventoryCount: validListings.length,
            dataSource: 'Autotrader UK',
            timestamp: new Date().toISOString()
          }
        };
        
      } catch (browserError) {
        if (browser) await browser.close();
        throw browserError;
      }
      
    } catch (scrapingError) {
      console.error('❌ Autotrader scraping error:', scrapingError);
      
      let errorMessage = 'Unknown scraping error';
      let retryAfter = 60; // Default 1 minute retry
      
      if (scrapingError instanceof Error) {
        errorMessage = scrapingError.message;
        
        if (scrapingError.message.includes('timeout') || scrapingError.message.includes('TimeoutError')) {
          errorMessage = 'Autotrader page load timeout';
          retryAfter = 30;
        } else if (scrapingError.message.includes('blocked') || scrapingError.message.includes('403')) {
          errorMessage = 'Autotrader blocked request';
          retryAfter = 300; // 5 minutes
        } else if (scrapingError.message.includes('rate limit') || scrapingError.message.includes('429')) {
          errorMessage = 'Autotrader rate limited';
          retryAfter = 180; // 3 minutes
        }
      }
      
      return {
        success: false,
        error: errorMessage,
        retryAfter
      };
    }
  }

  // Legacy method for backward compatibility
  async searchCarsLegacy(make: string, model: string, year?: number): Promise<{
    listings: Array<{ title: string; price: string; specs?: string; url: string }>;
    marketData: {
      averagePrice: number;
      priceRange: string;
      inventoryCount: number;
      dataSource: string;
    } | null;
    error?: string;
  }> {
    const result = await this.searchCars(make, model, year);
    
    if (!result.success) {
      return { 
        listings: [], 
        marketData: null,
        error: result.error
      };
    }
    
    return {
      listings: result.data!.listings,
      marketData: {
        averagePrice: result.data!.averagePrice,
        priceRange: result.data!.priceRange,
        inventoryCount: result.data!.inventoryCount,
        dataSource: result.data!.dataSource
      }
    };
  }

  clearCache(): void {
    this.cache.clear();
    console.log('🧹 Autotrader cache cleared');
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const autotraderScraper = new AutotraderScraper();