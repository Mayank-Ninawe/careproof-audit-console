/**
 * CareProof Audit Console - Production Dashboard Interface
 * Source of Truth: CareProof Website Roadmap (Phase 6B)
 * 
 * CORE CONTRACT:
 * - Consumes DashboardViewModel from the deterministic scoring & simulation layers.
 * - Does not perform independent score calculations.
 * - Renders in order:
 *   A. Page header
 *   B. Audit summary / Score Stamp
 *   C. Safety Gate banner
 *   D. Pillar ledger
 *   E. Fix First section (weight × gap)
 *   F. Recent Events section
 *   G. Simulation disclosure / methodology note
 */

import React, { useState } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { ScoreStamp } from '../../components/ui/ScoreStamp';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import {
  SafetyGateBanner,
  PillarLedgerTable,
  FixFirstTable,
  RecentEventsList,
} from '../../components/dashboard';
import { getDefaultDashboardViewModel } from '../../services/dashboard';
import { DashboardViewModel } from '../../types/dashboard';
import { RotateCw, AlertTriangle, FileText, Info } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [seed, setSeed] = useState<number>(42);
  const [error, setError] = useState<string | null>(null);
  const [viewModel, setViewModel] = useState<DashboardViewModel | null>(() => {
    try {
      return getDefaultDashboardViewModel(42);
    } catch (err: unknown) {
      return null;
    }
  });

  const loadDashboard = (targetSeed: number) => {
    try {
      setError(null);
      const vm = getDefaultDashboardViewModel(targetSeed);
      setViewModel(vm);
      setSeed(targetSeed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate audit dashboard view model.';
      setError(msg);
    }
  };

  // Error State Handling
  if (error || !viewModel) {
    return (
      <div className="py-8 text-left font-body">
        <PageHeader
          title="Dashboard"
          subtitle="Overall audit status, pillar performance, Safety Gate, and priority actions."
          badge={<StatusIndicator status="failure" label="Error" />}
        />
        <div
          role="alert"
          className="border border-[#B3341A]/40 bg-[#FAF0ED] p-6 rounded-[2px] text-left max-w-xl mx-auto my-8"
        >
          <div className="flex items-center gap-2 mb-2 text-[#B3341A] font-bold">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h2 className="text-sm uppercase tracking-wide font-mono m-0">
              Dashboard Initialization Error
            </h2>
          </div>
          <p className="text-xs text-[#14213D] leading-relaxed mb-4">
            {error || 'Unable to load audit view model.'}
          </p>
          <button
            type="button"
            onClick={() => loadDashboard(seed)}
            className="px-4 py-2 bg-[#0F6B6E] text-white text-xs font-mono rounded-[2px] hover:bg-[#0c575a] transition-colors cursor-pointer"
          >
            Retry Generation
          </button>
        </div>
      </div>
    );
  }

  const { summary, pillars, fixFirstList, recentEvents, openIssueCount, disclaimer } = viewModel;
  const assessedPillarsCount = pillars.filter((p) => p.status === 'assessed').length;

  return (
    <div className="text-left font-body">
      {/* SECTION A: Page Header */}
      <PageHeader
        title="Dashboard"
        subtitle="Overall audit status, pillar performance, Safety Gate, and priority actions."
        badge={
          <StatusIndicator
            status={summary.safetyGateTriggered ? 'warning' : 'success'}
            label={summary.finalTier || 'Evaluation'}
          />
        }
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#5B6475] hidden sm:inline">
              Seed: <strong>{seed}</strong>
            </span>
            <button
              type="button"
              onClick={() => loadDashboard(seed === 42 ? 101 : 42)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-[#D9D3C5] bg-white hover:bg-[#FAF8F3] text-[#14213D] rounded-[2px] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0F6B6E]"
              aria-label="Toggle deterministic simulation seed"
            >
              <RotateCw className="w-3 h-3 text-[#0F6B6E]" />
              <span>Toggle Seed ({seed === 42 ? 'Seed 101' : 'Seed 42'})</span>
            </button>
          </div>
        }
        metadata={
          <>
            <span className="flex items-center gap-1">
              <FileText className="w-3 h-3 text-[#0F6B6E]" />
              <span>Standard: <strong>v1.4.0</strong></span>
            </span>
            <span aria-hidden="true">·</span>
            <span>Dataset: <strong className="text-[#0F6B6E]">SIMULATED</strong></span>
            <span aria-hidden="true">·</span>
            <span>Governance: <strong>Decision support, not diagnosis</strong></span>
          </>
        }
      />

      {/* SECTION B: Audit Summary & Score Stamp */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 items-stretch">
        {/* Score Stamp Visual Primitive */}
        <div className="md:col-span-1 flex flex-col">
          <ScoreStamp
            score={summary.overallScore}
            calculatedTier={summary.calculatedTier}
            finalTier={summary.finalTier}
            coverage={summary.coverage}
            safetyGateTriggered={summary.safetyGateTriggered}
            coverageGatePassed={summary.coverageGatePassed}
            className="w-full flex-1"
          />
        </div>

        {/* Audit Standing Breakdown Panel */}
        <div className="md:col-span-2 flex flex-col">
          <Panel title="Composite Standing Breakdown" className="flex-1">
            <div className="space-y-3 text-xs font-mono-ledger text-[#5B6475]">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#D9D3C5]/60">
                <span className="font-body text-[#14213D]">Overall Numerical Score</span>
                <span className="font-bold font-mono text-[#14213D] tabular-nums text-sm">
                  {summary.overallScore !== null ? `${summary.overallScore} / 100` : 'Not assessed'}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-[#D9D3C5]/60">
                <span className="font-body text-[#14213D]">Audit Evidence Coverage</span>
                <span className="font-semibold font-mono text-[#14213D] tabular-nums">
                  {summary.coverage}% <span className="text-[11px] text-[#5B6475] font-normal">({summary.coverageGatePassed ? 'Passed' : 'Min 80% Required'})</span>
                </span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-[#D9D3C5]/60">
                <span className="font-body text-[#14213D]">Clinical Pillars Evaluated</span>
                <span className="font-semibold font-mono text-[#14213D] tabular-nums">
                  {assessedPillarsCount} of {pillars.length} Pillars Assessed
                </span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-[#D9D3C5]/60">
                <span className="font-body text-[#14213D]">Safety Gate Status</span>
                <span className={`font-semibold font-mono ${summary.safetyGateTriggered ? 'text-[#B3341A]' : 'text-[#0F6B6E]'}`}>
                  {summary.safetyGateTriggered ? 'Active (Tier Capped)' : 'Clear (Zero Breaches)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-[#14213D]">Remediation Actions</span>
                <span className="font-semibold font-mono text-[#14213D]">
                  {openIssueCount > 0 ? (
                    <span className="text-[#B3341A]">{openIssueCount} Open Gaps</span>
                  ) : (
                    <span className="text-[#0F6B6E]">Zero Gaps</span>
                  )}
                </span>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      {/* SECTION C: Safety Gate Banner */}
      <SafetyGateBanner summary={summary} />

      {/* SECTION D: Pillar Ledger */}
      <PillarLedgerTable pillars={pillars} />

      {/* SECTION E: Fix First Section */}
      <FixFirstTable items={fixFirstList} />

      {/* SECTION F: Recent Events Section */}
      <RecentEventsList events={recentEvents} />

      {/* SECTION G: Simulation Disclosure / Methodology Note */}
      <section
        aria-label="Simulation Methodology Disclosure"
        className="p-4 sm:p-5 border border-[#D9D3C5] bg-white rounded-[2px] text-xs font-mono text-[#5B6475] mt-6"
      >
        <div className="flex items-center gap-2 mb-2 text-[#14213D] font-bold">
          <Info className="w-4 h-4 text-[#0F6B6E] shrink-0" />
          <span className="uppercase tracking-wider text-[11px]">
            Data Governance &amp; Simulation Disclosure
          </span>
        </div>
        <p className="leading-relaxed m-0 mb-2 font-body text-xs text-[#14213D]">
          <strong>SIMULATED DATA — Demonstration dataset only.</strong> All observations, device telemetry intervals,
          caregiver credentials, and indicator assessment scores displayed on this console are deterministically
          generated synthetic fixtures. No real Protected Health Information (PHI) or live patient data are processed.
        </p>
        <div className="pt-2 border-t border-[#D9D3C5]/60 text-[11px] font-mono-ledger text-[#5B6475]">
          {disclaimer}
        </div>
      </section>
    </div>
  );
};
