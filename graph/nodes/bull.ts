import { ConsensusStateType } from '../state';
import { executeAgentCall } from '../../services/gemini.service';
import { BULL_SYSTEM_PROMPT } from '../../prompts/bull.prompt';
import { DebateResultSchema } from '../../schemas';
import { wrapInEvidenceTags } from '../../lib/sanitize';
import { logger } from '../../lib/logger';

const defaultResult = {
  arguments: [
    {
      claim: 'Insufficient evidence to form a robust positive investment case.',
      evidenceId: 'ev-1',
      reasoning: 'The research metrics gathered do not offer high-confidence bullish factors.',
    },
  ],
  confidence: 0.1,
};

/**
 * Bull Analyst Agent Node.
 * Builds the strongest positive case FOR investing, relying strictly on collected evidence.
 */
export async function bullNode(state: ConsensusStateType) {
  const ticker = state.ticker;
  logger.info(`[BULL_NODE] Running Bull Analyst for ${ticker}`);

  const runningEvent = {
    nodeId: 'bull',
    status: 'running' as const,
    message: 'Constructing evidence-backed bull thesis arguments...',
    timestamp: new Date().toISOString(),
  };

  // Convert evidence collected into strict text context
  const evidenceListText = (state.evidenceCollected || [])
    .map((e) => `ID: ${e.id} | Category: ${e.category} | Citation: ${e.source} | Fact: ${e.text}`)
    .join('\n');

  const evidenceBlock = wrapInEvidenceTags(evidenceListText);

  const { result } = await executeAgentCall(
    'Bull Analyst',
    BULL_SYSTEM_PROMPT,
    `Below is the entire collected evidence. Construct the Bull Thesis:\n${evidenceBlock}`,
    DebateResultSchema,
    defaultResult
  );

  const completedEvent = {
    nodeId: 'bull',
    status: result.confidence > 0.3 ? ('completed' as const) : ('warning' as const),
    message: `Bull case generated with ${result.arguments.length} arguments.`,
    timestamp: new Date().toISOString(),
  };

  return {
    bullCase: result,
    timeline: [runningEvent, completedEvent],
  };
}
