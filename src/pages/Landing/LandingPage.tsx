/**
 * CareProof Audit Console - Production Public Landing Page (Phase 12A)
 * Source of Truth: CareProof Website Roadmap (Phase 12A)
 * 
 * CORE CONTRACT:
 * 1. Strictly in order:
 *    1. Public Header
 *    2. Hero
 *    3. Audience Ledger
 *    4. How It Works
 *    5. Five Pillars
 *    6. Simulated Pilot Proof
 *    7. What This Is Not / Honest Limits
 *    8. Final CTA
 *    9. Footer
 * 2. Directly integrates:
 *    - Canonical standard v1.4.0 from standard.json
 *    - Seeded deterministic scoring & dashboard derivation (getDefaultDashboardViewModel(42))
 *    - Phase 10A statistical pilot service (createPilotViewModel(undefined, 42))
 *    - ScoreStamp and CareProof Audit Ledger design tokens
 * 3. Public Read-Only Sample Audit flow via /app/dashboard?mode=demo
 * 4. Zero clinical validation claims, zero patient PII, zero fake AI marketing hype.
 */

import React, { useMemo } from 'react';
import { getDefaultDashboardViewModel } from '../../services/dashboard';
import {
  PublicHeader,
  HeroSection,
  AudienceLedger,
  HowItWorksSection,
  PillarsStrip,
  SimulatedPilotProof,
  HonestLimitsSection,
  FinalCtaSection,
  PublicFooter,
} from '../../components/landing';

export const LandingPage: React.FC = () => {
  // Deterministic sample audit view model using standard Seed #42
  const dashboardVm = useMemo(() => getDefaultDashboardViewModel(42), []);

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#14213D] flex flex-col font-body">
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-[#14213D] focus:text-[#FAF8F3] focus:border focus:border-[#D9D3C5] focus:text-xs focus:font-mono"
      >
        Skip to main content
      </a>

      {/* 1. Public Header */}
      <PublicHeader />

      {/* Main Public Content */}
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {/* 2. Hero */}
        <HeroSection viewModel={dashboardVm} />

        {/* 3. Audience Ledger */}
        <AudienceLedger />

        {/* 4. How It Works */}
        <HowItWorksSection />

        {/* 5. Five Pillars */}
        <PillarsStrip />

        {/* 6. Simulated Pilot Proof */}
        <SimulatedPilotProof />

        {/* 7. What This Is Not / Honest Limits */}
        <HonestLimitsSection />

        {/* 8. Final CTA */}
        <FinalCtaSection />
      </main>

      {/* 9. Footer */}
      <PublicFooter />
    </div>
  );
};

export default LandingPage;
