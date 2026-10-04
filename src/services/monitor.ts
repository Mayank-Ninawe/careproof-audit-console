/**
 * CareProof Audit Console - Patient Monitor Pure Data & Logic Service
 * Source of Truth: CareProof Website Roadmap (Phase 8A)
 * 
 * ARCHITECTURAL CONTRACT:
 * 1. Pure & Side-Effect Free: Zero React, DOM, or Firebase dependencies.
 * 2. Deterministic: All time calculations accept an explicit reference time. Zero hidden Date.now().
 * 3. Clinical Integrity:
 *    - No fabricated continuous lines across data gaps.
 *    - Freshness: freshness = exp(−Δt / τ)
 *    - Confidence: confidence = completeness × freshness
 *    - Data-gap alert when confidence < threshold.
 * 4. RCP NEWS2 Policy:
 *    - Unverified clinical thresholds are NEVER invented.
 *    - EarlyWarningScorer reports "not_configured" pending official RCP verification.
 * 5. Safe Harbor:
 *    - "Proposed framework, not clinically validated. Decision support, not diagnosis."
 */

import { ObservationValueMap, SimulatedDataset } from '../types/simulation';
import {
  ConfidenceResult,
  DataGapAlert,
  EarlyWarningResult,
  EarlyWarningScorer,
  MonitorConfig,
  MonitorObservation,
  MonitorPatient,
  MonitorTimelinePoint,
  PatientMonitorViewModel,
  ScoreBandConfiguration,
} from '../types/monitor';

export const DEFAULT_TAU_MS = 14_400_000; // 4 hours in milliseconds
export const DEFAULT_CONFIDENCE_THRESHOLD = 0.60; // 60% proposed confidence threshold
export const DEFAULT_GAP_THRESHOLD_MS = 21_600_000; // 6 hours in milliseconds
export const DEFAULT_EXPECTED_CHANNELS: (keyof ObservationValueMap)[] = ['channel1', 'channel2'];

export const CLINICAL_SAFE_HARBOR_DISCLAIMER =
  'Proposed framework, not clinically validated. Decision support, not diagnosis.';

/**
 * Standard unconfigured scorer adhering strictly to the Royal College of Physicians clinical rule.
 * Explicitly states that NEWS2 scoring is unconfigured pending verified source data.
 */
export class UnconfiguredEarlyWarningScorer implements EarlyWarningScorer {
  readonly scorerName = 'NEWS2 (National Early Warning Score)';
  readonly isConfigured = false;
  readonly clinicalSource = 'Royal College of Physicians (RCP) NHS NEWS2 Guidance';

  evaluate(_observations: readonly MonitorObservation[]): EarlyWarningResult {
    return {
      status: 'not_configured',
      scorerName: this.scorerName,
      score: null,
      band: null,
      parametersEvaluated: [],
      clinicalSource: this.clinicalSource,
      verificationNotice:
        'Clinical NEWS2 scoring remains unconfigured pending independent verification against official Royal College of Physicians specifications. No approximated thresholds are used.',
    };
  }
}

/**
 * Normalizes an arbitrary reference time input into epoch milliseconds.
 * Throws an Error if referenceTime is invalid or absent.
 */
export function normalizeReferenceTime(referenceTime?: Date | string | number): number {
  if (referenceTime === undefined || referenceTime === null) {
    throw new Error(
      'Explicit referenceTime is required for deterministic calculation. Provide a Date, ISO string, or epoch milliseconds.'
    );
  }

  let ms: number;
  if (typeof referenceTime === 'number') {
    ms = referenceTime;
  } else if (typeof referenceTime === 'string') {
    ms = Date.parse(referenceTime);
  } else if (referenceTime instanceof Date) {
    ms = referenceTime.getTime();
  } else {
    throw new Error('Invalid referenceTime format: expected Date, string, or number');
  }

  if (!Number.isFinite(ms) || Number.isNaN(ms)) {
    throw new Error(`Invalid referenceTime value: ${referenceTime}`);
  }

  return ms;
}

/**
 * Derives available simulated patients from the synthetic dataset.
 * Does not mutate the source dataset.
 */
