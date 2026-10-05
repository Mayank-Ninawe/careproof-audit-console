/**
 * CareProof Audit Console - Reliability Metrics Panel (Kappa & Alpha)
 * Source of Truth: CareProof Website Roadmap (Phase 10B)
 * 
 * RELIABILITY METRICS CONTRACT:
 * - Cohen's Kappa displayed with observed and chance-expected agreement.
 * - Cronbach's Alpha displayed with item count and sample size.
 * - Honest unavailable states; zero forced numbers (e.g. no fake 0.75 fallback).
 * - Zero fabricated benchmark claims (no claims of "good" or "excellent").
 */

import React from 'react';
import { Users, FileCheck2, AlertCircle } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Badge } from '../ui/Badge';
import { InterRaterResult, InternalConsistencyResult } from '../../types/pilot';

export interface ReliabilityMetricsPanelProps {
  interRater: InterRaterResult;
  internalConsistency: InternalConsistencyResult;
  className?: string;
}

export const ReliabilityMetricsPanel: React.FC<ReliabilityMetricsPanelProps> = ({
  interRater,
  internalConsistency,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 ${className}`}>
      {/* 1. Inter-Rater Reliability (Cohen's Kappa) */}
      <Panel
        title="Inter-Rater Concordance (Cohen's Kappa)"
        headerActions={
          interRater.status === 'calculated' ? (
            <Badge variant="accent">CALCULATED (SIMULATED)</Badge>
          ) : (
            <Badge variant="warn">UNAVAILABLE</Badge>
          )
        }
      >
        <div className="space-y-4 text-left font-body">
          {interRater.status === 'calculated' && interRater.kappa !== null ? (
            <>
              <div className="flex items-baseline justify-between gap-4 p-4 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]">
                <div>
                  <span className="text-[11px] font-mono font-semibold uppercase text-[#5B6475] block">
                    Cohen's Kappa (κ)
                  </span>
                  <span className="text-3xl font-display font-bold text-[#14213D] block mt-1">
                    {interRater.kappa.toFixed(2)}
                  </span>
                  <span className="text-[10px] font-mono text-[#5B6475] block mt-0.5">
                    Chance-Adjusted Agreement Index
                  </span>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-xs font-mono text-[#5B6475]">
                    Ratings: <strong className="text-[#14213D]">{interRater.ratingCount}</strong>
                  </div>
                  <div className="text-xs font-mono text-[#5B6475]">
                    P<sub>o</sub> (Observed):{' '}
                    <strong className="text-[#14213D]">
                      {interRater.agreementMetadata.observedAgreement !== null
                        ? `${(interRater.agreementMetadata.observedAgreement * 100).toFixed(1)}%`
                        : 'N/A'}
                    </strong>
                  </div>
                  <div className="text-xs font-mono text-[#5B6475]">
                    P<sub>e</sub> (Chance):{' '}
                    <strong className="text-[#14213D]">
                      {interRater.agreementMetadata.expectedAgreement !== null
                        ? `${(interRater.agreementMetadata.expectedAgreement * 100).toFixed(1)}%`
                        : 'N/A'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Categorical Breakdown */}
              <div className="p-3 bg-white border border-[#D9D3C5] rounded-[2px] text-xs">
                <div className="flex items-center gap-1.5 font-mono font-semibold text-[#5B6475] uppercase text-[11px] mb-2">
                  <Users className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
                  <span>Evaluation Categories ({interRater.categories.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {interRater.categories.map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-0.5 bg-[#FAF8F3] border border-[#D9D3C5] text-[#14213D] font-mono text-[11px] rounded-[2px]"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-[#5B6475] mt-2.5 m-0 font-body leading-relaxed">
                  Evaluated across independent paired ratings from {interRater.agreementMetadata.raters.join(' & ')} on
                  synthetic audit observations.
                </p>
              </div>
            </>
          ) : (
            <div
              role="status"
              aria-label="Inter-Rater Kappa Unavailable"
              className="p-5 text-center bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]"
            >
              <AlertCircle className="w-6 h-6 text-[#5B6475] mx-auto mb-2" aria-hidden="true" />
              <h4 className="text-xs font-bold text-[#14213D] uppercase font-mono m-0">
                Inter-rater kappa unavailable for this simulated dataset.
              </h4>
              <p className="text-xs text-[#5B6475] mt-1.5 m-0 font-body">
                {interRater.reason ||
                  'The simulated assessment data does not meet the mathematical criteria required to compute Cohen’s kappa.'}
              </p>
            </div>
          )}
        </div>
      </Panel>

      {/* 2. Internal Consistency (Cronbach's Alpha) */}
      <Panel
        title="Scale Internal Consistency (Cronbach's Alpha)"
        headerActions={
          internalConsistency.status === 'calculated' ? (
            <Badge variant="accent">CALCULATED (SIMULATED)</Badge>
          ) : (
            <Badge variant="warn">UNAVAILABLE</Badge>
          )
        }
      >
        <div className="space-y-4 text-left font-body">
          {internalConsistency.status === 'calculated' && internalConsistency.alpha !== null ? (
            <>
              <div className="flex items-baseline justify-between gap-4 p-4 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]">
                <div>
                  <span className="text-[11px] font-mono font-semibold uppercase text-[#5B6475] block">
                    Cronbach's Alpha (α)
                  </span>
                  <span className="text-3xl font-display font-bold text-[#14213D] block mt-1">
                    {internalConsistency.alpha.toFixed(2)}
                  </span>
                  <span className="text-[10px] font-mono text-[#5B6475] block mt-0.5">
                    Scale Covariance Index
                  </span>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-xs font-mono text-[#5B6475]">
                    Items in Scale:{' '}
                    <strong className="text-[#14213D]">{internalConsistency.itemCount}</strong>
                  </div>
                  <div className="text-xs font-mono text-[#5B6475]">
                    Observations:{' '}
                    <strong className="text-[#14213D]">{internalConsistency.observationCount}</strong>
                  </div>
                  {internalConsistency.totalVariance !== undefined && (
                    <div className="text-xs font-mono text-[#5B6475]">
                      Total Var: <strong>{internalConsistency.totalVariance.toFixed(2)}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Item Matrix Summary */}
              <div className="p-3 bg-white border border-[#D9D3C5] rounded-[2px] text-xs">
                <div className="flex items-center gap-1.5 font-mono font-semibold text-[#5B6475] uppercase text-[11px] mb-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
                  <span>Item Response Matrix Specification</span>
                </div>
                <p className="text-[11px] text-[#5B6475] m-0 font-body leading-relaxed">
                  Evaluated across {internalConsistency.itemCount} questionnaire items across{' '}
                  {internalConsistency.observationCount} synthetic observations. Derived strictly from simulated item
                  variances without subjective psychometric interpretation.
                </p>
              </div>
            </>
          ) : (
            <div
              role="status"
              aria-label="Cronbach Alpha Unavailable"
              className="p-5 text-center bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]"
            >
              <AlertCircle className="w-6 h-6 text-[#5B6475] mx-auto mb-2" aria-hidden="true" />
              <h4 className="text-xs font-bold text-[#14213D] uppercase font-mono m-0">
                Cronbach's alpha unavailable for this simulated dataset.
              </h4>
              <p className="text-xs text-[#5B6475] mt-1.5 m-0 font-body">
                {internalConsistency.reason ||
                  'The item-response matrix does not meet mathematical variance criteria for calculating Cronbach’s alpha.'}
              </p>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
};
