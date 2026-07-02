import { ConsensusStateType } from '../state';
import { executeAgentCall } from '../../services/gemini.service';
import { REPORT_SYSTEM_PROMPT } from '../../prompts/report.prompt';
import { z } from 'zod';
import { FinalReport } from '../../types';
import { logger } from '../../lib/logger';

const ReportGeneratorSchema = z.object({
  executiveSummary: z.string(),
  investmentThesis: z.string(),
  keyCatalysts: z.array(z.string()),
  keyRisks: z.array(z.string()),
});

const defaultSummary = {
  executiveSummary: 'Investment research compilation completed successfully.',
  investmentThesis: 'No clear investment thesis could be formulated.',
  keyCatalysts: [],
  keyRisks: [],
};

/**
 * Report Generator Node.
 * Packages all analyst and judge state data, queries the Investment Writer agent for
 * an executive memo, and compiles the final structured FinalReport.
 */
export async function reportNode(state: ConsensusStateType) {
  const ticker = state.ticker;
  logger.info(`[REPORT_NODE] Generating Final Report for ${ticker}`);

  const runningEvent = {
    nodeId: 'report',
    status: 'running' as const,
    message: 'Investment writer assembling final research report and executive summary...',
    timestamp: new Date().toISOString(),
  };

  const inputsSummary = `
Company: ${state.companyName} (${ticker})
Recommendation: ${state.judgeVerdict?.recommendation || 'HOLD'}
Consensus Score: ${state.consensusScore?.score || 50}/100
Financial Health: ${state.financialReport?.healthScore || 50}/100
Business Moat: ${state.businessReport?.moatRating || 'None'}
News Sentiment: ${state.newsReport?.overallSentiment || 'neutral'}
Risks: ${state.riskReport?.risks.length || 0} items identified.
`;

  const { result } = await executeAgentCall(
    'Report Generator',
    REPORT_SYSTEM_PROMPT,
    `Create report for:\n${inputsSummary}`,
    ReportGeneratorSchema,
    defaultSummary
  );

  // Group and count sources
  const sourcesMap = new Map<string, { name: string; url?: string; count: number }>();
  if (state.evidenceCollected) {
    state.evidenceCollected.forEach((item) => {
      const key = item.source.toLowerCase();
      const existing = sourcesMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        sourcesMap.set(key, { name: item.source, count: 1 });
      }
    });
  }
  const sources = Array.from(sourcesMap.values());

  const finalReport: FinalReport = {
    id: `${ticker}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    companyInfo: state.companyInfo,
    financialMetrics: state.financialMetrics,
    financialReport: state.financialReport,
    businessReport: state.businessReport,
    newsReport: state.newsReport,
    marketReport: state.marketReport,
    evidenceCollected: state.evidenceCollected || [],
    bullCase: state.bullCase,
    bearCase: state.bearCase,
    riskReport: state.riskReport,
    judgeVerdict: {
      ...state.judgeVerdict!,
      summary: result.executiveSummary, // Override with the beautiful summary from writer
      reasoning: `${result.investmentThesis}\n\n${state.judgeVerdict?.reasoning}`,
    },
    consensusScore: state.consensusScore,
    sources,
  };

  const completedEvent = {
    nodeId: 'report',
    status: 'completed' as const,
    message: 'Research Report fully generated and stored in active memory cache.',
    timestamp: new Date().toISOString(),
  };

  return {
    finalReport,
    timeline: [runningEvent, completedEvent],
  };
}
