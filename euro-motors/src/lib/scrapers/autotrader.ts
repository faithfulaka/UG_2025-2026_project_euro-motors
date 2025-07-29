// src/lib/scrapers/autotrader.ts
// --- PATCHED FOR STEALTH AND PROXY ---
import chromium from '@sparticuz/chromium';
// Dynamic import workaround for ESM/TS lint compliance
// PuppeteerExtra singleton for lint/type compliance
let PuppeteerExtraSingleton: unknown = null;
async function getPuppeteerExtra() {
  if (PuppeteerExtraSingleton) return PuppeteerExtraSingleton;
  const puppeteerExtraImport = await import('puppeteer-extra');
  const StealthPluginImport = await import('puppeteer-extra-plugin-stealth');
  const puppeteerExtra = puppeteerExtraImport.default;
  const StealthPlugin = StealthPluginImport.default;
  puppeteerExtra.use(StealthPlugin());
  PuppeteerExtraSingleton = puppeteerExtra;
  return PuppeteerExtraSingleton;
}
// Optional: add proxy plugin setup here if needed
// -----------------------------------------------
import type { MarketData, MarketListing } from '@/types/spa';

interface ScrapingResult {
  success: boolean;
  data?: MarketData;
  error?: string;
  retryAfter?: number;
}

export class AutotraderScraper {
  private baseUrl = 'https://www.autotrader.co.uk';
  // ...existing fields...

  /** Scrape all available makes from Autotrader */
  public async getAvailableMakes(): Promise<string[]> {
    // --- PATCHED: Use puppeteer-extra with stealth, log each step, fallback to CarQuery API ---
    let browser;
    try {
      const puppeteerExtraUnknown = await getPuppeteerExtra();
      if (typeof puppeteerExtraUnknown !== 'object' || puppeteerExtraUnknown === null || typeof (puppeteerExtraUnknown as { launch?: unknown }).launch !== 'function') {
        throw new Error('Failed to load puppeteer-extra with stealth');
      }
      const puppeteerExtra = puppeteerExtraUnknown as { launch: typeof import('puppeteer').launch };
      browser = await puppeteerExtra.launch({
        args: chromium.args,
        executablePath: '/Applications/Chromium.app/Contents/MacOS/Chromium',
        headless: true,
        // Uncomment and set proxy if needed:
        // args: [...chromium.args, '--proxy-server=http://your-proxy:port']
      });
      const page = await browser.newPage();
      console.log('[AutotraderScraper] Navigating to car-search page...');
      await page.goto(`${this.baseUrl}/car-search`, { waitUntil: 'networkidle2', timeout: 30000 });
      await this.delay(1500);
      // Accept cookies if present
      const btn = await page.$('#onetrust-accept-btn-handler');
      if (btn) { await btn.click(); await this.delay(500); }
      // Scrape makes from dropdown
      const makes: string[] = await page.evaluate(() => {
        const select = document.querySelector('select[name="make"]');
        if (!select) return [];
        return Array.from(select.querySelectorAll('option'))
          .map(opt => opt.textContent?.trim() || '')
          .filter(v => v && v.toLowerCase() !== 'any make');
      });
      await browser.close();
      console.log('[AutotraderScraper] Scraped makes:', makes);
      if (makes.length > 0) return makes;
      else throw new Error('No makes found after scraping.');
    } catch (err) {
      if (browser) await browser.close();
      console.error('[AutotraderScraper] Stealth scraping failed:', err);
      // --- Fallback: CarQuery API ---
      try {
        console.log('[AutotraderScraper] Falling back to CarQuery API...');
        const res = await fetch('https://www.carqueryapi.com/api/0.3/?cmd=getMakes');
        const data: Record<string, unknown> = await res.json();
        // Type guard for CarQuery response
        const makesArr = (typeof data === 'object' && data && Array.isArray((data as Record<string, unknown>).Makes))
          ? (data as Record<string, unknown>).Makes as Array<Record<string, unknown>>
          : [];
        const makes = makesArr.map((m) =>
          typeof m.make_display === 'string' ? m.make_display : (typeof m.make_id === 'string' ? m.make_id : '')
        ).filter(Boolean);
        console.log('[AutotraderScraper] CarQuery fallback makes:', makes);
        return makes;
      } catch (apiErr) {
        console.error('[AutotraderScraper] CarQuery fallback failed:', apiErr);
        return [];
      }
    }
  }

