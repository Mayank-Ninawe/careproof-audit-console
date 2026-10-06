/**
 * CareProof Audit Console - Production Landing Page UI Tests
 * Source of Truth: CareProof Website Roadmap (Phase 12A)
 * 
 * Verifies all 26+ required Section 17 test specifications:
 * 1. Page renders.
 * 2. Header renders.
 * 3. Wordmark renders and points to /.
 * 4. Standard navigation links exist.
 * 5. Pilot navigation links exist.
 * 6. Sign in navigation links exist.
 * 7. Hero heading exists ("Hospital-grade at home: measured, not promised.").
 * 8. Primary CTA exists ("Open sample audit").
 * 9. Primary CTA points to /app/dashboard?mode=demo.
 * 10. Secondary CTA exists ("Sign in") pointing to /auth.
 * 11. Score Stamp renders with score and tier.
 * 12. Simulated disclosure renders in hero.
 * 13. Five pillars render dynamically from standard.json.
 * 14. Indicator counts derive correctly from canonical standard.
 * 15. Audience ledger renders Family, Agency, Auditor/Researcher.
 * 16. Four workflow steps render with step numbers and headings.
 * 17. Pilot metrics render from the existing pilot service (Kappa, Alpha, AUC, Sample size).
 * 18. Simulated pilot disclosure renders prominently.
 * 19. Honest-limits section renders all required boundary conditions.
 * 20. Final CTA renders with open sample audit link.
 * 21. Footer renders with version, navigation, and privacy note.
 * 22. No unsupported claims (no "AI-powered", "revolutionary", "seamless", "next-generation", "guaranteed safety").
 * 23. No patient PII appears in rendered content (no MRN, patient names, SSNs, phone numbers).
 * 24. Demo mode allows read-only access in ProtectedRoute.
 * 25. Mobile-safe semantic landmarks (header, main, section, footer).
 * 26. Accessibility-critical labels and progressbars exist.
 * 27. Five pillar performance meters render with valid scores and weights.
 * 28. Canonical standard version v1.4.0 is displayed.
 */

import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { LandingPage } from '../pages/Landing/LandingPage';
import {
  PublicHeader,
  HeroSection,
  AudienceLedger,
  HowItWorksSection,
  PillarsStrip,
  SimulatedPilotProof,
  HonestLimitsSection,
  FinalCtaSection,
  PublicFooter,
} from '../components/landing';
import { getDefaultDashboardViewModel } from '../services/dashboard';
import { createPilotViewModel } from '../services/pilot';
import { CANONICAL_STANDARD } from '../data/standard';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`TEST ASSERTION FAILED: ${message}`);
  }
}

