import { ConsensusStateType } from '../state';
import { executeAgentCall } from '../../services/gemini.service';
import { BEAR_SYSTEM_PROMPT } from '../../prompts/bear.prompt';
import { DebateResultSchema } from '../../schemas';
import { wrapInEvidenceTags } from '../../lib/sanitize';
import { logger } from '../../lib/logger';

const defaultResult = {
  arguments: [
    {
      claim: 'Insufficient evidence to form a robust negative investment case.',
      evidenceId: 'ev-1',
      reasoning: 'The research metrics gathered do not offer high-confidence bearish factors.',
    },
  ],
  confidence: 0.1,
};

/**
 * Bear Analyst Agent Node.
 * Builds the strongest bear case AGAINST investing, relying strictly on collected evidence.
 */
export async function bearNode(state: ConsensusStateType) {
  const ticker = state.ticker;
  logger.info(`[BEAR_NODE] Running Bear Analyst for ${ticker}`);

  const runningEvent = {
    nodeId: 'bear',
    status: 'running' as const,
    message: 'Constructing evidence-backed bear thesis arguments...',
    timestamp: new Date().toISOString(),
  };

  const evidenceListText = (state.evidenceCollected || [])
    .map((e) => `ID: ${e.id} | Category: ${e.category} | Citation: ${e.source} | Fact: ${e.text}`)
    .join('\n');

  const evidenceBlock = wrapInEvidenceTags(evidenceListText);

  const { result } = await executeAgentCall(
    'Bear Analyst',
    BEAR_SYSTEM_PROMPT,
    `Below is the entire collected evidence. Construct the Bear Thesis:\n${evidenceBlock}`,
    DebateResultSchema,
    defaultResult
  );

  const completedEvent = {
    nodeId: 'bear',
    status: result.confidence > 0.3 ? ('completed' as const) : ('warning' as const),
    message: `Bear case generated with ${result.arguments.length} arguments.`,
    timestamp: new Date().toISOString(),
  };

  return {
    bearCase: result,
    timeline: [runningEvent, completedEvent],
  };
}
