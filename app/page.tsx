'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SearchBox from '@/components/dashboard/SearchBox';
import { YahooSearchMatch } from '@/services/yahoo.service';
import { Network, Database, Scale, ShieldAlert, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();

  const handleSelectCompany = (match: YahooSearchMatch) => {
    // Navigate to dashboard with query parameters to trigger analysis
    router.push(`/dashboard?ticker=${match.symbol}&companyName=${encodeURIComponent(match.name)}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-white">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center items-center px-4 py-16 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mb-12">
          <h2 className="text-sm font-mono font-bold uppercase tracking-[0.2em] text-blue-500">
            Multi-Agent AI Investment Research
          </h2>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-[#71717A] bg-clip-text text-transparent leading-none">
            CONSENSUS
          </h1>
          <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed max-w-lg mx-auto">
            Watch specialized AI analysts research, debate, and justify every investment decision in a live transparent reasoning graph.
          </p>
        </div>

        {/* Search Panel */}
        <div className="w-full mb-16">
          <SearchBox onSelect={handleSelectCompany} isLoading={false} />
          <div className="mt-3 text-center text-[10px] font-mono text-[#71717A]">
            Search by company name or stock ticker.
          </div>
        </div>

        {/* Interactive Visual Graph Preview */}
        <div className="w-full rounded-xl border border-[#232323] bg-[#0D0D0D] p-6 mb-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#3B82F608_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="relative z-10 flex flex-col items-center">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#71717A] mb-6 font-mono">
              Research Committee Orchestration Flow
            </span>

            {/* Simulated mini node graph with Framer Motion */}
            <div className="flex flex-col gap-4 items-center w-full max-w-lg">
              <div className="flex justify-between w-full">
                <div className="rounded border border-blue-500/30 bg-blue-950/20 px-3 py-1.5 text-[9px] font-mono text-blue-400">
                  Planner Agent
                </div>
                <div className="rounded border border-green-500/20 bg-[#111111] px-3 py-1.5 text-[9px] font-mono text-[#71717A]">
                  Ticker Resolver
                </div>
                <div className="rounded border border-green-500/20 bg-[#111111] px-3 py-1.5 text-[9px] font-mono text-[#71717A]">
                  Research Coord
                </div>
              </div>

              {/* Connecting Dot Animation */}
              <div className="w-0.5 h-6 bg-gradient-to-b from-blue-500 to-[#232323]" />

              <div className="grid grid-cols-4 gap-2 w-full">
                <div className="rounded border border-[#232323] bg-[#111111] p-2 text-center text-[9px] font-mono text-[#71717A]">
                  Financials
                </div>
                <div className="rounded border border-[#232323] bg-[#111111] p-2 text-center text-[9px] font-mono text-[#71717A]">
                  Business Moat
                </div>
                <div className="rounded border border-[#232323] bg-[#111111] p-2 text-center text-[9px] font-mono text-[#71717A]">
                  News Sentiment
                </div>
                <div className="rounded border border-[#232323] bg-[#111111] p-2 text-center text-[9px] font-mono text-[#71717A]">
                  Market Trends
                </div>
              </div>

              <div className="w-0.5 h-6 bg-[#232323]" />

              <div className="rounded border border-blue-500/30 bg-blue-950/20 px-4 py-2 text-center text-xs font-mono text-blue-400 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 animate-pulse" />
                Consensus Engine
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-3 w-full">
          <div className="rounded-lg border border-[#232323] bg-[#111111] p-5">
            <Network className="h-5 w-5 text-blue-500 mb-3" />
            <h3 className="text-xs font-bold font-mono text-white mb-2 uppercase tracking-wider">
              Parallel Multi-Agent Debate
            </h3>
            <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
              Consensus splits company research across multiple analysts (Financial, Business, Market, News) then runs Bull/Bear debate rounds.
            </p>
          </div>
          <div className="rounded-lg border border-[#232323] bg-[#111111] p-5">
            <Database className="h-5 w-5 text-blue-500 mb-3" />
            <h3 className="text-xs font-bold font-mono text-white mb-2 uppercase tracking-wider">
              Strict Evidence Constraints
            </h3>
            <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
              Every claim in our debate or report cards links directly back to a retrieved fact or data node in the Evidence Vault.
            </p>
          </div>
          <div className="rounded-lg border border-[#232323] bg-[#111111] p-5">
            <Scale className="h-5 w-5 text-blue-500 mb-3" />
            <h3 className="text-xs font-bold font-mono text-white mb-2 uppercase tracking-wider">
              Mathematical Score weighting
            </h3>
            <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
              Instead of averaging LLM decisions, the Consensus Engine calculates confidence parameters from contradictions and missing info.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
