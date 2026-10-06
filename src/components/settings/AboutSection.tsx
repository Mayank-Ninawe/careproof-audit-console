/**
 * CareProof Audit Console - About & References Settings Section
 * Source of Truth: CareProof Website Roadmap (Phase 13)
 * 
 * Exposes application version, canonical standard metadata,
 * references destination, and research-integrity safe harbor disclosures.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Info, BookOpen, AlertTriangle, ArrowRight } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { CANONICAL_STANDARD } from '../../data/standard';

export interface AboutSectionProps {
  className?: string;
  isDemo?: boolean;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  className = '',
  isDemo = false,
}) => {
  const standardDestination = isDemo ? '/app/standard?mode=demo' : '/app/standard';
  const pilotDestination = isDemo ? '/app/pilot?mode=demo' : '/app/pilot';

  return (
    <Panel
      title="About & References"
      headerActions={
        <div className="flex items-center gap-1 text-[11px] font-mono text-[#5B6475]">
          <Info className="w-3.5 h-3.5" aria-hidden="true" />
          <span>System Information</span>
        </div>
      }
      className={className}
    >
      <div className="space-y-4 text-left text-xs font-body">
        {/* System Specifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border border-[#D9D3C5] bg-[#FAF8F3]/50 p-3 rounded-[2px] font-mono text-[11px]">
          <div>
            <span className="text-[#5B6475] block uppercase text-[10px]">Application</span>
            <strong className="text-[#14213D] font-body text-xs">CareProof Audit Console</strong>
          </div>
          <div>
            <span className="text-[#5B6475] block uppercase text-[10px]">Standard Version</span>
            <strong className="text-[#0F6B6E]">{`v${CANONICAL_STANDARD.version}`}</strong>
          </div>
          <div>
            <span className="text-[#5B6475] block uppercase text-[10px]">Effective Date</span>
            <strong className="text-[#14213D]">{CANONICAL_STANDARD.effectiveDate}</strong>
          </div>
        </div>

        {/* Product Description */}
        <p className="text-xs text-[#5B6475] leading-relaxed m-0">
          An auditable clinical quality ledger and decision support console for structured home-care oversight.
          Evaluates clinical safety protocols, caregiver workload, equipment hygiene, patient observation latency, and governance integrity.
        </p>

        {/* References Destination */}
        <div className="space-y-2 border-t border-[#D9D3C5]/60 pt-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#14213D] m-0">
              Clinical &amp; Methodological References
            </h4>
            <Link
              to={standardDestination}
              className="text-[11px] font-mono text-[#0F6B6E] hover:underline inline-flex items-center gap-1"
            >
              <BookOpen className="w-3 h-3" aria-hidden="true" />
              <span>Standard Explorer</span>
              <ArrowRight className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>

          <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] text-[11px] text-[#5B6475] leading-relaxed">
            Canonical guideline citations (including CDC Hand Hygiene Guidelines, ISMP High-Alert Medication Standards, and ECRI Device Maintenance Protocols) are indexed directly within each canonical indicator in the{' '}
            <Link to={standardDestination} className="text-[#0F6B6E] hover:underline font-semibold">
              Standard Explorer
            </Link>
            . Pilot statistical formulations (Cohen&apos;s Kappa, Cronbach&apos;s Alpha, Empirical ROC/AUC) are detailed in the{' '}
            <Link to={pilotDestination} className="text-[#0F6B6E] hover:underline font-semibold">
              Pilot Study Protocol
            </Link>
            . No external third-party bibliographies are linked in this build.
          </div>
        </div>

        {/* Mandatory Research-Integrity Safe Harbor Disclosures */}
        <div className="p-3.5 bg-[#FAF8F3] border border-[#B7791F]/40 rounded-[2px] flex items-start gap-2.5 text-[#14213D]">
          <AlertTriangle className="w-4 h-4 text-[#B7791F] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1 text-xs">
            <p className="font-bold text-[#B7791F] uppercase font-mono text-[11px] m-0">
              Research &amp; Demonstration Disclosure
            </p>
            <p className="m-0 leading-relaxed">
              <strong>Some application data is simulated for demonstration and reproducibility.</strong>
            </p>
            <p className="m-0 leading-relaxed text-[#5B6475]">
              Proposed framework, not clinically validated. Decision support, not diagnosis.
              All sample records, simulated scores, and equipment logs in this console are synthetic demonstration data.
            </p>
          </div>
        </div>
      </div>
    </Panel>
  );
};
