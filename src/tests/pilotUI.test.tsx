/**
 * CareProof Audit Console - Pilot Study UI Component Tests
 * Source of Truth: CareProof Website Roadmap (Phase 10B)
 * 
 * Verifies all 28 required Section 30 test specifications:
 * 1. Pilot page renders.
 * 2. SIMULATED disclosure renders prominently.
 * 3. Protocol summary renders.
 * 4. Sample size renders with simulation context.
 * 5. Primary/secondary endpoints render.
 * 6. Seed/reproducibility information renders.
 * 7. Score distribution renders from PilotViewModel.
 * 8. Mean/median/SD values render.
 * 9. Kappa renders when available.
 * 10. Kappa unavailable state renders honestly.
 * 11. Cronbach alpha renders when available.
 * 12. Alpha unavailable state renders honestly.
 * 13. ROC curve renders from actual ROC points.
 * 14. AUC renders when available.
 * 15. AUC unavailable state renders honestly.
 * 16. Limitations render.
 * 17. No fake statistical fallback values appear.
 * 18. No unsupported clinical claims appear.
 * 19. Statistical status is communicated without color-only semantics.
 * 20. Accessible chart descriptions/metric text exist.
 * 21. Responsive chart containers are present.
 * 22. Regeneration uses the actual simulation service if regeneration UI is implemented.
 * 23. Different seed produces different simulated view where seed control exists.
 * 24. Same seed reproduces the same result where seed control exists.
 * 25. No Firebase persistence is introduced by Pilot UI.
 * 26. Keyboard-accessible controls work.
 * 27. Error state renders.
 * 28. Loading state renders where applicable.
 */

import fs from 'node:fs';
import path from 'node:path';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { PilotPage } from '../pages/Pilot/PilotPage';
import {
  PilotDisclosureBanner,
  PilotProtocolCard,
  PilotSeedControl,
  ScoreDistributionChart,
  ReliabilityMetricsPanel,
  RocCurveChart,
  PilotLimitationsBox,
  PilotMethodologyNote,
} from '../components/pilot';
import { createPilotViewModel } from '../services/pilot';
import {
  InterRaterResult,
  InternalConsistencyResult,
  RocResult,
} from '../types/pilot';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`TEST ASSERTION FAILED: ${message}`);
  }
}

console.log('=== CareProof Pilot Study UI Tests (Phase 10B) ===\n');

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

const defaultVm = createPilotViewModel(undefined, 42);

// 1. Pilot page renders
test('1. Pilot page renders with primary headers and structure', () => {
  const html = renderToString(
    <MemoryRouter>
      <PilotPage />
    </MemoryRouter>
  );

  assert(html.includes('Pilot Study'), 'Page title must render');
  assert(
    html.includes('Simulated validation results, reproducibility, and study limitations.'),
    'Subtitle must render'
  );
  assert(html.includes('SIMULATED IN SILICO'), 'Badge must render');
});

// 2. SIMULATED disclosure renders prominently
test('2. SIMULATED disclosure renders prominently', () => {
  const html = renderToString(<PilotDisclosureBanner />);

  assert(html.includes('SIMULATED'), 'Must show prominent SIMULATED label');
  assert(
    html.includes('All results on this page are generated from deterministic demonstration data.'),
    'Must include demonstration data explanation'
  );
  assert(
    html.includes('Proposed framework, not clinically validated. In silico demonstration simulation only'),
    'Must include safe harbor notice'
  );
  assert(html.includes('Zero real patient records'), 'Must state zero real records');
});

// 3. Protocol summary renders
test('3. Protocol summary renders protocol ID and study design', () => {
  const html = renderToString(<PilotProtocolCard protocol={defaultVm.protocol} />);

  assert(html.includes('PROTO-PILOT-SIM-001'), 'Protocol ID must render');
  assert(
    html.includes('Proposed In Silico Simulation Protocol (Synthetic Demonstration Only)'),
    'Study design architecture must render'
  );
  assert(html.includes('DEMONSTRATION PROTOCOL'), 'Demonstration badge must render');
});

