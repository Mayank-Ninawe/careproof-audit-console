/**
 * CareProof Audit Console - Public Landing Page Header
 * Source of Truth: CareProof Website Roadmap (Phase 12A)
 * 
 * Semantic header with responsive navigation, visible focus states,
 * and direct links to public/demo destinations.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, FlaskConical, Shield, LogIn } from 'lucide-react';
import { Button } from '../ui/Button';

export interface PublicHeaderProps {
  className?: string;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({ className = '' }) => {
  return (
    <header
      role="banner"
      className={`border-b border-[#D9D3C5] bg-white sticky top-0 z-30 font-body ${className}`}
    >
      {/* Top Clinical Safe-Harbor Bar */}
      <div
        role="region"
        aria-label="Clinical Disclaimer"
        className="bg-[#14213D] text-[#FAF8F3] px-4 py-1 text-[11px] font-mono-ledger flex items-center justify-between border-b border-[#14213D]"
      >
        <div className="max-w-[1200px] w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <Shield className="w-3 h-3 text-[#0F6B6E] shrink-0" aria-hidden="true" />
            <span className="truncate">
              Proposed framework, not clinically validated. Decision support, not diagnosis.
            </span>
          </div>
          <span className="hidden sm:inline font-mono text-[10px] text-[#FAF8F3]/70 uppercase tracking-wider">
            Standard v1.4.0
          </span>
        </div>
      </div>

      {/* Main Public Navigation Bar */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Wordmark (Returns to /) */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-xl font-display font-bold text-[#14213D] tracking-tight hover:text-[#0F6B6E] transition-colors focus-visible:outline-2 focus-visible:outline-[#0F6B6E] rounded-[2px]"
            aria-label="CareProof Home"
          >
            CareProof
          </Link>
          <span className="hidden md:inline text-[10px] font-mono uppercase tracking-widest text-[#5B6475] border-l border-[#D9D3C5] pl-2.5">
            Audit Console
          </span>
        </div>

        {/* Semantic Navigation */}
        <nav
          aria-label="Public Navigation"
          className="hidden md:flex items-center gap-6 text-xs font-mono uppercase tracking-wider text-[#5B6475]"
        >
          <Link
            to="/app/standard?mode=demo"
            className="hover:text-[#14213D] transition-colors flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#0F6B6E] rounded-[2px] py-1"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
            <span>Standard</span>
          </Link>
          <a
            href="#evidence"
            className="hover:text-[#14213D] transition-colors focus-visible:outline-2 focus-visible:outline-[#0F6B6E] rounded-[2px] py-1"
          >
            <span>Evidence</span>
          </a>
          <Link
            to="/app/pilot?mode=demo"
            className="hover:text-[#14213D] transition-colors flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-[#0F6B6E] rounded-[2px] py-1"
          >
            <FlaskConical className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
            <span>Pilot</span>
          </Link>
        </nav>

        {/* Primary Header Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link to="/auth">
            <Button
              variant="ghost"
              size="sm"
              className="font-mono text-xs gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Sign in</span>
            </Button>
          </Link>
          <Link to="/app/dashboard?mode=demo">
            <Button
              variant="primary"
              size="sm"
              className="font-mono text-xs gap-1.5"
            >
              <span>Open sample audit</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};
