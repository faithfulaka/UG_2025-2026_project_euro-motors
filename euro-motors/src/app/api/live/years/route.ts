import { NextRequest, NextResponse } from 'next/server';
import { carQueryService } from '@/lib/services';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const make = url.searchParams.get('make') || '';
  const model = url.searchParams.get('model') || '';
  const sources: string[] = [];
  const errors: string[] = [];
  let allYears: string[] = [];

  if (!make || !model) return NextResponse.json({ years: [] });

  // 1. CarQuery API (headless fetch/parse)
  try {
    const years = await carQueryService.getYears(make, model);
    if (years && years.length > 0) {
      allYears = allYears.concat(years.map(String));
      sources.push('CarQueryAPI');
    }
  } catch (err) {
    errors.push('CarQueryAPI: ' + (err instanceof Error ? err.message : String(err)));
  }

  // 2. Parkers.co.uk (HTML scraping with fetch/regex)
  try {
    const resp = await fetch(`https://www.parkers.co.uk/${encodeURIComponent(make.toLowerCase())}/${encodeURIComponent(model.toLowerCase().replace(/\s+/g, '-'))}/review/`);
    if (resp.ok) {
      const html = await resp.text();
      // Extract years from headings
      const yearRegex = /(19|20)\d{2}/g;
      const headings = Array.from(html.matchAll(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/g)).map(m => m[1]);
      const foundYears = new Set<string>();
      headings.forEach(title => {
        const matches = title.match(yearRegex);
        if (matches) matches.forEach(y => foundYears.add(y));
      });
      if (foundYears.size > 0) {
        allYears = allYears.concat(Array.from(foundYears));
        sources.push('Parkers');
      }
    }
  } catch (err) {
    errors.push('Parkers: ' + (err instanceof Error ? err.message : String(err)));
  }

  // 3. Bring a Trailer (HTML scraping with fetch/regex)
  try {
    const resp = await fetch(`https://bringatrailer.com/make/${encodeURIComponent(make.toLowerCase())}/?q=${encodeURIComponent(model)}`);
    if (resp.ok) {
      const html = await resp.text();
      const yearRegex = /(19|20)\d{2}/g;
      const titles = Array.from(html.matchAll(/<div class="result-title">([^<]+)<\/div>/g)).map(m => m[1]);
      const foundYears = new Set<string>();
      titles.forEach(title => {
        const matches = title.match(yearRegex);
        if (matches) matches.forEach(y => foundYears.add(y));
      });
      if (foundYears.size > 0) {
        allYears = allYears.concat(Array.from(foundYears));
        sources.push('BringATrailer');
      }
    }
  } catch (err) {
    errors.push('BringATrailer: ' + (err instanceof Error ? err.message : String(err)));
  }

  // 4. Autotrader UK (plain Puppeteer fallback, only if nothing found)
  if (allYears.length === 0) {
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
      await page.select('select[name="model"]', model);
      await new Promise(r => setTimeout(r, 1200));
      const years = await page.evaluate(() => {
        const select = document.querySelector('select[name="year-from"]');
        if (!select) return [];
        return Array.from(select.querySelectorAll('option'))
          .map(opt => opt.textContent?.trim() || '')
          .filter(v => v && /^(19|20)\d{2}$/.test(v));
      });
      await browser.close();
      if (years.length > 0) {
        allYears = allYears.concat(years);
        sources.push('AutotraderUK');
      }
    } catch (err) {
      errors.push('AutotraderUK: ' + (err instanceof Error ? err.message : String(err)));
    }
  }

  // Deduplicate and sort descending
  allYears = Array.from(new Set(allYears.map(y => String(y).trim()).filter(Boolean)));
  allYears.sort((a, b) => Number(b) - Number(a));

  return NextResponse.json({
    years: allYears,
    sources,
    errors: errors.length ? errors : undefined,
    make,
    model,
    timestamp: new Date().toISOString()
  });
}
