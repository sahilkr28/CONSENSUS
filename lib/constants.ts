export const CACHE_TTLS = {
  FINANCIALS: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  NEWS: 60 * 60 * 1000,            // 1 hour in milliseconds
  REPORTS: 30 * 60 * 1000,         // 30 minutes in milliseconds
};

export const CONSENSUS_WEIGHTS = {
  financial: 0.30, // 30%
  business: 0.20,  // 20%
  news: 0.15,      // 15%
  market: 0.10,    // 10%
  bull: 0.10,      // 10%
  bear: 0.10,      // 10%
  risk: 0.05,      // 5%
};

export const UI_COLORS = {
  background: '#050505',
  secondaryBackground: '#0D0D0D',
  card: '#111111',
  border: '#232323',
  primaryText: '#FFFFFF',
  secondaryText: '#A1A1AA',
  mutedText: '#71717A',
  accent: '#3B82F6',
  success: '#22C55E',
  warning: '#FACC15',
  danger: '#EF4444',
  idle: '#4B5563',
};

export const NODE_LABELS: Record<string, string> = {
  planner: 'Planner Agent',
  resolver: 'Ticker Resolver',
  coordinator: 'Research Coordinator',
  financial: 'Financial Analyst',
  business: 'Business Analyst',
  news: 'News Analyst',
  market: 'Market Analyst',
  evidence: 'Evidence Collector',
  bull: 'Bull Analyst',
  bear: 'Bear Analyst',
  risk: 'Risk Analyst',
  judge: 'Judge Agent',
  consensus: 'Consensus Engine',
  report: 'Report Generator',
};
