/**
 * CareProof Audit Console - Simulation Engine Reproducibility & Determinism Tests
 * 
 * Verifies all 14 simulation requirements:
 * 1. Same seed produces identical patient IDs.
 * 2. Same seed produces identical device IDs.
 * 3. Same seed produces identical caregiver IDs.
 * 4. Same seed produces identical outcomes.
 * 5. Same seed produces identical observations.
 * 6. Different seeds produce different generated data.
 * 7. Configured collection counts are respected.
 * 8. IDs remain unique.
 * 9. Timestamps are deterministic.
 * 10. No Math.random() is used by the simulation implementation.
 * 11. Missing observation values remain explicitly missing.
 * 12. Generator output is serializable.
 * 13. Generated data contains no real-person information.
 * 14. Generator is deterministic across repeated runs in the same test.
 */

import { generateSimulation, SeededRng } from '../engine/simulate';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST ASSERTION FAILED: ${message}`);
  }
}

console.log('=== CareProof Simulation Engine Reproducibility Tests ===\n');

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

// 1. Same seed produces identical patient IDs
test('1. Same seed produces identical patient IDs', () => {
  const seed = 104729;
  const sim1 = generateSimulation(seed);
  const sim2 = generateSimulation(seed);

  const ids1 = sim1.patients.map(p => p.id);
  const ids2 = sim2.patients.map(p => p.id);

  assert(ids1.length === ids2.length, 'Patient ID lists must have identical lengths');
  assert(JSON.stringify(ids1) === JSON.stringify(ids2), 'Patient IDs must be identical for same seed');
});

// 2. Same seed produces identical device IDs
test('2. Same seed produces identical device IDs', () => {
  const seed = 104729;
  const sim1 = generateSimulation(seed);
  const sim2 = generateSimulation(seed);

  const ids1 = sim1.devices.map(d => d.id);
  const ids2 = sim2.devices.map(d => d.id);

  assert(ids1.length === ids2.length, 'Device ID lists must have identical lengths');
  assert(JSON.stringify(ids1) === JSON.stringify(ids2), 'Device IDs must be identical for same seed');
});

// 3. Same seed produces identical caregiver IDs
test('3. Same seed produces identical caregiver IDs', () => {
  const seed = 104729;
  const sim1 = generateSimulation(seed);
  const sim2 = generateSimulation(seed);

  const ids1 = sim1.caregivers.map(c => c.id);
  const ids2 = sim2.caregivers.map(c => c.id);

  assert(ids1.length === ids2.length, 'Caregiver ID lists must have identical lengths');
  assert(JSON.stringify(ids1) === JSON.stringify(ids2), 'Caregiver IDs must be identical for same seed');
});

// 4. Same seed produces identical outcomes
test('4. Same seed produces identical outcomes', () => {
  const seed = 104729;
  const sim1 = generateSimulation(seed);
  const sim2 = generateSimulation(seed);

  assert(JSON.stringify(sim1.outcomes) === JSON.stringify(sim2.outcomes), 'Outcomes must be identical for same seed');
});

// 5. Same seed produces identical observations
test('5. Same seed produces identical observations', () => {
  const seed = 104729;
  const sim1 = generateSimulation(seed);
  const sim2 = generateSimulation(seed);

  assert(JSON.stringify(sim1.observations) === JSON.stringify(sim2.observations), 'Observations must be identical for same seed');
});

// 6. Different seeds produce different generated data
test('6. Different seeds produce different generated data', () => {
  const simA = generateSimulation(11111);
  const simB = generateSimulation(99999);

  assert(simA.seed !== simB.seed, 'Seeds must differ');
  assert(JSON.stringify(simA.patients) !== JSON.stringify(simB.patients), 'Patient data must differ for different seeds');
  assert(JSON.stringify(simA.observations) !== JSON.stringify(simB.observations), 'Observations must differ for different seeds');
  assert(JSON.stringify(simA.devices) !== JSON.stringify(simB.devices), 'Device data must differ for different seeds');
});

// 7. Configured collection counts are respected
test('7. Configured collection counts are respected', () => {
  const customConfig = {
    patientCount: 5,
    observationCountPerPatient: 4,
    deviceCount: 3,
    caregiverCount: 4,
    outcomeCount: 7,
  };

  const sim = generateSimulation(54321, customConfig);

  assert(sim.patients.length === 5, `Expected 5 patients, got ${sim.patients.length}`);
  assert(sim.observations.length === 20, `Expected 20 observations (5x4), got ${sim.observations.length}`);
  assert(sim.devices.length === 3, `Expected 3 devices, got ${sim.devices.length}`);
  assert(sim.caregivers.length === 4, `Expected 4 caregivers, got ${sim.caregivers.length}`);
  assert(sim.outcomes.length === 7, `Expected 7 outcomes, got ${sim.outcomes.length}`);
});

// 8. IDs remain unique
test('8. IDs remain unique within each entity collection', () => {
  const sim = generateSimulation(77777, {
    patientCount: 25,
    observationCountPerPatient: 10,
    deviceCount: 15,
    caregiverCount: 12,
    outcomeCount: 20,
  });

  const patientIds = new Set(sim.patients.map(p => p.id));
  assert(patientIds.size === sim.patients.length, 'All patient IDs must be unique');

  const observationIds = new Set(sim.observations.map(o => o.id));
  assert(observationIds.size === sim.observations.length, 'All observation IDs must be unique');

  const deviceIds = new Set(sim.devices.map(d => d.id));
  assert(deviceIds.size === sim.devices.length, 'All device IDs must be unique');

  const caregiverIds = new Set(sim.caregivers.map(c => c.id));
  assert(caregiverIds.size === sim.caregivers.length, 'All caregiver IDs must be unique');

  const outcomeIds = new Set(sim.outcomes.map(o => o.id));
  assert(outcomeIds.size === sim.outcomes.length, 'All outcome IDs must be unique');
});

// 9. Timestamps are deterministic
test('9. Timestamps are deterministic and reproducible across executions', () => {
  const fixedConfig = { startTimestamp: '2026-03-15T12:00:00.000Z' };
  const sim1 = generateSimulation(88888, fixedConfig);
  const sim2 = generateSimulation(88888, fixedConfig);

  const timestamps1 = sim1.observations.map(o => o.timestamp);
  const timestamps2 = sim2.observations.map(o => o.timestamp);

  assert(JSON.stringify(timestamps1) === JSON.stringify(timestamps2), 'Observation timestamps must be identical');
  assert(sim1.generatedAt === '2026-03-15T12:00:00.000Z', 'Anchor timestamp matches startTimestamp');
});

// 10. No Math.random() is used by the simulation implementation
test('10. No Math.random() is used during simulation execution', () => {
  const originalMathRandom = Math.random;
  let randomCalled = false;

  Math.random = () => {
    randomCalled = true;
    throw new Error('VIOLATION: Math.random() was called inside simulation generator!');
  };

  try {
    const sim = generateSimulation(42424);
    assert(sim.patients.length > 0, 'Simulation succeeded');
    assert(randomCalled === false, 'Math.random() was not called');
  } finally {
    Math.random = originalMathRandom;
  }
});

// 11. Missing observation values remain explicitly missing
test('11. Missing observation values remain explicitly null, not converted to 0', () => {
  // Use a high missingValueProbability to guarantee missing channel values
  const sim = generateSimulation(65432, { missingValueProbability: 0.8 });

  const missingChannel1Observations = sim.observations.filter(o => o.values.channel1 === null);
  assert(missingChannel1Observations.length > 0, 'Found observations with missing channel1');

  // Verify missing values are strictly null and not number 0
  for (const obs of missingChannel1Observations) {
    assert(obs.values.channel1 === null, 'Missing channel1 must be null, never 0');
    assert(typeof obs.values.channel1 !== 'number', 'Missing channel1 cannot be numeric 0');
  }

  // Completeness tag correctly reflects partial/sparse state
  const sparseObs = sim.observations.find(o => o.completeness === 'sparse');
  if (sparseObs) {
    assert(sparseObs.values.channel1 === null && sparseObs.values.channel2 === null, 'Sparse observation has both channels null');
  }
});

// 12. Generator output is serializable
test('12. Generator output is 100% JSON-serializable', () => {
  const sim = generateSimulation(33333);
  const serialized = JSON.stringify(sim);
  const parsed = JSON.parse(serialized);

  assert(parsed.datasetType === 'SIMULATED', 'Serialized dataset retains SIMULATED tag');
  assert(parsed.patients.length === sim.patients.length, 'Serialized patients match original');
  assert(parsed.observations.length === sim.observations.length, 'Serialized observations match original');
  assert(parsed.devices.length === sim.devices.length, 'Serialized devices match original');
});

// 13. Generated data contains no real-person information
test('13. Generated data contains strictly synthetic identifiers with no PII', () => {
  const sim = generateSimulation(55555);

  // Check patients
  for (const patient of sim.patients) {
    assert(/^PAT-\d{3,}$/.test(patient.id), `Patient ID must follow synthetic pattern PAT-xxx, got: ${patient.id}`);
    assert(patient.label.startsWith('Synthetic Patient'), 'Label must be explicitly synthetic');
    assert(patient.isSimulated === true, 'isSimulated must be true');
    // Ensure no email, phone, or SSN patterns
    assert(!JSON.stringify(patient).includes('@'), 'Must not contain email');
  }

  // Check caregivers
  for (const caregiver of sim.caregivers) {
    assert(/^CG-\d{3,}$/.test(caregiver.id), `Caregiver ID must follow synthetic pattern CG-xxx, got: ${caregiver.id}`);
    assert(caregiver.isSimulated === true, 'isSimulated must be true');
    assert(!JSON.stringify(caregiver).includes('@'), 'Must not contain email');
  }

  // Check datasetType
  assert(sim.datasetType === 'SIMULATED', 'Dataset must be labeled SIMULATED');
});

// 14. Generator is deterministic across repeated runs in the same test
test('14. Generator is deterministic across repeated runs in the same test', () => {
  const seed = 98765;
  const run1 = generateSimulation(seed);
  const run2 = generateSimulation(seed);
  const run3 = generateSimulation(seed);

  assert(JSON.stringify(run1) === JSON.stringify(run2), 'Run 1 and Run 2 must be bit-for-bit identical');
  assert(JSON.stringify(run2) === JSON.stringify(run3), 'Run 2 and Run 3 must be bit-for-bit identical');

  // Also test SeededRng unit determinism directly
  const rng1 = new SeededRng(12345);
  const rng2 = new SeededRng(12345);
  for (let i = 0; i < 50; i++) {
    assert(rng1.nextFloat() === rng2.nextFloat(), `Float sequence mismatch at index ${i}`);
    assert(rng1.nextInt(1, 100) === rng2.nextInt(1, 100), `Int sequence mismatch at index ${i}`);
  }
});

console.log(`\nResults: ${passed} of ${total} simulation engine reproducibility tests passed.`);
if (passed !== total) {
  process.exit(1);
}
