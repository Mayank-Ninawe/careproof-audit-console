/**
 * CareProof Audit Console - Pilot Study Simulation Disclosure Banner
 * Source of Truth: CareProof Website Roadmap (Phase 10B)
 * 
 * PROMINENT DISCLOSURE CONTRACT:
 * - Visibly tags all data and metrics as SIMULATED.
 * - Disclaims clinical validation and real patient evidence.
 * - Decision support, not diagnosis.
 */

import React from 'react';
import { AlertCircle, FlaskConical, ShieldAlert } from 'lucide-react';
import { PILOT_SAFE_HARBOR_DISCLAIMER } from '../../services/pilot';

export interface PilotDisclosureBannerProps {
  className?: string;
}

export const PilotDisclosureBanner: React.FC<PilotDisclosureBannerProps> = ({
  className = '',
}) => {
  return (
    <section
      role="region"
      aria-label="Simulation Notice and Research Integrity Disclosure"
      className={`border-2 border-[#0F6B6E]/40 bg-[#F0F7F7] p-4 sm:p-5 rounded-[2px] text-left transition-colors font-body ${className}`}
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2 bg-[#0F6B6E]/15 text-[#0F6B6E] rounded-[2px] shrink-0 mt-0.5">
          <FlaskConical className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span
              className="text-xs font-mono font-bold px-2 py-0.5 border border-[#0F6B6E] bg-[#0F6B6E] text-white rounded-[2px] tracking-wider"
              aria-label="Simulated Data Notice"
            >
              SIMULATED
            </span>
            <h2 className="text-sm font-bold text-[#14213D] uppercase tracking-wide font-mono m-0">
              In Silico Validation Demonstration Environment
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 border border-[#0F6B6E]/30 bg-white text-[#0F6B6E] rounded-[2px]">
              SYNTHETIC DATASET
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#14213D] leading-relaxed font-body m-0">
            <strong>All results on this page are generated from deterministic demonstration data.</strong>{' '}
            {PILOT_SAFE_HARBOR_DISCLAIMER}
          </p>

          <div className="mt-3 pt-2.5 border-t border-[#0F6B6E]/20 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#5B6475] font-mono">
            <span className="inline-flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
              <span>Zero real patient records or PHI</span>
            </span>
            <span className="text-[#D9D3C5] hidden sm:inline">|</span>
            <span className="inline-flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
              <span>No clinical validation established</span>
            </span>
            <span className="text-[#D9D3C5] hidden sm:inline">|</span>
            <span>Algorithmic reproducibility demonstration only</span>
          </div>
        </div>
      </div>
    </section>
  );
};
