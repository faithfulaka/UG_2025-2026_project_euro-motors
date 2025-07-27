// src/lib/scrapers/mclaren.ts
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import type { ManufacturerData } from '@/types/spa';

export class McLarenScraper {
  private baseUrl = 'https://configurator.mclaren.com';

  /** Scrape McLaren configurator for pricing & options */
  async getConfig(
    make: string,
    model: string,
    year?: number
  ): Promise<ManufacturerData> {
    const url = `${this.baseUrl}/${model.toLowerCase()}`;
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // wait for pricing elements
    await page.waitForSelector('.price__base', { timeout: 10000 });

    const result = await page.evaluate(() => {
      const base = document.querySelector('.price__base')?.textContent?.trim() || '0';
      const total = document.querySelector('.price__total')?.textContent?.trim() || '0';
      const opts = Array.from(document.querySelectorAll('.option')).map(o => ({
        name: o.querySelector('.option__name')?.textContent?.trim() || '',
        price: o.querySelector('.option__price')?.textContent?.trim() || '0'
      }));
      return { base, total, opts };
    });

    await browser.close();

    return {
      make,
      model,
      year: year || new Date().getFullYear(),
      dataSource: 'McLaren Configurator',
      pricing: {
        basePrice: parseInt(result.base.replace(/[^\d]/g, ''), 10) || 0,
        totalPrice: parseInt(result.total.replace(/[^\d]/g, ''), 10) || 0,
        options: result.opts.map(o => ({
          name: o.name,
          price: parseInt(o.price.replace(/[^\d]/g, ''), 10) || 0,
          currency: 'GBP',
        })),
        currency: 'GBP'
      },
      specifications: {},
      configuratorUrl: url,
      lastUpdated: new Date().toISOString()
    };
  }
}

export const mclarenScraper = new McLarenScraper();