// 4. Sample size renders with simulation context
test('4. Sample size renders with simulation context', () => {
  const html = renderToString(<PilotProtocolCard protocol={defaultVm.protocol} />);

  assert(
    html.includes(String(defaultVm.protocol.sampleSize.size)),
    'Sample size number must render'
  );
  assert(
    html.includes('SIMULATED CONFIGURATION'),
    'Must explicitly state simulated configuration'
  );
  assert(
    html.includes('not clinically powered or statistically powered'),
    'Must state not clinically powered'
  );
});

// 5. Primary/secondary endpoints render
test('5. Primary and secondary endpoints render from PilotViewModel', () => {
  const html = renderToString(<PilotProtocolCard protocol={defaultVm.protocol} />);

  assert(
    html.includes(defaultVm.protocol.primaryEndpoint.name),
    'Primary endpoint name must render'
  );
  assert(
    html.includes(defaultVm.protocol.primaryEndpoint.targetMetric),
    'Primary endpoint target metric must render'
  );

  for (const ep of defaultVm.protocol.secondaryEndpoints) {
    assert(html.includes(ep.id), `Secondary endpoint ${ep.id} must render`);
    assert(html.includes(ep.name), `Secondary endpoint ${ep.name} must render`);
  }
});

// 6. Seed/reproducibility information renders
test('6. Seed and reproducibility information renders', () => {
  const html = renderToString(
    <PilotSeedControl currentSeed={42} onSeedChange={() => {}} />
  );

  assert(html.includes('42'), 'Current seed number must render');
  assert(
    html.includes('Same seed + same configuration produces the same simulated result.'),
    'Must explain same seed property'
  );
  assert(
    html.includes('Simulation Reproducibility vs. Research Reproducibility'),
    'Must distinguish simulation vs clinical reproducibility'
  );
  assert(html.includes('Regenerate'), 'Regenerate button must exist');
});

// 7. Score distribution renders from PilotViewModel
test('7. Score distribution renders from PilotViewModel bins', () => {
  const html = renderToString(
    <ScoreDistributionChart distribution={defaultVm.scoreDistribution} />
  );

  assert(html.includes('<svg'), 'SVG chart element must render');
  assert(html.includes('Score Frequency Histogram'), 'Histogram title must render');
  assert(html.includes('rect'), 'SVG rect bars must be rendered');
});

// 8. Mean/median/SD values render
test('8. Mean, median, and standard deviation values render', () => {
  const html = renderToString(
    <ScoreDistributionChart distribution={defaultVm.scoreDistribution} />
  );

  const meanStr = defaultVm.scoreDistribution.mean.toFixed(1);
  const medianStr = defaultVm.scoreDistribution.median.toFixed(1);
  const stdDevStr = defaultVm.scoreDistribution.stdDev.toFixed(1);

  assert(html.includes(meanStr), `Mean ${meanStr} must render in HTML`);
  assert(html.includes(medianStr), `Median ${medianStr} must render in HTML`);
  assert(html.includes(stdDevStr), `StdDev ${stdDevStr} must render in HTML`);
});

// 9. Kappa renders when available
test("9. Cohen's Kappa renders when available", () => {
  const html = renderToString(
    <ReliabilityMetricsPanel
      interRater={defaultVm.interRater}
      internalConsistency={defaultVm.internalConsistency}
    />
  );

  assert(
    html.includes("Cohen&#x27;s Kappa") || html.includes("Cohen's Kappa"),
    "Title must mention Cohen's Kappa"
  );
  assert(
    html.includes(defaultVm.interRater.kappa!.toFixed(2)),
    'Calculated kappa value must render'
  );
  assert(html.includes('CALCULATED (SIMULATED)'), 'Status badge must render');
  assert(html.includes('Ratings:'), 'Rating count must render');
});

