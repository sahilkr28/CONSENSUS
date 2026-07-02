'use client';

import React from 'react';
import { useWorkflowStore } from '@/stores/workflow.store';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StatusTicker() {
  const { activeMessage, status } = useWorkflowStore();

  if (status === 'idle') return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#232323] bg-[#0D0D0D] px-4 py-3 text-xs text-[#A1A1AA]">
      {status === 'running' && (
        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      )}
      <div className="flex-1 font-mono">
        <AnimatePresence mode="wait">
          <motion.span
            key={activeMessage}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="block"
          >
            {activeMessage}
          </motion.span>
        </AnimatePresence>
      </div>
      {status === 'running' && (
        <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
      )}
    </div>
  );
}
