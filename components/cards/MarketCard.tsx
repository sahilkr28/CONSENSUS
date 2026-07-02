import React from 'react';
import { MarketResult } from '@/types';
import { Globe, Shield, HelpCircle } from 'lucide-react';

interface MarketCardProps {
  report: MarketResult | undefined;
}

export default function MarketCard({ report }: MarketCardProps) {
  if (!report) return null;

  return (
    <div className="rounded-lg border border-[#232323] bg-[#111111] p-6 glow-border">
      <div className="flex items-center justify-between border-b border-[#232323] pb-4 mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-1.5">
          <Globe className="h-4 w-4 text-blue-500" />
          Market Position & Competitor Overview
        </h3>
        {report.industryGrowthRate && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[#71717A] font-mono">Growth:</span>
            <span className="text-xs font-bold font-mono text-white">
              {report.industryGrowthRate}
            </span>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#71717A] mb-1.5">
          Industry Positioning
        </h4>
        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          {report.marketPosition}
        </p>
      </div>

      {/* Competitors List */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-1.5 mb-2.5">
            <Shield className="h-3.5 w-3.5 text-blue-500" />
            Key Competitor Mappings
          </h4>
          <div className="space-y-2">
            {report.competitors.length > 0 ? (
              report.competitors.map((comp, idx) => (
                <div key={idx} className="rounded bg-[#0D0D0D] border border-[#232323] p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white font-mono">{comp.name}</span>
                    {comp.marketShare && (
                      <span className="text-[10px] text-[#71717A] font-mono">Share: {comp.marketShare}</span>
                    )}
                  </div>
                  {comp.strengths && (
                    <p className="text-[10px] text-[#A1A1AA] mt-1 italic">
                      Strengths: {comp.strengths}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-[#71717A] italic">No direct competitors flagged.</p>
            )}
          </div>
        </div>

        {/* Macro Factors */}
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-1.5 mb-2.5">
            <HelpCircle className="h-3.5 w-3.5 text-blue-500" />
            Macroeconomic Headwinds & Trends
          </h4>
          <ul className="list-inside list-disc space-y-1.5 text-xs text-[#A1A1AA]">
            {report.macroFactors.map((fact, idx) => (
              <li key={idx} className="leading-relaxed">{fact}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
