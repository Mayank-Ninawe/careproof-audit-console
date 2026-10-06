/**
 * CareProof Audit Console - How It Works Section
 * Source of Truth: CareProof Website Roadmap (Phase 12A)
 * 
 * Four-step horizontal/stacked ledger detailing the workflow from canonical
 * standard definition through evidence collection, scoring, and pilot study simulation.
 */

import React from 'react';
import { Layers, FileCode, CheckSquare, Calculator, FlaskConical } from 'lucide-react';

export interface HowItWorksSectionProps {
  className?: string;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ className = '' }) => {
  const steps = [
    {
      step: '01',
      title: 'Define standard',
      icon: <FileCode className="w-4 h-4 text-[#0F6B6E]" aria-hidden="true" />,
      detail:
        'Standardized around CareProof Standard v1.4.0—five core quality pillars, numerical compliance thresholds, and deterministic scoring criteria defined in standard.json.',
      technicalBadge: 'CANONICAL STANDARD',
    },
    {
      step: '02',
      title: 'Collect evidence',
      icon: <CheckSquare className="w-4 h-4 text-[#0F6B6E]" aria-hidden="true" />,
      detail:
        'Audit observations are verified against evidence classifications: [E] Established clinical guidelines, [I] Derived interpretations, and [P] Proposed demonstration metrics.',
      technicalBadge: 'EVIDENCE CLASSIFICATION',
    },
    {
      step: '03',
      title: 'Score with confidence',
      icon: <Calculator className="w-4 h-4 text-[#0F6B6E]" aria-hidden="true" />,
      detail:
        'Pure scoring engine computes weighted composite scores, checks audit coverage thresholds (minimum 80%), and trips binary safety gates on critical care breaches.',
      technicalBadge: 'DETERMINISTIC SCORING',
    },
    {
      step: '04',
      title: 'Prove with study',
      icon: <FlaskConical className="w-4 h-4 text-[#0F6B6E]" aria-hidden="true" />,
      detail:
        'Deterministic in silico simulation generates reproducible demonstration cohorts, reporting score distributions, inter-rater reliability, and explicit research boundaries.',
      technicalBadge: 'SIMULATED PILOT',
    },
  ];

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className={`border-b border-[#D9D3C5] bg-[#FAF8F3] py-12 sm:py-16 ${className}`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-left mb-8 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#5B6475] font-semibold mb-2">
            <Layers className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
            <span>Audit Architecture</span>
          </div>
          <h2
            id="how-it-works-heading"
            className="text-2xl sm:text-3xl font-display font-bold text-[#14213D] tracking-tight m-0"
          >
            How it works
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6475] font-body mt-2 leading-relaxed m-0">
            A closed-loop audit methodology transforming qualitative care observations into deterministic, verifiable standing.
          </p>
        </div>

        {/* 4-Step Ledger Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((item) => (
            <div
              key={item.step}
              className="border border-[#D9D3C5] bg-white p-5 rounded-[2px] text-left flex flex-col justify-between space-y-4 hover:border-[#0F6B6E]/40 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#0F6B6E] px-2 py-0.5 border border-[#0F6B6E]/30 bg-[#0F6B6E]/5 rounded-[2px]">
                    {`STEP ${item.step}`}
                  </span>
                  <div className="p-1.5 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]">
                    {item.icon}
                  </div>
                </div>

                <h3 className="text-base font-display font-bold text-[#14213D] m-0">
                  {item.title}
                </h3>

                <p className="text-xs text-[#5B6475] font-body leading-relaxed m-0">
                  {item.detail}
                </p>
              </div>

              <div className="pt-2 border-t border-[#D9D3C5]/60 text-[10px] font-mono text-[#5B6475] uppercase tracking-wider">
                {item.technicalBadge}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
