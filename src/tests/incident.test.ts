/**
 * CareProof Audit Console - Incident Response Pure Logic Tests (Phase 11A)
 * Source of Truth: CareProof Website Roadmap (Phase 11A)
 * 
 * Verifies all 22 Section 26 requirements:
 * 1. valid incident record is accepted
 * 2. missing required incident data is rejected
 * 3. invalid incident status is rejected
 * 4. timeline events are deterministic
 * 5. timeline sorting is chronological
 * 6. timeline tie-breaker is deterministic
 * 7. duplicate timeline IDs are rejected
 * 8. unknown indicator ID mapping is rejected
 * 9. valid indicator mapping is accepted
 * 10. Five-Why supports steps 1–5
 * 11. duplicate Five-Why numbers are rejected
 * 12. more than 5 Five-Why steps are rejected
 * 13. corrective action status validation works
 * 14. re-audit plan validation works
 * 15. incident progress is deterministic
 * 16. incomplete workflow is not falsely marked complete
 * 17. search/filter works
 * 18. incident sorting is deterministic
 * 19. simulated metadata is preserved
 * 20. no patient/auth PII is created
 * 21. print-view data contains required workflow sections
 * 22. same input produces identical output
 */

import {
  createIncidentPrintViewData,
  createIncidentViewModel,
  deriveIncidentProgress,
  filterIncidentRecords,
  getSimulatedIncidentRecords,
  sortIncidentRecords,
  sortTimelineEvents,
  validateIncident,
} from '../services/incident';
import {
  IncidentRecord,
  IncidentStatus,
  IncidentTimelineEvent,
} from '../types/incident';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`TEST ASSERTION FAILED: ${message}`);
  }
}

console.log('=== CareProof Incident Response Data & Workflow Tests (Phase 11A) ===\n');

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

const simulatedRecords = getSimulatedIncidentRecords();
const validSample = simulatedRecords[0];

// 1. Valid incident record is accepted
test('1. Valid incident record is accepted', () => {
  const result = validateIncident(validSample);
  assert(result.isValid === true, 'Sample record should be valid');
  assert(result.errors.length === 0, 'Valid record must have zero validation errors');
});

// 2. Missing required incident data is rejected
test('2. Missing required incident data is rejected', () => {
  // Missing ID
  const noId = { ...validSample, id: '' };
  const resNoId = validateIncident(noId);
  assert(resNoId.isValid === false, 'Empty ID should fail');
  assert(resNoId.errors.some((e) => e.includes('Incident ID is required')), 'Error message for ID required');

  // Missing Intake
  const noIntake = { ...validSample, intake: undefined as unknown as typeof validSample.intake };
  const resNoIntake = validateIncident(noIntake);
  assert(resNoIntake.isValid === false, 'Missing intake should fail');

  // Missing Title
  const noTitle: IncidentRecord = {
    ...validSample,
    intake: { ...validSample.intake, title: '   ' },
  };
  const resNoTitle = validateIncident(noTitle);
  assert(resNoTitle.isValid === false, 'Empty title should fail');
});

// 3. Invalid incident status is rejected
test('3. Invalid incident status is rejected', () => {
  const invalidStatusRecord = {
    ...validSample,
    status: 'regulatory_violation_severe' as unknown as IncidentStatus,
  };
  const res = validateIncident(invalidStatusRecord);
  assert(res.isValid === false, 'Arbitrary status should be rejected');
  assert(
    res.errors.some((e) => e.includes('Invalid incident status')),
    'Must identify invalid incident status'
  );
});

// 4. Timeline events are deterministic
test('4. Timeline events are deterministic across executions', () => {
  const timeline1 = sortTimelineEvents(validSample.timeline);
  const timeline2 = sortTimelineEvents(validSample.timeline);

  assert(
    JSON.stringify(timeline1) === JSON.stringify(timeline2),
    'Timeline sort must produce identical serialized JSON'
  );
});

// 5. Timeline sorting is chronological
test('5. Timeline sorting is chronological (timestamp ascending)', () => {
  const unorganised: IncidentTimelineEvent[] = [
    {
      id: 'EVT-C',
      timestamp: '2026-01-15T12:00:00.000Z',
      title: 'Action Review',
      isSimulated: true,
    },
    {
      id: 'EVT-A',
      timestamp: '2026-01-15T08:00:00.000Z',
      title: 'Initial Signal',
      isSimulated: true,
    },
    {
      id: 'EVT-B',
      timestamp: '2026-01-15T10:00:00.000Z',
      title: 'Escalation Alert',
      isSimulated: true,
    },
  ];

  const sorted = sortTimelineEvents(unorganised);
  assert(sorted[0].id === 'EVT-A', 'Earliest event first');
  assert(sorted[1].id === 'EVT-B', 'Intermediate event second');
  assert(sorted[2].id === 'EVT-C', 'Latest event third');
});

