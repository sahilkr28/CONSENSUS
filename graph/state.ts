import { Annotation } from '@langchain/langgraph';
import {
  CompanyInfo,
  FinancialMetrics,
  AnalystResult,
  BusinessResult,
  NewsResult,
  MarketResult,
  EvidenceItem,
  DebateResult,
  RiskResult,
  JudgeResult,
  ConsensusScore,
  FinalReport,
  WorkflowTimelineEvent,
} from '../types';

/**
 * Reducer utility to safely merge arrays without duplications
 */
function mergeTimeline(prev: WorkflowTimelineEvent[], next: WorkflowTimelineEvent[]): WorkflowTimelineEvent[] {
  const merged = [...prev];
  for (const event of next) {
    // If the event with same nodeId and status already exists, don't duplicate it.
    const exists = merged.some((e) => e.nodeId === event.nodeId && e.status === event.status && e.message === event.message);
    if (!exists) {
      merged.push(event);
    }
  }
  return merged;
}

export const ConsensusStateAnnotation = Annotation.Root({
  query: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  companyName: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  ticker: Annotation<string>({
    reducer: (x, y) => y ?? x,
    default: () => '',
  }),
  companyInfo: Annotation<CompanyInfo>({
    reducer: (x, y) => y ?? x,
    default: () => ({ name: '', ticker: '' }),
  }),
  financialMetrics: Annotation<FinancialMetrics>({
    reducer: (x, y) => y ?? x,
    default: () => ({}),
  }),
  financialReport: Annotation<AnalystResult>({
    reducer: (x, y) => y ?? x,
  }),
  businessReport: Annotation<BusinessResult>({
    reducer: (x, y) => y ?? x,
  }),
  newsReport: Annotation<NewsResult>({
    reducer: (x, y) => y ?? x,
  }),
  marketReport: Annotation<MarketResult>({
    reducer: (x, y) => y ?? x,
  }),
  evidenceCollected: Annotation<EvidenceItem[]>({
    reducer: (x, y) => y ?? x,
    default: () => [],
  }),
  bullCase: Annotation<DebateResult>({
    reducer: (x, y) => y ?? x,
  }),
  bearCase: Annotation<DebateResult>({
    reducer: (x, y) => y ?? x,
  }),
  riskReport: Annotation<RiskResult>({
    reducer: (x, y) => y ?? x,
  }),
  judgeVerdict: Annotation<JudgeResult>({
    reducer: (x, y) => y ?? x,
  }),
  consensusScore: Annotation<ConsensusScore>({
    reducer: (x, y) => y ?? x,
  }),
  finalReport: Annotation<FinalReport>({
    reducer: (x, y) => y ?? x,
  }),
  timeline: Annotation<WorkflowTimelineEvent[]>({
    reducer: mergeTimeline,
    default: () => [],
  }),
  errors: Annotation<string[]>({
    reducer: (x, y) => x.concat(y),
    default: () => [],
  }),
});
export type ConsensusStateType = typeof ConsensusStateAnnotation.State;
