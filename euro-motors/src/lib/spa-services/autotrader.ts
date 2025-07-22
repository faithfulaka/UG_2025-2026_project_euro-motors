//src/lib/scrapers/autotrader.ts
import puppeteer from 'puppeteer';

class AutotraderScraper {
  private baseUrl = 'https://www.autotrader.co.uk';

  async searchCars(make: string, model: string, year?: number): Promise<any> {
    let browser;
    try {
      browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Build search URL
      let searchUrl = `${this.baseUrl}/car-search?make=${encodeURIComponent(make)}`;
      if (model) searchUrl += `&model=${encodeURIComponent(model)}`;
      if (year) searchUrl += `&year-from=${year}&year-to=${year}`;
      
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });
      
      // Extract car listings
      const listings = await page.evaluate(() => {
        const cars = Array.from(document.querySelectorAll('[data-testid="trader-seller-listing"]'));
        
        return cars.slice(0, 10).map(car => {
          const titleElement = car.querySelector('h3');
          const priceElement = car.querySelector('[data-testid="search-listing-price"]');
          const specsElement = car.querySelector('.listing-key-specs');
          
          return {
            title: titleElement?.textContent?.trim() || '',
            price: priceElement?.textContent?.trim() || '',
            specs: specsElement?.textContent?.trim() || '',
            url: car.querySelector('a')?.href || ''
          };
        });
      });
      
      // Calculate price range
      const prices = listings
        .map(car => car.price.replace(/[^\d]/g, ''))
        .filter(price => price)
        .map(price => parseInt(price))
        .filter(price => !isNaN(price));
      
      const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
      
      return {
        listings,
        marketData: {
          averagePrice: avgPrice,
          priceRange: `£${minPrice.toLocaleString()} - £${maxPrice.toLocaleString()}`,
          inventoryCount: listings.length,
          dataSource: 'Autotrader UK'
        }
      };
      
    } catch (error) {
      console.error('Autotrader scraping error:', error);
      return { listings: [], marketData: null };
    } finally {
      if (browser) await browser.close();
    }
  }
}

export const autotraderScraper = new AutotraderScraper();