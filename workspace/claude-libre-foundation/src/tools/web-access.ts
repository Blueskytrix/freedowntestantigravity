// Web search using SerpAPI
export async function webSearch(input: { query: string; num_results?: number }): Promise<string> {
  const SERPAPI_KEY = process.env.SERPAPI_KEY;
  
  if (!SERPAPI_KEY || SERPAPI_KEY === 'your-serpapi-key-here') {
    throw new Error('SERPAPI_KEY not configured. Get one at https://serpapi.com/');
  }
  
  try {
    const numResults = input.num_results || 5;
    const url = `https://serpapi.com/search?q=${encodeURIComponent(input.query)}&api_key=${SERPAPI_KEY}&num=${numResults}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.organic_results || data.organic_results.length === 0) {
      return `No results found for: ${input.query}`;
    }
    
    const results = data.organic_results.slice(0, numResults).map((result: any, idx: number) => {
      return `${idx + 1}. ${result.title}\n   ${result.link}\n   ${result.snippet || 'No description available'}`;
    });
    
    return results.join('\n\n');
  } catch (error) {
    throw new Error(`Web search failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// GitHub code search
export async function webCodeSearch(input: { 
  query: string; 
  language?: string;
  num_results?: number;
}): Promise<string> {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  
  if (!GITHUB_TOKEN || GITHUB_TOKEN === 'ghp_your-github-token-here') {
    throw new Error('GITHUB_TOKEN not configured. Get one at https://github.com/settings/tokens');
  }
  
  try {
    let searchQuery = input.query;
    if (input.language) {
      searchQuery += `+language:${input.language}`;
    }
    
    const url = `https://api.github.com/search/code?q=${encodeURIComponent(searchQuery)}&per_page=${input.num_results || 5}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`GitHub API error: ${response.status} - ${errorData.message || response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
      return `No code results found for: ${input.query}`;
    }
    
    const results = data.items.map((item: any, idx: number) => {
      return `${idx + 1}. ${item.repository.full_name}/${item.path}\n   ${item.html_url}\n   Repository: ${item.repository.html_url}`;
    });
    
    return `Found ${data.total_count} results (showing ${results.length}):\n\n${results.join('\n\n')}`;
  } catch (error) {
    throw new Error(`Code search failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Tool definitions for Anthropic
export const webAccessTools = [
  {
    name: 'web_search',
    description: 'Search the web using Google Search via SerpAPI. Returns titles, URLs, and snippets.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query'
        },
        num_results: {
          type: 'number',
          description: 'Number of results to return (default: 5, max: 10)'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'web_code_search',
    description: 'Search for code on GitHub. Useful for finding code examples, libraries, and implementations.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Code search query (e.g., "react useEffect cleanup", "python async await")'
        },
        language: {
          type: 'string',
          description: 'Optional programming language filter (e.g., "typescript", "python", "javascript")'
        },
        num_results: {
          type: 'number',
          description: 'Number of results to return (default: 5)'
        }
      },
      required: ['query']
    }
  }
];
