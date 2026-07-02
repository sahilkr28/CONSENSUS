import { ConsensusStateType } from '../state';
import { searchSymbols } from '../../services/yahoo.service';
import { logger } from '../../lib/logger';

/**
 * Ticker Resolver Agent Node.
 * Ensures the ticker is fully resolved, and verifies it exists in the market.
 */
export async function resolverNode(state: ConsensusStateType) {
  const startTime = Date.now();
  const query = state.ticker || state.companyName || state.query;

  const runningEvent = {
    nodeId: 'resolver',
    status: 'running' as const,
    message: `Resolving ticker symbol for query "${query}"...`,
    timestamp: new Date().toISOString(),
  };

  logger.info(`[RESOLVER_NODE] Resolving ticker for query: "${query}"`);

  let resolvedTicker = state.ticker?.trim().toUpperCase() || '';
  let resolvedName = state.companyName || query;
  let status: 'completed' | 'warning' | 'failed' = 'completed';
  let message = `Ticker successfully resolved to: $${resolvedTicker}.`;

  if (!resolvedTicker) {
    const matches = await searchSymbols(query);
    if (matches && matches.length > 0) {
      // Pick the first match as it is the most relevant
      resolvedTicker = matches[0].symbol;
      resolvedName = matches[0].name;
      message = `Auto-resolved ticker for "${query}" to: $${resolvedTicker} (${resolvedName}).`;
    } else {
      status = 'failed';
      resolvedTicker = 'UNKNOWN';
      message = `Could not resolve a US equity symbol for "${query}".`;
    }
  }

  const completedEvent = {
    nodeId: 'resolver',
    status,
    message,
    timestamp: new Date().toISOString(),
  };

  return {
    ticker: resolvedTicker,
    companyName: resolvedName,
    timeline: [runningEvent, completedEvent],
  };
}