export function getMonitorPatients(dataset: SimulatedDataset): MonitorPatient[] {
  if (!dataset || !Array.isArray(dataset.patients)) {
    return [];
  }

  return dataset.patients
    .filter((p) => p && typeof p === 'object' && typeof p.id === 'string' && p.id.trim().length > 0)
    .map((p) => ({
      id: p.id,
      label: p.label ?? `Patient ${p.id}`,
      observationProfile: p.observationProfile ?? 'Standard',
      status: p.status ?? 'active',
      isSimulated: true,
    }));
}

/**
 * Derives ordered observations for a single patient.
 * Ensures strict chronological sorting and preserves data gaps without artificial interpolation.
 */
export function getPatientTimeline(
  dataset: SimulatedDataset,
  patientId: string,
  gapThresholdMs: number = DEFAULT_GAP_THRESHOLD_MS
): MonitorObservation[] {
  if (!dataset || !Array.isArray(dataset.observations) || !patientId || typeof patientId !== 'string') {
    return [];
  }

  // Filter observations strictly belonging to the specified patient
  const matching = dataset.observations.filter((obs) => obs && obs.patientId === patientId);
  if (matching.length === 0) {
    return [];
  }

  // Parse timestamps and sort chronologically (stable secondary sort by ID)
  const sorted = matching
    .map((obs) => {
      const timestampMs = Date.parse(obs.timestamp);
      if (!Number.isFinite(timestampMs) || Number.isNaN(timestampMs)) {
        throw new Error(`Invalid observation timestamp: "${obs.timestamp}" on observation ${obs.id}`);
      }
      return {
        ...obs,
        timestampMs,
      };
    })
    .sort((a, b) => {
      const diff = a.timestampMs - b.timestampMs;
      return diff !== 0 ? diff : a.id.localeCompare(b.id);
    });

  // Compute timing gaps relative to adjacent observations without synthetic interpolation
  return sorted.map((obs, idx) => {
    let gapDurationMs = 0;
    let hasTimingGap = obs.hasTimingGap ?? false;

    if (idx > 0) {
      const prevMs = sorted[idx - 1].timestampMs;
      gapDurationMs = Math.max(0, obs.timestampMs - prevMs);
      if (gapDurationMs >= gapThresholdMs) {
        hasTimingGap = true;
      }
    }

    return {
      id: obs.id,
      patientId: obs.patientId,
      timestamp: obs.timestamp,
      timestampMs: obs.timestampMs,
      values: { ...obs.values },
      completeness: obs.completeness,
      hasTimingGap,
      gapDurationMs,
      isSimulated: true,
    };
  });
}

/**
 * Calculates field completeness for an individual observation.
 * Concept: observed expected fields / expected fields.
 * Safe against empty expected fields (returns 1.0).
 */
export function calculateObservationCompleteness(
  observation: MonitorObservation,
  expectedChannels: (keyof ObservationValueMap)[] = DEFAULT_EXPECTED_CHANNELS
): number {
  if (!expectedChannels || expectedChannels.length === 0) {
    return 1.0;
  }

  let presentCount = 0;
  for (const channel of expectedChannels) {
    const val = observation.values?.[channel];
    if (val !== undefined && val !== null) {
      presentCount++;
    }
  }

  return presentCount / expectedChannels.length;
}

/**
 * Calculates overall telemetry completeness for a patient's timeline.
 * Does not assume missing values mean clinical failure (Missing ≠ Abnormal).
 * Intermediate calculations are not rounded.
 */
export function calculateTimelineCompleteness(
  observations: readonly MonitorObservation[],
  expectedChannels: (keyof ObservationValueMap)[] = DEFAULT_EXPECTED_CHANNELS
): number {
  if (!observations || observations.length === 0) {
    return 0.0;
  }

  // Evaluates completeness on the latest observation, averaged with historical observations
  const latest = observations[observations.length - 1];
  const latestRatio = calculateObservationCompleteness(latest, expectedChannels);

  // Calculate average across all timeline observations
  let totalRatio = 0;
  for (const obs of observations) {
    totalRatio += calculateObservationCompleteness(obs, expectedChannels);
  }
  const averageRatio = totalRatio / observations.length;

  // Blends latest observation (60%) with historical average (40%) without premature rounding
  return Math.max(0.0, Math.min(1.0, latestRatio * 0.6 + averageRatio * 0.4));
}

