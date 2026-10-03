/**
 * CareProof Audit Console - Standard Explorer Pillar Navigation
 * Source of Truth: CareProof Website Roadmap (Phase 7B)
 * 
 * Renders the 5 canonical pillars plus "All Pillars".
 * Narrow column on desktop, compact horizontal bar on mobile.
 */

import React from 'react';
import { Pillar } from '../../types/standard';

export interface PillarNavProps {
  pillars: readonly Pillar[];
  indicatorCountsByPillar: Record<string, number>;
  totalIndicators: number;
  activePillarId: string | undefined;
  onSelectPillar: (pillarId: string | undefined) => void;
  className?: string;
}

export const PillarNav: React.FC<PillarNavProps> = ({
  pillars,
  indicatorCountsByPillar,
  totalIndicators,
  activePillarId,
  onSelectPillar,
  className = '',
}) => {
  const isAllActive = !activePillarId;

  return (
    <nav
      aria-label="Clinical audit pillars"
      className={`border border-[#D9D3C5] bg-white rounded-[2px] p-3 text-left ${className}`}
    >
      <div className="pb-2.5 mb-2.5 border-b border-[#D9D3C5]/70 flex items-center justify-between text-[11px] font-mono text-[#5B6475] uppercase tracking-wider">
        <span className="font-semibold">Audit Pillars</span>
        <span className="text-[10px] tabular-nums">5 Pillars</span>
      </div>

      {/* Navigation List */}
      <ul className="space-y-1 list-none p-0 m-0">
        {/* All Pillars Option */}
        <li>
          <button
            type="button"
            onClick={() => onSelectPillar(undefined)}
            aria-current={isAllActive ? 'page' : undefined}
            className={`w-full text-left px-2.5 py-2 rounded-[2px] text-xs font-mono transition-colors flex items-center justify-between gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0F6B6E] ${
              isAllActive
                ? 'bg-[#0F6B6E]/10 border border-[#0F6B6E]/40 text-[#0F6B6E] font-bold'
                : 'text-[#14213D] hover:bg-[#FAF8F3] border border-transparent'
            }`}
          >
            <span className="font-body font-medium truncate">All Canonical Pillars</span>
            <span className="text-[10px] tabular-nums opacity-80 px-1 py-0.2 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]">
              {totalIndicators}
            </span>
          </button>
        </li>

        {/* Individual Canonical Pillars */}
        {pillars.map((pillar) => {
          const isActive = activePillarId === pillar.id;
          const count = indicatorCountsByPillar[pillar.id] ?? 0;

          return (
            <li key={pillar.id}>
              <button
                type="button"
                onClick={() => onSelectPillar(pillar.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full text-left px-2.5 py-2 rounded-[2px] text-xs font-mono transition-colors flex items-center justify-between gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0F6B6E] ${
                  isActive
                    ? 'bg-[#0F6B6E]/10 border border-[#0F6B6E]/40 text-[#0F6B6E] font-bold'
                    : 'text-[#14213D] hover:bg-[#FAF8F3] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-[11px] shrink-0">{pillar.id}</span>
                  <span className="font-body text-xs truncate" title={pillar.name}>
                    {pillar.name}
                  </span>
                </div>
                <span className="text-[10px] tabular-nums opacity-80 px-1 py-0.2 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] shrink-0">
                  {count}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
