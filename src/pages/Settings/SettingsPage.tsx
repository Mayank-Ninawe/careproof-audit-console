import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { Settings } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Profile, privacy, preferences, export, and application information."
        badge={<StatusIndicator status="neutral" label="Foundation" />}
        metadata={
          <>
            <span>Version: <strong>v1.4.0</strong></span>
            <span>·</span>
            <span>Scope: <strong>Preferences &amp; Export</strong></span>
          </>
        }
      />

      <Panel title="Application Settings">
        <EmptyState
          icon={<Settings className="w-8 h-8 text-[#5B6475]" />}
          title="Settings"
          description="Profile details, user preferences, privacy configurations, audit data export, and application information will be available here."
          phaseContext="CareProof Roadmap Foundation"
        />
      </Panel>
    </div>
  );
};
