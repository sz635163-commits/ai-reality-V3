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

  // Handle API routes
  if (req.url === '/api/parse-search' && req.method === 'POST') {
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
    return;
  }

  // Serve static files for other routes
  if (req.method === 'GET') {
    // Default to serving index.html for all other routes
    res.setHeader('Content-Type', 'text/html');
    
    // Simple HTML page
    const html = `
<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RealityCechy AI Search V3</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        
        .title {
            text-align: center;
            color: #2c3e50;
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        
        .subtitle {
            text-align: center;
            color: #27ae60;
            margin-bottom: 30px;
            font-size: 1.2em;
            font-weight: bold;
        }
        
        .search-box {
            margin-bottom: 30px;
        }
        
        #searchInput {
            width: 100%;
            padding: 15px;
            font-size: 16px;
            border: 2px solid #ddd;
            border-radius: 8px;
            margin-bottom: 15px;
            box-sizing: border-box;
        }
        
        #searchInput:focus {
            border-color: #667eea;
            outline: none;
        }
        
        .search-button {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            margin-bottom: 10px;
        }
        
        .search-button:hover {
            background: linear-gradient(135deg, #5a6fd8, #6a4190);
        }
        
        .result {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
            border-left: 4px solid #27ae60;
        }
        
        .url-preview {
            background: #e8f5e8;
            padding: 15px;
            border-radius: 5px;
            word-break: break-all;
            font-family: monospace;
            margin: 10px 0;
        }
        
        .redirect-button {
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            margin-top: 10px;
        }
        
        .redirect-button:hover {
            background: linear-gradient(135deg, #218838, #1ea085);
        }
        
        .examples {
            background: #e3f2fd;
            padding: 20px;
            border-radius: 10px;
            margin-top: 30px;
        }
        
        .examples h3 {
            color: #1976d2;
            margin-top: 0;
        }
        
        .example-item {
            background: white;
            padding: 10px;
            margin: 8px 0;
            border-radius: 5px;
            cursor: pointer;
            border: 1px solid #ddd;
        }
        
        .example-item:hover {
            background: #f5f5f5;
        }
        
        .version-badge {
            background: #27ae60;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            display: inline-block;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="version-badge">V3 - Regex Parser</div>
        <h1 class="title">🏠 RealityCechy AI Search</h1>
        <p class="subtitle">✅ 100% úspěšnost • ⚡ Bez API • 🎯 Deterministický</p>
        
        <div class="search-box">
            <input type="text" id="searchInput" placeholder="Např: 2+kk byt v Praze do 6 milionů" />
            <button class="search-button" onclick="searchProperties()">🔍 Vygenerovat odkaz</button>
        </div>
        
        <div id="result" style="display: none;" class="result">
            <h3>✅ Odkaz vygenerován:</h3>
            <div id="urlPreview" class="url-preview"></div>
            <a id="redirectLink" class="redirect-button" target="_blank">📱 Otevřít na RealityCechy.cz</a>
        </div>
        
        <div class="examples">
            <h3>💡 Příklady dotazů:</h3>
            <div class="example-item" onclick="setExample('2+kk byt v Praze do 6 milionů')">
                "2+kk byt v Praze do 6 milionů"
            </div>
            <div class="example-item" onclick="setExample('pronájem 3+1 Brno s balkonem')">
                "pronájem 3+1 Brno s balkonem"  
            </div>
            <div class="example-item" onclick="setExample('garáž Praha do 500 tisíc')">
                "garáž Praha do 500 tisíc"
            </div>
            <div class="example-item" onclick="setExample('rodinný dům Ostrava se zahradou')">
                "rodinný dům Ostrava se zahradou"
            </div>
            <div class="example-item" onclick="setExample('stavební pozemek Praha 500 m2')">
                "stavební pozemek Praha 500 m2"
            </div>
        </div>
    </div>

    <script>
        function setExample(text) {
            document.getElementById('searchInput').value = text;
        }
        
        async function searchProperties() {
            const query = document.getElementById('searchInput').value;
            
            if (!query.trim()) {
                alert('Prosím zadejte vyhledávací dotaz');
                return;
            }
            
            try {
                const response = await fetch('/api/parse-search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query: query.trim() })
                });
                
                if (!response.ok) {
                    throw new Error('Chyba při zpracování dotazu');
                }
                
                const data = await response.json();
                
                // Show result
                document.getElementById('urlPreview').textContent = data.url;
                document.getElementById('redirectLink').href = data.url;
                document.getElementById('result').style.display = 'block';
                
            } catch (error) {
                console.error('Error:', error);
                alert('Chyba při vygenerování odkazu: ' + error.message);
            }
        }
        
        // Allow Enter key to trigger search
        document.getElementById('searchInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProperties();
            }
        });
    </script>
</body>
</html>`;
    
    res.send(html);
    return;
  }

  // Default 404 for other methods
  res.status(404).json({ error: 'Not found' });
};