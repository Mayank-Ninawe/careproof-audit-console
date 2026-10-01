import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { Wrench } from 'lucide-react';

export const EquipmentPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Equipment Lifecycle"
        subtitle="Equipment lifecycle and device monitoring."
        badge={<StatusIndicator status="neutral" label="Foundation" />}
        metadata={
          <>
            <span>Stages: <strong>Procure · Validate · Maintain · Monitor · Retire</strong></span>
            <span>·</span>
            <span>Domain: <strong>Device Register</strong></span>
          </>
        }
      />

      <Panel title="Device Register &amp; Monitoring">
        <EmptyState
          icon={<Wrench className="w-8 h-8 text-[#5B6475]" />}
          title="Equipment Lifecycle"
          description="Device register, calibration, uptime, alerts, incident counts, SOP history, and retirement criteria across lifecycle stages will be displayed here."
          phaseContext="CareProof Roadmap Foundation"
        />
      </Panel>
    </div>
  );
};
