import { ConsensusStateType } from '../state';
import { executeAgentCall } from '../../services/gemini.service';
import { BUSINESS_SYSTEM_PROMPT } from '../../prompts/business.prompt';
import { BusinessAnalystResultSchema } from '../../schemas';
import { wrapInEvidenceTags } from '../../lib/sanitize';
import { logger } from '../../lib/logger';

const defaultResult = {
  moatRating: 'None' as const,
  moatDescription: 'Insufficient business model data.',
  strengths: [],
  weaknesses: [],
  revenueStreams: [],
  customerBase: 'Unknown',
  confidence: 0.0,
  evidence: [],
};

/**
 * Business Analyst Agent Node.
 * Assesses company moat, products, competitive position, and revenue structure.
 */
export async function businessNode(state: ConsensusStateType) {
  const ticker = state.ticker;
  logger.info(`[BUSINESS_NODE] Running Business Analyst for ${ticker}`);

  const runningEvent = {
    nodeId: 'business',
    status: 'running' as const,
    message: 'Evaluating business model, core products, and economic moat...',
    timestamp: new Date().toISOString(),
  };

  const companySummary = state.companyInfo?.longBusinessSummary || 'Long business summary is unavailable.';
  const marketIntelligence = state.marketReport?.marketPosition || 'Web search metrics are unavailable.';

  const inputContext = `
Company Name: ${state.companyName}
Ticker: ${ticker}
Company Description:
${companySummary}

Market Search Data:
${marketIntelligence}
`;

  const evidenceBlock = wrapInEvidenceTags(inputContext);

  const { result } = await executeAgentCall(
    'Business Analyst',
    BUSINESS_SYSTEM_PROMPT,
    `Analyze the company business model and competitive moat:\n${evidenceBlock}`,
    BusinessAnalystResultSchema,
    defaultResult
  );

  const completedEvent = {
    nodeId: 'business',
    status: result.confidence > 0.3 ? ('completed' as const) : ('warning' as const),
    message: `Business assessment completed. Moat Rating: ${result.moatRating}.`,
    timestamp: new Date().toISOString(),
  };

  return {
    businessReport: result,
    timeline: [runningEvent, completedEvent],
  };
}
