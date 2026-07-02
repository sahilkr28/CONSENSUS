import YahooFinance from 'yahoo-finance2';
import { CompanyInfo, FinancialMetrics } from '../types';
import { logger } from '../lib/logger';
import { getCachedFinancials, setCachedFinancials } from './cache.service';

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey', 'ripHistorical'] });

export interface YahooSearchMatch {
  symbol: string;
  name: string;
  exchDisp: string;
  sector?: string;
  industry?: string;
}

const COUNTRY_SUFFIX_MAP: Record<string, string[]> = {
  US: [],
  GB: ['.L'],
  CA: ['.TO', '.V'],
  IN: ['.NS', '.BO'],
  AU: ['.AX'],
  DE: ['.DE', '.F'],
  FR: ['.PA'],
  JP: ['.T'],
  CN: ['.SS', '.SZ'],
  BR: ['.SA'],
  NL: ['.AS'],
  SG: ['.SI'],
  CH: ['.SW', '.S'],
  HK: ['.HK'],
};

/**
 * Searches for a ticker query, filtering strictly for EQUITY quoteType to reject ETFs, mutual funds, and indices.
 * Supports international equities and filters them based on selected country codes.
 */
export async function searchSymbols(query: string, country?: string): Promise<YahooSearchMatch[]> {
  const startTime = Date.now();
  try {
    const response = await yf.search(query);
    
    // Filter quotes to include only operating equities.
    let equities = (response.quotes || []).filter(
      (q: any) => q.quoteType?.toUpperCase() === 'EQUITY' && q.symbol
    );

    // Apply country suffix filtering if specified and not ALL
    if (country && country !== 'ALL') {
      const selected = country.toUpperCase();
      const suffixes = COUNTRY_SUFFIX_MAP[selected] || [];
      if (selected === 'US') {
        // US Equities typically don't have suffix dots in Yahoo Search
        equities = equities.filter((q: any) => !q.symbol.includes('.'));
      } else {
        // Filter by suffix matches
        equities = equities.filter((q: any) => 
          suffixes.some((suffix) => q.symbol.endsWith(suffix))
        );
      }
    }

    const matches = equities.map((q: any) => ({
      symbol: q.symbol,
      name: q.longname || q.shortname || q.symbol,
      exchDisp: q.exchDisp || q.exchange,
      sector: q.sector,
      industry: q.industry,
    }));

    logger.logToolUsage('YahooSearch', query, Date.now() - startTime, true);
    return matches;
  } catch (error: any) {
    logger.error(`[YAHOO] Search failed for query "${query}": ${error.message}`, error);
    logger.logToolUsage('YahooSearch', query, Date.now() - startTime, false, error.message);
    return [];
  }
}

export interface YahooMetricsPayload {
  companyInfo: CompanyInfo;
  financialMetrics: FinancialMetrics;
  rawTextContext: string; // Wrapped context for prompts
}

/**
 * Fetches all core metrics, summary details, and statements for a given ticker.
 * Implements local and Redis caching.
 */
