'use client';

import React, { useState } from 'react';
import { FinalReport } from '@/types';
import Disclaimer from '../shared/Disclaimer';
import { ShieldCheck, Flame, Scale, TrendingUp, AlertOctagon, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [isConfidenceOpen, setIsConfidenceOpen] = useState(false);
  const verdict = report.judgeVerdict;
  const score = report.consensusScore;

  if (!verdict || !score) return null;

  // Feature 1: Committee Debate Arguments & Recommendation Setup
  const bullConf = report.bullCase ? (report.bullCase.confidence * 100).toFixed(0) : '50';
  const bearConf = report.bearCase ? (report.bearCase.confidence * 100).toFixed(0) : '50';
  
  const bullRec = report.bullCase && report.bullCase.confidence >= 0.5 ? 'BUY' : 'HOLD';
  const bearRec = report.bearCase && report.bearCase.confidence >= 0.5 ? 'SELL' : 'HOLD';

  let bullArgs = verdict.strongestBullArguments && verdict.strongestBullArguments.length > 0
    ? verdict.strongestBullArguments.slice(0, 3)
    : (report.bullCase?.arguments || []).map((a) => a.claim).slice(0, 3);
  if (bullArgs.length === 0) {
    bullArgs = ['Evidence indicates potential positive catalysts.'];
  }

  let bearArgs = verdict.strongestBearArguments && verdict.strongestBearArguments.length > 0
    ? verdict.strongestBearArguments.slice(0, 3)
    : (report.bearCase?.arguments || []).map((a) => a.claim).slice(0, 3);
  if (bearArgs.length === 0) {
    bearArgs = ['Evidence suggests possible market or execution risks.'];
  }

  const getFallbackReason = () => {
    const side = verdict.recommendation;
    if (side === 'BUY') {
      return `The Chairperson favored a BUY stance because the Bull Committee's arguments regarding key performance drivers and financial strength were determined to be more compelling and backed by higher-reliability evidence than the Bear Committee's risk considerations.`;
    } else if (side === 'SELL') {
      return `The Chairperson concluded with a SELL decision as the Bear Committee presented highly credible and severe concerns regarding valuation premium and execution challenges that outweighed the positive growth arguments put forward by the Bull Committee.`;
    } else {
      return `The Chairperson determined a HOLD recommendation is most appropriate. The high degree of uncertainty, balanced debate arguments from both committees, and unresolved evidence gaps call for a neutral stance until further forward guidance is available.`;
    }
  };
  const chairpersonReason = verdict.chairpersonReason || getFallbackReason();

  // Feature 2: Dynamic Confidence Breakdown Checklist Items
  const breakdownItems: { isPositive: boolean; label: string }[] = [];

  // 1. Financial report check
  if (report.financialReport) {
    breakdownItems.push({ isPositive: true, label: 'Financial statements available' });
  } else {
    breakdownItems.push({ isPositive: false, label: 'Financial statements unavailable' });
  }

  // 2. Market report check
  if (report.marketReport) {
    breakdownItems.push({ isPositive: true, label: 'Market data available' });
  } else {
    breakdownItems.push({ isPositive: false, label: 'Market data unavailable' });
  }

  // 3. News report check
  if (report.newsReport) {
    breakdownItems.push({ isPositive: true, label: 'Recent news analyzed' });
  } else {
    breakdownItems.push({ isPositive: false, label: 'Recent news unavailable' });
  }

  // 4. Analyst opinions agreement check
  const hasConflict = report.bullCase && report.bearCase && 
                      report.bullCase.confidence > 0.7 && report.bearCase.confidence > 0.7;
  if (hasConflict) {
    breakdownItems.push({ isPositive: false, label: 'Conflicting analyst viewpoints (disagreement lowers confidence)' });
  } else {
    breakdownItems.push({ isPositive: true, label: 'Multiple analyst opinions agree' });
  }

  // 5. Missing information items from Judge
  if (verdict.missingInformation && verdict.missingInformation.length > 0) {
    verdict.missingInformation.forEach((info) => {
      breakdownItems.push({ isPositive: false, label: `Missing ${info.toLowerCase()}` });
    });
  }

  // 6. Contradictions/Unresolved claims check
  const hasContradictions = (score.contradictionDeduction && score.contradictionDeduction > 0) || 
                            (verdict.weakestEvidence && verdict.weakestEvidence.length > 0);
  if (hasContradictions) {
    breakdownItems.push({ isPositive: false, label: 'Unresolved contradictions in analyst claims' });
  }

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
          <div className="mt-4 text-xs text-[#A1A1AA] flex flex-col items-center gap-1.5 w-full">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
              Confidence: {(verdict.confidence * 100).toFixed(0)}%
            </div>
            
            <button
              onClick={() => setIsConfidenceOpen(!isConfidenceOpen)}
              className="mt-2.5 flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-blue-500 hover:text-blue-400 transition-colors focus:outline-none"
            >
              {isConfidenceOpen ? (
                <>
                  Hide Breakdown
                  <ChevronUp className="h-3 w-3" />
                </>
              ) : (
                <>
                  Why Confidence Isn't Higher
                  <ChevronDown className="h-3 w-3" />
                </>
              )}
            </button>
          </div>

          {isConfidenceOpen && (
            <div className="mt-4 w-full rounded border border-[#232323] bg-[#050505] p-4 text-left space-y-3">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#71717A] block border-b border-[#232323] pb-1.5">
                Confidence Breakdown
              </span>
              <ul className="space-y-1.5 text-[11px] font-mono">
                {breakdownItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    {item.isPositive ? (
                      <span className="text-green-500 shrink-0 font-bold">✓</span>
                    ) : (
                      <span className="text-yellow-500 shrink-0 font-bold">⚠</span>
                    )}
                    <span className={item.isPositive ? 'text-[#A1A1AA]' : 'text-yellow-500/90'}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-[#232323] pt-2 flex items-center justify-between text-[10px] font-bold font-mono">
                <span className="text-[#71717A] uppercase">Overall Confidence</span>
                <span className="text-white">{(verdict.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          )}
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

      {/* Investment Committee Debate */}
      <div className="rounded-lg border border-[#232323] bg-[#111111] p-6 space-y-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-1.5 border-b border-[#232323] pb-3">
          <Scale className="h-4 w-4 text-blue-500" />
          Investment Committee Debate
        </h3>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Bull Committee */}
          <div className="rounded-lg border border-green-500/10 bg-[#0D0D0D] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#232323] pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-green-400">
                Bull Committee
              </h4>
              <div className="flex gap-2">
                <span className="rounded bg-green-950/30 border border-green-500/20 px-2 py-0.5 text-[10px] font-bold font-mono text-green-400">
                  Confidence: {bullConf}%
                </span>
                <span className="rounded bg-green-950/30 border border-green-500/20 px-2 py-0.5 text-[10px] font-bold font-mono text-green-400">
                  {bullRec}
                </span>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-[#A1A1AA]">
              {bullArgs.map((arg, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5 font-bold">✓</span>
                  <span>{arg}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bear Committee */}
          <div className="rounded-lg border border-red-500/10 bg-[#0D0D0D] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#232323] pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">
                Bear Committee
              </h4>
              <div className="flex gap-2">
                <span className="rounded bg-red-950/30 border border-red-500/20 px-2 py-0.5 text-[10px] font-bold font-mono text-red-400">
                  Confidence: {bearConf}%
                </span>
                <span className="rounded bg-red-950/30 border border-red-500/20 px-2 py-0.5 text-[10px] font-bold font-mono text-red-400">
                  {bearRec}
                </span>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-[#A1A1AA]">
              {bearArgs.map((arg, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5 font-bold">•</span>
                  <span>{arg}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Chairperson Decision */}
        <div className="border-t border-[#232323] pt-4 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">
            Chairperson Decision
          </h4>
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-[#A1A1AA]">Final Verdict:</span>
            <span className={`text-sm font-bold tracking-wider font-mono ${
              verdict.recommendation === 'BUY' ? 'text-green-400' :
              verdict.recommendation === 'SELL' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {verdict.recommendation}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-[#A1A1AA]">
            {chairpersonReason}
          </p>
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