// 6. Timeline tie-breaker is deterministic
test('6. Timeline tie-breaker is deterministic (event ID)', () => {
  const tiedEvents: IncidentTimelineEvent[] = [
    {
      id: 'EVT-Z',
      timestamp: '2026-01-15T10:00:00.000Z',
      title: 'Event Z',
      isSimulated: true,
    },
    {
      id: 'EVT-A',
      timestamp: '2026-01-15T10:00:00.000Z',
      title: 'Event A',
      isSimulated: true,
    },
  ];

  const sorted = sortTimelineEvents(tiedEvents);
  assert(sorted[0].id === 'EVT-A', 'Tie-breaker should sort EVT-A before EVT-Z');
  assert(sorted[1].id === 'EVT-Z', 'EVT-Z must be second');
});

// 7. Duplicate timeline IDs are rejected
test('7. Duplicate timeline IDs are rejected', () => {
  const dupTimelineRecord: IncidentRecord = {
    ...validSample,
    timeline: [
      {
        id: 'EVT-001',
        timestamp: '2026-01-15T08:00:00.000Z',
        title: 'Initial Intake',
        isSimulated: true,
      },
      {
        id: 'EVT-001', // duplicate
        timestamp: '2026-01-15T08:30:00.000Z',
        title: 'Follow-up',
        isSimulated: true,
      },
    ],
  };

  const res = validateIncident(dupTimelineRecord);
  assert(res.isValid === false, 'Duplicate timeline ID must be rejected');
  assert(
    res.errors.some((e) => e.includes('Duplicate timeline event ID')),
    'Must identify duplicate timeline ID'
  );
});

// 8. Unknown indicator ID mapping is rejected
test('8. Unknown indicator ID mapping is rejected against canonical standard', () => {
  const unknownIndRecord: IncidentRecord = {
    ...validSample,
    linkedIndicators: [
      {
        indicatorId: 'NONEXISTENT-INDICATOR-XYZ',
        reason: 'Unverified test link',
        isSimulated: true,
      },
    ],
  };

  const res = validateIncident(unknownIndRecord);
  assert(res.isValid === false, 'Unknown indicator ID must be rejected');
  assert(
    res.errors.some((e) => e.includes('Unknown indicator ID: "NONEXISTENT-INDICATOR-XYZ"')),
    'Must specify invalid indicator'
  );
});

// 9. Valid indicator mapping is accepted
test('9. Valid indicator mapping from canonical standard is accepted', () => {
  const validIndRecord: IncidentRecord = {
    ...validSample,
    linkedIndicators: [
      {
        indicatorId: 'PMI-01',
        reason: 'Telemetry latency indicator',
        isSimulated: true,
      },
      {
        indicatorId: 'EEH-01',
        reason: 'Critical calibration check',
        isSimulated: true,
      },
    ],
  };

  const res = validateIncident(validIndRecord);
  assert(res.isValid === true, 'Canonical indicators must be accepted');
});

// 10. Five-Why supports steps 1–5
test('10. Five-Why supports steps 1–5', () => {
  const fiveStepsRecord: IncidentRecord = {
    ...validSample,
    rootCause: {
      steps: [
        { whyNumber: 1, question: 'Why 1', answer: 'Ans 1' },
        { whyNumber: 2, question: 'Why 2', answer: 'Ans 2' },
        { whyNumber: 3, question: 'Why 3', answer: 'Ans 3' },
        { whyNumber: 4, question: 'Why 4', answer: 'Ans 4' },
        { whyNumber: 5, question: 'Why 5', answer: 'Ans 5' },
      ],
      status: 'completed',
      isSimulated: true,
    },
  };

  const res = validateIncident(fiveStepsRecord);
  assert(res.isValid === true, '5 steps should be valid');
});

// 11. Duplicate Five-Why numbers are rejected
test('11. Duplicate Five-Why numbers are rejected', () => {
  const dupWhyRecord: IncidentRecord = {
    ...validSample,
    rootCause: {
      steps: [
        { whyNumber: 1, question: 'Why 1', answer: 'Ans 1' },
        { whyNumber: 1, question: 'Why 1 dup', answer: 'Ans 1 dup' },
      ],
      status: 'in_progress',
      isSimulated: true,
    },
  };

  const res = validateIncident(dupWhyRecord);
  assert(res.isValid === false, 'Duplicate why numbers must be rejected');
  assert(
    res.errors.some((e) => e.includes('Duplicate Five-Why step number')),
    'Must identify duplicate why number'
  );
});

