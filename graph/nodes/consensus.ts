import { ConsensusStateType } from '../state';
import { ConsensusScore } from '../../types';
import { CONSENSUS_WEIGHTS } from '../../lib/constants';
import { logger } from '../../lib/logger';

/**
 * Consensus Engine Node.
 * Computes a weighted score and a normalized confidence rating based on evidence quantity,
 * quality, agreement, contradictions, and missing inputs.
 */
export async function consensusNode(state: ConsensusStateType) {
  const ticker = state.ticker;
  logger.info(`[CONSENSUS_NODE] Running Consensus Engine for ${ticker}`);

  const runningEvent = {
    nodeId: 'consensus',
    status: 'running' as const,
    message: 'Computing weighted score, evaluating contradictions and confidence gaps...',
    timestamp: new Date().toISOString(),
  };

  // 1. Resolve component scores (out of 100)
  const finScore = state.financialReport?.healthScore ?? 50;
  
  let busScore = 50;
  const moat = state.businessReport?.moatRating;
  if (moat === 'Wide') busScore = 100;
  else if (moat === 'Narrow') busScore = 70;
  else if (moat === 'None') busScore = 40;

  const newsScore = state.newsReport
    ? Math.max(0, Math.min(100, (state.newsReport.sentimentScore + 100) / 2))
    : 50;

  const mktScore = (state.marketReport?.confidence ?? 0.5) * 100;
  const bullScore = (state.bullCase?.confidence ?? 0.5) * 100;
  const bearScore = (1 - (state.bearCase?.confidence ?? 0.5)) * 100; // lower bear confidence = higher score
  const riskScore = 100 - (state.riskReport?.overallRiskScore ?? 50); // lower risk = higher score

  // 2. Calculate weighted score
  const finalWeightedScore = Math.round(
    finScore * CONSENSUS_WEIGHTS.financial +
    busScore * CONSENSUS_WEIGHTS.business +
    newsScore * CONSENSUS_WEIGHTS.news +
    mktScore * CONSENSUS_WEIGHTS.market +
    bullScore * CONSENSUS_WEIGHTS.bull +
    bearScore * CONSENSUS_WEIGHTS.bear +
    riskScore * CONSENSUS_WEIGHTS.risk
  );

  // 3. Calculate consensus confidence factors (0 - 100 scale)
  // Confidence = evidence quality + evidence quantity + source reliability + agreement - contradictions - missing info
  
  // A. Evidence Quality: Average reliability of evidence (weight: 30)
  const evidenceList = state.evidenceCollected || [];
  const avgReliability = evidenceList.length > 0 
    ? evidenceList.reduce((sum, item) => sum + item.reliability, 0) / evidenceList.length 
    : 0.5;
  const qualityFactor = avgReliability * 30;

  // B. Evidence Quantity: Scaled quantity of evidence (weight: 25)
  // Max score of 25 achieved at 12+ items
  const quantityFactor = Math.min(25, evidenceList.length * 2);

  // C. Source Reliability: High reliability sources count (weight: 25)
  const highReliabilityCount = evidenceList.filter((e) => e.reliability >= 0.75).length;
  const sourceFactor = Math.min(25, highReliabilityCount * 3);

  // D. Agreement Between Analysts (weight: 20)
  // Deduct if Bull Case and Bear Case both have high confidence, suggesting high disagreement.
  let agreementScore = 20;
  const bullConf = state.bullCase?.confidence ?? 0.5;
  const bearConf = state.bearCase?.confidence ?? 0.5;
  if (bullConf > 0.7 && bearConf > 0.7) {
    agreementScore -= 10; // High conflict/debate
  }
  if (state.financialReport?.healthScore && state.financialReport.healthScore < 40 && state.judgeVerdict?.recommendation === 'BUY') {
    agreementScore -= 5; // CIO buying a low-health stock
  }

  // E. Contradictions Deduction
  // The Judge flags contradictions. Deduct 10 points for each flagged contradiction.
  const contradictionCount = state.judgeVerdict?.weakestEvidence?.length ?? 0;
  const contradictionDeduction = contradictionCount * 8;

  // F. Missing Information Deduction
  // The Judge flags missing info. Deduct 5 points per item.
  const missingCount = state.judgeVerdict?.missingInformation?.length ?? 0;
  const missingInfoDeduction = missingCount * 5;

  // Compute final confidence score
  let finalConfidence = Math.round(
    qualityFactor + quantityFactor + sourceFactor + agreementScore - contradictionDeduction - missingInfoDeduction
  );
  finalConfidence = Math.max(10, Math.min(100, finalConfidence));

  // Determine confidence gaps to report
  const confidenceGap: string[] = [];
  if (evidenceList.length < 5) confidenceGap.push('Low evidence quantity collected.');
  if (avgReliability < 0.6) confidenceGap.push('Low overall source reliability.');
  if (missingCount > 0) confidenceGap.push(`Missing critical information: ${state.judgeVerdict?.missingInformation.join(', ')}.`);
  if (contradictionCount > 0) confidenceGap.push('Unresolved contradictions exist in analyst claims.');

  const consensusScore: ConsensusScore = {
    score: finalWeightedScore,
    breakdown: {
      financial: Math.round(finScore),
      business: Math.round(busScore),
      news: Math.round(newsScore),
      market: Math.round(mktScore),
      bull: Math.round(bullScore),
      bear: Math.round(bearScore),
      risk: Math.round(riskScore),
    },
    agreementScore,
    contradictionDeduction,
    confidenceGap,
  };

  const completedEvent = {
    nodeId: 'consensus',
    status: 'completed' as const,
    message: `Weighted consensus score: ${finalWeightedScore}/100. Confidence index: ${finalConfidence}%.`,
    timestamp: new Date().toISOString(),
  };

  return {
    consensusScore,
    timeline: [runningEvent, completedEvent],
  };
}
