/**
 * CareProof Audit Console - Public Footer
 * Source of Truth: CareProof Website Roadmap (Phase 12A)
 * 
 * Accessible, structured footer providing navigation, privacy guarantees,
 * versioning, and clinical research safe-harbor notices.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export interface PublicFooterProps {
  className?: string;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ className = '' }) => {
  return (
    <footer
      role="contentinfo"
      className={`bg-white border-t border-[#D9D3C5] py-12 text-left font-body text-xs ${className}`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand & Description Column */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="font-display font-bold text-lg text-[#14213D] tracking-tight hover:text-[#0F6B6E] transition-colors"
              >
                CareProof
              </Link>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#5B6475] border-l border-[#D9D3C5] pl-2">
                Audit Console
              </span>
            </div>
            <p className="text-xs text-[#5B6475] leading-relaxed max-w-sm m-0">
              An auditable clinical quality ledger and decision support console for structured home-care oversight.
            </p>
            <div className="text-[11px] font-mono text-[#5B6475]">
              Canonical Standard: <strong>v1.4.0</strong> · Framework: In Silico
            </div>
          </div>

          {/* Navigation Links Column */}
          <div className="md:col-span-3 space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#14213D] font-bold">
              Console Navigation
            </div>
            <ul className="space-y-1.5 list-none p-0 m-0 font-mono text-xs text-[#5B6475]">
              <li>
                <Link to="/app/standard?mode=demo" className="hover:text-[#0F6B6E] transition-colors">
                  Standard Explorer (v1.4)
                </Link>
              </li>
              <li>
                <Link to="/app/pilot?mode=demo" className="hover:text-[#0F6B6E] transition-colors">
                  Pilot Study Simulation
                </Link>
              </li>
              <li>
                <Link to="/app/dashboard?mode=demo" className="hover:text-[#0F6B6E] transition-colors">
                  Sample Dashboard
                </Link>
              </li>
              <li>
                <Link to="/app/incident?mode=demo" className="hover:text-[#0F6B6E] transition-colors">
                  Incident Response
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-[#0F6B6E] transition-colors">
                  Auditor Sign In
                </Link>
              </li>
              <li>
                <a
                  href="https://careproof-audit-consolee.ai.studio/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0F6B6E] transition-colors"
                  aria-label="Open live deployment in a new tab"
                >
                  Live Deployment
                </a>
              </li>
            </ul>
          </div>

          {/* Privacy & Governance Note Column */}
          <div className="md:col-span-4 space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#14213D] font-bold flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-[#0F6B6E]" aria-hidden="true" />
              <span>Privacy &amp; Data Boundary</span>
            </div>
            <p className="text-xs text-[#5B6475] leading-relaxed m-0">
              CareProof is architected with strict data boundaries: zero real patient names, medical record numbers (MRNs), phone numbers, or protected health information (PHI) are collected or processed.
            </p>
          </div>
        </div>

        {/* Bottom Disclaimer Border */}
        <div className="pt-6 border-t border-[#D9D3C5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] font-mono text-[#5B6475]">
          <div>
            &copy; 2026 CareProof Audit Console · Open Clinical Measurement Framework
          </div>
          <div className="text-left sm:text-right max-w-lg leading-normal">
            Proposed framework, not clinically validated. Decision support, not diagnosis. All sample records and pilot statistics are simulated.
          </div>
        </div>
      </div>
    </footer>
  );
};
