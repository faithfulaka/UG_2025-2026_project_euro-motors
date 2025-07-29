// scraper-backend/server.js
// Standalone Node.js Express server for live vehicle scrapers

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import your scrapers here (use relative paths if needed)
const { autotraderScraper } = require('../euro-motors/src/lib/scrapers/autotrader.ts');
// Add bringatrailer, parkers, etc. as needed

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Live makes endpoint
app.get('/makes', async (req, res) => {
  try {
    const makes = await autotraderScraper.getAvailableMakes();
    res.json({ makes });
  } catch (err) {
    console.error('[scraper-backend] Makes error:', err);
    res.status(500).json({ error: 'Failed to fetch makes', details: err.message });
  }
});

// Live models endpoint
app.get('/models', async (req, res) => {
  const { make } = req.query;
  try {
    const models = await autotraderScraper.getAvailableModels(make);
    res.json({ models });
  } catch (err) {
    console.error('[scraper-backend] Models error:', err);
    res.status(500).json({ error: 'Failed to fetch models', details: err.message });
  }
});

// Live years endpoint
app.get('/years', async (req, res) => {
  const { make, model } = req.query;
  try {
    const years = await autotraderScraper.getAvailableYears(make, model);
    res.json({ years });
  } catch (err) {
    console.error('[scraper-backend] Years error:', err);
    res.status(500).json({ error: 'Failed to fetch years', details: err.message });
  }
});

// TODO: Add endpoints for bringatrailer, parkers, etc.
// TODO: Add /search endpoint for full car search

const PORT = process.env.SCRAPER_PORT || 4001;
app.listen(PORT, () => {
  console.log(`[scraper-backend] Server running on port ${PORT}`);
});
