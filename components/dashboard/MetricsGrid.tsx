'use client';

import React from 'react';
import { CompanyInfo, FinancialMetrics } from '@/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface MetricsGridProps {
  companyInfo: CompanyInfo;
  metrics: FinancialMetrics;
  chartData: any[];
}

export default function MetricsGrid({
  companyInfo,
  metrics,
  chartData,
}: MetricsGridProps) {
  // Format numbers to short currency formats (e.g. 1.2T, 300B)
  const formatCurrency = (val: number | undefined) => {
    if (val === undefined) return 'N/A';
    if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded border border-[#232323] bg-[#111111] p-3 text-xs font-mono">
          <p className="text-[#71717A]">{payload[0].payload.date}</p>
          <p className="text-white font-bold">${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Chart Section */}
      <div className="rounded-lg border border-[#232323] bg-[#111111] p-6 md:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">
              Historical Price Performance (180D)
            </h3>
            <span className="text-xl font-bold font-mono tracking-tight text-white mt-1 block">
              ${companyInfo.currentPrice ? companyInfo.currentPrice.toFixed(2) : 'N/A'}
            </span>
          </div>
          <div className="text-right text-[10px] font-mono text-[#71717A]">
            <div>52W Range</div>
            <div className="text-white font-bold mt-0.5">
              ${companyInfo.fiftyTwoWeekLow?.toFixed(2) || 'N/A'} - ${companyInfo.fiftyTwoWeekHigh?.toFixed(2) || 'N/A'}
            </div>
          </div>
        </div>
        
        {/* Recharts Performance Line */}
        <div className="h-[200px] w-full">
          {chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#171717" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#71717A', fontSize: 9 }}
                  axisLine={{ stroke: '#232323' }}
                  tickLine={{ stroke: '#232323' }}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fill: '#71717A', fontSize: 9 }}
                  axisLine={{ stroke: '#232323' }}
                  tickLine={{ stroke: '#232323' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke="#3B82F6"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-[#71717A] italic border border-dashed border-[#232323] rounded">
              Historical chart points unavailable.
            </div>
          )}
        </div>
      </div>

      {/* Stock Summary Table */}
      <div className="rounded-lg border border-[#232323] bg-[#111111] p-6 flex flex-col justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717A] border-b border-[#232323] pb-3 mb-3">
          Equity Profile Details
        </h3>
        
        <div className="flex-1 space-y-3 font-mono text-[11px]">
          <div className="flex justify-between">
            <span className="text-[#71717A]">Market Cap:</span>
            <span className="text-white font-bold">{formatCurrency(companyInfo.marketCap)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#71717A]">P/E Ratio (Trailing):</span>
            <span className="text-white font-bold">{companyInfo.peRatio?.toFixed(2) || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#71717A]">EPS (Trailing):</span>
            <span className="text-white font-bold">${companyInfo.eps?.toFixed(2) || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#71717A]">Sector:</span>
            <span className="text-white font-bold truncate max-w-[150px]">{companyInfo.sector || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#71717A]">Industry:</span>
            <span className="text-white font-bold truncate max-w-[150px]">{companyInfo.industry || 'N/A'}</span>
          </div>
          {companyInfo.website && (
            <div className="flex justify-between">
              <span className="text-[#71717A]">Website:</span>
              <a
                href={companyInfo.website}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline font-bold truncate max-w-[150px]"
              >
                {companyInfo.website.replace('https://', '').replace('www.', '')}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
