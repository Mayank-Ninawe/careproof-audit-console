import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { Users } from 'lucide-react';

export const CaregiversPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Caregiver Competency"
        subtitle="Caregiver competency and assessment gaps."
        badge={<StatusIndicator status="neutral" label="Foundation" />}
        metadata={
          <>
            <span>Competency Scale: <strong>Level 0–4</strong></span>
            <span>·</span>
            <span>Focus: <strong>Assessment &amp; Gap Reporting</strong></span>
          </>
        }
      />

      <Panel title="Competency Matrix">
        <EmptyState
          icon={<Users className="w-8 h-8 text-[#5B6475]" />}
          title="Caregiver Competency"
          description="Caregiver IDs, competency matrix (Level 0–4), assessment methods, expiry dates, gap reports, and assessor information will be displayed here."
          phaseContext="CareProof Roadmap Foundation"
        />
      </Panel>
    </div>
  );
};
