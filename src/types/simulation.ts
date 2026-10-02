/**
 * CareProof Audit Console - Simulation Domain Types
 * Single Source of Truth for Deterministic Synthetic Data Generation
 * 
 * All types in this file represent strictly SYNTHETIC entities.
 * No real personal health information (PHI), real patient identifiers,
 * real clinician names, or clinically validated outcomes are used.
 */

import { DiscreteBand } from './scoring';

export type PatientObservationStatus = 'active' | 'monitored' | 'discharged';

/**
 * Anonymized synthetic patient entity.
 * Uses structured synthetic identifiers (e.g. PAT-001) with zero PII.
 */
export interface SimulatedPatient {
  id: string;               // e.g. "PAT-001"
  label: string;            // e.g. "Synthetic Patient 001"
  observationProfile: string; // e.g. "Profile-Alpha", "Profile-Beta", "Telemetry-Standard"
  observationStart: string; // ISO 8601 deterministic timestamp
  status: PatientObservationStatus;
  isSimulated: true;
}

export type DeviceLifecycleStage = 'commissioned' | 'operational' | 'maintenance_due' | 'retired';
export type DeviceOperationalStatus = 'active' | 'standby' | 'alerting' | 'offline';

/**
 * Generic synthetic biomedical / environmental device entity.
 */
export interface SimulatedDevice {
  id: string;               // e.g. "DEV-001"
  deviceType: string;       // e.g. "Biometric Monitor", "Environmental Sensor", "Infusion System"
  lifecycleStage: DeviceLifecycleStage;
  status: DeviceOperationalStatus;
  nextMaintenance: string;  // ISO 8601 deterministic timestamp
  uptimePercent: number;    // e.g. 99.4
  alertCount: number;       // e.g. 2
  isSimulated: true;
}

export type CaregiverAssessmentStatus = 'verified' | 'pending_renewal' | 'expired';

/**
 * Generic synthetic caregiver entity for competency tracking demonstrations.
 */
export interface SimulatedCaregiver {
  id: string;               // e.g. "CG-001"
  roleId: string;           // e.g. "Caregiver-Level-1", "Caregiver-Level-2", "Clinical-Supervisor"
  competencyProfile: string;// e.g. "Competency-Standard", "Competency-Advanced"
  assessmentStatus: CaregiverAssessmentStatus;
  licenseExpires: string;   // ISO 8601 deterministic timestamp
  trainingCompletedPercent: number; // e.g. 95
  isSimulated: true;
}

export type SyntheticCohortCategory = 'Cohort-Standard' | 'Cohort-Experimental' | 'Control-Reference';

/**
 * Generic synthetic outcome entity for pilot study demonstrations.
 */
export interface SimulatedOutcome {
  id: string;               // e.g. "OUT-001"
  cohort: SyntheticCohortCategory;
  primaryMetricScore: number;   // Synthetic metric score (e.g. 82.5)
  secondaryMetricScore: number; // Synthetic metric score (e.g. 76.0)
  followupIntervalDays: number; // e.g. 30, 60, 90
  isCompleted: boolean;
  isSimulated: true;
}

/**
 * Generic numeric / categorical observation channels.
 * Intentionally avoids claiming specific medical variables.
 */
export interface ObservationValueMap {
  channel1?: number | null; // Synthetic numeric measurement A
  channel2?: number | null; // Synthetic numeric measurement B
  stateTag?: string | null; // Synthetic categorical status
}

/**
 * Generic synthetic patient observation record.
 */
export interface SimulatedObservation {
  id: string;               // e.g. "OBS-0001"
  patientId: string;        // e.g. "PAT-001"
  timestamp: string;        // ISO 8601 deterministic timestamp
  values: ObservationValueMap;
  completeness: 'complete' | 'partial' | 'sparse';
  hasTimingGap: boolean;    // Indicates an irregular interval preceding this observation
  isSimulated: true;
}

/**
 * Synthetic indicator assessment for scoring engine demonstrations.
 */
export interface SimulatedAuditAssessment {
  indicatorId: string;
  band: DiscreteBand;
  isSimulated: true;
}

/**
 * User-configurable parameters for deterministic data generation.
 */
export interface SimulationConfig {
  patientCount?: number;               // Default: 10
  observationCountPerPatient?: number; // Default: 6
  deviceCount?: number;                // Default: 8
  caregiverCount?: number;             // Default: 6
  outcomeCount?: number;               // Default: 12
  startTimestamp?: string;            // Default: "2026-01-01T00:00:00.000Z"
  observationGapProbability?: number;  // Default: 0.25 (25% chance of irregular interval)
  missingValueProbability?: number;    // Default: 0.15 (15% chance of missing optional channel)
}

/**
 * Top-level generated simulation dataset.
 * Guaranteed to be 100% serializable and tagged as SIMULATED.
 */
export interface SimulatedDataset {
  datasetType: 'SIMULATED';
  seed: number;
  generatedAt: string;
  config: Required<SimulationConfig>;
  patients: SimulatedPatient[];
  observations: SimulatedObservation[];
  devices: SimulatedDevice[];
  caregivers: SimulatedCaregiver[];
  outcomes: SimulatedOutcome[];
  simulatedAuditAssessments: Record<string, DiscreteBand>;
}