/**
 * Calculates telemetry freshness using negative exponential decay:
 * freshness = exp(−Δt / τ)
 * 
 * Rules:
 * - τ must be explicitly supplied and strictly positive.
 * - τ <= 0 or non-finite must be rejected with an Error.
 * - Negative Δt (future timestamps) clamped safely to 0 without throwing.
 * - Intermediate calculations not rounded.
 */
export function calculateFreshness(deltaMs: number, tauMs: number): number {
  if (!Number.isFinite(tauMs) || tauMs <= 0) {
    throw new Error(`Invalid tau constant: tauMs must be a positive finite number, received ${tauMs}`);
  }

  if (!Number.isFinite(deltaMs)) {
    throw new Error(`Invalid deltaMs: must be a finite number, received ${deltaMs}`);
  }

  // Safe handling: future timestamp clamped to elapsed delta = 0
  const effectiveDelta = Math.max(0, deltaMs);
  const freshness = Math.exp(-effectiveDelta / tauMs);

  return Math.max(0.0, Math.min(1.0, freshness));
}

/**
 * Computes telemetry confidence:
 * confidence = completeness × freshness
 * Returns normalized numeric result without premature rounding or UI formatting.
 */
export function calculateConfidence(
  completeness: number,
  freshness: number,
  deltaMs: number,
  tauMs: number
): ConfidenceResult {
  const normCompleteness = Math.max(0.0, Math.min(1.0, completeness));
  const normFreshness = Math.max(0.0, Math.min(1.0, freshness));
  const confidence = Math.max(0.0, Math.min(1.0, normCompleteness * normFreshness));
  const effectiveDelta = Math.max(0, deltaMs);

  return {
    completeness: normCompleteness,
    freshness: normFreshness,
    confidence,
    deltaTime: effectiveDelta,
    deltaTimeMs: effectiveDelta,
    tau: tauMs,
    tauMs,
  };
}

/**
 * Evaluates whether a quality data-gap alert should be activated based on confidence.
 * Threshold is explicitly exposed and treated as a proposed application parameter.
 */
export function evaluateDataGapAlert(
  confidence: number,
  threshold: number = DEFAULT_CONFIDENCE_THRESHOLD
): DataGapAlert {
  const isAlertActive = confidence < threshold;

  return {
    isAlertActive,
    threshold,
    reason: isAlertActive
      ? 'Confidence reduced because observation data are incomplete and/or stale.'
      : null,
    isProposedParameter: true,
  };
}

/**
 * Derives rich timeline points preserving irregular timing gaps without synthetic interpolation.
 */
export function createTimelinePoints(
  timeline: readonly MonitorObservation[],
  expectedChannels: (keyof ObservationValueMap)[] = DEFAULT_EXPECTED_CHANNELS
): MonitorTimelinePoint[] {
  return timeline.map((obs) => ({
    observation: obs,
    isGapPreceding: obs.hasTimingGap,
    gapDurationMs: obs.gapDurationMs,
    completenessRatio: calculateObservationCompleteness(obs, expectedChannels),
  }));
}

/**
 * Pure primary adapter function creating the Patient Monitor view model.
 * 
 * @param dataset The synthetic simulation dataset.
 * @param patientId The target synthetic patient ID.
 * @param config Optional monitor configurations (tauMs, thresholds, expected channels, scorer).
 * @param referenceTime Explicit reference timestamp representing "now" (mandatory for deterministic execution).
 */
