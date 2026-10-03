/**
 * CareProof Audit Console - Standard Explorer Indicator Table Component
 * Source of Truth: CareProof Website Roadmap (Phase 7B)
 * 
 * Clinical audit ledger table displaying canonical indicator specifications.
 * Supports accessible row click and keyboard selection to open the detail drawer.
 */

import React from 'react';
import { EvidenceTag } from '../ui/EvidenceTag';
import { ShieldAlert, BookOpen, AlertCircle, ArrowRight } from 'lucide-react';
import { StandardExplorerRow } from '../../types/standardExplorer';

export interface IndicatorTableProps {
  rows: readonly StandardExplorerRow[];
  selectedIndicatorId: string | null;
  onSelectIndicator: (indicatorId: string) => void;
  onClearFilters?: () => void;
  className?: string;
}

export const IndicatorTable: React.FC<IndicatorTableProps> = ({
  rows,
  selectedIndicatorId,
  onSelectIndicator,
  onClearFilters,
  className = '',
}) => {
  if (rows.length === 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="border border-[#D9D3C5] bg-white p-10 rounded-[2px] text-center my-4"
      >
        <div className="w-10 h-10 mx-auto mb-3 text-[#5B6475] flex items-center justify-center bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-[#14213D] mb-1 font-display">
          No Indicators Match Filters
        </h3>
        <p className="text-xs text-[#5B6475] m-0 max-w-sm mx-auto font-body leading-relaxed mb-4">
          No clinical indicators in the CareProof Standard v1.4.0 match the current combination of search query and filter criteria.
        </p>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="px-3.5 py-1.5 text-xs font-mono border border-[#0F6B6E] text-[#0F6B6E] hover:bg-[#0F6B6E]/10 rounded-[2px] transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`border border-[#D9D3C5] bg-white rounded-[2px] overflow-hidden ${className}`}
    >
      <div className="overflow-x-auto">
        <table
          className="w-full text-left border-collapse font-body text-xs min-w-[960px]"
          aria-label="Clinical standard indicators ledger"
        >
          <thead>
            <tr className="border-b border-[#D9D3C5] bg-[#FAF8F3] text-[11px] font-mono uppercase text-[#5B6475]">
              <th scope="col" className="py-2.5 px-3 font-semibold w-24">ID</th>
              <th scope="col" className="py-2.5 px-3 font-semibold min-w-[240px]">Indicator &amp; Definition</th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-center w-16">Pillar</th>
              <th scope="col" className="py-2.5 px-3 font-semibold min-w-[140px]">Data Source</th>
              <th scope="col" className="py-2.5 px-3 font-semibold min-w-[160px]">Threshold Bands</th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-right w-16">Weight</th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-center w-24">Critical</th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-center w-28">Evidence</th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-center w-16">Refs</th>
              <th scope="col" className="py-2.5 px-3 font-semibold text-right w-12">
                <span className="sr-only">Inspect detail</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D3C5]/70">
            {rows.map((row) => {
              const isSelected = selectedIndicatorId === row.id;

              return (
                <tr
                  key={row.id}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  aria-label={`View clinical specification for ${row.id}: ${row.name}`}
                  onClick={() => onSelectIndicator(row.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectIndicator(row.id);
                    }
                  }}
                  className={`hover:bg-[#FAF8F3] focus-visible:outline-2 focus-visible:outline-[#0F6B6E] focus-visible:bg-[#FAF8F3] transition-colors cursor-pointer select-none ${
                    isSelected ? 'bg-[#FAF8F3] ring-1 ring-inset ring-[#0F6B6E]/40' : ''
                  }`}
                >
                  {/* ID */}
                  <td className="py-3 px-3 align-top">
                    <span className="font-mono font-bold text-[#14213D] text-[11px] px-1.5 py-0.5 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] inline-block">
                      {row.id}
                    </span>
                  </td>

                  {/* Name and Definition */}
                  <td className="py-3 px-3 align-top">
                    <div className="flex flex-col gap-0.5 max-w-sm">
                      <span className="font-semibold text-[#14213D] leading-snug">
                        {row.name}
                      </span>
                      <p className="text-[11px] text-[#5B6475] leading-relaxed m-0 line-clamp-2">
                        {row.definition}
                      </p>
                    </div>
                  </td>

                  {/* Pillar */}
                  <td className="py-3 px-3 align-top text-center">
                    <span
                      title={row.pillarName}
                      className="px-1.5 py-0.5 font-mono text-[10px] bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] text-[#5B6475] font-semibold"
                    >
                      {row.pillarId}
                    </span>
                  </td>

                  {/* Data Source */}
                  <td className="py-3 px-3 align-top">
                    <span className="text-[11px] text-[#5B6475] leading-snug block line-clamp-2">
                      {row.dataSource}
                    </span>
                  </td>

                  {/* Threshold Bands */}
                  <td className="py-3 px-3 align-top">
                    <div className="space-y-1 text-[10px] font-mono leading-tight">
                      {row.bands.length > 0 ? (
                        row.bands.map((band) => (
                          <div key={band.level} className="flex items-center gap-1.5 truncate">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                band.level === 'Meets'
                                  ? 'bg-[#2F6B3F]'
                                  : band.level === 'Partial'
                                    ? 'bg-[#B7791F]'
                                    : 'bg-[#B3341A]'
                              }`}
                            />
                            <span className="font-bold text-[#14213D]">{band.level}:</span>
                            <span className="text-[#5B6475] truncate">
                              {band.description || (band.threshold !== undefined ? `>=${band.threshold}` : 'Criteria set')}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-[#5B6475] italic text-[11px]">
                          Not specified in standard.
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Weight */}
                  <td className="py-3 px-3 align-top text-right font-mono tabular-nums text-[#14213D] font-bold">
                    {row.weight.toFixed(1)}
                  </td>

                  {/* Critical Status */}
                  <td className="py-3 px-3 align-top text-center">
                    {row.critical ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono uppercase bg-[#FAF0ED] text-[#B3341A] border border-[#B3341A]/30 rounded-[2px] font-bold">
                        <ShieldAlert className="w-2.5 h-2.5 shrink-0" />
                        <span>Critical</span>
                      </span>
                    ) : (
                      <span className="inline-block px-1.5 py-0.5 text-[10px] font-mono uppercase bg-[#FAF8F3] text-[#5B6475] border border-[#D9D3C5] rounded-[2px]">
                        Standard
                      </span>
                    )}
                  </td>

                  {/* Evidence Classification */}
                  <td className="py-3 px-3 align-top text-center">
                    <EvidenceTag classification={row.evidence} showLabel />
                  </td>

                  {/* References Count */}
                  <td className="py-3 px-3 align-top text-center font-mono text-[11px] tabular-nums text-[#5B6475]">
                    {row.refs.length > 0 ? (
                      <span className="flex items-center justify-center gap-1 text-[#0F6B6E]">
                        <BookOpen className="w-3 h-3" />
                        <span>{row.refs.length}</span>
                      </span>
                    ) : (
                      <span className="text-[#5B6475]/60">—</span>
                    )}
                  </td>

                  {/* Inspect Action */}
                  <td className="py-3 px-3 align-top text-right text-[#5B6475]">
                    <ArrowRight className="w-3.5 h-3.5 inline-block opacity-60 group-hover:opacity-100" />
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
