'use client';

import React, { useState } from 'react';
import { useWorkflowStore } from '@/stores/workflow.store';
import { CheckCircle2, AlertCircle, PlayCircle, Loader2, Copy } from 'lucide-react';
import { NODE_LABELS } from '@/lib/constants';

export default function Timeline() {
  const { nodes, timeline } = useWorkflowStore();
  const [copied, setCopied] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin shrink-0" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />;
      default:
        return <PlayCircle className="h-4 w-4 text-[#71717A] shrink-0" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 font-medium';
      case 'running':
        return 'text-blue-400 font-medium';
      case 'warning':
        return 'text-yellow-400 font-medium';
      case 'failed':
        return 'text-red-400 font-bold';
      default:
        return 'text-[#71717A]';
    }
  };

  const handleCopyLogs = () => {
    let logText = `=========================================\n`;
    logText += `  CONSENSUS SYSTEM DIAGNOSTICS REPORT\n`;
    logText += `=========================================\n`;
    logText += `Timestamp: ${new Date().toISOString()}\n`;
    logText += `Timeline Events Count: ${timeline.length}\n`;
    logText += `-----------------------------------------\n\n`;

    timeline.forEach((event, idx) => {
      logText += `[${idx + 1}] [${new Date(event.timestamp).toLocaleTimeString()}] Node: ${event.nodeId.toUpperCase()} | Status: ${event.status.toUpperCase()}\n`;
      logText += `    Message: ${event.message}\n\n`;
    });

    const failedEvents = timeline.filter((e) => e.status === 'failed');
    if (failedEvents.length > 0) {
      logText += `\nErrors Detected:\n`;
      failedEvents.forEach((e) => {
        logText += `- [${e.nodeId}] ${e.message}\n`;
      });
    } else {
      logText += `\nNo critical system errors captured in this session.\n`;
    }

    navigator.clipboard.writeText(logText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nodeList = Object.values(nodes);

  return (
    <div className="rounded-lg border border-[#232323] bg-[#111111] p-5 flex flex-col gap-4">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717A] font-mono">
          Committee Progress Log
        </h3>
      </div>

      <div className="relative pl-4 border-l border-[#232323] space-y-4 flex-1">
        {nodeList.map((node) => {
          const nodeTime = node.timestamp
            ? new Date(node.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            : '';

          return (
            <div key={node.id} className="relative flex items-start gap-3">
              <div className="absolute -left-[25px] top-1 flex h-4 w-4 items-center justify-center bg-[#111111]">
                {getStatusIcon(node.status)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-mono ${getStatusColor(node.status)}`}>
                    {node.label}
                  </span>
                  <span className="text-[10px] font-mono text-[#71717A]">
                    {nodeTime}
                  </span>
                </div>
                {node.message && (
                  <p className="mt-1 text-[11px] text-[#A1A1AA] leading-relaxed">
                    {node.message}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Diagnostics Console Footer */}
      <div className="border-t border-[#232323] pt-4 mt-2">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowLogs(!showLogs)}
            className="text-[10px] font-mono font-medium text-[#71717A] hover:text-white transition-colors"
          >
            {showLogs ? '▼ Hide Diagnostics Console' : '▶ Show Diagnostics Console'}
          </button>
          
          <button
            type="button"
            onClick={handleCopyLogs}
            disabled={timeline.length === 0}
            className="rounded bg-[#050505] border border-[#232323] px-2.5 py-1 text-[10px] font-mono text-[#A1A1AA] hover:bg-[#0D0D0D] hover:text-white transition-colors disabled:opacity-30 flex items-center gap-1"
          >
            <Copy className="h-3 w-3" />
            {copied ? 'Copied!' : 'Copy Debug Logs'}
          </button>
        </div>

        {showLogs && (
          <div className="mt-3 max-h-[150px] overflow-y-auto rounded border border-[#232323] bg-[#050505] p-2.5 font-mono text-[9px] text-[#71717A] space-y-1.5 scrollbar-thin">
            {timeline.length === 0 ? (
              <div className="italic">No execution events captured. Run a search to compile logs.</div>
            ) : (
              timeline.map((event, idx) => (
                <div key={idx} className="leading-normal">
                  <span className="text-blue-500">[{new Date(event.timestamp).toLocaleTimeString()}]</span>{' '}
                  <span className={event.status === 'failed' ? 'text-red-500 font-bold' : event.status === 'completed' ? 'text-green-500' : 'text-blue-400'}>
                    {event.nodeId.toUpperCase()}:{event.status.toUpperCase()}
                  </span>{' '}
                  - {event.message}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
