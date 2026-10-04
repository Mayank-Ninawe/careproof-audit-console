import React from 'react';
import { CANONICAL_EQUIPMENT_STAGES, EquipmentLifecycleStage, EquipmentLifecycleSummary } from '../../types/equipment';
import { Layers } from 'lucide-react';

export interface LifecycleStageLedgerProps {
  summary: EquipmentLifecycleSummary;
  selectedStage: EquipmentLifecycleStage | 'all';
  onSelectStage: (stage: EquipmentLifecycleStage | 'all') => void;
}

const STAGE_LABELS: Record<EquipmentLifecycleStage, { title: string; subtitle: string }> = {
  procure: { title: 'Procure', subtitle: 'Intake & Acquisition' },
  validate: { title: 'Validate', subtitle: 'Qualification & Calibration' },
  maintain: { title: 'Maintain', subtitle: 'Service & Maintenance' },
  monitor: { title: 'Monitor', subtitle: 'Operational Telemetry' },
  retire: { title: 'Retire', subtitle: 'End of Life Readiness' },
};

export const LifecycleStageLedger: React.FC<LifecycleStageLedgerProps> = ({
  summary,
  selectedStage,
  onSelectStage,
}) => {
  return (
    <div className="border border-[#D9D3C5] bg-white rounded-[2px] p-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#D9D3C5]/60 mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#0F6B6E]" aria-hidden="true" />
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#14213D] m-0">
            5-Stage Equipment Lifecycle Ledger
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-[#5B6475]">
          <span>
            Total Devices: <strong className="text-[#14213D] font-bold">{summary.totalDevices}</strong>
          </span>
          <button
            type="button"
            onClick={() => onSelectStage('all')}
            className={`text-xs font-mono px-2 py-0.5 border rounded-[2px] transition-colors focus-visible:outline-2 focus-visible:outline-[#0F6B6E] ${
              selectedStage === 'all'
                ? 'bg-[#14213D] text-white border-[#14213D]'
                : 'bg-[#FAF8F3] text-[#5B6475] border-[#D9D3C5] hover:text-[#14213D]'
            }`}
          >
            Show All Stages
          </button>
        </div>
      </div>

      {/* Horizontal Stage Ledger Grid with Contained Scroll on narrow viewports */}
      <div className="overflow-x-auto pb-1" role="tablist" aria-label="Lifecycle stages">
        <div className="grid grid-cols-5 min-w-[620px] gap-2">
          {CANONICAL_EQUIPMENT_STAGES.map((stage, idx) => {
            const isSelected = selectedStage === stage;
            const count = summary[stage];
            const meta = STAGE_LABELS[stage];

            return (
              <button
                key={stage}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => onSelectStage(isSelected ? 'all' : stage)}
                className={`p-3 border rounded-[2px] text-left transition-all duration-150 flex flex-col justify-between focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0F6B6E] group ${
                  isSelected
                    ? 'border-[#0F6B6E] bg-[#FAF8F3] ring-1 ring-[#0F6B6E]'
                    : 'border-[#D9D3C5] bg-white hover:border-[#5B6475] hover:bg-[#FAF8F3]/50'
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-[11px] font-mono text-[#5B6475]">
                  <span className="font-semibold text-[#5B6475]">{`${idx + 1}.`}</span>
                  <span className="text-[10px] uppercase tracking-wider text-[#5B6475] group-hover:text-[#14213D]">
                    {meta.subtitle.split(' ')[0]}
                  </span>
                </div>

                <div className="my-2 flex items-baseline justify-between gap-2">
                  <span className="font-serif text-2xl font-bold tracking-tight text-[#14213D] tabular-nums">
                    {count}
                  </span>
                  <span className="text-[11px] font-mono text-[#5B6475]">
                    {count === 1 ? 'device' : 'devices'}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#D9D3C5]/40 flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-semibold uppercase tracking-wider ${
                      isSelected ? 'text-[#0F6B6E]' : 'text-[#14213D]'
                    }`}
                  >
                    {meta.title}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-mono px-1 bg-[#0F6B6E] text-white rounded-[1px]">
                      Active
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
