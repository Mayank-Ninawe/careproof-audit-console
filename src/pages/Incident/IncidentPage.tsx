import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { AlertTriangle } from 'lucide-react';

export const IncidentPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Incident Response"
        subtitle="Incident analysis, corrective action, and re-audit planning."
        badge={<StatusIndicator status="neutral" label="Foundation" />}
        metadata={
          <>
            <span>Workflow: <strong>Intake · Timeline · RCA · Corrective Action</strong></span>
            <span>·</span>
            <span>Outcome: <strong>Re-Audit Plan</strong></span>
          </>
        }
      />

      <Panel title="Incident Register">
        <EmptyState
          icon={<AlertTriangle className="w-8 h-8 text-[#5B6475]" />}
          title="Incident Analysis"
          description="Incident intake, timeline, indicator mapping, root cause analysis, corrective action, re-audit planning, and print view will be displayed here."
          phaseContext="CareProof Roadmap Foundation"
        />
      </Panel>
    </div>
  );
};
