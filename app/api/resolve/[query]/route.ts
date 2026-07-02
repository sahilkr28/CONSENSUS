import { NextRequest, NextResponse } from 'next/server';
import { searchSymbols } from '@/services/yahoo.service';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ query: string }> }
) {
  const { query } = await params;
  const decodedQuery = decodeURIComponent(query);
  const startTime = Date.now();

  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country') || undefined;

  logger.info(`[API_RESOLVE] Disambiguation request for query: "${decodedQuery}" (country: ${country || 'ALL'})`);

  if (!decodedQuery || decodedQuery.trim().length < 2) {
    return NextResponse.json(
      { error: 'Query must be at least 2 characters.' },
      { status: 400 }
    );
  }

  try {
    const matches = await searchSymbols(decodedQuery, country);
    const latency = Date.now() - startTime;
    logger.info(`[API_RESOLVE] Resolved ${matches.length} matches in ${latency}ms.`);
    
    return NextResponse.json({
      query: decodedQuery,
      matches,
      latencyMs: latency,
    });
  } catch (error: any) {
    logger.error(`[API_RESOLVE] Resolution error: ${error.message}`, error);
    return NextResponse.json(
      { error: 'Failed to resolve ticker symbol due to service error.' },
      { status: 500 }
    );
  }
}
