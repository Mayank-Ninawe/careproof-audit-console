/**
 * CareProof Audit Console - Patient Monitor Pure Data & Logic Tests
 * Source of Truth: CareProof Website Roadmap (Phase 8A)
 * 
 * Verifies all 20 requirements:
 * 1. Patient list comes from simulated dataset.
 * 2. Unknown patient returns empty/not-found result.
 * 3. Timeline contains only selected patient's observations.
 * 4. Timeline ordering is deterministic.
 * 5. Existing timing gaps remain visible.
 * 6. Missing values remain missing.
 * 7. Completeness is calculated correctly.
 * 8. Freshness at Δt = 0 is correct.
 * 9. Freshness decreases as Δt increases.
 * 10. Invalid τ is rejected.
 * 11. Confidence equals completeness × freshness.
 * 12. Confidence remains deterministic.
 * 13. Below-threshold confidence triggers data-gap alert.
 * 14. At-threshold confidence does not trigger alert.
 * 15. Last observation metadata is correct.
 * 16. timeSinceLastObservation is deterministic for an explicit reference time.
 * 17. Dataset marked SIMULATED remains marked SIMULATED.
 * 18. No real patient identity fields are created.
 * 19. Unconfigured early-warning scorer is explicitly reported.
 * 20. No invented NEWS2 thresholds appear in the implementation.
 */

