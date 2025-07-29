//src/lib/scrapers/porsche.ts
import puppeteer from "puppeteer-core";
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

  async getCarPricing(model: string): Promise<PorschePricingResult> {
    let browser = null;
    try {
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