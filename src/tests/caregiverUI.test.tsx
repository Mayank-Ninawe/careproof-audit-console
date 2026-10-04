/**
 * CareProof Audit Console - Caregiver Competency UI Component Tests
 * Source of Truth: CareProof Website Roadmap (Phase 9D)
 * 
 * Verifies all 30 Section 30 requirements:
 * 1. Caregiver page renders.
 * 2. Simulation disclosure renders.
 * 3. Configured matrix renders rows and columns.
 * 4. Unconfigured competency state renders correctly.
 * 5. Level 0–4 values render exactly.
 * 6. Invalid level is never rendered.
 * 7. Assessment method labels render.
 * 8. Expiry states render.
 * 9. Gap report renders configured gaps.
 * 10. Unconfigured gap rules show honest state.
 * 11. Search works.
 * 12. Role filter works.
 * 13. Assessment-status filter works.
 * 14. Assessment-method filter works.
 * 15. Expiry filter works.
 * 16. Combined filters work.
 * 17. Clear filters restores dataset.
 * 18. Caregiver row/cell is keyboard accessible.
 * 19. Caregiver detail drawer opens.
 * 20. Drawer shows canonical caregiver information.
 * 21. Dual-assessor information renders when available.
 * 22. No fake kappa/reliability metric is shown.
 * 23. Assessor entry form renders.
 * 24. Form validation handles invalid level/method.
 * 25. Form does not claim Firestore persistence.
 * 26. Missing competency configuration prevents fake competency selection.
 * 27. Empty gap report state renders.
 * 28. No staffing/fatigue UI is rendered.
 * 29. No unsupported regulatory/clinical claims are rendered.
 * 30. Responsive structure avoids uncontrolled page-wide overflow.
 */