export function createPatientMonitorViewModel(
  dataset: SimulatedDataset,
  patientId: string,
  config?: MonitorConfig,
  referenceTime?: Date | string | number
): PatientMonitorViewModel {
  const tauMs = config?.tauMs ?? config?.tau ?? DEFAULT_TAU_MS;
  const confidenceThreshold = config?.confidenceThreshold ?? DEFAULT_CONFIDENCE_THRESHOLD;
  const gapThresholdMs = config?.gapThresholdMs ?? DEFAULT_GAP_THRESHOLD_MS;
  const expectedChannels = config?.expectedChannels ?? DEFAULT_EXPECTED_CHANNELS;
  const scorer = config?.earlyWarningScorer ?? new UnconfiguredEarlyWarningScorer();

  // Validate tau
  if (!Number.isFinite(tauMs) || tauMs <= 0) {
    throw new Error(`Invalid tau constant: must be a positive finite number, received ${tauMs}`);
  }

  // Resolve explicit reference time (zero hidden Date.now())
  const refTimeMs = referenceTime !== undefined
    ? normalizeReferenceTime(referenceTime)
    : Date.parse(dataset.generatedAt);

  const referenceTimeIso = new Date(refTimeMs).toISOString();

  // 1. Find patient
  const rawPatient = dataset.patients?.find((p) => p.id === patientId);
  const patientFound = Boolean(rawPatient);

  const selectedPatient: MonitorPatient | null = rawPatient
    ? {
        id: rawPatient.id,
        label: rawPatient.label,
        observationProfile: rawPatient.observationProfile,
        status: rawPatient.status,
        isSimulated: true,
      }
    : null;

  // 2. Derive timeline
  const timeline = patientFound
    ? getPatientTimeline(dataset, patientId, gapThresholdMs)
    : [];

  const timelinePoints = createTimelinePoints(timeline, expectedChannels);

  // 3. Latest observation & elapsed time
  const latestObservation = timeline.length > 0 ? timeline[timeline.length - 1] : null;
  const lastObservationAt = latestObservation ? latestObservation.timestamp : null;
  const timeSinceLastObservationMs = latestObservation
    ? Math.max(0, refTimeMs - latestObservation.timestampMs)
    : null;

  // 4. Mathematical freshness, completeness, confidence
  let completeness = 0.0;
  let freshness = 0.0;

  if (latestObservation && timeSinceLastObservationMs !== null) {
    completeness = calculateTimelineCompleteness(timeline, expectedChannels);
    freshness = calculateFreshness(timeSinceLastObservationMs, tauMs);
  }

  const confidenceResult = calculateConfidence(
    completeness,
    freshness,
    timeSinceLastObservationMs ?? 0,
    tauMs
  );

  // 5. Data-gap alert
  const dataGapAlertDetails = evaluateDataGapAlert(confidenceResult.confidence, confidenceThreshold);

  // 6. Early-warning scorer result (unconfigured pending RCP verification)
  const earlyWarningResult = scorer.evaluate(timeline);

  // 7. Typed Score Band Configuration (unconfigured)
  const scoreBandConfiguration: ScoreBandConfiguration = {
    status: 'not_configured',
    bands: null,
    clinicalSource: null,
  };

  return {
    selectedPatient,
    patientFound,
    orderedObservations: timeline,
    timeline,
    timelinePoints,
    latestObservation,
    lastObservationAt,
    timeSinceLastObservation: timeSinceLastObservationMs,
    timeSinceLastObservationMs,
    completeness: confidenceResult.completeness,
    freshness: confidenceResult.freshness,
    confidence: confidenceResult.confidence,
    confidenceThreshold,
    confidenceResult,
    dataGapAlert: dataGapAlertDetails.isAlertActive,
    dataGapAlertDetails,
    dataGapReason: dataGapAlertDetails.reason,
    earlyWarningResult,
    scoreConfigurationStatus: scorer.isConfigured ? 'configured' : 'not_configured',
    scoreBandConfiguration,
    config: {
      tauMs,
      confidenceThreshold,
      gapThresholdMs,
      expectedChannels,
      earlyWarningScorerStatus: scorer.isConfigured ? 'configured' : 'unconfigured',
    },
    referenceTime: referenceTimeIso,
    isSimulated: true,
    disclaimer: CLINICAL_SAFE_HARBOR_DISCLAIMER,
  };
}
