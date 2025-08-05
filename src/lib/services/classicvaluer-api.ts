// src/lib/services/classicvaluer-api.ts
import puppeteer from 'puppeteer';

import { delay } from '@/lib/utils';

export interface ClassicValuerData {
  msrp?: number;
  typicalValue?: number;
}

export async function getClassicValuerData(
  make: string,
  model: string,
  year: string | number
): Promise<ClassicValuerData> {
  try {
    const browser = await puppeteer.launch({
      headless: process.env.PUPPETEER_HEADLESS === 'true',
      args: (process.env.PUPPETEER_ARGS || '').split(','),
    });
    const page = await browser.newPage();
    await page.setUserAgent(process.env.SCRAPER_USER_AGENT || '');
    const timeout = Number(process.env.SCRAPER_TIMEOUT_MS) || 30000;

    try {
      await page.goto(
        'https://www.theclassicvaluer.com/price-guide-selector',
        { waitUntil: 'networkidle2', timeout }
      );
    } catch {
      await browser.close();
      return {};
    }

    // Adjust selectors if they change:
    try {
      await page.select('#make-selector', make);
      await delay(500);
    } catch {}
    try {
      await page.select('#model-selector', model);
      await delay(500);
    } catch {}
    try {
      await page.select('#year-selector', String(year));
    } catch {}
    let msrpText = '';
    let typicalText = '';
    try {
      await page.click('#get-price-btn');
      await page.waitForSelector('.price-output .msrp-value', { timeout });
      msrpText = await page.$eval(
        '.price-output .msrp-value',
        (el) => el.textContent || ''
      );
      typicalText = await page.$eval(
        '.price-output .typical-value',
        (el) => el.textContent || ''
      );
    } catch {
      // Ignore missing selectors or failures for price block
      msrpText = '';
      typicalText = '';
    }

    await browser.close();

    return {
      msrp: parseFloat(msrpText.replace(/[^0-9.]/g, '')) || undefined,
      typicalValue:
        parseFloat(typicalText.replace(/[^0-9.]/g, '')) || undefined,
    };
  } catch (err) {
    console.error('[ClassicValuer API ERROR]', err);
    return {};
  }
}