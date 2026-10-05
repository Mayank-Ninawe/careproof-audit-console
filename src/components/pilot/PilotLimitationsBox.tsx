/**
 * CareProof Audit Console - Pilot Study Limitations Box Component
 * Source of Truth: CareProof Website Roadmap (Phase 10B)
 * 
 * RESEARCH-INTEGRITY CONTRACT:
 * - Mandatory prominent limitations section.
 * - Explicitly disclaims clinical validation, real patient evidence, and diagnostic claims.
 * - Zero marketing language or weakened safe harbor notices.
 */

import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Badge } from '../ui/Badge';
import { PilotLimitations } from '../../types/pilot';

export interface PilotLimitationsBoxProps {
  limitations: PilotLimitations;
  className?: string;
}

export const PilotLimitationsBox: React.FC<PilotLimitationsBoxProps> = ({
  limitations,
  className = '',
}) => {
  const { statements, safeHarborNotice } = limitations;

  return (
    <Panel
      title="Study Limitations &amp; Methodological Disclosures"
      className={className}
      headerActions={<Badge variant="warn">CRITICAL DISCLOSURE</Badge>}
    >
      <div className="space-y-4 text-left font-body">
        {/* Safe Harbor Alert Block */}
        <div className="p-3.5 bg-[#FCF9F0] border border-[#B7791F]/40 rounded-[2px] flex items-start gap-3">
          <div className="p-1.5 bg-[#B7791F]/15 text-[#B7791F] rounded-[2px] shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#B7791F] block">
              Safe Harbor Notice
            </span>
            <p className="text-xs text-[#14213D] leading-relaxed font-body mt-0.5 m-0">
              <strong>{safeHarborNotice}</strong>
            </p>
          </div>
        </div>

        {/* Detailed Limitations List */}
        <div className="bg-[#FAF8F3] p-4 border border-[#D9D3C5] rounded-[2px]">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-[#5B6475] mb-2.5">
            <ShieldAlert className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
            <span>Formal In Silico Boundary Statements</span>
          </div>

          <ul className="space-y-2 text-xs text-[#14213D] font-body list-disc pl-5 m-0 leading-relaxed">
            {statements.map((statement, idx) => (
              <li key={idx} className="marker:text-[#5B6475]">
                {statement}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[11px] text-[#5B6475] font-mono m-0 pt-1 leading-normal">
          * Note: Prospective clinical trials and external multisite evaluations must be executed independently prior
          to any real-world operational reliance or regulatory submission.
        </p>
      </div>
    </Panel>
  );
};
