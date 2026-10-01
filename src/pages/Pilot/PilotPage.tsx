import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { FlaskConical } from 'lucide-react';

export const PilotPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Pilot Study"
        subtitle="Simulated validation results and study limitations."
        badge={<StatusIndicator status="neutral" label="Foundation" />}
        metadata={
          <>
            <span>Protocol: <strong>Pre-Registered Validation</strong></span>
            <span>·</span>
            <span>Reliability: <strong>Inter-Rater Kappa &amp; Cronbach Alpha</strong></span>
          </>
        }
      />

      <Panel title="Validation Results">
        <EmptyState
          icon={<FlaskConical className="w-8 h-8 text-[#5B6475]" />}
          title="Pilot Study"
          description="Protocol summary, simulated validation results, score distribution, inter-rater kappa, Cronbach alpha, ROC, reproducibility, and study limitations will be displayed here."
          phaseContext="CareProof Roadmap Foundation"
        />
      </Panel>
    </div>
  );
};
