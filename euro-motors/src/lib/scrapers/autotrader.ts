// src/lib/scrapers/autotrader.ts
import puppeteer from 'puppeteer';
import type { MarketData, MarketListing } from '@/types/spa';

interface ScrapingResult {
  success: boolean;
  data?: {
    listings: MarketListing[];
    averagePrice: number;
    priceRange: string;
    inventoryCount: number;
    priceDistribution?: {
      min: number;
      max: number;
      median: number;
      q1: number;
      q3: number;
    };
    dataSource: string;
    searchParams?: { make: string; model: string; year?: number };
    timestamp: string;
  };
  error?: string;
  retryAfter?: number;
}

export class AutotraderScraper {
  private baseUrl = 'https://www.autotrader.co.uk';
  private lastRequestTime = 0;
  private requestDelay = 3000;
  private cache = new Map<string, { data: MarketData; timestamp: number }>();
  private readonly CACHE_TTL = 15 * 60 * 1000;

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  private async respectRateLimit() {
    const now = Date.now();
    const since = now - this.lastRequestTime;
    if (since < this.requestDelay) {
      await this.delay(this.requestDelay - since);
    }
    this.lastRequestTime = Date.now();
  }

  public async searchCars(
    make: string,
    model: string,
    year?: number
  ): Promise<ScrapingResult> {
    const key = `${make}-${model}-${year ?? 'any'}`;
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return {
        success: true,
        data: { ...cached.data, searchParams: { make, model, year } }
      };
    }

    try {
      await this.respectRateLimit();
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      );

      let url = `${this.baseUrl}/car-search?make=${encodeURIComponent(make)}`;
      if (model) url += `&model=${encodeURIComponent(model)}`;
      if (year) url += `&year-from=${year}&year-to=${year}`;
      url += '&sort=relevance';

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await this.delay(2000);

      const listings = await page.evaluate(() => {
        const rows = Array.from(
          document.querySelectorAll<HTMLElement>(
            'article, .search-page__result'
          )
        );
        return rows.slice(0, 20).map(row => {
          const title =
            row.querySelector('h3')?.textContent?.trim() ?? 'Unknown';
          const price =
            row
              .querySelector('[data-testid="search-listing-price"]')
              ?.textContent?.trim() ?? '£0';
          const specs =
            row.querySelector('.listing-key-specs')?.textContent?.trim() ?? '';
          const href = row.querySelector('a[href]')?.getAttribute('href') ?? '';
          const url = href.startsWith('http')
            ? href
            : `https://www.autotrader.co.uk${href}`;
          return { title, price, specs, url };
        });
      });

      await browser.close();

      const valid: MarketListing[] = [];
      const nums: number[] = [];
      for (const l of listings) {
        const m = l.price.match(/[\d,]+/);
        const num = m ? parseInt(m[0].replace(/,/g, ''), 10) : 0;
        if (num > 1000) {
          valid.push({ ...l, priceNumeric: num });
          nums.push(num);
        }
      }

      const avg = nums.length
        ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
        : 0;
      const sorted = [...nums].sort((a, b) => a - b);
      const marketData: MarketData = {
        listings: valid,
        averagePrice: avg,
        priceRange: `£${Math.min(...nums)} - £${Math.max(...nums)}`,
        inventoryCount: valid.length,
        priceDistribution: sorted.length
          ? {
              min: sorted[0],
              max: sorted[sorted.length - 1],
              median: sorted[Math.floor(sorted.length / 2)],
              q1: sorted[Math.floor(sorted.length / 4)],
              q3: sorted[Math.floor((sorted.length * 3) / 4)]
            }
          : undefined,
        dataSource: 'Autotrader UK',
        searchParams: { make, model, year },
        timestamp: new Date().toISOString()
      };

      this.cache.set(key, { data: marketData, timestamp: Date.now() });
      return { success: true, data: marketData };
    } catch (err: unknown) {
      console.error('Autotrader scrape error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        retryAfter: 60
      };
    }
  }
}

export const autotraderScraper = new AutotraderScraper();