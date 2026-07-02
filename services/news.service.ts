import axios from 'axios';
import { logger } from '../lib/logger';
import { getCachedNews, setCachedNews } from './cache.service';
import { searchTavily } from './tavily.service';

const NEWS_API_KEY = process.env.NEWS_API_KEY || '';

export interface NewsArticlePayload {
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
}

/**
 * Fetches recent news articles for a company ticker.
 * Tries NewsAPI first, falls back to Tavily News Search, and uses cache.
 */
export async function getCompanyNews(ticker: string, forceFresh = false): Promise<NewsArticlePayload[]> {
  const symbol = ticker.toUpperCase();
  const startTime = Date.now();

  if (!forceFresh) {
    const cached = await getCachedNews(symbol);
    if (cached) {
      logger.info(`[NEWS] Cache hit for ${symbol}`);
      return cached;
    }
  }

  let articles: NewsArticlePayload[] = [];

  // 1. Try NewsAPI
  if (NEWS_API_KEY) {
    let retries = 3;
    let delay = 1000;
    while (retries >= 0) {
      try {
        const response = await axios.get('https://newsapi.org/v2/everything', {
          params: {
            q: `${symbol} stock OR ${symbol} company`,
            language: 'en',
            sortBy: 'publishedAt',
            pageSize: 10,
            apiKey: NEWS_API_KEY,
          },
          timeout: 8000,
        });

        const rawArticles = response.data?.articles || [];
        articles = rawArticles.map((a: any) => ({
          title: a.title || '',
          description: a.description || '',
          source: a.source?.name || 'NewsAPI',
          url: a.url || '',
          publishedAt: a.publishedAt || new Date().toISOString(),
        }));

        logger.info(`[NEWS] Successfully fetched ${articles.length} articles from NewsAPI for ${symbol}`);
        break; // break retry loop
      } catch (error: any) {
        if (retries === 0) {
          logger.warn(`[NEWS] NewsAPI failed for ${symbol} after retries: ${error.message}. Attempting Tavily fallback.`);
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        retries--;
        delay *= 2;
      }
    }
  } else {
    logger.info(`[NEWS] NEWS_API_KEY is not defined. Using Tavily Search as primary fallback for news.`);
  }

  // 2. Fallback to Tavily Search (standard news queries)
  if (articles.length === 0) {
    try {
      logger.info(`[NEWS] Querying Tavily for news related to ${symbol}`);
      // Tavily query with stock news topic
      const tavilyResults = await searchTavily(`${symbol} stock recent news events market sentiment`, {
        maxResults: 6,
      });

      articles = tavilyResults.map((r) => ({
        title: r.title,
        description: r.content,
        source: new URL(r.url).hostname.replace('www.', ''),
        url: r.url,
        publishedAt: new Date().toISOString(), // Tavily snippets don't always have dates, default to now
      }));
    } catch (tavilyErr: any) {
      logger.error(`[NEWS] Tavily news fallback failed: ${tavilyErr.message}`, tavilyErr);
    }
  }

  // 3. Store in cache
  if (articles.length > 0) {
    await setCachedNews(symbol, articles);
  }

  logger.logToolUsage('GetCompanyNews', symbol, Date.now() - startTime, articles.length > 0);
  return articles;
}
