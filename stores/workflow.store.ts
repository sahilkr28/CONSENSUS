import { create } from 'zustand';
import { FinalReport, WorkflowTimelineEvent, WorkflowNodeState } from '../types';
import { NODE_LABELS } from '../lib/constants';

interface WorkflowState {
  workflowId: string | null;
  ticker: string | null;
  companyName: string | null;
  status: 'idle' | 'running' | 'completed' | 'failed';
  nodes: Record<string, WorkflowNodeState>;
  timeline: WorkflowTimelineEvent[];
  selectedNodeId: string | null;
  report: FinalReport | null;
  activeMessage: string;
  cacheAge: number | null;
  
  // Actions
  startWorkflow: (workflowId: string, ticker: string, companyName?: string) => void;
  updateNode: (event: WorkflowTimelineEvent) => void;
  completeWorkflow: (report: FinalReport, isCached?: boolean, ageMinutes?: number | null) => void;
  failWorkflow: (errorMsg: string) => void;
  selectNode: (nodeId: string | null) => void;
  resetWorkflow: () => void;
}

const initialNodes = (): Record<string, WorkflowNodeState> => {
  const nodes: Record<string, WorkflowNodeState> = {};
  Object.keys(NODE_LABELS).forEach((id) => {
    nodes[id] = {
      id,
      label: NODE_LABELS[id],
      status: 'idle',
      timestamp: new Date().toISOString(),
    };
  });
  return nodes;
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflowId: null,
  ticker: null,
  companyName: null,
  status: 'idle',
  nodes: initialNodes(),
  timeline: [],
  selectedNodeId: null,
  report: null,
  activeMessage: 'Ready to research equities...',
  cacheAge: null,

  startWorkflow: (workflowId, ticker, companyName) => set({
    workflowId,
    ticker,
    companyName: companyName || ticker,
    status: 'running',
    nodes: initialNodes(),
    timeline: [],
    selectedNodeId: null,
    report: null,
    cacheAge: null,
    activeMessage: `Starting research committee workflow for $${ticker.toUpperCase()}...`,
  }),

  updateNode: (event) => set((state) => {
    const updatedNodes = { ...state.nodes };
    if (updatedNodes[event.nodeId]) {
      updatedNodes[event.nodeId] = {
        ...updatedNodes[event.nodeId],
        status: event.status,
        message: event.message,
        timestamp: event.timestamp,
      };
    }

    const nextTimeline = [...state.timeline];
    // Avoid timeline duplications
    const alreadyExists = nextTimeline.some(
      (e) => e.nodeId === event.nodeId && e.status === event.status && e.message === event.message
    );
    if (!alreadyExists) {
      nextTimeline.push(event);
    }

    // Set dynamic status messages based on active node
    let message = state.activeMessage;
    if (event.status === 'running') {
      message = event.message;
    }

    return {
      nodes: updatedNodes,
      timeline: nextTimeline,
      activeMessage: message,
    };
  }),

  completeWorkflow: (report, isCached = false, ageMinutes: number | null = null) => set((state) => {
    const finalNodes = { ...state.nodes };
    // Mark all nodes completed if it was a cache load
    if (isCached) {
      Object.keys(finalNodes).forEach((id) => {
        finalNodes[id].status = 'completed';
      });
    }

    return {
      status: 'completed',
      nodes: finalNodes,
      report,
      cacheAge: ageMinutes,
      activeMessage: isCached 
        ? `Consensus Report loaded from cache (Age: ${ageMinutes}m).`
        : `Consensus Report successfully generated for $${report.companyInfo.ticker}!`,
    };
  }),

  failWorkflow: (errorMsg) => set({
    status: 'failed',
    activeMessage: `Workflow failed: ${errorMsg}`,
  }),

  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  resetWorkflow: () => set({
    workflowId: null,
    ticker: null,
    companyName: null,
    status: 'idle',
    nodes: initialNodes(),
    timeline: [],
    selectedNodeId: null,
    report: null,
    activeMessage: 'Ready to research equities...',
    cacheAge: null,
  }),
}));
