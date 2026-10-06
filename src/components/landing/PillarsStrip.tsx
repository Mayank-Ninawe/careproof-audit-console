/**
 * CareProof Audit Console - Five Pillars Ledger Strip
 * Source of Truth: CareProof Website Roadmap (Phase 12A)
 * 
 * Dynamically rendered strip of all five canonical audit pillars from standard.json.
 * Indicator counts are dynamically derived from standard.indicators.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { CANONICAL_STANDARD } from '../../data/standard';

export interface PillarsStripProps {
  className?: string;
}

export const PillarsStrip: React.FC<PillarsStripProps> = ({ className = '' }) => {
  // Derive indicator counts dynamically from canonical standard
  const pillarsWithMetadata = CANONICAL_STANDARD.pillars.map((pillar) => {
    const indicatorCount = CANONICAL_STANDARD.indicators.filter(
      (ind) => ind.pillarId === pillar.id
    ).length;

    return {
      ...pillar,
      indicatorCount,
      weightPercent: `${Math.round(pillar.weight * 100)}%`,
    };
  });

  return (
    <section
      id="pillars"
      aria-labelledby="pillars-strip-heading"
      className={`border-b border-[#D9D3C5] bg-white py-12 sm:py-16 ${className}`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 text-left">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#5B6475] font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
              <span>Canonical Framework</span>
            </div>
            <h2
              id="pillars-strip-heading"
              className="text-2xl sm:text-3xl font-display font-bold text-[#14213D] tracking-tight m-0"
            >
              Five CareProof Pillars
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6475] font-body mt-2 leading-relaxed m-0">
              The foundational audit structure governing home-care quality measurement in CareProof Standard v1.4.0.
            </p>
          </div>

          <Link
            to="/app/standard?mode=demo"
            className="text-xs font-mono font-semibold text-[#0F6B6E] hover:underline inline-flex items-center gap-1 shrink-0"
          >
            <span>Explore Standard Explorer</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Ledger-Style Report Strip (Dense tabular structure, not generic cards) */}
        <div className="border border-[#D9D3C5] rounded-[2px] divide-y divide-[#D9D3C5] bg-white overflow-hidden">
          {pillarsWithMetadata.map((pillar) => (
            <div
              key={pillar.id}
              className="p-4 sm:p-5 text-left flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF8F3]/60 transition-colors"
            >
              {/* Pillar Identity & Name */}
              <div className="md:w-5/12 flex items-start gap-3">
                <span className="font-mono text-xs font-bold px-2 py-0.5 border border-[#0F6B6E]/30 bg-[#0F6B6E]/5 text-[#0F6B6E] rounded-[2px] shrink-0 mt-0.5">
                  {pillar.id}
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-display font-bold text-[#14213D] m-0">
                    {pillar.name}
                  </h3>
                  <div className="text-[11px] font-mono text-[#5B6475] mt-0.5">
                    Lead: {pillar.leadAuditorRole}
                  </div>
                </div>
              </div>

              {/* Pillar Description */}
              <div className="md:w-5/12 text-xs text-[#5B6475] font-body leading-relaxed">
                {pillar.description}
              </div>

              {/* Indicator Count & Weight Badges */}
              <div className="md:w-2/12 flex items-center justify-between md:justify-end gap-4 shrink-0 font-mono text-xs">
                <div className="text-left md:text-right">
                  <span className="text-[10px] text-[#5B6475] block uppercase">Indicators</span>
                  <span className="font-bold text-[#14213D] tabular-nums">
                    {`${pillar.indicatorCount} indicators`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#5B6475] block uppercase">Weight</span>
                  <span className="font-bold text-[#0F6B6E] tabular-nums">
                    {pillar.weightPercent}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
