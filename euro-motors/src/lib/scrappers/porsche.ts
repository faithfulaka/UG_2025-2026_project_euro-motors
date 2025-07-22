//src/lib/scrappers/porsche.ts
import puppeteer from 'puppeteer';

class PorscheConfiguratorScraper {
  private baseUrl = 'https://configurator.porsche.com/gbr/en_GB';

  async getCarPricing(model: string): Promise<any> { //Unexpected any. Specify a different type(this error is in every instance  everywhere int his project tht has 'any)
    let browser;
    try {
      browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
      
      // Search for model
      const modelFound = await page.evaluate((searchModel) => {
        const modelCards = Array.from(document.querySelectorAll('[data-testid="model-card"]'));
        const targetCard = modelCards.find(card => 
          card.textContent?.toLowerCase().includes(searchModel.toLowerCase())
        );
        
        if (targetCard) {
          (targetCard as HTMLElement).click();
          return true;
        }
        return false;
      }, model);
      
      if (!modelFound) {
        return { error: 'Model not found in Porsche configurator' };
      }
      
      // Wait for configurator to load
      await page.waitForSelector('[data-testid="price-summary"]', { timeout: 10000 });
      
      // Extract pricing data
      const pricingData = await page.evaluate(() => {
        const basePrice = document.querySelector('[data-testid="base-price"]')?.textContent || '';
        const totalPrice = document.querySelector('[data-testid="total-price"]')?.textContent || '';
        
        // Extract options
        const options = Array.from(document.querySelectorAll('[data-testid="option-item"]')).map(option => {
          const name = option.querySelector('[data-testid="option-name"]')?.textContent || '';
          const price = option.querySelector('[data-testid="option-price"]')?.textContent || '';
          return { name: name.trim(), price: price.trim() };
        });
        
        return {
          basePrice: basePrice.trim(),
          totalPrice: totalPrice.trim(),
          options,
          dataSource: 'Porsche Configurator'
        };
      });
      
      return pricingData;
      
    } catch (error) {
      console.error('Porsche configurator error:', error);
      return { error: 'Failed to scrape Porsche configurator' };
    } finally {
      if (browser) await browser.close();
    }
  }
}

export const porscheConfiguratorScraper = new PorscheConfiguratorScraper();