// 12. More than 5 Five-Why steps are rejected
test('12. More than 5 Five-Why steps are rejected', () => {
  const sixStepsRecord: IncidentRecord = {
    ...validSample,
    rootCause: {
      steps: [
        { whyNumber: 1, question: 'Why 1', answer: 'Ans 1' },
        { whyNumber: 2, question: 'Why 2', answer: 'Ans 2' },
        { whyNumber: 3, question: 'Why 3', answer: 'Ans 3' },
        { whyNumber: 4, question: 'Why 4', answer: 'Ans 4' },
        { whyNumber: 5, question: 'Why 5', answer: 'Ans 5' },
        { whyNumber: 6, question: 'Why 6', answer: 'Ans 6' },
      ],
      status: 'completed',
      isSimulated: true,
    },
  };

  const res = validateIncident(sixStepsRecord);
  assert(res.isValid === false, 'More than 5 steps must be rejected');
  assert(
    res.errors.some((e) => e.includes('cannot exceed 5 steps')),
    'Must enforce max 5 steps'
  );
});

// 13. Corrective action status validation works
test('13. Corrective action status validation works', () => {
  const badActionRecord: IncidentRecord = {
    ...validSample,
    correctiveActions: [
      {
        id: 'ACT-BAD',
        description: 'Do something',
        status: 'legally_mandated' as unknown as 'planned',
        isSimulated: true,
      },
    ],
  };

  const res = validateIncident(badActionRecord);
  assert(res.isValid === false, 'Invalid action status must be rejected');
  assert(
    res.errors.some((e) => e.includes('Invalid corrective action status')),
    'Must report invalid action status'
  );
});

// 14. Re-audit plan validation works
test('14. Re-audit plan validation works', () => {
  const badPlanRecord: IncidentRecord = {
    ...validSample,
    reauditPlan: {
      plannedDate: 'not-a-real-date',
      scope: 'Inspect ward',
      linkedIndicatorIds: ['FAKE-IND-01'],
      status: 'scheduled',
      isSimulated: true,
    },
  };

  const res = validateIncident(badPlanRecord);
  assert(res.isValid === false, 'Invalid re-audit date and fake indicator must be rejected');
  assert(
    res.errors.some((e) => e.includes('invalid planned date')),
    'Must flag bad date'
  );
  assert(
    res.errors.some((e) => e.includes('references unknown indicator ID')),
    'Must flag unknown indicator in re-audit'
  );
});

// 15. Incident progress is deterministic
test('15. Incident progress is deterministic', () => {
  const p1 = deriveIncidentProgress(validSample);
  const p2 = deriveIncidentProgress(validSample);

  assert(
    JSON.stringify(p1) === JSON.stringify(p2),
    'Progress derivation must produce identical results'
  );
  assert(p1.totalStepCount === 6, 'Total steps must be 6');
  assert(p1.intakeComplete === true, 'Intake complete');
  assert(p1.timelineComplete === true, 'Timeline complete');
});

