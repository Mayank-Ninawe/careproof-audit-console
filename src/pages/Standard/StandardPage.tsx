import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { BookOpen } from 'lucide-react';

export const StandardPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Standard Explorer"
        subtitle="Indicators, definitions, thresholds, evidence, and references."
        badge={<StatusIndicator status="neutral" label="Foundation" />}
        metadata={
          <>
            <span>Version: <strong>v1.4.0</strong></span>
            <span>·</span>
            <span>Pillars: <strong>5</strong></span>
            <span>·</span>
            <span>Indicators: <strong>20</strong></span>
          </>
        }
      />

      <Panel title="Standard Definitions">
        <EmptyState
          icon={<BookOpen className="w-8 h-8 text-[#5B6475]" />}
          title="Standard Explorer"
          description="Pillars, indicators, thresholds, evidence, formulas, rationale, and references will be displayed here."
          phaseContext="CareProof Roadmap Foundation"
        />
      </Panel>
    </div>
  );
};
