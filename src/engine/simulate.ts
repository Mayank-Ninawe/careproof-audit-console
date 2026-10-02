/**
 * CareProof Audit Console - Deterministic Seeded Simulation Engine
 * Source of Truth: CareProof Website Roadmap (Phase 4A)
 * 
 * CORE PRINCIPLES:
 * 1. Strictly Deterministic: Same seed + same config produces bit-for-bit identical datasets.
 * 2. Pure & Side-Effect Free: No React, no Firebase, no DOM, no localStorage.
 * 3. Zero Non-Deterministic APIs: Math.random(), Date.now(), and crypto randomness are FORBIDDEN.
 * 4. Synthetic Integrity: Anonymized synthetic labels only; no real PII, medical claims, or MRNs.
 * 5. Explicit Incompleteness: Missing telemetry channels are represented as null/omitted, never as zero.
 * 6. Explicit Simulation Tag: Every record carries `isSimulated: true`, and the dataset is marked `SIMULATED`.
 */

import {
  CaregiverAssessmentStatus,
  DeviceLifecycleStage,
  DeviceOperationalStatus,
  ObservationValueMap,
  PatientObservationStatus,
  SimulatedCaregiver,
  SimulatedDataset,
  SimulatedDevice,
  SimulatedObservation,
  SimulatedOutcome,
  SimulatedPatient,
  SimulationConfig,
  SyntheticCohortCategory,
} from '../types/simulation';
import { DiscreteBand } from '../types/scoring';

/**
 * Pure 32-bit Seeded Pseudo-Random Number Generator (Mulberry32).
 * Completely deterministic and isolated from system entropy.
 */
export class SeededRng {
  private state: number;

  constructor(seed: number) {
    if (!Number.isFinite(seed) || Math.floor(seed) !== seed) {
      throw new Error(`Simulation seed must be a finite integer, received: ${seed}`);
    }
    this.state = seed >>> 0;
  }

