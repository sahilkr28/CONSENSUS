import { StateGraph, START, END } from '@langchain/langgraph';
import { ConsensusStateAnnotation } from './state';
import { plannerNode } from './nodes/planner';
import { resolverNode } from './nodes/resolver';
import { coordinatorNode } from './nodes/coordinator';
import { financialNode } from './nodes/financial';
import { businessNode } from './nodes/business';
import { newsNode } from './nodes/news';
import { marketNode } from './nodes/market';
import { evidenceNode } from './nodes/evidence';
import { bullNode } from './nodes/bull';
import { bearNode } from './nodes/bear';
import { riskNode } from './nodes/risk';
import { judgeNode } from './nodes/judge';
import { consensusNode } from './nodes/consensus';
import { reportNode } from './nodes/report';

import { logger } from '../lib/logger';

/**
 * Higher-order wrapper to log starting, completing, or failing details 
 * for every orchestrator node, capturing and storing exceptions.
 */
function wrapNode(nodeName: string, nodeFunc: any) {
  return async (state: any) => {
    const startTime = Date.now();
    logger.info(`[NODE_START] Executing node "${nodeName}" for $${state.ticker || 'N/A'}. Inputs: query="${state.query || ''}", name="${state.companyName || ''}"`);
    
    try {
      const result = await nodeFunc(state);
      const duration = Date.now() - startTime;
      logger.info(`[NODE_SUCCESS] Completed node "${nodeName}" in ${duration}ms. Keys returned: ${Object.keys(result || {}).join(', ')}`);
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      logger.error(`[NODE_ERROR] Failed executing node "${nodeName}" in ${duration}ms. Error: ${error.message}`, error);
      
      const errorMsg = `[Node: ${nodeName}] ${error.message}`;
      const runningEvent = {
        nodeId: nodeName,
        status: 'running' as const,
        message: `Executing ${nodeName}...`,
        timestamp: new Date(startTime).toISOString()
      };
      const failedEvent = {
        nodeId: nodeName,
        status: 'failed' as const,
        message: `Error: ${error.message}`,
        timestamp: new Date().toISOString()
      };
      
      return {
        timeline: [runningEvent, failedEvent],
        errors: [errorMsg]
      };
    }
  };
}

// Initialize the Consensus State Graph
const workflow = new StateGraph(ConsensusStateAnnotation)
  // 1. Initial research set nodes
  .addNode('planner', wrapNode('planner', plannerNode))
  .addNode('resolver', wrapNode('resolver', resolverNode))
  .addNode('coordinator', wrapNode('coordinator', coordinatorNode))
  
  // 2. Parallel data analyst nodes
  .addNode('financial', wrapNode('financial', financialNode))
  .addNode('business', wrapNode('business', businessNode))
  .addNode('news', wrapNode('news', newsNode))
  .addNode('market', wrapNode('market', marketNode))
  
  // 3. Central joint node
  .addNode('evidence', wrapNode('evidence', evidenceNode))
  
  // 4. Parallel debate/risk nodes
  .addNode('bull', wrapNode('bull', bullNode))
  .addNode('bear', wrapNode('bear', bearNode))
  .addNode('risk', wrapNode('risk', riskNode))
  
  // 5. Final synthesis nodes
  .addNode('judge', wrapNode('judge', judgeNode))
  .addNode('consensus', wrapNode('consensus', consensusNode))
  .addNode('report', wrapNode('report', reportNode));

// Define workflow edges in strict compliance with architecture diagram
workflow.addEdge(START, 'planner');
workflow.addEdge('planner', 'resolver');
workflow.addEdge('resolver', 'coordinator');

// Parallel broadcast from Coordinator to the 4 Analysts
workflow.addEdge('coordinator', 'financial');
workflow.addEdge('coordinator', 'business');
workflow.addEdge('coordinator', 'news');
workflow.addEdge('coordinator', 'market');

// Join analyst outputs into the Central Evidence Collector
workflow.addEdge('financial', 'evidence');
workflow.addEdge('business', 'evidence');
workflow.addEdge('news', 'evidence');
workflow.addEdge('market', 'evidence');

// Parallel broadcast from Evidence Collector to Bull, Bear, and Risk Analysts
workflow.addEdge('evidence', 'bull');
workflow.addEdge('evidence', 'bear');
workflow.addEdge('evidence', 'risk');

// Join debate results back to Judge CIO Agent
workflow.addEdge('bull', 'judge');
workflow.addEdge('bear', 'judge');
workflow.addEdge('risk', 'judge');

// Final sequence to Consensus and Report Generation
workflow.addEdge('judge', 'consensus');
workflow.addEdge('consensus', 'report');
workflow.addEdge('report', END);

// Compile the executable workflow
export const consensusGraph = workflow.compile();