import { generateSimulatedDataset } from '../engine/simulate';
import {
  calculateConfidence,
  calculateFreshness,
  calculateObservationCompleteness,
  calculateTimelineCompleteness,
  createPatientMonitorViewModel,
  evaluateDataGapAlert,
  getMonitorPatients,
  getPatientTimeline,
  UnconfiguredEarlyWarningScorer,
  DEFAULT_TAU_MS,
  DEFAULT_CONFIDENCE_THRESHOLD,
} from '../services/monitor';
import { MonitorObservation } from '../types/monitor';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST ASSERTION FAILED: ${message}`);
  }
}

console.log('=== CareProof Patient Monitor Pure Logic Tests ===\n');

let passed = 0;
let total = 0;

function test(name: string, fn: () => void) {
  total++;
  try {
    fn();
    console.log(`✓ PASS: ${name}`);
    passed++;
  } catch (err: unknown) {
    console.error(`✗ FAIL: ${name}`);
    console.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}

// Generate deterministic synthetic dataset
const dataset = generateSimulatedDataset(42);
const explicitRefTime = '2026-01-02T12:00:00.000Z';

// 1. Patient list comes from simulated dataset
test('1. Patient list comes from simulated dataset', () => {
  const patients = getMonitorPatients(dataset);
  assert(patients.length === dataset.patients.length, 'All simulated patients returned');
  assert(patients.length > 0, 'Patients array is non-empty');
  assert(
    patients.every((p) => p.isSimulated === true),
    'Every patient carries isSimulated: true'
  );
  assert(patients[0].id === dataset.patients[0].id, 'Patient IDs match source dataset');
});

// 2. Unknown patient returns empty/not-found result
test('2. Unknown patient returns empty/not-found result', () => {
  const vm = createPatientMonitorViewModel(dataset, 'PAT-NONEXISTENT', {}, explicitRefTime);
  assert(vm.patientFound === false, 'patientFound is false for unknown patient');
  assert(vm.selectedPatient === null, 'selectedPatient is null');
  assert(vm.timeline.length === 0, 'timeline is empty');
  assert(vm.latestObservation === null, 'latestObservation is null');
  assert(vm.confidenceResult.confidence === 0, 'confidence is 0 for unknown patient');
});

// 3. Timeline contains only selected patient's observations
test("3. Timeline contains only selected patient's observations", () => {
  const patientId = dataset.patients[0].id;
  const timeline = getPatientTimeline(dataset, patientId);

  assert(timeline.length > 0, 'Timeline contains observations for patient');
  assert(
    timeline.every((obs) => obs.patientId === patientId),
    'Every observation strictly belongs to selected patient'
  );
});

// 4. Timeline ordering is deterministic
test('4. Timeline ordering is deterministic and non-decreasing', () => {
  const patientId = dataset.patients[0].id;
  const timeline1 = getPatientTimeline(dataset, patientId);
  const timeline2 = getPatientTimeline(dataset, patientId);

  assert(timeline1.length === timeline2.length, 'Timeline lengths match');
  for (let i = 0; i < timeline1.length; i++) {
    assert(timeline1[i].id === timeline2[i].id, `Observation ${i} IDs match`);
    assert(timeline1[i].timestamp === timeline2[i].timestamp, `Observation ${i} timestamps match`);
    if (i > 0) {
      assert(
        timeline1[i].timestampMs >= timeline1[i - 1].timestampMs,
        `Chronological order preserved between index ${i - 1} and ${i}`
      );
    }
  }
});

// 5. Existing timing gaps remain visible
test('5. Existing timing gaps remain visible without fake interpolation', () => {
  const patientWithGap = dataset.patients.find((p) => {
    const obs = dataset.observations.filter((o) => o.patientId === p.id);
    return obs.some((o) => o.hasTimingGap);
  });

  assert(Boolean(patientWithGap), 'Found patient with timing gaps in dataset');
  const timeline = getPatientTimeline(dataset, patientWithGap!.id);
  const gapObs = timeline.find((o) => o.hasTimingGap);

  assert(Boolean(gapObs), 'Timing gap preserved in timeline');
  assert(gapObs!.hasTimingGap === true, 'hasTimingGap is true');
  assert(gapObs!.gapDurationMs >= 0, 'gapDurationMs is recorded');
});

// 6. Missing values remain missing
test('6. Missing values remain missing without converting null to zero', () => {
  const obsWithMissing = dataset.observations.find(
    (o) => o.values.channel1 === null || o.values.channel2 === null
  );

  assert(Boolean(obsWithMissing), 'Found observation with missing values');
  const timeline = getPatientTimeline(dataset, obsWithMissing!.patientId);
  const matched = timeline.find((o) => o.id === obsWithMissing!.id);

  assert(Boolean(matched), 'Found observation in timeline');
  if (obsWithMissing!.values.channel1 === null) {
    assert(matched!.values.channel1 === null, 'channel1 null preserved as null');
  }
  if (obsWithMissing!.values.channel2 === null) {
    assert(matched!.values.channel2 === null, 'channel2 null preserved as null');
  }
});

// 7. Completeness is calculated correctly
test('7. Completeness is calculated correctly based on expected channels', () => {
  const completeObs: MonitorObservation = {
    id: 'TEST-1',
    patientId: 'PAT-TEST',
    timestamp: '2026-01-01T00:00:00.000Z',
    timestampMs: 0,
    values: { channel1: 42, channel2: 84 },
    completeness: 'complete',
    hasTimingGap: false,
    gapDurationMs: 0,
    isSimulated: true,
  };

  const partialObs: MonitorObservation = {
    ...completeObs,
    id: 'TEST-2',
    values: { channel1: 42, channel2: null },
  };

  const emptyObs: MonitorObservation = {
    ...completeObs,
    id: 'TEST-3',
    values: { channel1: null, channel2: null },
  };

  assert(calculateObservationCompleteness(completeObs, ['channel1', 'channel2']) === 1.0, 'Full completeness is 1.0');
  assert(calculateObservationCompleteness(partialObs, ['channel1', 'channel2']) === 0.5, 'Partial completeness is 0.5');
  assert(calculateObservationCompleteness(emptyObs, ['channel1', 'channel2']) === 0.0, 'Empty completeness is 0.0');

  const timelineCompleteness = calculateTimelineCompleteness([completeObs, partialObs], ['channel1', 'channel2']);
  assert(timelineCompleteness > 0 && timelineCompleteness < 1, 'Blended timeline completeness is between 0 and 1');
});

// 8. Freshness at Δt = 0 is correct
test('8. Freshness at Δt = 0 is exactly 1.0', () => {
  const freshness = calculateFreshness(0, DEFAULT_TAU_MS);
  assert(freshness === 1.0, 'Freshness at elapsed delta=0 is 1.0');
});

// 9. Freshness decreases as Δt increases
test('9. Freshness decreases as Δt increases according to exponential decay', () => {
  const tau = 10_000; // 10 seconds
  const f0 = calculateFreshness(0, tau);
  const f1 = calculateFreshness(5_000, tau);
  const f2 = calculateFreshness(10_000, tau);
  const f3 = calculateFreshness(20_000, tau);

  assert(f0 === 1.0, 'f0 is 1.0');
  assert(f1 < f0, 'f1 < f0');
  assert(f2 < f1, 'f2 < f1');
  assert(f3 < f2, 'f3 < f2');
  assert(Math.abs(f2 - Math.exp(-1)) < 0.0001, 'At Δt = τ, freshness equals exp(-1) ~ 0.3679');
});

// 10. Invalid τ is rejected
test('10. Invalid τ is rejected with explicit descriptive error', () => {
  let threwZero = false;
  try {
    calculateFreshness(1000, 0);
  } catch {
    threwZero = true;
  }
  assert(threwZero, 'tau = 0 throws error');

  let threwNegative = false;
  try {
    calculateFreshness(1000, -5000);
  } catch {
    threwNegative = true;
  }
  assert(threwNegative, 'tau < 0 throws error');
});

// 11. Confidence equals completeness × freshness
test('11. Confidence equals completeness × freshness', () => {
  const completeness = 0.8;
  const freshness = 0.5;
  const result = calculateConfidence(completeness, freshness, 1000, DEFAULT_TAU_MS);

  assert(Math.abs(result.confidence - 0.4) < 0.001, '0.8 * 0.5 = 0.4');
  assert(result.completeness === 0.8, 'Completeness preserved');
  assert(result.freshness === 0.5, 'Freshness preserved');
  assert(result.tauMs === DEFAULT_TAU_MS, 'tauMs preserved');
});

// 12. Confidence remains deterministic
test('12. Confidence remains deterministic across repeated calculations', () => {
  const res1 = calculateConfidence(0.75, 0.60, 5000, DEFAULT_TAU_MS);
  const res2 = calculateConfidence(0.75, 0.60, 5000, DEFAULT_TAU_MS);

  assert(res1.confidence === res2.confidence, 'Confidence is bit-for-bit identical');
  assert(res1.freshness === res2.freshness, 'Freshness is bit-for-bit identical');
});

// 13. Below-threshold confidence triggers data-gap alert
test('13. Below-threshold confidence triggers data-gap alert', () => {
  const alert = evaluateDataGapAlert(0.45, DEFAULT_CONFIDENCE_THRESHOLD);
  assert(alert.isAlertActive === true, 'Data-gap alert is active when confidence < threshold');
  assert(alert.reason !== null, 'Alert reason is populated');
  assert(alert.isProposedParameter === true, 'Marked as proposed parameter');
});

// 14. At-threshold confidence does not trigger alert
test('14. At-threshold confidence does not trigger alert', () => {
  const alertAt = evaluateDataGapAlert(DEFAULT_CONFIDENCE_THRESHOLD, DEFAULT_CONFIDENCE_THRESHOLD);
  assert(alertAt.isAlertActive === false, 'Alert inactive at exact threshold');
  assert(alertAt.reason === null, 'Alert reason is null');

  const alertAbove = evaluateDataGapAlert(0.85, DEFAULT_CONFIDENCE_THRESHOLD);
  assert(alertAbove.isAlertActive === false, 'Alert inactive above threshold');
});

// 15. Last observation metadata is correct
test('15. Last observation metadata is correct', () => {
  const patientId = dataset.patients[0].id;
  const vm = createPatientMonitorViewModel(dataset, patientId, {}, explicitRefTime);

  assert(vm.patientFound === true, 'Patient found');
  assert(vm.latestObservation !== null, 'Latest observation exists');
  assert(vm.lastObservationAt === vm.latestObservation!.timestamp, 'lastObservationAt matches latest timestamp');
});

// 16. timeSinceLastObservation is deterministic for an explicit reference time
test('16. timeSinceLastObservation is deterministic for an explicit reference time', () => {
  const patientId = dataset.patients[0].id;
  const vm1 = createPatientMonitorViewModel(dataset, patientId, {}, explicitRefTime);
  const vm2 = createPatientMonitorViewModel(dataset, patientId, {}, explicitRefTime);

  assert(
    vm1.timeSinceLastObservationMs === vm2.timeSinceLastObservationMs,
    'Elapsed time is deterministic'
  );
  assert(typeof vm1.timeSinceLastObservationMs === 'number', 'timeSinceLastObservationMs is numeric');
  assert(vm1.timeSinceLastObservationMs! >= 0, 'timeSinceLastObservationMs is non-negative');
});

// 17. Dataset marked SIMULATED remains marked SIMULATED
test('17. Dataset marked SIMULATED remains marked SIMULATED in view model', () => {
  const patientId = dataset.patients[0].id;
  const vm = createPatientMonitorViewModel(dataset, patientId, {}, explicitRefTime);

  assert(vm.isSimulated === true, 'ViewModel has isSimulated: true');
  assert(vm.selectedPatient?.isSimulated === true, 'Selected patient has isSimulated: true');
  assert(vm.timeline.every((o) => o.isSimulated === true), 'Every timeline item has isSimulated: true');
});

// 18. No real patient identity fields are created
test('18. No real patient identity fields are created', () => {
  const patientId = dataset.patients[0].id;
  const vm = createPatientMonitorViewModel(dataset, patientId, {}, explicitRefTime);

  const serialized = JSON.stringify(vm).toLowerCase();
  const forbiddenPiiTerms = ['ssn', 'socialsecurity', 'mrn', 'dob', 'birthdate', 'address', 'phone', 'fullname'];

  for (const term of forbiddenPiiTerms) {
    assert(!serialized.includes(`"${term}"`), `ViewModel does not expose real PII field "${term}"`);
  }
});

// 19. Unconfigured early-warning scorer is explicitly reported
test('19. Unconfigured early-warning scorer is explicitly reported', () => {
  const patientId = dataset.patients[0].id;
  const vm = createPatientMonitorViewModel(dataset, patientId, {}, explicitRefTime);

  assert(vm.earlyWarningResult.status === 'unconfigured', 'Early warning status is unconfigured');
  assert(
    vm.earlyWarningResult.clinicalSource.includes('Royal College of Physicians'),
    'Cites Royal College of Physicians source'
  );
  assert(
    vm.earlyWarningResult.verificationNotice.includes('unconfigured pending independent verification'),
    'Includes verification notice'
  );
  assert(vm.config.earlyWarningScorerStatus === 'unconfigured', 'Scorer status is unconfigured');
});

// 20. No invented NEWS2 thresholds appear in the implementation
test('20. No invented NEWS2 thresholds appear in the implementation', () => {
  const defaultScorer = new UnconfiguredEarlyWarningScorer();
  const result = defaultScorer.evaluate([]);

  assert(result.score === null, 'Score is strictly null');
  assert(result.band === null, 'Band is strictly null');
  assert(result.parametersEvaluated.length === 0, 'No fabricated parameters evaluated');
});

console.log(`\nResults: ${passed} of ${total} patient monitor logic tests passed.`);
if (passed !== total) {
  process.exit(1);
}