  /** Scrape all available models for a given make from Autotrader */
  public async getAvailableModels(make: string): Promise<string[]> {
    const puppeteerExtraUnknown = await getPuppeteerExtra();
    if (typeof puppeteerExtraUnknown !== 'object' || puppeteerExtraUnknown === null || typeof (puppeteerExtraUnknown as { launch?: unknown }).launch !== 'function') {
      throw new Error('Failed to load puppeteer-extra with stealth');
    }
    const puppeteerExtra = puppeteerExtraUnknown as { launch: typeof import('puppeteer').launch };
    const browser = await puppeteerExtra.launch({
      args: chromium.args,
      executablePath: '/Applications/Chromium.app/Contents/MacOS/Chromium',
      headless: true,
    });
    const page = await browser.newPage();
    await page.goto(`${this.baseUrl}/car-search?make=${encodeURIComponent(make)}`, { waitUntil: 'networkidle2', timeout: 30000 });
    await this.delay(1500);
    // Accept cookies if present
    const btn = await page.$('#onetrust-accept-btn-handler');
    if (btn) { await btn.click(); await this.delay(500); }
    // Scrape models from dropdown
    const models: string[] = await page.evaluate(() => {
      const select = document.querySelector('select[name="model"]');
      if (!select) return [];
      return Array.from(select.querySelectorAll('option'))
        .map(opt => opt.textContent?.trim() || '')
        .filter(v => v && v.toLowerCase() !== 'any model');
    });
    await browser.close();
    return models;
  }

  /** Scrape all available years for a given make+model from Autotrader */
  public async getAvailableYears(make: string, model: string): Promise<number[]> {
    const puppeteerExtraUnknown = await getPuppeteerExtra();
    if (typeof puppeteerExtraUnknown !== 'object' || puppeteerExtraUnknown === null || typeof (puppeteerExtraUnknown as { launch?: unknown }).launch !== 'function') {
      throw new Error('Failed to load puppeteer-extra with stealth');
    }
    const puppeteerExtra = puppeteerExtraUnknown as { launch: typeof import('puppeteer').launch };
    const browser = await puppeteerExtra.launch({
      args: chromium.args,
      executablePath: '/Applications/Chromium.app/Contents/MacOS/Chromium',
      headless: true,
    });
    const page = await browser.newPage();
    await page.goto(`${this.baseUrl}/car-search?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`, { waitUntil: 'networkidle2', timeout: 30000 });
    await this.delay(1500);
    // Accept cookies if present
    const btn = await page.$('#onetrust-accept-btn-handler');
    if (btn) { await btn.click(); await this.delay(500); }
    // Scrape years from dropdown
    const years: number[] = await page.evaluate(() => {
      const select = document.querySelector('select[name="year-from"]');
      if (!select) return [];
      return Array.from(select.querySelectorAll('option'))
        .map(opt => parseInt(opt.textContent || '', 10))
        .filter(y => !isNaN(y));
    });
    await browser.close();
    // Return sorted and unique years (descending)
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }

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

      const puppeteerExtraUnknown = await getPuppeteerExtra();
      if (typeof puppeteerExtraUnknown !== 'object' || puppeteerExtraUnknown === null || typeof (puppeteerExtraUnknown as { launch?: unknown }).launch !== 'function') {
        throw new Error('Failed to load puppeteer-extra with stealth');
      }
      const puppeteerExtra = puppeteerExtraUnknown as { launch: typeof import('puppeteer').launch };
      const browser = await puppeteerExtra.launch({
        args: chromium.args,
        executablePath: '/Applications/Chromium.app/Contents/MacOS/Chromium', // Use Homebrew Chromium for Mac
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