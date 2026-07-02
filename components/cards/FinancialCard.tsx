import React from 'react';
import { AnalystResult, FinancialMetrics } from '@/types';
import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

interface FinancialCardProps {
  report: AnalystResult | undefined;
  metrics: FinancialMetrics;
}

export default function FinancialCard({ report, metrics }: FinancialCardProps) {
  if (!report) return null;

  const formatPercentage = (val: number | undefined) => {
    if (val === undefined) return 'N/A';
    return `${(val * 100).toFixed(1)}%`;
  };

  return (
    <div className="rounded-lg border border-[#232323] bg-[#111111] p-6 glow-border">
      <div className="flex items-center justify-between border-b border-[#232323] pb-4 mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-blue-500" />
          Financial Health Analysis
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#71717A] font-mono">Health Score:</span>
          <span className="rounded bg-blue-950/20 border border-blue-500/30 px-2 py-0.5 text-xs font-bold font-mono text-blue-400">
            {report.healthScore}/100
          </span>
        </div>
      </div>

      {/* Basic Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
        <div className="rounded bg-[#0D0D0D] border border-[#232323] p-3 text-center">
          <div className="text-[10px] text-[#71717A] font-mono mb-1">Rev Growth (YoY)</div>
          <div className="text-sm font-bold font-mono text-white flex items-center justify-center">
            {formatPercentage(metrics.revenueGrowth)}
            {metrics.revenueGrowth && metrics.revenueGrowth > 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5 text-green-500 ml-0.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5 text-red-500 ml-0.5" />
            )}
          </div>
        </div>
        <div className="rounded bg-[#0D0D0D] border border-[#232323] p-3 text-center">
          <div className="text-[10px] text-[#71717A] font-mono mb-1">Operating Margin</div>
          <div className="text-sm font-bold font-mono text-white">
            {formatPercentage(metrics.operatingMargin)}
          </div>
        </div>
        <div className="rounded bg-[#0D0D0D] border border-[#232323] p-3 text-center">
          <div className="text-[10px] text-[#71717A] font-mono mb-1">Debt-to-Equity</div>
          <div className="text-sm font-bold font-mono text-white">
            {metrics.debtToEquity !== undefined ? metrics.debtToEquity.toFixed(2) : 'N/A'}
          </div>
        </div>
        <div className="rounded bg-[#0D0D0D] border border-[#232323] p-3 text-center">
          <div className="text-[10px] text-[#71717A] font-mono mb-1">Quick Ratio</div>
          <div className="text-sm font-bold font-mono text-white">
            {metrics.quickRatio !== undefined ? metrics.quickRatio.toFixed(2) : 'N/A'}
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-green-500 mb-2">
            Financial Strengths
          </h4>
          <ul className="list-inside list-disc space-y-1.5 text-xs text-[#A1A1AA]">
            {report.strengths.map((str, idx) => (
              <li key={idx} className="leading-relaxed">{str}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-red-500 mb-2">
            Financial Weaknesses
          </h4>
          <ul className="list-inside list-disc space-y-1.5 text-xs text-[#A1A1AA]">
            {report.weaknesses.map((weak, idx) => (
              <li key={idx} className="leading-relaxed">{weak}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 border-t border-[#232323] pt-4">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#71717A] mb-1.5">
          Analyst Remarks
        </h4>
        <p className="text-xs text-[#A1A1AA] leading-relaxed italic">
          "{report.observations[0] || 'No specific observations logged.'}"
        </p>
      </div>
    </div>
  );
}
