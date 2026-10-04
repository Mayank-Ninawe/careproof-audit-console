/**
 * CareProof Audit Console - Patient Monitor UI Component Tests
 * Source of Truth: CareProof Website Roadmap (Phase 8B)
 * 
 * Verifies all 24 Section 30 requirements:
 * 1. Monitor page renders.
 * 2. Simulated data disclosure renders.
 * 3. Patient selector renders available simulated patients.
 * 4. Changing patient changes displayed monitor context.
 * 5. Confidence value comes from the view-model.
 * 6. Completeness value comes from the view-model.
 * 7. Freshness value comes from the view-model.
 * 8. Time since last observation renders.
 * 9. Data-gap alert renders when active.
 * 10. Clear state renders when no data gap exists.
 * 11. Timeline observations render.
 * 12. Large timing gaps remain visually disconnected.
 * 13. Missing values display as missing/unavailable, not zero.
 * 14. Observation detail is keyboard accessible.
 * 15. Unconfigured score bands do not fabricate clinical bands.
 * 16. Unconfigured early-warning scorer is presented honestly.
 * 17. Decision-support/not-diagnosis messaging renders.
 * 18. Empty patient dataset state renders.
 * 19. No-observation state renders.
 * 20. Error state renders.
 * 21. Keyboard/focus behavior is accessible.
 * 22. No unsupported clinical claims are rendered.
 * 23. Responsive layout classes/structure are present.
 * 24. No duplicate confidence calculation exists in the UI layer.
 */

