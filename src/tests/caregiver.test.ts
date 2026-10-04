/**
 * CareProof Audit Console - Caregiver Competency Pure Logic Tests
 * Source of Truth: CareProof Website Roadmap (Phase 9C)
 * 
 * Verifies all 22 Section 23 requirements:
 * 1. caregiver records come from simulation dataset
 * 2. caregiver IDs are preserved
 * 3. matrix row generation is deterministic
 * 4. competency level only accepts 0–4
 * 5. invalid competency level is rejected
 * 6. supported assessment methods are enforced
 * 7. unknown caregiver returns not-found
 * 8. caregiver detail returns correct assessments
 * 9. expiry logic works with configured expiry dates
 * 10. missing expiry is reported as not configured
 * 11. no invented expiry duration exists
 * 12. configured gaps are detected correctly
 * 13. missing target level does not create a fake gap
 * 14. assessment method filtering works
 * 15. expiry-status filtering works
 * 16. deterministic caregiver sorting
 * 17. assessor A/B data can coexist for the same assessment target
 * 18. no kappa calculation is performed
 * 19. simulated metadata is preserved
 * 20. no patient/auth information enters caregiver view model
 * 21. no staffing/fatigue fields are invented
 * 22. same input produces same output
 */

import { generateSimulatedDataset } from '../engine/simulate';
import {
  computeExpiryStatus,
  createCaregiverViewModel,
  filterCaregiverRows,
  getCaregiverDetail,
  getCaregiverGapReport,
  getCaregiverMatrix,
  getDualAssessorPairs,
  isValidAssessmentMethod,
  isValidCompetencyLevel,
  sortCaregiverRecords,
  validateAssessmentEntry,
} from '../services/caregiver';
import {
  CaregiverAssessment,
  CaregiverCompetency,
  VALID_ASSESSMENT_METHODS,
  VALID_COMPETENCY_LEVELS,
} from '../types/caregiver';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST ASSERTION FAILED: ${message}`);
  }
}

console.log('=== CareProof Caregiver Competency Data & Logic Tests (Phase 9C) ===\n');

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

const dataset = generateSimulatedDataset(42);

// Sample configured demonstration competencies
const DEMO_COMPETENCIES: CaregiverCompetency[] = [
  { id: 'COMP-01', name: 'Vital Signs Telemetry', targetLevel: 3 },
  { id: 'COMP-02', name: 'Environmental Sensor Check', targetLevel: 2 },
  { id: 'COMP-03', name: 'Emergency Escalation Flow' }, // No targetLevel configured
];

// Sample synthetic assessments
const DEMO_ASSESSMENTS: CaregiverAssessment[] = [
  {
    id: 'ASM-001',
    caregiverId: dataset.caregivers[0].id,
    competencyId: 'COMP-01',
    level: 3,
    method: 'OSCE',
    assessorId: 'ASR-001',
    assessorRole: 'assessor_a',
    timestamp: '2026-01-15T10:00:00.000Z',
    expiryDate: '2026-12-31T00:00:00.000Z',
    isSimulated: true,
  },
  {
    id: 'ASM-002',
    caregiverId: dataset.caregivers[0].id,
    competencyId: 'COMP-01',
    level: 3,
    method: 'Direct Observation',
    assessorId: 'ASR-002',
    assessorRole: 'assessor_b',
    timestamp: '2026-01-15T10:30:00.000Z',
    expiryDate: '2026-12-31T00:00:00.000Z',
    isSimulated: true,
  },
  {
    id: 'ASM-003',
    caregiverId: dataset.caregivers[1].id,
    competencyId: 'COMP-01',
    level: 1, // Below targetLevel (3)
    method: 'Knowledge Test',
    assessorId: 'ASR-001',
    timestamp: '2025-11-01T00:00:00.000Z',
    expiryDate: '2025-12-01T00:00:00.000Z', // Expired relative to 2026-01-01
    isSimulated: true,
  },
];

// 1. Caregiver records come from simulation dataset
test('1. caregiver records come from simulation dataset', () => {
  assert(Array.isArray(dataset.caregivers), 'dataset.caregivers is an array');
  assert(dataset.caregivers.length > 0, 'dataset.caregivers contains synthetic caregivers');
  const matrix = getCaregiverMatrix(dataset);
  assert(
    matrix.rows.length === dataset.caregivers.length,
    `Matrix rows count (${matrix.rows.length}) matches dataset caregivers count (${dataset.caregivers.length})`
  );
});

// 2. Caregiver IDs are preserved
test('2. caregiver IDs are preserved', () => {
  const matrix = getCaregiverMatrix(dataset);
  const matrixIds = new Set(matrix.rows.map((r) => r.caregiverId));

  for (const cg of dataset.caregivers) {
    assert(matrixIds.has(cg.id), `Caregiver ID ${cg.id} is preserved in matrix`);
  }
});

// 3. Matrix row generation is deterministic
test('3. matrix row generation is deterministic', () => {
  const run1 = getCaregiverMatrix(dataset, DEMO_COMPETENCIES, DEMO_ASSESSMENTS);
  const run2 = getCaregiverMatrix(dataset, DEMO_COMPETENCIES, DEMO_ASSESSMENTS);

  assert(run1.rows.length === run2.rows.length, 'Row counts match across runs');
  for (let i = 0; i < run1.rows.length; i++) {
    assert(run1.rows[i].caregiverId === run2.rows[i].caregiverId, `Row ${i} ID matches`);
    assert(run1.rows[i].roleId === run2.rows[i].roleId, `Row ${i} roleId matches`);
  }
});

// 4. Competency level only accepts 0–4
test('4. competency level only accepts 0–4', () => {
  assert(VALID_COMPETENCY_LEVELS.length === 5, 'Exact 5 valid levels');
  for (let i = 0; i <= 4; i++) {
    assert(isValidCompetencyLevel(i), `Level ${i} is valid`);
  }
});

// 5. Invalid competency level is rejected
test('5. invalid competency level is rejected', () => {
  const invalidLevels = [-1, 5, 2.5, '3', null, undefined, NaN, Infinity];
  for (const invalid of invalidLevels) {
    assert(!isValidCompetencyLevel(invalid), `Value ${invalid} is rejected as competency level`);
  }

  const result = validateAssessmentEntry({
    caregiverId: 'CG-001',
    competencyId: 'COMP-01',
    level: 5, // Invalid level
    method: 'OSCE',
    assessorId: 'ASR-001',
    timestamp: '2026-01-01T00:00:00.000Z',
  });
  assert(!result.valid, 'Entry with level 5 is rejected');
  assert(
    result.errors.some((e) => e.includes('Competency level must be an integer between 0 and 4')),
    'Provides explicit error message for invalid level'
  );
});

// 6. Supported assessment methods are enforced
test('6. supported assessment methods are enforced', () => {
  assert(VALID_ASSESSMENT_METHODS.includes('OSCE'), 'Supports OSCE');
  assert(VALID_ASSESSMENT_METHODS.includes('Direct Observation'), 'Supports Direct Observation');
  assert(VALID_ASSESSMENT_METHODS.includes('Knowledge Test'), 'Supports Knowledge Test');
  assert(VALID_ASSESSMENT_METHODS.length === 3, 'Exactly 3 supported methods');

  assert(isValidAssessmentMethod('OSCE'), 'OSCE is valid');
  assert(isValidAssessmentMethod('Direct Observation'), 'Direct Observation is valid');
  assert(isValidAssessmentMethod('Knowledge Test'), 'Knowledge Test is valid');
  assert(!isValidAssessmentMethod('Oral Exam'), 'Oral Exam is rejected');
  assert(!isValidAssessmentMethod('Self-Report'), 'Self-Report is rejected');
});

// 7. Unknown caregiver returns not-found
test('7. unknown caregiver returns not-found', () => {
  const detail = getCaregiverDetail(dataset, 'CG-NONEXISTENT-999');
  assert(detail === null, 'Unknown caregiver returns strictly null');
});

// 8. Caregiver detail returns correct assessments
test('8. caregiver detail returns correct assessments', () => {
  const targetId = dataset.caregivers[0].id;
  const detail = getCaregiverDetail(dataset, targetId, DEMO_COMPETENCIES, DEMO_ASSESSMENTS);

  assert(detail !== null, 'Found caregiver detail');
  assert(detail!.caregiver.id === targetId, 'Detail contains matching caregiver entity');
  assert(detail!.assessments.length === 2, 'Caregiver has 2 matching assessments');
  for (const a of detail!.assessments) {
    assert(a.caregiverId === targetId, `Assessment ${a.id} belongs to target caregiver`);
  }
});

// 9. Expiry logic works with configured expiry dates
test('9. expiry logic works with configured expiry dates', () => {
  const reference = '2026-01-01T00:00:00.000Z';

  // Future date -> active
  const activeStatus = computeExpiryStatus('2026-06-01T00:00:00.000Z', reference);
  assert(activeStatus === 'active', 'Future expiry evaluates to active');

  // Past date -> expired
  const expiredStatus = computeExpiryStatus('2025-12-01T00:00:00.000Z', reference);
  assert(expiredStatus === 'expired', 'Past expiry evaluates to expired');
});

// 10. Missing expiry is reported as not configured
test('10. missing expiry is reported as not configured', () => {
  const notConfigured1 = computeExpiryStatus(undefined);
  const notConfigured2 = computeExpiryStatus(null);
  const notConfigured3 = computeExpiryStatus('');

  assert(notConfigured1 === 'not_configured', 'Undefined expiry is not_configured');
  assert(notConfigured2 === 'not_configured', 'Null expiry is not_configured');
  assert(notConfigured3 === 'not_configured', 'Empty expiry is not_configured');
});

// 11. No invented expiry duration exists
test('11. no invented expiry duration exists', () => {
  // If an assessment has no expiryDate, its expiryStatus must be "not_configured"
  // It must NOT invent a 6-month or 1-year expiration date
  const cellExpiry = computeExpiryStatus(undefined);
  assert(cellExpiry === 'not_configured', 'Missing expiry is strictly not_configured');
});

// 12. Configured gaps are detected correctly
test('12. configured gaps are detected correctly', () => {
  // COMP-01 requires level 3
  // CG-002 (caregiver[1]) was assessed at level 1
  // CG-003, CG-004 etc. are unassessed for COMP-01
  const gaps = getCaregiverGapReport(dataset.caregivers, DEMO_COMPETENCIES, DEMO_ASSESSMENTS);

  // Check deficit for CG-002
  const cg2Gap = gaps.find(
    (g) => g.caregiverId === dataset.caregivers[1].id && g.competencyId === 'COMP-01'
  );
  assert(Boolean(cg2Gap), 'Found gap for caregiver with level 1 when target is 3');
  assert(cg2Gap!.currentLevel === 1, 'Current level is 1');
  assert(cg2Gap!.targetLevel === 3, 'Target level is 3');
  assert(cg2Gap!.gapDeficit === 2, 'Deficit is 3 - 1 = 2');
  assert(cg2Gap!.status === 'below_target', 'Status is below_target');

  // Check unassessed gap for CG-003
  const cg3Gap = gaps.find(
    (g) => g.caregiverId === dataset.caregivers[2].id && g.competencyId === 'COMP-01'
  );
  assert(Boolean(cg3Gap), 'Found unassessed gap for caregiver with no assessments');
  assert(cg3Gap!.currentLevel === null, 'Current level is null');
  assert(cg3Gap!.gapDeficit === 3, 'Deficit is target level (3)');
  assert(cg3Gap!.status === 'unassessed', 'Status is unassessed');
});

// 13. Missing target level does not create a fake gap
test('13. missing target level does not create a fake gap', () => {
  // COMP-03 has targetLevel = undefined
  const gaps = getCaregiverGapReport(dataset.caregivers, DEMO_COMPETENCIES, DEMO_ASSESSMENTS);
  const comp3Gaps = gaps.filter((g) => g.competencyId === 'COMP-03');

  assert(
    comp3Gaps.length === 0,
    'Competency without configured target level produces zero gaps'
  );
});

// 14. Assessment method filtering works
test('14. assessment method filtering works', () => {
  const matrix = getCaregiverMatrix(dataset, DEMO_COMPETENCIES, DEMO_ASSESSMENTS);

  const osceRows = filterCaregiverRows(
    matrix.rows,
    { assessmentMethod: 'OSCE' },
    DEMO_ASSESSMENTS
  );
  assert(osceRows.length === 1, 'Found 1 caregiver with OSCE assessment');
  assert(
    osceRows[0].caregiverId === dataset.caregivers[0].id,
    'Matched caregiver has OSCE assessment'
  );

  const directObsRows = filterCaregiverRows(
    matrix.rows,
    { assessmentMethod: 'Direct Observation' },
    DEMO_ASSESSMENTS
  );
  assert(directObsRows.length === 1, 'Found 1 caregiver with Direct Observation assessment');
});

// 15. Expiry-status filtering works
test('15. expiry-status filtering works', () => {
  const matrix = getCaregiverMatrix(dataset, DEMO_COMPETENCIES, DEMO_ASSESSMENTS);

  const expiredRows = filterCaregiverRows(
    matrix.rows,
    { expiryStatus: 'expired' },
    DEMO_ASSESSMENTS
  );
  assert(
    expiredRows.some((r) => r.caregiverId === dataset.caregivers[1].id),
    'Caregiver with expired assessment is returned in expired filter'
  );
});

// 16. Deterministic caregiver sorting
test('16. deterministic caregiver sorting', () => {
  const sorted = sortCaregiverRecords(dataset.caregivers);

  for (let i = 1; i < sorted.length; i++) {
    assert(
      sorted[i].id.localeCompare(sorted[i - 1].id) >= 0,
      `ID ${sorted[i].id} is >= ${sorted[i - 1].id}`
    );
  }

  const matrix = getCaregiverMatrix(dataset);
  for (let i = 1; i < matrix.rows.length; i++) {
    assert(
      matrix.rows[i].caregiverId.localeCompare(matrix.rows[i - 1].caregiverId) >= 0,
      `Matrix row ${i} ID is >= previous row ID`
    );
  }
});

// 17. Assessor A/B data can coexist for the same assessment target
test('17. assessor A/B data can coexist for the same assessment target', () => {
  const pairs = getDualAssessorPairs(DEMO_ASSESSMENTS);
  const targetPair = pairs.find(
    (p) => p.caregiverId === dataset.caregivers[0].id && p.competencyId === 'COMP-01'
  );

  assert(Boolean(targetPair), 'Found dual assessor pair');
  assert(targetPair!.hasBothAssessors === true, 'Pair has both Assessor A and Assessor B');
  assert(targetPair!.assessorA?.assessorId === 'ASR-001', 'Assessor A ID matches');
  assert(targetPair!.assessorB?.assessorId === 'ASR-002', 'Assessor B ID matches');
  assert(targetPair!.levelAgreement === true, 'Both assessors assigned Level 3 (agreement)');
});

// 18. No kappa calculation is performed
test('18. no kappa calculation is performed', () => {
  const pairs = getDualAssessorPairs(DEMO_ASSESSMENTS);
  const serialized = JSON.stringify(pairs).toLowerCase();

  assert(!serialized.includes('kappa'), 'Does not calculate or include Cohen kappa');
  assert(!serialized.includes('fleiss'), 'Does not calculate Fleiss kappa');
  assert(!serialized.includes('p_value'), 'Does not compute statistical significance');
});

// 19. Simulated metadata is preserved
test('19. simulated metadata is preserved', () => {
  const matrix = getCaregiverMatrix(dataset);
  for (const row of matrix.rows) {
    assert(row.isSimulated === true, `Matrix row ${row.caregiverId} has isSimulated: true`);
  }

  const detail = getCaregiverDetail(dataset, dataset.caregivers[0].id);
  assert(detail!.isSimulated === true, 'Detail has isSimulated: true');

  const vm = createCaregiverViewModel(dataset);
  assert(vm.isSimulated === true, 'ViewModel has isSimulated: true');
});

// 20. No patient/auth information enters caregiver view model
test('20. no patient/auth information enters caregiver view model', () => {
  const vm = createCaregiverViewModel(dataset, {
    competencies: DEMO_COMPETENCIES,
    assessments: DEMO_ASSESSMENTS,
  });
  const serialized = JSON.stringify(vm).toLowerCase();

  const forbiddenKeys = [
    'patientid',
    'password',
    'userprofile',
    'token',
    'secret',
    'vitalsigns',
    'observationgap',
  ];

  for (const key of forbiddenKeys) {
    assert(!serialized.includes(`"${key}"`), `ViewModel does not leak forbidden key "${key}"`);
  }
});

// 21. No staffing/fatigue fields are invented
test('21. no staffing/fatigue fields are invented', () => {
  const vm = createCaregiverViewModel(dataset, {
    competencies: DEMO_COMPETENCIES,
    assessments: DEMO_ASSESSMENTS,
  });
  const serialized = JSON.stringify(vm).toLowerCase();

  const forbiddenStaffingFields = [
    'staffingratio',
    'fatiguethreshold',
    'overtimelimits',
    'mandatoryrest',
    'nursetopatient',
    'workforceshifts',
  ];

  for (const field of forbiddenStaffingFields) {
    assert(!serialized.includes(field), `Does not contain invented staffing field "${field}"`);
  }
});

// 22. Same input produces same output
test('22. same input produces same output', () => {
  const vm1 = createCaregiverViewModel(dataset, {
    competencies: DEMO_COMPETENCIES,
    assessments: DEMO_ASSESSMENTS,
  });
  const vm2 = createCaregiverViewModel(dataset, {
    competencies: DEMO_COMPETENCIES,
    assessments: DEMO_ASSESSMENTS,
  });

  assert(
    JSON.stringify(vm1) === JSON.stringify(vm2),
    'View models are bit-for-bit identical given the same inputs'
  );
});

console.log(`\nResults: ${passed} of ${total} caregiver logic tests passed.`);
if (passed !== total) {
  process.exit(1);
}
