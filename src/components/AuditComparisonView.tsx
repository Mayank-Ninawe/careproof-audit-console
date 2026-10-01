import { useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Minus, ShieldAlert, ShieldCheck } from 'lucide-react';
import { AuditScoreResult } from '../types/standard';
import { PRESET_AUDITS } from '../data/defaultAuditRecords';
import { CANONICAL_STANDARD } from '../scoring/scoringEngine';

interface AuditComparisonViewProps {
  currentRecord?: unknown;
  currentScore: AuditScoreResult;
  onClose: () => void;
}

export const AuditComparisonView = ({
  currentScore,
  onClose,
}: AuditComparisonViewProps) => {
  const [selectedBaselineId, setSelectedBaselineId] = useState<string>(PRESET_AUDITS[0].id);

  const baselineRecord = PRESET_AUDITS.find(a => a.id === selectedBaselineId) || PRESET_AUDITS[0];
  const baselineScore = baselineRecord.scoreResult;

  if (!baselineScore) {
    return null;
  }

  const scoreDiff = currentScore.compositeScore - baselineScore.compositeScore;

  return (
    <div className="border border-stone-200 bg-white rounded-[2px] p-5 mb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-ledger text-xs font-semibold uppercase tracking-wider text-teal-950 bg-teal-50 px-2 py-0.5 border border-teal-200 rounded-[2px]">
              Audit Differential Analysis (Delta Ledger)
            </span>
          </div>
          <h2 className="text-base font-bold text-stone-900 mt-1">
            Comparative Care Quality & Safety Differential
          </h2>
          <p className="text-xs text-stone-600 font-sans">
            Comparing current active audit against baseline reference record.
          </p>
        </div>

        {/* Baseline Selector */}
        <div className="flex items-center gap-2 text-xs font-mono-ledger">
          <span className="text-stone-500">Baseline Target:</span>
          <select
            value={selectedBaselineId}
            onChange={(e) => setSelectedBaselineId(e.target.value)}
            className="border border-stone-300 bg-stone-50 px-2 py-1.5 rounded-[2px] text-xs focus:ring-1 focus:ring-teal-700"
          >
            {PRESET_AUDITS.map((audit) => (
              <option key={audit.id} value={audit.id}>
                {audit.facilityName} ({audit.scoreResult?.assignedTier})
              </option>
            ))}
          </select>
          <button
            onClick={onClose}
            className="px-2.5 py-1 border border-stone-300 text-stone-700 hover:bg-stone-100 rounded-[2px] text-xs cursor-pointer ml-2"
          >
            Close Diff
          </button>
        </div>
      </div>

      {/* High-Level Comparison Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4 font-mono-ledger text-xs">
        {/* Composite Score Delta */}
        <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-[2px]">
          <div className="text-[10px] uppercase text-stone-500">Composite Score Delta</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-serif-score text-3xl font-bold text-stone-900">
              {currentScore.compositeScore.toFixed(1)}
            </span>
            <span className="text-stone-400">vs</span>
            <span className="text-stone-600 font-semibold">{baselineScore.compositeScore.toFixed(1)}</span>
            <div
              className={`ml-auto flex items-center text-xs font-bold px-1.5 py-0.5 rounded-[2px] border ${
                scoreDiff > 0
                  ? 'text-emerald-800 bg-emerald-50 border-emerald-300'
                  : scoreDiff < 0
                  ? 'text-rose-800 bg-rose-50 border-rose-300'
                  : 'text-stone-600 bg-stone-100 border-stone-300'
              }`}
            >
              {scoreDiff > 0 ? (
                <>
                  <ArrowUpRight className="w-3 h-3" /> +{scoreDiff.toFixed(1)} pts
                </>
              ) : scoreDiff < 0 ? (
                <>
                  <ArrowDownRight className="w-3 h-3" /> {scoreDiff.toFixed(1)} pts
                </>
              ) : (
                <>
                  <Minus className="w-3 h-3" /> 0.0 pts
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tier Standing Shift */}
        <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-[2px]">
          <div className="text-[10px] uppercase text-stone-500">Tier Standing Shift</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 bg-stone-200 text-stone-800 border border-stone-300 rounded-[2px] font-bold">
              {baselineScore.assignedTier}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
            <span
              className={`px-2 py-0.5 border rounded-[2px] font-bold ${currentScore.tierDetails.badgeClass}`}
            >
              {currentScore.assignedTier}
            </span>
          </div>
        </div>

        {/* Safety Gate Status Shift */}
        <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-[2px]">
          <div className="text-[10px] uppercase text-stone-500">Safety Gate Comparison</div>
          <div className="flex items-center gap-2 mt-2">
            {baselineScore.safetyGate.tripped ? (
              <span className="text-rose-700 font-bold flex items-center gap-1 text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5" /> Baseline Tripped
              </span>
            ) : (
              <span className="text-teal-800 font-bold flex items-center gap-1 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" /> Baseline Clear
              </span>
            )}
            <ArrowRight className="w-3.5 h-3.5 text-stone-400" />
            {currentScore.safetyGate.tripped ? (
              <span className="text-rose-700 font-bold flex items-center gap-1 text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5" /> Current Tripped (Cap)
              </span>
            ) : (
              <span className="text-teal-800 font-bold flex items-center gap-1 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" /> Current Clear
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pillar Level Differential Breakdown */}
      <div className="border border-stone-200 rounded-[2px] overflow-hidden my-4">
        <div className="p-2.5 bg-stone-100 text-[11px] font-mono-ledger font-semibold text-stone-700 uppercase">
          Pillar-by-Pillar Variance
        </div>
        <table className="w-full text-xs font-mono-ledger border-collapse">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-[10px] text-stone-500 uppercase">
              <th className="py-2 px-3 text-left">Pillar</th>
              <th className="py-2 px-3 text-right">Baseline Score</th>
              <th className="py-2 px-3 text-right">Current Score</th>
              <th className="py-2 px-3 text-right">Variance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {CANONICAL_STANDARD.pillars.map((p) => {
              const baseP = baselineScore.pillarScores[p.id]?.rawPillarScore ?? 0;
              const currP = currentScore.pillarScores[p.id]?.rawPillarScore ?? 0;
              const pDiff = currP - baseP;
              return (
                <tr key={p.id} className="hover:bg-stone-50">
                  <td className="py-2 px-3 font-semibold text-stone-900">
                    <span className="bg-stone-200 px-1 py-0.5 rounded-[2px] mr-1.5 text-[10px]">{p.id}</span>
                    {p.name}
                  </td>
                  <td className="py-2 px-3 text-right text-stone-600">{baseP.toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right font-bold text-stone-900">{currP.toFixed(1)}%</td>
                  <td className="py-2 px-3 text-right">
                    <span
                      className={`font-bold ${
                        pDiff > 0
                          ? 'text-emerald-700'
                          : pDiff < 0
                          ? 'text-rose-700'
                          : 'text-stone-400'
                      }`}
                    >
                      {pDiff > 0 ? `+${pDiff.toFixed(1)}` : pDiff.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
