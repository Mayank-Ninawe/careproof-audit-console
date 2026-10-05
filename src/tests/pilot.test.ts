/**
 * CareProof Audit Console - Pilot Study Simulation & Statistics Unit Tests
 * Source of Truth: CareProof Website Roadmap (Phase 10A)
 * 
 * Verifies all 20 required Section 24 test specifications:
 * 1. same seed produces identical result
 * 2. different seeds produce different simulated output
 * 3. protocol metadata is deterministic
 * 4. score distribution is deterministic
 * 5. score summary calculations are correct
 * 6. valid kappa calculation returns deterministic result
 * 7. degenerate kappa data returns unavailable
 * 8. alpha calculation works on valid matrix
 * 9. degenerate alpha input returns unavailable
 * 10. ROC points are deterministic
 * 11. AUC is calculated from simulated data
 * 12. ROC handles all-positive/all-negative edge cases
 * 13. constant-score ROC edge case handled
 * 14. empty dataset handled
 * 15. simulated metadata is preserved
 * 16. no Math.random() is used
 * 17. no Date.now() is used in deterministic generation
 * 18. JSON serialization is deterministic
 * 19. limitations metadata exists
 * 20. no fabricated benchmark claims are generated
 */

import {
  calculateCohenKappa,
  calculateCronbachAlpha,
  calculateRocAnalysis,
  calculateScoreDistribution,
  createPilotViewModel,
  runPilotSimulation,
} from '../services/pilot';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`TEST ASSERTION FAILED: ${message}`);
  }
}

console.log('=== CareProof Pilot Study Simulation & Statistics Tests (Phase 10A) ===\n');

let passed = 0;
let total = 0;

