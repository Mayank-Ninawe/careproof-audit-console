import React from 'react';
import { PillarScoreResult } from '../types/standard';

interface PillarsGridProps {
  pillarScores: Record<string, PillarScoreResult>;
  selectedPillarId: string | null;
  onSelectPillar: (pillarId: string | null) => void;
}

export const PillarsGrid: React.FC<PillarsGridProps> = ({
  pillarScores,
  selectedPillarId,
  onSelectPillar,
}) => {
  const pillarsList = Object.values(pillarScores);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-mono-ledger uppercase tracking-wider text-stone-600 font-semibold">
          Audit Pillar Breakdown (5 Core Domains)
        </h2>
        {selectedPillarId && (
          <button
            onClick={() => onSelectPillar(null)}
            className="text-xs font-mono-ledger text-teal-800 hover:text-teal-950 underline cursor-pointer"
          >
            Show All Pillars
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {pillarsList.map((pillar) => {
          const isSelected = selectedPillarId === pillar.pillarId;
          const passCount = pillar.indicatorScores.filter(i => i.band === 'pass').length;
          const warnCount = pillar.indicatorScores.filter(i => i.band === 'warning').length;
          const failCount = pillar.indicatorScores.filter(i => i.band === 'fail').length;
          const notAssessedCount = pillar.indicatorScores.filter(i => i.band === 'not_assessed').length;

          // Score health color
          const scoreColor =
            pillar.rawPillarScore >= 90
              ? 'text-emerald-800'
              : pillar.rawPillarScore >= 75
              ? 'text-teal-900'
              : pillar.rawPillarScore >= 60
              ? 'text-amber-800'
              : 'text-rose-800';

          return (
            <div
              key={pillar.pillarId}
              onClick={() => onSelectPillar(isSelected ? null : pillar.pillarId)}
              className={`border p-3.5 rounded-[2px] transition-all cursor-pointer bg-white text-left ${
                isSelected
                  ? 'border-teal-700 ring-1 ring-teal-700 bg-stone-50/50'
                  : 'border-stone-200 hover:border-stone-400'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-mono-ledger text-[11px] font-bold text-stone-800 bg-stone-100 px-1.5 py-0.5 border border-stone-200 rounded-[2px]">
                  {pillar.pillarId}
                </span>
                <span className="font-mono-ledger text-[10px] text-stone-500">
                  {(pillar.pillarWeight * 100).toFixed(0)}% weight
                </span>
              </div>

              {/* Pillar Title */}
              <h3 className="text-xs font-semibold text-stone-900 line-clamp-1 mb-2.5" title={pillar.pillarName}>
                {pillar.pillarName}
              </h3>

              {/* Score Display */}
              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-baseline gap-1">
                  <span className={`font-serif-score text-2xl font-bold ${scoreColor}`}>
                    {pillar.rawPillarScore.toFixed(1)}
                  </span>
                  <span className="text-[10px] font-mono-ledger text-stone-400">/ 100</span>
                </div>
                <div className="text-[10px] font-mono-ledger text-stone-500">
                  {pillar.coveragePercent.toFixed(0)}% cov
                </div>
              </div>

              {/* Indicator Status Dot Bar */}
              <div className="flex items-center gap-1 pt-2 border-t border-stone-100">
                {pillar.indicatorScores.map((ind) => {
                  const dotColor =
                    ind.band === 'pass'
                      ? 'bg-emerald-500'
                      : ind.band === 'warning'
                      ? 'bg-amber-500'
                      : ind.band === 'fail'
                      ? 'bg-rose-500'
                      : 'bg-stone-300';
                  return (
                    <div
                      key={ind.indicatorId}
                      title={`${ind.code}: ${ind.band.toUpperCase()}${ind.isCritical ? ' (CRITICAL)' : ''}`}
                      className={`h-1.5 flex-1 rounded-[1px] ${dotColor} ${ind.isCritical ? 'ring-1 ring-stone-900/30' : ''}`}
                    />
                  );
                })}
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono-ledger text-stone-500 mt-1.5">
                <span className="text-emerald-700">{passCount} pass</span>
                {warnCount > 0 && <span className="text-amber-700">{warnCount} warn</span>}
                {failCount > 0 && <span className="text-rose-700">{failCount} fail</span>}
                {notAssessedCount > 0 && <span className="text-stone-400">{notAssessedCount} skip</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