  /**
   * Produces a pseudo-random floating point number in [0, 1).
   */
  nextFloat(): number {
    this.state = (this.state + 0x6D2B79F5) >>> 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Produces a pseudo-random integer in [min, max] inclusive.
   */
  nextInt(min: number, max: number): number {
    if (min > max) {
      throw new Error(`Invalid range: min (${min}) cannot exceed max (${max})`);
    }
    return Math.floor(this.nextFloat() * (max - min + 1)) + min;
  }

  /**
   * Selects a single element from a non-empty array.
   */
  pick<T>(items: readonly T[]): T {
    if (!items || items.length === 0) {
      throw new Error('Cannot pick from an empty collection');
    }
    return items[Math.floor(this.nextFloat() * items.length)];
  }

  /**
   * Evaluates a boolean flag with a given probability of being true.
   */
  nextBool(probability = 0.5): boolean {
    return this.nextFloat() < probability;
  }

  /**
   * Produces a rounded floating point number in [min, max] with specified decimal places.
   */
  nextRoundedFloat(min: number, max: number, decimals = 1): number {
    const raw = min + this.nextFloat() * (max - min);
    const factor = Math.pow(10, decimals);
    return Math.round(raw * factor) / factor;
  }
}

/**
 * Default simulation configuration.
 */
export const DEFAULT_SIMULATION_CONFIG: Required<SimulationConfig> = {
  patientCount: 10,
  observationCountPerPatient: 6,
  deviceCount: 8,
  caregiverCount: 6,
  outcomeCount: 12,
  startTimestamp: '2026-01-01T00:00:00.000Z',
  observationGapProbability: 0.25,
  missingValueProbability: 0.15,
};

// Canonical 20 indicator IDs matching CareProof standard
const CANONICAL_INDICATOR_IDS: readonly string[] = [
  'CSP-01', 'CSP-02', 'CSP-03', 'CSP-04',
  'CSW-01', 'CSW-02', 'CSW-03', 'CSW-04',
  'EEH-01', 'EEH-02', 'EEH-03', 'EEH-04',
  'PMI-01', 'PMI-02', 'PMI-03', 'PMI-04',
  'CGE-01', 'CGE-02', 'CGE-03', 'CGE-04',
];

const OBSERVATION_PROFILES = ['Profile-Alpha', 'Profile-Beta', 'Telemetry-Standard', 'High-Acuity-Track'] as const;
const PATIENT_STATUSES: readonly PatientObservationStatus[] = ['active', 'monitored', 'discharged'];

const DEVICE_TYPES = ['Biometric Telemetry Hub', 'Environmental Air Sensor', 'Infusion Delivery Unit', 'Bed Alert Monitor'] as const;
const DEVICE_LIFECYCLE_STAGES: readonly DeviceLifecycleStage[] = ['commissioned', 'operational', 'maintenance_due', 'retired'];
const DEVICE_STATUSES: readonly DeviceOperationalStatus[] = ['active', 'standby', 'alerting', 'offline'];

const CAREGIVER_ROLES = ['Caregiver-Level-1', 'Caregiver-Level-2', 'Clinical-Supervisor', 'Telemetry-Technician'] as const;
const CAREGIVER_PROFILES = ['Competency-Standard', 'Competency-Advanced', 'Provisional-Review'] as const;
const CAREGIVER_ASSESSMENT_STATUSES: readonly CaregiverAssessmentStatus[] = ['verified', 'pending_renewal', 'expired'];

const OUTCOME_COHORTS: readonly SyntheticCohortCategory[] = ['Cohort-Standard', 'Cohort-Experimental', 'Control-Reference'];

/**
 * Validates and merges user configuration with defaults.
 * Fails safely with clear errors for corrupt inputs.
 */
export function validateAndMergeConfig(config?: SimulationConfig): Required<SimulationConfig> {
  const merged: Required<SimulationConfig> = {
    ...DEFAULT_SIMULATION_CONFIG,
    ...config,
  };

  const countKeys: (keyof SimulationConfig)[] = [
    'patientCount',
    'observationCountPerPatient',
    'deviceCount',
    'caregiverCount',
    'outcomeCount',
  ];

  for (const key of countKeys) {
    const val = merged[key] as number;
    if (typeof val !== 'number' || !Number.isFinite(val) || Math.floor(val) !== val || val <= 0) {
      throw new Error(`Simulation config error: "${key}" must be a positive integer, got ${val}`);
    }
  }

  if (isNaN(Date.parse(merged.startTimestamp))) {
    throw new Error(`Simulation config error: "startTimestamp" must be a valid ISO-8601 date string, got "${merged.startTimestamp}"`);
  }

  if (
    typeof merged.observationGapProbability !== 'number' ||
    merged.observationGapProbability < 0 ||
    merged.observationGapProbability > 1
  ) {
    throw new Error(`Simulation config error: "observationGapProbability" must be between 0 and 1, got ${merged.observationGapProbability}`);
  }

  if (
    typeof merged.missingValueProbability !== 'number' ||
    merged.missingValueProbability < 0 ||
    merged.missingValueProbability > 1
  ) {
    throw new Error(`Simulation config error: "missingValueProbability" must be between 0 and 1, got ${merged.missingValueProbability}`);
  }

  return merged;
}

/**
 * Pads a numeric identifier with leading zeros (e.g. padId('PAT', 1, 3) => 'PAT-001').
 */
function formatSyntheticId(prefix: string, index: number, digits = 3): string {
  return `${prefix}-${String(index).padStart(digits, '0')}`;
}

/**
 * Deterministically generates simulated patient entities.
 */
function generateSimulatedPatients(
  count: number,
  baseEpochMs: number,
  rng: SeededRng
): SimulatedPatient[] {
  const patients: SimulatedPatient[] = [];

  for (let i = 1; i <= count; i++) {
    const id = formatSyntheticId('PAT', i, 3);
    const startOffsetHours = rng.nextInt(0, 72);
    const observationStart = new Date(baseEpochMs + startOffsetHours * 3600000).toISOString();

    patients.push({
      id,
      label: `Synthetic Patient ${String(i).padStart(3, '0')}`,
      observationProfile: rng.pick(OBSERVATION_PROFILES),
      observationStart,
      status: rng.pick(PATIENT_STATUSES),
      isSimulated: true,
    });
  }

  return patients;
}

/**
 * Deterministically generates irregular observation records for simulated patients.
 * Intentionally models timing gaps and missing channel values without fabricating medical data.
 */
function generateSimulatedObservations(
  patients: SimulatedPatient[],
  countPerPatient: number,
  gapProbability: number,
  missingProbability: number,
  rng: SeededRng
): SimulatedObservation[] {
  const observations: SimulatedObservation[] = [];
  let globalObsCounter = 1;

  for (const patient of patients) {
    let currentEpoch = Date.parse(patient.observationStart);

    for (let j = 0; j < countPerPatient; j++) {
      const hasTimingGap = j > 0 && rng.nextBool(gapProbability);

      // Irregular observation timing: normal interval (4 hours) vs delayed interval (12-36 hours)
      const intervalHours = hasTimingGap ? rng.nextInt(12, 36) : 4;
      currentEpoch += intervalHours * 3600000;

      const timestamp = new Date(currentEpoch).toISOString();

      // Channel completeness modeling
      const hasChannel1 = !rng.nextBool(missingProbability);
      const hasChannel2 = !rng.nextBool(missingProbability);

      const values: ObservationValueMap = {};
      if (hasChannel1) {
        values.channel1 = rng.nextRoundedFloat(60.0, 100.0, 1);
      } else {
        values.channel1 = null;
      }

      if (hasChannel2) {
        values.channel2 = rng.nextRoundedFloat(10.0, 30.0, 1);
      } else {
        values.channel2 = null;
      }

      values.stateTag = rng.nextBool(0.15) ? 'Flagged-Telemetry' : 'Nominal';

      let completeness: 'complete' | 'partial' | 'sparse' = 'complete';
      if (!hasChannel1 && !hasChannel2) {
        completeness = 'sparse';
      } else if (!hasChannel1 || !hasChannel2) {
        completeness = 'partial';
      }

      observations.push({
        id: formatSyntheticId('OBS', globalObsCounter++, 4),
        patientId: patient.id,
        timestamp,
        values,
        completeness,
        hasTimingGap,
        isSimulated: true,
      });
    }
  }

  return observations;
}

/**
 * Deterministically generates simulated equipment devices.
 */
function generateSimulatedDevices(
  count: number,
  baseEpochMs: number,
  rng: SeededRng
): SimulatedDevice[] {
  const devices: SimulatedDevice[] = [];

  for (let i = 1; i <= count; i++) {
    const id = formatSyntheticId('DEV', i, 3);
    const maintenanceDaysAhead = rng.nextInt(7, 90);
    const nextMaintenance = new Date(baseEpochMs + maintenanceDaysAhead * 86400000).toISOString();

    devices.push({
      id,
      deviceType: rng.pick(DEVICE_TYPES),
      lifecycleStage: rng.pick(DEVICE_LIFECYCLE_STAGES),
      status: rng.pick(DEVICE_STATUSES),
      nextMaintenance,
      uptimePercent: rng.nextRoundedFloat(92.0, 100.0, 1),
      alertCount: rng.nextInt(0, 5),
      isSimulated: true,
    });
  }

  return devices;
}

/**
 * Deterministically generates simulated caregiver records.
 */
function generateSimulatedCaregivers(
  count: number,
  baseEpochMs: number,
  rng: SeededRng
): SimulatedCaregiver[] {
  const caregivers: SimulatedCaregiver[] = [];

  for (let i = 1; i <= count; i++) {
    const id = formatSyntheticId('CG', i, 3);
    const expiryDaysAhead = rng.nextInt(30, 365);
    const licenseExpires = new Date(baseEpochMs + expiryDaysAhead * 86400000).toISOString();

    caregivers.push({
      id,
      roleId: rng.pick(CAREGIVER_ROLES),
      competencyProfile: rng.pick(CAREGIVER_PROFILES),
      assessmentStatus: rng.pick(CAREGIVER_ASSESSMENT_STATUSES),
      licenseExpires,
      trainingCompletedPercent: rng.nextInt(80, 100),
      isSimulated: true,
    });
  }

  return caregivers;
}

/**
 * Deterministically generates simulated outcome records for pilot study demonstrations.
 */
function generateSimulatedOutcomes(
  count: number,
  rng: SeededRng
): SimulatedOutcome[] {
  const outcomes: SimulatedOutcome[] = [];

  for (let i = 1; i <= count; i++) {
    const id = formatSyntheticId('OUT', i, 3);
    const intervals = [30, 60, 90, 180] as const;

    outcomes.push({
      id,
      cohort: rng.pick(OUTCOME_COHORTS),
      primaryMetricScore: rng.nextRoundedFloat(55.0, 98.0, 1),
      secondaryMetricScore: rng.nextRoundedFloat(50.0, 95.0, 1),
      followupIntervalDays: rng.pick(intervals),
      isCompleted: rng.nextBool(0.85),
      isSimulated: true,
    });
  }

  return outcomes;
}

/**
 * Generates synthetic indicator assessments for integration with the CareProof scoring engine.
 * Assigns valid discrete bands ('Meets', 'Partial', 'Fails') without modifying the standard.
 */
function generateSimulatedAuditAssessments(rng: SeededRng): Record<string, DiscreteBand> {
  const assessments: Record<string, DiscreteBand> = {};

  for (const indicatorId of CANONICAL_INDICATOR_IDS) {
    // 70% Meets, 20% Partial, 10% Fails distribution for realistic simulated testing
    const roll = rng.nextFloat();
    if (roll < 0.70) {
      assessments[indicatorId] = 'Meets';
    } else if (roll < 0.90) {
      assessments[indicatorId] = 'Partial';
    } else {
      assessments[indicatorId] = 'Fails';
    }
  }

  return assessments;
}

/**
 * Main Pure Simulation Entrypoint.
 * 
 * Generates a complete, reproducible, strongly-typed synthetic dataset.
 * Guaranteed: same seed + same config = exactly identical output.
 */
export function generateSimulation(seed: number, config?: SimulationConfig): SimulatedDataset {
  const validConfig = validateAndMergeConfig(config);
  const rng = new SeededRng(seed);
  const baseEpochMs = Date.parse(validConfig.startTimestamp);

  const patients = generateSimulatedPatients(validConfig.patientCount, baseEpochMs, rng);
  const observations = generateSimulatedObservations(
    patients,
    validConfig.observationCountPerPatient,
    validConfig.observationGapProbability,
    validConfig.missingValueProbability,
    rng
  );
  const devices = generateSimulatedDevices(validConfig.deviceCount, baseEpochMs, rng);
  const caregivers = generateSimulatedCaregivers(validConfig.caregiverCount, baseEpochMs, rng);
  const outcomes = generateSimulatedOutcomes(validConfig.outcomeCount, rng);
  const simulatedAuditAssessments = generateSimulatedAuditAssessments(rng);

  return {
    datasetType: 'SIMULATED',
    seed,
    generatedAt: validConfig.startTimestamp,
    config: validConfig,
    patients,
    observations,
    devices,
    caregivers,
    outcomes,
    simulatedAuditAssessments,
  };
}

export const generateSimulatedDataset = generateSimulation;
