/**
 * CareProof Audit Console - Re-Audit Plan Section Component (Phase 11B)
 * Source of Truth: CareProof Website Roadmap (Phase 11B)
 * 
 * CORE CONTRACT:
 * - Structured re-audit planning fields.
 * - Workflow states: not_scheduled, scheduled, in_progress, completed, cancelled.
 * - Multi-select or tag selection of canonical indicators targeted for re-audit.
 * - Disclaims that re-audit scheduling/completion tracks quality assurance compliance,
 *   never clinical safety guarantees.
 */

import React from 'react';
import { CalendarCheck } from 'lucide-react';
import { Panel } from '../ui/Panel';
import {
  IncidentRecord,
  ReauditPlan,
  ReauditStatus,
  VALID_REAUDIT_STATUSES,
} from '../../types/incident';
import { CANONICAL_STANDARD } from '../../data/standard';

export interface IncidentReauditPlanSectionProps {
  record: IncidentRecord;
  onUpdateRecord: (updated: IncidentRecord) => void;
  className?: string;
}

export const IncidentReauditPlanSection: React.FC<IncidentReauditPlanSectionProps> = ({
  record,
  onUpdateRecord,
  className = '',
}) => {
  const { reauditPlan } = record;
  const canonicalIndicators = CANONICAL_STANDARD.indicators;

  const handlePlanChange = (field: keyof ReauditPlan, value: unknown) => {
    onUpdateRecord({
      ...record,
      reauditPlan: {
        ...record.reauditPlan,
        [field]: value,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleIndicatorToggle = (indId: string) => {
    const current = reauditPlan.linkedIndicatorIds || [];
    const exists = current.includes(indId);
    const updated = exists
      ? current.filter((id) => id !== indId)
      : [...current, indId];
    handlePlanChange('linkedIndicatorIds', updated);
  };

  return (
    <Panel
      title="Stage 6: Re-Audit Plan &amp; Verification Protocol"
      className={className}
      headerActions={
        <div className="flex items-center gap-2">
          <select
            value={reauditPlan.status}
            onChange={(e) => handlePlanChange('status', e.target.value as ReauditStatus)}
            aria-label="Re-Audit Status"
            className="px-2 py-0.5 text-xs font-mono border border-[#D9D3C5] bg-white rounded-[2px]"
          >
            {VALID_REAUDIT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st.toUpperCase().replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <div className="space-y-4 text-left font-body">
        {/* Quality Assurance Disclaimer */}
        <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] flex items-start gap-2.5 text-xs text-[#5B6475]">
          <CalendarCheck className="w-4 h-4 text-[#0F6B6E] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="m-0 leading-relaxed font-body">
            <strong>Re-Audit Assurance Boundary:</strong> Scheduling or completing a post-remediation audit verifies
            process compliance against canonical indicators. It demonstrates procedural closed-loop governance; it does
            not constitute a clinical safety guarantee or warranty.
          </p>
        </div>

        {/* Plan Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs">
          {/* Planned Date */}
          <div className="sm:col-span-4">
            <label htmlFor="reaudit-planned-date" className="block font-mono font-semibold uppercase text-[#5B6475] mb-1">
              Planned Re-Audit Date
            </label>
            <input
              id="reaudit-planned-date"
              type="text"
              value={reauditPlan.plannedDate || ''}
              onChange={(e) => handlePlanChange('plannedDate', e.target.value)}
              placeholder="2026-02-15T00:00:00.000Z"
              className="w-full px-2.5 py-1.5 border border-[#D9D3C5] bg-white rounded-[2px] font-mono"
            />
          </div>

          {/* Responsible Auditor */}
          <div className="sm:col-span-4">
            <label htmlFor="reaudit-auditor-id" className="block font-mono font-semibold uppercase text-[#5B6475] mb-1">
              Lead Verification Auditor
            </label>
            <input
              id="reaudit-auditor-id"
              type="text"
              value={reauditPlan.responsibleAuditorId || ''}
              onChange={(e) => handlePlanChange('responsibleAuditorId', e.target.value)}
              placeholder="e.g. AUD-001 or Quality Director"
              className="w-full px-2.5 py-1.5 border border-[#D9D3C5] bg-white rounded-[2px] font-mono"
            />
          </div>

          {/* Audit Scope */}
          <div className="sm:col-span-12">
            <label htmlFor="reaudit-scope" className="block font-mono font-semibold uppercase text-[#5B6475] mb-1">
              Verification Scope &amp; Target Methodology
            </label>
            <textarea
              id="reaudit-scope"
              rows={2}
              value={reauditPlan.scope || ''}
              onChange={(e) => handlePlanChange('scope', e.target.value)}
              placeholder="Specify the observational criteria, sample size, and duration for the follow-up audit..."
              className="w-full px-2.5 py-1.5 border border-[#D9D3C5] bg-white rounded-[2px] font-body"
            />
          </div>

          {/* Targeted Canonical Indicators Checklist */}
          <div className="sm:col-span-12">
            <span className="block font-mono font-semibold uppercase text-[#5B6475] mb-1.5">
              Indicators Targeted for Verification Sampling:
            </span>
            <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] max-h-36 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {canonicalIndicators.map((ind) => {
                const isChecked = (reauditPlan.linkedIndicatorIds || []).includes(ind.id);
                return (
                  <label
                    key={ind.id}
                    className="flex items-center gap-2 p-1.5 bg-white border border-[#D9D3C5] rounded-[2px] cursor-pointer hover:border-[#0F6B6E]"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleIndicatorToggle(ind.id)}
                      className="rounded text-[#0F6B6E] focus:ring-[#0F6B6E]"
                    />
                    <span className="font-mono text-xs font-semibold text-[#14213D]">{ind.id}</span>
                    <span className="text-[11px] text-[#5B6475] truncate">{ind.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Verification Outcome & Notes */}
          <div className="sm:col-span-12">
            <label htmlFor="reaudit-outcome" className="block font-mono font-semibold uppercase text-[#5B6475] mb-1">
              Re-Audit Outcome / Closure Findings
            </label>
            <textarea
              id="reaudit-outcome"
              rows={2}
              value={reauditPlan.outcome || ''}
              onChange={(e) => handlePlanChange('outcome', e.target.value)}
              placeholder="Record final verification findings once the re-audit has been executed..."
              className="w-full px-2.5 py-1.5 border border-[#D9D3C5] bg-white rounded-[2px] font-body"
            />
          </div>
        </div>
      </div>
    </Panel>
  );
};