// 16. Incomplete workflow is not falsely marked complete
test('16. Incomplete workflow is not falsely marked complete', () => {
  const draftRecord: IncidentRecord = {
    id: 'INC-DRAFT-01',
    intake: {
      id: 'INC-DRAFT-01',
      timestamp: '2026-01-01T00:00:00.000Z',
      title: 'Draft Issue',
      summary: 'Summary only',
      reporterId: 'USR-01',
      description: 'Desc',
      status: 'draft',
      isSimulated: true,
    },
    status: 'draft',
    timeline: [],
    linkedIndicators: [],
    rootCause: { steps: [], status: 'not_started', isSimulated: true },
    correctiveActions: [],
    reauditPlan: { linkedIndicatorIds: [], status: 'not_scheduled', isSimulated: true },
    datasetType: 'SIMULATED',
    isSimulated: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const progress = deriveIncidentProgress(draftRecord);
  assert(progress.timelineComplete === false, 'Empty timeline must not be complete');
  assert(progress.indicatorMappingPresent === false, 'Empty indicators must be false');
  assert(progress.rootCausePresent === false, 'Empty root cause must be false');
  assert(progress.correctiveActionsPresent === false, 'Empty actions must be false');
  assert(progress.isClosed === false, 'Draft is not closed');
  assert(progress.percentComplete < 50, 'Draft completeness must be low');
});

// 17. Search/filter works
test('17. Search and filter works as expected', () => {
  // Status filter
  const openOnly = filterIncidentRecords(simulatedRecords, { status: 'actions_pending' });
  assert(openOnly.length === 1, 'Should find 1 actions_pending incident');
  assert(openOnly[0].id === 'INC-2026-002', 'Found INC-2026-002');

  // Search query (case-insensitive)
  const latencyResults = filterIncidentRecords(simulatedRecords, { searchQuery: 'LATENCY' });
  assert(latencyResults.length === 1, 'Should find 1 latency incident');
  assert(latencyResults[0].id === 'INC-2026-001', 'Found INC-2026-001');

  // Indicator ID filter
  const eehResults = filterIncidentRecords(simulatedRecords, { indicatorId: 'EEH-01' });
  assert(eehResults.length === 1, 'Should find 1 incident linked to EEH-01');
  assert(eehResults[0].id === 'INC-2026-002', 'EEH-01 linked to INC-2026-002');
});

// 18. Incident sorting is deterministic
test('18. Incident sorting is deterministic (intake timestamp descending)', () => {
  const sorted = sortIncidentRecords(simulatedRecords, 'desc');
  assert(sorted[0].id === 'INC-2026-002', 'Later date 2026-01-20 should be first');
  assert(sorted[1].id === 'INC-2026-001', 'Earlier date 2026-01-15 should be second');
});

// 19. Simulated metadata is preserved
test('19. Simulated metadata is preserved across all structures', () => {
  assert(validSample.datasetType === 'SIMULATED', 'datasetType must be SIMULATED');
  assert(validSample.isSimulated === true, 'isSimulated must be true');
  assert(validSample.intake.isSimulated === true, 'intake isSimulated must be true');

  for (const evt of validSample.timeline) {
    assert(evt.isSimulated === true, 'timeline event isSimulated must be true');
  }

  const vm = createIncidentViewModel(simulatedRecords);
  assert(vm.datasetType === 'SIMULATED', 'view model datasetType must be SIMULATED');
  assert(vm.isSimulated === true, 'view model isSimulated must be true');
});

// 20. No patient/auth PII is created
test('20. No patient/auth PII is created in models', () => {
  const serialized = JSON.stringify(simulatedRecords);
  assert(!serialized.includes('medicalRecordNumber'), 'No MRN');
  assert(!serialized.includes('patientName'), 'No patientName');
  assert(!serialized.includes('phoneNumber'), 'No phone');
  assert(!serialized.includes('ssn'), 'No SSN');
  assert(!serialized.includes('homeAddress'), 'No address');
});

// 21. Print-view data contains required workflow sections
test('21. Print-view data contains all required workflow sections', () => {
  const printData = createIncidentPrintViewData(validSample);

  assert(printData.incidentSummary.id === validSample.id, 'Summary has ID');
  assert(printData.incidentSummary.title === validSample.intake.title, 'Summary has title');
  assert(printData.timeline.length === validSample.timeline.length, 'Timeline preserved');
  assert(printData.linkedIndicators.length === validSample.linkedIndicators.length, 'Indicators mapped');
  assert(printData.linkedIndicators[0].indicatorName !== undefined, 'Enriched indicator name present');
  assert(printData.rootCause.steps.length === validSample.rootCause.steps.length, '5-Why steps present');
  assert(printData.correctiveActions.length === validSample.correctiveActions.length, 'Actions present');
  assert(printData.reauditPlan !== undefined, 'Re-audit plan present');
  assert(printData.disclaimer.includes('Proposed workflow, not clinically validated'), 'Disclaimer present');
  assert(printData.datasetType === 'SIMULATED', 'Print data tagged SIMULATED');
});

// 22. Same input produces identical output
test('22. Same input produces identical output across calls', () => {
  const print1 = createIncidentPrintViewData(validSample, undefined, '2026-01-01T00:00:00.000Z');
  const print2 = createIncidentPrintViewData(validSample, undefined, '2026-01-01T00:00:00.000Z');

  assert(
    JSON.stringify(print1) === JSON.stringify(print2),
    'Print view data must be bit-for-bit identical'
  );
});

console.log(`\n========================================`);
console.log(`Incident Response Tests Passed: ${passed} / ${total}`);
console.log(`========================================\n`);

if (passed !== total) {
  process.exitCode = 1;
}
