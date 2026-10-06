/**
 * CareProof Audit Console - Final Call to Action Section
 * Source of Truth: CareProof Website Roadmap (Phase 12A)
 * 
 * Simple, high-trust call to action directing users and judges
 * to the live read-only sample audit or auditor authentication.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

export interface FinalCtaSectionProps {
  className?: string;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({ className = '' }) => {
  return (
    <section
      aria-labelledby="final-cta-heading"
      className={`border-b border-[#D9D3C5] bg-[#FAF8F3] py-12 sm:py-16 ${className}`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="border border-[#D9D3C5] bg-white p-6 sm:p-10 rounded-[2px] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#0F6B6E] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Interactive Audit Demonstration</span>
            </div>
            <h2
              id="final-cta-heading"
              className="text-2xl sm:text-3xl font-display font-bold text-[#14213D] tracking-tight m-0"
            >
              Explore the CareProof Audit Ledger
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6475] font-body leading-relaxed m-0">
              Inspect the canonical standard, review simulated pilot validation metrics, and interact with the live audit console in read-only demonstration mode.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link to="/app/dashboard?mode=demo">
              <Button
                variant="primary"
                size="md"
                className="w-full sm:w-auto font-mono text-xs gap-2"
              >
                <span>Open sample audit</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button
                variant="secondary"
                size="md"
                className="w-full sm:w-auto font-mono text-xs gap-1.5"
              >
                <span>Sign in</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