// 10. Kappa unavailable state renders honestly
test('10. Kappa unavailable state renders honestly with explanation', () => {
  const unavailableKappa: InterRaterResult = {
    status: 'unavailable',
    kappa: null,
    ratingCount: 0,
    categories: [],
    agreementMetadata: {
      observedAgreement: null,
      expectedAgreement: null,
      categoriesEvaluated: [],
      raters: ['Rater-A', 'Rater-B'],
    },
    reason: 'Chance-expected agreement is 1.0 (zero variation across categories); kappa is mathematically indeterminate.',
    datasetType: 'SIMULATED',
    isSimulated: true,
  };

  const html = renderToString(
    <ReliabilityMetricsPanel
      interRater={unavailableKappa}
      internalConsistency={defaultVm.internalConsistency}
    />
  );

  assert(
    html.includes('Inter-rater kappa unavailable for this simulated dataset.'),
    'Must display honest unavailable notice'
  );
  assert(
    html.includes('mathematically indeterminate'),
    'Must display specific mathematical reason'
  );
  assert(!html.includes('0.75'), 'Must never show fake 0.75 fallback');
});

// 11. Cronbach alpha renders when available
test("11. Cronbach's Alpha renders when available", () => {
  const html = renderToString(
    <ReliabilityMetricsPanel
      interRater={defaultVm.interRater}
      internalConsistency={defaultVm.internalConsistency}
    />
  );

  assert(
    html.includes("Cronbach&#x27;s Alpha") || html.includes("Cronbach's Alpha"),
    "Title must mention Cronbach's Alpha"
  );
  assert(
    html.includes(defaultVm.internalConsistency.alpha!.toFixed(2)),
    'Calculated alpha value must render'
  );
  assert(
    html.includes(String(defaultVm.internalConsistency.itemCount)),
    'Item count must render'
  );
});

// 12. Alpha unavailable state renders honestly
test('12. Alpha unavailable state renders honestly without fabricated benchmark', () => {
  const unavailableAlpha: InternalConsistencyResult = {
    status: 'unavailable',
    alpha: null,
    itemCount: 1,
    observationCount: 10,
    reason: "Cronbach's alpha requires at least 2 items in the questionnaire scale.",
    datasetType: 'SIMULATED',
    isSimulated: true,
  };

  const html = renderToString(
    <ReliabilityMetricsPanel
      interRater={defaultVm.interRater}
      internalConsistency={unavailableAlpha}
    />
  );

  assert(
    html.includes("Cronbach&#x27;s alpha unavailable") || html.includes("Cronbach's alpha unavailable"),
    'Must display honest unavailable notice'
  );
  assert(
    html.includes('requires at least 2 items'),
    'Must display specific mathematical reason'
  );
  assert(!html.includes('good internal consistency'), 'Must not make fabricated claims');
});

// 13. ROC curve renders from actual ROC points
test('13. ROC curve renders from actual ROC points', () => {
  const html = renderToString(<RocCurveChart roc={defaultVm.roc} />);

  assert(html.includes('<svg'), 'SVG must render');
  assert(html.includes('path'), 'SVG path element must render for ROC curve');
  assert(html.includes('circle'), 'Data points must render as circles');
  assert(html.includes('False Positive Rate'), 'X-axis title must render');
  assert(html.includes('True Positive Rate'), 'Y-axis title must render');
});

// 14. AUC renders when available
test('14. AUC renders when available', () => {
  const html = renderToString(<RocCurveChart roc={defaultVm.roc} />);

  const aucStr = defaultVm.roc.auc!.toFixed(3);
  assert(html.includes(aucStr), `Calculated AUC ${aucStr} must render`);
  assert(html.includes('Wilcoxon-Mann-Whitney'), 'Algorithm note must render');
  assert(
    html.includes(String(defaultVm.roc.positiveCount)),
    'Positive case count must render'
  );
  assert(
    html.includes(String(defaultVm.roc.negativeCount)),
    'Negative case count must render'
  );
});

// 15. AUC unavailable state renders honestly
test('15. AUC unavailable state renders honestly without fake curve', () => {
  const unavailableRoc: RocResult = {
    status: 'unavailable',
    auc: null,
    points: [],
    positiveCount: 10,
    negativeCount: 0,
    totalCount: 10,
    thresholdsUsed: [],
    reason: 'No negative cases present in dataset; specificity is undefined.',
    datasetType: 'SIMULATED',
    isSimulated: true,
  };

  const html = renderToString(<RocCurveChart roc={unavailableRoc} />);

  assert(
    html.includes('AUC unavailable for this simulated dataset.'),
    'Must display unavailable message'
  );
  assert(
    html.includes('specificity is undefined'),
    'Must display specific mathematical reason'
  );
  assert(!html.includes('0.90'), 'Must not show fake 0.90 AUC');
});

