/**
 * CareProof Audit Console - Honest Limits / What This Is Not Section
 * Source of Truth: CareProof Website Roadmap (Phase 12A)
 * 
 * Prominent but restrained section stating the honest boundaries and limitations
 * of the CareProof Audit Console to build clinical and research trust.
 */

import React from 'react';
import { AlertCircle, ShieldAlert, FileX2, Stethoscope, Cpu } from 'lucide-react';

export interface HonestLimitsSectionProps {
  className?: string;
}

export const HonestLimitsSection: React.FC<HonestLimitsSectionProps> = ({ className = '' }) => {
  const boundaries = [
    {
      title: 'Not clinically validated',
      icon: <ShieldAlert className="w-4 h-4 text-[#B7791F]" aria-hidden="true" />,
      description:
        'CareProof is a proposed quality assurance framework undergoing active prototype validation. It has not undergone prospective multi-center clinical trials and carries no clinical efficacy claims.',
    },
    {
      title: 'Decision support, not diagnosis',
      icon: <Stethoscope className="w-4 h-4 text-[#B7791F]" aria-hidden="true" />,
      description:
        'The software measures compliance against administrative and procedural audit standards. It does not diagnose clinical conditions, triage acute distress, or prescribe medical treatments.',
    },
    {
      title: 'Demo / simulated data where applicable',
      icon: <Cpu className="w-4 h-4 text-[#B7791F]" aria-hidden="true" />,
      description:
        'All patient assessments, equipment logs, and pilot datasets in this public demonstration console are synthetic in silico records generated from deterministic PRNG seeds.',
    },
    {
      title: 'Not a substitute for professional clinical judgment',
      icon: <FileX2 className="w-4 h-4 text-[#B7791F]" aria-hidden="true" />,
      description:
        'Audit scores and safety gate indicators are operational quality flags. They must never override the clinical discretion of licensed physicians, registered nurses, or emergency personnel.',
    },
  ];

  return (
    <section
      id="honest-limits"
      aria-labelledby="honest-limits-heading"
      className={`border-b border-[#D9D3C5] bg-white py-12 sm:py-16 ${className}`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-left mb-8 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#B7791F] font-semibold mb-2">
            <AlertCircle className="w-3.5 h-3.5 text-[#B7791F]" aria-hidden="true" />
            <span>Honest Research Boundaries</span>
          </div>
          <h2
            id="honest-limits-heading"
            className="text-2xl sm:text-3xl font-display font-bold text-[#14213D] tracking-tight m-0"
          >
            What this is not
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6475] font-body mt-2 leading-relaxed m-0">
            CareProof builds trust by stating its operational limits plainly, without marketing exaggeration or regulatory overreach.
          </p>
        </div>

        {/* Boundary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {boundaries.map((item) => (
            <div
              key={item.title}
              className="border border-[#D9D3C5] bg-[#FAF8F3]/50 p-5 rounded-[2px] text-left space-y-2 hover:border-[#B7791F]/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white border border-[#D9D3C5] rounded-[2px]">
                  {item.icon}
                </div>
                <h3 className="text-sm sm:text-base font-display font-bold text-[#14213D] m-0">
                  {item.title}
                </h3>
              </div>
              <p className="text-xs text-[#5B6475] font-body leading-relaxed m-0">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
