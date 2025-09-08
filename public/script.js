let currentSearchUrl = '';

async function searchProperties() {
    const query = document.getElementById('searchInput').value.trim();
    
    if (!query) {
        alert('Prosím zadejte vyhledávací dotaz');
        return;
    }

    try {
        const response = await fetch('/api/parse-search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Chyba při vyhledávání');
        }

        displayResults(result);
        
    } catch (error) {
        console.error('Search error:', error);
        alert('Chyba: ' + error.message);
    }
}

function displayResults(result) {
    const resultsDiv = document.getElementById('results');
    const parsedParamsDiv = document.getElementById('parsedParams');
    const urlPreviewDiv = document.getElementById('urlPreview');
    
    // Display parsed parameters
    parsedParamsDiv.innerHTML = `
        <strong>Původní dotaz:</strong> ${result.originalQuery}<br>
        <strong>Parsed parametry:</strong>
        <pre>${JSON.stringify(result.parsedParams, null, 2)}</pre>
    `;
    
    // Display URL preview
    urlPreviewDiv.textContent = result.url;
    currentSearchUrl = result.url;
    
    // Show results
    resultsDiv.style.display = 'block';
}

function redirectToSearch() {
    if (currentSearchUrl) {
        window.open(currentSearchUrl, '_blank');
    }
}

// Allow Enter key to search
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchProperties();
    }
});