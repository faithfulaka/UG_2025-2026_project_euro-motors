// src/lib/spa-services/manufacturer-scrapers.ts - REAL MULTI-BRAND SCRAPERS
import puppeteer, { Browser, Page } from 'puppeteer';
import { ManufacturerConfigData, SPAServiceResponse } from '@/types/spa';

interface ScraperConfig {
  baseUrl: string;
  currency: 'GBP' | 'USD' | 'EUR';
  region: 'UK' | 'US' | 'EU';
  selectors: {
    models?: string;
    basePrice?: string;
    totalPrice?: string;
    options?: string;
    colors?: string;
    configuratorFrame?: string;
  };
  waitSelectors?: string[];
  cookieAccept?: string;
  countrySelector?: string;
}

class RealManufacturerScraperService {
  private browser: Browser | null = null;
  private cache = new Map<string, { data: any; expiresAt: number }>();
  private cacheTimeout = 60 * 60 * 1000; // 1 hour cache for manufacturer data

  // 🏭 MANUFACTURER CONFIGURATIONS (Real URLs & Selectors)
  private manufacturerConfigs: Record<string, ScraperConfig> = {
    porsche: {
      baseUrl: 'https://configurator.porsche.com/gbr/en_GB',
      currency: 'GBP',
      region: 'UK',
      selectors: {
        models: '.model-tile, .model-card',
        basePrice: '.price-base, .starting-price, .price-from',
        totalPrice: '.price-total, .total-price',
        options: '.option-item, .equipment-item',
        configuratorFrame: '#configurator-frame'
      },
      waitSelectors: ['.price-summary', '.model-overview'],
      cookieAccept: '#onetrust-accept-btn-handler, .cookie-accept'
    },

    mclaren: {
      baseUrl: 'https://configurator.mclaren.com',
      currency: 'GBP',
      region: 'UK',
      selectors: {
        models: '.model-card, .vehicle-tile',
        basePrice: '.base-price, .from-price',
        totalPrice: '.total-price, .configured-price',
        options: '.option-selector, .customization-option'
      },
      waitSelectors: ['.price-display', '.configurator-loaded'],
      cookieAccept: '.accept-cookies, .cookie-consent-accept'
    },

    bmw: {
      baseUrl: 'https://www.bmw.co.uk/en/configurator.html',
      currency: 'GBP',
      region: 'UK',
      selectors: {
        models: '.model-item, .vehicle-card',
        basePrice: '.starting-price, .price-from',
        totalPrice: '.configuration-price, .total-cost',
        options: '.equipment-item, .option-card'
      },
      waitSelectors: ['.price-overview', '.configurator-ready'],
      cookieAccept: '#consent-accept, .gdpr-accept'
    },

    mercedes: {
      baseUrl: 'https://www.mercedes-benz.co.uk/passengercars/configurator.html',
      currency: 'GBP',
      region: 'UK',
      selectors: {
        models: '.model-teaser, .vehicle-overview',
        basePrice: '.price-information, .from-price',
        totalPrice: '.total-price, .configured-price',
        options: '.equipment-line, .option-package'
      },
      waitSelectors: ['.price-display', '.wb-configurator-loaded'],
      cookieAccept: '.cookie-consent-accept, #truste-consent-button'
    },

    audi: {
      baseUrl: 'https://www.audi.co.uk/configurator',
      currency: 'GBP',
      region: 'UK',
      selectors: {
        models: '.model-card, .vehicle-tile',
        basePrice: '.price-from, .starting-price',
        totalPrice: '.total-price, .final-price',
        options: '.equipment-item, .option-line'
      },
      waitSelectors: ['.price-summary', '.configurator-initialized'],
      cookieAccept: '.uc-accept-all-button, .cookie-accept'
    },

    lamborghini: {
      baseUrl: 'https://configurator.lamborghini.com',
      currency: 'EUR', // Usually EUR, will convert to GBP
      region: 'EU',
      selectors: {
        models: '.model-selector, .car-model',
        basePrice: '.base-price, .starting-from',
        totalPrice: '.total-price, '.configuration-total',
        options: '.option-category, .customization-item'
      },
      waitSelectors: ['.price-info', '.configurator-loaded'],
      cookieAccept: '.cookie-accept, #cookie-consent-accept'
    },

    astonmartin: {
      baseUrl: 'https://configurator.astonmartin.com',
      currency: 'GBP',
      region: 'UK',
      selectors: {
        models: '.model-card, '.vehicle-overview',
        basePrice: '.price-from, .starting-price',
        totalPrice: '.total-price, .configured-total',
        options: '.option-item, .equipment-line'
      },
      waitSelectors: ['.pricing-summary', '.configurator-ready'],
      cookieAccept: '.accept-cookies'
    },

    maserati: {
      baseUrl: 'https://configurator.maserati.com',
      currency: 'GBP',
      region: 'UK',
      selectors: {
        models: '.model-tile, .car-overview',
        basePrice: '.price-starting, .from-price',
        totalPrice: '.price-total, .final-price',
        options: '.personalization-option, .equipment-item'
      },
      waitSelectors: ['.price-display', '.configurator-loaded'],
      cookieAccept: '.cookie-policy-accept'
    },

    lotus: {
      baseUrl: 'https://configurator.lotuscars.com',
      currency: 'GBP',
      region: 'UK',
      selectors: {
        models: '.model-card, .vehicle-card',
        basePrice: '.price-from, .starting-price',
        totalPrice: '.total-price, .configured-price',
        options: '.option-item, .customization-option'
      },
      waitSelectors: ['.price-summary', '.configurator-initialized'],
      cookieAccept: '.accept-cookies'
    }
  };

