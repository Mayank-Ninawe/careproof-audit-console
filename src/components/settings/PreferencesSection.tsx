/**
 * CareProof Audit Console - Interface Preferences Section
 * Source of Truth: CareProof Website Roadmap (Phase 13)
 * 
 * Manages UI density and clinical unit system preferences.
 * Persisted in browser localStorage.
 */

import React, { useState } from 'react';
import { Sliders, CheckCircle2 } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { SettingsPreferences, UiDensity, UnitSystem } from '../../types/settings';

export interface PreferencesSectionProps {
  preferences: SettingsPreferences;
  onSavePreferences: (updated: Partial<SettingsPreferences>) => void;
  className?: string;
}

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  preferences,
  onSavePreferences,
  className = '',
}) => {
  const [density, setDensity] = useState<UiDensity>(preferences.density);
  const [units, setUnits] = useState<UnitSystem>(preferences.units);
  const [feedback, setFeedback] = useState<string | null>(null);

  const densityOptions = [
    { value: 'comfortable', label: 'Comfortable (Standard Audit Ledger Spacing)' },
    { value: 'compact', label: 'Compact (High-Density Clinical Tables)' },
  ];

  const unitOptions = [
    { value: 'metric', label: 'Standard (Metric / SI Units - ms, %, kg)' },
    { value: 'imperial', label: 'Imperial / US Customary (lbs, in)' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePreferences({ density, units });
    setFeedback('Preferences saved locally');
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  return (
    <Panel
      title="Display & Unit Preferences"
      headerActions={
        <div className="flex items-center gap-1 text-[11px] font-mono text-[#0F6B6E]">
          <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Interface Configuration</span>
        </div>
      }
      className={className}
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Status Feedback Notice */}
        {feedback && (
          <div
            role="status"
            aria-live="polite"
            className="p-3 bg-[#0F6B6E]/10 border border-[#0F6B6E]/30 rounded-[2px] flex items-center gap-2 text-xs font-mono text-[#0F6B6E]"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{feedback}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Density Preference */}
          <div>
            <Select
              id="settings-pref-density"
              label="Interface Table Density"
              value={density}
              onChange={(e) => setDensity(e.target.value as UiDensity)}
              options={densityOptions}
            />
            <span className="text-[11px] text-[#5B6475] block mt-1">
              Controls row height and vertical padding across audit tables.
            </span>
          </div>

          {/* Unit System Preference */}
          <div>
            <Select
              id="settings-pref-units"
              label="Measurement Unit System"
              value={units}
              onChange={(e) => setUnits(e.target.value as UnitSystem)}
              options={unitOptions}
            />
            <span className="text-[11px] text-[#5B6475] block mt-1 leading-normal">
              CareProof indicators currently evaluate time latencies (ms) and percentage compliance (%). Unit preference is stored for clinical display adapters.
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end border-t border-[#D9D3C5]/60">
          <Button type="submit" variant="secondary" size="sm" className="font-mono text-xs">
            Save Preferences
          </Button>
        </div>
      </form>
    </Panel>
  );
};
