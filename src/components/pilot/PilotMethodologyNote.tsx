/**
 * CareProof Audit Console - Pilot Study Methodology Note Component
 * Source of Truth: CareProof Website Roadmap (Phase 10B)
 * 
 * METHODOLOGY CONTRACT:
 * - Compact, factual explanation of computational metrics.
 * - Explains Mulberry32 PRNG, Cohen's Kappa, Cronbach's Alpha, and empirical ROC.
 * - Zero fabricated academic claims or external citations.
 */

import React from 'react';
import { BookOpen, Cpu, CheckSquare, LineChart } from 'lucide-react';
import { Panel } from '../ui/Panel';

export interface PilotMethodologyNoteProps {
  className?: string;
}

export const PilotMethodologyNote: React.FC<PilotMethodologyNoteProps> = ({
  className = '',
}) => {
  return (
    <Panel
      title="Computational Methodology &amp; Mathematical Basis"
      className={className}
      variant="paper"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left font-body text-xs">
        <div className="p-3 bg-white border border-[#D9D3C5] rounded-[2px] space-y-1.5">
          <div className="flex items-center gap-1.5 font-mono font-semibold text-[#14213D] uppercase text-[11px]">
            <Cpu className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
            <span>Mulberry32 PRNG</span>
          </div>
          <p className="text-[#5B6475] m-0 leading-relaxed font-body">
            Generates 32-bit pseudo-random sequences with cycle length ~2<sup>32</sup>. Isolated from browser entropy,
            ensuring identical inputs reproduce bit-for-bit identical simulated cohorts.
          </p>
        </div>

        <div className="p-3 bg-white border border-[#D9D3C5] rounded-[2px] space-y-1.5">
          <div className="flex items-center gap-1.5 font-mono font-semibold text-[#14213D] uppercase text-[11px]">
            <CheckSquare className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
            <span>Reliability Indices</span>
          </div>
          <p className="text-[#5B6475] m-0 leading-relaxed font-body">
            Cohen’s Kappa adjusts categorical rater agreement against chance expectation. Cronbach’s Alpha measures
            internal consistency across simulated indicator item response matrices.
          </p>
        </div>

        <div className="p-3 bg-white border border-[#D9D3C5] rounded-[2px] space-y-1.5">
          <div className="flex items-center gap-1.5 font-mono font-semibold text-[#14213D] uppercase text-[11px]">
            <LineChart className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
            <span>Empirical ROC / AUC</span>
          </div>
          <p className="text-[#5B6475] m-0 leading-relaxed font-body">
            Empirical non-parametric ROC curves evaluate classification trade-offs across distinct score cutoffs. AUC
            is calculated exactly via the Wilcoxon-Mann-Whitney rank-sum statistic.
          </p>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#D9D3C5]/60 flex items-center gap-1.5 text-[11px] text-[#5B6475] font-mono">
        <BookOpen className="w-3.5 h-3.5 text-[#0F6B6E] shrink-0" aria-hidden="true" />
        <span>CareProof Audit Console In Silico Analytics Suite · Version 1.0 (Phase 10B)</span>
      </div>
    </Panel>
  );
};