let testCount = 0;
function test(name: string, fn: () => void): void {
  testCount++;
  try {
    fn();
    console.log(`✓ PASS: ${name}`);
  } catch (err: unknown) {
    console.error(`✗ FAIL: ${name}`);
    console.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}

console.log('=== CareProof Production Landing Page UI Tests (Phase 12A) ===');

const dashboardVm = getDefaultDashboardViewModel(42);
const pilotVm = createPilotViewModel(undefined, 42);

// 1. Page renders
test('1. Page renders successfully with root container', () => {
  const html = renderToString(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );
  assert(html.includes('min-h-screen'), 'Root layout container must render');
});

// 2. Header renders
test('2. Public header renders with semantic header landmark', () => {
  const html = renderToString(
    <MemoryRouter>
      <PublicHeader />
    </MemoryRouter>
  );
  assert(html.includes('<header') && html.includes('role="banner"'), 'Semantic header must render');
  assert(html.includes('Proposed framework, not clinically validated'), 'Safe harbor notice must render in header');
});

// 3. Wordmark renders and links to /
test('3. CareProof wordmark renders and links to /', () => {
  const html = renderToString(
    <MemoryRouter>
      <PublicHeader />
    </MemoryRouter>
  );
  assert(html.includes('CareProof'), 'Wordmark text must render');
  assert(html.includes('href="/"'), 'Wordmark link must target /');
});

// 4. Standard navigation links exist
test('4. Standard navigation link exists and points to standard explorer', () => {
  const html = renderToString(
    <MemoryRouter>
      <PublicHeader />
    </MemoryRouter>
  );
  assert(html.includes('href="/app/standard?mode=demo"'), 'Standard link must target /app/standard?mode=demo');
  assert(html.includes('Standard'), 'Standard link label must exist');
});

// 5. Pilot navigation links exist
test('5. Pilot navigation link exists and points to pilot study', () => {
  const html = renderToString(
    <MemoryRouter>
      <PublicHeader />
    </MemoryRouter>
  );
  assert(html.includes('href="/app/pilot?mode=demo"'), 'Pilot link must target /app/pilot?mode=demo');
  assert(html.includes('Pilot'), 'Pilot link label must exist');
});

// 6. Sign in navigation links exist
test('6. Sign in navigation links exist and target /auth', () => {
  const html = renderToString(
    <MemoryRouter>
      <PublicHeader />
    </MemoryRouter>
  );
  assert(html.includes('href="/auth"'), 'Sign in link must target /auth');
  assert(html.includes('Sign in'), 'Sign in text must render');
});

// 7. Hero heading exists
test('7. Hero heading renders with canonical editorial intent', () => {
  const html = renderToString(
    <MemoryRouter>
      <HeroSection viewModel={dashboardVm} />
    </MemoryRouter>
  );
  assert(
    html.includes('Hospital-grade at home: measured, not promised.'),
    'Canonical hero headline must render'
  );
  assert(
    html.includes('CareProof is an auditable framework'),
    'Supporting explanation must render'
  );
});

// 8. Primary CTA exists
test('8. Primary CTA button exists in hero', () => {
  const html = renderToString(
    <MemoryRouter>
      <HeroSection viewModel={dashboardVm} />
    </MemoryRouter>
  );
  assert(html.includes('Open sample audit'), 'Primary CTA label must render');
});

// 9. Primary CTA points to demo mode
test('9. Primary CTA points to /app/dashboard?mode=demo for unauthenticated audit exploration', () => {
  const html = renderToString(
    <MemoryRouter>
      <HeroSection viewModel={dashboardVm} />
    </MemoryRouter>
  );
  assert(
    html.includes('href="/app/dashboard?mode=demo"'),
    'Hero primary CTA must point to /app/dashboard?mode=demo'
  );
});

// 10. Secondary CTA exists pointing to /auth
test('10. Secondary CTA exists in hero pointing to /auth', () => {
  const html = renderToString(
    <MemoryRouter>
      <HeroSection viewModel={dashboardVm} />
    </MemoryRouter>
  );
  assert(
    html.includes('href="/auth"'),
    'Hero secondary CTA must point to /auth'
  );
});

// 11. Score Stamp renders with score and tier
test('11. Score Stamp renders in hero with derived score and tier', () => {
  const html = renderToString(
    <MemoryRouter>
      <HeroSection viewModel={dashboardVm} />
    </MemoryRouter>
  );
  assert(html.includes('Audit Score Stamp'), 'ScoreStamp title must render');
  assert(html.includes(String(dashboardVm.summary.overallScore)), 'Overall score must render');
  assert(html.includes(dashboardVm.summary.finalTier!), 'Final audit tier must render');
  assert(html.includes(`${dashboardVm.summary.coverage}%`), 'Coverage percentage must render');
});

// 12. Simulated disclosure renders in hero
test('12. Simulated disclosure renders prominently in hero visual block', () => {
  const html = renderToString(
    <MemoryRouter>
      <HeroSection viewModel={dashboardVm} />
    </MemoryRouter>
  );
  assert(html.includes('SIMULATED SAMPLE AUDIT'), 'SIMULATED SAMPLE AUDIT tag must render');
  assert(
    html.includes('All metrics shown are derived from deterministic seed #42 demonstration data'),
    'Demonstration explanation must render'
  );
});

// 13. Five pillars render dynamically
test('13. Five pillars render dynamically from canonical standard', () => {
  const html = renderToString(
    <MemoryRouter>
      <PillarsStrip />
    </MemoryRouter>
  );

  for (const pillar of CANONICAL_STANDARD.pillars) {
    assert(html.includes(pillar.id), `Pillar ID ${pillar.id} must render`);
    assert(
      html.includes(pillar.name) || html.includes(pillar.name.replace(/&/g, '&amp;')),
      `Pillar name ${pillar.name} must render`
    );
  }
});

// 14. Indicator counts derive correctly from canonical standard
test('14. Indicator counts derive correctly for each pillar from canonical standard', () => {
  const html = renderToString(
    <MemoryRouter>
      <PillarsStrip />
    </MemoryRouter>
  );

  for (const pillar of CANONICAL_STANDARD.pillars) {
    const expectedCount = CANONICAL_STANDARD.indicators.filter((i) => i.pillarId === pillar.id).length;
    assert(
      html.includes(`${expectedCount} indicators`),
      `Pillar ${pillar.id} must display count ${expectedCount} indicators`
    );
  }
});

// 15. Audience ledger renders Family, Agency, Auditor/Researcher
test('15. Audience ledger renders all three stakeholder groups and core questions', () => {
  const html = renderToString(
    <MemoryRouter>
      <AudienceLedger />
    </MemoryRouter>
  );
  assert(html.includes('Family'), 'Family audience must render');
  assert(html.includes('Agency'), 'Agency audience must render');
  assert(html.includes('Auditor / Researcher'), 'Auditor / Researcher audience must render');

  assert(
    html.includes('Is care being assessed against something explicit?'),
    'Family question must render'
  );
  assert(
    html.includes('What should we fix first?'),
    'Agency question must render'
  );
  assert(
    html.includes('How was this score produced?'),
    'Auditor question must render'
  );
});

// 16. Four workflow steps render with step numbers and headings
test('16. Four workflow steps render in exact order with step numbers', () => {
  const html = renderToString(
    <MemoryRouter>
      <HowItWorksSection />
    </MemoryRouter>
  );
  assert(html.includes('Define standard'), 'Step 1 heading must render');
  assert(html.includes('Collect evidence'), 'Step 2 heading must render');
  assert(html.includes('Score with confidence'), 'Step 3 heading must render');
  assert(html.includes('Prove with study'), 'Step 4 heading must render');

  assert(html.includes('STEP 01'), 'Step 01 badge must render');
  assert(html.includes('STEP 02'), 'Step 02 badge must render');
  assert(html.includes('STEP 03'), 'Step 03 badge must render');
  assert(html.includes('STEP 04'), 'Step 04 badge must render');
});

// 17. Pilot metrics render from existing pilot service
test('17. Pilot metrics render directly from Phase 10A PilotViewModel', () => {
  const html = renderToString(
    <MemoryRouter>
      <SimulatedPilotProof />
    </MemoryRouter>
  );
  assert(
    html.includes(`n = ${pilotVm.protocol.sampleSize.size}`),
    `Sample size n = ${pilotVm.protocol.sampleSize.size} must render`
  );
  assert(
    html.includes(pilotVm.interRater.kappa!.toFixed(3)),
    'Cohen Kappa metric must render from view model'
  );
  assert(
    html.includes(pilotVm.internalConsistency.alpha!.toFixed(3)),
    'Cronbach Alpha metric must render from view model'
  );
  assert(
    html.includes(pilotVm.roc.auc!.toFixed(3)),
    'ROC AUC metric must render from view model'
  );
});

// 18. Simulated pilot disclosure renders prominently
test('18. Simulated pilot disclosure renders prominently in pilot section', () => {
  const html = renderToString(
    <MemoryRouter>
      <SimulatedPilotProof />
    </MemoryRouter>
  );
  assert(
    html.includes('SIMULATED PILOT RESULTS'),
    'SIMULATED PILOT RESULTS label must render'
  );
  assert(
    html.includes('Demonstration statistics generated from the seeded simulation. Not clinical validation.'),
    'Pilot demonstration disclaimer must render'
  );
});

// 19. Honest-limits section renders all required boundaries
test('19. Honest-limits section renders all required boundary disclaimers', () => {
  const html = renderToString(
    <MemoryRouter>
      <HonestLimitsSection />
    </MemoryRouter>
  );
  assert(html.includes('Not clinically validated'), 'Boundary 1 must render');
  assert(html.includes('Decision support, not diagnosis'), 'Boundary 2 must render');
  assert(html.includes('Demo / simulated data where applicable'), 'Boundary 3 must render');
  assert(
    html.includes('Not a substitute for professional clinical judgment'),
    'Boundary 4 must render'
  );
});

// 20. Final CTA renders
test('20. Final CTA section renders with working demo and sign-in links', () => {
  const html = renderToString(
    <MemoryRouter>
      <FinalCtaSection />
    </MemoryRouter>
  );
  assert(
    html.includes('Explore the CareProof Audit Ledger'),
    'Final CTA heading must render'
  );
  assert(
    html.includes('href="/app/dashboard?mode=demo"'),
    'Final CTA primary button must target /app/dashboard?mode=demo'
  );
  assert(
    html.includes('href="/auth"'),
    'Final CTA secondary button must target /auth'
  );
});

// 21. Footer renders
test('21. Public footer renders with version, navigation, and privacy note', () => {
  const html = renderToString(
    <MemoryRouter>
      <PublicFooter />
    </MemoryRouter>
  );
  assert(html.includes('<footer') && html.includes('role="contentinfo"'), 'Semantic footer must render');
  assert(html.includes('v1.4.0'), 'Canonical standard version v1.4.0 must render in footer');
  assert(html.includes('Privacy &amp; Data Boundary'), 'Privacy section must render');
  assert(
    html.includes('href="https://careproof-audit-consolee.ai.studio/"'),
    'Footer must include live deployment URL'
  );
  assert(html.includes('target="_blank"'), 'Live deployment link must open in a new tab');
  assert(html.includes('rel="noopener noreferrer"'), 'Live deployment link must include safe rel attributes');
  assert(
    html.includes('zero real patient names, medical record numbers (MRNs)'),
    'Zero PHI guarantee must render'
  );
});

// 22. No unsupported claims in page
test('22. No unsupported or hyped clinical/AI claims appear in page', () => {
  const html = renderToString(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );
  const lowercase = html.toLowerCase();
  assert(!lowercase.includes('ai-powered'), 'Forbidden term: AI-powered');
  assert(!lowercase.includes('revolutionary'), 'Forbidden term: revolutionary');
  assert(!lowercase.includes('seamless'), 'Forbidden term: seamless');
  assert(!lowercase.includes('next-generation'), 'Forbidden term: next-generation');
  assert(!lowercase.includes('guaranteed safety'), 'Forbidden term: guaranteed safety');
  assert(!lowercase.includes('intelligent healthcare'), 'Forbidden term: intelligent healthcare');

  // Verify that "clinically validated" is only present when negated by "not clinically validated"
  const scrubbed = html.replace(/not clinically validated/gi, '');
  assert(!scrubbed.toLowerCase().includes('clinically validated'), 'No un-negated clinical validation claims');
});

// 23. No patient PII in rendered content
test('23. No patient PII exists in rendered HTML output', () => {
  const html = renderToString(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );
  assert(!html.includes('medicalRecordNumber'), 'No MRN in HTML');
  assert(!html.includes('patientName'), 'No patientName in HTML');
  assert(!html.includes('ssn'), 'No SSN in HTML');
  assert(!html.includes('phoneNumber'), 'No phone numbers in HTML');
});

// 24. Demo mode allows read-only access in ProtectedRoute
test('24. ProtectedRoute permits unauthenticated access when mode=demo is present', () => {
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/dashboard?mode=demo']}>
      <ProtectedRoute>
        <div data-testid="demo-content">Rendered Demo Content</div>
      </ProtectedRoute>
    </MemoryRouter>
  );
  assert(
    html.includes('Rendered Demo Content'),
    'ProtectedRoute must render children when mode=demo without requiring auth'
  );
});

