const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('Launching Puppeteer...');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://www.autotrader.co.uk', { waitUntil: 'networkidle2', timeout: 30000 });
    const title = await page.title();
    console.log('Page title:', title);
    await browser.close();
    console.log('Success! Puppeteer launched and scraped page title.');
  } catch (err) {
    console.error('Puppeteer test failed:', err);
    process.exit(1);
  }
})();
