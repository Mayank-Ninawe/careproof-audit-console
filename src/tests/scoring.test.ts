/**
 * CareProof Audit Console - Pure Deterministic Scoring Engine Test Suite
 * 
 * Verifies all 22 required scoring rules and edge cases:
 * 1. Meets = 100
 * 2. Partial = 50
 * 3. Fails = 0
 * 4. Not Assessed is excluded
 * 5. Weighted pillar score is correct
 * 6. Unassessed indicators are excluded from pillar denominator
 * 7. Overall weighted score is correct
 * 8. Coverage calculation is correct
 * 9. Coverage below 80% results in no tier
 * 10. Coverage exactly 80% permits tier assignment
 * 11. 85 boundary produces Hospital-Grade when no gate applies
 * 12. 70 boundary produces Approaching when appropriate
 * 13. 50 boundary produces Conditional when appropriate
 * 14. Below 50 produces Not met
 * 15. Critical Fails triggers Safety Gate
 * 16. Non-critical Fails does not trigger Safety Gate
 * 17. Critical Not Assessed does not trigger Safety Gate
 * 18. Safety Gate caps a high calculated tier to Conditional
 * 19. Safety Gate does not alter numerical overall score
 * 20. Multiple critical failures are reported
 * 21. Zero-weight/invalid input is rejected
 * 22. Engine gives deterministic results for identical inputs
 */

