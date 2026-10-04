import React from 'react';
import {
  CANONICAL_EQUIPMENT_STAGES,
  EquipmentFilterOptions,
  EquipmentLifecycleStage,
  EquipmentStatus,
} from '../../types/equipment';
import { Search, X, RotateCcw, Filter } from 'lucide-react';

export interface EquipmentFilterBarProps {
  filters: EquipmentFilterOptions;
  onFilterChange: (filters: EquipmentFilterOptions) => void;
  onClearFilters: () => void;
  availableDeviceTypes: string[];
  availableStatuses: EquipmentStatus[];
  totalDevices: number;
  filteredCount: number;
}

export const EquipmentFilterBar: React.FC<EquipmentFilterBarProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  availableDeviceTypes,
  availableStatuses,
  totalDevices,
  filteredCount,
}) => {
  const isFiltered =
    (filters.stage && filters.stage !== 'all') ||
    (filters.status && filters.status !== 'all') ||
    (filters.deviceType && filters.deviceType !== 'all') ||
    (filters.searchQuery && filters.searchQuery.trim().length > 0);

  return (
    <div className="border border-[#D9D3C5] bg-[#FAF8F3] p-3 rounded-[2px] text-left space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <label htmlFor="equipment-search" className="sr-only">
            Search equipment by device ID or type
          </label>
          <div className="relative">
            <Search
              className="w-4 h-4 text-[#5B6475] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="equipment-search"
              type="text"
              value={filters.searchQuery ?? ''}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
              placeholder="Search by device ID (e.g. DEV-001) or type..."
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

        {/* Filter Counts & Clear Action */}
        <div className="flex items-center gap-3 text-xs font-mono text-[#5B6475] self-end md:self-auto">
          <span>
            Showing <strong className="text-[#14213D]">{filteredCount}</strong> of{' '}
            <strong className="text-[#14213D]">{totalDevices}</strong> records
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

      {/* Filter Dropdown Selectors */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#D9D3C5]/60">
        <span className="text-[11px] font-mono text-[#5B6475] uppercase flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3 text-[#0F6B6E]" aria-hidden="true" />
          Filter:
        </span>

        {/* Stage Filter */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="filter-stage" className="text-[11px] font-mono text-[#5B6475]">
            Stage:
          </label>
          <select
            id="filter-stage"
            aria-label="Filter by lifecycle stage"
            value={filters.stage ?? 'all'}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                stage: e.target.value as EquipmentLifecycleStage | 'all',
              })
            }
            className="h-7 px-2 text-xs font-mono bg-white text-[#14213D] border border-[#D9D3C5] rounded-[2px] focus-visible:outline-2 focus-visible:outline-[#0F6B6E] hover:border-[#5B6475]"
          >
            <option value="all">All Stages</option>
            {CANONICAL_EQUIPMENT_STAGES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="filter-status" className="text-[11px] font-mono text-[#5B6475]">
            Status:
          </label>
          <select
            id="filter-status"
            aria-label="Filter by operational status"
            value={filters.status ?? 'all'}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                status: e.target.value as EquipmentStatus | 'all',
              })
            }
            className="h-7 px-2 text-xs font-mono bg-white text-[#14213D] border border-[#D9D3C5] rounded-[2px] focus-visible:outline-2 focus-visible:outline-[#0F6B6E] hover:border-[#5B6475]"
          >
            <option value="all">All Statuses</option>
            {availableStatuses.map((st) => (
              <option key={st} value={st}>
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Device Type Filter */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="filter-device-type" className="text-[11px] font-mono text-[#5B6475]">
            Type:
          </label>
          <select
            id="filter-device-type"
            aria-label="Filter by device type"
            value={filters.deviceType ?? 'all'}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                deviceType: e.target.value,
              })
            }
            className="h-7 px-2 text-xs font-mono bg-white text-[#14213D] border border-[#D9D3C5] rounded-[2px] focus-visible:outline-2 focus-visible:outline-[#0F6B6E] hover:border-[#5B6475] max-w-[200px] truncate"
          >
            <option value="all">All Device Types</option>
            {availableDeviceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
