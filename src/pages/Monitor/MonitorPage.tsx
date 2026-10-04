/**
 * CareProof Audit Console - Production Patient Monitor Page
 * Source of Truth: CareProof Website Roadmap (Phase 8B)
 * 
 * CORE CONTRACT:
 * - Pure Presentation Layer: Consumes PatientMonitorViewModel from Phase 8A service.
 * - Zero duplicated math: Confidence, freshness, completeness, and data-gap logic remain in service layer.
 * - Honest Visualization:
 *   - Broken lines across irregular observation gaps (never continuous).
 *   - Explicit missing values (never 0 or silently converted to normal).
 *   - Unconfigured early-warning score bands displayed honestly (never fabricated NEWS2).
 *   - Prominent simulated data disclosure and decision-support safe harbor notice.
 */

import React, { useState, useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  PatientContextCard,
  ConfidenceSummary,
  DataGapAlertBanner,
  ObservationTimeline,
  MonitorConfidenceRibbon,
  EarlyWarningStatusCard,
  DecisionSupportNote,
} from '../../components/monitor';
import { generateSimulatedDataset } from '../../engine/simulate';
import { getMonitorPatients, createPatientMonitorViewModel } from '../../services/monitor';
import { MonitorObservation } from '../../types/monitor';
import { Activity, AlertTriangle, ShieldAlert, RotateCw } from 'lucide-react';

export interface MonitorPageProps {
  seed?: number;
  referenceTime?: string | number | Date;
}

