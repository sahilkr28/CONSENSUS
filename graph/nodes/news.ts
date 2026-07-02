import { ConsensusStateType } from '../state';
import { executeAgentCall } from '../../services/gemini.service';
import { NEWS_SYSTEM_PROMPT } from '../../prompts/news.prompt';
import { NewsAnalystResultSchema } from '../../schemas';
import { wrapInEvidenceTags } from '../../lib/sanitize';
import { logger } from '../../lib/logger';

const defaultResult = {
  overallSentiment: 'neutral' as const,
  sentimentScore: 0,
  summary: 'Insufficient recent news coverage.',
  topArticles: [],
  confidence: 0.0,
  evidence: [],
};

/**
 * News Analyst Agent Node.
 * Assesses recent headlines, classifies sentiment, and highlights public narrative.
 */
export async function newsNode(state: ConsensusStateType) {
  const ticker = state.ticker;
  logger.info(`[NEWS_NODE] Running News Analyst for ${ticker}`);

  const runningEvent = {
    nodeId: 'news',
    status: 'running' as const,
    message: 'Analyzing news sentiment and classifying recent market events...',
    timestamp: new Date().toISOString(),
  };

  // The coordinator node passed news context in newsReport.summary temporarily
  const newsContext = state.newsReport?.summary || 'No articles available.';
  const evidenceBlock = wrapInEvidenceTags(newsContext);

  const { result } = await executeAgentCall(
    'News Analyst',
    NEWS_SYSTEM_PROMPT,
    `Analyze the company news articles:\n${evidenceBlock}`,
    NewsAnalystResultSchema,
    defaultResult
  );

  const completedEvent = {
    nodeId: 'news',
    status: result.confidence > 0.3 ? ('completed' as const) : ('warning' as const),
    message: `News sentiment calculated: ${result.overallSentiment} (${result.sentimentScore}).`,
    timestamp: new Date().toISOString(),
  };

  return {
    newsReport: result,
    timeline: [runningEvent, completedEvent],
  };
}
