import { ConsensusStateType } from '../state';
import { executeAgentCall } from '../../services/gemini.service';
import { FINANCIAL_SYSTEM_PROMPT } from '../../prompts/financial.prompt';
import { FinancialAnalystResultSchema } from '../../schemas';
import { getCompanyDetails } from '../../services/yahoo.service';
import { wrapInEvidenceTags } from '../../lib/sanitize';
import { logger } from '../../lib/logger';

const defaultResult = {
  healthScore: 50,
  strengths: ['Insufficient financial data.'],
  weaknesses: ['Failed to analyze financials.'],
  observations: ['Observation unavailable.'],
  confidence: 0.0,
  evidence: [],
};

/**
 * Financial Analyst Agent Node.
 * Evaluates core income statement, cash flow, balance sheet ratios, and margin growth.
 */
export async function financialNode(state: ConsensusStateType) {
  const ticker = state.ticker;
  logger.info(`[FINANCIAL_NODE] Running Financial Analyst for ${ticker}`);

  const runningEvent = {
    nodeId: 'financial',
    status: 'running' as const,
    message: 'Analyzing balance sheets, profit margins, and valuation ratios...',
    timestamp: new Date().toISOString(),
  };

  // Re-fetch or fetch details from service if state carrier text is missing
  let rawFinancials = '';
  try {
    const details = await getCompanyDetails(ticker);
    rawFinancials = details.rawTextContext;
  } catch (err: any) {
    logger.warn(`[FINANCIAL_NODE] Failed to get financials text from state, using backup. Error: ${err.message}`);
    rawFinancials = `Company Ticker: ${ticker}. Metrics missing due to service errors.`;
  }

  // Wrap content inside strict evidence tags
  const evidenceBlock = wrapInEvidenceTags(rawFinancials);

  const { result } = await executeAgentCall(
    'Financial Analyst',
    FINANCIAL_SYSTEM_PROMPT,
    `Analyze the company financial profile:\n${evidenceBlock}`,
    FinancialAnalystResultSchema,
    defaultResult
  );

  const completedEvent = {
    nodeId: 'financial',
    status: result.confidence > 0.3 ? ('completed' as const) : ('warning' as const),
    message: `Financial Health Score generated: ${result.healthScore}/100.`,
    timestamp: new Date().toISOString(),
  };

  return {
    financialReport: result,
    timeline: [runningEvent, completedEvent],
  };
}