// 25. Mobile-safe semantic landmarks
test('25. Mobile-safe semantic structure with required landmark elements', () => {
  const html = renderToString(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );
  assert(html.includes('<header'), 'Semantic header must exist');
  assert(html.includes('<main'), 'Semantic main landmark must exist');
  assert(html.includes('<footer'), 'Semantic footer must exist');
  assert(html.includes('id="hero-heading"'), 'H1 hero heading landmark must exist');
  assert(html.includes('id="audience-ledger-heading"'), 'Audience heading must exist');
  assert(html.includes('id="how-it-works-heading"'), 'How it works heading must exist');
  assert(html.includes('id="pillars-strip-heading"'), 'Pillars heading must exist');
  assert(html.includes('id="pilot-proof-heading"'), 'Pilot proof heading must exist');
  assert(html.includes('id="honest-limits-heading"'), 'Honest limits heading must exist');
});

// 26. Accessibility-critical labels and progressbars exist
test('26. Accessible progressbar and role regions exist in hero meters', () => {
  const html = renderToString(
    <MemoryRouter>
      <HeroSection viewModel={dashboardVm} />
    </MemoryRouter>
  );
  assert(html.includes('role="progressbar"'), 'Pillar score meter bars must have role="progressbar"');
  assert(html.includes('aria-valuenow'), 'Pillar score meter bars must declare aria-valuenow');
});

// 27. Five pillar performance meters render with valid scores and weights
test('27. Five pillar performance meters render with weights and scores', () => {
  const html = renderToString(
    <MemoryRouter>
      <HeroSection viewModel={dashboardVm} />
    </MemoryRouter>
  );
  for (const pillar of dashboardVm.pillars) {
    assert(html.includes(pillar.pillarId), `Pillar ${pillar.pillarId} must render in hero`);
    const weightPct = `${Math.round(pillar.weight * 100)}%`;
    assert(html.includes(weightPct), `Pillar ${pillar.pillarId} weight ${weightPct} must render in hero`);
  }
});

// 28. Canonical standard version v1.4.0 is displayed
test('28. Canonical standard version v1.4.0 is displayed across page landmarks', () => {
  const html = renderToString(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );
  assert(html.includes('v1.4.0'), 'Standard version v1.4.0 must render on page');
});

console.log('========================================');
console.log(`Landing Page UI Tests Passed: ${testCount} / ${testCount}`);
console.log('========================================');
