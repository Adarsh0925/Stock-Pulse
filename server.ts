import dns from 'node:dns';
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import { stockService, PROMINENT_STOCKS } from './server/services/stockService';
import { getNifty50Data } from './server/services/marketData';
import { getLexicon, addCustomWord, deleteCustomWord } from './server/services/lexiconService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROMINENT_STOCKS = [
  { ticker: 'HDFCBANK.NS', name: 'HDFC Bank Limited', exchange: 'NSE', sector: 'Banking & Financials' },
  { ticker: 'RELIANCE.NS', name: 'Reliance Industries Limited', exchange: 'NSE', sector: 'Energy & Petrochemicals' },
  { ticker: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE', sector: 'Information Technology' },
  { ticker: 'INFY.NS', name: 'Infosys Limited', exchange: 'NSE', sector: 'Information Technology' },
  { ticker: 'TATAMOTORS.NS', name: 'Tata Motors Limited', exchange: 'NSE', sector: 'Automobile' },
  { ticker: 'ICICIBANK.NS', name: 'ICICI Bank Limited', exchange: 'NSE', sector: 'Banking & Financials' },
  { ticker: 'SBIN.NS', name: 'State Bank of India', exchange: 'NSE', sector: 'Public Banking' },
  { ticker: 'BHARTIARTL.NS', name: 'Bharti Airtel Limited', exchange: 'NSE', sector: 'Telecommunications' },
  { ticker: 'ITC.NS', name: 'ITC Limited', exchange: 'NSE', sector: 'Consumer Goods (FMCG)' },
  { ticker: 'LTIM.NS', name: 'LTIMindtree Limited', exchange: 'NSE', sector: 'Information Technology' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', sector: 'Semiconductors & AI' },
  { ticker: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Consumer Electronics' },
  { ticker: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', sector: 'Automotive & Clean Energy' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', sector: 'Software & Cloud' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', sector: 'Internet & Search' }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health Endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'HEALTHY',
      service: 'Stock Market Research & Prediction Engine',
      engine: 'Node.js Express + TypeScript + Financial Analytics'
    });
  });

  // Dictionary / Lexicon Endpoints
  app.get('/api/dictionary', (req, res) => {
    res.json(getLexicon());
  });

  app.post('/api/dictionary/add', (req, res) => {
    const { word, category } = req.body || {};
    if (!word || !category) {
      return res.status(400).json({ success: false, message: 'Word and category (POSITIVE/NEGATIVE) are required' });
    }
    const result = addCustomWord(word, category);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json({ ...result, lexicon: getLexicon() });
  });

  app.post('/api/dictionary/delete', (req, res) => {
    const { word } = req.body || {};
    if (!word) {
      return res.status(400).json({ success: false, message: 'Word is required' });
    }
    const result = deleteCustomWord(word);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json({ ...result, lexicon: getLexicon() });
  });

  // 1. NIFTY 50 Endpoint
  app.get('/api/market/nifty50', async (req, res) => {
    try {
      const data = await getNifty50Data();
      res.json(data);
    } catch (e) {
      console.error('Error in /api/market/nifty50:', e);
      res.status(500).json({ error: 'Failed to fetch NIFTY 50' });
    }
  });

  // 2. Company Search Autocomplete Endpoint
  app.get('/api/company/search', (req, res) => {
    const q = (req.query.q as string || '').trim().toLowerCase();
    if (!q) {
      return res.json(PROMINENT_STOCKS.slice(0, 5));
    }

    const matches = PROMINENT_STOCKS.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.ticker.toLowerCase().includes(q) ||
      s.sector.toLowerCase().includes(q)
    );

    if (matches.length > 0) {
      return res.json(matches);
    }

    // Dynamic fallback search entry
    const uppercaseSymbol = q.toUpperCase();
    const symbolWithNS = uppercaseSymbol.endsWith('.NS') ? uppercaseSymbol : `${uppercaseSymbol}.NS`;
    res.json([
      {
        ticker: symbolWithNS,
        name: `${uppercaseSymbol} Equity`,
        exchange: 'NSE',
        sector: 'General Equity'
      }
    ]);
  });

  // 3. Full Company Research Endpoint
  app.get('/api/company/:ticker/research', async (req, res) => {
    try {
      const ticker = req.params.ticker;
      const companyName = req.query.name as string | undefined;
      const report = await stockService.getStockResearch(ticker, companyName);
      res.json(report);
    } catch (e) {
      console.error('Error in research endpoint:', e);
      res.status(500).json({
        status: 'DATA UNAVAILABLE',
        error: 'Failed to generate research report'
      });
    }
  });

  // 4. Historical Candles Endpoint
  app.get('/api/company/:ticker/history', async (req, res) => {
    try {
      const ticker = req.params.ticker;
      const period = (req.query.period as string) || '3M';
      const candles = await stockService.getHistoricalCandles(ticker, period);
      res.json(candles);
    } catch (e) {
      console.error('Error in history endpoint:', e);
      res.status(500).json({ error: 'Failed to fetch historical candles' });
    }
  });

  // 5. News Endpoint
  app.get('/api/company/:ticker/news', async (req, res) => {
    try {
      const ticker = req.params.ticker;
      const name = (req.query.name as string) || ticker.replace('.NS', '');
      const period = (req.query.period as string) || '7d';
      const { news } = await stockService.getNewsAndNlp(ticker, name, period);
      res.json(news);
    } catch (e) {
      console.error('Error in news endpoint:', e);
      res.status(500).json({ error: 'Failed to fetch news' });
    }
  });

  // 6. NLP Endpoint
  app.get('/api/company/:ticker/nlp', async (req, res) => {
    try {
      const ticker = req.params.ticker;
      const name = (req.query.name as string) || ticker.replace('.NS', '');
      const { nlp } = await stockService.getNewsAndNlp(ticker, name);
      res.json(nlp);
    } catch (e) {
      console.error('Error in nlp endpoint:', e);
      res.status(500).json({ error: 'Failed to fetch NLP metrics' });
    }
  });

  // 6b. Custom News Headline Analysis Endpoint
  app.post('/api/analyze-headline', (req, res) => {
    try {
      const { headline, ticker } = req.body || {};
      if (!headline || typeof headline !== 'string') {
        return res.status(400).json({ error: 'Valid headline string is required' });
      }
      const result = stockService.analyzeHeadline(headline, ticker);
      res.json(result);
    } catch (e) {
      console.error('Error in analyze-headline endpoint:', e);
      res.status(500).json({ error: 'Failed to analyze headline sentiment' });
    }
  });

  // 7. Canonical Screener Endpoint
  app.get('/api/screener', async (req, res) => {
    try {
      const screenerResults = await stockService.getScreenerData();
      res.json(screenerResults);
    } catch (e) {
      console.error('Error in screener endpoint:', e);
      res.status(500).json({ error: 'Failed to fetch screener data' });
    }
  });

  // 8. Admin Audit Endpoint
  app.get('/api/admin/audit/:ticker', async (req, res) => {
    try {
      const ticker = req.params.ticker;
      const report = await stockService.getStockResearch(ticker);
      res.json({
        ticker,
        timestamp: new Date().toISOString(),
        quote: report.quote,
        sources_checked: report.quote?.sources_checked || [],
        consensus_status: report.quote?.consensus_status,
        technical_summary: report.technical,
        fundamentals_summary: report.fundamentals,
        news_summary: report.news,
        nlp_summary: report.nlp,
        ml_summary: report.ml,
        final_research_score: report.final_research_score,
        research_signal: report.research_signal,
        status: report.status
      });
    } catch (e) {
      console.error('Error in audit endpoint:', e);
      res.status(500).json({ error: 'Failed to generate audit report' });
    }
  });

  // 9. Validator Service Endpoint for Global Data Integrity Verification
  app.get('/api/validate/:ticker', async (req, res) => {
    try {
      const ticker = req.params.ticker;
      const summary = await stockService.validateStockData(ticker);
      res.json(summary);
    } catch (e) {
      console.error('Error in validate endpoint:', e);
      res.status(500).json({ error: 'Failed to run validator service on ticker' });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express Stock Market Web Portal Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
