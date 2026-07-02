import { NextRequest, NextResponse } from 'next/server';
import { getCompanyDetails, getCompanyChart } from '@/services/yahoo.service';
import { getCompanyLogoUrl } from '@/services/logo.service';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const uppercaseTicker = ticker.toUpperCase();
  const startTime = Date.now();

  logger.info(`[API_COMPANY] Fetch info and charts for $${uppercaseTicker}`);

  try {
    const details = await getCompanyDetails(uppercaseTicker);
    const chart = await getCompanyChart(uppercaseTicker, 180); // 6 months chart
    
    const logoUrl = getCompanyLogoUrl(details.companyInfo.website, details.companyInfo.name);

    return NextResponse.json({
      companyInfo: {
        ...details.companyInfo,
        logoUrl,
      },
      financialMetrics: details.financialMetrics,
      chart,
      latencyMs: Date.now() - startTime,
    });
  } catch (error: any) {
    logger.error(`[API_COMPANY] Fetch error for $${uppercaseTicker}: ${error.message}`, error);
    return NextResponse.json(
      { error: `Failed to fetch stock information for ticker $${uppercaseTicker}.` },
      { status: 500 }
    );
  }
}
