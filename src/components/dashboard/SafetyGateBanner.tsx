/**
 * CareProof Audit Console - Safety Gate Banner Component
 * Source of Truth: CareProof Website Roadmap (Phase 6B)
 * 
 * Renders the 3 canonical Safety Gate states:
 * 1. Active / Triggered: Critical life-safety failure caps final tier.
 * 2. Coverage Insufficient: Tier assignment suppressed due to coverage < 80%.
 * 3. Inactive / Clear: All critical indicator thresholds satisfied.
 */

import React from 'react';
import { AlertTriangle, AlertCircle, ShieldCheck } from 'lucide-react';
import { DashboardSummary } from '../../types/dashboard';

export interface SafetyGateBannerProps {
  summary: DashboardSummary;
}

export const SafetyGateBanner: React.FC<SafetyGateBannerProps> = ({ summary }) => {
  const { safetyGateTriggered, safetyGateIndicators, coverageGatePassed, coverage, calculatedTier, finalTier } = summary;

  // 1. Safety Gate Triggered State
  if (safetyGateTriggered) {
    return (
      <section
        role="alert"
        aria-label="Safety Gate Active Notice"
        className="border border-[#B3341A]/40 bg-[#FAF0ED] p-4 sm:p-5 rounded-[2px] text-left transition-colors font-body mb-6"
      >
        <div className="flex items-start gap-3.5">
          <div className="p-1.5 bg-[#B3341A]/10 text-[#B3341A] rounded-[2px] shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-sm font-bold text-[#B3341A] uppercase tracking-wide font-mono m-0">
                Safety Gate Active — Life-Safety Protocol Violation
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.5 border border-[#B3341A]/40 bg-white text-[#B3341A] rounded-[2px] font-bold">
                TIER CAPPED
              </span>
            </div>
            <p className="text-xs text-[#14213D] leading-relaxed m-0 font-body">
              A critical indicator breach was detected during evaluation. The final audit standing is restricted to{' '}
              <strong>{finalTier || 'Conditional'}</strong> (capped from calculated standing{' '}
              <strong>{calculatedTier || 'Unassigned'}</strong>) to ensure life-safety deficiencies cannot be obscured
              by high performance in routine areas.
            </p>
            {safetyGateIndicators.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-[#B3341A]/20 flex items-center gap-2 flex-wrap text-xs font-mono">
                <span className="text-[11px] text-[#5B6475] font-semibold">
                  Violating Critical Indicators:
                </span>
                {safetyGateIndicators.map((id) => (
                  <span
                    key={id}
                    className="px-2 py-0.5 bg-white border border-[#B3341A]/30 text-[#B3341A] text-[11px] rounded-[2px] font-bold"
                  >
                    {id}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // 2. Coverage Insufficient State
  if (coverageGatePassed === false || coverage < 80) {
    return (
      <section
        role="alert"
        aria-label="Coverage Gate Notice"
        className="border border-[#B7791F]/40 bg-[#FCF9F0] p-4 sm:p-5 rounded-[2px] text-left transition-colors font-body mb-6"
      >
        <div className="flex items-start gap-3.5">
          <div className="p-1.5 bg-[#B7791F]/10 text-[#B7791F] rounded-[2px] shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-sm font-bold text-[#B7791F] uppercase tracking-wide font-mono m-0">
                Coverage Gate Active — Tier Assignment Suppressed
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.5 border border-[#B7791F]/40 bg-white text-[#B7791F] rounded-[2px] font-bold">
                COVERAGE &lt; 80%
              </span>
            </div>
            <p className="text-xs text-[#14213D] leading-relaxed m-0 font-body">
              Audit evidence coverage is currently <strong>{coverage}%</strong>. Per CareProof audit methodology,
              a minimum of 80% indicator coverage is required to award a composite tier rating. Tier confers are
              withheld until remaining indicators are assessed.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // 3. Safety Gate Inactive / Clear State
  return (
    <section
      aria-label="Safety Gate Clear Notice"
      className="border border-[#0F6B6E]/30 bg-[#F0F7F7] p-4 sm:p-5 rounded-[2px] text-left transition-colors font-body mb-6"
    >
      <div className="flex items-start gap-3.5">
        <div className="p-1.5 bg-[#0F6B6E]/10 text-[#0F6B6E] rounded-[2px] shrink-0 mt-0.5">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-sm font-bold text-[#0F6B6E] uppercase tracking-wide font-mono m-0">
              Safety Gate Clear — All Life-Safety Checks Satisfied
            </h2>
            <span className="text-[10px] font-mono px-1.5 py-0.5 border border-[#0F6B6E]/40 bg-white text-[#0F6B6E] rounded-[2px] font-semibold">
              GATE UNRESTRICTED
            </span>
          </div>
          <p className="text-xs text-[#14213D] leading-relaxed m-0 font-body">
            Zero critical life-safety indicator breaches detected. Audit evidence coverage is sufficient, and composite
            tier standing reflects unconstrained weighted indicator evaluations.
          </p>
        </div>
      </div>
    </section>
  );
};
