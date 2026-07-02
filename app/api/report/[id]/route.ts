import { NextRequest, NextResponse } from 'next/server';
import { getCachedReport } from '@/services/cache.service';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const ticker = id.toUpperCase();
  logger.info(`[API_REPORT] Fetching cached report for $${ticker}`);

  const cached = await getCachedReport(ticker);

  if (!cached) {
    return NextResponse.json(
      { error: `No cached research report found for ticker $${ticker}. Run a new analysis first.` },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ticker,
    report: cached.report,
    ageMinutes: cached.ageMinutes,
  });
}
