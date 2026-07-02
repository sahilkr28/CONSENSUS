import { ConsensusStateType } from '../state';
import { executeAgentCall } from '../../services/gemini.service';
import { PLANNER_SYSTEM_PROMPT } from '../../prompts/planner.prompt';
import { PlannerResultSchema } from '../../schemas';
import { logger } from '../../lib/logger';

const fallbackPlan = {
  company: '',
  ticker: '',
  requiredTools: ['yahoo_finance_financials', 'news_search'],
  executionPlan: 'Failed to generate plan. Running default financial research.',
  expectedDeliverables: ['Financial analysis report', 'Consensus score'],
};

/**
 * Planner Agent Node.
 * Maps the user query into an execution plan and updates the graph timeline.
 */
export async function plannerNode(state: ConsensusStateType) {
  const startTime = Date.now();
  const query = state.query || state.companyName || state.ticker;

  logger.info(`[PLANNER_NODE] Executing planner for query: "${query}"`);

  // Log running event
  const runningEvent = {
    nodeId: 'planner',
    status: 'running' as const,
    message: `Analyzing research query: "${query}"...`,
    timestamp: new Date().toISOString(),
  };

  const { result } = await executeAgentCall(
    'Planner Agent',
    PLANNER_SYSTEM_PROMPT,
    `Analyze query: "${query}" and build the research plan.`,
    PlannerResultSchema,
    fallbackPlan
  );

  const completedEvent = {
    nodeId: 'planner',
    status: 'completed' as const,
    message: `Execution plan mapped for ${result.company || query}.`,
    timestamp: new Date().toISOString(),
  };

  return {
    companyName: result.company || state.companyName || query,
    ticker: result.ticker || state.ticker,
    timeline: [runningEvent, completedEvent],
  };
}
