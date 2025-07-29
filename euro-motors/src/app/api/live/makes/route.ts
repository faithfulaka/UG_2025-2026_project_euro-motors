import { NextResponse } from 'next/server';
import { carQueryService } from '@/lib/services';

export async function GET() {
  const sources: string[] = [];
  const errors: string[] = [];
  let allMakes: string[] = [];

  // 1. CarQuery API (headless fetch/parse)
  try {
    const makes = await carQueryService.getMakes();
    if (makes && makes.length > 0) {
      allMakes = allMakes.concat(makes);
      sources.push('CarQueryAPI');
    }
  } catch (err) {
    errors.push('CarQueryAPI: ' + (err instanceof Error ? err.message : String(err)));
  }

  // 2. Parkers.co.uk (HTML scraping with fetch/Cheerio)
  try {
    const resp = await fetch('https://www.parkers.co.uk/cars/reviews/');
    if (resp.ok) {
      const html = await resp.text();
      const makes = Array.from(html.matchAll(/<a[^>]+class="review-list__item__title"[^>]*>([^<]+)<\/a>/g)).map(m => m[1].trim());
      if (makes.length > 0) {
        allMakes = allMakes.concat(makes);
        sources.push('Parkers');
      }
    }
  } catch (err) {
    errors.push('Parkers: ' + (err instanceof Error ? err.message : String(err)));
  }

  // 3. Bring a Trailer (HTML scraping with fetch/Cheerio)
  try {
    const resp = await fetch('https://bringatrailer.com/makes/');
    if (resp.ok) {
      const html = await resp.text();
      const makes = Array.from(html.matchAll(/<a[^>]+class="make-title"[^>]*>([^<]+)<\/a>/g)).map(m => m[1].trim());
      if (makes.length > 0) {
        allMakes = allMakes.concat(makes);
        sources.push('BringATrailer');
      }
    }
  } catch (err) {
    errors.push('BringATrailer: ' + (err instanceof Error ? err.message : String(err)));
  }

  // 4. Autotrader UK (plain Puppeteer fallback, only if nothing found)
  if (allMakes.length === 0) {
    try {
      const puppeteer = (await import('puppeteer')).default;
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto('https://www.autotrader.co.uk/car-search', { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 1500));
      const btn = await page.$('#onetrust-accept-btn-handler');
      if (btn) { await btn.click(); await new Promise(r => setTimeout(r, 500)); }
      const makes = await page.evaluate(() => {
        const select = document.querySelector('select[name="make"]');
        if (!select) return [];
        return Array.from(select.querySelectorAll('option'))
          .map(opt => opt.textContent?.trim() || '')
          .filter(v => v && v.toLowerCase() !== 'any make');
      });
      await browser.close();
      if (makes.length > 0) {
        allMakes = allMakes.concat(makes);
        sources.push('AutotraderUK');
      }
    } catch (err) {
      errors.push('AutotraderUK: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  // Deduplicate and sort
  allMakes = Array.from(new Set(allMakes.map(m => (m || '').trim()).filter(Boolean)));
  allMakes.sort((a, b) => a.localeCompare(b));

  return NextResponse.json({
    makes: allMakes,
    sources,
    errors: errors.length ? errors : undefined,
    timestamp: new Date().toISOString()
  });
}