export const MonitorPage: React.FC<MonitorPageProps> = ({
  seed = 42,
  referenceTime,
}) => {
  const [currentSeed, setCurrentSeed] = useState<number>(seed);
  const [error, setError] = useState<string | null>(null);

  // Generate deterministic simulation dataset
  const dataset = useMemo(() => {
    try {
      return generateSimulatedDataset(currentSeed);
    } catch (err) {
      setError('Failed to initialize simulation dataset.');
      return null;
    }
  }, [currentSeed]);

  // Available simulated patients
  const patients = useMemo(() => {
    if (!dataset) return [];
    return getMonitorPatients(dataset);
  }, [dataset]);

  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => {
    return patients.length > 0 ? patients[0].id : 'PAT-001';
  });

  // Selected observation for inspection
  const [selectedObservation, setSelectedObservation] = useState<MonitorObservation | null>(null);

  // Derive view model strictly through the Phase 8A service layer (Zero math inside component)
  const viewModel = useMemo(() => {
    if (!dataset) return null;
    try {
      setError(null);
      // If referenceTime is provided use it; otherwise use dataset generatedAt for determinism
      const ref = referenceTime ?? dataset.generatedAt;
      return createPatientMonitorViewModel(dataset, selectedPatientId, {}, ref);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error generating patient monitor view model.';
      setError(msg);
      return null;
    }
  }, [dataset, selectedPatientId, referenceTime]);

  // Handle patient switch
  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setSelectedObservation(null);
  };

  // Error State Handling
  if (error || !dataset) {
    return (
      <div className="py-6 px-4 max-w-7xl mx-auto space-y-6 text-left font-body">
        <PageHeader
          title="Patient Monitor"
          subtitle="Observation timeline, confidence, freshness, and data-gap monitoring."
          badge={<StatusIndicator status="failure" label="Error" />}
        />
        <div className="border border-[#B3341A] bg-[#FAF8F3] p-6 rounded-[2px] text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-[#B3341A] mx-auto" aria-hidden="true" />
          <h2 className="text-sm font-mono font-bold text-[#B3341A]">
            Unable to Load Patient Monitor Data
          </h2>
          <p className="text-xs text-[#5B6475] max-w-md mx-auto">
            {error ?? 'An unexpected error occurred while computing the patient monitor view model.'}
          </p>
          <button
            onClick={() => {
              setError(null);
              setCurrentSeed(42);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F6B6E] text-white text-xs font-mono rounded-[2px] hover:bg-[#0F6B6E]/90 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0F6B6E]"
          >
            <RotateCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset Monitor</span>
          </button>
        </div>
      </div>
    );
  }

  // Empty State: No Patients
  if (patients.length === 0) {
    return (
      <div className="py-6 px-4 max-w-7xl mx-auto space-y-6 text-left font-body">
        <PageHeader
          title="Patient Monitor"
          subtitle="Observation timeline, confidence, freshness, and data-gap monitoring."
          badge={<StatusIndicator status="neutral" label="Empty" />}
        />
        <EmptyState
          icon={<Activity className="w-8 h-8 text-[#5B6475]" />}
          title="No Observation Data Available"
          description="The simulation dataset contains zero registered patient entities. Generate or seed patients to view monitor telemetry."
        />
      </div>
    );
  }

  return (
    <div className="py-6 px-4 max-w-7xl mx-auto space-y-5 text-left font-body">
      {/* A. Page Header */}
      <PageHeader
        title="Patient Monitor"
        subtitle="Observation timeline, confidence, freshness, and data-gap monitoring."
        badge={
          viewModel?.dataGapAlert ? (
            <StatusIndicator status="warning" label="Gap Alert" />
          ) : (
            <StatusIndicator status="success" label="Nominal" />
          )
        }
        metadata={
          <>
            <span>Source: <strong>Simulated Dataset (Seed {currentSeed})</strong></span>
            <span>·</span>
            <span>Framework: <strong>Confidence = Completeness × Freshness</strong></span>
            <span>·</span>
            <span>Status: <strong>Decision support, not diagnosis</strong></span>
          </>
        }
      />

      {/* B. Simulated Data Disclosure Banner (Prominent and Restrained) */}
      <div className="border border-[#D9D3C5] bg-[#FAF8F3] px-3.5 py-2 rounded-[2px] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-[#5B6475]">
          <ShieldAlert className="w-4 h-4 text-[#B7791F] shrink-0" aria-hidden="true" />
          <span>
            <strong className="text-[#14213D] font-mono uppercase tracking-wider">
              SIMULATED DATA — Demonstration dataset only.
            </strong>{' '}
            All patient records and telemetry traces are synthetically generated with zero PII.
          </span>
        </div>
        <div className="text-[11px] font-mono text-[#5B6475] italic shrink-0">
          Proposed framework, not clinically validated. Decision support, not diagnosis.
        </div>
      </div>

      {/* C. Patient Selector & Simulated Patient Context */}
      <PatientContextCard
        patients={patients}
        selectedPatientId={selectedPatientId}
        onSelectPatient={handleSelectPatient}
        selectedPatient={viewModel?.selectedPatient ?? null}
        observationCount={viewModel?.orderedObservations.length ?? 0}
        lastObservationAt={viewModel?.lastObservationAt ?? null}
      />

      {/* If patient has zero observations */}
      {viewModel && viewModel.orderedObservations.length === 0 ? (
        <EmptyState
          icon={<Activity className="w-8 h-8 text-[#5B6475]" />}
          title="No Observation Data Available"
          description={`Patient ${selectedPatientId} has no recorded telemetry observations in the current simulation.`}
        />
      ) : viewModel ? (
        <>
          {/* D. Confidence Summary Metrics (Prominent KPI Ledger) */}
          <ConfidenceSummary viewModel={viewModel} />

          {/* E. Data-Gap Alert Banner */}
          <DataGapAlertBanner
            alertDetails={viewModel.dataGapAlertDetails}
            confidence={viewModel.confidence}
            threshold={viewModel.confidenceThreshold}
            reason={viewModel.dataGapReason}
          />

          {/* F. Observation Timeline (Interactive SVG with honest gap breaks) */}
          <ObservationTimeline
            timelinePoints={viewModel.timelinePoints}
            selectedObservationId={selectedObservation?.id ?? viewModel.latestObservation?.id}
            onSelectObservation={(obs) => setSelectedObservation(obs)}
            gapThresholdMs={viewModel.config.gapThresholdMs}
          />

          {/* G. Confidence Ribbon (Positioned directly below chart per roadmap) */}
          <MonitorConfidenceRibbon
            confidence={viewModel.confidence}
            threshold={viewModel.confidenceThreshold}
            isDataGap={viewModel.dataGapAlert}
            completeness={viewModel.completeness}
            freshness={viewModel.freshness}
          />

          {/* H. Early-Warning Status & Score-Band Configuration */}
          <EarlyWarningStatusCard
            earlyWarningResult={viewModel.earlyWarningResult}
            scoreBandConfiguration={viewModel.scoreBandConfiguration}
          />

          {/* I. Decision-Support & Governance Note */}
          <DecisionSupportNote />
        </>
      ) : null}
    </div>
  );
};
