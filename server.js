const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { parseSearchQuery } = require('./regex-parser');
const { buildUrl } = require('./url-builder');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// AI Parser route
app.post('/api/parse-search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query je povinný' });
    }

    const parsedParams = await parseSearchQuery(query);
    const finalUrl = buildUrl(parsedParams);
    
    res.json({
      originalQuery: query,
      parsedParams,
      url: finalUrl
    });
    
  } catch (error) {
    console.error('Error parsing search:', error);
    res.status(500).json({ error: 'Chyba při zpracování dotazu: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server běží na portu ${PORT}`);
});