import React from 'react';
import { NewsResult } from '@/types';
import { MessageSquare, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface NewsCardProps {
  report: NewsResult | undefined;
}

export default function NewsCard({ report }: NewsCardProps) {
  if (!report) return null;

  const getSentimentBadge = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-950/20 border-green-500/30 text-green-400';
      case 'negative':
        return 'bg-red-950/20 border-red-500/30 text-red-400';
      default:
        return 'bg-zinc-900 border-zinc-700 text-[#71717A]';
    }
  };

  const getImpactColor = (score: number) => {
    if (score >= 4) return 'text-red-400 bg-red-950/20 border border-red-500/20';
    if (score >= 2) return 'text-yellow-400 bg-yellow-950/20 border border-yellow-500/20';
    return 'text-green-400 bg-green-950/20 border border-green-500/20';
  };

  return (
    <div className="rounded-lg border border-[#232323] bg-[#111111] p-6 glow-border">
      <div className="flex items-center justify-between border-b border-[#232323] pb-4 mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4 text-blue-500" />
          News Sentiment & Headlines
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#71717A] font-mono">Score: {report.sentimentScore}</span>
          <span className={`rounded border px-2 py-0.5 text-xs font-bold font-mono uppercase ${getSentimentBadge(report.overallSentiment)}`}>
            {report.overallSentiment}
          </span>
        </div>
      </div>

      <div className="mb-6 rounded bg-[#0D0D0D] border border-[#232323] p-4">
        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          {report.summary}
        </p>
      </div>

      <div>
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-[#71717A] mb-3">
          Parsed News Coverage
        </h4>
        <div className="space-y-3">
          {report.topArticles.slice(0, 5).map((article, idx) => (
            <div key={idx} className="border-b border-[#232323]/50 pb-3 last:border-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <a
                    href={article.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-white hover:text-blue-400 hover:underline line-clamp-1 leading-snug"
                  >
                    {article.title}
                  </a>
                  <p className="text-[10px] text-[#71717A] mt-0.5 font-mono">
                    Source: {article.source} | {new Date(article.publishedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0 font-mono text-[9px]">
                  <span className={`rounded px-1.5 py-0.5 ${getSentimentBadge(article.sentiment)}`}>
                    {article.sentiment}
                  </span>
                  <span className={`rounded px-1.5 py-0.5 ${getImpactColor(article.impactScore)}`}>
                    Impact {article.impactScore}/5
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