export async function getCompanyDetails(ticker: string, forceFresh = false): Promise<YahooMetricsPayload> {
  const symbol = ticker.toUpperCase();
  const startTime = Date.now();

  if (!forceFresh) {
    const cached = await getCachedFinancials(symbol);
    if (cached) {
      logger.info(`[YAHOO] Financials cache hit for ${symbol}`);
      return cached;
    }
  }

  logger.info(`[YAHOO] Financials cache miss. Querying Yahoo Finance API for: ${symbol}`);

  let quote: any = null;
  let summary: any = null;
  let detailsRetries = 3;
  let detailsDelay = 800;

  try {
    while (detailsRetries > 0) {
      try {
        // 1. Fetch Quote
        quote = await yf.quote(symbol);
        if (!quote || quote.quoteType !== 'EQUITY') {
          throw new Error(`Symbol ${symbol} is not a valid operating equity.`);
        }

        // 2. Fetch Summary
        summary = await yf.quoteSummary(symbol, {
          modules: ['summaryDetail', 'financialData', 'defaultKeyStatistics', 'assetProfile'],
        });
        break;
      } catch (err: any) {
        detailsRetries--;
        if (detailsRetries === 0) {
          throw err;
        }
        logger.warn(`[YAHOO] Details fetch attempt failed for ${symbol}. Retrying... (${detailsRetries} retries left). Error: ${err.message}`);
        await new Promise((resolve) => setTimeout(resolve, detailsDelay));
        detailsDelay *= 2;
      }
    }

    const assetProfile = (summary.assetProfile || {}) as any;
    const financialData = (summary.financialData || {}) as any;
    const summaryDetail = (summary.summaryDetail || {}) as any;
    const defaultKeyStats = (summary.defaultKeyStatistics || {}) as any;

    const companyInfo: CompanyInfo = {
      name: quote.longName || quote.shortName || symbol,
      ticker: symbol,
      sector: assetProfile.sector,
      industry: assetProfile.industry,
      longBusinessSummary: assetProfile.longBusinessSummary,
      website: assetProfile.website || '',
      marketCap: quote.marketCap || summaryDetail.marketCap,
      currentPrice: quote.regularMarketPrice || financialData.currentPrice,
      dividendYield: quote.dividendYield || summaryDetail.dividendYield,
      peRatio: quote.trailingPE || summaryDetail.trailingPE,
      eps: quote.trailingEps || defaultKeyStats.trailingEps,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || summaryDetail.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow || summaryDetail.fiftyTwoWeekLow,
      city: assetProfile.city,
      state: assetProfile.state,
      country: assetProfile.country,
    };

    const financialMetrics: FinancialMetrics = {
      revenueGrowth: financialData.revenueGrowth?.raw || financialData.revenueGrowth,
      profitMargin: financialData.profitMargins?.raw || financialData.profitMargins,
      debtToEquity: financialData.debtToEquity?.raw || financialData.debtToEquity,
      freeCashFlow: financialData.freeCashflow?.raw || financialData.freeCashflow,
      operatingMargin: financialData.operatingMargins?.raw || financialData.operatingMargins,
      returnOnEquity: financialData.returnOnEquity?.raw || financialData.returnOnEquity,
      quickRatio: financialData.quickRatio?.raw || financialData.quickRatio,
      currentRatio: financialData.currentRatio?.raw || financialData.currentRatio,
    };

    // Construct raw text block of financial statistics to be fed directly to analyst LLMs
    const rawTextContext = `
Ticker: ${symbol}
Company Name: ${companyInfo.name}
Sector: ${companyInfo.sector || 'N/A'}
Industry: ${companyInfo.industry || 'N/A'}
Headquarters: ${[companyInfo.city, companyInfo.state, companyInfo.country].filter(Boolean).join(', ') || 'N/A'}
Market Cap: $${(companyInfo.marketCap ? (companyInfo.marketCap / 1e9).toFixed(2) + 'B' : 'N/A')}
Current Price: $${companyInfo.currentPrice || 'N/A'}
Trailing PE Ratio: ${companyInfo.peRatio || 'N/A'}
Earnings Per Share (EPS): ${companyInfo.eps || 'N/A'}
Dividend Yield: ${(companyInfo.dividendYield ? (companyInfo.dividendYield * 100).toFixed(2) + '%' : 'N/A')}
52-Week Range: $${companyInfo.fiftyTwoWeekLow || 'N/A'} - $${companyInfo.fiftyTwoWeekHigh || 'N/A'}

--- Key Balance Sheet & Cash Flow Ratios ---
Revenue Growth (YoY): ${(financialMetrics.revenueGrowth ? (financialMetrics.revenueGrowth * 100).toFixed(2) + '%' : 'N/A')}
Operating Profit Margin: ${(financialMetrics.operatingMargin ? (financialMetrics.operatingMargin * 100).toFixed(2) + '%' : 'N/A')}
Net Profit Margin: ${(financialMetrics.profitMargin ? (financialMetrics.profitMargin * 100).toFixed(2) + '%' : 'N/A')}
Return on Equity (ROE): ${(financialMetrics.returnOnEquity ? (financialMetrics.returnOnEquity * 100).toFixed(2) + '%' : 'N/A')}
Debt-to-Equity Ratio: ${financialMetrics.debtToEquity || 'N/A'}
Current Ratio: ${financialMetrics.currentRatio || 'N/A'}
Quick Ratio: ${financialMetrics.quickRatio || 'N/A'}
Free Cash Flow: $${(financialMetrics.freeCashFlow ? (financialMetrics.freeCashFlow / 1e6).toFixed(2) + 'M' : 'N/A')}
`;

    const payload: YahooMetricsPayload = {
      companyInfo,
      financialMetrics,
      rawTextContext,
    };

    await setCachedFinancials(symbol, payload);
    logger.logToolUsage('YahooDetails', symbol, Date.now() - startTime, true);
    
    return payload;
  } catch (error: any) {
    logger.error(`[YAHOO] Failed to fetch details for ${symbol}: ${error.message}`, error);
    logger.logToolUsage('YahooDetails', symbol, Date.now() - startTime, false, error.message);
    throw error;
  }
}

export interface HistoricalPrice {
  date: string;
  close: number;
  open?: number;
  high?: number;
  low?: number;
  volume?: number;
}

/**
 * Fetches chart points for rendering stock performance graphs.
 */
export async function getCompanyChart(ticker: string, periodDays = 180): Promise<HistoricalPrice[]> {
  const symbol = ticker.toUpperCase();
  const startTime = Date.now();
  
  const today = new Date();
  const startDate = new Date();
  startDate.setDate(today.getDate() - periodDays);

  try {
    const result = await yf.chart(symbol, {
      period1: startDate.toISOString().split('T')[0],
      period2: today.toISOString().split('T')[0],
      interval: '1d',
    });

    const quotes = result.quotes || [];
    const chartData = quotes
      .filter((q: any) => q.date && q.close !== undefined && q.close !== null)
      .map((q: any) => ({
        date: new Date(q.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
        close: Number(q.close.toFixed(2)),
        open: q.open ? Number(q.open.toFixed(2)) : undefined,
        high: q.high ? Number(q.high.toFixed(2)) : undefined,
        low: q.low ? Number(q.low.toFixed(2)) : undefined,
        volume: q.volume || undefined,
      }));

    logger.logToolUsage('YahooChart', symbol, Date.now() - startTime, true);
    return chartData;
  } catch (error: any) {
    logger.error(`[YAHOO] Failed to fetch chart data for ${symbol}: ${error.message}`, error);
    logger.logToolUsage('YahooChart', symbol, Date.now() - startTime, false, error.message);
    return [];
  }
}
