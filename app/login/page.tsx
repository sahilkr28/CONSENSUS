'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Lock, User, Network, Loader2, AlertCircle } from 'lucide-react';
import Footer from '@/components/layout/Footer';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
      });

      if (response.data?.success) {
        router.refresh(); // Refresh page contexts
        router.push('/'); // Direct to home page
      } else {
        setError('Authentication response was invalid.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Invalid credentials or login failed.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-white">
      {/* Brand Header */}
      <header className="sticky top-0 z-50 w-full border-b border-[#232323] bg-[#050505]/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-mono font-bold tracking-wider text-white">
            <Network className="h-5 w-5 text-blue-500" />
            CONSENSUS
          </div>
        </div>
      </header>

      {/* Login Card */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm rounded-xl border border-[#232323] bg-[#111111] p-8 shadow-xl space-y-6 glow-border">
          <div className="text-center space-y-2">
            <h2 className="text-sm font-mono font-semibold uppercase tracking-wider text-blue-500">
              Access Required
            </h2>
            <h1 className="text-xl font-bold tracking-tight text-white font-mono uppercase">
              Terminal Login
            </h1>
            <p className="text-[11px] text-[#71717A] leading-relaxed">
              Enter terminal access credentials to unlock research committee maps.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#71717A]">
                Username
              </label>
              <div className="relative flex items-center">
                <User className="h-4 w-4 absolute left-3.5 text-[#71717A]" />
                <input
                  type="text"
                  required
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-[#232323] bg-[#050505] pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 placeholder-[#71717A] disabled:opacity-50 font-mono"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#71717A]">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="h-4 w-4 absolute left-3.5 text-[#71717A]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full rounded-lg border border-[#232323] bg-[#050505] pl-10 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/50 placeholder-[#71717A] disabled:opacity-50"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 rounded bg-red-950/20 border border-red-500/20 p-2.5 text-[11px] text-red-400 font-mono">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold font-mono uppercase tracking-wider text-white hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Unlock Terminal'
              )}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
