'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SearchBox from '@/components/dashboard/SearchBox';
import CompanyHeader from '@/components/dashboard/CompanyHeader';
import RecommendationCard from '@/components/dashboard/RecommendationCard';
import MetricsGrid from '@/components/dashboard/MetricsGrid';
import WorkflowGraph from '@/components/workflow/WorkflowGraph';
import Timeline from '@/components/workflow/Timeline';
import StatusTicker from '@/components/workflow/StatusTicker';
import FinancialCard from '@/components/cards/FinancialCard';
import BusinessCard from '@/components/cards/BusinessCard';
import NewsCard from '@/components/cards/NewsCard';
import MarketCard from '@/components/cards/MarketCard';
import BullCard from '@/components/cards/BullCard';
import BearCard from '@/components/cards/BearCard';
import RiskCard from '@/components/cards/RiskCard';
import EvidencePanel from '@/components/workflow/EvidencePanel';
import { useWorkflowStore } from '@/stores/workflow.store';
import { YahooSearchMatch } from '@/services/yahoo.service';
import { ShieldCheck, Flame, Scale, TrendingUp, AlertOctagon, HelpCircle, Loader2 } from 'lucide-react';

function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlTicker = searchParams.get('ticker');
  const urlCompanyName = searchParams.get('companyName');

  const {
    status,
    report,
    cacheAge,
    startWorkflow,
    updateNode,
    completeWorkflow,
    failWorkflow,
    resetWorkflow,
  } = useWorkflowStore();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Trigger analysis stream
  const triggerAnalysis = async (ticker: string, companyName: string, forceFresh = false) => {
    setIsLoading(true);
    setErrorMsg(null);
    startWorkflow(`wf-${Date.now()}`, ticker, companyName);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, companyName, forceFresh }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Server returned an error.');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('Readable stream not supported in this browser.');

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value);
        const lines = buffer.split('\n\n');
        
        // Keep the last partial line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          // Parse Event Stream format:
          // event: eventName
          // data: stringifiedJSON
          const eventMatch = line.match(/^event:\s*(.+)$/m);
          const dataMatch = line.match(/^data:\s*(.+)$/m);

          if (eventMatch && dataMatch) {
            const eventName = eventMatch[1].trim();
            const rawData = dataMatch[1].trim();
            const data = JSON.parse(rawData);

            if (eventName === 'node_update') {
              updateNode({
                nodeId: data.nodeId,
                status: data.status,
                message: data.message,
                timestamp: data.timestamp,
              });
            } else if (eventName === 'workflow_completed') {
              completeWorkflow(data.report, data.cached, data.ageMinutes);
            } else if (eventName === 'workflow_failed') {
              throw new Error(data.error || 'Workflow execution failed.');
            }
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during research.');
      failWorkflow(err.message || 'Workflow failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Run on parameters load
  useEffect(() => {
    if (urlTicker) {
      triggerAnalysis(urlTicker, urlCompanyName || urlTicker);
    } else {
      resetWorkflow();
    }
  }, [urlTicker, urlCompanyName]);

  const handleSelectCompany = (match: YahooSearchMatch) => {
    // Push new params to trigger useEffect
    router.push(`/dashboard?ticker=${match.symbol}&companyName=${encodeURIComponent(match.name)}`);
  };

  const handleRerun = () => {
    if (urlTicker) {
      triggerAnalysis(urlTicker, urlCompanyName || urlTicker, true);
    }
  };

  // Mock chart details mapping from report or company API
  const [chartData, setChartData] = useState<any[]>([]);
  useEffect(() => {
    if (report?.companyInfo?.ticker) {
      fetch(`/api/company/${report.companyInfo.ticker}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.chart) setChartData(d.chart);
        })
        .catch(() => {});
    }
  }, [report]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 flex-1 w-full">
      {/* Search selection row */}
      {status !== 'running' && (
        <div className="flex flex-col items-center justify-between gap-4 border-b border-[#232323] pb-6 sm:flex-row">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white font-mono uppercase">
              Consensus Research Terminal
            </h2>
            <p className="text-xs text-[#71717A] mt-0.5">
              Select or search to run the committee graph.
            </p>
          </div>
          <div className="w-full sm:w-80">
            <SearchBox onSelect={handleSelectCompany} isLoading={isLoading} />
          </div>
        </div>
      )}

      {/* Running/Progress display */}
      {status === 'running' && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <StatusTicker />
            <WorkflowGraph />
          </div>
          <div>
            <Timeline />
          </div>
        </div>
      )}

      {/* Failed/Error message block */}
      {status === 'failed' && errorMsg && (
        <div className="rounded-lg border border-red-500/20 bg-red-950/5 p-6 text-center max-w-lg mx-auto space-y-4">
          <AlertOctagon className="h-10 w-10 text-red-500 mx-auto" />
          <h3 className="text-sm font-bold text-white font-mono uppercase">Committee Run Failed</h3>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            {errorMsg}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="rounded bg-[#111111] border border-[#232323] px-4 py-2 text-xs text-white hover:bg-zinc-900 transition-colors"
          >
            Clear and Reset
          </button>
        </div>
      )}

      {/* Complete Report Dashboard Panels */}
      {status === 'completed' && report && (
        <div className="space-y-8">
          {/* Company Details Title */}
          <CompanyHeader companyInfo={report.companyInfo} />

          {/* Verdict Score & Disclaimer */}
          <RecommendationCard
            report={report}
            cacheAge={cacheAge}
            onRerun={handleRerun}
            isLoading={isLoading}
          />

          {/* Historical price chart grid */}
          <MetricsGrid
            companyInfo={report.companyInfo}
            metrics={report.financialMetrics}
            chartData={chartData}
          />

          {/* Analyst Reports Panels */}
          <div className="space-y-6">
            <div className="border-b border-[#232323] pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#71717A] font-mono">
                Analyst Research Verdicts
              </h3>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <FinancialCard report={report.financialReport} metrics={report.financialMetrics} />
              <BusinessCard report={report.businessReport} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <NewsCard report={report.newsReport} />
              <MarketCard report={report.marketReport} />
            </div>
          </div>

          {/* Bull vs Bear Debate Rounds */}
          <div className="space-y-6">
            <div className="border-b border-[#232323] pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#71717A] font-mono">
                Committee Debate Rounds
              </h3>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <BullCard report={report.bullCase} />
              <BearCard report={report.bearCase} />
            </div>
          </div>

          {/* Risk assessment and Evidence Vault */}
          <div className="grid gap-6 md:grid-cols-2">
            <RiskCard report={report.riskReport} />
            <EvidencePanel evidence={report.evidenceCollected} />
          </div>

          {/* Bottom toggleable Graph visualizer */}
          <div className="border-t border-[#232323] pt-8">
            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#71717A] font-mono">
                Workflow Orchestration Audit Map
              </h3>
              <p className="text-[10px] text-[#71717A] mt-0.5 font-mono">
                Inspect the execution layout that compiled this report.
              </p>
            </div>
            <WorkflowGraph />
          </div>
        </div>
      )}

      {/* Idle Landing Display */}
      {status === 'idle' && (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-[#232323] rounded-lg bg-[#0D0D0D]/30 max-w-2xl mx-auto px-6">
          <HelpCircle className="h-10 w-10 text-[#71717A] mb-4 animate-bounce" />
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Waiting for Committee Request
          </h3>
          <p className="text-xs text-[#A1A1AA] leading-relaxed max-w-sm mt-2">
            Enter a company name or ticker symbol in the search input above to dispatch our AI analysts.
          </p>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-white">
      <Navbar />
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center bg-[#050505] min-h-[500px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      }>
        <DashboardContent />
      </Suspense>
      <Footer />
    </div>
  );
}
