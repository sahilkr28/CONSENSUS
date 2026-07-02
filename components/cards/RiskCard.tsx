import React from 'react';
import { RiskResult } from '@/types';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface RiskCardProps {
  report: RiskResult | undefined;
}

export default function RiskCard({ report }: RiskCardProps) {
  if (!report) return null;

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'High':
        return 'text-red-400 bg-red-950/20 border border-red-500/20';
      case 'Medium':
        return 'text-yellow-400 bg-yellow-950/20 border border-yellow-500/20';
      default:
        return 'text-green-400 bg-green-950/20 border border-green-500/20';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-400 border-red-500/30 bg-red-950/20';
    if (score >= 40) return 'text-yellow-400 border-yellow-500/30 bg-yellow-950/20';
    return 'text-green-400 border-green-500/30 bg-green-950/20';
  };

  return (
    <div className="rounded-lg border border-yellow-500/10 bg-[#111111] p-6 glow-border">
      <div className="flex items-center justify-between border-b border-[#232323] pb-4 mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-yellow-500 flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 text-yellow-500" />
          Risk Assessment & Profile
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#71717A] font-mono">Overall Risk:</span>
          <span className={`rounded border px-2 py-0.5 text-xs font-bold font-mono ${getRiskScoreColor(report.overallRiskScore)}`}>
            {report.overallRiskScore}/100
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {report.risks.map((risk, idx) => (
          <div key={idx} className="rounded bg-[#0D0D0D] border border-[#232323] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase text-[#71717A]">
                  [{risk.category}]
                </span>
                <span className={`rounded px-1.5 py-0.2 text-[8px] font-bold font-mono ${getSeverityColor(risk.severity)}`}>
                  {risk.severity} Severity
                </span>
                <span className={`rounded px-1.5 py-0.2 text-[8px] font-bold font-mono ${getSeverityColor(risk.likelihood)}`}>
                  {risk.likelihood} Likelihood
                </span>
              </div>
              <span className="rounded bg-blue-950/20 border border-blue-500/20 px-1.5 py-0.5 text-[9px] font-mono text-blue-400 uppercase">
                {risk.evidenceId}
              </span>
            </div>
            <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
              {risk.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
