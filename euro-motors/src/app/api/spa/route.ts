import { NextRequest, NextResponse } from 'next/server';
import { manufacturerScraper } from '@/lib/spa-services/manufacturer-scrapers';

export async function POST(request: NextRequest) {
  try {
    const { manufacturer, model } = await request.json();

    if (!manufacturer || !model) {
      return NextResponse.json({ 
        error: 'Manufacturer and model are required' 
      }, { status: 400 });
    }

    // Scrape data from manufacturer
    const data = await manufacturerScraper.scrapeWithDelay(manufacturer, model);

    if (!data) {
      return NextResponse.json({ 
        error: 'Failed to scrape data or unsupported manufacturer' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      data,
      source: 'manufacturer_scraper'
    });

  } catch (error) {
    console.error('Manufacturer scraping API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}