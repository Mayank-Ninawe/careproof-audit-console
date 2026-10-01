import React from 'react';

export interface ScoreStampProps {
  score?: number | null;
  tier?: string | null;
  coverage?: number | null;
  status?: 'provisional' | 'verified' | 'unassessed';
  className?: string;
}

export const ScoreStamp: React.FC<ScoreStampProps> = ({
  score = null,
  tier = null,
  coverage = null,
  status = 'unassessed',
  className = '',
}) => {
  const isAssessed = score !== null && tier !== null;

  return (
    <div
      className={`border border-[#D9D3C5] bg-white p-4 rounded-[2px] inline-flex flex-col text-left font-mono-ledger select-none ${className}`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-[#D9D3C5]/60 pb-2 mb-2 text-[11px] text-[#5B6475]">
        <span className="uppercase tracking-wider font-semibold">
          Audit Score Stamp
        </span>
        <span className="text-[10px] uppercase px-1 py-0.5 border border-[#D9D3C5] rounded-[2px] bg-[#FAF8F3]">
          {status}
        </span>
      </div>

      <div className="flex items-baseline gap-3 my-1">
        <div className="text-3xl font-display font-bold text-[#14213D] tabular-nums leading-none">
          {isAssessed ? score : '—'}
        </div>
        <div className="text-xs text-[#5B6475]">
          / 100
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-[#D9D3C5]/40 flex items-center justify-between gap-4 text-xs text-[#5B6475]">
        <div>
          <span className="text-[10px] uppercase text-[#5B6475]/80 block">Tier</span>
          <span className="font-semibold text-[#14213D]">
            {tier || 'Unassigned'}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase text-[#5B6475]/80 block">Coverage</span>
          <span className="font-semibold text-[#14213D] tabular-nums">
            {coverage !== null ? `${coverage}%` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
};
