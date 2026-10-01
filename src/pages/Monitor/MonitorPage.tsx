import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { Activity } from 'lucide-react';

export const MonitorPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Patient Monitor"
        subtitle="Irregular observations, confidence, and data-gap monitoring."
        badge={<StatusIndicator status="neutral" label="Foundation" />}
        metadata={
          <>
            <span>Source: <strong>Simulated Patient</strong></span>
            <span>·</span>
            <span>Status: <strong>Decision support, not diagnosis</strong></span>
          </>
        }
      />

      <Panel title="Patient Observations &amp; Confidence">
        <EmptyState
          icon={<Activity className="w-8 h-8 text-[#5B6475]" />}
          title="Patient Monitor"
          description="Simulated patient observations, score bands, confidence ribbon, freshness, completeness, and data-gap alerts will be displayed here."
          phaseContext="CareProof Roadmap Foundation"
        />
      </Panel>
    </div>
  );
};
