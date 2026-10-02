/**
 * CareProof Audit Console - Pillar Ledger Table Component
 * Source of Truth: CareProof Website Roadmap (Phase 6B)
 * 
 * Renders all canonical clinical audit pillars in strict tabular report format.
 * Unassessed pillars explicitly display "Not assessed" (never converted to 0).
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { DashboardPillar } from '../../types/dashboard';

export interface PillarLedgerTableProps {
  pillars: DashboardPillar[];
}

export const PillarLedgerTable: React.FC<PillarLedgerTableProps> = ({ pillars }) => {
  return (
    <section aria-labelledby="pillar-ledger-heading" className="border border-[#D9D3C5] bg-white rounded-[2px] mb-6">
      <div className="p-4 sm:p-5 border-b border-[#D9D3C5] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left">
        <div>
          <h2 id="pillar-ledger-heading" className="text-base font-display font-bold text-[#14213D] m-0">
            Audit Pillars · Performance Ledger
          </h2>
          <p className="text-xs text-[#5B6475] mt-0.5 m-0 leading-relaxed font-body">
            Canonical quality pillars weighted by audit governance framework (CareProof Standard v1.4.0)
          </p>
        </div>
        <div className="text-xs font-mono text-[#5B6475] shrink-0">
          5 Canonical Pillars
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-body text-xs min-w-[640px]">
          <thead>
            <tr className="border-b border-[#D9D3C5] bg-[#FAF8F3] text-[11px] font-mono uppercase text-[#5B6475]">
              <th scope="col" className="py-2.5 px-4 font-semibold">Pillar</th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-center">Indicators</th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-center">Open Issues</th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-right">Weight</th>
              <th scope="col" className="py-2.5 px-4 font-semibold text-right">Score</th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-center">Status</th>
              <th scope="col" className="py-2.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D3C5]/70">
            {pillars.map((p) => {
              const isAssessed = p.status === 'assessed' && p.score !== null;
              const weightPercent = `${Math.round(p.weight * 100)}%`;

              let statusBadgeClass = 'border-[#D9D3C5] text-[#5B6475] bg-[#FAF8F3]';
              let statusLabel = 'Not assessed';

              if (isAssessed) {
                if (p.score! >= 85) {
                  statusBadgeClass = 'border-[#0F6B6E]/40 text-[#0F6B6E] bg-[#0F6B6E]/5 font-semibold';
                  statusLabel = 'Meets';
                } else if (p.score! >= 60) {
                  statusBadgeClass = 'border-[#B7791F]/40 text-[#B7791F] bg-[#B7791F]/5 font-semibold';
                  statusLabel = 'Partial';
                } else {
                  statusBadgeClass = 'border-[#B3341A]/40 text-[#B3341A] bg-[#B3341A]/5 font-semibold';
                  statusLabel = 'Fails';
                }
              }

              return (
                <tr key={p.pillarId} className="hover:bg-[#FAF8F3]/50 transition-colors">
                  {/* Pillar Code & Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#14213D] px-1.5 py-0.5 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] text-[11px] shrink-0">
                        {p.pillarId}
                      </span>
                      <span className="font-semibold text-[#14213D] truncate max-w-xs">
                        {p.name}
                      </span>
                    </div>
                  </td>

                  {/* Assessed / Total Indicators */}
                  <td className="py-3 px-3 text-center font-mono tabular-nums text-[#5B6475]">
                    {p.assessedIndicatorCount} / {p.totalIndicatorCount}
                  </td>

                  {/* Open Issues Count */}
                  <td className="py-3 px-3 text-center font-mono tabular-nums">
                    {p.openIssueCount > 0 ? (
                      <span className="text-[#B3341A] font-semibold">
                        {p.openIssueCount} active
                      </span>
                    ) : (
                      <span className="text-[#5B6475]">0</span>
                    )}
                  </td>

                  {/* Weight */}
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-[#5B6475]">
                    {weightPercent}
                  </td>

                  {/* Score */}
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-[#14213D]">
                    {isAssessed ? (
                      <span>{p.score} <span className="text-[10px] text-[#5B6475] font-normal">/ 100</span></span>
                    ) : (
                      <span className="text-[#5B6475] font-normal italic">Not assessed</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border rounded-[2px] ${statusBadgeClass}`}>
                      {statusLabel}
                    </span>
                  </td>

                  {/* Action Link */}
                  <td className="py-3 px-4 text-right">
                    <Link
                      to="/app/standard"
                      className="inline-flex items-center gap-1 text-xs font-mono text-[#0F6B6E] hover:underline"
                      aria-label={`Explore indicators for ${p.name}`}
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Explore</span>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
