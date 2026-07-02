'use client';

import React, { useState } from 'react';
import { EvidenceItem } from '@/types';
import { Database, Search, ShieldCheck } from 'lucide-react';

interface EvidencePanelProps {
  evidence: EvidenceItem[];
}

export default function EvidencePanel({ evidence }: EvidencePanelProps) {
  const [filter, setFilter] = useState<'all' | 'financial' | 'business' | 'news' | 'market'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvidence = evidence.filter((item) => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch = item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getReliabilityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400 bg-green-950/20 border border-green-500/20';
    if (score >= 0.5) return 'text-yellow-400 bg-yellow-950/20 border border-yellow-500/20';
    return 'text-red-400 bg-red-950/20 border border-red-500/20';
  };

  return (
    <div className="rounded-lg border border-[#232323] bg-[#111111] p-6 glow-border">
      <div className="flex flex-col gap-4 border-b border-[#232323] pb-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717A] flex items-center gap-1.5">
          <Database className="h-4 w-4 text-blue-500" />
          Consolidated Evidence Vault
        </h3>
        
        {/* Search */}
        <div className="relative flex items-center shrink-0">
          <Search className="h-3 w-3 absolute left-2.5 text-[#71717A]" />
          <input
            type="text"
            placeholder="Search claims..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded border border-[#232323] bg-[#050505] pl-8 pr-3 py-1 text-[11px] text-white focus:outline-none focus:border-blue-500/50 w-full sm:w-48 font-mono"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {(['all', 'financial', 'business', 'news', 'market'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded px-3 py-1 text-[10px] font-mono border transition-all uppercase ${
              filter === tab
                ? 'bg-blue-950/20 border-blue-500/30 text-blue-400 font-bold'
                : 'border-[#232323] bg-[#050505] text-[#71717A] hover:border-zinc-700 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Evidence items list */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {filteredEvidence.length > 0 ? (
          filteredEvidence.map((item) => (
            <div key={item.id} className="rounded border border-[#232323] bg-[#0D0D0D] p-3">
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-blue-950/20 border border-blue-500/20 px-1 py-0.2 text-[8px] font-mono text-blue-400 font-bold uppercase shrink-0">
                    {item.id}
                  </span>
                  <span className="text-[9px] font-mono text-[#71717A] truncate max-w-[120px]">
                    {item.source}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <ShieldCheck className="h-3 w-3 text-blue-500" />
                  <span className={`rounded px-1.5 py-0.2 text-[8px] font-mono font-bold ${getReliabilityColor(item.reliability)}`}>
                    Rel: {Math.round(item.reliability * 100)}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#A1A1AA] leading-relaxed select-text">
                {item.text}
              </p>
            </div>
          ))
        ) : (
          <p className="text-xs text-[#71717A] italic text-center py-6">
            No matching evidence found.
          </p>
        )}
      </div>
    </div>
  );
}