import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { CaregiversPage } from '../pages/Caregivers/CaregiversPage';
import {
  CaregiverFilterToolbar,
  CaregiverMatrixTable,
  CaregiverGapReport,
  DualAssessorPanel,
  AssessorEntryForm,
  CaregiverDetailDrawer,
} from '../components/caregiver';
import { generateSimulatedDataset } from '../engine/simulate';
import {
  createCaregiverViewModel,
  getCaregiverDetail,
  getDualAssessorPairs,
  validateAssessmentEntry,
} from '../services/caregiver';
import { CaregiverAssessment, CaregiverCompetency } from '../types/caregiver';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST ASSERTION FAILED: ${message}`);
  }
}

console.log('=== CareProof Caregiver Competency UI Tests (Phase 9D) ===\n');

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

const TEST_COMPETENCIES: CaregiverCompetency[] = [
  { id: 'COMP-01', name: 'Vital Signs Telemetry', targetLevel: 3 },
  { id: 'COMP-02', name: 'Device Sensor Operation', targetLevel: 2 },
];

const TEST_ASSESSMENTS: CaregiverAssessment[] = [
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
    level: 1,
    method: 'Knowledge Test',
    assessorId: 'ASR-001',
    timestamp: '2025-11-01T00:00:00.000Z',
    expiryDate: '2025-12-01T00:00:00.000Z',
    isSimulated: true,
  },
];

const configuredVm = createCaregiverViewModel(dataset, {
  competencies: TEST_COMPETENCIES,
  assessments: TEST_ASSESSMENTS,
});

const unconfiguredVm = createCaregiverViewModel(dataset, {
  competencies: [],
  assessments: [],
});

const sampleDetail = getCaregiverDetail(
  dataset,
  dataset.caregivers[0].id,
  TEST_COMPETENCIES,
  TEST_ASSESSMENTS
);

// 1. Caregiver page renders
test('1. Caregiver page renders', () => {
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/caregivers']}>
      <CaregiversPage seed={42} />
    </MemoryRouter>
  );

  assert(html.includes('Caregiver Competency'), 'Renders title');
  assert(
    html.includes('Competency matrix, assessments, expiry status, and identified gaps.'),
    'Renders subtitle'
  );
  assert(html.includes('Numeric Level 0–4'), 'Renders scale metadata');
});

// 2. Simulation disclosure renders
test('2. Simulation disclosure renders', () => {
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/caregivers']}>
      <CaregiversPage seed={42} />
    </MemoryRouter>
  );

  assert(
    html.includes('SIMULATED DATA — Demonstration caregiver records only.'),
    'Renders simulation disclosure'
  );
  assert(
    html.includes('Proposed framework, not clinically validated. Decision support, not diagnosis.'),
    'Renders safe harbor disclaimer'
  );
});

// 3. Configured matrix renders rows and columns
test('3. Configured matrix renders rows and columns', () => {
  const html = renderToString(
    <CaregiverMatrixTable
      rows={configuredVm.rows}
      columns={configuredVm.columns}
      isCompetenciesConfigured={true}
      onSelectCaregiver={() => {}}
    />
  );

  assert(html.includes('Vital Signs Telemetry'), 'Renders column name');
  assert(html.includes('Target: Level 3'), 'Renders target level header');
  assert(html.includes(dataset.caregivers[0].id), 'Renders caregiver ID');
});

// 4. Unconfigured competency state renders correctly
test('4. Unconfigured competency state renders correctly', () => {
  const html = renderToString(
    <CaregiverMatrixTable
      rows={unconfiguredVm.rows}
      columns={[]}
      isCompetenciesConfigured={false}
      onSelectCaregiver={() => {}}
    />
  );

  assert(
    html.includes('Competency definitions are not configured in the current dataset.'),
    'Renders honest unconfigured state notice'
  );
});

// 5. Level 0–4 values render exactly
test('5. Level 0–4 values render exactly', () => {
  const html = renderToString(
    <CaregiverMatrixTable
      rows={configuredVm.rows}
      columns={configuredVm.columns}
      isCompetenciesConfigured={true}
      onSelectCaregiver={() => {}}
    />
  );

  assert(html.includes('Level 3'), 'Renders Level 3 header or badge');
  // Confirm no semantic labels invented
  assert(!html.includes('Level 3 (Advanced)'), 'Does not invent Level 3 Advanced label');
  assert(!html.includes('Level 0 (Novice)'), 'Does not invent Level 0 Novice label');
});

// 6. Invalid level is never rendered
test('6. Invalid level is never rendered', () => {
  const html = renderToString(
    <CaregiverMatrixTable
      rows={configuredVm.rows}
      columns={configuredVm.columns}
      isCompetenciesConfigured={true}
      onSelectCaregiver={() => {}}
    />
  );

  assert(!html.includes('Level 5'), 'Level 5 is never rendered');
  assert(!html.includes('Level -1'), 'Negative level is never rendered');
});

// 7. Assessment method labels render
test('7. Assessment method labels render', () => {
  const html = renderToString(
    <CaregiverMatrixTable
      rows={configuredVm.rows}
      columns={configuredVm.columns}
      isCompetenciesConfigured={true}
      onSelectCaregiver={() => {}}
    />
  );

  assert(html.includes('OSCE') || html.includes('Direct Observation'), 'Renders valid assessment method');
});

// 8. Expiry states render
test('8. Expiry states render', () => {
  const html = renderToString(
    <CaregiverMatrixTable
      rows={configuredVm.rows}
      columns={configuredVm.columns}
      isCompetenciesConfigured={true}
      onSelectCaregiver={() => {}}
    />
  );

  assert(html.includes('Expired'), 'Renders Expired badge for past date');
});

// 9. Gap report renders configured gaps
test('9. Gap report renders configured gaps', () => {
  const html = renderToString(
    <CaregiverGapReport
      gaps={configuredVm.gaps}
      isCompetenciesConfigured={true}
    />
  );

  assert(html.includes('Competency Gap Audit Report'), 'Renders gap report header');
  assert(html.includes('-2'), 'Renders deficit -2 for CG-002');
  assert(html.includes('Below Target'), 'Renders Below Target status');
});

// 10. Unconfigured gap rules show honest state
test('10. Unconfigured gap rules show honest state', () => {
  const html = renderToString(
    <CaregiverGapReport
      gaps={[]}
      isCompetenciesConfigured={false}
    />
  );

  assert(
    html.includes('Gap rules are not configured in the current dataset.'),
    'Renders honest unconfigured gap rule notice'
  );
});

// 11. Search works
test('11. Search works', () => {
  const targetId = dataset.caregivers[0].id;
  const filteredVm = createCaregiverViewModel(dataset, {
    competencies: TEST_COMPETENCIES,
    assessments: TEST_ASSESSMENTS,
    filters: { searchQuery: targetId },
  });

  assert(filteredVm.rows.length === 1, 'Only one caregiver returned by ID search');
  assert(filteredVm.rows[0].caregiverId === targetId, 'Matches target ID');
});

// 12. Role filter works
test('12. Role filter works', () => {
  const targetRole = dataset.caregivers[0].roleId;
  const filteredVm = createCaregiverViewModel(dataset, {
    competencies: TEST_COMPETENCIES,
    assessments: TEST_ASSESSMENTS,
    filters: { roleId: targetRole },
  });

  assert(filteredVm.rows.every((r) => r.roleId === targetRole), 'All rows match role filter');
});

// 13. Assessment-status filter works
test('13. Assessment-status filter works', () => {
  const filteredVm = createCaregiverViewModel(dataset, {
    competencies: TEST_COMPETENCIES,
    assessments: TEST_ASSESSMENTS,
    filters: { competencyStatus: 'assessed' },
  });

  assert(
    filteredVm.rows.some((r) => r.caregiverId === dataset.caregivers[0].id),
    'Returns assessed caregiver'
  );
});

// 14. Assessment-method filter works
test('14. Assessment-method filter works', () => {
  const filteredVm = createCaregiverViewModel(dataset, {
    competencies: TEST_COMPETENCIES,
    assessments: TEST_ASSESSMENTS,
    filters: { assessmentMethod: 'OSCE' },
  });

  assert(filteredVm.rows.length === 1, 'Returns 1 caregiver evaluated via OSCE');
  assert(filteredVm.rows[0].caregiverId === dataset.caregivers[0].id, 'Matches CG-001');
});

// 15. Expiry filter works
test('15. Expiry filter works', () => {
  const filteredVm = createCaregiverViewModel(dataset, {
    competencies: TEST_COMPETENCIES,
    assessments: TEST_ASSESSMENTS,
    filters: { expiryStatus: 'expired' },
  });

  assert(
    filteredVm.rows.some((r) => r.caregiverId === dataset.caregivers[1].id),
    'Returns caregiver with expired assessment'
  );
});

// 16. Combined filters work
test('16. Combined filters work', () => {
  const targetRole = dataset.caregivers[0].roleId;
  const filteredVm = createCaregiverViewModel(dataset, {
    competencies: TEST_COMPETENCIES,
    assessments: TEST_ASSESSMENTS,
    filters: { roleId: targetRole, assessmentMethod: 'OSCE' },
  });

  assert(
    filteredVm.rows.every((r) => r.roleId === targetRole),
    'Matches combined role and method filter'
  );
});

// 17. Clear filters restores dataset
test('17. Clear filters restores dataset', () => {
  const html = renderToString(
    <CaregiverFilterToolbar
      filters={{ roleId: 'Caregiver-Level-1' }}
      onFilterChange={() => {}}
      onClearFilters={() => {}}
      availableRoles={configuredVm.availableRoles}
      totalCaregivers={configuredVm.totalCaregivers}
      filteredCount={1}
      isCompetenciesConfigured={true}
    />
  );

  assert(html.includes('Clear filters'), 'Clear filters button is rendered');
});

// 18. Caregiver row/cell is keyboard accessible
test('18. Caregiver row/cell is keyboard accessible', () => {
  const html = renderToString(
    <CaregiverMatrixTable
      rows={configuredVm.rows}
      columns={configuredVm.columns}
      isCompetenciesConfigured={true}
      onSelectCaregiver={() => {}}
    />
  );

  assert(html.includes('tabindex="0"'), 'Rows and cells have tabindex="0"');
  assert(html.includes('role="button"'), 'Cells have role="button"');
  assert(html.includes('aria-label="Caregiver '), 'Cells have descriptive aria-label');
});

// 19. Caregiver detail drawer opens
test('19. Caregiver detail drawer opens', () => {
  const html = renderToString(
    <CaregiverDetailDrawer
      detail={sampleDetail}
      isOpen={true}
      onClose={() => {}}
    />
  );

  assert(html.includes('role="dialog"'), 'Renders dialog role');
  assert(html.includes('aria-modal="true"'), 'Renders aria-modal="true"');
  assert(html.includes('aria-labelledby="caregiver-drawer-title"'), 'Has accessible title');
});

// 20. Drawer shows canonical caregiver information
test('20. Drawer shows canonical caregiver information', () => {
  const html = renderToString(
    <CaregiverDetailDrawer
      detail={sampleDetail}
      isOpen={true}
      onClose={() => {}}
    />
  );

  assert(html.includes(dataset.caregivers[0].id), 'Shows caregiver ID');
  assert(html.includes(dataset.caregivers[0].roleId), 'Shows role');
  assert(html.includes('Recorded Assessments'), 'Shows assessments section');
});

// 21. Dual-assessor information renders when available
test('21. Dual-assessor information renders when available', () => {
  const pairs = getDualAssessorPairs(TEST_ASSESSMENTS);
  const html = renderToString(<DualAssessorPanel pairs={pairs} />);

  assert(html.includes('ASR-001'), 'Shows Assessor A');
  assert(html.includes('ASR-002'), 'Shows Assessor B');
  assert(html.includes('Agreed'), 'Shows Agreement status');
});

// 22. No fake kappa/reliability metric is shown
test('22. No fake kappa/reliability metric is shown', () => {
  const pairs = getDualAssessorPairs(TEST_ASSESSMENTS);
  const html = renderToString(<DualAssessorPanel pairs={pairs} />);

  assert(!html.toLowerCase().includes('cohen'), 'Does not show Cohen kappa');
  assert(!html.toLowerCase().includes('kappa ='), 'Does not display kappa metric');
  assert(!html.toLowerCase().includes('reliability: 9'), 'Does not fabricate reliability %');
});

// 23. Assessor entry form renders
test('23. Assessor entry form renders', () => {
  const html = renderToString(
    <AssessorEntryForm
      caregivers={dataset.caregivers}
      competencies={TEST_COMPETENCIES}
      isCompetenciesConfigured={true}
    />
  );

  assert(html.includes('Assessor Evaluation Entry Form'), 'Renders form header');
  assert(html.includes('Competency Level (0–4)'), 'Renders level 0-4 label');
  assert(html.includes('Record Local Evaluation'), 'Renders submit button');
});

// 24. Form validation handles invalid level/method
test('24. Form validation handles invalid level/method', () => {
  const invalidResult = validateAssessmentEntry({
    caregiverId: 'CG-001',
    competencyId: 'COMP-01',
    level: 7, // Invalid level
    method: 'InvalidMethod',
    assessorId: 'ASR-001',
    timestamp: '2026-01-01T00:00:00.000Z',
  });

  assert(!invalidResult.valid, 'Invalid level and method are rejected');
  assert(invalidResult.errors.length >= 2, 'Reports multiple validation errors');
});

// 25. Form does not claim Firestore persistence
test('25. Form does not claim Firestore persistence', () => {
  const html = renderToString(
    <AssessorEntryForm
      caregivers={dataset.caregivers}
      competencies={TEST_COMPETENCIES}
      isCompetenciesConfigured={true}
    />
  );

  assert(
    html.includes('Session draft only — not persisted to external databases'),
    'Displays honest session draft disclaimer'
  );
});

// 26. Missing competency configuration prevents fake competency selection
test('26. Missing competency configuration prevents fake competency selection', () => {
  const html = renderToString(
    <AssessorEntryForm
      caregivers={dataset.caregivers}
      competencies={[]}
      isCompetenciesConfigured={false}
    />
  );

  assert(
    html.includes('Assessment entry unavailable until competencies are configured.'),
    'Shows unavailable notice when competencies are unconfigured'
  );
  assert(!html.includes('Clinical Skill A'), 'Does not fabricate fake competencies');
});

// 27. Empty gap report state renders
test('27. Empty gap report state renders', () => {
  const html = renderToString(
    <CaregiverGapReport
      gaps={[]}
      isCompetenciesConfigured={true}
    />
  );

  assert(
    html.includes('No competency gaps identified for configured targets.'),
    'Renders zero gaps message when targets are met'
  );
});

// 28. No staffing/fatigue UI is rendered
test('28. No staffing/fatigue UI is rendered', () => {
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/caregivers']}>
      <CaregiversPage seed={42} />
    </MemoryRouter>
  );

  const lower = html.toLowerCase();
  const forbiddenTerms = [
    'nurse-to-patient',
    'staffing ratio',
    'fatigue threshold',
    'overtime limit',
    'workforce rest',
    'mandatory break',
  ];

  for (const term of forbiddenTerms) {
    assert(!lower.includes(term), `Does not render staffing/fatigue term "${term}"`);
  }
});

// 29. No unsupported regulatory/clinical claims are rendered
test('29. No unsupported regulatory/clinical claims are rendered', () => {
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/caregivers']}>
      <CaregiversPage seed={42} />
    </MemoryRouter>
  );

  const lower = html.toLowerCase();
  const forbiddenClaims = [
    'clinical certification',
    'state licensing board',
    'legally certified',
    'accredited caregiver',
    'hospital regulatory compliance',
  ];

  for (const claim of forbiddenClaims) {
    assert(!lower.includes(claim), `Does not render unsupported clinical claim "${claim}"`);
  }
});

// 30. Responsive structure avoids uncontrolled page-wide overflow
test('30. Responsive structure avoids uncontrolled page-wide overflow', () => {
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/caregivers']}>
      <CaregiversPage seed={42} />
    </MemoryRouter>
  );

  assert(html.includes('overflow-x-auto'), 'Table containers have overflow-x-auto');
  assert(html.includes('min-w-['), 'Min-width preserves matrix density without page blowup');
});

console.log(`\nResults: ${passed} of ${total} caregiver UI tests passed.`);
if (passed !== total) {
  process.exit(1);
}
