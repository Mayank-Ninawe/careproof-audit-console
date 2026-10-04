/**
 * CareProof Audit Console - Production Equipment Lifecycle Page
 * Source of Truth: CareProof Website Roadmap (Phase 9B)
 * 
 * CORE CONTRACT:
 * - Consumes EquipmentViewModel from Phase 9A service layer.
 * - Zero duplicated business logic inside React.
 * - 5-Stage Ledger: Procure -> Validate -> Maintain -> Monitor -> Retire.
 * - Audit-style register with honest states:
 *   - Unavailable incident count displayed as "Not available", never 0.
 *   - Unprovided calibration displayed as "Not provided", never fabricated.
 *   - SOP, History, and Retirement criteria presented in honest unconfigured/empty states.
 * - Prominent simulated-data disclosure and regulatory safe harbor notice.
 */

import React, { useState, useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import {
  LifecycleStageLedger,
  EquipmentFilterBar,
  EquipmentRegisterTable,
  EquipmentDetailDrawer,
} from '../../components/equipment';
import { generateSimulatedDataset } from '../../engine/simulate';
import {
  createEquipmentViewModel,
  getEquipmentDetail,
} from '../../services/equipment';
import { EquipmentFilterOptions, EquipmentLifecycleStage } from '../../types/equipment';
import { AlertTriangle, ShieldAlert, RotateCw } from 'lucide-react';

export interface EquipmentPageProps {
  seed?: number;
}

export const EquipmentPage: React.FC<EquipmentPageProps> = ({ seed = 42 }) => {
  const [currentSeed, setCurrentSeed] = useState<number>(seed);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<EquipmentFilterOptions>({
    stage: 'all',
    status: 'all',
    deviceType: 'all',
    searchQuery: '',
  });

  // Selected device for detail drawer
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  // Deterministic simulation dataset
  const dataset = useMemo(() => {
    try {
      return generateSimulatedDataset(currentSeed);
    } catch (err) {
      setError('Failed to initialize simulated equipment dataset.');
      return null;
    }
  }, [currentSeed]);

  // View model generated through Phase 9A pure service layer
  const viewModel = useMemo(() => {
    if (!dataset) return null;
    try {
      setError(null);
      return createEquipmentViewModel(dataset, filters);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error generating equipment view model.';
      setError(msg);
      return null;
    }
  }, [dataset, filters]);

  // Selected device detail derived through pure adapter
  const selectedDetail = useMemo(() => {
    if (!dataset || !selectedDeviceId) return null;
    return getEquipmentDetail(dataset, selectedDeviceId);
  }, [dataset, selectedDeviceId]);

  // Stage selection handler from ledger
  const handleSelectStage = (stage: EquipmentLifecycleStage | 'all') => {
    setFilters((prev) => ({
      ...prev,
      stage,
    }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      stage: 'all',
      status: 'all',
      deviceType: 'all',
      searchQuery: '',
    });
  };

  // Error State Handling
  if (error || !dataset || !viewModel) {
    return (
      <div className="py-6 px-4 max-w-7xl mx-auto space-y-6 text-left font-body">
        <PageHeader
          title="Equipment Lifecycle"
          subtitle="Equipment lifecycle, device status, maintenance, monitoring, and retirement readiness."
          badge={<StatusIndicator status="failure" label="Error" />}
        />
        <div className="border border-[#B3341A] bg-[#FAF8F3] p-6 rounded-[2px] text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-[#B3341A] mx-auto" aria-hidden="true" />
          <h2 className="text-sm font-mono font-bold text-[#B3341A]">
            Unable to Load Equipment Lifecycle Data
          </h2>
          <p className="text-xs text-[#5B6475] max-w-md mx-auto">
            {error ?? 'An unexpected error occurred while computing the equipment view model.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setCurrentSeed(42);
              handleClearFilters();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F6B6E] text-white text-xs font-mono rounded-[2px] hover:bg-[#0F6B6E]/90 focus-visible:outline-2 focus-visible:outline-[#0F6B6E]"
          >
            <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset Equipment Register</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto space-y-5 text-left font-body">
      {/* 1. Page Header */}
      <PageHeader
        title="Equipment Lifecycle"
        subtitle="Equipment lifecycle, device status, maintenance, monitoring, and retirement readiness."
        badge={<StatusIndicator status="success" label="Active Ledger" />}
        metadata={
          <>
            <span>Source: <strong>Simulated Equipment Register (Seed {currentSeed})</strong></span>
            <span>·</span>
            <span>Stages: <strong>Procure · Validate · Maintain · Monitor · Retire</strong></span>
            <span>·</span>
            <span>Status: <strong>Decision support, not diagnosis</strong></span>
          </>
        }
      />

      {/* 2. Simulated Data Disclosure Banner (Prominent and Restrained) */}
      <div className="border border-[#D9D3C5] bg-[#FAF8F3] px-3.5 py-2 rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-[#5B6475]">
          <ShieldAlert className="w-4 h-4 text-[#B7791F] shrink-0" aria-hidden="true" />
          <span>
            <strong className="text-[#14213D] font-mono uppercase tracking-wider">
              SIMULATED DATA — Demonstration equipment records only.
            </strong>{' '}
            All equipment telemetry traces and device identifiers are synthetically generated.
          </span>
        </div>
        <div className="text-[11px] font-mono text-[#5B6475] italic shrink-0">
          Proposed framework, not clinically validated. Decision support, not diagnosis.
        </div>
      </div>

      {/* 3. Five-Stage Lifecycle Ledger */}
      <LifecycleStageLedger
        summary={viewModel.summary}
        selectedStage={filters.stage ?? 'all'}
        onSelectStage={handleSelectStage}
      />

      {/* 4. Equipment Filter and Search Toolbar */}
      <EquipmentFilterBar
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={handleClearFilters}
        availableDeviceTypes={viewModel.availableDeviceTypes}
        availableStatuses={viewModel.availableStatuses}
        totalDevices={viewModel.totalDevices}
        filteredCount={viewModel.filteredCount}
      />

      {/* 5. Device Register Table */}
      <EquipmentRegisterTable
        rows={viewModel.register}
        selectedDeviceId={selectedDeviceId}
        onSelectDevice={(id) => setSelectedDeviceId(id)}
        onClearFilters={handleClearFilters}
      />

      {/* 6. Accessible Equipment Detail Drawer */}
      <EquipmentDetailDrawer
        detail={selectedDetail}
        isOpen={Boolean(selectedDeviceId && selectedDetail)}
        onClose={() => setSelectedDeviceId(null)}
      />
    </div>
  );
};
