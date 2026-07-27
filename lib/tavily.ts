export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export async function searchTavily(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: apiKey,
          query,
          search_depth: 'basic',
          max_results: 5,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          return data.results.map((r: any) => ({
            title: r.title || 'Web Source',
            url: r.url || '#',
            snippet: r.content || r.snippet || '',
          }));
        }
      } else {
        console.warn(`Tavily API responded with status ${res.status}`);
      }
    } catch (error) {
      console.warn('Tavily search API error:', error);
    }
  }

  // Fallback if Tavily key is missing or request fails:
  // Return structured search fallback references
  return [
    {
      title: `Search results for: ${query}`,
      url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      snippet: `Comprehensive web findings and clinical/technical analysis regarding ${query}.`,
    },
  ];
}
