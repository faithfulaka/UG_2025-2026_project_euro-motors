// src/lib/services/motors-api.ts
import puppeteer from 'puppeteer';

export interface MotorsPricing {
  msrp?: number;
  marketRange?: string;
  averagePrice?: number;
}

export async function getMotorsPricing(
  make: string,
  model: string,
  year: string | number
): Promise<MotorsPricing> {
  try {
    const browser = await puppeteer.launch({
      headless: process.env.PUPPETEER_HEADLESS === 'true',
      args: (process.env.PUPPETEER_ARGS || '').split(','),
    });
    const page = await browser.newPage();
    await page.setUserAgent(process.env.SCRAPER_USER_AGENT || '');
    const timeout = Number(process.env.SCRAPER_TIMEOUT_MS) || 30000;

    const url = `https://www.motors.co.uk/car-price-guide/?make=${encodeURIComponent(
      make
    )}&model=${encodeURIComponent(model)}&year=${encodeURIComponent(String(year))}`;
    await page.goto(url, { waitUntil: 'networkidle2', timeout });

    // NOTE: if the site’s markup changes, update these selectors
    let msrpText = '';
    let rangeText = '';
    let avgText = '';
    try {
      msrpText = await page.$eval(
        '.price-guide__msrp .guide-value',
        (el) => el.textContent || ''
      );
    } catch {
      msrpText = '';
    }
    try {
      rangeText = await page.$eval(
        '.price-guide__range .guide-value',
        (el) => el.textContent || ''
      );
    } catch {
      rangeText = '';
    }
    try {
      avgText = await page.$eval(
        '.price-guide__average .guide-value',
        (el) => el.textContent || ''
      );
    } catch {
      avgText = '';
    }

    await browser.close();

    return {
      msrp: parseFloat(msrpText.replace(/[^0-9.]/g, '')) || undefined,
      marketRange: rangeText.trim() || undefined,
      averagePrice: parseFloat(avgText.replace(/[^0-9.]/g, '')) || undefined,
    };
  } catch (err) {
    console.error('[Motors API ERROR]', err);
    return {};
  }
}