import { z } from 'zod';

export const RecommendationSchema = z.enum(['BUY', 'HOLD', 'SELL']);

export const CompanyInfoSchema = z.object({
  name: z.string(),
  ticker: z.string(),
  sector: z.string().optional(),
  industry: z.string().optional(),
  longBusinessSummary: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  logoUrl: z.string().optional(),
  marketCap: z.number().optional(),
  currentPrice: z.number().optional(),
  dividendYield: z.number().optional(),
  peRatio: z.number().optional(),
  eps: z.number().optional(),
  fiftyTwoWeekHigh: z.number().optional(),
  fiftyTwoWeekLow: z.number().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});

export const PlannerResultSchema = z.object({
  company: z.string(),
  ticker: z.string(),
  requiredTools: z.array(z.string()),
  executionPlan: z.string(),
  expectedDeliverables: z.array(z.string()),
});

export const FinancialAnalystResultSchema = z.object({
  healthScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  observations: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  evidence: z.array(z.string()),
});

export const BusinessAnalystResultSchema = z.object({
  moatRating: z.enum(['Wide', 'Narrow', 'None']),
  moatDescription: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  revenueStreams: z.array(z.string()),
  customerBase: z.string(),
  confidence: z.number().min(0).max(1),
  evidence: z.array(z.string()),
});

export const NewsArticleSchema = z.object({
  title: z.string(),
  description: z.string(),
  source: z.string(),
  url: z.string(),
  publishedAt: z.string(),
  sentiment: z.enum(['positive', 'negative', 'neutral']),
  impactScore: z.number().min(1).max(5),
});

export const NewsAnalystResultSchema = z.object({
  overallSentiment: z.enum(['positive', 'negative', 'neutral']),
  sentimentScore: z.number().min(-100).max(100),
  summary: z.string(),
  topArticles: z.array(NewsArticleSchema),
  confidence: z.number().min(0).max(1),
  evidence: z.array(z.string()),
});

export const CompetitorSchema = z.object({
  name: z.string(),
  marketShare: z.string().optional(),
  strengths: z.string().optional(),
});

export const MarketAnalystResultSchema = z.object({
  industryGrowthRate: z.string().optional(),
  marketPosition: z.string(),
  competitors: z.array(CompetitorSchema),
  macroFactors: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  evidence: z.array(z.string()),
});

export const ArgumentItemSchema = z.object({
  claim: z.string(),
  evidenceId: z.string(),
  reasoning: z.string(),
});

export const DebateResultSchema = z.object({
  arguments: z.array(ArgumentItemSchema),
  confidence: z.number().min(0).max(1),
});

export const RiskItemSchema = z.object({
  category: z.enum(['Financial', 'Business', 'Regulatory', 'Operational', 'Market', 'Political']),
  severity: z.enum(['High', 'Medium', 'Low']),
  likelihood: z.enum(['High', 'Medium', 'Low']),
  description: z.string(),
  evidenceId: z.string(),
});

export const RiskAnalystResultSchema = z.object({
  risks: z.array(RiskItemSchema),
  overallRiskScore: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
});

export const JudgeResultSchema = z.object({
  recommendation: RecommendationSchema,
  confidence: z.number().min(0).max(1),
  summary: z.string(),
  reasoning: z.string(),
  strongestBullArguments: z.array(z.string()),
  strongestBearArguments: z.array(z.string()),
  strongestEvidence: z.array(z.string()),
  weakestEvidence: z.array(z.string()),
  missingInformation: z.array(z.string()),
  chairpersonReason: z.string().optional(),
});