function test(name: string, fn: () => void): void {
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

// 1. Same seed produces identical result
test('1. Same seed produces identical result', () => {
  const seed = 98765;
  const run1 = runPilotSimulation(seed);
  const run2 = runPilotSimulation(seed);

  assert(run1.observations.length === run2.observations.length, 'Observation lengths must match');
  assert(
    JSON.stringify(run1.observations) === JSON.stringify(run2.observations),
    'Observations must be deeply identical for identical seed'
  );
  assert(
    JSON.stringify(run1.validation) === JSON.stringify(run2.validation),
    'Validation metrics must be deeply identical for identical seed'
  );
  assert(
    JSON.stringify(run1.protocol) === JSON.stringify(run2.protocol),
    'Protocol metadata must be identical'
  );
});

// 2. Different seeds produce different simulated output
test('2. Different seeds produce different simulated output', () => {
  const run1 = runPilotSimulation(1111);
  const run2 = runPilotSimulation(2222);

  const scores1 = run1.observations.map((o) => o.score);
  const scores2 = run2.observations.map((o) => o.score);

  assert(JSON.stringify(scores1) !== JSON.stringify(scores2), 'Scores must differ between seeds');
  assert(
    run1.validation.scoreDistribution.mean !== run2.validation.scoreDistribution.mean,
    'Mean distribution should generally vary with different seeds'
  );
});

// 3. Protocol metadata is deterministic
test('3. Protocol metadata is deterministic', () => {
  const sim = runPilotSimulation(42);
  const protocol = sim.protocol;

  assert(protocol.protocolId === 'PROTO-PILOT-SIM-001', 'Protocol ID must be deterministic');
  assert(
    protocol.studyDesign.includes('Synthetic Demonstration Only'),
    'Study design must explicitly identify demonstration nature'
  );
  assert(
    protocol.sampleSize.label === 'simulated / demonstration configuration',
    'Sample size label must state simulated / demonstration configuration'
  );
  assert(
    protocol.primaryEndpoint.id === 'EP-PRI-01',
    'Primary endpoint must match specification'
  );
  assert(protocol.secondaryEndpoints.length === 3, 'Must contain 3 secondary endpoints');
  assert(
    protocol.simulationMetadata.datasetType === 'SIMULATED',
    'Simulation metadata datasetType must be SIMULATED'
  );
  assert(protocol.seed === 42, 'Protocol seed must match simulation seed');
});

// 4. Score distribution is deterministic
test('4. Score distribution is deterministic', () => {
  const sim1 = runPilotSimulation(555);
  const sim2 = runPilotSimulation(555);

  const dist1 = sim1.validation.scoreDistribution;
  const dist2 = sim2.validation.scoreDistribution;

  assert(dist1.mean === dist2.mean, 'Mean must match');
  assert(dist1.median === dist2.median, 'Median must match');
  assert(dist1.stdDev === dist2.stdDev, 'Standard deviation must match');
  assert(dist1.min === dist2.min, 'Min must match');
  assert(dist1.max === dist2.max, 'Max must match');
  assert(JSON.stringify(dist1.bins) === JSON.stringify(dist2.bins), 'Bins must be identical');
});

// 5. Score summary calculations are correct
test('5. Score summary calculations are correct on known dataset', () => {
  const scores = [10, 20, 30, 40, 50];
  const dist = calculateScoreDistribution(scores, 4);

  // Mean = (10+20+30+40+50)/5 = 30
  assert(dist.mean === 30, `Expected mean 30, got ${dist.mean}`);

  // Median of odd length = 30
  assert(dist.median === 30, `Expected median 30, got ${dist.median}`);

  // Median of even length = (20+30)/2 = 25
  const evenDist = calculateScoreDistribution([10, 20, 30, 40], 2);
  assert(evenDist.median === 25, `Expected median 25, got ${evenDist.median}`);

  // Sample std dev of [10, 20, 30, 40, 50]: variance = ((10-30)^2 + (20-30)^2 + (30-30)^2 + (40-30)^2 + (50-30)^2)/(5-1)
  // variance = (400 + 100 + 0 + 100 + 400) / 4 = 1000 / 4 = 250 -> stdDev = sqrt(250) ~ 15.811
  assert(Math.abs(dist.stdDev - Math.sqrt(250)) < 1e-9, 'StdDev must match sample standard deviation');
  assert(dist.min === 10, 'Min must be 10');
  assert(dist.max === 50, 'Max must be 50');

  // Total counts across bins should equal sample size
  const totalBinCount = dist.bins.reduce((acc, b) => acc + b.count, 0);
  assert(totalBinCount === 5, 'Sum of bin counts must equal sample size');
});

// 6. Valid kappa calculation returns deterministic result
test('6. Valid kappa calculation returns deterministic result', () => {
  // Known 2x2 agreement:
  // Both say A: 20
  // Both say B: 15
  // Rater1 says A, Rater2 says B: 5
  // Rater1 says B, Rater2 says A: 10
  // Total N = 50
  // Po = (20 + 15) / 50 = 35 / 50 = 0.70
  // Rater1 A: 25/50 = 0.5; Rater1 B: 25/50 = 0.5
  // Rater2 A: 30/50 = 0.6; Rater2 B: 20/50 = 0.4
  // Pe = (0.5 * 0.6) + (0.5 * 0.4) = 0.30 + 0.20 = 0.50
  // Kappa = (0.70 - 0.50) / (1 - 0.50) = 0.20 / 0.50 = 0.40
  const ratings: Array<{ raterA: string; raterB: string }> = [];
  for (let i = 0; i < 20; i++) ratings.push({ raterA: 'A', raterB: 'A' });
  for (let i = 0; i < 15; i++) ratings.push({ raterA: 'B', raterB: 'B' });
  for (let i = 0; i < 5; i++) ratings.push({ raterA: 'A', raterB: 'B' });
  for (let i = 0; i < 10; i++) ratings.push({ raterA: 'B', raterB: 'A' });

  const res = calculateCohenKappa(ratings);
  assert(res.status === 'calculated', 'Kappa status must be calculated');
  assert(res.kappa !== null, 'Kappa must not be null');
  assert(Math.abs(res.kappa! - 0.40) < 1e-9, `Expected kappa 0.40, got ${res.kappa}`);
  assert(Math.abs(res.agreementMetadata.observedAgreement! - 0.70) < 1e-9, 'Po must be 0.70');
  assert(Math.abs(res.agreementMetadata.expectedAgreement! - 0.50) < 1e-9, 'Pe must be 0.50');
  assert(res.ratingCount === 50, 'Rating count must be 50');
});

// 7. Degenerate kappa data returns unavailable
test('7. Degenerate kappa data returns unavailable', () => {
  // Case A: Fewer than 2 ratings
  const emptyRes = calculateCohenKappa([]);
  assert(emptyRes.status === 'unavailable', 'Empty ratings must be unavailable');
  assert(emptyRes.kappa === null, 'Kappa must be null for empty ratings');

  const singleRes = calculateCohenKappa([{ raterA: 'A', raterB: 'A' }]);
  assert(singleRes.status === 'unavailable', 'Single rating must be unavailable');

  // Case B: Fewer than 2 categories (all raters rated single category 'A')
  const monoRes = calculateCohenKappa([
    { raterA: 'A', raterB: 'A' },
    { raterA: 'A', raterB: 'A' },
  ]);
  assert(monoRes.status === 'unavailable', 'Mono-category must be unavailable');
  assert(monoRes.kappa === null, 'Kappa must be null for mono-category');
  assert(monoRes.reason !== undefined, 'Must provide reason for unavailable kappa');

  // Case C: 1 - Pe is zero
  const zeroVariationRatings = [
    { raterA: 'A', raterB: 'A' },
    { raterA: 'A', raterB: 'A' },
    { raterA: 'A', raterB: 'A' },
  ];
  const zeroVarRes = calculateCohenKappa(zeroVariationRatings, ['A', 'B']);
  assert(zeroVarRes.status === 'unavailable', 'Chance agreement 1.0 must be unavailable');
  assert(zeroVarRes.kappa === null, 'Kappa must not be forced');
});

// 8. Alpha calculation works on valid matrix
test('8. Alpha calculation works on valid matrix', () => {
  // Simple 3 subjects, 3 items matrix:
  // Subject 1: [1, 2, 3] -> total = 6
  // Subject 2: [2, 3, 4] -> total = 9
  // Subject 3: [3, 4, 5] -> total = 12
  // Item 1: [1, 2, 3], mean = 2, var = ((1-2)^2 + (2-2)^2 + (3-2)^2)/2 = (1+0+1)/2 = 1.0
  // Item 2: [2, 3, 4], mean = 3, var = 1.0
  // Item 3: [3, 4, 5], mean = 4, var = 1.0
  // sum(item_var) = 1.0 + 1.0 + 1.0 = 3.0
  // Total scores: [6, 9, 12], mean = 9, var = ((6-9)^2 + (9-9)^2 + (12-9)^2)/2 = (9+0+9)/2 = 9.0
  // Alpha = (3 / (3 - 1)) * (1 - 3.0 / 9.0) = 1.5 * (1 - 0.333333) = 1.5 * (2/3) = 1.0
  const matrix = [
    [1, 2, 3],
    [2, 3, 4],
    [3, 4, 5],
  ];
  const res = calculateCronbachAlpha(matrix);
  assert(res.status === 'calculated', 'Status must be calculated');
  assert(res.alpha !== null, 'Alpha must not be null');
  assert(Math.abs(res.alpha! - 1.0) < 1e-9, `Expected alpha 1.0, got ${res.alpha}`);
  assert(res.itemCount === 3, 'Item count must be 3');
  assert(res.observationCount === 3, 'Observation count must be 3');
});

// 9. Degenerate alpha input returns unavailable
test('9. Degenerate alpha input returns unavailable', () => {
  // Fewer than 2 items
  const singleItem = [[1], [2], [3]];
  const resSingleItem = calculateCronbachAlpha(singleItem);
  assert(resSingleItem.status === 'unavailable', 'Single item matrix must be unavailable');
  assert(resSingleItem.alpha === null, 'Alpha must be null');

  // Fewer than 2 observations
  const singleObs = [[1, 2, 3]];
  const resSingleObs = calculateCronbachAlpha(singleObs);
  assert(resSingleObs.status === 'unavailable', 'Single observation must be unavailable');

  // Zero total score variance (all subjects have identical total scores)
  const zeroVarMatrix = [
    [1, 5],
    [5, 1],
    [3, 3],
  ];
  // Totals: [6, 6, 6] -> variance = 0
  const resZeroVar = calculateCronbachAlpha(zeroVarMatrix);
  assert(resZeroVar.status === 'unavailable', 'Zero total variance must be unavailable');
  assert(resZeroVar.alpha === null, 'Alpha must not be fabricated when total variance is 0');
  assert(resZeroVar.reason !== undefined, 'Reason must be provided');
});

// 10. ROC points are deterministic
test('10. ROC points are deterministic', () => {
  const sim1 = runPilotSimulation(777);
  const sim2 = runPilotSimulation(777);

  const roc1 = sim1.validation.roc;
  const roc2 = sim2.validation.roc;

  assert(roc1.status === 'calculated', 'ROC status must be calculated');
  assert(roc1.points.length === roc2.points.length, 'ROC points length must match');
  assert(
    JSON.stringify(roc1.points) === JSON.stringify(roc2.points),
    'ROC points must be identical'
  );
  assert(roc1.auc === roc2.auc, 'AUC must match');
});

// 11. AUC is calculated from simulated data
test('11. AUC is calculated from simulated data', () => {
  // Perfect discrimination test:
  // Positive cases have higher scores than all negative cases
  const perfectData = [
    { score: 90, outcome: 1 },
    { score: 85, outcome: 1 },
    { score: 50, outcome: 0 },
    { score: 45, outcome: 0 },
  ];
  const perfectRoc = calculateRocAnalysis(perfectData);
  assert(perfectRoc.status === 'calculated', 'Status must be calculated');
  assert(perfectRoc.auc === 1.0, `Expected AUC 1.0 for perfect separation, got ${perfectRoc.auc}`);

  // Inverted discrimination test:
  // All positive cases have lower scores than all negative cases
  const invertedData = [
    { score: 40, outcome: 1 },
    { score: 45, outcome: 1 },
    { score: 85, outcome: 0 },
    { score: 90, outcome: 0 },
  ];
  const invertedRoc = calculateRocAnalysis(invertedData);
  assert(invertedRoc.status === 'calculated', 'Status must be calculated');
  assert(invertedRoc.auc === 0.0, `Expected AUC 0.0 for inverted data, got ${invertedRoc.auc}`);

  // Ties handling:
  const tiedNonConstant = [
    { score: 80, outcome: 1 },
    { score: 60, outcome: 1 },
    { score: 60, outcome: 0 },
    { score: 40, outcome: 0 },
  ];
  // Pos: 80, 60. Neg: 60, 40.
  // Pos 80 vs Neg 60: 1.0
  // Pos 80 vs Neg 40: 1.0
  // Pos 60 vs Neg 60: 0.5
  // Pos 60 vs Neg 40: 1.0
  // Sum = 3.5 / (2 * 2) = 3.5 / 4 = 0.875
  const tiedRes = calculateRocAnalysis(tiedNonConstant);
  assert(Math.abs(tiedRes.auc! - 0.875) < 1e-9, `Expected AUC 0.875, got ${tiedRes.auc}`);
});

// 12. ROC handles all-positive/all-negative edge cases
test('12. ROC handles all-positive and all-negative edge cases', () => {
  // All positive cases
  const allPositive = [
    { score: 60, outcome: 1 },
    { score: 70, outcome: 1 },
    { score: 80, outcome: 1 },
  ];
  const allPosRes = calculateRocAnalysis(allPositive);
  assert(allPosRes.status === 'unavailable', 'All-positive dataset must be unavailable');
  assert(allPosRes.auc === null, 'AUC must be null for all-positive dataset');
  assert(Boolean(allPosRes.reason?.includes('No negative cases')), 'Must explain reason');

  // All negative cases
  const allNegative = [
    { score: 60, outcome: 0 },
    { score: 70, outcome: 0 },
    { score: 80, outcome: 0 },
  ];
  const allNegRes = calculateRocAnalysis(allNegative);
  assert(allNegRes.status === 'unavailable', 'All-negative dataset must be unavailable');
  assert(allNegRes.auc === null, 'AUC must be null for all-negative dataset');
  assert(Boolean(allNegRes.reason?.includes('No positive cases')), 'Must explain reason');
});

// 13. Constant-score ROC edge case handled
test('13. Constant-score ROC edge case handled', () => {
  const constantScores = [
    { score: 50, outcome: 1 },
    { score: 50, outcome: 1 },
    { score: 50, outcome: 0 },
    { score: 50, outcome: 0 },
  ];
  const res = calculateRocAnalysis(constantScores);
  assert(res.status === 'unavailable', 'Constant scores must return unavailable');
  assert(res.auc === null, 'AUC must be null');
  assert(Boolean(res.reason?.includes('identical')), 'Must explain zero score variance');
});

// 14. Empty dataset handled
test('14. Empty dataset handled gracefully across all methods', () => {
  const emptyDist = calculateScoreDistribution([]);
  assert(emptyDist.sampleSize === 0, 'Empty distribution sample size must be 0');
  assert(emptyDist.bins.length === 0, 'Empty distribution bins must be empty');

  const emptyRoc = calculateRocAnalysis([]);
  assert(emptyRoc.status === 'unavailable', 'Empty ROC must be unavailable');
  assert(emptyRoc.auc === null, 'Empty ROC AUC must be null');

  const emptyKappa = calculateCohenKappa([]);
  assert(emptyKappa.status === 'unavailable', 'Empty Kappa must be unavailable');
  assert(emptyKappa.kappa === null, 'Empty Kappa must be null');

  const emptyAlpha = calculateCronbachAlpha([]);
  assert(emptyAlpha.status === 'unavailable', 'Empty Alpha must be unavailable');
  assert(emptyAlpha.alpha === null, 'Empty Alpha must be null');
});

// 15. Simulated metadata is preserved
test('15. Simulated metadata is preserved throughout all structures', () => {
  const sim = runPilotSimulation(42);
  const vm = createPilotViewModel(undefined, 42);

  assert(sim.datasetType === 'SIMULATED', 'Top-level datasetType must be SIMULATED');
  assert(sim.isSimulated === true, 'Top-level isSimulated must be true');
  assert(
    sim.validation.scoreDistribution.datasetType === 'SIMULATED',
    'Distribution datasetType must be SIMULATED'
  );
  assert(
    sim.validation.interRater.datasetType === 'SIMULATED',
    'InterRater datasetType must be SIMULATED'
  );
  assert(
    sim.validation.internalConsistency.datasetType === 'SIMULATED',
    'Alpha datasetType must be SIMULATED'
  );
  assert(sim.validation.roc.datasetType === 'SIMULATED', 'ROC datasetType must be SIMULATED');
  assert(sim.limitations.datasetType === 'SIMULATED', 'Limitations datasetType must be SIMULATED');
  assert(vm.simulatedStatus === 'SIMULATED', 'ViewModel simulatedStatus must be SIMULATED');

  for (const obs of sim.observations) {
    assert(obs.isSimulated === true, 'Every observation must carry isSimulated: true');
  }
});

// 16. No Math.random() is used
test('16. No Math.random() is used in simulation execution', () => {
  const originalMathRandom = Math.random;
  let randomCalled = false;

  Math.random = () => {
    randomCalled = true;
    throw new Error('VIOLATION: Math.random() was called inside simulation generator!');
  };

  try {
    const sim = runPilotSimulation(99999);
    assert(sim.observations.length > 0, 'Simulation succeeded');
    assert(randomCalled === false, 'Math.random() was not called');
  } finally {
    Math.random = originalMathRandom;
  }
});

// 17. No Date.now() is used in deterministic generation
test('17. No Date.now() is used in deterministic generation', () => {
  const originalDateNow = Date.now;
  let dateNowCalled = false;

  Date.now = () => {
    dateNowCalled = true;
    throw new Error('VIOLATION: Date.now() was called inside deterministic simulation!');
  };

  try {
    const sim = runPilotSimulation(88888);
    assert(sim.generatedAt === '2026-01-01T00:00:00.000Z', 'Anchor timestamp is deterministic');
    assert(dateNowCalled === false, 'Date.now() was not called');
  } finally {
    Date.now = originalDateNow;
  }
});

// 18. JSON serialization is deterministic
test('18. JSON serialization is deterministic', () => {
  const seed = 314159;
  const config = { sampleSize: 20 };

  const sim1 = runPilotSimulation(seed, config);
  const sim2 = runPilotSimulation(seed, config);

  const json1 = JSON.stringify(sim1);
  const json2 = JSON.stringify(sim2);

  assert(json1 === json2, 'Serialized JSON must be bit-for-bit identical across runs');
});

// 19. Limitations metadata exists
test('19. Limitations metadata exists with required disclaimer statements', () => {
  const sim = runPilotSimulation(123);
  const limitations = sim.limitations;

  assert(limitations.datasetType === 'SIMULATED', 'Limitations must be tagged SIMULATED');
  assert(limitations.isSimulated === true, 'Limitations isSimulated must be true');
  assert(limitations.statements.length >= 5, 'Must contain multiple explicit limitation statements');

  const statementsText = limitations.statements.join(' ');
  assert(
    statementsText.includes('No clinical validation'),
    'Must state no clinical validation'
  );
  assert(
    statementsText.includes('synthetically'),
    'Must state synthetically generated'
  );
  assert(
    statementsText.includes('demonstration'),
    'Must state demonstration parameters'
  );
  assert(
    limitations.safeHarborNotice.includes('not clinically validated'),
    'Safe harbor notice must disclaim clinical validation'
  );
});

// 20. No fabricated benchmark claims are generated
test('20. No fabricated benchmark claims are generated', () => {
  const sim = runPilotSimulation(456);
  const serialized = JSON.stringify(sim);

  assert(!serialized.includes('statistically proven'), 'Must not claim statistically proven');
  assert(!serialized.includes('clinical efficacy'), 'Must not claim clinical efficacy');
  assert(!serialized.includes('adequately powered'), 'Must not claim adequately powered');
  assert(!serialized.includes('diagnostic accuracy'), 'Must not claim diagnostic accuracy');
  assert(!serialized.includes('p < 0.05'), 'Must not fabricate real p-values');
  assert(!serialized.includes('p < 0.01'), 'Must not fabricate real p-values');
});

console.log(`\n========================================`);
console.log(`Pilot Study Tests Passed: ${passed} / ${total}`);
console.log(`========================================\n`);

if (passed !== total) {
  process.exitCode = 1;
}
