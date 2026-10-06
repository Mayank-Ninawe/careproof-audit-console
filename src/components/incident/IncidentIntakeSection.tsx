/**
 * CareProof Audit Console - Incident Intake Section Component (Phase 11B)
 * Source of Truth: CareProof Website Roadmap (Phase 11B)
 * 
 * CORE CONTRACT:
 * - Structured intake form for incident metadata.
 * - Field-level error validation reporting from domain service.
 * - Explicit local in-memory boundary disclosure (zero Firebase persistence claims).
 * - Zero patient PII fields.
 */

import React from 'react';
import { ShieldAlert, Cpu } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Badge } from '../ui/Badge';
import {
  IncidentRecord,
  IncidentStatus,
  VALID_INCIDENT_STATUSES,
} from '../../types/incident';

export interface IncidentIntakeSectionProps {
  record: IncidentRecord;
  onUpdateRecord: (updated: IncidentRecord) => void;
  errors: readonly string[];
  className?: string;
}

export const IncidentIntakeSection: React.FC<IncidentIntakeSectionProps> = ({
  record,
  onUpdateRecord,
  errors,
  className = '',
}) => {
  const { intake } = record;

  const handleFieldChange = (field: keyof typeof intake, value: string) => {
    onUpdateRecord({
      ...record,
      intake: {
        ...record.intake,
        [field]: value,
      },
      status: field === 'status' ? (value as IncidentStatus) : record.status,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <Panel
      title="Stage 1: Incident Intake &amp; Context Ledger"
      className={className}
      headerActions={
        <div className="flex items-center gap-2">
          <Badge variant="neutral">{record.id}</Badge>
          <span className="text-[11px] font-mono text-[#5B6475]">
            Status: <strong className="text-[#14213D]">{record.status.toUpperCase()}</strong>
          </span>
        </div>
      }
    >
      <div className="space-y-4 text-left font-body">
        {/* Local In-Memory Boundary Notice */}
        <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] flex items-start gap-2.5 text-xs text-[#5B6475]">
          <Cpu className="w-4 h-4 text-[#0F6B6E] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="m-0 leading-relaxed font-body">
            <strong>In-Memory Draft Notice:</strong> Intake edits update local session state for review and printing.
            Data is not written to production Firestore database collections in this phase.
          </p>
        </div>

        {/* Validation Errors Alert if any */}
        {errors.length > 0 && (
          <div
            role="alert"
            className="p-3 bg-[#FAF0ED] border border-[#B3341A]/30 rounded-[2px] text-xs font-mono text-[#B3341A]"
          >
            <strong className="block mb-1">Intake Validation Issues Detected:</strong>
            <ul className="list-disc pl-4 space-y-0.5 m-0">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* Incident ID */}
          <div className="sm:col-span-4">
            <label htmlFor="intake-id" className="block text-xs font-mono font-semibold uppercase text-[#5B6475] mb-1">
              Incident Identifier <span className="text-[#B3341A]">*</span>
            </label>
            <input
              id="intake-id"
              type="text"
              value={record.id}
              onChange={(e) => {
                const val = e.target.value;
                onUpdateRecord({
                  ...record,
                  id: val,
                  intake: { ...record.intake, id: val },
                });
              }}
              placeholder="e.g. INC-2026-003"
              className="w-full px-2.5 py-1.5 text-xs font-mono border border-[#D9D3C5] bg-white text-[#14213D] rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#0F6B6E]"
            />
          </div>

          {/* Timestamp */}
          <div className="sm:col-span-4">
            <label htmlFor="intake-timestamp" className="block text-xs font-mono font-semibold uppercase text-[#5B6475] mb-1">
              Incident Date &amp; Time (ISO) <span className="text-[#B3341A]">*</span>
            </label>
            <input
              id="intake-timestamp"
              type="text"
              value={intake.timestamp}
              onChange={(e) => handleFieldChange('timestamp', e.target.value)}
              placeholder="2026-01-15T08:30:00.000Z"
              className="w-full px-2.5 py-1.5 text-xs font-mono border border-[#D9D3C5] bg-white text-[#14213D] rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#0F6B6E]"
            />
          </div>

          {/* Workflow Status */}
          <div className="sm:col-span-4">
            <label htmlFor="intake-status" className="block text-xs font-mono font-semibold uppercase text-[#5B6475] mb-1">
              Lifecycle Status <span className="text-[#B3341A]">*</span>
            </label>
            <select
              id="intake-status"
              value={record.status}
              onChange={(e) => handleFieldChange('status', e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs font-mono border border-[#D9D3C5] bg-white text-[#14213D] rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#0F6B6E]"
            >
              {VALID_INCIDENT_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.toUpperCase().replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="sm:col-span-12">
            <label htmlFor="intake-title" className="block text-xs font-mono font-semibold uppercase text-[#5B6475] mb-1">
              Incident Title / Event Subject <span className="text-[#B3341A]">*</span>
            </label>
            <input
              id="intake-title"
              type="text"
              value={intake.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Brief descriptive title of the quality anomaly or breach"
              className="w-full px-2.5 py-1.5 text-xs font-body border border-[#D9D3C5] bg-white text-[#14213D] rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#0F6B6E]"
            />
          </div>

          {/* Summary */}
          <div className="sm:col-span-12">
            <label htmlFor="intake-summary" className="block text-xs font-mono font-semibold uppercase text-[#5B6475] mb-1">
              Executive Summary <span className="text-[#B3341A]">*</span>
            </label>
            <input
              id="intake-summary"
              type="text"
              value={intake.summary}
              onChange={(e) => handleFieldChange('summary', e.target.value)}
              placeholder="High-level audit synopsis of what occurred"
              className="w-full px-2.5 py-1.5 text-xs font-body border border-[#D9D3C5] bg-white text-[#14213D] rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#0F6B6E]"
            />
          </div>

          {/* Location & Reporter */}
          <div className="sm:col-span-6">
            <label htmlFor="intake-location" className="block text-xs font-mono font-semibold uppercase text-[#5B6475] mb-1">
              Location / Context
            </label>
            <input
              id="intake-location"
              type="text"
              value={intake.location || ''}
              onChange={(e) => handleFieldChange('location', e.target.value)}
              placeholder="e.g. Ward A - Telemetry Station 3"
              className="w-full px-2.5 py-1.5 text-xs font-body border border-[#D9D3C5] bg-white text-[#14213D] rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#0F6B6E]"
            />
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="intake-reporter" className="block text-xs font-mono font-semibold uppercase text-[#5B6475] mb-1">
              Reporter Identifier <span className="text-[#B3341A]">*</span>
            </label>
            <input
              id="intake-reporter"
              type="text"
              value={intake.reporterId}
              onChange={(e) => handleFieldChange('reporterId', e.target.value)}
              placeholder="e.g. AUD-001 or Lead Nurse"
              className="w-full px-2.5 py-1.5 text-xs font-mono border border-[#D9D3C5] bg-white text-[#14213D] rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#0F6B6E]"
            />
          </div>

          {/* Description */}
          <div className="sm:col-span-12">
            <label htmlFor="intake-desc" className="block text-xs font-mono font-semibold uppercase text-[#5B6475] mb-1">
              Immediate Narrative Description
            </label>
            <textarea
              id="intake-desc"
              rows={3}
              value={intake.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Detailed chronological notes, observational context, and preliminary audit flags..."
              className="w-full px-2.5 py-1.5 text-xs font-body border border-[#D9D3C5] bg-white text-[#14213D] rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#0F6B6E]"
            />
          </div>
        </div>

        {/* PHI Boundary Notice */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#5B6475] pt-2 border-t border-[#D9D3C5]">
          <ShieldAlert className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
          <span>CareProof Quality Intake · Do NOT enter patient names, MRNs, phone numbers, or clinical PHI.</span>
        </div>
      </div>
    </Panel>
  );
};
