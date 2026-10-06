/**
 * CareProof Audit Console - Incident Register & Filter Component (Phase 11B)
 * Source of Truth: CareProof Website Roadmap (Phase 11B)
 * 
 * CORE CONTRACT:
 * - Search, status filter, canonical indicator filter.
 * - Selecting an incident updates the active record.
 * - "New Incident" action seeds an in-memory draft.
 */

import React from 'react';
import { Search, Plus, AlertCircle, X } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Button } from '../ui/Button';
import {
  IncidentFilterOptions,
  IncidentRecord,
  IncidentStatus,
  VALID_INCIDENT_STATUSES,
} from '../../types/incident';
import { CANONICAL_STANDARD } from '../../data/standard';

export interface IncidentRegisterTableProps {
  records: readonly IncidentRecord[];
  allRecords: readonly IncidentRecord[];
  activeRecordId: string | null;
  onSelectRecord: (id: string) => void;
  filters: IncidentFilterOptions;
  onFilterChange: (filters: IncidentFilterOptions) => void;
  onNewDraft: () => void;
  className?: string;
}

export const IncidentRegisterTable: React.FC<IncidentRegisterTableProps> = ({
  records,
  allRecords,
  activeRecordId,
  onSelectRecord,
  filters,
  onFilterChange,
  onNewDraft,
  className = '',
}) => {
  const canonicalIndicators = CANONICAL_STANDARD.indicators;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as IncidentStatus | 'all';
    onFilterChange({ ...filters, status: val });
  };

  const handleIndicatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, indicatorId: e.target.value });
  };

  const handleClearFilters = () => {
    onFilterChange({ searchQuery: '', status: 'all', indicatorId: '' });
  };

  const hasActiveFilters = Boolean(
    (filters.searchQuery && filters.searchQuery.trim().length > 0) ||
      (filters.status && filters.status !== 'all') ||
      (filters.indicatorId && filters.indicatorId.trim().length > 0)
  );

  return (
    <Panel
      title="Incident Register &amp; Active Queue"
      className={className}
      headerActions={
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#5B6475]">
            Showing <strong>{records.length}</strong> of {allRecords.length}
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onNewDraft}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>New Draft Incident</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-left font-body">
        {/* Search & Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <label htmlFor="incident-search-input" className="sr-only">
              Search Incidents
            </label>
            <Search className="w-3.5 h-3.5 text-[#5B6475] absolute left-2.5 top-3" aria-hidden="true" />
            <input
              id="incident-search-input"
              type="text"
              value={filters.searchQuery || ''}
              onChange={handleSearchChange}
              placeholder="Search by ID, title, summary, location..."
              className="w-full pl-8 pr-3 py-1.5 text-xs font-mono border border-[#D9D3C5] bg-white text-[#14213D] rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#0F6B6E]"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <label htmlFor="incident-status-filter" className="sr-only">
              Filter by Status
            </label>
            <select
              id="incident-status-filter"
              value={filters.status || 'all'}
              onChange={handleStatusChange}
              className="w-full px-2.5 py-1.5 text-xs font-mono border border-[#D9D3C5] bg-white text-[#14213D] rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#0F6B6E]"
            >
              <option value="all">All Workflow Statuses</option>
              {VALID_INCIDENT_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st.toUpperCase().replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Canonical Indicator Filter */}
          <div className="sm:col-span-3">
            <label htmlFor="incident-indicator-filter" className="sr-only">
              Filter by Indicator
            </label>
            <select
              id="incident-indicator-filter"
              value={filters.indicatorId || ''}
              onChange={handleIndicatorChange}
              className="w-full px-2.5 py-1.5 text-xs font-mono border border-[#D9D3C5] bg-white text-[#14213D] rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#0F6B6E]"
            >
              <option value="">All Indicators</option>
              {canonicalIndicators.map((ind) => (
                <option key={ind.id} value={ind.id}>
                  {ind.id} - {ind.name.slice(0, 24)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs text-[#5B6475] px-1 font-mono">
            <span>Filter criteria applied.</span>
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-[#0F6B6E] hover:underline cursor-pointer"
            >
              <X className="w-3 h-3" aria-hidden="true" />
              <span>Clear filters</span>
            </button>
          </div>
        )}

        {/* Register Table */}
        {records.length > 0 ? (
          <div className="overflow-x-auto border border-[#D9D3C5] rounded-[2px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F3] border-b border-[#D9D3C5] font-mono uppercase text-[#5B6475] text-[11px]">
                  <th scope="col" className="p-2.5 font-semibold">Incident ID</th>
                  <th scope="col" className="p-2.5 font-semibold">Title &amp; Context</th>
                  <th scope="col" className="p-2.5 font-semibold">Timestamp</th>
                  <th scope="col" className="p-2.5 font-semibold">Status</th>
                  <th scope="col" className="p-2.5 font-semibold">Linked Indicators</th>
                  <th scope="col" className="p-2.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D3C5] font-body bg-white">
                {records.map((rec) => {
                  const isSelected = activeRecordId === rec.id;
                  return (
                    <tr
                      key={rec.id}
                      className={`hover:bg-[#FAF8F3]/70 transition-colors ${
                        isSelected ? 'bg-[#0F6B6E]/5 font-semibold' : ''
                      }`}
                    >
                      <td className="p-2.5 font-mono text-[#14213D] whitespace-nowrap">
                        <span className="font-bold">{rec.id}</span>
                        {isSelected && (
                          <span className="ml-1.5 text-[9px] px-1 py-0.2 bg-[#0F6B6E] text-white rounded-[2px] font-mono">
                            ACTIVE
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 max-w-xs">
                        <div className="text-xs font-bold text-[#14213D] truncate">
                          {rec.intake.title}
                        </div>
                        <div className="text-[11px] text-[#5B6475] truncate mt-0.5">
                          {rec.intake.location || 'Location unassigned'} · Rep: {rec.intake.reporterId}
                        </div>
                      </td>
                      <td className="p-2.5 font-mono text-[#5B6475] whitespace-nowrap text-[11px]">
                        {new Date(rec.intake.timestamp).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="p-2.5 whitespace-nowrap">
                        <span
                          className={`inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-[2px] border ${
                            rec.status === 'closed'
                              ? 'bg-[#2F6B3F]/10 border-[#2F6B3F]/30 text-[#2F6B3F]'
                              : rec.status === 'actions_pending'
                              ? 'bg-[#B7791F]/10 border-[#B7791F]/30 text-[#B7791F]'
                              : 'bg-[#0F6B6E]/10 border-[#0F6B6E]/30 text-[#0F6B6E]'
                          }`}
                        >
                          {rec.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-[#5B6475] whitespace-nowrap">
                        {rec.linkedIndicators.length > 0 ? (
                          <div className="flex items-center gap-1">
                            {rec.linkedIndicators.slice(0, 2).map((li) => (
                              <span
                                key={li.indicatorId}
                                className="px-1.5 py-0.5 bg-[#FAF8F3] border border-[#D9D3C5] text-[#14213D] rounded-[2px]"
                              >
                                {li.indicatorId}
                              </span>
                            ))}
                            {rec.linkedIndicators.length > 2 && (
                              <span className="text-[10px]">+{rec.linkedIndicators.length - 2}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#9CA3AF]">None mapped</span>
                        )}
                      </td>
                      <td className="p-2.5 text-right whitespace-nowrap">
                        <Button
                          type="button"
                          variant={isSelected ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => onSelectRecord(rec.id)}
                          className="text-xs"
                        >
                          {isSelected ? 'Selected' : 'Open File'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            role="status"
            aria-label="No Incidents Found"
            className="p-8 text-center bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]"
          >
            <AlertCircle className="w-8 h-8 text-[#5B6475] mx-auto mb-2" aria-hidden="true" />
            <h3 className="text-sm font-bold text-[#14213D] m-0 font-body">
              No matching incidents found
            </h3>
            <p className="text-xs text-[#5B6475] mt-1 m-0 font-body">
              {hasActiveFilters
                ? 'Try adjusting your search query, status, or indicator filters.'
                : 'No incidents are currently recorded in the queue.'}
            </p>
            {hasActiveFilters && (
              <div className="mt-3">
                <Button type="button" variant="secondary" size="sm" onClick={handleClearFilters}>
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Panel>
  );
};
