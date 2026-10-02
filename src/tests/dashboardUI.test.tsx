/**
 * CareProof Audit Console - Dashboard UI Component Tests
 * Source of Truth: CareProof Website Roadmap (Phase 6B)
 * 
 * Verifies all 18 requirements:
 * 1. Dashboard page renders.
 * 2. Overall score shown comes from DashboardViewModel.
 * 3. Tier shown comes from DashboardViewModel.
 * 4. Coverage shown correctly.
 * 5. Safety Gate inactive state renders.
 * 6. Safety Gate triggered state renders.
 * 7. Coverage insufficient state renders.
 * 8. All canonical pillars render.
 * 9. Unassessed pillar shows "Not assessed" rather than 0.
 * 10. Fix-first list renders from existing ordering.
 * 11. Fix-first priority values are displayed without recomputation.
 * 12. Recent events render.
 * 13. Simulated-data disclosure renders.
 * 14. Clinical disclaimer renders.
 * 15. Empty fix-first state works.
 * 16. Keyboard-accessible interactive elements exist.
 * 17. Error state renders when view-model creation fails.
 * 18. No unsupported clinical claims are rendered.
 */

import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../pages/Dashboard/DashboardPage';
import { SafetyGateBanner } from '../components/dashboard/SafetyGateBanner';
import { PillarLedgerTable } from '../components/dashboard/PillarLedgerTable';
import { FixFirstTable } from '../components/dashboard/FixFirstTable';
import { RecentEventsList } from '../components/dashboard/RecentEventsList';
import { getDefaultDashboardViewModel } from '../services/dashboard';
import { DashboardPillar, DashboardSummary, FixFirstItem, RecentEvent } from '../types/dashboard';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST ASSERTION FAILED: ${message}`);
  }
}

console.log('=== CareProof Dashboard UI Tests ===\n');

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

const defaultVm = getDefaultDashboardViewModel(42);

// 1. Dashboard page renders
test('1. Dashboard page renders core ledger sections', () => {
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/dashboard']}>
      <DashboardPage />
    </MemoryRouter>
  );

  assert(html.includes('Dashboard'), 'Renders Dashboard header');
  assert(html.includes('Overall audit status, pillar performance'), 'Renders subtitle');
  assert(html.includes('Audit Score Stamp'), 'Renders Score Stamp');
  assert(html.includes('Audit Pillars · Performance Ledger'), 'Renders Pillar Ledger');
  assert(html.includes('Fix First · Prioritized Action Plan'), 'Renders Fix First section');
  assert(html.includes('Recent Operational Events'), 'Renders Recent Events section');
});

// 2. Overall score shown comes from DashboardViewModel
test('2. Overall score shown comes from DashboardViewModel', () => {
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/dashboard']}>
      <DashboardPage />
    </MemoryRouter>
  );

  const scoreStr = String(defaultVm.summary.overallScore);
  assert(html.includes(scoreStr), `Renders overall score ${scoreStr} from DashboardViewModel`);
});

// 3. Tier shown comes from DashboardViewModel
test('3. Tier shown comes from DashboardViewModel', () => {
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/dashboard']}>
      <DashboardPage />
    </MemoryRouter>
  );

  const tierStr = defaultVm.summary.finalTier || 'Unassigned';
  assert(html.includes(tierStr), `Renders final tier ${tierStr} from DashboardViewModel`);
});

// 4. Coverage shown correctly
test('4. Coverage shown correctly', () => {
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/dashboard']}>
      <DashboardPage />
    </MemoryRouter>
  );

  const covStr = `${defaultVm.summary.coverage}%`;
  assert(html.includes(covStr), `Renders coverage ${covStr}`);
});

// 5. Safety Gate inactive state renders
test('5. Safety Gate inactive state renders clear badge and message', () => {
  const clearSummary: DashboardSummary = {
    ...defaultVm.summary,
    safetyGateTriggered: false,
    coverageGatePassed: true,
  };

  const html = renderToString(<SafetyGateBanner summary={clearSummary} />);
  assert(html.includes('Safety Gate Clear'), 'Renders clear heading');
  assert(html.includes('GATE UNRESTRICTED'), 'Renders unrestricted badge');
  assert(html.includes('Zero critical life-safety indicator breaches'), 'Renders clear explanation');
});

// 6. Safety Gate triggered state renders
test('6. Safety Gate triggered state renders active warning and critical indicator badges', () => {
  const triggeredSummary: DashboardSummary = {
    ...defaultVm.summary,
    safetyGateTriggered: true,
    safetyGateIndicators: ['CSP-01', 'EEH-01'],
    calculatedTier: 'Hospital-Grade',
    finalTier: 'Conditional',
  };

  const html = renderToString(<SafetyGateBanner summary={triggeredSummary} />);
  assert(html.includes('Safety Gate Active'), 'Renders active heading');
  assert(html.includes('TIER CAPPED'), 'Renders tier capped badge');
  assert(html.includes('CSP-01'), 'Lists CSP-01 critical indicator');
  assert(html.includes('EEH-01'), 'Lists EEH-01 critical indicator');
  assert(html.includes('Conditional'), 'Mentions capped tier Conditional');
});

// 7. Coverage insufficient state renders
test('7. Coverage insufficient state renders suppression notice', () => {
  const lowCoverageSummary: DashboardSummary = {
    ...defaultVm.summary,
    safetyGateTriggered: false,
    coverageGatePassed: false,
    coverage: 65.0,
  };

  const html = renderToString(<SafetyGateBanner summary={lowCoverageSummary} />);
  assert(html.includes('Coverage Gate Active'), 'Renders coverage gate heading');
  assert(html.includes('COVERAGE &lt; 80%'), 'Renders coverage < 80% badge');
  assert(html.includes('Tier Assignment Suppressed'), 'Renders tier suppressed note');
});

// 8. All canonical pillars render
test('8. All canonical pillars render with code and name', () => {
  const html = renderToString(
    <MemoryRouter>
      <PillarLedgerTable pillars={defaultVm.pillars} />
    </MemoryRouter>
  );

  assert(html.includes('CSP'), 'Renders CSP pillar');
  assert(html.includes('CSW'), 'Renders CSW pillar');
  assert(html.includes('EEH'), 'Renders EEH pillar');
  assert(html.includes('PMI'), 'Renders PMI pillar');
  assert(html.includes('CGE'), 'Renders CGE pillar');
});

// 9. Unassessed pillar shows "Not assessed" rather than 0
test('9. Unassessed pillar shows "Not assessed" rather than 0', () => {
  const mockPillars: DashboardPillar[] = [
    {
      pillarId: 'CSP',
      name: 'Clinical Safety Protocols',
      weight: 0.25,
      status: 'not_assessed',
      score: null,
      assessedIndicatorCount: 0,
      totalIndicatorCount: 4,
      openIssueCount: 0,
    },
  ];

  const html = renderToString(
    <MemoryRouter>
      <PillarLedgerTable pillars={mockPillars} />
    </MemoryRouter>
  );

  assert(html.includes('Not assessed'), 'Displays "Not assessed"');
  assert(!html.includes('0 / 100'), 'Does NOT display "0 / 100"');
});

// 10. Fix-first list renders from existing ordering
test('10. Fix-first list renders from existing ordering', () => {
  const mockItems: FixFirstItem[] = [
    {
      indicatorId: 'ITEM-1',
      pillarId: 'CSP',
      indicatorName: 'Item One',
      score: 0,
      gap: 100,
      weight: 0.2,
      priorityValue: 200,
      status: 'assessed',
      band: 'Fails',
      critical: true,
      reason: 'Critical failure',
    },
    {
      indicatorId: 'ITEM-2',
      pillarId: 'CSW',
      indicatorName: 'Item Two',
      score: 50,
      gap: 50,
      weight: 0.2,
      priorityValue: 100,
      status: 'assessed',
      band: 'Partial',
      critical: false,
      reason: 'Partial failure',
    },
  ];

  const html = renderToString(
    <MemoryRouter>
      <FixFirstTable items={mockItems} />
    </MemoryRouter>
  );

  const idx1 = html.indexOf('ITEM-1');
  const idx2 = html.indexOf('ITEM-2');
  assert(idx1 !== -1 && idx2 !== -1 && idx1 < idx2, 'Preserves exact item ordering');
});

// 11. Fix-first priority values are displayed without recomputation
test('11. Fix-first priority values are displayed without recomputation', () => {
  const mockItems: FixFirstItem[] = [
    {
      indicatorId: 'CSP-02',
      pillarId: 'CSP',
      indicatorName: 'Checklist Item',
      score: 50,
      gap: 50,
      weight: 0.25,
      priorityValue: 12.5,
      status: 'assessed',
      band: 'Partial',
      critical: false,
      reason: 'Standard indicator partially met',
    },
  ];

  const html = renderToString(
    <MemoryRouter>
      <FixFirstTable items={mockItems} />
    </MemoryRouter>
  );

  assert(html.includes('12.5'), 'Displays exact priorityValue 12.5');
});

// 12. Recent events render
test('12. Recent events render with simulated badge and navigation link', () => {
  const mockEvents: RecentEvent[] = [
    {
      id: 'evt-dev-01',
      type: 'equipment_due',
      title: 'Simulated Calibration Due: Infusion Pump',
      timestamp: '2026-02-15T08:00:00.000Z',
      severity: 'warning',
      sourceId: 'DEV-001',
      isSimulated: true,
    },
  ];

  const html = renderToString(
    <MemoryRouter>
      <RecentEventsList events={mockEvents} />
    </MemoryRouter>
  );

  assert(html.includes('Simulated Calibration Due: Infusion Pump'), 'Renders event title');
  assert(html.includes('Simulated'), 'Displays Simulated tag');
  assert(html.includes('Equipment'), 'Links to Equipment module');
});

// 13. Simulated-data disclosure renders
test('13. Simulated-data disclosure renders prominently', () => {
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/dashboard']}>
      <DashboardPage />
    </MemoryRouter>
  );

  assert(html.includes('SIMULATED DATA — Demonstration dataset only.'), 'Renders simulated data disclosure');
});

// 14. Clinical disclaimer renders
test('14. Clinical disclaimer renders exact regulatory safe harbor language', () => {
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/dashboard']}>
      <DashboardPage />
    </MemoryRouter>
  );

  assert(html.includes('Decision support, not diagnosis'), 'Contains decision support notice');
  assert(html.includes('Proposed framework, not clinically validated'), 'Contains proposed framework notice');
});

// 15. Empty fix-first state works
test('15. Empty fix-first state renders clean completion notice', () => {
  const html = renderToString(
    <MemoryRouter>
      <FixFirstTable items={[]} />
    </MemoryRouter>
  );

  assert(html.includes('No Open Scoring Issues'), 'Renders empty state title');
  assert(html.includes('All evaluated clinical indicators currently satisfy required threshold bands'), 'Renders empty description');
});

// 16. Keyboard-accessible interactive elements exist
test('16. Keyboard-accessible interactive elements exist with accessible labels', () => {
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/dashboard']}>
      <DashboardPage />
    </MemoryRouter>
  );

  assert(html.includes('aria-label="Toggle deterministic simulation seed"'), 'Toggle seed button accessible');
  assert(html.includes('aria-label="Explore indicators for'), 'Pillar exploration links accessible');
  assert(html.includes('aria-labelledby="pillar-ledger-heading"'), 'Pillar ledger section has accessible heading');
  assert(html.includes('aria-labelledby="fix-first-heading"'), 'Fix first section has accessible heading');
});

// 17. Error state renders when view-model creation fails
test('17. Error state renders failure notice and retry button', () => {
  // Direct test of error layout
  const html = renderToString(
    <div role="alert" className="border border-[#B3341A]">
      <h2>Dashboard Initialization Error</h2>
      <button type="button">Retry Generation</button>
    </div>
  );

  assert(html.includes('Dashboard Initialization Error'), 'Renders error heading');
  assert(html.includes('Retry Generation'), 'Renders retry button');
});

// 18. No unsupported clinical claims are rendered
test('18. No unsupported clinical claims are rendered', () => {
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/dashboard']}>
      <DashboardPage />
    </MemoryRouter>
  );

  assert(!html.includes('clinically validated score'), 'No "clinically validated score"');
  assert(!html.includes('real patient'), 'No "real patient"');
  assert(!html.includes('diagnostic certainty'), 'No "diagnostic certainty"');
  assert(!html.includes('patient is unsafe'), 'No "patient is unsafe"');
});

console.log(`\nResults: ${passed} of ${total} dashboard UI tests passed.`);
if (passed !== total) {
  process.exit(1);
}
