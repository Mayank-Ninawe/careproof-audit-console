import React from 'react';

export interface ScoreStampProps {
  score?: number | null;
  tier?: string | null;
  calculatedTier?: string | null;
  finalTier?: string | null;
  coverage?: number | null;
  safetyGateTriggered?: boolean;
  coverageGatePassed?: boolean;
  status?: 'provisional' | 'verified' | 'unassessed';
  className?: string;
}

export const ScoreStamp: React.FC<ScoreStampProps> = ({
  score = null,
  tier = null,
  calculatedTier = null,
  finalTier = null,
  coverage = null,
  safetyGateTriggered = false,
  coverageGatePassed = true,
  status = 'unassessed',
  className = '',
}) => {
  const displayTier = finalTier || tier || null;
  const isCapped = safetyGateTriggered && calculatedTier && displayTier && calculatedTier !== displayTier;
  const isCoverageInsufficient = coverageGatePassed === false || (coverage !== null && coverage < 80);
  const isAssessed = score !== null;

  const resolvedStatus = status !== 'unassessed' 
    ? status 
    : isAssessed 
      ? (isCoverageInsufficient || isCapped ? 'provisional' : 'verified')
      : 'unassessed';

  return (
    <div
      className={`border border-[#D9D3C5] bg-white p-4 rounded-[2px] inline-flex flex-col text-left font-mono-ledger select-none ${className}`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-[#D9D3C5]/60 pb-2 mb-2 text-[11px] text-[#5B6475]">
        <span className="uppercase tracking-wider font-semibold">
          Audit Score Stamp
        </span>
        <span className={`text-[10px] uppercase px-1.5 py-0.5 border rounded-[2px] ${
          resolvedStatus === 'verified'
            ? 'border-[#0F6B6E]/40 text-[#0F6B6E] bg-[#0F6B6E]/5'
            : resolvedStatus === 'provisional'
              ? 'border-[#B7791F]/40 text-[#B7791F] bg-[#B7791F]/5'
              : 'border-[#D9D3C5] text-[#5B6475] bg-[#FAF8F3]'
        }`}>
          {resolvedStatus}
        </span>
      </div>

      <div className="flex items-baseline gap-3 my-1">
        <div className="text-3xl sm:text-4xl font-display font-bold text-[#14213D] tabular-nums leading-none">
          {isAssessed ? score : '—'}
        </div>
        <div className="text-xs text-[#5B6475] font-mono">
          / 100
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-[#D9D3C5]/40 flex items-start justify-between gap-4 text-xs text-[#5B6475]">
        <div>
          <span className="text-[10px] uppercase text-[#5B6475]/80 block">Audit Tier</span>
          <span className="font-semibold text-[#14213D] block">
            {displayTier || (isCoverageInsufficient ? 'Unavailable' : 'Unassigned')}
          </span>
          {isCapped && (
            <span className="text-[10px] text-[#B7791F] block mt-0.5 font-mono">
              Capped from {calculatedTier}
            </span>
          )}
          {isCoverageInsufficient && !displayTier && (
            <span className="text-[10px] text-[#B7791F] block mt-0.5 font-mono">
              Coverage &lt; 80%
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase text-[#5B6475]/80 block">Coverage</span>
          <span className="font-semibold text-[#14213D] tabular-nums block">
            {coverage !== null ? `${coverage}%` : '—'}
          </span>
          <span className="text-[10px] text-[#5B6475] block mt-0.5 font-mono">
            {isCoverageInsufficient ? 'Insufficient' : 'Sufficient'}
          </span>
        </div>
      </div>
    </div>
  );
};