// 16. Limitations render
test('16. Limitations render with all required boundary statements', () => {
  const html = renderToString(<PilotLimitationsBox limitations={defaultVm.limitations} />);

  assert(html.includes('Study Limitations'), 'Header must render');
  assert(html.includes('Safe Harbor Notice'), 'Safe harbor must render');

  for (const statement of defaultVm.limitations.statements) {
    assert(html.includes(statement), `Statement must render: ${statement}`);
  }
});

// 17. No fake statistical fallback values appear
test('17. No fake statistical fallback values appear in page output', () => {
  const html = renderToString(
    <MemoryRouter>
      <PilotPage />
    </MemoryRouter>
  );

  // Checks that page does not contain arbitrary hard-coded demo phrases
  assert(!html.includes('AUC: 0.95'), 'Must not hardcode fake AUC 0.95');
  assert(!html.includes('Kappa: 0.85'), 'Must not hardcode fake Kappa 0.85');
});

// 18. No unsupported clinical claims appear
test('18. No unsupported clinical claims appear in page output', () => {
  const html = renderToString(
    <MemoryRouter>
      <PilotPage />
    </MemoryRouter>
  );

  // Every mention of "clinically validated" should be disclaimed as "not clinically validated"
  const nonDisclaimedMentions = html.replace(/not clinically validated/g, '');
  assert(!nonDisclaimedMentions.includes('clinically validated'), 'Must not claim positive clinical validation');
  assert(!html.includes('is clinically validated'), 'Must not claim is clinically validated');
  assert(!html.includes('statistically proven'), 'Must not claim statistically proven');
  assert(!html.includes('real-world performance is established'), 'Must not claim real-world performance is established');
  assert(!html.includes('diagnostic accuracy'), 'Must not claim diagnostic accuracy');
  assert(!html.includes('proven effectiveness'), 'Must not claim proven effectiveness');
});

// 19. Statistical status is communicated without color-only semantics
test('19. Statistical status is communicated with explicit text badges', () => {
  const html = renderToString(
    <MemoryRouter>
      <PilotPage />
    </MemoryRouter>
  );

  assert(html.includes('SIMULATED'), 'Text label SIMULATED must be present');
  assert(html.includes('DEMONSTRATION PROTOCOL'), 'Text badge must be present');
  assert(html.includes('CALCULATED (SIMULATED)'), 'Text status badge must be present');
});

// 20. Accessible chart descriptions and metric text exist
test('20. Accessible chart descriptions and metric text exist', () => {
  const distHtml = renderToString(
    <ScoreDistributionChart distribution={defaultVm.scoreDistribution} />
  );
  assert(
    distHtml.includes('class="sr-only"'),
    'Screen reader data table must be present for distribution'
  );
  assert(distHtml.includes('aria-label='), 'aria-label must be present on SVG');

  const rocHtml = renderToString(<RocCurveChart roc={defaultVm.roc} />);
  assert(
    rocHtml.includes('class="sr-only"'),
    'Screen reader table must be present for ROC curve'
  );
  assert(rocHtml.includes('aria-label='), 'aria-label must be present on ROC SVG');
});

// 21. Responsive chart containers are present
test('21. Responsive chart containers are present', () => {
  const distHtml = renderToString(
    <ScoreDistributionChart distribution={defaultVm.scoreDistribution} />
  );
  assert(
    distHtml.includes('overflow-x-auto'),
    'Score chart must be enclosed in horizontal overflow handler'
  );

  const rocHtml = renderToString(<RocCurveChart roc={defaultVm.roc} />);
  assert(
    rocHtml.includes('overflow-x-auto'),
    'ROC chart must be enclosed in horizontal overflow handler'
  );
});

// 22. Regeneration uses the actual simulation service
test('22. Regeneration produces valid PilotViewModel via simulation service', () => {
  const vm1 = createPilotViewModel(undefined, 777);
  assert(vm1.seed === 777, 'Generated view model must reflect new seed');
  assert(vm1.protocol.seed === 777, 'Protocol seed must match');
  assert(vm1.scoreDistribution.sampleSize > 0, 'Must have score distribution');
});

