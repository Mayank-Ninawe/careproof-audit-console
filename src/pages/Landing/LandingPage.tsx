import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, BookOpen, Activity } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Divider } from '../../components/ui/Divider';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#14213D] flex flex-col font-body">
      {/* Top Clinical Disclaimer */}
      <div className="bg-[#14213D] text-[#FAF8F3] px-4 py-1.5 text-xs font-mono-ledger text-center border-b border-[#14213D]">
        Proposed framework, not clinically validated. Decision support, not diagnosis.
      </div>

      {/* Public Header - 3 Zone Top Bar Contract */}
      <header className="border-b border-[#D9D3C5] bg-white sticky top-0 z-30">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Zone 1: Single element brand wordmark */}
          <Link to="/" className="text-xl font-display font-bold text-[#14213D] tracking-tight shrink-0">
            CareProof
          </Link>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#5B6475]">
            <a href="#overview" className="hover:text-[#14213D] transition-colors">
              Overview
            </a>
            <a href="#pillars" className="hover:text-[#14213D] transition-colors">
              Pillars
            </a>
            <a href="#evidence" className="hover:text-[#14213D] transition-colors">
              Evidence
            </a>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/auth">
              <Button variant="ghost" size="sm">
                Auditor Sign In
              </Button>
            </Link>
            <Link to="/app/dashboard">
              <Button variant="primary" size="sm">
                Enter Console
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Public Hero Stage */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <section id="overview" className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-2 py-0.5 border border-[#D9D3C5] rounded-[2px] bg-white text-[11px] font-mono text-[#0F6B6E] font-semibold mb-4">
            <Shield className="w-3 h-3 text-[#0F6B6E]" />
            <span>AUDIT CONSOLE &amp; QUALITY FRAMEWORK</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#14213D] tracking-tight leading-[1.15] mb-4 text-balance">
            CareProof Audit Console
          </h1>

          <p className="text-sm sm:text-base text-[#5B6475] font-body leading-relaxed mb-8 max-w-2xl">
            A digital clinical audit ledger structured around five quality pillars,
            threshold evaluation, and deterministic scoring.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link to="/app/dashboard">
              <Button variant="primary" size="md">
                Launch Console
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/app/standard">
              <Button variant="secondary" size="md">
                <BookOpen className="w-4 h-4" />
                Standard Explorer
              </Button>
            </Link>
          </div>
        </section>

        <Divider />

        {/* Five Pillars Overview Foundation */}
        <section id="pillars" className="py-8">
          <div className="text-xs font-mono uppercase tracking-wider text-[#5B6475] font-semibold mb-2">
            Pillars
          </div>
          <h2 className="text-2xl font-display font-bold text-[#14213D] mb-6">
            Five CareProof Pillars
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-[#D9D3C5] bg-white p-5 rounded-[2px] text-left">
              <div className="text-xs font-mono text-[#0F6B6E] font-bold mb-1">
                PILLAR 01 • CSP
              </div>
              <h3 className="text-base font-display font-semibold text-[#14213D] mb-2">
                Clinical Safety Protocols
              </h3>
              <p className="text-xs text-[#5B6475] leading-relaxed">
                Adherence to safety protocols, checklist completion, and verified clinical procedures.
              </p>
            </div>

            <div className="border border-[#D9D3C5] bg-white p-5 rounded-[2px] text-left">
              <div className="text-xs font-mono text-[#0F6B6E] font-bold mb-1">
                PILLAR 02 • CSW
              </div>
              <h3 className="text-base font-display font-semibold text-[#14213D] mb-2">
                Caregiver Staffing &amp; Workload
              </h3>
              <p className="text-xs text-[#5B6475] leading-relaxed">
                Caregiver competency levels, assessment gap tracking, and coverage monitoring.
              </p>
            </div>

            <div className="border border-[#D9D3C5] bg-white p-5 rounded-[2px] text-left">
              <div className="text-xs font-mono text-[#0F6B6E] font-bold mb-1">
                PILLAR 03 • EEH
              </div>
              <h3 className="text-base font-display font-semibold text-[#14213D] mb-2">
                Equipment, Environment &amp; Hygiene
              </h3>
              <p className="text-xs text-[#5B6475] leading-relaxed">
                Device registers, calibration status, uptime tracking, and lifecycle monitoring.
              </p>
            </div>
          </div>
        </section>

        {/* Evidence Classification Banner */}
        <section id="evidence" className="mt-8 p-5 border border-[#D9D3C5] bg-white rounded-[2px]">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-[#0F6B6E] shrink-0 mt-0.5" />
            <div className="text-left text-xs leading-relaxed text-[#5B6475]">
              <div className="font-semibold text-[#14213D] mb-1 font-mono uppercase tracking-wider text-[11px]">
                Evidence Standard
              </div>
              <p className="mb-2">
                CareProof distinguishes indicators by evidence classification:
              </p>
              <div className="flex flex-wrap gap-4 font-mono-ledger text-[11px] text-[#14213D]">
                <span><strong className="text-[#2F6B3F]">[E] Established</strong>: Standard clinical guideline</span>
                <span><strong className="text-[#0F6B6E]">[I] Interpretation</strong>: Derived quality metric</span>
                <span><strong className="text-[#B7791F]">[P] Proposed</strong>: Quality indicator under pilot study</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Public Footer */}
      <footer className="border-t border-[#D9D3C5] bg-white py-8 text-xs font-mono-ledger text-[#5B6475]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <div className="font-bold text-[#14213D]">CareProof Audit Console</div>
            <div className="text-[11px] text-[#5B6475] mt-0.5">
              Standard: v1.4.0
            </div>
          </div>
          <div className="text-right text-[11px] text-[#5B6475]">
            Proposed framework, not clinically validated. Decision support, not diagnosis.
          </div>
        </div>
      </footer>
    </div>
  );
};
