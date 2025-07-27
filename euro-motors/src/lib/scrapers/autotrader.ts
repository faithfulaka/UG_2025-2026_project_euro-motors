// src/lib/scrapers/autotrader.ts
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import type { MarketData, MarketListing } from '@/types/spa';

interface ScrapingResult {
  success: boolean;
  data?: MarketData;
  error?: string;
  retryAfter?: number;
}

export class AutotraderScraper {
  private baseUrl = 'https://www.autotrader.co.uk';
  private delayMs = 3000;
  private lastRequest = 0;
  private cache = new Map<string, { data: MarketData; time: number }>();
  private ttl = 15 * 60 * 1000; // 15 min

  private async delay(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const since = now - this.lastRequest;
    if (since < this.delayMs) {
      await this.delay(this.delayMs - since);
    }
    this.lastRequest = Date.now();
  }

  /** Scrape Autotrader listings for make/model/year */
  public async searchCars(
    make: string,
    model: string,
    year?: number
  ): Promise<ScrapingResult> {
    const key = `${make}-${model}-${year ?? 'any'}`;
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.time < this.ttl) {
      return { success: true, data: cached.data };
    }

    try {
      await this.rateLimit();

      const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      });
      const page = await browser.newPage();
      await page.setUserAgent(
        process.env.SCRAPER_USER_AGENT ||
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      );

      // build URL
      let url = `${this.baseUrl}/car-search?make=${encodeURIComponent(make)}`;
      if (model) url += `&model=${encodeURIComponent(model)}`;
      if (year) url += `&year-from=${year}&year-to=${year}`;
      url += '&sort=relevance';

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      await this.delay(2000);

      // accept cookies
      const btn = await page.$('#onetrust-accept-btn-handler');
      if (btn) {
        await btn.click();
        await this.delay(1000);
      }

      // extract raw rows
      const raw: Array<{
        title: string;
        price: string;
        specs: string;
        url: string;
      }> = await page.evaluate(() => {
        const els = Array.from(
          document.querySelectorAll<HTMLElement>(
            'article[data-testid], .search-page__result'
          )
        ).slice(0, 20);

        return els.map((el, i) => {
          const title = el.querySelector('h3')?.textContent?.trim() ?? `Car ${i+1}`;
          const price = el
            .querySelector('[data-testid="search-listing-price"]')
            ?.textContent?.trim() ?? '£0';
          const specEl = el.querySelector('.listing-key-specs');
          const specs = specEl?.textContent?.trim() ?? '';
          const a = el.querySelector('a[href]') as HTMLAnchorElement | null;
          let href = a?.href ?? a?.getAttribute('href') ?? '';
          if (href && !href.startsWith('http')) {
            href = 'https://www.autotrader.co.uk' + href;
          }
          return { title, price, specs, url: href };
        }).filter(r => !!r.title && !!r.price);
      });

      await browser.close();

      // coerce into MarketListing + compute stats
      const listings: MarketListing[] = [];
      const nums: number[] = [];
      for (const r of raw) {
        const m = r.price.match(/[\d,]+/);
        const n = m ? parseInt(m[0].replace(/,/g, ''), 10) : 0;
        if (n > 1000) {
          listings.push({
            ...r,
            priceNumeric: n
          });
          nums.push(n);
        }
      }

      const avg = nums.length
        ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
        : 0;
      const sorted = [...nums].sort((a, b) => a - b);

      const data: MarketData = {
        listings,
        averagePrice: avg,
        priceRange: `£${sorted[0] ?? 0} - £${sorted[sorted.length - 1] ?? 0}`,
        inventoryCount: listings.length,
        priceDistribution: sorted.length
          ? {
              min: sorted[0],
              max: sorted[sorted.length - 1],
              median: sorted[Math.floor(sorted.length / 2)],
              q1: sorted[Math.floor(sorted.length * 0.25)],
              q3: sorted[Math.floor(sorted.length * 0.75)],
            }
          : undefined,
        dataSource: 'Autotrader UK',
        searchParams: { make, model, year },
        timestamp: new Date().toISOString(),
      };

      this.cache.set(key, { data, time: Date.now() });
      return { success: true, data };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      console.error('🔧 Autotrader error:', msg);
      return { success: false, error: msg };
    }
  }
}

export const autotraderScraper = new AutotraderScraper();