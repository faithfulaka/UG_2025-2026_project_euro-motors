# 🚘 Supercar Pricing Aggregator – Full System Plan (Next.js + React)

## 🎯 Goal
Build a powerful **Next.js** + **React** application that collects and displays detailed pricing information about supercars — including:

- ✅ Base MSRP  
- ✅ Optional extras  
- ✅ Real-world transaction data  
- ✅ Auction history  
- ✅ Dealer listings  
- ✅ Live build pricing from manufacturers  

The app pulls from **free APIs** and **web scraping techniques** across multiple sources.

---

## 🔗 Data Sources & Integration Summary

| Source                         | What You Get                                              | Integration Type           | Node.js Friendly? | Method |
|-------------------------------|-----------------------------------------------------------|-----------------------------|--------------------|--------|
| **CarQuery API**              | Base MSRP, trims, years, engine specs                    | ✅ REST API                 | ✅ Yes              | API (axios/fetch) |
| **Bring a Trailer (BaT)**     | Auction prices, MSRP mentions, optional extras, stickers | ❌ No API – scrape only     | ✅ Yes              | Playwright |
| **Classic.com**               | Aggregated auction sales, MSRP sometimes mentioned        | ❌ No API – scrape only     | ✅ Yes              | Cheerio / Puppeteer |
| **Autotrader**                | Dealer listings, MSRP, sometimes option breakdown         | ❌ No API – scrape only     | ✅ Yes              | Puppeteer |
| **Cars.com**                  | MSRP, car listings, price filters                         | ❌ No API – scrape only     | ✅ Yes              | Puppeteer |
| **Manufacturer Configurators**| Real MSRP, live option pricing for new builds             | ❌ No API – scrape only     | ✅ Yes              | Playwright |
| **Edmunds.com**               | MSRP, invoice pricing, option pricing, trim details       | ❌ API restricted – scrape  | ✅ Yes              | Cheerio / Puppeteer |
| **KBB.com**                   | MSRP and resale estimates                                 | ❌ API restricted – scrape  | ✅ Yes              | Puppeteer |

---

## 🔧 What We’re Building

(Truncated for brevity...)

---

## 🏎️ Usable Supercar Configurators (With Pricing) – For Code Integration

These are the brands that:

✅ Offer pricing (base MSRP and/or options)  
✅ Can be scraped with tools like Playwright or Puppeteer  
✅ Are usable in a Next.js + Node.js project  
✅ Support GBP or can be converted  

---

## ✅ Top Supercar Brands With Pricing & Scrape-Friendly Configuratorsfor Manufacturer Configurators

| Brand           | Configurator URL | GBP Pricing | Integration Type | Notes |
|-----------------|------------------|-------------|------------------|-------|
| **Porsche**     | https://configurator.porsche.com/gbr/en_GB | ✅ Native | Scrape + internal API | Full pricing, options, Porsche Code, shareable builds |
| **McLaren**     | https://configurator.mclaren.com | ✅ Native | Scrape + JSON state | Dynamic pricing updates per option; local storage & POST |
| **Lamborghini** | https://configurator.lamborghini.com | ⚠️ Region-based | Scrape + XHR | Options and pricing via JSON fetches |
| **Aston Martin**| https://configurator.astonmartin.com | ✅ Native | Scrape + JSON | Clean layout, GBP available on UK site |
| **Maserati**    | https://configurator.maserati.com | ✅ Native | Scrape + fetch | Full pricing breakdown available |
| **Lotus**       | https://configurator.lotuscars.com | ✅ Native | Scrape + JSON | Easy-to-read breakdown, UK site is well-structured |
| **BMW M**       | https://www.bmw.co.uk/en/configurator.html | ✅ Native | Scrape + XHR | All M cars have full pricing in UK configurator |
| **Mercedes-AMG**| https://www.mercedes-benz.co.uk/passengercars/configurator.html | ✅ Native | Scrape + XHR | UK site with full support for model/option pricing |
| **Audi RS**     | https://www.audi.co.uk | ✅ Native | Scrape + JSON | Configurator APIs return pricing & visuals |

---

## ❌ Excluded Brands (No Pricing in Configurator)

| Brand        | Reason |
|--------------|--------|
| **Ferrari**  | No prices shown, visual-only configurator |
| **Bugatti**  | No configurator at all |
| **Koenigsegg** | Fully bespoke, no online config |
| **Pagani**   | No pricing or build tool |
| **Rimac**    | Inquiry-only, no live build UI |
| **Ford GT**  | Discontinued, no public configurator |

---

## 🧠 Summary: Brands You Can Use in Code

### 💯 Best for Full Supercar Builds:
- **Porsche**
- **McLaren**
- **Aston Martin**
- **Maserati**
- **Lamborghini**

### 🧩 Solid Performance Tier with Full Pricing:
- **BMW M Series**
- **Mercedes-AMG**
- **Audi RS**
- **Lotus**

### ⚡ Modern Electric/Hybrid Performance:
- **Tesla**
- **Lucid**

---

## 🛠 Integration Method for All Above

| Tool          | Use Case |
|---------------|----------|
| **Playwright** | Simulate build, extract pricing & options |
| **Puppeteer**  | Automate navigation and get rendered prices |
| **Axios + DevTools** | Use with any discovered JSON config APIs |
| **Cheerio**    | Use if site has pre-rendered HTML or static pricing |

---

## 🧩 What Data Is Extracted From Each Site + How It’s Used in Code

| Source | Data Fields Extracted | Used In Code |
|--------|------------------------|---------------|
| **CarQuery API** | `make`, `model`, `year`, `baseMSRP`, `engineType`, `trim` | Used in search dropdowns, base pricing fallback, DB spec storage |
| **Bring a Trailer (BaT)** | `title`, `finalSalePrice`, `descriptionText`, `windowStickerMention`, `listingURL` | Auction price display, MSRP flag, option tag parsing |
| **Classic.com** | `title`, `salePrice`, `auctionSource`, `listingURL`, `year` | Historical resale trends, optional MSRP note, graphing |
| **Autotrader** | `dealerPrice`, `msrp`, `mileage`, `location`, `options[]` | Live market pricing, compare to MSRP, frontend price card |
| **Cars.com** | Same as Autotrader | Same |
| **Edmunds** | `msrp`, `invoicePrice`, `options[]`, `trimComparisons` | MSRP breakdown, optional cost detail card |
| **Manufacturer Configurators** | `basePrice`, `optionList[]`, `totalPrice`, `configID` | Used to simulate builds, get full new car pricing, total value |
| **KBB** | `msrp`, `resaleEstimate`, `marketRating` | Resale prediction module, badge indicators |
| **Currency Converter API (optional)** | `usdToGbp`, `eurToGbp` | Normalizing all prices to GBP in backend/logic layer |

---

Note:
- The best calculation to find price of searched car from all api and scapper websites
- GBP conversion setup in code (you can do this during or after calculating the best price of searched)
