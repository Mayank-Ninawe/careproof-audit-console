/**
 * CareProof Audit Console - Fix First Priority Action Plan Component
 * Source of Truth: CareProof Website Roadmap (Phase 6B)
 * 
 * Renders prioritized indicator remediation list based on weight × gap.
 * Purely consumes pre-sorted fixFirstList from DashboardViewModel without recomputing.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { FixFirstItem } from '../../types/dashboard';

export interface FixFirstTableProps {
  items: FixFirstItem[];
}

export const FixFirstTable: React.FC<FixFirstTableProps> = ({ items }) => {
  return (
    <section aria-labelledby="fix-first-heading" className="border border-[#D9D3C5] bg-white rounded-[2px] mb-6">
      {/* Header with Methodology Explanation */}
      <div className="p-4 sm:p-5 border-b border-[#D9D3C5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
        <div>
          <div className="flex items-center gap-2">
            <h2 id="fix-first-heading" className="text-base font-display font-bold text-[#14213D] m-0">
              Fix First · Prioritized Action Plan
            </h2>
            <span className="text-[10px] font-mono px-1.5 py-0.5 border border-[#B3341A]/30 bg-[#FAF0ED] text-[#B3341A] rounded-[2px] font-semibold">
              {items.length} {items.length === 1 ? 'Action' : 'Actions'}
            </span>
          </div>
          <p className="text-xs text-[#5B6475] mt-1 m-0 leading-relaxed font-body">
            Priority is calculated from <strong>indicator weight × score gap</strong>. Identifies maximum audit score recovery impact.
          </p>
        </div>

        <div className="text-[11px] font-mono text-[#5B6475] bg-[#FAF8F3] p-2 border border-[#D9D3C5] rounded-[2px] shrink-0 self-start sm:self-auto">
          Formula: <span className="text-[#14213D] font-semibold">Priority = Weight × (100 - Score)</span>
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="p-8 text-center font-body">
          <div className="w-10 h-10 mx-auto mb-2 text-[#0F6B6E] flex items-center justify-center bg-[#0F6B6E]/10 rounded-full">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#14213D] mb-1 font-display">
            No Open Scoring Issues
          </h3>
          <p className="text-xs text-[#5B6475] m-0 max-w-md mx-auto">
            All evaluated clinical indicators currently satisfy required threshold bands. No priority corrective actions are required.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-[#D9D3C5] bg-[#FAF8F3] text-[11px] font-mono uppercase text-[#5B6475]">
                <th scope="col" className="py-2.5 px-3 font-semibold text-center w-12">#</th>
                <th scope="col" className="py-2.5 px-3 font-semibold">Indicator</th>
                <th scope="col" className="py-2.5 px-3 font-semibold text-center">Pillar</th>
                <th scope="col" className="py-2.5 px-3 font-semibold text-center">Status</th>
                <th scope="col" className="py-2.5 px-3 font-semibold text-right">Score</th>
                <th scope="col" className="py-2.5 px-3 font-semibold text-right">Gap</th>
                <th scope="col" className="py-2.5 px-3 font-semibold text-right">Weight</th>
                <th scope="col" className="py-2.5 px-4 font-semibold text-right">Priority</th>
                <th scope="col" className="py-2.5 px-3 font-semibold text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D3C5]/70">
              {items.map((item, index) => {
                const isCritical = item.critical;
                return (
                  <tr
                    key={item.indicatorId}
                    className={`hover:bg-[#FAF8F3]/60 transition-colors ${
                      isCritical ? 'bg-[#FAF0ED]/30' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-3 text-center font-mono font-bold text-[#5B6475] tabular-nums">
                      {index + 1}
                    </td>

                    {/* Indicator ID & Name */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-[#14213D] text-[11px]">
                            {item.indicatorId}
                          </span>
                          {isCritical && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-mono uppercase px-1 py-0.2 bg-[#FAF0ED] text-[#B3341A] border border-[#B3341A]/30 rounded-[2px] font-bold">
                              <ShieldAlert className="w-2.5 h-2.5" />
                              Critical
                            </span>
                          )}
                        </div>
                        <span className="font-body text-[#14213D] font-medium leading-tight">
                          {item.indicatorName}
                        </span>
                        <span className="text-[10px] text-[#5B6475] font-mono-ledger line-clamp-1">
                          {item.reason}
                        </span>
                      </div>
                    </td>

                    {/* Pillar */}
                    <td className="py-3 px-3 text-center">
                      <span className="px-1.5 py-0.5 font-mono text-[10px] bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] text-[#5B6475]">
                        {item.pillarId}
                      </span>
                    </td>

                    {/* Status Band */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 text-[10px] font-mono uppercase font-semibold border rounded-[2px] ${
                          item.band === 'Fails'
                            ? 'border-[#B3341A]/40 text-[#B3341A] bg-[#B3341A]/5'
                            : 'border-[#B7791F]/40 text-[#B7791F] bg-[#B7791F]/5'
                        }`}
                      >
                        {item.band}
                      </span>
                    </td>

                    {/* Current Score */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#14213D]">
                      {item.score}
                    </td>

                    {/* Score Gap */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#B3341A] font-semibold">
                      +{item.gap}
                    </td>

                    {/* Weight */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums text-[#5B6475]">
                      {item.weight}
                    </td>

                    {/* Priority Value */}
                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-[#14213D]">
                      <span className="px-1.5 py-0.5 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]">
                        {item.priorityValue}
                      </span>
                    </td>

                    {/* Inspect Link */}
                    <td className="py-3 px-3 text-right">
                      <Link
                        to="/app/standard"
                        className="inline-flex items-center gap-0.5 text-xs font-mono text-[#0F6B6E] hover:underline"
                        aria-label={`Inspect standard guideline for ${item.indicatorId}`}
                      >
                        <span>Standard</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
