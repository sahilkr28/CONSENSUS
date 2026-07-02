import { ConsensusStateType } from '../state';
import { getCompanyDetails } from '../../services/yahoo.service';
import { getCompanyNews } from '../../services/news.service';
import { searchTavily } from '../../services/tavily.service';
import { logger } from '../../lib/logger';

/**
 * Research Coordinator Node.
 * Orchestrates external data collection: fetches financial stats, news summaries, and general web context.
 */
export async function coordinatorNode(state: ConsensusStateType) {
  const ticker = state.ticker;
  const companyName = state.companyName;

  if (!ticker || ticker === 'UNKNOWN') {
    throw new Error('Research Coordinator aborted: Ticker is unknown.');
  }

  const runningEvent = {
    nodeId: 'coordinator',
    status: 'running' as const,
    message: `Coordinating research APIs and collecting market datasets for $${ticker}...`,
    timestamp: new Date().toISOString(),
  };

  logger.info(`[COORDINATOR_NODE] Fetching data for ${ticker}`);

  let companyInfo = state.companyInfo || { name: companyName, ticker };
  let metrics = state.financialMetrics || {};
  let newsList: any[] = [];
  let marketWebContext = '';
  let status: 'completed' | 'warning' | 'failed' = 'completed';
  let message = `Successfully collected financials, news, and market intelligence for $${ticker}.`;

  try {
    // 1. Fetch financials & company stats
    const details = await getCompanyDetails(ticker);
    companyInfo = details.companyInfo;
    metrics = details.financialMetrics;

    // 2. Fetch news
    newsList = await getCompanyNews(ticker);

    // 3. Gather general business & market intelligence via Tavily
    const locationParts = [companyInfo.city, companyInfo.state, companyInfo.country].filter(Boolean);
    const locationString = locationParts.join(', ');
    const locationContext = locationString ? ` headquarter based in ${locationString}` : '';

    const searchResults = await searchTavily(`${companyName} (${ticker})${locationContext} business model competitors market trends economic moat`);
    marketWebContext = searchResults
      .map((r) => `Source: ${r.title}\nUrl: ${r.url}\nContent: ${r.content}\n---`)
      .join('\n');

  } catch (err: any) {
    logger.error(`[COORDINATOR_NODE] Error collecting datasets for ${ticker}: ${err.message}`, err);
    status = 'warning';
    message = `Partial dataset collected for $${ticker}. Some service calls timed out.`;
  }

  const completedEvent = {
    nodeId: 'coordinator',
    status,
    message,
    timestamp: new Date().toISOString(),
  };

  // Convert newsList into an evidence format for newsNode
  const newsContext = newsList
    .map((a) => `Title: ${a.title}\nSource: ${a.source}\nDescription: ${a.description}\nUrl: ${a.url}\n---`)
    .join('\n');

  // Let's store raw web search results inside state.errors or create temporary state keys?
  // We can attach the raw fetched data to the node return.
  // The downstream nodes will look at the consolidated state keys.
  // Wait, let's save the raw data in state context.
  // How do downstream nodes get it? We can store the news raw context in newsReport, financials raw context in financialMetrics, and web search results in marketReport.
  // This is clean!
  return {
    companyInfo,
    financialMetrics: metrics,
    // Store temporarily in state so analysts can access:
    // We will return them as part of state updates.
    newsReport: {
      overallSentiment: 'neutral' as const,
      sentimentScore: 0,
      summary: newsContext, // Temporary carrier for raw news text
      topArticles: newsList,
      confidence: 1.0,
      evidence: []
    },
    marketReport: {
      marketPosition: marketWebContext, // Temporary carrier for raw market search text
      competitors: [],
      macroFactors: [],
      confidence: 1.0,
      evidence: []
    },
    timeline: [runningEvent, completedEvent],
  };
}
