/**
 * CareProof Audit Console - Print-Friendly Incident Report Component (Phase 11B)
 * Source of Truth: CareProof Website Roadmap (Phase 11B)
 * 
 * CORE CONTRACT:
 * - Renders IncidentPrintViewData in a compact, print-optimized ledger layout.
 * - Formatted for standard window.print() execution (no PDF libraries or screenshots).
 * - Preserves SIMULATED DATA disclosure and safe harbor notices in print.
 * - High-density tabular sections: Summary, Timeline, Indicators, 5-Why, Actions, Re-Audit.
 */

import React from 'react';
import { Printer, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { IncidentRecord } from '../../types/incident';
import { createIncidentPrintViewData } from '../../services/incident';

export interface IncidentPrintReportProps {
  record: IncidentRecord;
  onPrint?: () => void;
  className?: string;
  isPrintPreview?: boolean;
}

export const IncidentPrintReport: React.FC<IncidentPrintReportProps> = ({
  record,
  onPrint,
  className = '',
  isPrintPreview = false,
}) => {
  const printData = createIncidentPrintViewData(record);
  const {
    incidentSummary,
    timeline,
    linkedIndicators,
    rootCause,
    correctiveActions,
    reauditPlan,
    progress,
    disclaimer,
    printedAt,
  } = printData;

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div
      className={`print-container text-left font-body text-[#14213D] ${
        isPrintPreview
          ? 'bg-white p-6 sm:p-8 border border-[#D9D3C5] rounded-[2px] shadow-sm max-w-4xl mx-auto space-y-5'
          : 'print-only p-4 space-y-4'
      } ${className}`}
    >
      {/* On-screen Print Trigger Header (hidden in print) */}
      {isPrintPreview && (
        <div
          data-print="hide"
          className="no-print flex items-center justify-between pb-4 border-b border-[#D9D3C5] bg-[#FAF8F3] -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 p-4 rounded-t-[2px]"
        >
          <div>
            <h2 className="text-sm font-bold text-[#14213D] uppercase font-mono m-0">
              Print-Friendly Formal Audit Incident File
            </h2>
            <p className="text-xs text-[#5B6475] mt-0.5 m-0 font-body">
              Compact single-page layout designed for quality committee reviews and regulatory audit submissions.
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Print incident report</span>
          </Button>
        </div>
      )}

      {/* Formal Report Header */}
      <header className="border-b-2 border-[#14213D] pb-3 print-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl tracking-tight">CareProof</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#5B6475] border-l border-[#D9D3C5] pl-2">
                Quality Improvement Incident File
              </span>
            </div>
            <h1 className="text-base font-bold text-[#14213D] mt-1 m-0">
              {incidentSummary.title}
            </h1>
          </div>
          <div className="text-right font-mono text-[10px] text-[#5B6475] shrink-0 space-y-0.5">
            <div>
              FILE ID: <strong className="text-[#14213D]">{incidentSummary.id}</strong>
            </div>
            <div>
              STATUS: <strong className="uppercase text-[#14213D]">{incidentSummary.status.replace('_', ' ')}</strong>
            </div>
            <div>PRINTED: {new Date(printedAt).toISOString().split('T')[0]}</div>
          </div>
        </div>

        {/* Prominent Simulated Data Notice in Print */}
        <div className="mt-2.5 p-2 bg-[#FAF8F3] border border-[#B7791F]/40 rounded-[1px] text-[10px] text-[#14213D] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 font-bold uppercase text-[#B7791F] font-mono">
            <AlertTriangle className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span>SIMULATED DATA — Demonstration incident record only.</span>
          </div>
          <span className="font-mono text-[#5B6475] hidden sm:inline text-[9px]">
            Zero Real Patient PHI
          </span>
        </div>
      </header>

      {/* Section 1: Executive Incident Summary */}
      <section className="space-y-1.5 text-xs">
        <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5B6475] border-b border-[#D9D3C5] pb-0.5 m-0">
          1. Incident Intake &amp; Context
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1 text-[11px] font-mono bg-[#FAF8F3]/60 p-2 border border-[#D9D3C5]/60 rounded-[1px]">
          <div>
            <span className="text-[#5B6475] block text-[10px]">INCIDENT DATE:</span>
            <span className="font-bold text-[#14213D]">{new Date(incidentSummary.timestamp).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[#5B6475] block text-[10px]">LOCATION:</span>
            <span className="font-bold text-[#14213D]">{incidentSummary.location || 'Unspecified'}</span>
          </div>
          <div>
            <span className="text-[#5B6475] block text-[10px]">REPORTER ID:</span>
            <span className="font-bold text-[#14213D]">{incidentSummary.reporterId}</span>
          </div>
          <div>
            <span className="text-[#5B6475] block text-[10px]">WORKFLOW PROGRESS:</span>
            <span className="font-bold text-[#0F6B6E]">{progress.percentComplete}% Complete</span>
          </div>
        </div>
        <p className="text-xs text-[#14213D] m-0 leading-relaxed font-body pt-1">
          <strong>Summary:</strong> {incidentSummary.summary}
        </p>
        {incidentSummary.description && (
          <p className="text-[11px] text-[#5B6475] m-0 leading-relaxed font-body">
            <strong>Narrative:</strong> {incidentSummary.description}
          </p>
        )}
      </section>

      {/* Section 2: Chronological Timeline */}
      <section className="space-y-1.5 text-xs">
        <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5B6475] border-b border-[#D9D3C5] pb-0.5 m-0">
          2. Event Timeline ({timeline.length} Recorded Milestones)
        </h3>
        <table className="w-full text-left border-collapse text-[10px] font-mono">
          <thead>
            <tr className="bg-[#FAF8F3] border-b border-[#D9D3C5] text-[#5B6475]">
              <th className="py-1 px-1.5 w-16">EVENT ID</th>
              <th className="py-1 px-1.5 w-32">TIMESTAMP</th>
              <th className="py-1 px-1.5 w-20">TYPE</th>
              <th className="py-1 px-1.5">MILESTONE DETAILS &amp; NOTES</th>
              <th className="py-1 px-1.5 w-20 text-right">SOURCE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D3C5]/60 font-body">
            {timeline.map((evt) => (
              <tr key={evt.id} className="text-[#14213D]">
                <td className="py-1 px-1.5 font-mono font-bold">{evt.id}</td>
                <td className="py-1 px-1.5 font-mono text-[9px] text-[#5B6475]">
                  {new Date(evt.timestamp).toLocaleString()}
                </td>
                <td className="py-1 px-1.5 font-mono uppercase text-[9px] text-[#5B6475]">{evt.type || 'EVENT'}</td>
                <td className="py-1 px-1.5">
                  <strong className="text-[#14213D]">{evt.title}</strong>
                  {evt.notes && <span className="text-[#5B6475] block text-[10px]">{evt.notes}</span>}
                </td>
                <td className="py-1 px-1.5 font-mono text-right text-[9px] text-[#5B6475]">{evt.authorId || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Section 3: Canonical Indicators Mapped */}
      <section className="space-y-1.5 text-xs">
        <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5B6475] border-b border-[#D9D3C5] pb-0.5 m-0">
          3. Canonical Standards Alignment (CareProof v1.4.0)
        </h3>
        <table className="w-full text-left border-collapse text-[10px] font-mono">
          <thead>
            <tr className="bg-[#FAF8F3] border-b border-[#D9D3C5] text-[#5B6475]">
              <th className="py-1 px-1.5 w-16">INDICATOR</th>
              <th className="py-1 px-1.5 w-44">STANDARD METRIC NAME</th>
              <th className="py-1 px-1.5 w-12">PILLAR</th>
              <th className="py-1 px-1.5">AUDITOR LINKAGE RATIONALE</th>
              <th className="py-1 px-1.5 w-24 text-right">EVIDENCE REF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D3C5]/60 font-body">
            {linkedIndicators.map((li) => (
              <tr key={li.indicatorId} className="text-[#14213D]">
                <td className="py-1 px-1.5 font-mono font-bold">{li.indicatorId}</td>
                <td className="py-1 px-1.5 font-semibold">{li.indicatorName || 'Standard Indicator'}</td>
                <td className="py-1 px-1.5 font-mono text-[#5B6475]">{li.pillarId || 'PMI'}</td>
                <td className="py-1 px-1.5 text-[#5B6475]">{li.reason || 'Directly impacted during event.'}</td>
                <td className="py-1 px-1.5 font-mono text-right text-[9px] text-[#5B6475]">{li.evidenceReference || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Section 4: 5-Why Root Cause Analysis */}
      <section className="space-y-1.5 text-xs">
        <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5B6475] border-b border-[#D9D3C5] pb-0.5 m-0">
          4. Root Cause Analysis (5-Why Protocol)
        </h3>
        <div className="space-y-1 text-[11px] bg-[#FAF8F3]/60 p-2 border border-[#D9D3C5]/60 rounded-[1px]">
          {rootCause.steps.map((st) => (
            <div key={st.whyNumber} className="flex items-start gap-2">
              <span className="font-mono font-bold text-[#0F6B6E] shrink-0 text-[10px]">
                Why #{st.whyNumber}:
              </span>
              <div className="flex-1">
                <span className="font-semibold text-[#14213D]">{st.question} </span>
                <span className="text-[#5B6475]">{st.answer}</span>
              </div>
            </div>
          ))}
          {rootCause.rootCauseSummary && (
            <div className="mt-1 pt-1 border-t border-[#D9D3C5]/60 text-[11px]">
              <strong className="font-mono text-[#14213D]">SYSTEMIC ROOT CAUSE: </strong>
              <span className="text-[#14213D]">{rootCause.rootCauseSummary}</span>
            </div>
          )}
        </div>
      </section>

      {/* Section 5: Corrective Actions */}
      <section className="space-y-1.5 text-xs">
        <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5B6475] border-b border-[#D9D3C5] pb-0.5 m-0">
          5. Corrective Action Plan &amp; Remediations
        </h3>
        <table className="w-full text-left border-collapse text-[10px] font-mono">
          <thead>
            <tr className="bg-[#FAF8F3] border-b border-[#D9D3C5] text-[#5B6475]">
              <th className="py-1 px-1.5 w-16">ACTION ID</th>
              <th className="py-1 px-1.5">REMEDIATION TASK</th>
              <th className="py-1 px-1.5 w-24">ASSIGNEE</th>
              <th className="py-1 px-1.5 w-20">DUE DATE</th>
              <th className="py-1 px-1.5 w-20 text-right">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D3C5]/60 font-body">
            {correctiveActions.map((act) => (
              <tr key={act.id} className="text-[#14213D]">
                <td className="py-1 px-1.5 font-mono font-bold">{act.id}</td>
                <td className="py-1 px-1.5">
                  <strong>{act.description}</strong>
                  {act.verificationNotes && (
                    <span className="text-[9px] text-[#5B6475] block">Verification: {act.verificationNotes}</span>
                  )}
                </td>
                <td className="py-1 px-1.5 font-mono text-[#5B6475]">{act.assigneeId || 'Unassigned'}</td>
                <td className="py-1 px-1.5 font-mono text-[9px] text-[#5B6475]">
                  {act.dueDate ? new Date(act.dueDate).toISOString().split('T')[0] : '-'}
                </td>
                <td className="py-1 px-1.5 font-mono text-right uppercase text-[9px] font-bold text-[#0F6B6E]">
                  {act.status.replace('_', ' ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Section 6: Re-Audit Plan */}
      <section className="space-y-1.5 text-xs">
        <h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#5B6475] border-b border-[#D9D3C5] pb-0.5 m-0">
          6. Closed-Loop Re-Audit Verification Plan
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono bg-[#FAF8F3]/60 p-2 border border-[#D9D3C5]/60 rounded-[1px]">
          <div>
            <span className="text-[#5B6475] block">RE-AUDIT STATUS:</span>
            <strong className="text-[#14213D] uppercase">{reauditPlan.status.replace('_', ' ')}</strong>
          </div>
          <div>
            <span className="text-[#5B6475] block">PLANNED DATE:</span>
            <strong className="text-[#14213D]">{reauditPlan.plannedDate ? new Date(reauditPlan.plannedDate).toLocaleDateString() : 'Pending'}</strong>
          </div>
          <div>
            <span className="text-[#5B6475] block">LEAD AUDITOR:</span>
            <strong className="text-[#14213D]">{reauditPlan.responsibleAuditorId || 'Unassigned'}</strong>
          </div>
          <div>
            <span className="text-[#5B6475] block">TARGET INDICATORS:</span>
            <strong className="text-[#14213D]">{reauditPlan.linkedIndicatorIds.join(', ') || 'All affected'}</strong>
          </div>
        </div>
        {reauditPlan.scope && (
          <p className="text-[11px] text-[#14213D] m-0 font-body">
            <strong>Verification Scope:</strong> {reauditPlan.scope}
          </p>
        )}
      </section>

      {/* Formal Footer Disclaimer */}
      <footer className="pt-3 border-t border-[#D9D3C5] text-[9px] text-[#5B6475] font-mono space-y-1">
        <div className="flex items-center justify-between">
          <span>CAREPROOF AUDIT LEDGER · DECISION SUPPORT ONLY · NOT DIAGNOSIS</span>
          <span>PAGE 1 OF 1</span>
        </div>
        <p className="m-0 leading-normal">
          {disclaimer}
        </p>
      </footer>
    </div>
  );
};
