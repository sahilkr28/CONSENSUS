import { NextRequest, NextResponse } from 'next/server';
import { activeWorkflows } from '@/services/cache.service';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  logger.info(`[API_WORKFLOW] Fetch snapshot for: ${id}`);

  const snapshot = activeWorkflows.get(id);

  if (!snapshot) {
    return NextResponse.json(
      { error: 'Workflow session not found or expired.' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    id,
    active: true,
    snapshot,
  });
}
