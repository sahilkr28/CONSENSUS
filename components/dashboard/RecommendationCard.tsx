'use client';

import React from 'react';
import { FinalReport } from '@/types';
import Disclaimer from '../shared/Disclaimer';
import { ShieldCheck, Flame, Scale, TrendingUp, AlertOctagon } from 'lucide-react';

interface RecommendationCardProps {
  report: FinalReport;
  cacheAge: number | null;
  onRerun: () => void;
  isLoading: boolean;
}

export default function RecommendationCard({
  report,
  cacheAge,
  onRerun,
  isLoading,
}: RecommendationCardProps) {
  const verdict = report.judgeVerdict;
  const score = report.consensusScore;

  if (!verdict || !score) return null;

  const getVerdictStyles = (rec: string) => {
    switch (rec) {
      case 'BUY':
        return 'bg-green-950/30 text-green-400 border-green-500/30';
      case 'SELL':
        return 'bg-red-950/30 text-red-400 border-red-500/30';
      default:
        return 'bg-yellow-950/30 text-yellow-400 border-yellow-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer Header */}
      <Disclaimer />

      {/* Main Committee Score Card */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Consensus Score Dial */}
        <div className="flex flex-col items-center justify-center rounded-lg border border-[#232323] bg-[#111111] p-6 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#71717A] mb-3">
            Consensus Score
          </span>
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-blue-500/20 bg-blue-950/5">
            <span className="text-3xl font-bold tracking-tight font-mono text-white">
              {score.score}
            </span>
            <span className="text-[10px] text-[#71717A] font-mono absolute bottom-3">/ 100</span>
          </div>
          
          <div className="mt-4 flex items-center gap-1.5 text-xs text-[#A1A1AA]">
            <Scale className="h-3.5 w-3.5 text-blue-500" />
            Weighted Evidence
          </div>
        </div>

        {/* CIO Verdict Rating */}
        <div className="flex flex-col items-center justify-center rounded-lg border border-[#232323] bg-[#111111] p-6 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#71717A] mb-3">
            CIO Verdict Stance
          </span>
          <div className={`rounded-lg border px-6 py-3 text-2xl font-bold tracking-widest font-mono shadow-sm ${getVerdictStyles(verdict.recommendation)}`}>
            {verdict.recommendation}
          </div>
          <div className="mt-4 text-xs text-[#A1A1AA] flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
            Confidence: {(verdict.confidence * 100).toFixed(0)}%
          </div>
        </div>

        {/* Cache Age Info */}
        <div className="flex flex-col items-center justify-center rounded-lg border border-[#232323] bg-[#111111] p-6 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#71717A] mb-3">
            Analysis Freshness
          </span>
          <div className="text-sm font-medium text-white font-mono leading-tight">
            {cacheAge !== null ? `Cached ${cacheAge}m ago` : 'Real-time Run'}
          </div>
          <button
            onClick={onRerun}
            disabled={isLoading}
            className="mt-6 rounded-md border border-[#232323] bg-[#050505] px-4 py-1.5 text-[10px] font-medium text-[#A1A1AA] hover:bg-[#0D0D0D] hover:text-white transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Running Graph...' : 'Re-run Analysis'}
          </button>
        </div>
      </div>

      {/* CIO Thesis Memo */}
      <div className="rounded-lg border border-[#232323] bg-[#111111] p-6">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          Executive Committee Thesis
        </h3>
        <p className="text-sm leading-relaxed text-white">
          {verdict.summary}
        </p>
        <div className="mt-4 border-t border-[#232323] pt-4">
          <h4 className="text-[11px] font-semibold uppercase text-[#71717A] tracking-wider mb-2">
            Verbatim CIO Rationale
          </h4>
          <p className="text-xs text-[#A1A1AA] leading-relaxed whitespace-pre-line">
            {verdict.reasoning}
          </p>
        </div>

        {/* Confidence Gaps, Contradictions, and Missing Info */}
        {score.confidenceGap.length > 0 && (
          <div className="mt-5 rounded border border-yellow-500/20 bg-yellow-950/5 p-3 text-[11px] text-[#FACC15]">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider mb-1">
              <AlertOctagon className="h-3.5 w-3.5" />
              Identified Confidence Gaps & Missing Information
            </div>
            <ul className="list-inside list-disc space-y-1 mt-1 text-[#A1A1AA] font-mono">
              {score.confidenceGap.map((gap, i) => (
                <li key={i}>{gap}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
