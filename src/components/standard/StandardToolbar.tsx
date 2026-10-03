/**
 * CareProof Audit Console - Standard Explorer Toolbar Component
 * Source of Truth: CareProof Website Roadmap (Phase 7B)
 * 
 * Houses:
 * - Search bar with clear control.
 * - Evidence type filter (All, E, I, P).
 * - Critical-only filter toggle.
 * - Active filter count summary.
 * - Clear filters action.
 * - JSON and CSV export actions.
 */

import React from 'react';
import { Search, X, Download, ShieldAlert, RotateCcw } from 'lucide-react';
import { EvidenceType } from '../../types/standard';
import { StandardExplorerFilters } from '../../types/standardExplorer';

export interface StandardToolbarProps {
  filters: StandardExplorerFilters;
  totalCount: number;
  filteredCount: number;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  onEvidenceChange: (evidence: EvidenceType | undefined) => void;
  onCriticalOnlyToggle: () => void;
  onClearAllFilters: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  className?: string;
}

export const StandardToolbar: React.FC<StandardToolbarProps> = ({
  filters,
  totalCount,
  filteredCount,
  onSearchChange,
  onClearSearch,
  onEvidenceChange,
  onCriticalOnlyToggle,
  onClearAllFilters,
  onExportJson,
  onExportCsv,
  className = '',
}) => {
  const hasActiveFilters = Boolean(
    filters.searchQuery ||
    filters.pillarId ||
    filters.evidenceType ||
    filters.criticalOnly
  );

  return (
    <div
      className={`border border-[#D9D3C5] bg-white rounded-[2px] p-3.5 sm:p-4 text-left ${className}`}
    >
      {/* Top Row: Search and Export Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input Container */}
        <div className="relative flex-1 min-w-0">
          <label htmlFor="standard-search-input" className="sr-only">
            Search clinical standard indicators
          </label>
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#5B6475]">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            id="standard-search-input"
            type="text"
            value={filters.searchQuery || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by ID, name, definition, data source, or pillar..."
            className="w-full pl-8 pr-8 py-1.5 text-xs font-mono bg-[#FAF8F3]/60 border border-[#D9D3C5] rounded-[2px] text-[#14213D] placeholder-[#5B6475]/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0F6B6E] focus:border-[#0F6B6E] transition-colors"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              aria-label="Clear search query"
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#5B6475] hover:text-[#14213D] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
          <button
            type="button"
            onClick={onExportJson}
            aria-label="Export filtered indicators as JSON"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-[#D9D3C5] bg-white hover:bg-[#FAF8F3] text-[#14213D] rounded-[2px] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0F6B6E]"
          >
            <Download className="w-3 h-3 text-[#0F6B6E]" />
            <span>JSON</span>
          </button>
          <button
            type="button"
            onClick={onExportCsv}
            aria-label="Export filtered indicators as CSV"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono border border-[#D9D3C5] bg-white hover:bg-[#FAF8F3] text-[#14213D] rounded-[2px] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0F6B6E]"
          >
            <Download className="w-3 h-3 text-[#0F6B6E]" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Filter Badges, Summary, and Clear Filters */}
      <div className="mt-3 pt-3 border-t border-[#D9D3C5]/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Filter Controls Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Evidence Classification Segmented Control */}
          <div className="flex items-center border border-[#D9D3C5] rounded-[2px] overflow-hidden font-mono text-[11px] bg-[#FAF8F3]">
            <span className="px-2 py-1 text-[#5B6475] border-r border-[#D9D3C5] bg-white font-medium">
              Evidence:
            </span>
            <button
              type="button"
              onClick={() => onEvidenceChange(undefined)}
              aria-label="Filter evidence: All"
              className={`px-2 py-1 transition-colors cursor-pointer ${
                !filters.evidenceType
                  ? 'bg-[#0F6B6E] text-white font-bold'
                  : 'text-[#14213D] hover:bg-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onEvidenceChange('E')}
              aria-label="Filter evidence: Established"
              className={`px-2 py-1 transition-colors cursor-pointer border-l border-[#D9D3C5]/60 ${
                filters.evidenceType === 'E'
                  ? 'bg-[#0F6B6E] text-white font-bold'
                  : 'text-[#14213D] hover:bg-white'
              }`}
            >
              [E] Established
            </button>
            <button
              type="button"
              onClick={() => onEvidenceChange('I')}
              aria-label="Filter evidence: Interpretation"
              className={`px-2 py-1 transition-colors cursor-pointer border-l border-[#D9D3C5]/60 ${
                filters.evidenceType === 'I'
                  ? 'bg-[#0F6B6E] text-white font-bold'
                  : 'text-[#14213D] hover:bg-white'
              }`}
            >
              [I] Interp
            </button>
            <button
              type="button"
              onClick={() => onEvidenceChange('P')}
              aria-label="Filter evidence: Proposed"
              className={`px-2 py-1 transition-colors cursor-pointer border-l border-[#D9D3C5]/60 ${
                filters.evidenceType === 'P'
                  ? 'bg-[#0F6B6E] text-white font-bold'
                  : 'text-[#14213D] hover:bg-white'
              }`}
            >
              [P] Prop
            </button>
          </div>

          {/* Critical Only Toggle */}
          <button
            type="button"
            onClick={onCriticalOnlyToggle}
            aria-pressed={filters.criticalOnly === true}
            aria-label="Toggle critical indicators only"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono border rounded-[2px] transition-colors cursor-pointer select-none ${
              filters.criticalOnly
                ? 'bg-[#FAF0ED] text-[#B3341A] border-[#B3341A]/50 font-bold'
                : 'bg-white text-[#5B6475] border-[#D9D3C5] hover:bg-[#FAF8F3]'
            }`}
          >
            <ShieldAlert className={`w-3 h-3 ${filters.criticalOnly ? 'text-[#B3341A]' : 'text-[#5B6475]'}`} />
            <span>Critical Life-Safety Only</span>
          </button>
        </div>

        {/* Right side: Count summary and Clear action */}
        <div className="flex items-center gap-3 font-mono-ledger text-xs">
          <span className="text-[#5B6475] tabular-nums">
            Showing <strong className="text-[#14213D] font-mono">{filteredCount}</strong> of{' '}
            <strong className="text-[#14213D] font-mono">{totalCount}</strong> indicators
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearAllFilters}
              aria-label="Clear all active filters"
              className="inline-flex items-center gap-1 text-[11px] font-mono text-[#0F6B6E] hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
