/**
 * CareProof Audit Console - Patient Monitor Pure Data & Logic Tests
 * Source of Truth: CareProof Website Roadmap (Phase 8A)
 * 
 * Verifies all 24 Section 22 requirements:
 * 1. patient list comes from the simulation dataset
 * 2. patient ordering is deterministic
 * 3. unknown patient returns not-found/empty state
 * 4. timeline contains only selected patient's observations
 * 5. timeline ordering is deterministic
 * 6. timing gaps remain preserved
 * 7. missing values remain missing
 * 8. completeness calculation is correct
 * 9. completeness handles zero expected fields safely
 * 10. freshness at deltaTime = 0 is correct
 * 11. freshness decreases as deltaTime increases
 * 12. invalid tau is rejected
 * 13. confidence equals completeness × freshness
 * 14. confidence remains deterministic
 * 15. confidence below threshold triggers data-gap alert
 * 16. confidence exactly at threshold does not trigger alert
 * 17. last observation timestamp is correct
 * 18. timeSinceLastObservation uses the explicit reference time
 * 19. simulated dataset metadata remains SIMULATED
 * 20. no real-person identity fields are generated
 * 21. unconfigured early-warning scorer is reported correctly
 * 22. no invented NEWS2 thresholds are introduced
 * 23. same inputs produce identical outputs
 * 24. changing reference time changes freshness/confidence deterministically
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

console.log('=== CareProof Patient Monitor Pure Logic Tests (Phase 8A) ===\n');

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
const explicitRefTime = '2026-01-15T00:00:00.000Z';

// 1. Patient list comes from the simulation dataset
test('1. patient list comes from the simulation dataset', () => {
  const patients = getMonitorPatients(dataset);
  assert(patients.length === dataset.patients.length, 'All simulated patients returned');
  assert(patients.length > 0, 'Patients array is non-empty');
  assert(
    patients.every((p) => p.isSimulated === true),
    'Every patient carries isSimulated: true'
  );
  assert(patients[0].id === dataset.patients[0].id, 'Patient IDs match source dataset');
});

// 2. Patient ordering is deterministic
test('2. patient ordering is deterministic', () => {
  const list1 = getMonitorPatients(dataset);
  const list2 = getMonitorPatients(dataset);

  assert(list1.length === list2.length, 'Lengths match');
  for (let i = 0; i < list1.length; i++) {
    assert(list1[i].id === list2[i].id, `Patient ID at ${i} matches across calls`);
    assert(list1[i].label === list2[i].label, `Patient label at ${i} matches`);
  }
});

// 3. Unknown patient returns not-found/empty state
test('3. unknown patient returns not-found/empty state', () => {
  const vm = createPatientMonitorViewModel(dataset, 'PAT-NONEXISTENT', {}, explicitRefTime);
  assert(vm.patientFound === false, 'patientFound is false for unknown patient');
  assert(vm.selectedPatient === null, 'selectedPatient is null');
  assert(vm.orderedObservations.length === 0, 'orderedObservations is empty');
  assert(vm.timeline.length === 0, 'timeline is empty');
  assert(vm.latestObservation === null, 'latestObservation is null');
  assert(vm.confidence === 0, 'confidence is 0 for unknown patient');
});

// 4. Timeline contains only selected patient's observations
test("4. timeline contains only selected patient's observations", () => {
  const patientId = dataset.patients[0].id;
  const timeline = getPatientTimeline(dataset, patientId);

  assert(timeline.length > 0, 'Timeline contains observations for patient');
  assert(
    timeline.every((obs) => obs.patientId === patientId),
    'Every observation strictly belongs to selected patient'
  );
});

// 5. Timeline ordering is deterministic
test('5. timeline ordering is deterministic', () => {
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

// 6. Timing gaps remain preserved
test('6. timing gaps remain preserved', () => {
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

// 7. Missing values remain missing
test('7. missing values remain missing', () => {
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

// 8. Completeness calculation is correct
test('8. completeness calculation is correct', () => {
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

// 9. Completeness handles zero expected fields safely
test('9. completeness handles zero expected fields safely', () => {
  const dummyObs: MonitorObservation = {
    id: 'TEST-ZERO-FIELDS',
    patientId: 'PAT-TEST',
    timestamp: '2026-01-01T00:00:00.000Z',
    timestampMs: 0,
    values: {},
    completeness: 'sparse',
    hasTimingGap: false,
    gapDurationMs: 0,
    isSimulated: true,
  };

  // Safe against division-by-zero, returns 1.0
  const ratio = calculateObservationCompleteness(dummyObs, []);
  assert(ratio === 1.0, 'Zero expected fields returns 1.0 safely without division by zero');

  const timelineRatio = calculateTimelineCompleteness([dummyObs], []);
  assert(timelineRatio === 1.0, 'Timeline completeness with zero fields returns 1.0 safely');
});

// 10. Freshness at deltaTime = 0 is correct
test('10. freshness at deltaTime = 0 is correct', () => {
  const freshness = calculateFreshness(0, DEFAULT_TAU_MS);
  assert(freshness === 1.0, 'Freshness at elapsed delta=0 is exactly 1.0');
});

// 11. Freshness decreases as deltaTime increases
test('11. freshness decreases as deltaTime increases', () => {
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

// 12. Invalid tau is rejected
test('12. invalid tau is rejected', () => {
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

  let threwNaN = false;
  try {
    calculateFreshness(1000, NaN);
  } catch {
    threwNaN = true;
  }
  assert(threwNaN, 'tau = NaN throws error');
});

// 13. Confidence equals completeness × freshness
test('13. confidence equals completeness × freshness', () => {
  const completeness = 0.8;
  const freshness = 0.5;
  const result = calculateConfidence(completeness, freshness, 1000, DEFAULT_TAU_MS);

  assert(Math.abs(result.confidence - 0.4) < 0.001, '0.8 * 0.5 = 0.4');
  assert(result.completeness === 0.8, 'Completeness preserved');
  assert(result.freshness === 0.5, 'Freshness preserved');
  assert(result.tau === DEFAULT_TAU_MS, 'tau preserved');
  assert(result.tauMs === DEFAULT_TAU_MS, 'tauMs preserved');
});

// 14. Confidence remains deterministic
test('14. confidence remains deterministic', () => {
  const res1 = calculateConfidence(0.75, 0.60, 5000, DEFAULT_TAU_MS);
  const res2 = calculateConfidence(0.75, 0.60, 5000, DEFAULT_TAU_MS);

  assert(res1.confidence === res2.confidence, 'Confidence is bit-for-bit identical');
  assert(res1.freshness === res2.freshness, 'Freshness is bit-for-bit identical');
});

// 15. Confidence below threshold triggers data-gap alert
test('15. confidence below threshold triggers data-gap alert', () => {
  const alert = evaluateDataGapAlert(0.45, DEFAULT_CONFIDENCE_THRESHOLD);
  assert(alert.isAlertActive === true, 'Data-gap alert is active when confidence < threshold');
  assert(alert.reason !== null, 'Alert reason is populated');
  assert(alert.isProposedParameter === true, 'Marked as proposed parameter');
});

// 16. Confidence exactly at threshold does not trigger alert
test('16. confidence exactly at threshold does not trigger alert', () => {
  const alertAt = evaluateDataGapAlert(DEFAULT_CONFIDENCE_THRESHOLD, DEFAULT_CONFIDENCE_THRESHOLD);
  assert(alertAt.isAlertActive === false, 'Alert inactive at exact threshold');
  assert(alertAt.reason === null, 'Alert reason is null');

  const alertAbove = evaluateDataGapAlert(0.85, DEFAULT_CONFIDENCE_THRESHOLD);
  assert(alertAbove.isAlertActive === false, 'Alert inactive above threshold');
});

// 17. Last observation timestamp is correct
test('17. last observation timestamp is correct', () => {
  const patientId = dataset.patients[0].id;
  const vm = createPatientMonitorViewModel(dataset, patientId, {}, explicitRefTime);

  assert(vm.patientFound === true, 'Patient found');
  assert(vm.latestObservation !== null, 'Latest observation exists');
  assert(vm.lastObservationAt === vm.latestObservation!.timestamp, 'lastObservationAt matches latest timestamp');
});

// 18. timeSinceLastObservation uses the explicit reference time
test('18. timeSinceLastObservation uses the explicit reference time', () => {
  const patientId = dataset.patients[0].id;
  const refTime1 = '2026-01-15T12:00:00.000Z';
  const refTime2 = '2026-01-15T16:00:00.000Z'; // +4 hours

  const vm1 = createPatientMonitorViewModel(dataset, patientId, {}, refTime1);
  const vm2 = createPatientMonitorViewModel(dataset, patientId, {}, refTime2);

  assert(vm1.timeSinceLastObservation !== null, 'timeSinceLastObservation is numeric in vm1');
  assert(vm2.timeSinceLastObservation !== null, 'timeSinceLastObservation is numeric in vm2');

  const diffMs = vm2.timeSinceLastObservation! - vm1.timeSinceLastObservation!;
  assert(diffMs === 4 * 3600 * 1000, 'timeSinceLastObservation increases by exactly 4 hours');
});

// 19. Simulated dataset metadata remains SIMULATED
test('19. simulated dataset metadata remains SIMULATED', () => {
  const patientId = dataset.patients[0].id;
  const vm = createPatientMonitorViewModel(dataset, patientId, {}, explicitRefTime);

  assert(vm.isSimulated === true, 'ViewModel has isSimulated: true');
  assert(vm.selectedPatient?.isSimulated === true, 'Selected patient has isSimulated: true');
  assert(vm.orderedObservations.every((o) => o.isSimulated === true), 'Every ordered observation has isSimulated: true');
});

// 20. No real-person identity fields are generated
test('20. no real-person identity fields are generated', () => {
  const patientId = dataset.patients[0].id;
  const vm = createPatientMonitorViewModel(dataset, patientId, {}, explicitRefTime);

  const serialized = JSON.stringify(vm).toLowerCase();
  const forbiddenPiiTerms = ['ssn', 'socialsecurity', 'mrn', 'dob', 'birthdate', 'address', 'phone', 'fullname'];

  for (const term of forbiddenPiiTerms) {
    assert(!serialized.includes(`"${term}"`), `ViewModel does not expose real PII field "${term}"`);
  }
});

// 21. Unconfigured early-warning scorer is reported correctly
test('21. unconfigured early-warning scorer is reported correctly', () => {
  const patientId = dataset.patients[0].id;
  const vm = createPatientMonitorViewModel(dataset, patientId, {}, explicitRefTime);

  assert(vm.earlyWarningResult.status === 'not_configured', 'Early warning status is not_configured');
  assert(vm.scoreConfigurationStatus === 'not_configured', 'Score configuration status is not_configured');
  assert(vm.scoreBandConfiguration?.status === 'not_configured', 'Score band configuration status is not_configured');
  assert(
    vm.earlyWarningResult.clinicalSource.includes('Royal College of Physicians'),
    'Cites Royal College of Physicians source'
  );
  assert(
    vm.earlyWarningResult.verificationNotice.includes('unconfigured pending independent verification'),
    'Includes verification notice'
  );
});

// 22. No invented NEWS2 thresholds are introduced
test('22. no invented NEWS2 thresholds are introduced', () => {
  const defaultScorer = new UnconfiguredEarlyWarningScorer();
  const result = defaultScorer.evaluate([]);

  assert(result.score === null, 'Score is strictly null');
  assert(result.band === null, 'Band is strictly null');
  assert(result.parametersEvaluated.length === 0, 'No fabricated parameters evaluated');
});

// 23. Same inputs produce identical outputs
test('23. same inputs produce identical outputs', () => {
  const patientId = dataset.patients[0].id;
  const vm1 = createPatientMonitorViewModel(dataset, patientId, { tauMs: 10_000_000 }, explicitRefTime);
  const vm2 = createPatientMonitorViewModel(dataset, patientId, { tauMs: 10_000_000 }, explicitRefTime);

  assert(JSON.stringify(vm1) === JSON.stringify(vm2), 'Outputs are bit-for-bit identical across multiple runs');
});

// 24. Changing reference time changes freshness/confidence deterministically
test('24. changing reference time changes freshness/confidence deterministically', () => {
  const patientId = dataset.patients[0].id;
  const tEarly = '2026-01-15T12:00:00.000Z';
  const tLate = '2026-01-15T20:00:00.000Z'; // +8 hours

  const vmEarly = createPatientMonitorViewModel(dataset, patientId, {}, tEarly);
  const vmLate = createPatientMonitorViewModel(dataset, patientId, {}, tLate);

  assert(vmLate.freshness < vmEarly.freshness, 'Freshness at tLate is lower than at tEarly');
  assert(vmLate.confidence < vmEarly.confidence, 'Confidence at tLate is lower than at tEarly');
  assert(vmEarly.completeness === vmLate.completeness, 'Completeness remains invariant to reference time');
});

console.log(`\nResults: ${passed} of ${total} patient monitor logic tests passed.`);
if (passed !== total) {
  process.exit(1);
}
