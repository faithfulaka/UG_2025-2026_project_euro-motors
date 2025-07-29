// Parkers depreciation and ownership cost scraper (stub)
// This will be extended to fetch and parse depreciation and TCO for a given make/model/year

export interface DepreciationData {
  year1?: string;
  year3?: string;
  year5?: string;
  residualValueRating?: string;
  notes?: string[];
}

export interface OwnershipCosts {
  insuranceGroup?: string;
  annualRoadTax?: string;
  typicalFinancing?: string;
  fuelCost?: string;
  maintenanceCost?: string;
  notes?: string[];
}

/**
 * Scrape Parkers for depreciation and ownership costs for a given car
 * @param make e.g. 'Bentley'
 * @param model e.g. 'Continental GT V8'
 * @param year e.g. '2022'
 */
export async function getParkersDepreciationAndOwnership(make: string, model: string, year?: string): Promise<{ depreciation: DepreciationData, ownership: OwnershipCosts }> {
  // For now, just return a stub. Next: implement real scraping logic.
  if (
    make.toLowerCase() === 'bentley' &&
    model.toLowerCase().includes('continental') &&
    year === '2022'
  ) {
    return {
      depreciation: {
        year1: '-15% (Est. Value: £148,750)',
        year3: '-35% (Est. Value: £113,750)',
        year5: '-48% (Est. Value: £91,000)',
        residualValueRating: 'Good (compared to segment)',
        notes: ['Rotating Display, First Edition improve resale']
      },
      ownership: {
        insuranceGroup: '50',
        annualRoadTax: '£580 (luxury vehicle tax)',
        typicalFinancing: '4.9% APR (£3,120/month with 20% down, 48 months)',
        fuelCost: 'Approx. £4,200/year (10,000 miles)',
        maintenanceCost: '£3,500-£5,000/year',
        notes: ['Brake pads (£1,800), Annual service (£1,200)']
      }
    };
  }
  return {
    depreciation: {},
    ownership: {}
  };
}

// --- Suggestion methods for multi-site merging (mocked, extendable) ---

import puppeteer from 'puppeteer';

export async function getAvailableMakes(): Promise<string[]> {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.parkers.co.uk/cars/reviews/', { waitUntil: 'networkidle2', timeout: 30000 });
    // Scrape all make names from the reviews index
    const makes: string[] = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.review-list__item__title'))
        .map(el => el.textContent?.trim() || '')
        .filter(Boolean);
    });
    await browser.close();
    return makes;
  } catch (err) {
    console.error('[Parkers] Failed to scrape makes:', err);
    return [];
  }
}


export async function getAvailableModels(make?: string): Promise<string[]> {
  if (!make) return [];
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    // Go to the make reviews page, e.g. https://www.parkers.co.uk/bentley/reviews/
    await page.goto(`https://www.parkers.co.uk/${encodeURIComponent(make.toLowerCase())}/reviews/`, { waitUntil: 'networkidle2', timeout: 30000 });
    // Scrape all model names from the model review list
    const models: string[] = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.review-list__item__title'))
        .map(el => el.textContent?.trim() || '')
        .filter(Boolean);
    });
    await browser.close();
    return models;
  } catch (err) {
    console.error(`[Parkers] Failed to scrape models for make ${make}:`, err);
    return [];
  }
}


export async function getAvailableYears(make?: string, model?: string): Promise<string[]> {
  if (!make || !model) return [];
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    // Go to the model's review page, e.g. https://www.parkers.co.uk/bentley/continental-gt/review/
    await page.goto(`https://www.parkers.co.uk/${encodeURIComponent(make.toLowerCase())}/${encodeURIComponent(model.toLowerCase().replace(/\s+/g, '-'))}/review/`, { waitUntil: 'networkidle2', timeout: 30000 });
    // Scrape all years from the generation/year selector or headings
    const years: string[] = await page.evaluate(() => {
      // Try to extract years from generation/year selector
      const yearRegex = /\b(19|20)\d{2}\b/g;
      const headings = Array.from(document.querySelectorAll('.review-header__title, .review-list__item__title'))
        .map(el => el.textContent || '');
      const foundYears = new Set<string>();
      headings.forEach(title => {
        const matches = title.match(yearRegex);
        if (matches) matches.forEach(y => foundYears.add(y));
      });
      return Array.from(foundYears).sort((a, b) => parseInt(b) - parseInt(a));
    });
    await browser.close();
    return years;
  } catch (err) {
    console.error(`[Parkers] Failed to scrape years for ${make} ${model}:`, err);
    return [];
  }
}

