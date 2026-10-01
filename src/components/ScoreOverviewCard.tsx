import React from 'react';
import { AlertTriangle, CheckCircle, Shield, XCircle } from 'lucide-react';
import { AuditScoreResult } from '../types/standard';

interface ScoreOverviewCardProps {
  scoreResult: AuditScoreResult;
  facilityName: string;
  departmentOrUnit: string;
  auditDate: string;
  leadAuditor: string;
  isSimulated: boolean;
  simulationSeed?: number;
}

export const ScoreOverviewCard: React.FC<ScoreOverviewCardProps> = ({
  scoreResult,
  facilityName,
  departmentOrUnit,
  auditDate,
  leadAuditor,
  isSimulated,
  simulationSeed,
}) => {
  const { compositeScore, assignedTier, uncappedTier, tierCappedBySafetyGate, tierDetails, summary } = scoreResult;

  return (
    <div className="border border-stone-200 bg-white rounded-[2px] p-5 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b border-stone-200">
        {/* Left: Facility and Audit Meta */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="font-mono-ledger text-xs font-semibold uppercase tracking-wider text-teal-950 bg-teal-50 px-2 py-0.5 border border-teal-200 rounded-[2px]">
              Audit Ledger Entry
            </span>
            {isSimulated && (
              <span
                title="This dataset was generated using deterministic PRNG simulation for audit demonstration. Not real patient or facility data."
                className="font-mono-ledger text-xs font-semibold uppercase tracking-wider text-amber-900 bg-amber-50 px-2 py-0.5 border border-amber-300 rounded-[2px]"
              >
                SIMULATED DATASET {simulationSeed !== undefined ? `(SEED: ${simulationSeed})` : ''}
              </span>
            )}
            <span className="font-mono-ledger text-xs text-stone-500">
              Audit Date: {auditDate}
            </span>
          </div>

          <h1 className="text-xl font-bold text-stone-900 tracking-tight">
            {facilityName}
          </h1>
          <p className="text-xs text-stone-600 font-mono-ledger mt-0.5">
            {departmentOrUnit} • <span className="text-stone-500">{leadAuditor}</span>
          </p>
        </div>

        {/* Right: Primary Score & Assigned Tier */}
        <div className="flex items-center gap-6 self-start lg:self-center">
          {/* Numerical Score */}
          <div className="text-right">
            <div className="text-[10px] font-mono-ledger uppercase tracking-wider text-stone-500">
              Composite Audit Score
            </div>
            <div className="flex items-baseline justify-end gap-1">
              <span className="font-serif-score text-4xl lg:text-5xl font-semibold text-stone-900 tracking-tight">
                {compositeScore.toFixed(1)}
              </span>
              <span className="font-mono-ledger text-xs text-stone-400">/ 100</span>
            </div>
            <div className="text-[11px] font-mono-ledger text-stone-500">
              Weighted 5-Pillar Index
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="h-14 w-[1px] bg-stone-200" />

          {/* Assigned Tier Badge */}
          <div>
            <div className="text-[10px] font-mono-ledger uppercase tracking-wider text-stone-500 mb-1">
              Standing Assignment
            </div>
            <div className="flex flex-col items-start gap-1">
              <span
                className={`inline-flex items-center px-3 py-1 font-mono-ledger font-bold text-sm tracking-wide border rounded-[2px] ${tierDetails.badgeClass}`}
              >
                {assignedTier}
              </span>
              <span className="text-xs font-medium text-stone-700">
                {tierDetails.name}
              </span>
            </div>
            {tierCappedBySafetyGate && (
              <div className="mt-1 text-[10px] font-mono-ledger text-rose-700 font-medium">
                Capped from {uncappedTier} by Safety Gate
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Summary Bar: Metrics & Status Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-4 text-xs font-mono-ledger">
        <div className="p-2.5 bg-stone-50/80 border border-stone-200 rounded-[2px]">
          <div className="text-[10px] uppercase text-stone-500">Indicators Assessed</div>
          <div className="text-sm font-bold text-stone-900 mt-0.5">
            {summary.assessedIndicators} <span className="text-stone-400 font-normal">/ {summary.totalIndicators}</span>
          </div>
        </div>

        <div className="p-2.5 bg-stone-50/80 border border-stone-200 rounded-[2px]">
          <div className="text-[10px] uppercase text-stone-500">Compliant (Pass)</div>
          <div className="text-sm font-bold text-emerald-800 mt-0.5 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            {summary.passCount}
          </div>
        </div>

        <div className="p-2.5 bg-stone-50/80 border border-stone-200 rounded-[2px]">
          <div className="text-[10px] uppercase text-stone-500">Marginal (Warning)</div>
          <div className="text-sm font-bold text-amber-800 mt-0.5 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            {summary.warningCount}
          </div>
        </div>

        <div className="p-2.5 bg-stone-50/80 border border-stone-200 rounded-[2px]">
          <div className="text-[10px] uppercase text-stone-500">Non-Compliant (Fail)</div>
          <div className="text-sm font-bold text-rose-800 mt-0.5 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            {summary.failCount}
          </div>
        </div>

        <div className="p-2.5 bg-stone-50/80 border border-stone-200 rounded-[2px]">
          <div className="text-[10px] uppercase text-stone-500">Critical Life-Safety</div>
          <div className="text-sm font-bold text-stone-900 mt-0.5 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-stone-600" />
            <span className={summary.criticalFailed > 0 ? 'text-rose-700 font-bold' : 'text-stone-900'}>
              {summary.criticalPassed} passed {summary.criticalFailed > 0 ? `(${summary.criticalFailed} fail)` : ''}
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-stone-50/80 border border-stone-200 rounded-[2px]">
          <div className="text-[10px] uppercase text-stone-500">Safety Gate Status</div>
          <div className={`text-sm font-bold mt-0.5 ${scoreResult.safetyGate.tripped ? 'text-rose-700' : 'text-teal-800'}`}>
            {scoreResult.safetyGate.tripped ? 'TRIPPED (CAP)' : 'CLEAR'}
          </div>
        </div>
      </div>
    </div>
  );
};
