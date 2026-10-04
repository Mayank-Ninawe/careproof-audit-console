/**
 * CareProof Audit Console - Production Caregiver Competency Page
 * Source of Truth: CareProof Website Roadmap (Phase 9D)
 * 
 * CORE CONTRACT:
 * - Consumes CaregiverViewModel from Phase 9C service layer.
 * - Zero duplicated business logic inside React.
 * - Competency Scale: Numeric Levels 0–4 (no invented medical meanings).
 * - Supported Assessment Methods: OSCE, Direct Observation, Knowledge Test.
 * - Honest unconfigured handling:
 *   - Unconfigured competencies render explicit unconfigured notices.
 *   - Gap rules render strictly when a targetLevel is configured.
 *   - Dual-assessor inter-rater records displayed without computing Cohen kappa.
 *   - Assessor entry form functions as local session draft only (zero Firestore writes).
 * - Prominent simulated-data disclosure and regulatory safe harbor notice.
 */

import React, { useState, useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import {
  CaregiverFilterToolbar,
  CaregiverMatrixTable,
  CaregiverGapReport,
  DualAssessorPanel,
  AssessorEntryForm,
  CaregiverDetailDrawer,
} from '../../components/caregiver';
import { generateSimulatedDataset } from '../../engine/simulate';
import {
  createCaregiverViewModel,
  getCaregiverDetail,
  getDualAssessorPairs,
} from '../../services/caregiver';
import {
  CaregiverAssessment,
  CaregiverCompetency,
  CaregiverFilterOptions,
} from '../../types/caregiver';
import { ShieldAlert, AlertTriangle, RotateCw, ToggleLeft, ToggleRight } from 'lucide-react';

export interface CaregiversPageProps {
  seed?: number;
  configuredCompetencies?: CaregiverCompetency[];
  initialAssessments?: CaregiverAssessment[];
}

// Built-in roadmap demonstration competencies when framework is enabled
const DEMO_FRAMEWORK_COMPETENCIES: CaregiverCompetency[] = [
  { id: 'COMP-01', name: 'Vital Signs Telemetry', targetLevel: 3 },
  { id: 'COMP-02', name: 'Device Sensor Operation', targetLevel: 2 },
  { id: 'COMP-03', name: 'Emergency Escalation Flow' }, // No target level (honest unconfigured gap rule)
];

export const CaregiversPage: React.FC<CaregiversPageProps> = ({
  seed = 42,
  configuredCompetencies,
  initialAssessments,
}) => {
  const [currentSeed, setCurrentSeed] = useState<number>(seed);
  const [error, setError] = useState<string | null>(null);

  // Toggle for demonstration framework when props are not provided
  const [isDemoFrameworkActive, setIsDemoFrameworkActive] = useState<boolean>(
    Boolean(configuredCompetencies && configuredCompetencies.length > 0)
  );

  // Active competencies: props > demo toggle > empty unconfigured
  const activeCompetencies = useMemo(() => {
    if (configuredCompetencies) return configuredCompetencies;
    return isDemoFrameworkActive ? DEMO_FRAMEWORK_COMPETENCIES : [];
  }, [configuredCompetencies, isDemoFrameworkActive]);

  // Local assessments state (supporting session draft entries)
  const [sessionAssessments, setSessionAssessments] = useState<CaregiverAssessment[]>(
    initialAssessments ?? []
  );

  // Filters state
  const [filters, setFilters] = useState<CaregiverFilterOptions>({
    roleId: 'all',
    competencyStatus: 'all',
    assessmentMethod: 'all',
    expiryStatus: 'all',
    searchQuery: '',
  });

  // Selected caregiver for detail drawer
  const [selectedCaregiverId, setSelectedCaregiverId] = useState<string | null>(null);

  // Deterministic simulation dataset
  const dataset = useMemo(() => {
    try {
      return generateSimulatedDataset(currentSeed);
    } catch (err) {
      setError('Failed to initialize simulated caregiver dataset.');
      return null;
    }
  }, [currentSeed]);

  // Generate initial demonstration assessments deterministically if demo framework is on and none passed
  const allAssessments = useMemo(() => {
    if (sessionAssessments.length > 0) return sessionAssessments;
    if (!dataset || !isDemoFrameworkActive || activeCompetencies.length === 0) return [];

    // Deterministic synthetic baseline assessments for demo
    const baseline: CaregiverAssessment[] = [];
    if (dataset.caregivers.length >= 2) {
      // CG-001 has two assessments (Assessor A and Assessor B for COMP-01)
      baseline.push(
        {
          id: 'ASM-001',
          caregiverId: dataset.caregivers[0].id,
          competencyId: 'COMP-01',
          level: 3,
          method: 'OSCE',
          assessorId: 'ASR-001',
          assessorRole: 'assessor_a',
          timestamp: '2026-01-15T10:00:00.000Z',
          expiryDate: '2026-12-31T00:00:00.000Z',
          isSimulated: true,
        },
        {
          id: 'ASM-002',
          caregiverId: dataset.caregivers[0].id,
          competencyId: 'COMP-01',
          level: 3,
          method: 'Direct Observation',
          assessorId: 'ASR-002',
          assessorRole: 'assessor_b',
          timestamp: '2026-01-15T10:30:00.000Z',
          expiryDate: '2026-12-31T00:00:00.000Z',
          isSimulated: true,
        }
      );

      // CG-002 has an assessment below target
      baseline.push({
        id: 'ASM-003',
        caregiverId: dataset.caregivers[1].id,
        competencyId: 'COMP-01',
        level: 1,
        method: 'Knowledge Test',
        assessorId: 'ASR-001',
        timestamp: '2025-11-01T00:00:00.000Z',
        expiryDate: '2025-12-01T00:00:00.000Z',
        isSimulated: true,
      });
    }

    return baseline;
  }, [sessionAssessments, dataset, isDemoFrameworkActive, activeCompetencies]);

  // Primary view model derived through Phase 9C service layer
  const viewModel = useMemo(() => {
    if (!dataset) return null;
    try {
      setError(null);
      return createCaregiverViewModel(dataset, {
        competencies: activeCompetencies,
        assessments: allAssessments,
        filters,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error generating caregiver view model.';
      setError(msg);
      return null;
    }
  }, [dataset, activeCompetencies, allAssessments, filters]);

  // Selected caregiver detail derived through pure adapter
  const selectedDetail = useMemo(() => {
    if (!dataset || !selectedCaregiverId) return null;
    return getCaregiverDetail(
      dataset,
      selectedCaregiverId,
      activeCompetencies,
      allAssessments
    );
  }, [dataset, selectedCaregiverId, activeCompetencies, allAssessments]);

  // Dual assessor pairs
  const dualAssessorPairs = useMemo(() => {
    return getDualAssessorPairs(allAssessments);
  }, [allAssessments]);

  // Handle local assessment recording
  const handleRecordAssessment = (assessment: CaregiverAssessment) => {
    setSessionAssessments((prev) => [...prev, assessment]);
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({
      roleId: 'all',
      competencyStatus: 'all',
      assessmentMethod: 'all',
      expiryStatus: 'all',
      searchQuery: '',
    });
  };

  // Error State Handling
  if (error || !dataset || !viewModel) {
    return (
      <div className="py-6 px-4 max-w-7xl mx-auto space-y-6 text-left font-body">
        <PageHeader
          title="Caregiver Competency"
          subtitle="Competency matrix, assessments, expiry status, and identified gaps."
          badge={<StatusIndicator status="failure" label="Error" />}
        />
        <div className="border border-[#B3341A] bg-[#FAF8F3] p-6 rounded-[2px] text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-[#B3341A] mx-auto" aria-hidden="true" />
          <h2 className="text-sm font-mono font-bold text-[#B3341A]">
            Unable to Load Caregiver Competency Data
          </h2>
          <p className="text-xs text-[#5B6475] max-w-md mx-auto">
            {error ?? 'An unexpected error occurred while computing the caregiver view model.'}
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
            <span>Reset Caregiver Register</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto space-y-5 text-left font-body">
      {/* 1. Page Header */}
      <PageHeader
        title="Caregiver Competency"
        subtitle="Competency matrix, assessments, expiry status, and identified gaps."
        badge={<StatusIndicator status="success" label="Active Ledger" />}
        metadata={
          <>
            <span>Source: <strong>Simulated Caregiver Register (Seed {currentSeed})</strong></span>
            <span>·</span>
            <span>Scale: <strong>Numeric Level 0–4</strong></span>
            <span>·</span>
            <span>Status: <strong>Decision support, not diagnosis</strong></span>
          </>
        }
      />

      {/* 2. Simulated Data Disclosure Banner */}
      <div className="border border-[#D9D3C5] bg-[#FAF8F3] px-3.5 py-2 rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-[#5B6475]">
          <ShieldAlert className="w-4 h-4 text-[#B7791F] shrink-0" aria-hidden="true" />
          <span>
            <strong className="text-[#14213D] font-mono uppercase tracking-wider">
              SIMULATED DATA — Demonstration caregiver records only.
            </strong>{' '}
            All caregiver identifiers, competency levels, and evaluation traces are synthetically generated.
          </span>
        </div>
        <div className="text-[11px] font-mono text-[#5B6475] italic shrink-0">
          Proposed framework, not clinically validated. Decision support, not diagnosis.
        </div>
      </div>

      {/* 3. Framework Configuration Mode Banner */}
      <div className="border border-[#D9D3C5] bg-white p-3 rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="font-mono text-xs font-semibold uppercase text-[#14213D] block">
            Competency Framework State:
          </span>
          <p className="text-[11px] text-[#5B6475]">
            {viewModel.isCompetenciesConfigured
              ? `Configured (${viewModel.columns.length} competency modules active)`
              : 'Unconfigured in raw simulation dataset. Toggle to view roadmap matrix.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsDemoFrameworkActive((prev) => !prev)}
          className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono border rounded-[2px] transition-colors focus-visible:outline-2 focus-visible:outline-[#0F6B6E] ${
            viewModel.isCompetenciesConfigured
              ? 'bg-[#0F6B6E]/10 border-[#0F6B6E] text-[#0F6B6E] font-semibold'
              : 'bg-[#FAF8F3] border-[#D9D3C5] text-[#5B6475] hover:text-[#14213D]'
          }`}
        >
          {viewModel.isCompetenciesConfigured ? (
            <ToggleRight className="w-4 h-4 text-[#0F6B6E]" aria-hidden="true" />
          ) : (
            <ToggleLeft className="w-4 h-4 text-[#5B6475]" aria-hidden="true" />
          )}
          <span>
            {viewModel.isCompetenciesConfigured
              ? 'Demonstration Framework Active'
              : 'Enable Demonstration Framework'}
          </span>
        </button>
      </div>

      {/* 4. Filter Toolbar */}
      <CaregiverFilterToolbar
        filters={filters}
        onFilterChange={setFilters}
        onClearFilters={handleClearFilters}
        availableRoles={viewModel.availableRoles}
        totalCaregivers={viewModel.totalCaregivers}
        filteredCount={viewModel.filteredCount}
        isCompetenciesConfigured={viewModel.isCompetenciesConfigured}
      />

      {/* 5. Competency Matrix Table */}
      <CaregiverMatrixTable
        rows={viewModel.rows}
        columns={viewModel.columns}
        isCompetenciesConfigured={viewModel.isCompetenciesConfigured}
        selectedCaregiverId={selectedCaregiverId}
        onSelectCaregiver={(id) => setSelectedCaregiverId(id)}
        onSelectCell={(cgId) => setSelectedCaregiverId(cgId)}
        onClearFilters={handleClearFilters}
      />

      {/* 6. Gap Audit Report */}
      <CaregiverGapReport
        gaps={viewModel.gaps}
        isCompetenciesConfigured={viewModel.isCompetenciesConfigured}
        onSelectCaregiver={(id) => setSelectedCaregiverId(id)}
      />

      {/* 7. Dual-Assessor Inter-Rater Panel */}
      <DualAssessorPanel pairs={dualAssessorPairs} />

      {/* 8. Assessor Evaluation Entry Form (Local Session Draft) */}
      <AssessorEntryForm
        caregivers={dataset.caregivers}
        competencies={activeCompetencies}
        isCompetenciesConfigured={viewModel.isCompetenciesConfigured}
        onRecordAssessment={handleRecordAssessment}
      />

      {/* 9. Accessible Caregiver Detail Drawer */}
      <CaregiverDetailDrawer
        detail={selectedDetail}
        isOpen={Boolean(selectedCaregiverId && selectedDetail)}
        onClose={() => setSelectedCaregiverId(null)}
      />
    </div>
  );
};
