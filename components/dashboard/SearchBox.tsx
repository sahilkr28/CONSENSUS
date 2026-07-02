'use client';

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import { YahooSearchMatch } from '@/services/yahoo.service';
import { COUNTRIES } from '@/lib/countries';

interface SearchBoxProps {
  onSelect: (match: YahooSearchMatch) => void;
  isLoading: boolean;
}

export default function SearchBox({ onSelect, isLoading }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('ALL');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [matches, setMatches] = useState<YahooSearchMatch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 2 || isLoading || isResolving) return;

    setIsResolving(true);
    setError(null);
    setMatches([]);
    setShowDropdown(false);

    try {
      const response = await axios.get(
        `/api/resolve/${encodeURIComponent(query)}?country=${country}`
      );
      const results = (response.data?.matches || []) as YahooSearchMatch[];

      if (results.length === 0) {
        setError('No operating companies found matching that query.');
      } else if (results.length === 1) {
        onSelect(results[0]);
      } else {
        setMatches(results);
        setShowDropdown(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resolve ticker symbol. Please try again.');
    } finally {
      setIsResolving(false);
    }
  };

  const handleMatchClick = (match: YahooSearchMatch) => {
    onSelect(match);
    setShowDropdown(false);
    setQuery(`${match.symbol} - ${match.name}`);
  };

  const activeCountry = COUNTRIES.find((c) => c.code === country);

  return (
    <div className="relative w-full max-w-lg mx-auto" ref={dropdownRef}>
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <div className="relative flex items-center w-full rounded-lg border border-[#232323] bg-[#111111]">
          
          {/* Custom Country Dropdown Trigger Container */}
          <div className="relative" ref={countryDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setShowCountryDropdown(!showCountryDropdown);
                setShowDropdown(false);
              }}
              disabled={isLoading || isResolving}
              className="h-11 px-3 border-r border-[#232323] bg-[#111111] text-xs font-mono text-[#A1A1AA] hover:text-white focus:outline-none flex items-center gap-1.5 select-none min-w-[75px] justify-between disabled:opacity-50 rounded-l-lg"
            >
              <div className="flex items-center gap-1">
                {activeCountry ? (
                  <img
                    src={`https://flagcdn.com/w20/${activeCountry.code.toLowerCase()}.png`}
                    alt={activeCountry.name}
                    className="w-4 h-3 rounded-sm object-cover"
                  />
                ) : (
                  <span>🌐</span>
                )}
                <span>{country}</span>
              </div>
              <span className="text-[8px] text-[#71717A]">▼</span>
            </button>

            {/* Custom Country Picker List */}
            {showCountryDropdown && (
              <div className="absolute left-0 z-50 mt-1.5 w-64 rounded-lg border border-[#232323] bg-[#111111] p-1.5 shadow-lg max-h-[300px] overflow-y-auto">
                <div className="px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-[#71717A] font-mono border-b border-[#232323]/50 mb-1">
                  Select Search Market
                </div>
                
                {/* Global Search Option */}
                <button
                  type="button"
                  onClick={() => {
                    setCountry('ALL');
                    setShowCountryDropdown(false);
                  }}
                  className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-xs text-[#A1A1AA] hover:bg-[#0D0D0D] hover:text-white transition-colors font-mono"
                >
                  <span className="w-4 text-center">🌐</span>
                  <span className="font-bold text-white">ALL</span>
                  <span className="text-[#71717A]">•</span>
                  <span className="truncate">Global Markets</span>
                </button>

                {/* Individual Countries list */}
                {COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setCountry(c.code);
                      setShowCountryDropdown(false);
                    }}
                    className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-left text-xs text-[#A1A1AA] hover:bg-[#0D0D0D] hover:text-white transition-colors font-mono"
                  >
                    <img
                      src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`}
                      alt={c.name}
                      className="w-4 h-3 rounded-sm object-cover shrink-0"
                    />
                    <span className="font-bold text-white">{c.code}</span>
                    <span className="text-[#71717A]">•</span>
                    <span className="truncate">{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Text Input */}
          <div className="relative flex-1 flex items-center">
            <Search className="h-4 w-4 absolute left-3.5 text-[#71717A]" />
            <input
              type="text"
              placeholder="Search company (e.g. Apple, BP, LVMH)..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setError(null);
              }}
              disabled={isLoading || isResolving}
              className="w-full bg-[#111111] pl-10 pr-24 py-3 text-sm text-white focus:outline-none placeholder-[#71717A] disabled:opacity-50"
            />
          </div>

          {/* Analyze / Resolve CTA Button */}
          <div className="absolute right-2 flex items-center gap-1.5 z-10">
            <button
              type="submit"
              disabled={query.trim().length < 2 || isLoading || isResolving}
              className="rounded bg-[#050505] border border-[#232323] px-3 py-1.5 text-xs font-medium text-[#A1A1AA] hover:bg-[#0D0D0D] hover:text-white transition-colors disabled:opacity-30"
            >
              {isResolving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                'Analyze'
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Disambiguation Dropdown Picker */}
      {showDropdown && matches.length > 0 && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-lg border border-[#232323] bg-[#111111] p-2 shadow-lg max-h-[250px] overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#71717A] font-mono border-b border-[#232323]/50 mb-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-blue-500" />
            Disambiguate Company Identity
          </div>
          <div className="space-y-1">
            {matches.map((match) => (
              <button
                key={match.symbol}
                onClick={() => handleMatchClick(match)}
                className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-xs text-[#A1A1AA] hover:bg-[#0D0D0D] hover:text-white transition-colors"
              >
                <div className="truncate flex-1">
                  <span className="font-bold text-white font-mono mr-2">${match.symbol}</span>
                  <span className="font-light">{match.name}</span>
                </div>
                <div className="text-[9px] font-mono text-[#71717A] shrink-0 ml-3">
                  {match.exchDisp} {match.sector && `• ${match.sector}`}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error notice */}
      {error && (
        <div className="mt-2.5 flex items-start gap-2 text-xs text-red-400 font-mono">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
