import React from 'react';
import { BusinessResult } from '@/types';
import { Award, Layers, Users } from 'lucide-react';

interface BusinessCardProps {
  report: BusinessResult | undefined;
}

export default function BusinessCard({ report }: BusinessCardProps) {
  if (!report) return null;

  const getMoatColor = (moat: string) => {
    switch (moat) {
      case 'Wide':
        return 'bg-green-950/20 border-green-500/30 text-green-400';
      case 'Narrow':
        return 'bg-blue-950/20 border-blue-500/30 text-blue-400';
      default:
        return 'bg-zinc-900 border-zinc-700 text-[#71717A]';
    }
  };

  return (
    <div className="rounded-lg border border-[#232323] bg-[#111111] p-6 glow-border">
      <div className="flex items-center justify-between border-b border-[#232323] pb-4 mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-1.5">
          <Award className="h-4 w-4 text-blue-500" />
          Business Moat & Competitive Moat
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#71717A] font-mono">Economic Moat:</span>
          <span className={`rounded border px-2 py-0.5 text-xs font-bold font-mono ${getMoatColor(report.moatRating)}`}>
            {report.moatRating} Moat
          </span>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          {report.moatDescription}
        </p>
      </div>

      {/* Customer & Revenue Breakdown */}
      <div className="grid gap-4 mb-6 md:grid-cols-2">
        <div className="rounded bg-[#0D0D0D] border border-[#232323] p-4">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-1.5 mb-2">
            <Users className="h-3.5 w-3.5 text-blue-500" />
            Customer Segments & Lock-In
          </h4>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            {report.customerBase}
          </p>
        </div>

        <div className="rounded bg-[#0D0D0D] border border-[#232323] p-4">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-1.5 mb-2">
            <Layers className="h-3.5 w-3.5 text-blue-500" />
            Core Revenue Stream Distribution
          </h4>
          <ul className="list-inside list-disc space-y-1 text-xs text-[#A1A1AA]">
            {report.revenueStreams.map((stream, idx) => (
              <li key={idx} className="truncate leading-relaxed">{stream}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-green-500 mb-2">
            Model Strengths
          </h4>
          <ul className="list-inside list-disc space-y-1.5 text-xs text-[#A1A1AA]">
            {report.strengths.map((str, idx) => (
              <li key={idx} className="leading-relaxed">{str}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-red-500 mb-2">
            Model Vulnerabilities
          </h4>
          <ul className="list-inside list-disc space-y-1.5 text-xs text-[#A1A1AA]">
            {report.weaknesses.map((weak, idx) => (
              <li key={idx} className="leading-relaxed">{weak}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
