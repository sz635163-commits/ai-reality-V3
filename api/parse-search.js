const { parseSearchQuery } = require('../regex-parser');
const { buildUrl } = require('../url-builder');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query je povinný' });
    }

    const parsedParams = parseSearchQuery(query);
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
};