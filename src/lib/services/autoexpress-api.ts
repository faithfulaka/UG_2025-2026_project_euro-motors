// src/lib/services/autoexpress-api.ts
import puppeteer from 'puppeteer';

export interface AutoExpressForecast {
  msrp?: number;
  fiveYearForecast?: string;
}

export async function getAutoExpressForecast(
  make: string,
  model: string,
  year: string | number
): Promise<AutoExpressForecast> {
  try {
    const browser = await puppeteer.launch({
      headless: process.env.PUPPETEER_HEADLESS === 'true',
      args: (process.env.PUPPETEER_ARGS || '').split(','),
    });
    const page = await browser.newPage();
    await page.setUserAgent(process.env.SCRAPER_USER_AGENT || '');
    const timeout = Number(process.env.SCRAPER_TIMEOUT_MS) || 30000;

    // Navigate to the site’s search page
    await page.goto('https://www.autoexpress.co.uk/car-review', {
      waitUntil: 'networkidle2',
      timeout,
    });

    // Search box and results may vary—adjust these selectors
    await page.type('input[name="q"]', `${make} ${model} ${year}`);
    await page.keyboard.press('Enter');
    await page.waitForSelector('.results-list .results-item', { timeout });
    await page.click('.results-list .results-item a');
    await page.waitForSelector('.spec-table', { timeout });

    // Extract MSRP from a specs table
    const msrpText = await page.$$eval('.spec-table tr', (rows) => {
      for (const row of rows as HTMLElement[]) {
        const th = row.querySelector('th')?.textContent?.toLowerCase();
        if (th?.includes('price (rrp)')) {
          return row.querySelector('td')?.textContent || '';
        }
      }
      return '';
    });

    // Example: forecast may be embedded as data-attribute or text
    const forecastText =
      (await page.$eval('.forecast-chart', (el) =>
        el.getAttribute('data-forecast')
      )) || '';

    await browser.close();

    return {
      msrp: parseFloat(msrpText.replace(/[^0-9.]/g, '')) || undefined,
      fiveYearForecast: forecastText.trim() || undefined,
    };
  } catch (err) {
    console.error('[AutoExpress API ERROR]', err);
    return {};
  }
}