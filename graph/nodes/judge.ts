import { ConsensusStateType } from '../state';
import { executeAgentCall } from '../../services/gemini.service';
import { JUDGE_SYSTEM_PROMPT } from '../../prompts/judge.prompt';
import { JudgeResultSchema } from '../../schemas';
import { wrapInEvidenceTags } from '../../lib/sanitize';
import { logger } from '../../lib/logger';

const defaultResult = {
  recommendation: 'HOLD' as const,
  confidence: 0.5,
  summary: 'Research committee generated a neutral fallback verdict.',
  reasoning: 'The evaluation process encountered missing or invalid data, resulting in a default HOLD stance.',
  strongestBullArguments: [],
  strongestBearArguments: [],
  strongestEvidence: [],
  weakestEvidence: [],
  missingInformation: ['Comprehensive dataset'],
  chairpersonReason: 'The committee was unable to build a definitive consensus due to insufficient or conflicting data, leading to a neutral stance.',
};

/**
 * Judge Agent Node.
 * reviews all analyst reports, bull/bear cases, and risk heatmaps.
 * Generates the synthesized investment recommendation.
 */
export async function judgeNode(state: ConsensusStateType) {
  const ticker = state.ticker;
  logger.info(`[JUDGE_NODE] Running Judge CIO Agent for ${ticker}`);

  const runningEvent = {
    nodeId: 'judge',
    status: 'running' as const,
    message: 'CIO reviewing analyst reports, debates, and evidence contradictions...',
    timestamp: new Date().toISOString(),
  };

  const consolidatedReports = `
= FINANCIAL REPORT =
Health Score: ${state.financialReport?.healthScore || 'N/A'}/100
Strengths: ${JSON.stringify(state.financialReport?.strengths || [])}
Weaknesses: ${JSON.stringify(state.financialReport?.weaknesses || [])}

= BUSINESS REPORT =
Moat Rating: ${state.businessReport?.moatRating || 'N/A'}
Strengths: ${JSON.stringify(state.businessReport?.strengths || [])}
Weaknesses: ${JSON.stringify(state.businessReport?.weaknesses || [])}

= NEWS REPORT =
Sentiment: ${state.newsReport?.overallSentiment || 'N/A'} (${state.newsReport?.sentimentScore || 0})
Summary: ${state.newsReport?.summary || 'N/A'}

= MARKET REPORT =
Position: ${state.marketReport?.marketPosition || 'N/A'}
Competitors: ${JSON.stringify(state.marketReport?.competitors || [])}

= BULL CASE ARGUMENTS =
${(state.bullCase?.arguments || []).map((a) => `- Claim: ${a.claim} (citing ${a.evidenceId})\n  Reasoning: ${a.reasoning}`).join('\n')}

= BEAR CASE ARGUMENTS =
${(state.bearCase?.arguments || []).map((a) => `- Claim: ${a.claim} (citing ${a.evidenceId})\n  Reasoning: ${a.reasoning}`).join('\n')}

= RISK MATRIX =
Overall Risk Score: ${state.riskReport?.overallRiskScore || 0}/100
Risks: ${(state.riskReport?.risks || []).map((r) => `- Category: ${r.category} | Severity: ${r.severity} | Description: ${r.description} (citing ${r.evidenceId})`).join('\n')}
`;

  const evidenceBlock = wrapInEvidenceTags(consolidatedReports);

  const { result } = await executeAgentCall(
    'Judge Agent',
    JUDGE_SYSTEM_PROMPT,
    `Review the following consolidated analyst reports and debate findings:\n${evidenceBlock}`,
    JudgeResultSchema,
    defaultResult
  );

  const completedEvent = {
    nodeId: 'judge',
    status: 'completed' as const,
    message: `Synthesized verdict generated: ${result.recommendation} (Confidence: ${(result.confidence * 100).toFixed(0)}%).`,
    timestamp: new Date().toISOString(),
  };

  return {
    judgeVerdict: result,
    timeline: [runningEvent, completedEvent],
  };
}
