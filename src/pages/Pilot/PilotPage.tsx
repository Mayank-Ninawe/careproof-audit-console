/**
 * CareProof Audit Console - Pilot Study Production Page (Phase 10B)
 * Source of Truth: CareProof Website Roadmap (Phase 10B)
 * 
 * CORE CONTRACT:
 * 1. Consumes Phase 10A PilotViewModel via `createPilotViewModel`.
 * 2. Prominently discloses that all data and results are SIMULATED.
 * 3. Never claims clinical validation, diagnostic accuracy, or real patient evidence.
 * 4. Displays real SVG charts for score distribution and ROC curve using actual data.
 * 5. Deterministic reproducibility: same seed reproduces exact same results.
 * 6. Zero Firebase dependencies; pure side-effect-free calculations.
 */

import React, { useState, useTransition } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Panel } from '../../components/ui/Panel';
import { createPilotViewModel } from '../../services/pilot';
import { PilotViewModel } from '../../types/pilot';
import {
  PilotDisclosureBanner,
  PilotProtocolCard,
  PilotSeedControl,
  ScoreDistributionChart,
  ReliabilityMetricsPanel,
  RocCurveChart,
  PilotLimitationsBox,
  PilotMethodologyNote,
} from '../../components/pilot';

export const PilotPage: React.FC = () => {
  const [currentSeed, setCurrentSeed] = useState<number>(42);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Initialize or derive view model deterministically
  const [viewModel, setViewModel] = useState<PilotViewModel>(() => {
    try {
      return createPilotViewModel(undefined, 42);
    } catch (err) {
      console.error('Initial PilotViewModel generation failed:', err);
      throw err;
    }
  });

  const handleSeedChange = (newSeed: number) => {
    startTransition(() => {
      try {
        setError(null);
        const nextVm = createPilotViewModel(undefined, newSeed);
        setCurrentSeed(newSeed);
        setViewModel(nextVm);
      } catch (err: unknown) {
        console.error('Pilot simulation regeneration failed:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'An unexpected computational error occurred during pilot simulation.'
        );
      }
    });
  };

  const handleRetry = () => {
    handleSeedChange(currentSeed);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 text-left font-body">
      {/* A. Page Header */}
      <PageHeader
        title="Pilot Study"
        subtitle="Simulated validation results, reproducibility, and study limitations."
        badge={<Badge variant="accent">SIMULATED IN SILICO</Badge>}
        metadata={
          <>
            <span>
              Protocol: <strong>{viewModel.protocol.protocolId}</strong>
            </span>
            <span>·</span>
            <span>
              Sample Size: <strong>N = {viewModel.protocol.sampleSize.size}</strong> (Simulated)
            </span>
            <span>·</span>
            <span>
              Active Seed: <strong>{currentSeed}</strong>
            </span>
            <span>·</span>
            <span>
              Status: <strong>Synthetic Environment</strong>
            </span>
          </>
        }
      />

      {/* Error State */}
      {error && (
        <Panel
          title="Simulation Computational Error"
          className="border-[#B3341A]"
          headerActions={<Badge variant="fail">ERROR</Badge>}
        >
          <div
            role="alert"
            className="p-4 bg-[#FAF0ED] border border-[#B3341A]/30 rounded-[2px] text-xs font-mono text-[#B3341A]"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-bold uppercase m-0">Failed to execute deterministic pilot simulation</p>
                <p className="mt-1 m-0">{error}</p>
                <div className="mt-3">
                  <Button variant="secondary" size="sm" onClick={handleRetry} className="gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Retry Calculation</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      )}

      {/* B. SIMULATED Disclosure (Prominent) */}
      <PilotDisclosureBanner />

      {/* C. Protocol Summary */}
      <PilotProtocolCard protocol={viewModel.protocol} />

      {/* D. Seed / Reproducibility Control */}
      <PilotSeedControl
        currentSeed={currentSeed}
        onSeedChange={handleSeedChange}
        isLoading={isPending}
      />

      {/* E. Score Distribution */}
      <ScoreDistributionChart distribution={viewModel.scoreDistribution} />

      {/* F & G. Inter-Rater Reliability & Internal Consistency */}
      <ReliabilityMetricsPanel
        interRater={viewModel.interRater}
        internalConsistency={viewModel.internalConsistency}
      />

      {/* H. Event Discrimination (ROC Curve & AUC) */}
      <RocCurveChart roc={viewModel.roc} />

      {/* I. Limitations Box (Mandatory) */}
      <PilotLimitationsBox limitations={viewModel.limitations} />

      {/* J. Methodology Note */}
      <PilotMethodologyNote />
    </div>
  );
};
