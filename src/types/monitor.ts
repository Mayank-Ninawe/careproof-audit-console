/**
 * CareProof Audit Console - Patient Monitor Domain Types
 * Source of Truth: CareProof Website Roadmap (Phase 8A)
 * 
 * STRICT ARCHITECTURAL CONTRACT:
 * 1. Pure Data/Logic Layer: Zero React, DOM, or Firebase dependencies.
 * 2. Anonymized Synthetic Data: Strictly synthetic identifiers with no PII.
 * 3. Freshness & Confidence Math:
 *      freshness = exp(−Δt / τ)
 *      confidence = completeness × freshness
 * 4. Clinical Source Policy:
 *      NEWS2 early-warning scoring requires verified Royal College of Physicians (RCP)
 *      source tables. Unverified scoring tables are NEVER fabricated.
 * 5. Safe Harbor Boundary:
 *      "Proposed framework, not clinically validated. Decision support, not diagnosis."
 */

import { ObservationValueMap } from './simulation';

/**
 * Anonymized synthetic patient entity for the Patient Monitor.
 */
export interface MonitorPatient {
  id: string;                 // e.g. "PAT-001"
  label: string;              // e.g. "Synthetic Patient 001"
  observationProfile: string;   // e.g. "Profile-Alpha"
  status: string;             // e.g. "active", "monitored"
  isSimulated: true;
}

/**
 * Individual clinical observation point along a patient's timeline.
 */
export interface MonitorObservation {
  id: string;                 // e.g. "OBS-0001"
  patientId: string;          // e.g. "PAT-001"
  timestamp: string;          // ISO 8601 string
  timestampMs: number;        // Epoch milliseconds for deterministic math
  values: ObservationValueMap;
  completeness: 'complete' | 'partial' | 'sparse';
  hasTimingGap: boolean;      // Irregular elapsed time preceding this observation
  gapDurationMs: number;      // Duration of preceding gap in milliseconds
  isSimulated: true;
}

/**
 * Visual/ledger timeline point preserving gaps without synthetic interpolation.
 */
export interface MonitorTimelinePoint {
  observation: MonitorObservation;
  isGapPreceding: boolean;
  gapDurationMs: number;
  completenessRatio: number;  // [0.0, 1.0]
}

/**
 * Mathematical telemetry confidence result based on completeness and freshness decay.
 */
export interface ConfidenceResult {
  completeness: number;       // [0.0, 1.0]
  freshness: number;          // [0.0, 1.0]
  confidence: number;         // [0.0, 1.0]
  deltaTimeMs: number;        // Elapsed milliseconds since last observation
  tauMs: number;              // Half-life decay constant in milliseconds
}

/**
 * Quality-driven data-gap alert triggered when confidence falls below the proposed threshold.
 */
export interface DataGapAlert {
  isAlertActive: boolean;
  threshold: number;
  reason: string | null;
  isProposedParameter: true;  // Explicitly marked as proposed framework parameter
}

/**
 * Score severity tier definition for early warning systems.
 */
export interface ScoreBand {
  label: string;
  minScore?: number;
  maxScore?: number;
  severity: 'normal' | 'low' | 'medium' | 'high' | 'unconfigured';
  description: string;
}

/**
 * Pluggable early warning scoring result.
 * Explicitly states if scoring configuration is absent or unconfigured.
 */
export interface EarlyWarningResult {
  status: 'unconfigured' | 'evaluated' | 'insufficient_data';
  scorerName: string;
  score: number | null;
  band: ScoreBand | null;
  parametersEvaluated: string[];
  clinicalSource: string;
  verificationNotice: string;
}

/**
 * Typed pluggable scorer interface for future clinical integration.
 */
export interface EarlyWarningScorer {
  readonly scorerName: string;
  readonly isConfigured: boolean;
  readonly clinicalSource: string;
  evaluate(observations: readonly MonitorObservation[]): EarlyWarningResult;
}

/**
 * User-configurable parameters for timeline evaluation, freshness, and data-gap alerts.
 */
export interface MonitorConfig {
  /**
   * Freshness exponential decay time constant τ in milliseconds.
   * Must be a strictly positive finite number.
   * Default: 14,400,000 ms (4 hours).
   */
  tauMs?: number;

  /**
   * Confidence threshold triggering a data-gap alert [0.0, 1.0].
   * Default: 0.60.
   */
  confidenceThreshold?: number;

  /**
   * Elapsed time threshold in milliseconds between adjacent observations
   * that constitutes an irregular timing gap.
   * Default: 21,600,000 ms (6 hours).
   */
  gapThresholdMs?: number;

  /**
   * Expected channels checked for telemetry completeness.
   * Default: ['channel1', 'channel2'].
   */
  expectedChannels?: (keyof ObservationValueMap)[];

  /**
   * Optional pluggable early-warning scorer.
   */
  earlyWarningScorer?: EarlyWarningScorer;
}

/**
 * Top-level view model for the Patient Monitor.
 * Provides pure, pre-calculated telemetry metadata ready for rendering.
 */
export interface PatientMonitorViewModel {
  selectedPatient: MonitorPatient | null;
  patientFound: boolean;
  timeline: MonitorObservation[];
  timelinePoints: MonitorTimelinePoint[];
  latestObservation: MonitorObservation | null;
  lastObservationAt: string | null;
  timeSinceLastObservationMs: number | null;
  confidenceResult: ConfidenceResult;
  dataGapAlert: DataGapAlert;
  earlyWarningResult: EarlyWarningResult;
  config: {
    tauMs: number;
    confidenceThreshold: number;
    gapThresholdMs: number;
    expectedChannels: (keyof ObservationValueMap)[];
    earlyWarningScorerStatus: string;
  };
  referenceTime: string;      // ISO timestamp used as reference "now"
  isSimulated: true;          // Explicit synthetic marker
  disclaimer: string;         // Safe harbor decision-support notice
}
