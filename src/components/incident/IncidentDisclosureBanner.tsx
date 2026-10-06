/**
 * CareProof Audit Console - Incident Response Simulation Disclosure Banner (Phase 11B)
 * Source of Truth: CareProof Website Roadmap (Phase 11B)
 * 
 * PROMINENT DISCLOSURE CONTRACT:
 * - "SIMULATED DATA — Demonstration incident records only."
 * - "Proposed framework, not clinically validated. Decision support, not diagnosis."
 * - States local in-memory editing boundary; zero Firebase persistence claims.
 */

import React from 'react';
import { AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';
import { INCIDENT_SAFE_HARBOR_DISCLAIMER } from '../../services/incident';

export interface IncidentDisclosureBannerProps {
  className?: string;
}

export const IncidentDisclosureBanner: React.FC<IncidentDisclosureBannerProps> = ({
  className = '',
}) => {
  return (
    <section
      role="region"
      aria-label="Simulation Notice and Research Integrity Disclosure"
      className={`border-2 border-[#B7791F]/40 bg-[#FCF9F0] p-4 sm:p-5 rounded-[2px] text-left transition-colors font-body ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2 bg-[#B7791F]/15 text-[#B7791F] rounded-[2px] shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span
              className="text-xs font-mono font-bold px-2 py-0.5 border border-[#B7791F] bg-[#B7791F] text-white rounded-[2px] tracking-wider"
              aria-label="Simulated Data Notice"
            >
              SIMULATED DATA
            </span>
            <h2 className="text-sm font-bold text-[#14213D] uppercase tracking-wide font-mono m-0">
              Demonstration incident records only
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 border border-[#B7791F]/30 bg-white text-[#B7791F] rounded-[2px]">
              SYNTHETIC WORKFLOW
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#14213D] leading-relaxed font-body m-0">
            <strong>{INCIDENT_SAFE_HARBOR_DISCLAIMER}</strong>{' '}
            All incident records and actions in this console are synthetic demonstration data.
            Zero real-world patient records, medical record numbers (MRN), or adverse events are depicted.
          </p>

          <div className="mt-3 pt-2.5 border-t border-[#B7791F]/20 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#5B6475] font-mono">
            <span className="inline-flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#B7791F]" aria-hidden="true" />
              <span>Zero real patient PHI</span>
            </span>
            <span className="text-[#D9D3C5] hidden sm:inline">|</span>
            <span className="inline-flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#B7791F]" aria-hidden="true" />
              <span>In-memory session state (No Firestore persistence)</span>
            </span>
            <span className="text-[#D9D3C5] hidden sm:inline">|</span>
            <span>Audit quality improvement demonstration only</span>
          </div>
        </div>
      </div>
    </section>
  );
};
