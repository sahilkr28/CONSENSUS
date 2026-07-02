'use client';

import React from 'react';
import Link from 'next/link';
import { Network, FileText, LogOut } from 'lucide-react';

export default function Navbar() {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch {
      // fallback redirect
      window.location.href = '/login';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#232323] bg-[#050505]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-mono font-bold tracking-wider text-white">
            <Network className="h-5 w-5 text-blue-500" />
            CONSENSUS
          </Link>
          <span className="rounded bg-[#111111] px-2 py-0.5 text-xs font-medium text-[#71717A] border border-[#232323]">
            v1.0.0
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-medium text-[#A1A1AA] hover:text-white transition-colors"
          >
            <FileText className="h-3.5 w-3.5" />
            Research Committee
          </Link>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs font-medium text-[#A1A1AA] hover:text-red-400 transition-colors border border-[#232323] rounded px-2.5 py-1 bg-[#111111]"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
