//src/lib/scrapers/porsche.ts
// Dynamic import of puppeteer-core is used inside functions to avoid bundling issues.

import chromium from "@sparticuz/chromium";

export interface PorschePricingResult {
  basePrice?: string;
  totalPrice?: string;
  options?: { name: string; price: string }[];
  dataSource?: string;
  error?: string;
}

export class PorscheConfiguratorScraper {
  private baseUrl = "https://configurator.porsche.com/gbr/en_GB";

  /**
   * Scrape all available Porsche models from the configurator landing page.
   * Returns live, deduped model names.
   */
  public async getAvailableModels(): Promise<string[]> {
    let browser = null;
    try {
      const puppeteer = (await import('puppeteer-core')).default;
browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
      });
      const page = await browser.newPage();
      await page.goto(this.baseUrl, { waitUntil: "networkidle2" });
      // Accept cookies if present
      const acceptBtn = await page.$('button[aria-label*="Accept"]');
      if (acceptBtn) {
        await acceptBtn.click();
        await new Promise((r) => setTimeout(r, 1000));
      }
      // Scrape model names from cards
      const models: string[] = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('[data-testid="model-card"]'));
        return Array.from(new Set(cards.map(card => card.textContent?.trim() || '').filter(Boolean)));
      });
      return models;
    } catch (err) {
      console.error("Porsche getAvailableModels error:", err);
      return [];
    } finally {
      if (browser) await browser.close();
    }
  }

  /**
   * Scrape all available years for a given Porsche model from the configurator.
   * Returns live, deduped years (if available; else empty array).
   */
  public async getAvailableYears(model: string): Promise<number[]> {
    let browser = null;
    try {
      const puppeteer = (await import('puppeteer-core')).default;
browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
      });
      const page = await browser.newPage();
      await page.goto(this.baseUrl, { waitUntil: "networkidle2" });
      // Accept cookies if present
      const acceptBtn = await page.$('button[aria-label*="Accept"]');
      if (acceptBtn) {
        await acceptBtn.click();
        await new Promise((r) => setTimeout(r, 1000));
      }
      // Find and click the model card
      const found = await page.evaluate((searchModel: string) => {
        const cards = Array.from(document.querySelectorAll('[data-testid="model-card"]'));
        const card = cards.find((c) => c.textContent?.toLowerCase().includes(searchModel.toLowerCase()));
        if (card) { (card as HTMLElement).click(); return true; }
        return false;
      }, model);
      if (!found) return [];
      // Wait for year selector if present
      try {
        await page.waitForSelector('[data-testid="year-selector"]', { timeout: 5000 });
        const years: number[] = await page.evaluate(() => {
          const select = document.querySelector('[data-testid="year-selector"]');
          if (!select) return [];
          return Array.from(select.querySelectorAll('option'))
            .map(opt => parseInt(opt.textContent || '', 10))
            .filter(y => !isNaN(y));
        });
        return Array.from(new Set(years)).sort((a, b) => b - a);
      } catch {
        // No year selector; assume only current year is available
        const currentYear = new Date().getFullYear();
        return [currentYear];
      }
    } catch (err) {
      console.error("Porsche getAvailableYears error:", err);
      return [];
    } finally {
      if (browser) await browser.close();
    }
  }

  async getCarPricing(model: string): Promise<PorschePricingResult> {
    let browser = null;
    try {
      const puppeteer = (await import('puppeteer-core')).default;
browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
      });
      const page = await browser.newPage();
      await page.goto(this.baseUrl, { waitUntil: "networkidle2" });
      const acceptBtn = await page.$('button[aria-label*="Accept"]');
      if (acceptBtn) {
        await acceptBtn.click();
        await new Promise((r) => setTimeout(r, 1000));
      }
      const found = await page.evaluate((searchModel: string) => {
        const cards = Array.from(document.querySelectorAll('[data-testid="model-card"]'));
        const card = cards.find((c) =>
          c.textContent?.toLowerCase().includes(searchModel.toLowerCase())
        );
        if (card) { (card as HTMLElement).click(); return true; }
        return false;
      }, model);

      if (!found) {
        return { error: "Model not found in Porsche configurator" };
      }

      await page.waitForSelector("[data-testid='price-summary']", { timeout: 15000 });
      const data = await page.evaluate(() => {
        const basePrice = document.querySelector("[data-testid='base-price']")?.textContent || "";
        const totalPrice = document.querySelector("[data-testid='total-price']")?.textContent || "";
        const options = Array.from(document.querySelectorAll("[data-testid='option-item']"))
          .map((item) => ({
            name: item.querySelector("[data-testid='option-name']")?.textContent?.trim() ?? "",
            price: item.querySelector("[data-testid='option-price']")?.textContent?.trim() ?? "",
          }));
        return {
          basePrice: basePrice.trim(),
          totalPrice: totalPrice.trim(),
          options,
          dataSource: "Porsche Configurator",
        };
      });
      return data;
    } catch (err: unknown) {
      console.error("🔧 Porsche configurator error:", err);
      return { error: "Failed to scrape Porsche configurator" };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

export const porscheConfiguratorScraper = new PorscheConfiguratorScraper();

export const getAvailableModels = porscheConfiguratorScraper.getAvailableModels.bind(porscheConfiguratorScraper);
export const getAvailableYears = porscheConfiguratorScraper.getAvailableYears.bind(porscheConfiguratorScraper);