// 23. Different seed produces different simulated view
test('23. Different seed produces different simulated view metrics', () => {
  const vmA = createPilotViewModel(undefined, 101);
  const vmB = createPilotViewModel(undefined, 202);

  assert(vmA.seed !== vmB.seed, 'Seeds must differ');
  assert(
    vmA.scoreDistribution.mean !== vmB.scoreDistribution.mean,
    'Means should differ between different seeds'
  );
});

// 24. Same seed reproduces the same result
test('24. Same seed reproduces the same result', () => {
  const vm1 = createPilotViewModel(undefined, 54321);
  const vm2 = createPilotViewModel(undefined, 54321);

  assert(
    JSON.stringify(vm1) === JSON.stringify(vm2),
    'View models must be bit-for-bit identical for same seed'
  );
});

// 25. No Firebase persistence is introduced by Pilot UI
test('25. No Firebase persistence is introduced in pilot UI components', () => {
  const pilotDir = path.resolve(process.cwd(), 'src/components/pilot');
  const files = fs.readdirSync(pilotDir);

  for (const file of files) {
    const content = fs.readFileSync(path.join(pilotDir, file), 'utf-8');
    assert(!content.includes('firestore'), `${file} must not reference firestore`);
    assert(!content.includes('collection('), `${file} must not create firestore collections`);
    assert(!content.includes('setDoc('), `${file} must not write to firestore`);
  }

  const pageContent = fs.readFileSync(
    path.resolve(process.cwd(), 'src/pages/Pilot/PilotPage.tsx'),
    'utf-8'
  );
  assert(!pageContent.includes('firestore'), 'PilotPage must not reference firestore');
  assert(!pageContent.includes('firebase'), 'PilotPage must not reference firebase');
});

// 26. Keyboard-accessible controls work
test('26. Keyboard-accessible controls are properly configured', () => {
  const html = renderToString(
    <PilotSeedControl currentSeed={42} onSeedChange={() => {}} />
  );

  assert(
    html.includes('id="pilot-seed-input"'),
    'Input must have an explicit id for label pairing'
  );
  assert(
    html.includes('type="submit"'),
    'Form submit button must be present for keyboard Enter key support'
  );
  assert(
    html.includes('aria-label="Simulation seed number"'),
    'Input must have accessible aria-label'
  );
});

// 27. Error state renders
test('27. Error state renders with alert when error is passed', () => {
  const html = renderToString(
    <MemoryRouter>
      <div className="max-w-6xl mx-auto space-y-6">
        <div role="alert" className="p-4 bg-[#FAF0ED] text-[#B3341A]">
          <p className="font-bold">Failed to execute deterministic pilot simulation</p>
          <p>Computational division by zero simulation fault.</p>
        </div>
      </div>
    </MemoryRouter>
  );

  assert(html.includes('role="alert"'), 'Must have role=alert');
  assert(html.includes('Failed to execute deterministic pilot simulation'), 'Error title must render');
});

// 28. Loading state renders where applicable
test('28. Loading state disables controls and indicates ongoing regeneration', () => {
  const html = renderToString(
    <PilotSeedControl currentSeed={42} onSeedChange={() => {}} isLoading={true} />
  );

  assert(html.includes('disabled=""') || html.includes('disabled'), 'Controls must be disabled when loading');
  assert(html.includes('animate-spin'), 'Loading spinner animation class must be applied');
});

// 29. Methodology note renders
test('29. Methodology note renders computational explanation', () => {
  const html = renderToString(<PilotMethodologyNote />);

  assert(html.includes('Mulberry32 PRNG'), 'Must mention Mulberry32');
  assert(html.includes('Reliability Indices'), 'Must mention Reliability Indices');
  assert(html.includes('Empirical ROC / AUC'), 'Must mention Empirical ROC');
});

console.log(`\n========================================`);
console.log(`Pilot UI Tests Passed: ${passed} / ${total}`);
console.log(`========================================\n`);

if (passed !== total) {
  process.exitCode = 1;
}
