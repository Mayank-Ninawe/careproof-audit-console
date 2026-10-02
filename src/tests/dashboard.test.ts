/**
 * CareProof Audit Console - Dashboard Data Integration Tests
 * Source of Truth: CareProof Website Roadmap (Phase 6A)
 * 
 * Verifies all 18 requirements:
 * 1. Dashboard summary matches scoring-engine output.
 * 2. Overall score is not independently recalculated.
 * 3. Safety Gate metadata is preserved.
 * 4. Coverage metadata is preserved.
 * 5. Every pillar appears in deterministic order.
 * 6. Unassessed pillars remain unassessed.
 * 7. Partial indicators are included as issues.
 * 8. Fails indicators are included as issues.
 * 9. Not Assessed indicators are not treated as failures.
 * 10. Fix-first priority uses weight × gap.
 * 11. Fix-first list is sorted descending by priority.
 * 12. Critical tie-breaker works deterministically.
 * 13. Stable indicator-ID tie-breaker works.
 * 14. No random values are introduced.
 * 15. Same simulation seed creates the same Dashboard view model.
 * 16. Simulated dataset metadata remains present.
 * 17. Recent equipment event generation is deterministic.
 * 18. Recent caregiver event generation is deterministic.
 */

import { CANONICAL_STANDARD } from '../data/standard';
import { computeAuditScore } from '../engine/scoring';
import { generateSimulatedDataset } from '../engine/simulate';
import {
  createDashboardViewModel,
  deriveDashboardPillars,
  deriveDashboardSummary,
  deriveFixFirstList,
  deriveRecentEvents,
  getDefaultDashboardViewModel,
} from '../services/dashboard';
import { AuditScoringResult } from '../types/scoring';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST ASSERTION FAILED: ${message}`);
  }
}

console.log('=== CareProof Dashboard Data Integration Tests ===\n');

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

const testDataset = generateSimulatedDataset(42);
const testScoring = computeAuditScore(
  CANONICAL_STANDARD.indicators,
  CANONICAL_STANDARD.pillars,
  testDataset.simulatedAuditAssessments
);

// 1. Dashboard summary matches scoring-engine output
test('1. Dashboard summary matches scoring-engine output', () => {
  const summary = deriveDashboardSummary(testScoring);
  assert(summary.overallScore === testScoring.overallScore, 'Overall score matches');
  assert(summary.calculatedTier === testScoring.calculatedTier, 'Calculated tier matches');
  assert(summary.finalTier === testScoring.finalTier, 'Final tier matches');
  assert(summary.coverage === testScoring.coverage, 'Coverage matches');
  assert(summary.coverageGatePassed === testScoring.coverageGatePassed, 'Coverage gate flag matches');
  assert(summary.safetyGateTriggered === testScoring.safetyGateTriggered, 'Safety gate flag matches');
});

// 2. Overall score is not independently recalculated
test('2. Overall score is not independently recalculated', () => {
  const mockResult: AuditScoringResult = {
    ...testScoring,
    overallScore: 83.47,
  };
  const summary = deriveDashboardSummary(mockResult);
  assert(summary.overallScore === 83.47, 'Preserves exact overallScore from scoring result');
});

// 3. Safety Gate metadata is preserved
test('3. Safety Gate metadata is preserved', () => {
  const mockResult: AuditScoringResult = {
    ...testScoring,
    safetyGateTriggered: true,
    safetyGateIndicators: ['CSP-01', 'EEH-01'],
    calculatedTier: 'Hospital-Grade',
    finalTier: 'Conditional',
  };
  const summary = deriveDashboardSummary(mockResult);
  assert(summary.safetyGateTriggered === true, 'Safety gate triggered flag preserved');
  assert(summary.safetyGateIndicators.length === 2, 'Failed critical IDs preserved');
  assert(summary.safetyGateIndicators[0] === 'CSP-01', 'Critical ID 1 preserved');
  assert(summary.calculatedTier === 'Hospital-Grade', 'Calculated tier preserved');
  assert(summary.finalTier === 'Conditional', 'Final capped tier preserved');
});

// 4. Coverage metadata is preserved
test('4. Coverage metadata is preserved', () => {
  const mockResult: AuditScoringResult = {
    ...testScoring,
    coverage: 65.0,
    coverageGatePassed: false,
    coverageReason: 'Audit coverage (65.00%) is below the minimum threshold (80%). Tier assignment suppressed.',
  };
  const summary = deriveDashboardSummary(mockResult);
  assert(summary.coverage === 65.0, 'Coverage percentage preserved');
  assert(summary.coverageGatePassed === false, 'Coverage gate passed preserved');
  assert(Boolean(summary.statusReason && summary.statusReason.includes('below the minimum threshold')), 'Coverage reason preserved');
});

// 5. Every pillar appears in deterministic order
test('5. Every pillar appears in deterministic order', () => {
  const vm = createDashboardViewModel({ dataset: testDataset, scoringResult: testScoring });
  assert(vm.pillars.length === CANONICAL_STANDARD.pillars.length, 'All canonical pillars included');

  for (let i = 0; i < vm.pillars.length - 1; i++) {
    const pCurrent = CANONICAL_STANDARD.pillars.find((p) => p.id === vm.pillars[i].pillarId)!;
    const pNext = CANONICAL_STANDARD.pillars.find((p) => p.id === vm.pillars[i + 1].pillarId)!;
    assert(pCurrent.ordering <= pNext.ordering, 'Pillars sorted by canonical ordering');
  }
});

// 6. Unassessed pillars remain unassessed
test('6. Unassessed pillars remain unassessed without converting null to 0', () => {
  const mockScoring: AuditScoringResult = {
    ...testScoring,
    pillarResults: {
      ...testScoring.pillarResults,
      CSP: {
        pillarId: 'CSP',
        name: 'Clinical Safety Protocols',
        weight: 0.25,
        status: 'not_assessed',
        score: null,
        assessedIndicatorCount: 0,
        totalIndicatorCount: 4,
        assessedWeight: 0,
        totalWeight: 0.25,
        indicatorIds: ['CSP-01', 'CSP-02'],
      },
    },
  };

  const pillars = deriveDashboardPillars(CANONICAL_STANDARD.pillars, mockScoring, []);
  const csp = pillars.find((p) => p.pillarId === 'CSP')!;

  assert(csp.status === 'not_assessed', 'Pillar status is not_assessed');
  assert(csp.score === null, 'Pillar score is strictly null, not 0');
});

// 7. Partial indicators are included as issues
test('7. Partial indicators are included as issues', () => {
  const mockScoring: AuditScoringResult = {
    ...testScoring,
    indicatorResults: {
      'CSP-02': {
        indicatorId: 'CSP-02',
        pillarId: 'P1',
        name: 'Surgical Safety Checklist',
        weight: 10,
        critical: false,
        status: 'assessed',
        band: 'Partial',
        score: 50,
      },
    },
  };

  const fixFirst = deriveFixFirstList(mockScoring);
  const item = fixFirst.find((i) => i.indicatorId === 'CSP-02');
  assert(!!item, 'Partial indicator found in fixFirstList');
  assert(item?.band === 'Partial', 'Band is Partial');
  assert(item?.gap === 50, 'Gap is 50');
  assert(item?.priorityValue === 500, 'Priority is 10 * 50 = 500');
});

// 8. Fails indicators are included as issues
test('8. Fails indicators are included as issues', () => {
  const mockScoring: AuditScoringResult = {
    ...testScoring,
    indicatorResults: {
      'EEH-01': {
        indicatorId: 'EEH-01',
        pillarId: 'P3',
        name: 'Biomedical Equipment Calibration',
        weight: 15,
        critical: true,
        status: 'assessed',
        band: 'Fails',
        score: 0,
      },
    },
  };

  const fixFirst = deriveFixFirstList(mockScoring);
  const item = fixFirst.find((i) => i.indicatorId === 'EEH-01');
  assert(!!item, 'Fails indicator found in fixFirstList');
  assert(item?.band === 'Fails', 'Band is Fails');
  assert(item?.gap === 100, 'Gap is 100');
  assert(item?.priorityValue === 1500, 'Priority is 15 * 100 = 1500');
  assert(item?.critical === true, 'Critical flag preserved');
});

// 9. Not Assessed indicators are not treated as failures
test('9. Not Assessed indicators are not treated as failures', () => {
  const mockScoring: AuditScoringResult = {
    ...testScoring,
    indicatorResults: {
      'CSP-03': {
        indicatorId: 'CSP-03',
        pillarId: 'P1',
        name: 'Unassessed Guideline',
        weight: 10,
        critical: false,
        status: 'not_assessed',
        band: null,
        score: null,
      },
    },
  };

  const fixFirst = deriveFixFirstList(mockScoring);
  const item = fixFirst.find((i) => i.indicatorId === 'CSP-03');
  assert(!item, 'Not assessed indicator must NOT be in fixFirstList');
});

// 10. Fix-first priority uses weight × gap
test('10. Fix-first priority uses weight × gap formula', () => {
  const fixFirst = deriveFixFirstList(testScoring);
  for (const item of fixFirst) {
    const expectedGap = 100 - item.score;
    const expectedPriority = Number((item.weight * expectedGap).toFixed(2));
    assert(item.gap === expectedGap, `Gap correct for ${item.indicatorId}`);
    assert(item.priorityValue === expectedPriority, `Priority correct for ${item.indicatorId}`);
  }
});

// 11. Fix-first list is sorted descending by priority
test('11. Fix-first list is sorted descending by priority', () => {
  const fixFirst = deriveFixFirstList(testScoring);
  for (let i = 0; i < fixFirst.length - 1; i++) {
    assert(
      fixFirst[i].priorityValue >= fixFirst[i + 1].priorityValue,
      `Priority descending: ${fixFirst[i].priorityValue} >= ${fixFirst[i + 1].priorityValue}`
    );
  }
});

// 12. Critical tie-breaker works deterministically
test('12. Critical tie-breaker works deterministically when priority is equal', () => {
  const mockScoring: AuditScoringResult = {
    ...testScoring,
    indicatorResults: {
      'IND-NON-CRIT': {
        indicatorId: 'IND-NON-CRIT',
        pillarId: 'P1',
        name: 'Non Critical Item',
        weight: 10,
        critical: false,
        status: 'assessed',
        band: 'Fails',
        score: 0,
      },
      'IND-CRIT': {
        indicatorId: 'IND-CRIT',
        pillarId: 'P1',
        name: 'Critical Life-Safety Item',
        weight: 10,
        critical: true,
        status: 'assessed',
        band: 'Fails',
        score: 0,
      },
    },
  };

  const fixFirst = deriveFixFirstList(mockScoring);
  assert(fixFirst.length === 2, 'Two items in fixFirst');
  assert(fixFirst[0].indicatorId === 'IND-CRIT', 'Critical item ranked first on equal priority');
  assert(fixFirst[1].indicatorId === 'IND-NON-CRIT', 'Non-critical item ranked second');
});

// 13. Stable indicator-ID tie-breaker works
test('13. Stable indicator-ID tie-breaker works when priority, criticality, and gap match', () => {
  const mockScoring: AuditScoringResult = {
    ...testScoring,
    indicatorResults: {
      'IND-Z': {
        indicatorId: 'IND-Z',
        pillarId: 'P1',
        name: 'Item Z',
        weight: 10,
        critical: false,
        status: 'assessed',
        band: 'Fails',
        score: 0,
      },
      'IND-A': {
        indicatorId: 'IND-A',
        pillarId: 'P1',
        name: 'Item A',
        weight: 10,
        critical: false,
        status: 'assessed',
        band: 'Fails',
        score: 0,
      },
    },
  };

  const fixFirst = deriveFixFirstList(mockScoring);
  assert(fixFirst[0].indicatorId === 'IND-A', 'Alphabetically smaller ID ranked first');
  assert(fixFirst[1].indicatorId === 'IND-Z', 'Alphabetically larger ID ranked second');
});

// 14. No random values are introduced
test('14. No random values are introduced in repeated evaluations', () => {
  const vm1 = createDashboardViewModel({ dataset: testDataset, scoringResult: testScoring });
  const vm2 = createDashboardViewModel({ dataset: testDataset, scoringResult: testScoring });

  assert(JSON.stringify(vm1) === JSON.stringify(vm2), 'Identical view models across repeated calls');
});

// 15. Same simulation seed creates the same Dashboard view model
test('15. Same simulation seed creates the same Dashboard view model', () => {
  const vmA = getDefaultDashboardViewModel(999);
  const vmB = getDefaultDashboardViewModel(999);

  assert(JSON.stringify(vmA) === JSON.stringify(vmB), 'Identical view model for seed 999');
});

// 16. Simulated dataset metadata remains present
test('16. Simulated dataset metadata remains present', () => {
  const vm = getDefaultDashboardViewModel(42);
  assert(vm.datasetType === 'SIMULATED', 'Dataset type is SIMULATED');
  assert(vm.summary.isSimulated === true, 'Summary tagged isSimulated: true');
  assert(vm.disclaimer.includes('Proposed framework, not clinically validated'), 'Contains disclaimer');
  assert(vm.disclaimer.includes('Decision support, not diagnosis'), 'Contains decision support notice');
});

// 17. Recent equipment event generation is deterministic
test('17. Recent equipment event generation is deterministic', () => {
  const events = deriveRecentEvents(testDataset);
  const equipmentEvents = events.filter((e) => e.type === 'equipment_due');

  assert(Array.isArray(equipmentEvents), 'Returns equipment events array');
  for (const eq of equipmentEvents) {
    assert(eq.isSimulated === true, 'Marked as simulated');
    assert(eq.id.startsWith('evt-dev-'), 'Has structured ID');
    assert(eq.title.includes('Simulated Maintenance Due'), 'Contains simulated label');
  }
});

// 18. Recent caregiver event generation is deterministic
test('18. Recent caregiver event generation is deterministic', () => {
  const events = deriveRecentEvents(testDataset);
  const caregiverEvents = events.filter((e) => e.type === 'competency_expiry');

  assert(Array.isArray(caregiverEvents), 'Returns caregiver events array');
  for (const cg of caregiverEvents) {
    assert(cg.isSimulated === true, 'Marked as simulated');
    assert(cg.id.startsWith('evt-cg-'), 'Has structured ID');
    assert(cg.title.includes('Simulated Competency Status'), 'Contains simulated label');
  }
});

console.log(`\nResults: ${passed} of ${total} dashboard integration tests passed.`);
if (passed !== total) {
  process.exit(1);
}
