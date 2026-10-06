/**
 * CareProof Audit Console - Audience Ledger Component
 * Source of Truth: CareProof Website Roadmap (Phase 12A)
 * 
 * "Who is this for?" ledger presented in a structured clinical report layout
 * rather than a generic 3-card SaaS feature grid.
 */

import React from 'react';
import { Users, Home, Building2, ClipboardCheck } from 'lucide-react';

export interface AudienceLedgerProps {
  className?: string;
}

export const AudienceLedger: React.FC<AudienceLedgerProps> = ({ className = '' }) => {
  const audiences = [
    {
      id: 'family',
      code: '01',
      audience: 'Family',
      icon: <Home className="w-4 h-4 text-[#0F6B6E]" aria-hidden="true" />,
      question: 'Is care being assessed against something explicit?',
      answer:
        'CareProof exposes the underlying clinical standard, required evidence tags, deterministic scores, confidence levels, and methodological limitations rather than asking families to rely on unverified subjective assurances.',
      focus: 'Clarity, transparent standards, and explicit evidence classification.',
    },
    {
      id: 'agency',
      code: '02',
      audience: 'Agency',
      icon: <Building2 className="w-4 h-4 text-[#0F6B6E]" aria-hidden="true" />,
      question: 'What should we fix first?',
      answer:
        'The console highlights weighted performance gaps, surfaces critical safety-gate indicator trips, and generates prioritized remediation ordering so clinical managers can address highest-impact operational risks first.',
      focus: 'Weighted gap analysis, safety gates, and corrective action workflows.',
    },
    {
      id: 'auditor',
      code: '03',
      audience: 'Auditor / Researcher',
      icon: <ClipboardCheck className="w-4 h-4 text-[#0F6B6E]" aria-hidden="true" />,
      question: 'How was this score produced?',
      answer:
        'Every score is fully reproducible: the console provides indicator definitions, evidence classifications ([E] Established, [I] Interpretation, [P] Proposed), mathematical weighting rules, coverage gates, and in silico simulation reproducibility metadata.',
      focus: 'Mathematical determinism, audit trail integrity, and statistical reproducibility.',
    },
  ];

  return (
    <section
      aria-labelledby="audience-ledger-heading"
      className={`border-b border-[#D9D3C5] bg-white py-12 sm:py-16 ${className}`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-left mb-8 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#5B6475] font-semibold mb-2">
            <Users className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
            <span>Target Stakeholders</span>
          </div>
          <h2
            id="audience-ledger-heading"
            className="text-2xl sm:text-3xl font-display font-bold text-[#14213D] tracking-tight m-0"
          >
            Who is this for?
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6475] font-body mt-2 leading-relaxed m-0">
            A unified clinical quality audit ledger designed to answer the core operational questions of families, agencies, and auditors.
          </p>
        </div>

        {/* Dense Ledger Structure (Not a generic card grid) */}
        <div className="border border-[#D9D3C5] rounded-[2px] divide-y divide-[#D9D3C5] bg-[#FAF8F3]/30">
          {audiences.map((item) => (
            <div
              key={item.id}
              className="p-5 sm:p-6 text-left grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start hover:bg-[#FAF8F3]/80 transition-colors"
            >
              {/* Audience Identity Column */}
              <div className="lg:col-span-3 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#0F6B6E] font-bold">
                    [{item.code}]
                  </span>
                  <div className="p-1 bg-white border border-[#D9D3C5] rounded-[2px]">
                    {item.icon}
                  </div>
                  <h3 className="text-base font-display font-bold text-[#14213D] m-0">
                    {item.audience}
                  </h3>
                </div>
                <div className="text-[11px] font-mono text-[#5B6475] pt-1">
                  Scope: {item.focus}
                </div>
              </div>

              {/* Inquiry & Resolution Ledger Columns */}
              <div className="lg:col-span-9 space-y-2 border-t lg:border-t-0 lg:border-l border-[#D9D3C5]/60 pt-3 lg:pt-0 lg:pl-6">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#5B6475] block">
                    Core Question
                  </span>
                  <p className="text-sm font-semibold text-[#14213D] font-body mt-0.5 m-0">
                    &ldquo;{item.question}&rdquo;
                  </p>
                </div>

                <div className="pt-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#5B6475] block">
                    CareProof Resolution
                  </span>
                  <p className="text-xs sm:text-sm text-[#5B6475] font-body leading-relaxed mt-0.5 m-0">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