import {
  computeAuditScore,
  evaluateIndicatorScore,
  calculatePillarScore,
  calculateOverallScore,
  calculateCoverage,
  determineTier,
  scoreDiscreteBand,
} from '../engine/scoring';
import { Indicator, Pillar } from '../types/standard';
import { IndicatorScoringResult } from '../types/scoring';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST ASSERTION FAILED: ${message}`);
  }
}

console.log('=== CareProof Pure Scoring Engine Test Suite ===\n');

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

// Fixtures for testing
const samplePillars: Pillar[] = [
  { id: 'CSP', name: 'Clinical Safety Protocols', description: 'Safety', ordering: 1, weight: 0.6 },
  { id: 'CSW', name: 'Caregiver Staffing', description: 'Staffing', ordering: 2, weight: 0.4 },
];

const sampleIndicators: Indicator[] = [
  {
    id: 'CSP-01',
    pillarId: 'CSP',
    name: 'Critical Medication Safety',
    definition: 'Medication verification rate',
    dataSource: 'eMAR',
    bands: [{ level: 'Meets' }, { level: 'Partial' }, { level: 'Fails' }],
    weight: 2.0,
    critical: true,
    evidence: 'E',
    refs: [],
    code: 'CSP-01',
    isCritical: true,
    evidenceClassification: 'E',
    description: 'Medication verification rate',
    guidance: 'Guidance',
    thresholds: { pass: 95, warning: 85, fail: 75 },
    unit: '%',
    metricType: 'percentage',
    safetyGateCap: 'Conditional',
  },
  {
    id: 'CSP-02',
    pillarId: 'CSP',
    name: 'Hand Hygiene Protocol',
    definition: 'Hand hygiene rate',
    dataSource: 'Sensors',
    bands: [{ level: 'Meets' }, { level: 'Partial' }, { level: 'Fails' }],
    weight: 1.0,
    critical: false,
    evidence: 'E',
    refs: [],
    code: 'CSP-02',
    isCritical: false,
    evidenceClassification: 'E',
    description: 'Hand hygiene rate',
    guidance: 'Guidance',
    thresholds: { pass: 90, warning: 80, fail: 70 },
    unit: '%',
    metricType: 'percentage',
    safetyGateCap: null,
  },
  {
    id: 'CSW-01',
    pillarId: 'CSW',
    name: 'Shift Overlap Hours',
    definition: 'Direct care hours',
    dataSource: 'Roster',
    bands: [{ level: 'Meets' }, { level: 'Partial' }, { level: 'Fails' }],
    weight: 3.0,
    critical: false,
    evidence: 'I',
    refs: [],
    code: 'CSW-01',
    isCritical: false,
    evidenceClassification: 'I',
    description: 'Direct care hours',
    guidance: 'Guidance',
    thresholds: { pass: 90, warning: 80, fail: 70 },
    unit: '%',
    metricType: 'percentage',
    safetyGateCap: null,
  },
  {
    id: 'CSW-02',
    pillarId: 'CSW',
    name: 'Staff Credential Currency',
    definition: 'Credential currency rate',
    dataSource: 'Registry',
    bands: [{ level: 'Meets' }, { level: 'Partial' }, { level: 'Fails' }],
    weight: 1.0,
    critical: true,
    evidence: 'E',
    refs: [],
    code: 'CSW-02',
    isCritical: true,
    evidenceClassification: 'E',
    description: 'Credential currency rate',
    guidance: 'Guidance',
    thresholds: { pass: 100, warning: 95, fail: 90 },
    unit: '%',
    metricType: 'percentage',
    safetyGateCap: 'Conditional',
  },
  {
    id: 'CSW-03',
    pillarId: 'CSW',
    name: 'Acuity Ratio',
    definition: 'Acuity ratio balance',
    dataSource: 'Sensors',
    bands: [{ level: 'Meets' }, { level: 'Partial' }, { level: 'Fails' }],
    weight: 1.0,
    critical: false,
    evidence: 'P',
    refs: [],
    code: 'CSW-03',
    isCritical: false,
    evidenceClassification: 'P',
    description: 'Acuity ratio balance',
    guidance: 'Guidance',
    thresholds: { pass: 90, warning: 80, fail: 70 },
    unit: '%',
    metricType: 'percentage',
    safetyGateCap: null,
  },
];

// Helper to create a 20-indicator fixture
function createTwentyIndicators(): { pillars: Pillar[]; indicators: Indicator[] } {
  const pillars: Pillar[] = [
    { id: 'P1', name: 'Pillar 1', description: 'P1', ordering: 1, weight: 0.2 },
    { id: 'P2', name: 'Pillar 2', description: 'P2', ordering: 2, weight: 0.2 },
    { id: 'P3', name: 'Pillar 3', description: 'P3', ordering: 3, weight: 0.2 },
    { id: 'P4', name: 'Pillar 4', description: 'P4', ordering: 4, weight: 0.2 },
    { id: 'P5', name: 'Pillar 5', description: 'P5', ordering: 5, weight: 0.2 },
  ];

  const indicators: Indicator[] = [];
  pillars.forEach((p) => {
    for (let i = 1; i <= 4; i++) {
      const id = `${p.id}-0${i}`;
      const isCritical = i === 1; // 1st indicator in each pillar is critical
      indicators.push({
        id,
        pillarId: p.id,
        name: `Indicator ${id}`,
        definition: `Definition ${id}`,
        dataSource: 'Log',
        bands: [{ level: 'Meets' }, { level: 'Partial' }, { level: 'Fails' }],
        weight: 1.0,
        critical: isCritical,
        evidence: 'E',
        refs: [],
        code: id,
        isCritical,
        evidenceClassification: 'E',
        description: `Definition ${id}`,
        guidance: 'Guidance',
        thresholds: { pass: 90, warning: 80, fail: 70 },
        unit: '%',
        metricType: 'percentage',
        safetyGateCap: isCritical ? 'Conditional' : null,
      });
    }
  });

  return { pillars, indicators };
}

// 1. Meets = 100
test('1. Meets band evaluates to score 100', () => {
  const score = scoreDiscreteBand('Meets');
  assert(score === 100, `Expected 100, got ${score}`);

  const res = evaluateIndicatorScore(sampleIndicators[0], 'Meets');
  assert(res.score === 100, `Expected evaluated score 100, got ${res.score}`);
  assert(res.status === 'assessed', `Expected status assessed, got ${res.status}`);
  assert(res.band === 'Meets', `Expected band Meets, got ${res.band}`);
});

// 2. Partial = 50
test('2. Partial band evaluates to score 50', () => {
  const score = scoreDiscreteBand('Partial');
  assert(score === 50, `Expected 50, got ${score}`);

  const res = evaluateIndicatorScore(sampleIndicators[0], 'Partial');
  assert(res.score === 50, `Expected evaluated score 50, got ${res.score}`);
  assert(res.band === 'Partial', `Expected band Partial, got ${res.band}`);
});

// 3. Fails = 0
test('3. Fails band evaluates to score 0', () => {
  const score = scoreDiscreteBand('Fails');
  assert(score === 0, `Expected 0, got ${score}`);

  const res = evaluateIndicatorScore(sampleIndicators[0], 'Fails');
  assert(res.score === 0, `Expected evaluated score 0, got ${res.score}`);
  assert(res.band === 'Fails', `Expected band Fails, got ${res.band}`);
});

// 4. Not Assessed is excluded
test('4. Not Assessed indicator is excluded from score (returns null, not 0)', () => {
  const res1 = evaluateIndicatorScore(sampleIndicators[0], null);
  assert(res1.score === null, `Expected score null, got ${res1.score}`);
  assert(res1.status === 'not_assessed', `Expected status not_assessed, got ${res1.status}`);

  const res2 = evaluateIndicatorScore(sampleIndicators[0], { indicatorId: 'CSP-01', status: 'not_assessed' });
  assert(res2.score === null, 'Expected score null for explicit not_assessed status');
  assert(res2.status === 'not_assessed', 'Expected status not_assessed');
});

// 5. Weighted pillar score is correct
test('5. Weighted pillar score correctly weights assessed indicators', () => {
  // CSP-01 (weight 2.0, Meets = 100)
  // CSP-02 (weight 1.0, Partial = 50)
  // Expected: (100 * 2.0 + 50 * 1.0) / (2.0 + 1.0) = 250 / 3 = 83.3333...
  const indicatorResults: Record<string, IndicatorScoringResult> = {
    'CSP-01': evaluateIndicatorScore(sampleIndicators[0], 'Meets'),
    'CSP-02': evaluateIndicatorScore(sampleIndicators[1], 'Partial'),
  };

  const pillarRes = calculatePillarScore(samplePillars[0], sampleIndicators, indicatorResults);
  assert(pillarRes.status === 'assessed', 'Pillar should be assessed');
  assert(pillarRes.score !== null, 'Pillar score must not be null');
  assert(Math.abs(pillarRes.score! - 83.33333333333333) < 0.0001, `Expected ~83.333, got ${pillarRes.score}`);
  assert(pillarRes.assessedWeight === 3.0, 'Total assessed weight should be 3.0');
});

// 6. Unassessed indicators are excluded from pillar denominator
test('6. Unassessed indicators are excluded from pillar denominator and numerator', () => {
  // CSP-01 (weight 2.0, Meets = 100)
  // CSP-02 (weight 1.0, Not Assessed)
  // Expected: (100 * 2.0) / (2.0) = 100 (NOT (100 * 2.0) / 3.0 = 66.67)
  const indicatorResults: Record<string, IndicatorScoringResult> = {
    'CSP-01': evaluateIndicatorScore(sampleIndicators[0], 'Meets'),
    'CSP-02': evaluateIndicatorScore(sampleIndicators[1], null),
  };

  const pillarRes = calculatePillarScore(samplePillars[0], sampleIndicators, indicatorResults);
  assert(pillarRes.status === 'assessed', 'Pillar should be assessed');
  assert(pillarRes.score === 100, `Expected score 100, got ${pillarRes.score}`);
  assert(pillarRes.assessedWeight === 2.0, `Expected assessed weight 2.0, got ${pillarRes.assessedWeight}`);
  assert(pillarRes.totalWeight === 3.0, `Expected total weight 3.0, got ${pillarRes.totalWeight}`);
});

// 7. Overall weighted score is correct
test('7. Overall weighted score correctly averages pillar scores by pillar weights', () => {
  // CSP (weight 0.6, score 100)
  // CSW (weight 0.4, score 50)
  // Expected: (100 * 0.6 + 50 * 0.4) / (0.6 + 0.4) = (60 + 20) / 1.0 = 80
  const pillarResults = {
    CSP: {
      pillarId: 'CSP',
      name: 'CSP',
      weight: 0.6,
      status: 'assessed' as const,
      score: 100,
      assessedIndicatorCount: 2,
      totalIndicatorCount: 2,
      assessedWeight: 3.0,
      totalWeight: 3.0,
      indicatorIds: ['CSP-01', 'CSP-02'],
    },
    CSW: {
      pillarId: 'CSW',
      name: 'CSW',
      weight: 0.4,
      status: 'assessed' as const,
      score: 50,
      assessedIndicatorCount: 3,
      totalIndicatorCount: 3,
      assessedWeight: 5.0,
      totalWeight: 5.0,
      indicatorIds: ['CSW-01', 'CSW-02', 'CSW-03'],
    },
  };

  const overall = calculateOverallScore(samplePillars, pillarResults);
  assert(overall === 80, `Expected overall score 80, got ${overall}`);
});

// 8. Coverage calculation is correct
test('8. Coverage calculation returns (assessed / total * 100) safely', () => {
  // 16 of 20 = 80%
  const cov80 = calculateCoverage(16, 20);
  assert(cov80 === 80, `Expected 80, got ${cov80}`);

  // 15 of 20 = 75%
  const cov75 = calculateCoverage(15, 20);
  assert(cov75 === 75, `Expected 75, got ${cov75}`);

  // 0 of 0 safe division
  const cov0 = calculateCoverage(0, 0);
  assert(cov0 === 0, `Expected 0 for 0 total, got ${cov0}`);
});

// 9. Coverage below 80% results in no tier
test('9. Coverage below 80% results in no tier (tier = null, coverageGatePassed = false)', () => {
  const { pillars, indicators } = createTwentyIndicators();
  // 15 of 20 assessed = 75% coverage (< 80%)
  const assessments: Record<string, 'Meets'> = {};
  for (let i = 0; i < 15; i++) {
    assessments[indicators[i].id] = 'Meets';
  }

  const result = computeAuditScore(indicators, pillars, assessments);
  assert(result.coverage === 75, `Expected coverage 75%, got ${result.coverage}%`);
  assert(result.coverageGatePassed === false, 'Expected coverageGatePassed to be false');
  assert(result.tier === null, `Expected tier to be null, got ${result.tier}`);
  assert(result.finalTier === null, `Expected finalTier to be null, got ${result.finalTier}`);
  assert(result.overallScore === 100, `Score is still computed: ${result.overallScore}`);
  assert(typeof result.coverageReason === 'string', 'Expected informative coverageReason');
});

// 10. Coverage exactly 80% permits tier assignment
test('10. Coverage exactly 80% permits tier assignment', () => {
  const { pillars, indicators } = createTwentyIndicators();
  // Exactly 16 of 20 assessed = 80.0% coverage
  const assessments: Record<string, 'Meets'> = {};
  for (let i = 0; i < 16; i++) {
    assessments[indicators[i].id] = 'Meets';
  }

  const result = computeAuditScore(indicators, pillars, assessments);
  assert(result.coverage === 80, `Expected coverage 80%, got ${result.coverage}%`);
  assert(result.coverageGatePassed === true, 'Expected coverageGatePassed to be true');
  assert(result.tier === 'Hospital-Grade', `Expected Hospital-Grade, got ${result.tier}`);
});

// 11. 85 boundary produces Hospital-Grade when no gate applies
test('11. Score boundaries: 84.99 produces Approaching, 85 produces Hospital-Grade', () => {
  const tier85 = determineTier(85);
  assert(tier85 === 'Hospital-Grade', `Expected Hospital-Grade for 85, got ${tier85}`);

  const tier8499 = determineTier(84.99);
  assert(tier8499 === 'Approaching', `Expected Approaching for 84.99, got ${tier8499}`);
});

// 12. 70 boundary produces Approaching when appropriate
test('12. Score boundaries: 69.99 produces Conditional, 70 produces Approaching', () => {
  const tier70 = determineTier(70);
  assert(tier70 === 'Approaching', `Expected Approaching for 70, got ${tier70}`);

  const tier6999 = determineTier(69.99);
  assert(tier6999 === 'Conditional', `Expected Conditional for 69.99, got ${tier6999}`);
});

// 13. 50 boundary produces Conditional when appropriate
test('13. Score boundaries: 50 produces Conditional, 49.99 produces Not met', () => {
  const tier50 = determineTier(50);
  assert(tier50 === 'Conditional', `Expected Conditional for 50, got ${tier50}`);

  const tier4999 = determineTier(49.99);
  assert(tier4999 === 'Not met', `Expected Not met for 49.99, got ${tier4999}`);
});

// 14. Below 50 produces Not met
test('14. Score below 50 produces Not met', () => {
  const tier30 = determineTier(30);
  assert(tier30 === 'Not met', `Expected Not met for 30, got ${tier30}`);

  const tier0 = determineTier(0);
  assert(tier0 === 'Not met', `Expected Not met for 0, got ${tier0}`);
});

// 15. Critical Fails triggers Safety Gate
test('15. Critical indicator scoring Fails triggers Safety Gate', () => {
  const { pillars, indicators } = createTwentyIndicators();
  const assessments: Record<string, 'Meets' | 'Fails'> = {};
  indicators.forEach(ind => {
    assessments[ind.id] = 'Meets';
  });

  // Fail critical indicator P1-01
  assessments['P1-01'] = 'Fails';

  const result = computeAuditScore(indicators, pillars, assessments);
  assert(result.safetyGateTriggered === true, 'Safety Gate must trigger on critical Fails');
  assert(result.safetyGateIndicators.includes('P1-01'), 'Failed critical ID P1-01 must be listed');
});

// 16. Non-critical Fails does not trigger Safety Gate
test('16. Non-critical indicator scoring Fails does not trigger Safety Gate', () => {
  const { pillars, indicators } = createTwentyIndicators();
  const assessments: Record<string, 'Meets' | 'Fails'> = {};
  indicators.forEach(ind => {
    assessments[ind.id] = 'Meets';
  });

  // P1-02 is non-critical
  assessments['P1-02'] = 'Fails';

  const result = computeAuditScore(indicators, pillars, assessments);
  assert(result.safetyGateTriggered === false, 'Safety Gate must NOT trigger on non-critical Fails');
  assert(result.safetyGateIndicators.length === 0, 'No safety gate indicators should be reported');
});

// 17. Critical Not Assessed does not trigger Safety Gate
test('17. Critical indicator that is Not Assessed does not trigger Safety Gate', () => {
  const { pillars, indicators } = createTwentyIndicators();
  const assessments: Record<string, 'Meets'> = {};
  // Assess 19 of 20 indicators (95% coverage)
  indicators.forEach(ind => {
    if (ind.id !== 'P1-01') {
      assessments[ind.id] = 'Meets';
    }
  });
  // P1-01 (critical) is unassessed

  const result = computeAuditScore(indicators, pillars, assessments);
  assert(result.safetyGateTriggered === false, 'Unassessed critical indicator must NOT trigger Safety Gate');
  assert(result.safetyGateIndicators.length === 0, 'No failed critical indicators should be listed');
});

// 18. Safety Gate caps a high calculated tier to Conditional
test('18. Safety Gate caps Hospital-Grade down to Conditional without changing numerical score', () => {
  const { pillars, indicators } = createTwentyIndicators();
  const assessments: Record<string, 'Meets' | 'Fails'> = {};
  indicators.forEach(ind => {
    assessments[ind.id] = 'Meets';
  });
  // Fail critical indicator P1-01 (1 of 20 fails, 19 meet => high numerical score ~95)
  assessments['P1-01'] = 'Fails';

  const result = computeAuditScore(indicators, pillars, assessments);
  assert(result.overallScore! >= 85, `Overall score should be high (>= 85): ${result.overallScore}`);
  assert(result.calculatedTier === 'Hospital-Grade', `Calculated tier should be Hospital-Grade, got ${result.calculatedTier}`);
  assert(result.finalTier === 'Conditional', `Final tier must be capped at Conditional, got ${result.finalTier}`);
  assert(result.tier === 'Conditional', `Tier alias must be Conditional, got ${result.tier}`);
});

// 19. Safety Gate does not alter numerical overall score
test('19. Safety Gate does not alter numerical overall score', () => {
  const { pillars, indicators } = createTwentyIndicators();
  const assessments: Record<string, 'Meets' | 'Fails'> = {};
  indicators.forEach(ind => {
    assessments[ind.id] = 'Meets';
  });
  assessments['P1-01'] = 'Fails'; // weight 1.0, 19 meet * weight 1.0 => 1900 / 20 = 95.0

  const result = computeAuditScore(indicators, pillars, assessments);
  assert(result.overallScore === 95, `Expected exactly 95, got ${result.overallScore}`);
  assert(result.safetyGateTriggered === true, 'Safety gate triggered');
  // Confirm the numerical score was not reduced to 50 or 0
  assert(result.overallScore === 95, 'Numerical score remained 95');
});

// 20. Multiple critical failures are reported
test('20. Multiple critical failures are all captured in safetyGateIndicators', () => {
  const { pillars, indicators } = createTwentyIndicators();
  const assessments: Record<string, 'Meets' | 'Fails'> = {};
  indicators.forEach(ind => {
    assessments[ind.id] = 'Meets';
  });

  // Fail critical indicators P1-01, P2-01, and P3-01
  assessments['P1-01'] = 'Fails';
  assessments['P2-01'] = 'Fails';
  assessments['P3-01'] = 'Fails';

  const result = computeAuditScore(indicators, pillars, assessments);
  assert(result.safetyGateTriggered === true, 'Safety gate must trigger');
  assert(result.safetyGateIndicators.length === 3, `Expected 3 failed critical indicators, got ${result.safetyGateIndicators.length}`);
  assert(result.safetyGateIndicators.includes('P1-01'), 'Contains P1-01');
  assert(result.safetyGateIndicators.includes('P2-01'), 'Contains P2-01');
  assert(result.safetyGateIndicators.includes('P3-01'), 'Contains P3-01');
});

// 21. Zero-weight/invalid input is rejected
test('21. Zero-weight and invalid inputs are rejected with clear errors', () => {
  const { pillars, indicators } = createTwentyIndicators();

  // Test zero indicator weight
  let threwZeroWeight = false;
  try {
    const corruptInds = JSON.parse(JSON.stringify(indicators));
    corruptInds[0].weight = 0;
    computeAuditScore(corruptInds, pillars, {});
  } catch (err: unknown) {
    threwZeroWeight = true;
    assert((err as Error).message.includes('invalid weight'), 'Error mentions invalid weight');
  }
  assert(threwZeroWeight, 'Should reject zero indicator weight');

  // Test negative weight
  let threwNegativeWeight = false;
  try {
    const corruptInds = JSON.parse(JSON.stringify(indicators));
    corruptInds[0].weight = -2;
    computeAuditScore(corruptInds, pillars, {});
  } catch (err: unknown) {
    threwNegativeWeight = true;
  }
  assert(threwNegativeWeight, 'Should reject negative indicator weight');

  // Test empty indicators array
  let threwEmptyIndicators = false;
  try {
    computeAuditScore([], pillars, {});
  } catch (err: unknown) {
    threwEmptyIndicators = true;
    assert((err as Error).message.includes('non-empty indicators'), 'Error mentions non-empty indicators');
  }
  assert(threwEmptyIndicators, 'Should reject empty indicators array');

  // Test unknown indicator in assessment
  let threwUnknownAssessment = false;
  try {
    computeAuditScore(indicators, pillars, { 'UNKNOWN-999': 'Meets' });
  } catch (err: unknown) {
    threwUnknownAssessment = true;
    assert((err as Error).message.includes('unknown indicator ID'), 'Error mentions unknown indicator ID');
  }
  assert(threwUnknownAssessment, 'Should reject assessment with unknown indicator ID');

  // Test invalid discrete band
  let threwInvalidBand = false;
  try {
    computeAuditScore(indicators, pillars, { [indicators[0].id]: 'InvalidBand' as any });
  } catch (err: unknown) {
    threwInvalidBand = true;
    assert((err as Error).message.includes('invalid band'), 'Error mentions invalid band');
  }
  assert(threwInvalidBand, 'Should reject invalid discrete band');

  // Test duplicate indicator ID
  let threwDuplicateInd = false;
  try {
    const dupInds = [...indicators, { ...indicators[0] }];
    computeAuditScore(dupInds, pillars, {});
  } catch (err: unknown) {
    threwDuplicateInd = true;
    assert((err as Error).message.includes('Duplicate indicator ID'), 'Error mentions duplicate ID');
  }
  assert(threwDuplicateInd, 'Should reject duplicate indicator ID');
});

// 22. Engine gives deterministic results for identical inputs
test('22. Engine is strictly deterministic across repeated executions', () => {
  const { pillars, indicators } = createTwentyIndicators();
  const assessments: Record<string, 'Meets' | 'Partial' | 'Fails'> = {
    'P1-01': 'Meets',
    'P1-02': 'Partial',
    'P1-03': 'Fails',
    'P2-01': 'Meets',
    'P2-02': 'Meets',
    'P3-01': 'Partial',
    'P3-02': 'Fails',
    'P4-01': 'Meets',
    'P4-02': 'Meets',
    'P4-03': 'Partial',
    'P5-01': 'Meets',
    'P5-02': 'Meets',
    'P5-03': 'Partial',
    'P5-04': 'Meets',
  };

  const run1 = computeAuditScore(indicators, pillars, assessments);
  const run2 = computeAuditScore(indicators, pillars, assessments);
  const run3 = computeAuditScore(indicators, pillars, assessments);

  assert(JSON.stringify(run1) === JSON.stringify(run2), 'Run 1 and Run 2 must be bit-for-bit identical');
  assert(JSON.stringify(run2) === JSON.stringify(run3), 'Run 2 and Run 3 must be bit-for-bit identical');
  assert(run1.overallScore === run2.overallScore, 'Overall score identical');
  assert(run1.coverage === run2.coverage, 'Coverage identical');
  assert(run1.finalTier === run2.finalTier, 'Tier identical');
});

console.log(`\nResults: ${passed} of ${total} pure scoring engine unit tests passed.`);
if (passed !== total) {
  process.exit(1);
}
