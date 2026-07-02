import { NextRequest } from 'next/server';
import { checkRateLimit } from '@/services/ratelimit.service';
import { getCachedReport, setCachedReport, activeWorkflows } from '@/services/cache.service';
import { consensusGraph } from '@/graph/graph';
import { logger } from '@/lib/logger';
import { FinalReport } from '@/types';

// Extend route duration for long-running LLM queries
export const maxDuration = 180; // 3 minutes

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  // 1. Resolve client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
  
  const limitCheck = await checkRateLimit(ip);
  if (!limitCheck.allowed) {
    return new Response(
      JSON.stringify({ error: limitCheck.reason }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2. Parse request payload
  let body: any = {};
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON request body.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { query, ticker, companyName, forceFresh = false } = body;
  if (!query && !ticker) {
    return new Response(
      JSON.stringify({ error: 'Missing company name, search query, or ticker.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const targetTicker = ticker?.toUpperCase() || '';
  const workflowId = `wf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // 3. Cache lookup
  if (!forceFresh && targetTicker) {
    const cached = await getCachedReport(targetTicker);
    if (cached) {
      logger.info(`[API_ANALYZE] Cache hit for $${targetTicker}. Streaming cached report directly.`);
      
      const encoder = new TextEncoder();
      const customStream = new ReadableStream({
        async start(controller) {
          const sendEvent = (event: string, data: any) => {
            controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
          };

          sendEvent('workflow_started', { workflowId, ticker: targetTicker, companyName: cached.report.companyInfo.name });
          
          // Send simulated timeline updates for instant visualization feedback
          const nodes = ['planner', 'resolver', 'coordinator', 'financial', 'business', 'news', 'market', 'evidence', 'bull', 'bear', 'risk', 'judge', 'consensus', 'report'];
          for (const node of nodes) {
            sendEvent('node_update', {
              nodeId: node,
              status: 'completed',
              message: `Loaded ${node} from cache (Analysis age: ${cached.ageMinutes} mins ago).`,
              timestamp: new Date().toISOString(),
            });
            await new Promise((r) => setTimeout(r, 80)); // tiny gap for smooth animation trigger
          }

          sendEvent('workflow_completed', { report: cached.report, cached: true, ageMinutes: cached.ageMinutes });
          controller.close();
        },
      });

      return new Response(customStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }
  }

  // 4. Run LangGraph Workflow and stream SSE updates
  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: any) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch (e) {
          logger.warn(`[API_ANALYZE] SSE client connection closed: ${e}`);
        }
      };

      // Set initial timeline and state
      let currentState: any = {
        query: query || '',
        companyName: companyName || '',
        ticker: targetTicker,
        timeline: [],
        errors: [],
      };

      sendEvent('workflow_started', { workflowId, ticker: targetTicker });
      activeWorkflows.set(workflowId, currentState);

      try {
        // Run graph streaming chunk by chunk
        const stream = await consensusGraph.stream(
          {
            query: query || '',
            companyName: companyName || '',
            ticker: targetTicker,
          },
          { streamMode: 'updates' }
        );

        for await (const chunk of stream) {
          // A chunk represents node changes: e.g. { planner: { companyName, ticker, timeline } }
          const nodeName = Object.keys(chunk)[0];
          const nodeUpdate = (chunk as any)[nodeName];

          logger.info(`[API_ANALYZE] Node completed: "${nodeName}"`);

          // Merge node values into current accumulated state
          currentState = {
            ...currentState,
            ...nodeUpdate,
            timeline: nodeUpdate.timeline 
              ? [...(currentState.timeline || []), ...nodeUpdate.timeline] 
              : currentState.timeline,
            errors: nodeUpdate.errors
              ? Array.from(new Set([...(currentState.errors || []), ...nodeUpdate.errors]))
              : currentState.errors,
          };

          // Save snapshot in active memory registry (for status polling)
          activeWorkflows.set(workflowId, currentState);

          // Emit node update
          if (nodeUpdate.timeline) {
            nodeUpdate.timeline.forEach((event: any) => {
              sendEvent('node_update', event);
            });
          }
        }

        // Cache the final completed report
        const finalReport: FinalReport = currentState.finalReport;
        if (finalReport && finalReport.companyInfo?.ticker) {
          await setCachedReport(finalReport.companyInfo.ticker, finalReport);
        }

        sendEvent('workflow_completed', { report: finalReport });
        logger.info(`[API_ANALYZE] Workflow ${workflowId} completed successfully in ${Date.now() - startTime}ms.`);
      } catch (error: any) {
        logger.error(`[API_ANALYZE] Workflow ${workflowId} failed: ${error.message}`, error);
        
        const failedEvent = {
          nodeId: 'report',
          status: 'failed' as const,
          message: `Execution aborted: ${error.message}`,
          timestamp: new Date().toISOString(),
        };

        sendEvent('node_update', failedEvent);
        sendEvent('workflow_failed', { error: error.message });
      } finally {
        // Clean up active registry after stream ends
        setTimeout(() => activeWorkflows.delete(workflowId), 10 * 60 * 1000); // keep snapshot for 10 minutes
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
