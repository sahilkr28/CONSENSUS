import { ConsensusStateType } from '../state';
import { executeAgentCall } from '../../services/gemini.service';
import { RISK_SYSTEM_PROMPT } from '../../prompts/risk.prompt';
import { RiskAnalystResultSchema } from '../../schemas';
import { wrapInEvidenceTags } from '../../lib/sanitize';
import { logger } from '../../lib/logger';

const defaultResult = {
  risks: [
    {
      category: 'Business' as const,
      severity: 'Low' as const,
      likelihood: 'Low' as const,
      description: 'No significant risks identified in current evidence.',
      evidenceId: 'ev-1',
    },
  ],
  overallRiskScore: 20,
  confidence: 0.1,
};

/**
 * Risk Analyst Agent Node.
 * Categorizes and rates potential risks, relying strictly on collected evidence.
 */
export async function riskNode(state: ConsensusStateType) {
  const ticker = state.ticker;
  logger.info(`[RISK_NODE] Running Risk Analyst for ${ticker}`);

  const runningEvent = {
    nodeId: 'risk',
    status: 'running' as const,
    message: 'Evaluating operational, financial, and regulatory risk heatmaps...',
    timestamp: new Date().toISOString(),
  };

  const evidenceListText = (state.evidenceCollected || [])
    .map((e) => `ID: ${e.id} | Category: ${e.category} | Citation: ${e.source} | Fact: ${e.text}`)
    .join('\n');

  const evidenceBlock = wrapInEvidenceTags(evidenceListText);

  const { result } = await executeAgentCall(
    'Risk Analyst',
    RISK_SYSTEM_PROMPT,
    `Below is the entire collected evidence. Classify the risks:\n${evidenceBlock}`,
    RiskAnalystResultSchema,
    defaultResult
  );

  const completedEvent = {
    nodeId: 'risk',
    status: result.confidence > 0.3 ? ('completed' as const) : ('warning' as const),
    message: `Risk profile completed. Overall Risk Score: ${result.overallRiskScore}/100.`,
    timestamp: new Date().toISOString(),
  };

  return {
    riskReport: result,
    timeline: [runningEvent, completedEvent],
  };
}
