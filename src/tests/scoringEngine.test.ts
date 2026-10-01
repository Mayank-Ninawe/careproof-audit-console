/**
 * CareProof Audit Console - Scoring Engine Unit & Determinism Test Suite
 * Validates:
 * 1. Normal scoring & linear interpolation
 * 2. Weighted scoring across pillars and indicators
 * 3. Missing/not-assessed indicators handling
 * 4. Coverage % calculation
 * 5. Critical indicator failure detection
 * 6. Safety gate tier cap (e.g. capping Tier 1 down to Tier 3 when critical indicator fails)
 * 7. Tier boundaries (90, 75, 60)
 * 8. Edge cases (0% values, boundary values, empty assessments)
 * 9. Deterministic behavior (same seed + inputs = exact same results)
 */

import {
  CANONICAL_STANDARD,
  computeAuditScore,
  determineTier,
  evaluateIndicator,
  generateSimulatedAuditRecord,
} from '../scoring/scoringEngine';
import { IndicatorAssessment } from '../types/standard';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST ASSERTION FAILED: ${message}`);
  }
}

function runTests() {
  console.log('=== CareProof Audit Console Scoring Engine Tests ===\n');
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

  // 1. Normal scoring
  test('Normal scoring evaluates 100% when exceeding pass threshold', () => {
    const ind = CANONICAL_STANDARD.indicators.find(i => i.id === 'CSP-01')!;
    const assessment: IndicatorAssessment = {
      indicatorId: 'CSP-01',
      status: 'assessed',
      measuredValue: 98,
    };
    const result = evaluateIndicator(ind, assessment);
    assert(result.evaluatedScore === 100, `Expected 100, got ${result.evaluatedScore}`);
    assert(result.band === 'pass', `Expected pass band, got ${result.band}`);
  });

  test('Normal scoring evaluates 0% when at or below fail threshold', () => {
    const ind = CANONICAL_STANDARD.indicators.find(i => i.id === 'CSP-01')!; // pass 95, fail 80
    const assessment: IndicatorAssessment = {
      indicatorId: 'CSP-01',
      status: 'assessed',
      measuredValue: 75,
    };
    const result = evaluateIndicator(ind, assessment);
    assert(result.evaluatedScore === 0, `Expected 0, got ${result.evaluatedScore}`);
    assert(result.band === 'fail', `Expected fail band, got ${result.band}`);
  });

  test('Normal scoring linearly interpolates value between fail and pass', () => {
    const ind = CANONICAL_STANDARD.indicators.find(i => i.id === 'CSP-01')!; // pass 95, fail 80. mid is 87.5 => 50%
    const assessment: IndicatorAssessment = {
      indicatorId: 'CSP-01',
      status: 'assessed',
      measuredValue: 87.5,
    };
    const result = evaluateIndicator(ind, assessment);
    assert(result.evaluatedScore === 50, `Expected 50, got ${result.evaluatedScore}`);
  });

  // 2. Weighted scoring
  test('Weighted scoring properly calculates pillar score by indicator weights', () => {
    const assessments: Record<string, IndicatorAssessment> = {};
    // Test CSP pillar
    const cspIndicators = CANONICAL_STANDARD.indicators.filter(i => i.pillarId === 'CSP');
    for (const ind of cspIndicators) {
      assessments[ind.id] = {
        indicatorId: ind.id,
        status: 'assessed',
        measuredValue: ind.thresholds.pass,
      };
    }
    const scoreResult = computeAuditScore(assessments);
    assert(scoreResult.pillarScores['CSP'].rawPillarScore === 100, 'All pass should yield 100 in CSP');
  });

  // 3. Missing/not-assessed indicators
  test('Missing/not-assessed indicators are excluded from pillar average and reduce coverage', () => {
    const assessments: Record<string, IndicatorAssessment> = {};
    // Only assess CSP-01
    assessments['CSP-01'] = {
      indicatorId: 'CSP-01',
      status: 'assessed',
      measuredValue: 96,
    };
    const scoreResult = computeAuditScore(assessments);
    assert(scoreResult.pillarScores['CSP'].assessedIndicatorsCount === 1, 'Only 1 assessed');
    assert(scoreResult.pillarScores['CSP'].coveragePercent < 100, 'Coverage must be < 100%');
    assert(scoreResult.summary.notAssessedIndicators === CANONICAL_STANDARD.indicators.length - 1, 'Rest not assessed');
  });

  // 4. Coverage calculation
  test('Coverage calculation correctly reflects total assessed weight vs total weight', () => {
    const assessments: Record<string, IndicatorAssessment> = {};
    let totalWeight = 0;
    for (const ind of CANONICAL_STANDARD.indicators) {
      totalWeight += ind.weight;
      assessments[ind.id] = {
        indicatorId: ind.id,
        status: 'assessed',
        measuredValue: ind.thresholds.pass,
      };
    }
    const scoreResult = computeAuditScore(assessments);
    assert(scoreResult.confidence.coveragePercent === 100, '100% coverage when all assessed');
  });

  // 5. Critical indicator failure detection
  test('Critical indicator failure trips safety gate', () => {
    const assessments: Record<string, IndicatorAssessment> = {};
    for (const ind of CANONICAL_STANDARD.indicators) {
      assessments[ind.id] = {
        indicatorId: ind.id,
        status: 'assessed',
        measuredValue: ind.thresholds.pass,
      };
    }
    // Deliberately fail critical indicator CSP-01 (Medication Dual-Verification, pass 95, fail 80)
    assessments['CSP-01'] = {
      indicatorId: 'CSP-01',
      status: 'assessed',
      measuredValue: 72, // Below fail threshold!
    };

    const scoreResult = computeAuditScore(assessments);
    assert(scoreResult.safetyGate.tripped === true, 'Safety gate MUST be tripped when critical indicator fails');
    assert(scoreResult.safetyGate.violations.length >= 1, 'At least 1 violation logged');
    assert(scoreResult.safetyGate.violations[0].indicatorId === 'CSP-01', 'CSP-01 violation recorded');
  });

  // 6. Safety gate tier cap
  test('Safety gate caps Tier 1 score down to Tier 3 when tripped', () => {
    const assessments: Record<string, IndicatorAssessment> = {};
    for (const ind of CANONICAL_STANDARD.indicators) {
      assessments[ind.id] = {
        indicatorId: ind.id,
        status: 'assessed',
        measuredValue: ind.thresholds.pass + 2,
      };
    }
    // Fail one critical indicator
    assessments['CSP-01'] = {
      indicatorId: 'CSP-01',
      status: 'assessed',
      measuredValue: 70,
    };

    const scoreResult = computeAuditScore(assessments);
    // Uncapped would be Tier 1 because 19/20 indicators are 100%
    assert(scoreResult.uncappedTier === 'Tier 1', `Expected uncapped Tier 1, got ${scoreResult.uncappedTier}`);
    assert(scoreResult.assignedTier === 'Tier 3', `Expected assigned Tier 3 due to cap, got ${scoreResult.assignedTier}`);
    assert(scoreResult.tierCappedBySafetyGate === true, 'Flag tierCappedBySafetyGate must be true');
  });

  // 7. Tier boundaries
  test('Tier boundaries assign Tier 1 (>=90), Tier 2 (>=75), Tier 3 (>=60), Tier 4 (<60)', () => {
    const cleanSafetyGate = { tripped: false, trippedCount: 0, maxAchievableTier: 'Tier 1' as const, violations: [] };

    assert(determineTier(90, 85, cleanSafetyGate).assignedTier === 'Tier 1', '90 score with 85% coverage = Tier 1');
    assert(determineTier(89.9, 85, cleanSafetyGate).assignedTier === 'Tier 2', '89.9 score = Tier 2');
    assert(determineTier(75, 70, cleanSafetyGate).assignedTier === 'Tier 2', '75 score with 70% coverage = Tier 2');
    assert(determineTier(74.9, 70, cleanSafetyGate).assignedTier === 'Tier 3', '74.9 score = Tier 3');
    assert(determineTier(60, 50, cleanSafetyGate).assignedTier === 'Tier 3', '60 score with 50% coverage = Tier 3');
    assert(determineTier(59.9, 50, cleanSafetyGate).assignedTier === 'Tier 4', '59.9 score = Tier 4');
  });

  // 8. Edge cases: empty assessments and reverse metrics (isLowerBetter)
  test('Empty assessments produce 0 score, 0 coverage, Tier 4', () => {
    const scoreResult = computeAuditScore({});
    assert(scoreResult.compositeScore === 0, 'Score is 0');
    assert(scoreResult.confidence.coveragePercent === 0, 'Coverage is 0');
    assert(scoreResult.assignedTier === 'Tier 4', 'Tier is 4');
  });

  test('isLowerBetter indicator (PMI-01 latency) scores 100 when <= pass and 0 when >= fail', () => {
    const ind = CANONICAL_STANDARD.indicators.find(i => i.id === 'PMI-01')!; // pass 60s, fail 180s
    assert(ind.isLowerBetter === true, 'PMI-01 isLowerBetter must be true');

    const passResult = evaluateIndicator(ind, { indicatorId: 'PMI-01', status: 'assessed', measuredValue: 45 });
    assert(passResult.evaluatedScore === 100, `45s should score 100, got ${passResult.evaluatedScore}`);
    assert(passResult.band === 'pass', 'band should be pass');

    const failResult = evaluateIndicator(ind, { indicatorId: 'PMI-01', status: 'assessed', measuredValue: 200 });
    assert(failResult.evaluatedScore === 0, `200s should score 0, got ${failResult.evaluatedScore}`);
    assert(failResult.band === 'fail', 'band should be fail');
  });

  // 9. Deterministic behavior
  test('Deterministic simulator produces identical outputs for the same seed and inputs', () => {
    const seed = 42819;
    const run1 = generateSimulatedAuditRecord(seed, 'St. Jude Acute Care');
    const run2 = generateSimulatedAuditRecord(seed, 'St. Jude Acute Care');

    assert(run1.scoreResult?.compositeScore === run2.scoreResult?.compositeScore, 'Composite scores must match');
    assert(run1.scoreResult?.assignedTier === run2.scoreResult?.assignedTier, 'Tiers must match');
    assert(run1.scoreResult?.safetyGate.tripped === run2.scoreResult?.safetyGate.tripped, 'Safety gate must match');

    // Indicator-level values match
    for (const key of Object.keys(run1.assessments)) {
      assert(run1.assessments[key].measuredValue === run2.assessments[key].measuredValue, `Indicator ${key} values match`);
    }
  });

  console.log(`\nResults: ${passed} of ${total} tests passed.`);
  if (passed !== total) {
    throw new Error(`${total - passed} tests failed.`);
  }
}

runTests();