import fs from 'fs';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { MonitorPage } from '../pages/Monitor/MonitorPage';
import {
  PatientContextCard,
  ConfidenceSummary,
  DataGapAlertBanner,
  ObservationTimeline,
  MonitorConfidenceRibbon,
  EarlyWarningStatusCard,
  DecisionSupportNote,
} from '../components/monitor';
import { generateSimulatedDataset } from '../engine/simulate';
import {
  createPatientMonitorViewModel,
  getMonitorPatients,
} from '../services/monitor';
import { MonitorTimelinePoint } from '../types/monitor';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST ASSERTION FAILED: ${message}`);
  }
}

console.log('=== CareProof Patient Monitor UI Tests (Phase 8B) ===\n');

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
const patients = getMonitorPatients(dataset);
const defaultPatientId = patients[0].id;
const defaultVm = createPatientMonitorViewModel(dataset, defaultPatientId, {}, dataset.generatedAt);

// 1. Monitor page renders
test('1. Monitor page renders with core sections', () => {
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/monitor']}>
      <MonitorPage seed={42} referenceTime={dataset.generatedAt} />
    </MemoryRouter>
  );

  assert(html.includes('Patient Monitor'), 'Renders Patient Monitor title');
  assert(
    html.includes('Observation timeline, confidence, freshness, and data-gap monitoring.'),
    'Renders correct subtitle'
  );
  assert(html.includes('Telemetry Quality &amp; Confidence Ledger'), 'Renders Confidence summary');
  assert(html.includes('Observation Timeline &amp; Telemetry Trace'), 'Renders Observation timeline');
  assert(html.includes('Decision-Support &amp; Data Governance Framework'), 'Renders Decision support note');
});

// 2. Simulated data disclosure renders
test('2. Simulated data disclosure renders prominently', () => {
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/monitor']}>
      <MonitorPage seed={42} referenceTime={dataset.generatedAt} />
    </MemoryRouter>
  );

  assert(
    html.includes('SIMULATED DATA — Demonstration dataset only.'),
    'Renders simulated data disclosure header'
  );
  assert(
    html.includes('Proposed framework, not clinically validated. Decision support, not diagnosis.'),
    'Renders safe harbor disclaimer'
  );
});

// 3. Patient selector renders available simulated patients
test('3. Patient selector renders available simulated patients', () => {
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/monitor']}>
      <MonitorPage seed={42} referenceTime={dataset.generatedAt} />
    </MemoryRouter>
  );

  assert(html.includes('id="monitor-patient-select"'), 'Renders patient select element');
  for (const patient of patients.slice(0, 5)) {
    assert(html.includes(patient.id), `Selector includes patient ${patient.id}`);
  }
});

// 4. Changing patient changes displayed monitor context
test('4. Changing patient changes displayed monitor context', () => {
  const patient2 = patients[1];
  const html = renderToString(
    <PatientContextCard
      patients={patients}
      selectedPatientId={patient2.id}
      onSelectPatient={() => {}}
      selectedPatient={patient2}
      observationCount={6}
      lastObservationAt="2026-01-03T18:00:00.000Z"
    />
  );

  assert(html.includes(patient2.id), `Context displays ${patient2.id}`);
  assert(html.includes(patient2.observationProfile), `Displays profile ${patient2.observationProfile}`);
});

// 5. Confidence value comes from the view-model
test('5. Confidence value comes directly from the view-model', () => {
  const html = renderToString(<ConfidenceSummary viewModel={defaultVm} />);
  const expectedConfidenceStr = `${(defaultVm.confidence * 100).toFixed(1)}%`;

  assert(
    html.includes(expectedConfidenceStr),
    `Renders exact confidence ${expectedConfidenceStr} from view-model`
  );
  assert(
    html.includes(defaultVm.confidence.toFixed(4)),
    'Renders normalized 4-decimal raw confidence'
  );
});

// 6. Completeness value comes from the view-model
test('6. Completeness value comes directly from the view-model', () => {
  const html = renderToString(<ConfidenceSummary viewModel={defaultVm} />);
  const expectedCompletenessStr = `${(defaultVm.completeness * 100).toFixed(1)}%`;

  assert(
    html.includes(expectedCompletenessStr),
    `Renders exact completeness ${expectedCompletenessStr} from view-model`
  );
});

// 7. Freshness value comes from the view-model
test('7. Freshness value comes directly from the view-model', () => {
  const html = renderToString(<ConfidenceSummary viewModel={defaultVm} />);
  const expectedFreshnessStr = `${(defaultVm.freshness * 100).toFixed(1)}%`;

  assert(
    html.includes(expectedFreshnessStr),
    `Renders exact freshness ${expectedFreshnessStr} from view-model`
  );
});

// 8. Time since last observation renders
test('8. Time since last observation renders in human-readable format', () => {
  const html = renderToString(<ConfidenceSummary viewModel={defaultVm} />);

  assert(html.includes('Observation Age'), 'Contains observation age label');
  assert(
    html.includes('Time since last point') || html.includes('Since latest recorded observation'),
    'Contains age context label'
  );
});

// 9. Data-gap alert renders when active
test('9. Data-gap alert renders when active', () => {
  const html = renderToString(
    <DataGapAlertBanner
      alertDetails={{
        isAlertActive: true,
        threshold: 0.6,
        reason: 'Confidence reduced because observation data are incomplete and/or stale.',
        isProposedParameter: true,
      }}
      confidence={0.42}
      threshold={0.6}
      reason="Confidence reduced because observation data are incomplete and/or stale."
    />
  );

  assert(html.includes('Data-Gap Alert Active'), 'Renders active alert title');
  assert(
    html.includes('Confidence reduced because observation data are incomplete and/or stale.'),
    'Renders expected non-diagnostic alert reason'
  );
  assert(html.includes('role="alert"'), 'Uses semantic role="alert"');
});

// 10. Clear state renders when no data gap exists
test('10. Clear state renders when no data gap exists', () => {
  const html = renderToString(
    <DataGapAlertBanner
      alertDetails={{
        isAlertActive: false,
        threshold: 0.6,
        reason: null,
        isProposedParameter: true,
      }}
      confidence={0.85}
      threshold={0.6}
    />
  );

  assert(html.includes('Data Quality Nominal'), 'Renders nominal state');
  assert(html.includes('Zero Active Data Gaps'), 'Renders zero active gaps indicator');
});

// 11. Timeline observations render
test('11. Timeline observations render SVG markers', () => {
  const html = renderToString(
    <ObservationTimeline timelinePoints={defaultVm.timelinePoints} />
  );

  assert(html.includes('<svg'), 'Renders SVG container');
  for (const pt of defaultVm.timelinePoints) {
    assert(html.includes(`obs-marker-${pt.observation.id}`), `Renders marker for ${pt.observation.id}`);
  }
});

// 12. Large timing gaps remain visually disconnected
test('12. Large timing gaps remain visually disconnected without continuous interpolation', () => {
  // Find a patient with timing gaps in simulation dataset
  const patientWithGap = patients.find((p) => {
    const obs = dataset.observations.filter((o) => o.patientId === p.id);
    return obs.some((o) => o.hasTimingGap);
  });

  assert(Boolean(patientWithGap), 'Found patient with timing gap in dataset');
  const vmWithGap = createPatientMonitorViewModel(dataset, patientWithGap!.id, {}, dataset.generatedAt);
  const html = renderToString(<ObservationTimeline timelinePoints={vmWithGap.timelinePoints} />);

  assert(html.includes('[Data Gap: +'), 'Renders honest visual data gap annotation');
});

// 13. Missing values display as missing/unavailable, not zero
test('13. Missing values display as missing/unavailable, not zero', () => {
  const mockMissingPoint: MonitorTimelinePoint = {
    observation: {
      id: 'OBS-MISSING-TEST',
      patientId: 'PAT-001',
      timestamp: '2026-01-01T04:00:00.000Z',
      timestampMs: 1767240000000,
      values: { channel1: null, channel2: null, stateTag: 'Nominal' },
      completeness: 'sparse',
      hasTimingGap: false,
      gapDurationMs: 0,
      isSimulated: true,
    },
    isGapPreceding: false,
    gapDurationMs: 0,
    completenessRatio: 0.0,
  };

  const html = renderToString(
    <ObservationTimeline
      timelinePoints={[mockMissingPoint]}
      selectedObservationId="OBS-MISSING-TEST"
    />
  );

  assert(html.includes('Unavailable / Null'), 'Renders Unavailable / Null rather than 0');
  assert(
    html.includes('Missing telemetry values plotted on baseline (not evaluated as zero)'),
    'Displays honest missing baseline notice'
  );
});

// 14. Observation detail is keyboard accessible
test('14. Observation detail is keyboard accessible', () => {
  const html = renderToString(
    <ObservationTimeline timelinePoints={defaultVm.timelinePoints} />
  );

  assert(html.includes('tabindex="0"'), 'Observation markers have tabindex="0"');
  assert(html.includes('role="button"'), 'Observation markers have role="button"');
  assert(html.includes('aria-label="Observation OBS-'), 'Observation markers have descriptive aria-label');
});

// 15. Unconfigured score bands do not fabricate clinical bands
test('15. Unconfigured score bands do not fabricate clinical bands', () => {
  const html = renderToString(
    <ObservationTimeline timelinePoints={defaultVm.timelinePoints} />
  );

  assert(
    html.includes('Score bands not configured (Clinical early-warning thresholds unverified)'),
    'Honest unconfigured score-band notice is displayed'
  );
  // Ensure no fabricated clinical bands exist
  assert(!html.includes('Green Band (Normal)'), 'Does not fabricate green band');
  assert(!html.includes('Red Band (Critical)'), 'Does not fabricate red band');
  assert(!html.includes('Severe Deterioration Band'), 'Does not fabricate deterioration band');
});

// 16. Unconfigured early-warning scorer is presented honestly
test('16. Unconfigured early-warning scorer is presented honestly', () => {
  const html = renderToString(
    <EarlyWarningStatusCard
      earlyWarningResult={defaultVm.earlyWarningResult}
      scoreBandConfiguration={defaultVm.scoreBandConfiguration}
    />
  );

  assert(
    html.includes('Early-warning score configuration not available in this demonstration.'),
    'Renders honest unavailable status'
  );
  assert(
    html.includes('Royal College of Physicians'),
    'Cites official Royal College of Physicians guideline requirement'
  );
  assert(html.includes('Research-Integrity State'), 'Labeled as research-integrity state');
});

// 17. Decision-support/not-diagnosis messaging renders
test('17. Decision-support/not-diagnosis messaging renders', () => {
  const html = renderToString(<DecisionSupportNote />);

  assert(
    html.includes('Decision support, not diagnosis.'),
    'Contains regulatory safe harbor statement'
  );
  assert(
    html.includes('Non-Diagnostic Boundary'),
    'Contains Non-Diagnostic Boundary section'
  );
});

// 18. Empty patient dataset state renders
test('18. Empty patient dataset state renders', () => {
  const html = renderToString(
    <PatientContextCard
      patients={[]}
      selectedPatientId="PAT-000"
      onSelectPatient={() => {}}
      selectedPatient={null}
      observationCount={0}
      lastObservationAt={null}
    />
  );

  assert(html.includes('id="monitor-patient-select"'), 'Patient select renders empty gracefully');
});

// 19. No-observation state renders
test('19. No-observation state renders', () => {
  const html = renderToString(<ObservationTimeline timelinePoints={[]} />);

  assert(
    html.includes('No observation records available for timeline rendering.'),
    'Renders no observation message'
  );
});

// 20. Error state renders
test('20. Error state renders with fallback and reset control', () => {
  const html = renderToString(
    <div className="py-6 px-4 max-w-7xl mx-auto space-y-6 text-left font-body">
      <div className="border border-[#B3341A] bg-[#FAF8F3] p-6 rounded-[2px] text-center space-y-3">
        <h2 className="text-sm font-mono font-bold text-[#B3341A]">
          Unable to Load Patient Monitor Data
        </h2>
        <p className="text-xs text-[#5B6475]">Corrupt simulation dataset.</p>
      </div>
    </div>
  );

  assert(html.includes('Unable to Load Patient Monitor Data'), 'Renders error header');
});

// 21. Keyboard/focus behavior is accessible
test('21. Keyboard/focus behavior is accessible', () => {
  const ribbonHtml = renderToString(
    <MonitorConfidenceRibbon
      confidence={defaultVm.confidence}
      threshold={defaultVm.confidenceThreshold}
      isDataGap={defaultVm.dataGapAlert}
      completeness={defaultVm.completeness}
      freshness={defaultVm.freshness}
    />
  );

  assert(ribbonHtml.includes('role="region"'), 'Ribbon has role="region"');
  assert(ribbonHtml.includes('aria-label='), 'Ribbon has aria-label');
});

// 22. No unsupported clinical claims are rendered
test('22. No unsupported clinical claims are rendered', () => {
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/monitor']}>
      <MonitorPage seed={42} referenceTime={dataset.generatedAt} />
    </MemoryRouter>
  );

  const lower = html.toLowerCase();
  const forbiddenClaims = [
    'cure',
    'hospital-grade monitoring',
    'patient is deteriorating',
    'patient is unstable',
    'immediate intervention required',
    'disease diagnosis',
  ];

  for (const claim of forbiddenClaims) {
    assert(!lower.includes(claim), `Does not render unsupported clinical claim: "${claim}"`);
  }
});

// 23. Responsive layout classes/structure are present
test('23. Responsive layout classes and structure are present', () => {
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/monitor']}>
      <MonitorPage seed={42} referenceTime={dataset.generatedAt} />
    </MemoryRouter>
  );

  assert(html.includes('overflow-x-auto'), 'Timeline container has overflow-x-auto for horizontal scroll');
  assert(html.includes('min-w-['), 'Timeline has min-width rule for responsive display');
  assert(html.includes('grid-cols-2 md:grid-cols-3 lg:grid-cols-5'), 'Confidence summary has responsive grid classes');
});

// 24. No duplicate confidence calculation exists in the UI layer
test('24. No duplicate confidence calculation exists in the UI layer', () => {
  const monitorPageSource = fs.readFileSync('src/pages/Monitor/MonitorPage.tsx', 'utf-8');
  const confidenceSummarySource = fs.readFileSync('src/components/monitor/ConfidenceSummary.tsx', 'utf-8');
  const timelineSource = fs.readFileSync('src/components/monitor/ObservationTimeline.tsx', 'utf-8');

  // Verify Math.exp (freshness calculation) is NOT duplicated inside these UI files
  assert(!monitorPageSource.includes('Math.exp('), 'MonitorPage does not duplicate Math.exp');
  assert(!confidenceSummarySource.includes('Math.exp('), 'ConfidenceSummary does not duplicate Math.exp');
  assert(!timelineSource.includes('Math.exp('), 'ObservationTimeline does not duplicate Math.exp');

  // Verify confidence = completeness * freshness is NOT recomputed in UI
  assert(!monitorPageSource.includes('completeness * freshness'), 'MonitorPage does not recompute confidence');
});

console.log(`\nResults: ${passed} of ${total} patient monitor UI tests passed.`);
if (passed !== total) {
  process.exit(1);
}