  // 🚀 INITIALIZE BROWSER WITH OPTIMAL SETTINGS
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
        '--disable-features=VizDisplayCompositor',
        '--window-size=1920,1080',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      ],
      timeout: 30000
    });

    return this.browser;
  }

  // 🍪 HANDLE COOKIES AND GDPR
  private async handleCookiesAndGDPR(page: Page, config: ScraperConfig): Promise<void> {
    if (!config.cookieAccept) return;

    try {
      // Wait for cookie banner and accept
      await page.waitForSelector(config.cookieAccept, { timeout: 5000 });
      await page.click(config.cookieAccept);
      await page.waitForTimeout(1000);
      console.log('✅ Cookies accepted');
    } catch (error) {
      console.log('⚠️ No cookie banner found or already accepted');
    }
  }

  // 🌍 SET REGION AND CURRENCY
  private async setRegionAndCurrency(page: Page, config: ScraperConfig): Promise<void> {
    if (!config.countrySelector) return;

    try {
      await page.waitForSelector(config.countrySelector, { timeout: 3000 });
      
      // Select appropriate region
      if (config.region === 'UK') {
        await page.click(`${config.countrySelector} [data-country="GB"], [value="UK"], [data-value="en-GB"]`);
      }
      
      await page.waitForTimeout(2000);
      console.log(`✅ Region set to ${config.region}`);
    } catch (error) {
      console.log('⚠️ Could not set region, using default');
    }
  }

  // 🔍 UNIVERSAL SCRAPER FOR ANY MANUFACTURER
  async scrapeManufacturerData(
    manufacturer: string, 
    model: string, 
    year?: number
  ): Promise<SPAServiceResponse<ManufacturerConfigData>> {
    const startTime = Date.now();
    const cacheKey = `${manufacturer}-${model}-${year || 'current'}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return {
        success: true,
        data: cached.data,
        processingTime: Date.now() - startTime,
        cached: true
      };
    }

    const config = this.manufacturerConfigs[manufacturer.toLowerCase()];
    if (!config) {
      return {
        success: false,
        error: {
          code: 'NO_DATA_FOUND',
          message: `Manufacturer ${manufacturer} not supported. Available: ${Object.keys(this.manufacturerConfigs).join(', ')}`,
          recoverable: false
        },
        processingTime: Date.now() - startTime,
        cached: false
      };
    }

    let browser: Browser | null = null;
    let page: Page | null = null;

    try {
      browser = await this.initBrowser();
      page = await browser.newPage();
      
      // Set optimal page settings
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-GB,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br'
      });

      // Navigate to configurator
      console.log(`🌐 Navigating to ${manufacturer} configurator...`);
      await page.goto(config.baseUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Handle cookies and GDPR
      await this.handleCookiesAndGDPR(page, config);
      
      // Set region if needed
      await this.setRegionAndCurrency(page, config);

      // Wait for key elements to load
      if (config.waitSelectors) {
        for (const selector of config.waitSelectors) {
          try {
            await page.waitForSelector(selector, { timeout: 10000 });
          } catch (error) {
            console.log(`⚠️ Timeout waiting for ${selector}, continuing...`);
          }
        }
      }

      // Try to find and select the model
      let modelFound = false;
      if (config.selectors.models) {
        try {
          modelFound = await page.evaluate((modelSelector, targetModel) => {
            const modelElements = document.querySelectorAll(modelSelector);
            
            for (const element of modelElements) {
              const text = element.textContent?.toLowerCase() || '';
              if (text.includes(targetModel.toLowerCase())) {
                (element as HTMLElement).click();
                return true;
              }
            }
            return false;
          }, config.selectors.models, model);

          if (modelFound) {
            console.log(`✅ Found and selected model: ${model}`);
            await page.waitForTimeout(3000); // Wait for model to load
          }
        } catch (error) {
          console.log('⚠️ Could not auto-select model, scraping general data');
        }
      }

      // Extract pricing and configuration data
      const scrapedData = await page.evaluate((selectors, manufacturer, model, year) => {
        const data: any = {
          make: manufacturer,
          model: model,
          year: year || new Date().getFullYear(),
          basePrice: 0,
          currency: 'GBP',
          configuratorUrl: window.location.href,
          availableOptions: [],
          colors: [],
          interiorOptions: [],
          packages: []
        };

        // Extract base price
        if (selectors.basePrice) {
          const priceElement = document.querySelector(selectors.basePrice);
          if (priceElement) {
            const priceText = priceElement.textContent || '';
            const priceMatch = priceText.match(/[\d,]+/);
            if (priceMatch) {
              data.basePrice = parseInt(priceMatch[0].replace(/,/g, ''));
            }
          }
        }

        // Extract options
        if (selectors.options) {
          const optionElements = document.querySelectorAll(selectors.options);
          Array.from(optionElements).slice(0, 20).forEach((element, index) => {
            const text = element.textContent?.trim() || '';
            if (text.length > 0 && text.length < 100) {
              const priceMatch = text.match(/£([\d,]+)/);
              data.availableOptions.push({
                category: 'Options',
                name: text.replace(/£[\d,]+/, '').trim(),
                price: priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : 0,
                description: ''
              });
            }
          });
        }

        // Try to extract engine info from page content
        const pageText = document.body.textContent || '';
        const engineMatch = pageText.match(/(\d+\.?\d*L?\s*V?\d*\s*[^,\n]*(?:engine|motor|turbo|hybrid))/i);
        if (engineMatch) {
          data.engine = engineMatch[1];
        }

        // Try to extract horsepower
        const hpMatch = pageText.match(/(\d+)\s*(?:hp|bhp|ps|cv)/i);
        if (hpMatch) {
          data.horsepower = parseInt(hpMatch[1]);
        }

        // Try to extract acceleration
        const accelMatch = pageText.match(/(\d+\.?\d*)\s*(?:sec|seconds?)\s*(?:to\s*)?(?:0-)?(?:100|60)/i);
        if (accelMatch) {
          data.acceleration = parseFloat(accelMatch[1]);
        }

        return data;
      }, config.selectors, manufacturer, model, year);

      // Convert EUR to GBP if needed (rough conversion)
      if (config.currency === 'EUR' && scrapedData.basePrice > 0) {
        scrapedData.basePrice = Math.round(scrapedData.basePrice * 0.86); // Rough EUR to GBP
        scrapedData.currency = 'GBP';
      }

      // Validate and enhance the data
      const manufacturerData: ManufacturerConfigData = {
        make: manufacturer.charAt(0).toUpperCase() + manufacturer.slice(1),
        model: model,
        year: year || new Date().getFullYear(),
        basePrice: scrapedData.basePrice || 0,
        currency: 'GBP',
        configuratorUrl: scrapedData.configuratorUrl,
        availableOptions: scrapedData.availableOptions || [],
        colors: scrapedData.colors || [],
        interiorOptions: scrapedData.interiorOptions || [],
        packages: scrapedData.packages || []
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: manufacturerData,
        expiresAt: Date.now() + this.cacheTimeout
      });

      console.log(`✅ Successfully scraped ${manufacturer} data: £${manufacturerData.basePrice.toLocaleString()}`);

      return {
        success: true,
        data: manufacturerData,
        processingTime: Date.now() - startTime,
        cached: false
      };

    } catch (error: any) {
      console.error(`🚨 Manufacturer scraping error for ${manufacturer}:`, error.message);
      
      return {
        success: false,
        error: {
          code: 'SCRAPING_FAILED',
          message: `Failed to scrape ${manufacturer}: ${error.message}`,
          recoverable: true,
          retryAfter: 300 // 5 minutes
        },
        processingTime: Date.now() - startTime,
        cached: false
      };

    } finally {
      if (page) {
        try {
          await page.close();
        } catch (e) {
          console.log('⚠️ Error closing page:', e);
        }
      }
    }
  }

  // 📋 GET SUPPORTED MANUFACTURERS
  getSupportedManufacturers(): string[] {
    return Object.keys(this.manufacturerConfigs).map(key => 
      key.charAt(0).toUpperCase() + key.slice(1)
    );
  }

  // 🧹 CLEANUP
  async cleanup(): Promise<void> {
    if (this.browser) {
      try {
        await this.browser.close();
        this.browser = null;
        console.log('✅ Browser closed successfully');
      } catch (error) {
        console.error('❌ Error closing browser:', error);
      }
    }
  }

  // 📊 CACHE MANAGEMENT
  clearCache(): void {
    this.cache.clear();
    console.log('✅ Manufacturer cache cleared');
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      manufacturers: Array.from(this.cache.keys()).map(key => key.split('-')[0]),
      oldestEntry: this.cache.size > 0 ? Math.min(...Array.from(this.cache.values()).map(v => v.expiresAt)) : null
    };
  }
}

// Export singleton
export const manufacturerScraperService = new RealManufacturerScraperService();

// Graceful cleanup on process exit
process.on('exit', () => {
  manufacturerScraperService.cleanup();
});

process.on('SIGINT', async () => {
  await manufacturerScraperService.cleanup();
  process.exit(0);
});
