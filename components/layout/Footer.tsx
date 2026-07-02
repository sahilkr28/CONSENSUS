import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#232323] bg-[#050505] py-8 text-center text-xs text-[#71717A]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-left text-[11px] leading-relaxed max-w-xl">
            CONSENSUS is an educational/portfolio demonstration platform. All market quotes, financials, 
            and news events are sourced from third-party APIs (Yahoo Finance, NewsAPI, and Tavily) and 
            should not be guaranteed accurate, complete, or current.
          </p>
          <div className="text-right">
            <p>&copy; {new Date().getFullYear()} CONSENSUS. MIT License.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
