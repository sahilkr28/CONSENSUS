'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Position,
  Handle,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '@/stores/workflow.store';
import { CheckCircle2, AlertCircle, PlayCircle, Loader2 } from 'lucide-react';
import Timeline from './Timeline';

// Define custom node to have full control of aesthetics
const CustomAgentNode = ({ data }: { data: { label: string; status: string; isActive: boolean } }) => {
  const getStatusColor = () => {
    switch (data.status) {
      case 'completed':
        return 'border-green-500 bg-green-950/20 text-green-400';
      case 'running':
        return 'border-blue-500 bg-blue-950/20 text-blue-400 pulse-blue';
      case 'warning':
        return 'border-yellow-500 bg-yellow-950/20 text-yellow-400';
      case 'failed':
        return 'border-red-500 bg-red-950/20 text-red-400';
      default:
        return 'border-[#232323] bg-[#111111] text-[#71717A]';
    }
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case 'completed':
        return <CheckCircle2 className="h-3 w-3 shrink-0" />;
      case 'running':
        return <Loader2 className="h-3 w-3 animate-spin shrink-0" />;
      case 'warning':
        return <AlertCircle className="h-3 w-3 shrink-0" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 shrink-0" />;
      default:
        return <PlayCircle className="h-3 w-3 shrink-0" />;
    }
  };

  return (
    <div className={`relative flex items-center gap-2 rounded-lg border px-3 py-2 text-[10px] font-mono shadow-sm transition-all duration-300 w-36 ${getStatusColor()}`}>
      <Handle type="target" position={Position.Top} className="!bg-[#232323] !border-0" />
      
      {getStatusIcon()}
      <div className="flex-1 truncate font-medium">{data.label}</div>
      
      <Handle type="source" position={Position.Bottom} className="!bg-[#232323] !border-0" />
    </div>
  );
};

// Node specifications with layout positions
const NODE_DEFS = [
  { id: 'planner', label: 'Planner Agent', x: 250, y: 20 },
  { id: 'resolver', label: 'Ticker Resolver', x: 250, y: 80 },
  { id: 'coordinator', label: 'Research Coord', x: 250, y: 140 },
  
  // Parallel Analysts
  { id: 'financial', label: 'Financial Analyst', x: 40, y: 220 },
  { id: 'business', label: 'Business Analyst', x: 180, y: 220 },
  { id: 'news', label: 'News Analyst', x: 320, y: 220 },
  { id: 'market', label: 'Market Analyst', x: 460, y: 220 },
  
  { id: 'evidence', label: 'Evidence Collector', x: 250, y: 300 },
  
  // Parallel Debate
  { id: 'bull', label: 'Bull Analyst', x: 100, y: 380 },
  { id: 'bear', label: 'Bear Analyst', x: 250, y: 380 },
  { id: 'risk', label: 'Risk Analyst', x: 400, y: 380 },
  
  { id: 'judge', label: 'Judge CIO', x: 250, y: 460 },
  { id: 'consensus', label: 'Consensus Engine', x: 250, y: 520 },
  { id: 'report', label: 'Report Generator', x: 250, y: 580 },
];

const EDGE_DEFS = [
  { source: 'planner', target: 'resolver' },
  { source: 'resolver', target: 'coordinator' },
  
  // Broadcast to Analysts
  { source: 'coordinator', target: 'financial' },
  { source: 'coordinator', target: 'business' },
  { source: 'coordinator', target: 'news' },
  { source: 'coordinator', target: 'market' },
  
  // Join to Evidence
  { source: 'financial', target: 'evidence' },
  { source: 'business', target: 'evidence' },
  { source: 'news', target: 'evidence' },
  { source: 'market', target: 'evidence' },
  
  // Broadcast to Debate
  { source: 'evidence', target: 'bull' },
  { source: 'evidence', target: 'bear' },
  { source: 'evidence', target: 'risk' },
  
  // Join to Judge
  { source: 'bull', target: 'judge' },
  { source: 'bear', target: 'judge' },
  { source: 'risk', target: 'judge' },
  
  { source: 'judge', target: 'consensus' },
  { source: 'consensus', target: 'report' },
];

const nodeTypes = {
  agentNode: CustomAgentNode,
};

export default function WorkflowGraph() {
  const { nodes: stateNodes, selectedNodeId, selectNode } = useWorkflowStore();
  const [isMobile, setIsMobile] = useState(false);

  // Check window width for mobile collapse
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const reactFlowNodes = useMemo(() => {
    return NODE_DEFS.map((node) => {
      const stateNode = stateNodes[node.id];
      const isSelected = selectedNodeId === node.id;
      
      return {
        id: node.id,
        type: 'agentNode',
        position: { x: node.x, y: node.y },
        data: {
          label: node.label,
          status: stateNode?.status || 'idle',
          isActive: stateNode?.status === 'running',
        },
        style: isSelected ? { border: '1px solid #3B82F6', zIndex: 10 } : {},
      };
    });
  }, [stateNodes, selectedNodeId]);

  const reactFlowEdges = useMemo(() => {
    return EDGE_DEFS.map((edge, index) => {
      const sourceStatus = stateNodes[edge.source]?.status;
      const targetStatus = stateNodes[edge.target]?.status;
      
      const isActive = sourceStatus === 'completed' && targetStatus === 'running';
      const isCompleted = sourceStatus === 'completed' && targetStatus === 'completed';

      return {
        id: `edge-${index}`,
        source: edge.source,
        target: edge.target,
        animated: isActive,
        style: {
          stroke: isCompleted ? '#22C55E' : isActive ? '#3B82F6' : '#232323',
          strokeWidth: 2,
        },
      };
    });
  }, [stateNodes]);

  if (isMobile) {
    return (
      <div className="space-y-4">
        <Timeline />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#232323] bg-[#050505] p-4 flex flex-col h-[650px] relative">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">
          Committee Workflow Execution Map
        </h3>
        <div className="flex items-center gap-4 text-[10px] text-[#71717A] font-mono">
          <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#71717A]" /> Idle</div>
          <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6] animate-pulse" /> Researching</div>
          <div className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#22C55E]" /> Complete</div>
        </div>
      </div>
      <div className="flex-1 w-full rounded-md border border-[#232323] bg-[#070707] overflow-hidden">
        <ReactFlow
          nodes={reactFlowNodes}
          edges={reactFlowEdges}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => selectNode(node.id)}
          fitView
          fitViewOptions={{ padding: 0.1 }}
          nodesConnectable={false}
          nodesDraggable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnDoubleClick={false}
          preventScrolling={true}
        />
      </div>
    </div>
  );
}
