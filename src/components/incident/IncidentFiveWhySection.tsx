/**
 * CareProof Audit Console - Five-Why Root Cause Section Component (Phase 11B)
 * Source of Truth: CareProof Website Roadmap (Phase 11B)
 * 
 * CORE CONTRACT:
 * - Supports up to 5 ordered Why steps (Why 1 to Why 5).
 * - Enforces step numbers 1–5; rejects > 5 steps.
 * - Root cause summary and completion status.
 * - Zero auto-filled answers or automated causality claims.
 */

import React from 'react';
import { HelpCircle, Plus, Trash2 } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Button } from '../ui/Button';
import {
  FiveWhyStep,
  IncidentRecord,
  RootCauseStatus,
} from '../../types/incident';

export interface IncidentFiveWhySectionProps {
  record: IncidentRecord;
  onUpdateRecord: (updated: IncidentRecord) => void;
  className?: string;
}

export const IncidentFiveWhySection: React.FC<IncidentFiveWhySectionProps> = ({
  record,
  onUpdateRecord,
  className = '',
}) => {
  const { rootCause } = record;
  const steps = rootCause.steps;

  const handleStatusChange = (newStatus: RootCauseStatus) => {
    onUpdateRecord({
      ...record,
      rootCause: {
        ...record.rootCause,
        status: newStatus,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleSummaryChange = (summary: string) => {
    onUpdateRecord({
      ...record,
      rootCause: {
        ...record.rootCause,
        rootCauseSummary: summary,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleStepChange = (index: number, field: 'question' | 'answer', value: string) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = {
      ...updatedSteps[index],
      [field]: value,
    };

    onUpdateRecord({
      ...record,
      rootCause: {
        ...record.rootCause,
        steps: updatedSteps,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddStep = () => {
    if (steps.length >= 5) return;
    const nextWhyNumber = steps.length + 1;
    const newStep: FiveWhyStep = {
      whyNumber: nextWhyNumber,
      question: `Why ${nextWhyNumber}?`,
      answer: '',
    };

    onUpdateRecord({
      ...record,
      rootCause: {
        ...record.rootCause,
        steps: [...steps, newStep],
        status: record.rootCause.status === 'not_started' ? 'in_progress' : record.rootCause.status,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  const handleRemoveStep = (index: number) => {
    const filtered = steps.filter((_, i) => i !== index);
    // Renumber remaining steps to preserve continuous sequence 1..N
    const renumbered = filtered.map((s, idx) => ({
      ...s,
      whyNumber: idx + 1,
    }));

    onUpdateRecord({
      ...record,
      rootCause: {
        ...record.rootCause,
        steps: renumbered,
        status: renumbered.length === 0 ? 'not_started' : record.rootCause.status,
      },
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <Panel
      title="Stage 4: Root Cause Analysis (5-Why Protocol)"
      className={className}
      headerActions={
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#5B6475]">
            {steps.length} of 5 Whys Explored
          </span>
          <select
            value={rootCause.status}
            onChange={(e) => handleStatusChange(e.target.value as RootCauseStatus)}
            aria-label="Root Cause Analysis Status"
            className="px-2 py-0.5 text-xs font-mono border border-[#D9D3C5] bg-white rounded-[2px]"
          >
            <option value="not_started">NOT STARTED</option>
            <option value="in_progress">IN PROGRESS</option>
            <option value="completed">COMPLETED</option>
          </select>
        </div>
      }
    >
      <div className="space-y-4 text-left font-body">
        {/* Methodological Boundary Note */}
        <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] flex items-start gap-2.5 text-xs text-[#5B6475]">
          <HelpCircle className="w-4 h-4 text-[#0F6B6E] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="m-0 leading-relaxed font-body">
            <strong>Root Cause Protocol:</strong> The 5-Why method provides a structured qualitative framework for
            auditors to interrogate proximate failures down to systemic contributors. Answers are auditor findings, not
            automated algorithmic deductions.
          </p>
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {steps.map((step, idx) => (
            <div
              key={step.whyNumber}
              className="p-3 bg-white border border-[#D9D3C5] rounded-[2px] space-y-2 relative"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-[#D9D3C5]/60">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-[#0F6B6E]/10 text-[#0F6B6E] font-mono text-xs font-bold rounded-[2px] border border-[#0F6B6E]/20">
                    {`Why #${step.whyNumber}`}
                  </span>
                  <input
                    type="text"
                    value={step.question}
                    onChange={(e) => handleStepChange(idx, 'question', e.target.value)}
                    aria-label={`Question for Why ${step.whyNumber}`}
                    className="text-xs font-bold text-[#14213D] bg-transparent border-b border-transparent hover:border-[#D9D3C5] focus:border-[#0F6B6E] focus:outline-none px-1 py-0.5 w-72 sm:w-96"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveStep(idx)}
                  title={`Remove Why ${step.whyNumber}`}
                  aria-label={`Remove Why step ${step.whyNumber}`}
                  className="text-[#9CA3AF] hover:text-[#B3341A] p-1 rounded cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              <div>
                <label
                  htmlFor={`why-answer-${step.whyNumber}`}
                  className="block text-[11px] font-mono font-semibold uppercase text-[#5B6475] mb-1"
                >
                  Identified Contributor / Answer:
                </label>
                <textarea
                  id={`why-answer-${step.whyNumber}`}
                  rows={2}
                  value={step.answer}
                  onChange={(e) => handleStepChange(idx, 'answer', e.target.value)}
                  placeholder={`Detail why this condition occurred...`}
                  className="w-full px-2.5 py-1.5 text-xs font-body border border-[#D9D3C5] bg-[#FAF8F3]/50 focus:bg-white rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#0F6B6E]"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add Step Button */}
        {steps.length < 5 && (
          <div className="pt-1">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddStep}
              className="gap-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add Why #{steps.length + 1} Step</span>
            </Button>
          </div>
        )}

        {/* Root Cause Conclusion Summary */}
        <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] space-y-1.5">
          <label htmlFor="root-cause-summary-field" className="block text-xs font-mono font-semibold uppercase text-[#14213D]">
            Synthesized Systemic Root Cause:
          </label>
          <textarea
            id="root-cause-summary-field"
            rows={2}
            value={rootCause.rootCauseSummary || ''}
            onChange={(e) => handleSummaryChange(e.target.value)}
            placeholder="Summarize the primary underlying organizational, procedural, or technical root cause..."
            className="w-full px-2.5 py-1.5 text-xs font-body border border-[#D9D3C5] bg-white rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#0F6B6E]"
          />
        </div>
      </div>
    </Panel>
  );
};
