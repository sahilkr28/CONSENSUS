import React from 'react';
import { DebateResult } from '@/types';
import { MinusCircle } from 'lucide-react';

interface BearCardProps {
  report: DebateResult | undefined;
}

export default function BearCard({ report }: BearCardProps) {
  if (!report) return null;

  return (
    <div className="rounded-lg border border-red-500/10 bg-[#111111] p-6 glow-border">
      <div className="flex items-center justify-between border-b border-[#232323] pb-4 mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
          <MinusCircle className="h-4 w-4 text-red-500" />
          Bear Case Thesis
        </h3>
        <span className="rounded bg-red-950/20 border border-red-500/20 px-2 py-0.5 text-xs font-bold font-mono text-red-400">
          Confidence: {(report.confidence * 100).toFixed(0)}%
        </span>
      </div>

      <div className="space-y-4">
        {report.arguments.map((arg, idx) => (
          <div key={idx} className="rounded bg-[#0D0D0D] border border-[#232323] p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="text-xs font-bold text-white leading-snug">
                {arg.claim}
              </h4>
              <span className="rounded bg-blue-950/20 border border-blue-500/20 px-1.5 py-0.5 text-[9px] font-mono text-blue-400 shrink-0 uppercase">
                {arg.evidenceId}
              </span>
            </div>
            <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
              {arg.reasoning}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
