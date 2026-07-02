import axios from 'axios';
import { logger } from '../lib/logger';

const TAVILY_API_KEY = process.env.TAVILY_API_KEY || '';

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

/**
 * Searches the web using the Tavily API.
 * Implements 3 retries with exponential backoff.
 */
export async function searchTavily(
  query: string,
  options: { searchDepth?: 'basic' | 'advanced'; maxResults?: number } = {}
): Promise<TavilySearchResult[]> {
  const startTime = Date.now();
  let retries = 3;
  let delay = 1000;

  if (!TAVILY_API_KEY) {
    logger.warn('[TAVILY] API key is missing. Skipping search.');
    return [];
  }

  while (retries >= 0) {
    try {
      const response = await axios.post(
        'https://api.tavily.com/search',
        {
          api_key: TAVILY_API_KEY,
          query,
          search_depth: options.searchDepth ?? 'basic',
          max_results: options.maxResults ?? 5,
        },
        { timeout: 10000 }
      );

      const results = (response.data?.results || []) as TavilySearchResult[];
      logger.logToolUsage('TavilySearch', query.substring(0, 30), Date.now() - startTime, true);
      return results;
    } catch (error: any) {
      if (retries === 0) {
        logger.error(`[TAVILY] Search failed after 3 retries for query "${query}": ${error.message}`, error);
        logger.logToolUsage('TavilySearch', query.substring(0, 30), Date.now() - startTime, false, error.message);
        return []; // fail gracefully, return empty results
      }
      logger.warn(`[TAVILY] Search failed. Retrying... (${retries} retries left). Error: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      retries--;
      delay *= 2;
    }
  }

  return [];
}
