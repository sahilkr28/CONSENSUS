export type Recommendation = 'BUY' | 'HOLD' | 'SELL';

export interface CompanyInfo {
  name: string;
  ticker: string;
  sector?: string;
  industry?: string;
  longBusinessSummary?: string;
  website?: string;
  logoUrl?: string;
  marketCap?: number;
  currentPrice?: number;
  dividendYield?: number;
  peRatio?: number;
  eps?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  recommendationMean?: number;
  city?: string;
  state?: string;
  country?: string;
}

export interface FinancialMetrics {
  revenueGrowth?: number;
  profitMargin?: number;
  debtToEquity?: number;
  freeCashFlow?: number;
  operatingMargin?: number;
  returnOnEquity?: number;
  quickRatio?: number;
  currentRatio?: number;
}

export interface AnalystResult {
  healthScore: number; // 0 to 100
  strengths: string[];
  weaknesses: string[];
  observations: string[];
  confidence: number; // 0.0 to 1.0
  evidence: string[];
}

export interface BusinessResult {
  moatRating: 'Wide' | 'Narrow' | 'None';
  moatDescription: string;
  strengths: string[];
  weaknesses: string[];
  revenueStreams: string[];
  customerBase: string;
  confidence: number;
  evidence: string[];
}

export interface NewsArticle {
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impactScore: number; // 1 to 5
}

export interface NewsResult {
  overallSentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number; // -100 (bearish) to +100 (bullish)
  summary: string;
  topArticles: NewsArticle[];
  confidence: number;
  evidence: string[];
}

export interface MarketResult {
  industryGrowthRate?: string;
  marketPosition: string;
  competitors: { name: string; marketShare?: string; strengths?: string }[];
  macroFactors: string[];
  confidence: number;
  evidence: string[];
}

export interface EvidenceItem {
  id: string;
  text: string;
  source: string;
  url?: string;
  category: 'financial' | 'business' | 'news' | 'market';
  reliability: number; // 0.0 to 1.0
  timestamp: string;
}

export interface ArgumentItem {
  claim: string;
  evidenceId: string;
  reasoning: string;
}

export interface DebateResult {
  arguments: ArgumentItem[];
  confidence: number;
}

export interface RiskItem {
  category: 'Financial' | 'Business' | 'Regulatory' | 'Operational' | 'Market' | 'Political';
  severity: 'High' | 'Medium' | 'Low';
  likelihood: 'High' | 'Medium' | 'Low';
  description: string;
  evidenceId: string;
}

export interface RiskResult {
  risks: RiskItem[];
  overallRiskScore: number; // 0 to 100
  confidence: number;
}

export interface JudgeResult {
  recommendation: Recommendation;
  confidence: number; // 0.0 to 1.0
  summary: string;
  reasoning: string;
  strongestBullArguments: string[];
  strongestBearArguments: string[];
  strongestEvidence: string[];
  weakestEvidence: string[];
  missingInformation: string[];
}

export interface ConsensusScore {
  score: number; // 0 to 100
  breakdown: {
    financial: number;
    business: number;
    news: number;
    market: number;
    bull: number;
    bear: number;
    risk: number;
  };
  agreementScore: number;
  contradictionDeduction: number;
  confidenceGap: string[];
}

export interface FinalReport {
  id: string; // Ticker or unique run ID
  timestamp: string;
  companyInfo: CompanyInfo;
  financialMetrics: FinancialMetrics;
  financialReport?: AnalystResult;
  businessReport?: BusinessResult;
  newsReport?: NewsResult;
  marketReport?: MarketResult;
  evidenceCollected: EvidenceItem[];
  bullCase?: DebateResult;
  bearCase?: DebateResult;
  riskReport?: RiskResult;
  judgeVerdict?: JudgeResult;
  consensusScore?: ConsensusScore;
  sources: { name: string; url?: string; count: number }[];
}

export interface WorkflowNodeState {
  id: string;
  label: string;
  status: 'idle' | 'running' | 'completed' | 'warning' | 'failed';
  message?: string;
  timestamp: string;
}

export interface WorkflowTimelineEvent {
  nodeId: string;
  status: 'running' | 'completed' | 'warning' | 'failed';
  message: string;
  timestamp: string;
}

export interface ExecutionPlan {
  company: string;
  ticker: string;
  requiredTools: string[];
  executionPlan: string;
  expectedDeliverables: string[];
}
