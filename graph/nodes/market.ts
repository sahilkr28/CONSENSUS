import { ConsensusStateType } from '../state';
import { executeAgentCall } from '../../services/gemini.service';
import { MARKET_SYSTEM_PROMPT } from '../../prompts/market.prompt';
import { MarketAnalystResultSchema } from '../../schemas';
import { wrapInEvidenceTags } from '../../lib/sanitize';
import { logger } from '../../lib/logger';

const defaultResult = {
  industryGrowthRate: 'Growth metrics unavailable.',
  marketPosition: 'Market position analysis failed.',
  competitors: [],
  macroFactors: [],
  confidence: 0.0,
  evidence: [],
};

/**
 * Market Analyst Agent Node.
 * Assesses industry trends, macroeconomic indicators, and competitor profiles.
 */
export async function marketNode(state: ConsensusStateType) {
  const ticker = state.ticker;
  logger.info(`[MARKET_NODE] Running Market Analyst for ${ticker}`);

  const runningEvent = {
    nodeId: 'market',
    status: 'running' as const,
    message: 'Analyzing industry growth, market structure, and macro trends...',
    timestamp: new Date().toISOString(),
  };

  // Coordinator loaded web context in marketReport.marketPosition
  const marketContext = state.marketReport?.marketPosition || 'No search results available.';
  const evidenceBlock = wrapInEvidenceTags(marketContext);

  const { result } = await executeAgentCall(
    'Market Analyst',
    MARKET_SYSTEM_PROMPT,
    `Analyze market and industry position:\n${evidenceBlock}`,
    MarketAnalystResultSchema,
    defaultResult
  );

  const completedEvent = {
    nodeId: 'market',
    status: result.confidence > 0.3 ? ('completed' as const) : ('warning' as const),
    message: `Market positioning completed. Primary position: ${result.marketPosition.substring(0, 40)}...`,
    timestamp: new Date().toISOString(),
  };

  return {
    marketReport: result,
    timeline: [runningEvent, completedEvent],
  };
}
