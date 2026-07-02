'use client';

import React from 'react';
import { CompanyInfo } from '@/types';
import { getCompanyLogoUrl } from '@/services/logo.service';
import { ExternalLink, Landmark, MapPin } from 'lucide-react';

interface CompanyHeaderProps {
  companyInfo: CompanyInfo;
}

export default function CompanyHeader({ companyInfo }: CompanyHeaderProps) {
  const logoUrl = getCompanyLogoUrl(companyInfo.website, companyInfo.name);

  return (
    <div className="flex flex-col gap-4 border-b border-[#232323] bg-[#111111] p-6 sm:flex-row sm:items-center sm:justify-between rounded-lg">
      <div className="flex items-center gap-4">
        {/* Logo container */}
        <div className="h-16 w-16 overflow-hidden rounded-md border border-[#232323] bg-[#050505] p-1 flex items-center justify-center shrink-0">
          <img
            src={logoUrl}
            alt={`${companyInfo.name} logo`}
            className="h-full w-full object-contain"
            onError={(e) => {
              // Fallback to SVG letter placeholder if load fails
              const initials = companyInfo.name
                .split(' ')
                .slice(0, 2)
                .map((word) => word[0])
                .join('')
                .toUpperCase();
              e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23050505"/><text x="50%" y="55%" font-family="Geist,Inter,sans-serif" font-weight="bold" font-size="36" fill="%23A1A1AA" dominant-baseline="middle" text-anchor="middle">${initials}</text></svg>`;
            }}
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">
              {companyInfo.name}
            </h1>
            <span className="rounded bg-blue-950/20 border border-blue-500/20 px-2 py-0.5 text-xs font-bold font-mono text-blue-400">
              ${companyInfo.ticker}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#71717A] font-mono">
            <div className="flex items-center gap-1">
              <Landmark className="h-3.5 w-3.5" />
              {companyInfo.sector || 'Sector N/A'}
            </div>
            {companyInfo.industry && (
              <>
                <span>•</span>
                <div>{companyInfo.industry}</div>
              </>
            )}
            {(companyInfo.city || companyInfo.country) && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1 text-blue-400">
                  <MapPin className="h-3.5 w-3.5" />
                  HQ: {[companyInfo.city, companyInfo.state, companyInfo.country].filter(Boolean).join(', ')}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:text-right">
        {companyInfo.currentPrice && (
          <div>
            <div className="text-xs text-[#71717A] font-mono">Current Price</div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">
              ${companyInfo.currentPrice.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
