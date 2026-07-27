import React from 'react';

export interface AgentInfo {
  id: string;
  name: string;
  colorClass: string;
  bgClass: string;
  textClass: string;
  icon: string;
}

const AGENT_MAP: Record<string, AgentInfo> = {
  planner: {
    id: 'planner',
    name: 'Planner',
    colorClass: 'bg-agent-planner',
    bgClass: 'bg-agent-planner/10',
    textClass: 'text-agent-planner',
    icon: 'architecture',
  },
  researcher_a: {
    id: 'researcher_a',
    name: 'Researcher A',
    colorClass: 'bg-agent-researcher-a',
    bgClass: 'bg-agent-researcher-a/10',
    textClass: 'text-agent-researcher-a',
    icon: 'database',
  },
  researcher_b: {
    id: 'researcher_b',
    name: 'Researcher B',
    colorClass: 'bg-agent-researcher-b',
    bgClass: 'bg-agent-researcher-b/10',
    textClass: 'text-agent-researcher-b',
    icon: 'explore',
  },
  fact_checker: {
    id: 'fact_checker',
    name: 'Fact-Checker',
    colorClass: 'bg-agent-fact-checker',
    bgClass: 'bg-agent-fact-checker/10',
    textClass: 'text-agent-fact-checker',
    icon: 'fact_check',
  },
  writer: {
    id: 'writer',
    name: 'Writer',
    colorClass: 'bg-agent-writer',
    bgClass: 'bg-agent-writer/10',
    textClass: 'text-agent-writer',
    icon: 'edit_note',
  },
  editor: {
    id: 'editor',
    name: 'Editor',
    colorClass: 'bg-agent-editor',
    bgClass: 'bg-agent-editor/10',
    textClass: 'text-agent-editor',
    icon: 'verified',
  },
};

interface AgentStatusRowProps {
  type: 'agent_start' | 'agent_done' | 'handoff';
  agent?: string;
  label?: string;
  from?: string;
  to?: string;
}

export const AgentStatusRow: React.FC<AgentStatusRowProps> = ({
  type,
  agent,
  label,
  from,
  to,
}) => {
  if (type === 'handoff' && from && to) {
    const fromAgent = AGENT_MAP[from] || { name: from, textClass: 'text-primary' };
    const toAgent = AGENT_MAP[to] || { name: to, textClass: 'text-primary' };

    return (
      <div className="flex items-center gap-3 my-1">
        <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center">
          <span className="material-symbols-outlined text-outline-variant text-[18px]">
            sync_alt
          </span>
        </div>
        <div className="flex items-center gap-2 font-status-label text-xs">
          <span className={`${fromAgent.textClass} font-semibold uppercase`}>
            {fromAgent.name}
          </span>
          <span className="material-symbols-outlined text-outline-variant text-[16px]">
            arrow_forward
          </span>
          <span className={`${toAgent.textClass} font-semibold uppercase`}>
            {toAgent.name}
          </span>
        </div>
      </div>
    );
  }

  const agentInfo = (agent && AGENT_MAP[agent]) || {
    id: agent || 'agent',
    name: agent || 'Agent',
    colorClass: 'bg-primary',
    bgClass: 'bg-primary/10',
    textClass: 'text-primary',
    icon: 'smart_toy',
  };

  return (
    <div className="flex items-center gap-3 my-1">
      <div className={`w-8 h-8 rounded-full ${agentInfo.bgClass} flex items-center justify-center`}>
        <span className={`material-symbols-outlined ${agentInfo.textClass} text-[18px]`}>
          {agentInfo.icon}
        </span>
      </div>
      <div className="flex flex-col">
        <span className={`font-status-label text-[11px] ${agentInfo.textClass} uppercase font-bold`}>
          {agentInfo.name}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface-variant font-medium">
            {label || (type === 'agent_done' ? 'Completed step.' : 'Processing...')}
          </span>
          {type === 'agent_start' && (
            <div className={`w-1.5 h-1.5 rounded-full ${agentInfo.colorClass} pulse-dot`} />
          )}
        </div>
      </div>
    </div>
  );
};
