import React from 'react';
import {
  CaregiverAssessmentMethod,
  CaregiverExpiryStatus,
  CaregiverFilterOptions,
  CaregiverMatrixStatus,
  VALID_ASSESSMENT_METHODS,
} from '../../types/caregiver';
import { Search, X, RotateCcw, Filter } from 'lucide-react';

export interface CaregiverFilterToolbarProps {
  filters: CaregiverFilterOptions;
  onFilterChange: (filters: CaregiverFilterOptions) => void;
  onClearFilters: () => void;
  availableRoles: string[];
  totalCaregivers: number;
  filteredCount: number;
  isCompetenciesConfigured: boolean;
}

export const CaregiverFilterToolbar: React.FC<CaregiverFilterToolbarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  availableRoles,
  totalCaregivers,
  filteredCount,
  isCompetenciesConfigured,
}) => {
  const isFiltered =
    (filters.roleId && filters.roleId !== 'all') ||
    (filters.competencyStatus && filters.competencyStatus !== 'all') ||
    (filters.assessmentMethod && filters.assessmentMethod !== 'all') ||
    (filters.expiryStatus && filters.expiryStatus !== 'all') ||
    (filters.searchQuery && filters.searchQuery.trim().length > 0);

  return (
    <div className="border border-[#D9D3C5] bg-[#FAF8F3] p-3 rounded-[2px] text-left space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <label htmlFor="caregiver-search" className="sr-only">
            Search caregiver by ID, role, or profile
          </label>
          <div className="relative">
            <Search
              className="w-4 h-4 text-[#5B6475] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="caregiver-search"
              type="text"
              value={filters.searchQuery ?? ''}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
              placeholder="Search caregiver ID (e.g. CG-001), role, or profile..."
              className="h-9 w-full pl-9 pr-8 text-xs bg-white text-[#14213D] border border-[#D9D3C5] rounded-[2px] placeholder:text-[#5B6475]/60 focus-visible:outline-2 focus-visible:outline-[#0F6B6E] hover:border-[#5B6475] transition-colors font-mono"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                aria-label="Clear search query"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#5B6475] hover:text-[#14213D] focus-visible:outline-2 focus-visible:outline-[#0F6B6E]"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Counts & Clear Action */}
        <div className="flex items-center gap-3 text-xs font-mono text-[#5B6475] self-end md:self-auto">
          <span>
            Showing <strong className="text-[#14213D]">{filteredCount}</strong> of{' '}
            <strong className="text-[#14213D]">{totalCaregivers}</strong> caregivers
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1 text-xs font-mono px-2 py-1 bg-white border border-[#D9D3C5] text-[#14213D] rounded-[2px] hover:border-[#5B6475] focus-visible:outline-2 focus-visible:outline-[#0F6B6E] transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-[#5B6475]" aria-hidden="true" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Filters */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#D9D3C5]/60">
        <span className="text-[11px] font-mono text-[#5B6475] uppercase flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3 text-[#0F6B6E]" aria-hidden="true" />
          Filter:
        </span>

        {/* Role Filter */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="filter-role" className="text-[11px] font-mono text-[#5B6475]">
            Role:
          </label>
          <select
            id="filter-role"
            aria-label="Filter by caregiver role"
            value={filters.roleId ?? 'all'}
            onChange={(e) => onFilterChange({ ...filters, roleId: e.target.value })}
            className="h-7 px-2 text-xs font-mono bg-white text-[#14213D] border border-[#D9D3C5] rounded-[2px] focus-visible:outline-2 focus-visible:outline-[#0F6B6E] hover:border-[#5B6475] max-w-[180px] truncate"
          >
            <option value="all">All Roles</option>
            {availableRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* Assessment Status Filter (Only when competencies configured) */}
        {isCompetenciesConfigured && (
          <div className="flex items-center gap-1.5">
            <label htmlFor="filter-competency-status" className="text-[11px] font-mono text-[#5B6475]">
              Status:
            </label>
            <select
              id="filter-competency-status"
              aria-label="Filter by competency assessment status"
              value={filters.competencyStatus ?? 'all'}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  competencyStatus: e.target.value as CaregiverMatrixStatus | 'all',
                })
              }
              className="h-7 px-2 text-xs font-mono bg-white text-[#14213D] border border-[#D9D3C5] rounded-[2px] focus-visible:outline-2 focus-visible:outline-[#0F6B6E] hover:border-[#5B6475]"
            >
              <option value="all">All Statuses</option>
              <option value="assessed">Assessed</option>
              <option value="not_assessed">Not Assessed</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        )}

        {/* Assessment Method Filter */}
        {isCompetenciesConfigured && (
          <div className="flex items-center gap-1.5">
            <label htmlFor="filter-method" className="text-[11px] font-mono text-[#5B6475]">
              Method:
            </label>
            <select
              id="filter-method"
              aria-label="Filter by assessment method"
              value={filters.assessmentMethod ?? 'all'}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  assessmentMethod: e.target.value as CaregiverAssessmentMethod | 'all',
                })
              }
              className="h-7 px-2 text-xs font-mono bg-white text-[#14213D] border border-[#D9D3C5] rounded-[2px] focus-visible:outline-2 focus-visible:outline-[#0F6B6E] hover:border-[#5B6475]"
            >
              <option value="all">All Methods</option>
              {VALID_ASSESSMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Expiry Status Filter */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="filter-expiry" className="text-[11px] font-mono text-[#5B6475]">
            Expiry:
          </label>
          <select
            id="filter-expiry"
            aria-label="Filter by license or assessment expiry"
            value={filters.expiryStatus ?? 'all'}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                expiryStatus: e.target.value as CaregiverExpiryStatus | 'all',
              })
            }
            className="h-7 px-2 text-xs font-mono bg-white text-[#14213D] border border-[#D9D3C5] rounded-[2px] focus-visible:outline-2 focus-visible:outline-[#0F6B6E] hover:border-[#5B6475]"
          >
            <option value="all">All Expiry States</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="not_configured">Not Configured</option>
          </select>
        </div>
      </div>
    </div>
  );
};
