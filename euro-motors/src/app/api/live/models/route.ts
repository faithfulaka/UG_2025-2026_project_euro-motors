import { NextRequest, NextResponse } from 'next/server';
import { carQueryService } from '@/lib/services';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const make = url.searchParams.get('make') || '';
  const sources: string[] = [];
  const errors: string[] = [];
  let allModels: string[] = [];

  if (!make) return NextResponse.json({ models: [] });

  // 1. CarQuery API (headless fetch/parse)
  try {
    const models = await carQueryService.getModels(make);
    if (models && models.length > 0) {
      allModels = allModels.concat(models);
      sources.push('CarQueryAPI');
    }
  } catch (err) {
    errors.push('CarQueryAPI: ' + (err instanceof Error ? err.message : String(err)));
  }

  // 2. Parkers.co.uk (HTML scraping with fetch/regex)
  try {
    const resp = await fetch(`https://www.parkers.co.uk/${encodeURIComponent(make.toLowerCase())}/reviews/`);
    if (resp.ok) {
      const html = await resp.text();
      const models = Array.from(html.matchAll(/<a[^>]+class="review-list__item__title"[^>]*>([^<]+)<\/a>/g)).map(m => m[1].trim());
      if (models.length > 0) {
        allModels = allModels.concat(models);
        sources.push('Parkers');
      }
    }
  } catch (err) {
    errors.push('Parkers: ' + (err instanceof Error ? err.message : String(err)));
  }

  // 3. Bring a Trailer (HTML scraping with fetch/regex)
  try {
    const resp = await fetch(`https://bringatrailer.com/make/${encodeURIComponent(make.toLowerCase())}/`);
    if (resp.ok) {
      const html = await resp.text();
      const models = Array.from(html.matchAll(/<a[^>]+class="model-title"[^>]*>([^<]+)<\/a>/g)).map(m => m[1].trim());
      if (models.length > 0) {
        allModels = allModels.concat(models);
        sources.push('BringATrailer');
      }
    }
  } catch (err) {
    errors.push('BringATrailer: ' + (err instanceof Error ? err.message : String(err)));
  }

  // 4. Autotrader UK (plain Puppeteer fallback, only if nothing found)
  if (allModels.length === 0) {
    try {
      const puppeteer = (await import('puppeteer')).default;
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto('https://www.autotrader.co.uk/car-search', { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 1500));
      const btn = await page.$('#onetrust-accept-btn-handler');
      if (btn) { await btn.click(); await new Promise(r => setTimeout(r, 500)); }
      await page.select('select[name="make"]', make);
      await new Promise(r => setTimeout(r, 1200));
      const models = await page.evaluate(() => {
        const select = document.querySelector('select[name="model"]');
        if (!select) return [];
        return Array.from(select.querySelectorAll('option'))
          .map(opt => opt.textContent?.trim() || '')
          .filter(v => v && v.toLowerCase() !== 'any model');
      });
      await browser.close();
      if (models.length > 0) {
        allModels = allModels.concat(models);
        sources.push('AutotraderUK');
      }
    } catch (err) {
      errors.push('AutotraderUK: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  // Deduplicate and sort
  allModels = Array.from(new Set(allModels.map(m => (m || '').trim()).filter(Boolean)));
  allModels.sort((a, b) => a.localeCompare(b));

  return NextResponse.json({
    models: allModels,
    sources,
    errors: errors.length ? errors : undefined,
    make,
    timestamp: new Date().toISOString()
  });
}
