// src/lib/services/autoexpress-api.ts
import puppeteer, { Browser, Page, ElementHandle } from 'puppeteer';

export interface AutoExpressForecast {
  msrp?: number;
  fiveYearForecast?: string;
}

export async function getAutoExpressForecast(
  make: string,
  model: string,
  year: string | number
): Promise<AutoExpressForecast> {
  let browser: Browser | null = null;
  try {
    browser = await puppeteer.launch({
      headless: process.env.PUPPETEER_HEADLESS === 'true',
      args: (process.env.PUPPETEER_ARGS || '').split(','),
    });
    let page: Page | null = null;
    page = await browser.newPage();
    await page.setUserAgent(process.env.SCRAPER_USER_AGENT || '');
    const timeout = Number(process.env.SCRAPER_TIMEOUT_MS) || 30000;

    // Navigate to the site’s search page
    await page.goto('https://www.autoexpress.co.uk/car-review', {
      waitUntil: 'networkidle2',
      timeout,
    });

    // Search box and results may vary—adjust these selectors
    const searchInput = await page.$('input[name="q"]');
    if (searchInput) {
      const inputHandle = searchInput as ElementHandle<HTMLInputElement>;
      await inputHandle.type(`${make} ${model} ${year}`);
      await page.keyboard.press('Enter');
    }
    let msrpText = '';
    let forecastText = '';
    try {
      await page.waitForSelector('.results-list .results-item', { timeout });
      await page.click('.results-list .results-item a');
      await page.waitForSelector('.spec-table', { timeout });

      // Extract MSRP from a specs table
      try {
        msrpText = await page.$$eval('.spec-table tr', (rows: Element[]) => {
          for (const row of rows) {
            const th = row.querySelector('th')?.textContent?.toLowerCase();
            if (th?.includes('price (rrp)')) {
              return row.querySelector('td')?.textContent || '';
            }
          }
          return '';
        });
      } catch {
        msrpText = '';
      }

      // Example: forecast may be embedded as data-attribute or text
      try {
        forecastText =
          (await page.$eval('.forecast-chart', (el: Element) =>
            el.getAttribute('data-forecast')
          )) || '';
      } catch {
        forecastText = '';
      }
    } catch {
      // Ignore errors for missing selectors, continue with partial data
      msrpText = '';
      forecastText = '';
    }

    return {
      msrp: parseFloat(msrpText.replace(/[^0-9.]/g, '')) || undefined,
      fiveYearForecast: forecastText.trim() || undefined,
    };
  } catch (err) {
    console.error('[AutoExpress API ERROR]', err);
    return {};
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}