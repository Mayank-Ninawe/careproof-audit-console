import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { ScoreStamp } from '../../components/ui/ScoreStamp';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { LayoutDashboard } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overall audit score, pillars, Safety Gate, and fix-first actions."
        badge={
          <StatusIndicator status="neutral" label="Foundation" />
        }
        metadata={
          <>
            <span>Standard: <strong>v1.4.0</strong></span>
            <span>·</span>
            <span>Mode: <strong>Decision support, not diagnosis</strong></span>
          </>
        }
      />

      {/* Overview Structural Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Score Stamp Visual Foundation (neutral unassessed state) */}
        <div className="md:col-span-1">
          <ScoreStamp
            score={null}
            tier="Unassigned"
            coverage={null}
            status="unassessed"
            className="w-full"
          />
        </div>

        {/* Audit Pillars Summary Panel */}
        <div className="md:col-span-2">
          <Panel title="Audit Summary">
            <div className="space-y-3 text-xs font-mono-ledger text-[#5B6475]">
              <div className="flex items-center justify-between pb-2 border-b border-[#D9D3C5]/60">
                <span>Overall Audit Score</span>
                <span className="font-semibold text-[#14213D]">—</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#D9D3C5]/60">
                <span>Pillars Assessed</span>
                <span className="font-semibold text-[#14213D]">0 of 5</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-[#D9D3C5]/60">
                <span>Safety Gate Status</span>
                <span className="font-semibold text-[#14213D]">Pending Assessment</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fix-First Actions</span>
                <span className="font-semibold text-[#14213D]">0 Active</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* Main Structural Empty State */}
      <Panel title="Pillars &amp; Fix-First Actions">
        <EmptyState
          icon={<LayoutDashboard className="w-8 h-8 text-[#5B6475]" />}
          title="Dashboard Overview"
          description="Overall audit score, pillars, Safety Gate, and fix-first actions will be displayed here."
          phaseContext="CareProof Roadmap Foundation"
        />
      </Panel>
    </div>
  );
};
