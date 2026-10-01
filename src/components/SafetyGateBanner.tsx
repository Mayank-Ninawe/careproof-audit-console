import { CheckCircle2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { SafetyGateResult } from '../types/standard';

interface SafetyGateBannerProps {
  safetyGate: SafetyGateResult;
  onIndicatorClick?: (indicatorId: string) => void;
}

export const SafetyGateBanner = ({
  safetyGate,
  onIndicatorClick,
}: SafetyGateBannerProps) => {
  if (safetyGate.tripped) {
    return (
      <div className="border border-rose-300 bg-rose-50/70 p-4 rounded-[2px] text-rose-950 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-rose-100 border border-rose-300 rounded-[2px] text-rose-700 shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono-ledger font-semibold text-xs tracking-wider uppercase text-rose-800 bg-rose-200/80 px-2 py-0.5 border border-rose-300 rounded-[2px]">
                  Safety Gate Tripped
                </span>
                <span className="text-sm font-semibold text-rose-900">
                  Life-Safety Critical Failure Cap Enforced: Max Achievable {safetyGate.maxAchievableTier}
                </span>
              </div>
              <span className="text-xs font-mono-ledger text-rose-800">
                {safetyGate.trippedCount} {safetyGate.trippedCount === 1 ? 'critical breach' : 'critical breaches'} detected
              </span>
            </div>

            <p className="text-xs text-rose-800 mt-1 leading-relaxed">
              One or more indicators designated as life-safety critical have failed their required threshold band. Regardless of overall composite performance, facility tier assignment is restricted to {safetyGate.maxAchievableTier}. Remediation action and re-audit verification are required.
            </p>

            <div className="mt-3 divide-y divide-rose-200/80 border border-rose-200 bg-white rounded-[2px] overflow-hidden">
              {safetyGate.violations.map((violation) => (
                <div
                  key={violation.indicatorId}
                  onClick={() => onIndicatorClick?.(violation.indicatorId)}
                  className={`p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-rose-50/50 transition-colors ${
                    onIndicatorClick ? 'cursor-pointer' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono-ledger font-bold text-rose-900 bg-rose-100 px-1.5 py-0.5 border border-rose-200 rounded-[2px]">
                      {violation.code}
                    </span>
                    <span className="font-medium text-stone-900">{violation.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 font-mono-ledger text-[11px] text-stone-700">
                      <span className="text-rose-700 font-semibold">
                        Measured: {violation.measuredValue !== null ? `${violation.measuredValue} ${violation.unit}` : 'Missing'}
                      </span>
                      <span className="text-stone-400">|</span>
                      <span>Target: &gt;={violation.thresholdPass} {violation.unit}</span>
                    </div>
                    <span className="text-[10px] uppercase font-mono-ledger font-semibold text-rose-700 bg-rose-100/80 px-1.5 py-0.5 border border-rose-200 rounded-[2px]">
                      Cap: {violation.safetyGateCap}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Clear State
  return (
    <div className="border border-stone-200 bg-white p-3 rounded-[2px] mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-1 bg-stone-100 border border-stone-200 rounded-[2px] text-teal-800">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <span className="font-mono-ledger text-xs font-semibold uppercase tracking-wider text-teal-900 bg-teal-50 px-2 py-0.5 border border-teal-200 rounded-[2px] mr-2">
            Safety Gates Clear
          </span>
          <span className="text-xs text-stone-700">
            All 7 life-safety critical indicators meeting compliant thresholds. No tier restrictions imposed.
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-stone-500 font-mono-ledger shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
        <span>7/7 Verified</span>
      </div>
    </div>
  );
};
