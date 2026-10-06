/**
 * CareProof Audit Console - Simulated Pilot Proof Section
 * Source of Truth: CareProof Website Roadmap (Phase 12A)
 * 
 * Demonstrates measurement reproducibility, inter-rater reliability,
 * and internal consistency using the Phase 10A Pilot Study service.
 * Strictly labeled as SIMULATED PILOT RESULTS.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { createPilotViewModel } from '../../services/pilot';

export interface SimulatedPilotProofProps {
  className?: string;
}

export const SimulatedPilotProof: React.FC<SimulatedPilotProofProps> = ({ className = '' }) => {
  // Pull real statistical derivations from the seeded simulation engine (Seed #42)
  const pilotVm = React.useMemo(() => createPilotViewModel(undefined, 42), []);

  const {
    protocol,
    scoreDistribution,
    interRater,
    internalConsistency,
    roc,
    reproducibility,
  } = pilotVm;

  const kappaDisplay = interRater.status === 'calculated' && interRater.kappa !== null
    ? interRater.kappa.toFixed(3)
    : 'Unavailable';

  const alphaDisplay = internalConsistency.status === 'calculated' && internalConsistency.alpha !== null
    ? internalConsistency.alpha.toFixed(3)
    : 'Unavailable';

  const aucDisplay = roc.status === 'calculated' && roc.auc !== null
    ? roc.auc.toFixed(3)
    : 'Unavailable';

  return (
    <section
      id="pilot-proof"
      aria-labelledby="pilot-proof-heading"
      className={`border-b border-[#D9D3C5] bg-[#FAF8F3] py-12 sm:py-16 ${className}`}
    >
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-left mb-6 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#B7791F] font-semibold mb-2">
            <FlaskConical className="w-3.5 h-3.5 text-[#B7791F]" aria-hidden="true" />
            <span>Reproducibility &amp; Statistics</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <span
              className="text-xs font-mono font-bold px-2 py-0.5 border border-[#B7791F] bg-[#B7791F] text-white rounded-[2px] tracking-wider uppercase"
              aria-label="Simulation Status"
            >
              SIMULATED PILOT RESULTS
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 border border-[#D9D3C5] bg-white text-[#5B6475] rounded-[2px]">
              PROTOCOL: {protocol.protocolId}
            </span>
          </div>

          <h2
            id="pilot-proof-heading"
            className="text-2xl sm:text-3xl font-display font-bold text-[#14213D] tracking-tight m-0"
          >
            Measurement Consistency &amp; In Silico Reliability
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6475] font-body mt-2 leading-relaxed m-0">
            Demonstration statistics generated from the seeded simulation. Not clinical validation. Demonstrates that scoring models produce stable, reproducible metrics across evaluators.
          </p>
        </div>

        {/* Statistical Metrics Ledger Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Metric 1: Sample Size & Seed */}
          <div className="border border-[#D9D3C5] bg-white p-4 rounded-[2px] text-left">
            <span className="text-[10px] font-mono text-[#5B6475] uppercase block">
              Simulated Cohort
            </span>
            <div className="text-2xl font-display font-bold text-[#14213D] tabular-nums mt-1">
              {`n = ${protocol.sampleSize.size}`}
            </div>
            <div className="text-[11px] font-mono text-[#5B6475] mt-1">
              Seed: #{reproducibility.seed} (Deterministic)
            </div>
          </div>

          {/* Metric 2: Cohen's Kappa */}
          <div className="border border-[#D9D3C5] bg-white p-4 rounded-[2px] text-left">
            <span className="text-[10px] font-mono text-[#5B6475] uppercase block">
              Inter-Rater Kappa (&kappa;)
            </span>
            <div className="text-2xl font-display font-bold text-[#0F6B6E] tabular-nums mt-1">
              {kappaDisplay}
            </div>
            <div className="text-[11px] font-mono text-[#5B6475] mt-1">
              {interRater.status === 'calculated' ? 'Calculated agreement' : interRater.reason || 'Unavailable'}
            </div>
          </div>

          {/* Metric 3: Cronbach's Alpha */}
          <div className="border border-[#D9D3C5] bg-white p-4 rounded-[2px] text-left">
            <span className="text-[10px] font-mono text-[#5B6475] uppercase block">
              Internal Consistency (&alpha;)
            </span>
            <div className="text-2xl font-display font-bold text-[#0F6B6E] tabular-nums mt-1">
              {alphaDisplay}
            </div>
            <div className="text-[11px] font-mono text-[#5B6475] mt-1">
              {internalConsistency.status === 'calculated' ? `${internalConsistency.itemCount} items evaluated` : internalConsistency.reason || 'Unavailable'}
            </div>
          </div>

          {/* Metric 4: ROC AUC */}
          <div className="border border-[#D9D3C5] bg-white p-4 rounded-[2px] text-left">
            <span className="text-[10px] font-mono text-[#5B6475] uppercase block">
              Simulated ROC AUC
            </span>
            <div className="text-2xl font-display font-bold text-[#0F6B6E] tabular-nums mt-1">
              {aucDisplay}
            </div>
            <div className="text-[11px] font-mono text-[#5B6475] mt-1">
              {roc.status === 'calculated' ? 'Calculated discrimination' : roc.reason || 'Unavailable'}
            </div>
          </div>
        </div>

        {/* Score Distribution Summary & Link */}
        <div className="border border-[#D9D3C5] bg-white p-4 sm:p-5 rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-[#14213D]">
              <CheckCircle2 className="w-4 h-4 text-[#2F6B3F]" aria-hidden="true" />
              <strong>Seeded Score Distribution:</strong>
              <span className="text-[#5B6475]">
                Mean: {scoreDistribution.mean.toFixed(1)} · Median: {scoreDistribution.median.toFixed(1)} · SD: {scoreDistribution.stdDev.toFixed(1)}
              </span>
            </div>
            <p className="text-[11px] text-[#5B6475] font-body m-0">
              Identical simulation parameters reproduce the exact same distribution coordinates across environments.
            </p>
          </div>

          <Link
            to="/app/pilot?mode=demo"
            className="text-xs font-mono font-semibold text-[#0F6B6E] hover:underline inline-flex items-center gap-1 shrink-0"
          >
            <span>Examine Pilot Study Protocol</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Prominent Safe-Harbor Disclosure Box */}
        <div className="mt-4 p-3.5 bg-[#FAF8F3] border border-[#B7791F]/40 rounded-[2px] flex items-start gap-2.5 text-left text-xs font-body text-[#14213D]">
          <AlertTriangle className="w-4 h-4 text-[#B7791F] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="m-0 leading-relaxed">
            <strong>Demonstration statistics generated from the seeded simulation. Not clinical validation.</strong>{' '}
            All results on this page are generated from deterministic demonstration data. Proposed framework, not clinically validated. Decision support, not diagnosis.
          </p>
        </div>
      </div>
    </section>
  );
};
