// Bring a Trailer auction history scraper (stub)
// This will be extended to fetch and parse auction history for a given make/model/year

// --- Suggestion stubs for live dropdowns ---
// Dynamic import of puppeteer is used inside functions to avoid bundling issues.
import type { Browser, Page } from 'puppeteer';

export async function getAvailableMakes(): Promise<string[]> {
  try {
    const puppeteer = (await import('puppeteer')).default;
const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://bringatrailer.com/makes/', { waitUntil: 'networkidle2', timeout: 30000 });
    // Scrape all make names from the makes index
    const makes: string[] = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.make-listing .make-title'))
        .map(el => el.textContent?.trim() || '')
        .filter(Boolean);
    });
    await browser.close();
    return makes;
  } catch (err) {
    console.error('[Bring a Trailer] Failed to scrape makes:', err);
    return [];
  }
}


export async function getAvailableModels(make?: string): Promise<string[]> {
  if (!make) return [];
  try {
    const puppeteer = (await import('puppeteer')).default;
const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    // Go to the make's page, e.g. https://bringatrailer.com/make/porsche/
    await page.goto(`https://bringatrailer.com/make/${encodeURIComponent(make.toLowerCase())}/`, { waitUntil: 'networkidle2', timeout: 30000 });
    // Scrape all model names from the model filter dropdown or listing
    const models: string[] = await page.evaluate(() => {
      // Try to find all models in the filter dropdown or as headings
      const dropdown = document.querySelector('select[name="model"]');
      if (dropdown) {
        return Array.from(dropdown.querySelectorAll('option'))
          .map(opt => opt.textContent?.trim() || '')
          .filter(v => v && v.toLowerCase() !== 'any model');
      }
      // Fallback: scrape headings (may be less reliable)
      return Array.from(document.querySelectorAll('.model-listing .model-title'))
        .map(el => el.textContent?.trim() || '')
        .filter(Boolean);
    });
    await browser.close();
    return models;
  } catch (err) {
    console.error(`[Bring a Trailer] Failed to scrape models for make ${make}:`, err);
    return [];
  }
}


export async function getAvailableYears(make?: string, model?: string): Promise<string[]> {
  if (!make || !model) return [];
  try {
    const puppeteer = (await import('puppeteer')).default;
const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    // Search for all listings for this make/model and extract available years from listing titles
    await page.goto(`https://bringatrailer.com/make/${encodeURIComponent(make.toLowerCase())}/?q=${encodeURIComponent(model)}`, { waitUntil: 'networkidle2', timeout: 30000 });
    const years: string[] = await page.evaluate(() => {
      // Extract years from listing titles (e.g. '2022 Bentley Continental GT V8')
      const yearRegex = /\b(19|20)\d{2}\b/g;
      const titles = Array.from(document.querySelectorAll('.result-title'))
        .map(el => el.textContent || '');
      const foundYears = new Set<string>();
      titles.forEach(title => {
        const matches = title.match(yearRegex);
        if (matches) matches.forEach(y => foundYears.add(y));
      });
      return Array.from(foundYears).sort((a, b) => parseInt(b) - parseInt(a));
    });
    await browser.close();
    return years;
  } catch (err) {
    console.error(`[Bring a Trailer] Failed to scrape years for ${make} ${model}:`, err);
    return [];
  }
}



export interface AuctionSale {
  date: string;
  price: string;
  mileage: string;
  notes: string;
  url: string;
}

export interface AuctionHistory {
  recentSales: AuctionSale[];
  averagePrice?: string;
  highestSale?: string;
  lowestSale?: string;
  commonNotes?: string[];
}

/**
 * Scrape Bring a Trailer auction history for a given car
 * @param model e.g. 'Continental GT V8'
 * @param year e.g. '2022'
 */

export async function getBringATrailerAuctionHistory(make?: string, model?: string, year?: string): Promise<AuctionHistory> {
  // This is a mock implementation for now, as Bring a Trailer uses anti-bot measures.
  // In production, rotate proxies and use headless browser if needed.
  // Example search URL: https://bringatrailer.com/{year}-{make}-{model}/

  // Mocked example data for a Bentley Continental GT V8
  if (
    make?.toLowerCase() === 'bentley' &&
    model?.toLowerCase().includes('continental') &&
    year === '2022'
  ) {
    return {
      recentSales: [
        {
          date: '2024-05-13',
          price: '£168,500',
          mileage: '1,200 miles',
          notes: 'Mulliner Driving Specification, First Edition',
          url: 'https://bringatrailer.com/listing/2022-bentley-continental-gt-v8-1/'
        },
        {
          date: '2024-03-29',
          price: '£142,000',
          mileage: '12,500 miles',
          notes: 'First Edition, Glacier White',
          url: 'https://bringatrailer.com/listing/2022-bentley-continental-gt-v8-2/'
        }
      ],
      averagePrice: '£155,200',
      highestSale: '£168,500 (1,200 miles)',
      lowestSale: '£142,000 (12,500 miles)',
      commonNotes: ['Mulliner Driving Specification', 'First Edition']
    };
  }

  // For other cars, just return an empty stub for now
  return {
    recentSales: [],
    averagePrice: undefined,
    highestSale: undefined,
    lowestSale: undefined,
    commonNotes: [],
  };
}

