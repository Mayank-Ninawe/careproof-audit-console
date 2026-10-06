/**
 * CareProof Audit Console - Landing Page Hero Section
 * Source of Truth: CareProof Website Roadmap (Phase 12A)
 * 
 * Editorial Hero Section with live ScoreStamp and pillar performance meters
 * driven by the application's canonical scoring and simulation layers.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, AlertCircle, Database } from 'lucide-react';
import { Button } from '../ui/Button';
import { ScoreStamp } from '../ui/ScoreStamp';
import { DashboardViewModel } from '../../types/dashboard';

export interface HeroSectionProps {
  viewModel: DashboardViewModel;
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ viewModel, className = '' }) => {
  const { summary, pillars } = viewModel;

  return (
    <section
      aria-labelledby="hero-heading"
      className={`border-b border-[#D9D3C5] bg-[#FAF8F3] py-12 sm:py-16 lg:py-20 ${className}`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Serious Editorial Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-[#D9D3C5] rounded-[2px] bg-white text-[11px] font-mono text-[#0F6B6E]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
              <span className="font-semibold uppercase tracking-wider">
                Auditable Home Care Quality Ledger
              </span>
            </div>

            <h1
              id="hero-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#14213D] tracking-tight leading-[1.12] text-balance m-0"
            >
              Hospital-grade at home: measured, not promised.
            </h1>

            <p className="text-sm sm:text-base text-[#5B6475] font-body leading-relaxed max-w-xl m-0">
              CareProof is an auditable framework and console for structured home-care quality assessment—exposing standards, evidence, scoring, and confidence rather than unverified assurances.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link to="/app/dashboard?mode=demo">
                <Button
                  variant="primary"
                  size="md"
                  className="font-mono text-xs gap-2"
                >
                  <span>Open sample audit</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button
                  variant="secondary"
                  size="md"
                  className="font-mono text-xs gap-1.5"
                >
                  <span>Sign in</span>
                </Button>
              </Link>
            </div>

            {/* Micro Safe-Harbor Disclaimers */}
            <div className="pt-3 border-t border-[#D9D3C5]/60 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-[#5B6475] font-mono">
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F6B6E]" aria-hidden="true" />
                Deterministic scoring engine
              </span>
              <span className="text-[#D9D3C5]">·</span>
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2F6B3F]" aria-hidden="true" />
                Standard v1.4.0
              </span>
              <span className="text-[#D9D3C5]">·</span>
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B7791F]" aria-hidden="true" />
                In silico demonstration data
              </span>
            </div>
          </div>

          {/* Right Column: Real Derived Score Stamp & Pillar Performance Meters */}
          <div className="lg:col-span-5 w-full">
            <div className="border border-[#D9D3C5] bg-white p-5 sm:p-6 rounded-[2px] shadow-xs text-left space-y-5">
              {/* Simulated Dataset Tag */}
              <div className="flex items-center justify-between gap-2 border-b border-[#D9D3C5] pb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-[#B7791F]" aria-hidden="true" />
                  <span className="text-xs font-mono font-bold text-[#B7791F] tracking-wider uppercase">
                    SIMULATED SAMPLE AUDIT
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#5B6475] bg-[#FAF8F3] px-1.5 py-0.5 border border-[#D9D3C5] rounded-[2px]">
                  SEED #42
                </span>
              </div>

              {/* Live ScoreStamp Component */}
              <ScoreStamp
                score={summary.overallScore}
                tier={summary.finalTier}
                calculatedTier={summary.calculatedTier}
                finalTier={summary.finalTier}
                coverage={summary.coverage}
                safetyGateTriggered={summary.safetyGateTriggered}
                coverageGatePassed={summary.coverageGatePassed}
                status="verified"
                className="w-full"
              />

              {/* Five Pillar Performance Meters */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#5B6475] font-semibold">
                  <span>Canonical Pillar Performance</span>
                  <span>Score / 100</span>
                </div>

                <div className="space-y-2.5">
                  {pillars.map((pillar) => {
                    const score = pillar.score ?? 0;
                    const weightPct = Math.round(pillar.weight * 100);
                    return (
                      <div key={pillar.pillarId} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono text-[#14213D] truncate pr-2">
                            <strong className="text-[#0F6B6E]">{pillar.pillarId}</strong> · {pillar.name}
                          </span>
                          <span className="font-mono tabular-nums text-[#14213D] font-bold shrink-0">
                            {pillar.score !== null ? `${pillar.score}` : '—'}
                            <span className="text-[10px] text-[#5B6475] font-normal ml-1">
                              {`(${weightPct}%)`}
                            </span>
                          </span>
                        </div>
                        {/* Visual meter bar */}
                        <div
                          className="h-1.5 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[1px] overflow-hidden"
                          role="progressbar"
                          aria-valuenow={score}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${pillar.name} score: ${score}`}
                        >
                          <div
                            className={`h-full transition-all duration-300 ${
                              score >= 85
                                ? 'bg-[#0F6B6E]'
                                : score >= 60
                                  ? 'bg-[#B7791F]'
                                  : 'bg-[#B3341A]'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sample Disclosure Note */}
              <div className="pt-3 border-t border-[#D9D3C5]/60 flex items-start gap-2 text-[11px] text-[#5B6475] leading-relaxed font-body">
                <AlertCircle className="w-3.5 h-3.5 text-[#B7791F] shrink-0 mt-0.5" aria-hidden="true" />
                <p className="m-0">
                  All metrics shown are derived from deterministic seed #42 demonstration data. Not real patient records.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
