// scraper-backend/server.ts
// Standalone Node.js Express server for live vehicle scrapers (TypeScript)

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { autotraderScraper } from './autotrader';
// TODO: import bringatrailer, parkers, etc.

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
  } catch (err: any) {
    console.error('[scraper-backend] Makes error:', err);
    res.status(500).json({ error: 'Failed to fetch makes', details: err.message });
  }
});

// Live models endpoint
app.get('/models', async (req, res) => {
  const { make } = req.query;
  try {
    const models = await autotraderScraper.getAvailableModels(String(make));
    res.json({ models });
  } catch (err: any) {
    console.error('[scraper-backend] Models error:', err);
    res.status(500).json({ error: 'Failed to fetch models', details: err.message });
  }
});

// Live years endpoint
app.get('/years', async (req, res) => {
  const { make, model } = req.query;
  try {
    const years = await autotraderScraper.getAvailableYears(String(make), String(model));
    res.json({ years });
  } catch (err: any) {
    console.error('[scraper-backend] Years error:', err);
    res.status(500).json({ error: 'Failed to fetch years', details: err.message });
  }
});

// TODO: Add endpoints for bringatrailer, parkers, etc.
// Live search endpoint
app.post('/search', async (req, res) => {
  const { make, model, year } = req.body;
  try {
    const result = await autotraderScraper.searchCars(make, model, year);
    res.json(result);
  } catch (err: any) {
    console.error('[scraper-backend] Search error:', err);
    res.status(500).json({ error: 'Failed to fetch search results', details: err.message });
  }
});

const PORT = process.env.SCRAPER_PORT || 4001;
app.listen(PORT, () => {
  console.log(`[scraper-backend] Server running on port ${PORT}`);
});
