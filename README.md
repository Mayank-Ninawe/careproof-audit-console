# CareProof Audit Console

CareProof Audit Console is an audit-oriented web application for structured home-care quality assessment, evidence visibility, deterministic scoring, confidence-aware telemetry monitoring, in silico pilot simulation, and incident root-cause analysis.

The system is designed as a digital audit file: replacing informal or subjective quality claims with explicit numerical compliance thresholds, a five-pillar evaluation structure, binary safety gates, and reproducible evidence ledgers.

---

## Overview

Modern home health care relies on complex, distributed workflows across caregivers, families, and clinical agencies. Traditional quality assurance often depends on post-hoc self-reporting or high-level surveys without auditable records.

CareProof models home-care evaluation on the rigor of a clinical audit report. The application unifies:

* **Standards**: Explicit numerical compliance criteria defined in a canonical JSON specification.
* **Indicators**: Granular observation items categorized by evidence tier.
* **Evidence**: Classification of metrics as Established guidelines, Derived interpretations, or Proposed demonstration items.
* **Scores**: Pure, deterministic calculations that aggregate weighted pillars and verify minimum audit coverage.
* **Confidence**: Observation telemetry where data freshness and completeness govern confidence intervals.
* **Limitations**: Explicit, prominent boundaries stating that CareProof provides decision support rather than clinical diagnosis.

---

## Core Capabilities

### Dashboard
* **Overall Score & Tier**: Displays the aggregate audit score (0–100) and assigns an audit standing (Tier 1 Exemplary down to Tier 4 Non-Compliant).
* **Pillar Performance Ledger**: Ruled ledger table breaking down each of the five pillars by weight, numerical score, assessed indicators, and open deficiencies.
* **Coverage Threshold**: Monitors audit completeness (minimum 80% required for standard tier standing).
* **Safety Gate**: Binary safety mechanism that immediately trips upon failure of critical indicators (e.g., vital telemetry lapse or emergency escalation breakdown), capping the maximum achievable audit tier regardless of a high numerical composite.
* **Fix First Ledger**: Actionable remediation table sorting deficiencies deterministically by `Weight × Compliance Gap` to direct operational focus to high-impact gaps.
* **Recent Events**: Chronological feed of simulated audit logs, assessments, and safety state transitions.

### Standard Explorer
* **Canonical Standard v1.4.0**: Interactive browser for the complete CareProof Standard specification.
* **Indicator Specifications**: Detailed view of all indicators with unique alphanumeric identifiers, target thresholds, baseline scores, and weights.
* **Evidence Classification Tags**: Indicators tagged as `[E]` Established Clinical Guidelines, `[I]` Derived Operational Interpretations, or `[P]` Proposed Demonstration Metrics.
* **Search & Filter Toolbar**: Filter indicators by pillar, evidence classification, search text, or critical safety gate flag.
* **Audit Exports**: Client-side export of filtered indicator sets as JSON or CSV files.

### Patient Monitor
* **Observation Timeline**: Telemetry viewer showing irregular observation intervals with broken lines across gaps (never artificially interpolated or smoothed).
* **Confidence Ribbon**: Dynamic ribbon calculating telemetry confidence as a function of data completeness and elapsed observation time.
* **Data-Gap Detection**: Visual alerts indicating when expected monitoring intervals have lapsed.
* **Clinical Boundary**: Prominently displays *"Decision support, not diagnosis."*

### Pilot Study
* **In Silico Simulation**: Deterministic synthetic cohort generation for evaluating measurement reliability and scoring behavior.
* **Reproducible Seed Control**: Configurable random seed (default Seed #42) that deterministically produces identical simulation datasets and metrics across executions.
* **Statistical Reliability**: Computes inter-rater agreement (Cohen's kappa), internal consistency (Cronbach's alpha), score distribution histograms, and ROC/AUC curves.
* **Research Limitations**: Clear disclosure that pilot statistics reflect synthetic demonstration data, not clinical validation.

### Equipment Lifecycle
* **Five-Stage Ledger**: Tracks medical devices through five canonical lifecycle stages: Procure → Validate → Maintain → Monitor → Retire.
* **Asset Register**: Device inventory recording serial numbers, calibration status, maintenance schedules, and operating states.
* **Honest States**: Displays unprovided calibration as *"Not provided"* and missing incident histories as *"Not available"* rather than fabricating data.

### Caregiver Competency
* **Competency Matrix**: Evaluates caregiver operational skills on a 0–4 scale across supported assessment methods (OSCE, Direct Observation, Knowledge Test).
* **Gap Analysis**: Identifies compliance gaps where demonstrated levels fall below configured organizational target thresholds.
* **Dual-Assessor Records**: Displays parallel assessments to evaluate evaluation consistency without unverified statistical inflation.
* **Local Session Drafts**: Assessment evaluations operate as local session drafts without uncommitted persistence claims.

### Incident Response
* **Six-Stage Investigation Workflow**: Standardized workflow covering Intake → Timeline Builder → Canonical Indicator Mapping → Root Cause Analysis (5-Why) → Corrective Action Ledger → Re-Audit Plan.
* **Deterministic Tie-Breaking**: Timeline events ordered chronologically with event ID tie-breakers.
* **Indicator Mapping**: Links incidents strictly to canonical indicators from CareProof Standard v1.4.0.
* **Print-Friendly Audit Dossier**: Dedicated printable dossier layout triggered via `window.print()` with complete workflow records and disclaimers.

### Settings & Data Governance
* **Auditor Profile**: Configures name, organization, and assigned role (`family`, `agency`, `auditor`).
* **Display Preferences**: Select display density (Comfortable vs. Compact) and measurement unit formats (Standard vs. Imperial), persisted locally.
* **Privacy & Demo State Management**: Local demonstration data purge tool and consent log indicator.
* **System Audit Export**: Clean JSON export of the current session state, standards configuration, and derivations with zero credentials or secrets.
* **About & References**: Authoritative version disclosure (v1.4.0) and navigation link to canonical standard references.

### Public Landing Page
* **Public Problem & Scope**: Editorial presentation addressing home-care measurement challenges without marketing hype.
* **Live Score Stamp**: Dynamic preview of audit scoring and pillar performance meters driven by the core scoring engine.
* **Audience Ledger**: Three-column breakdown mapping value propositions specifically for Families, Care Agencies, and Auditors/Researchers.
* **Four-Step Workflow**: Visual breakdown of the audit methodology: Define standard → Collect evidence → Score with confidence → Prove with study.
* **Simulated Pilot Metrics**: High-level statistical summary extracted directly from the pilot simulation model.
* **Honest Limitations**: Explicit statement of four boundaries: Not Clinically Validated, Decision Support Only, Synthetic Test Data, and Workflow Completeness Only.

---

## Routes

| Route | Access | Description |
| :--- | :--- | :--- |
| `/` | Public | Public landing page with problem overview, Score Stamp, and workflow summary |
| `/auth` | Public | Email and password authentication page for Auditor workspace access |
| `/app/dashboard` | Protected | Primary audit ledger, composite score, Safety Gate, and Fix First priority table |
| `/app/dashboard?mode=demo` | Public / Demo | Read-only sample audit entry point (bypasses auth for evaluation and demonstration) |
| `/app/standard` | Protected / Demo | Interactive canonical standard explorer, indicator ledger, and JSON/CSV export |
| `/app/monitor` | Protected / Demo | Patient telemetry monitor, observation gaps, and confidence ribbon |
| `/app/pilot` | Protected / Demo | In silico pilot study with reproducible seed, score distributions, and reliability metrics |
| `/app/equipment` | Protected / Demo | Five-stage equipment lifecycle register and maintenance status tracking |
| `/app/caregivers` | Protected / Demo | Caregiver competency evaluation matrix and skills gap reporting |
| `/app/incident` | Protected / Demo | Six-stage incident root-cause analysis, timeline builder, and printable dossier |
| `/app/settings` | Protected / Demo | Auditor profile, layout preferences, privacy purge, and JSON audit export |

> **Note on Demo Mode**: The `?mode=demo` query parameter is specifically designed for reviewers and judges. It allows exploration of the full application in a read-only state without requiring authentication credentials. It does not represent production user access.

---

## Design System

The CareProof user interface is built on the **Audit Ledger** visual system, inspired by physical clinical audit reports, legal dockets, and ledger books:

* **Warm Paper Surface**: Warm tinted neutral background (`#FAF8F3`) avoiding stark clinical white or dark modes.
* **Dense Readable Rows**: Ruled layouts and compact data rows designed for high information density.
* **Hairline Rules**: Subtle, restrained border dividers (`#D9D3C5`) defining clear visual hierarchy.
* **Near-Square Corners**: Restrained `rounded-[2px]` borders reinforcing architectural permanence.
* **Tabular Numerals**: Standardized numeric alignments using `tabular-nums` and monospace ledger fonts.
* **Restrained Clinical Palette**: Primary deep navy ink (`#14213D`), muted slate (`#5B6475`), clinical teal accent (`#0F6B6E`), forest green ok (`#2F6B3F`), amber warning (`#B7791F`), and rust failure (`#B3341A`).
* **Editorial Typography**: Self-hosted Fraunces serif for headings, IBM Plex Sans for body copy, and IBM Plex Mono for IDs, metrics, and tabular rows.
* **Anti-Hype Discipline**: Strictly avoids floating SaaS cards, gradients, glassmorphism, decorative illustrations, and generic AI sparkles.

---

## Technology Stack

The repository uses the following dependencies:

* **Core Framework**: React 19 (`react` 19.0.1, `react-dom` 19.0.1)
* **Language & Compiler**: TypeScript 7 (`typescript` 7.0.2) with strict type-checking
* **Build Tool**: Vite 8 (`vite` 8.3.0) with `@vitejs/plugin-react`
* **Routing**: React Router 7 (`react-router-dom` 7.18.4)
* **Styling**: Tailwind CSS v4 (`tailwindcss` 4.3.3, `@tailwindcss/vite` 4.3.3)
* **Typography**: Self-hosted Fontsource packages (`@fontsource/fraunces`, `@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-mono`)
* **Icons & Animation**: Lucide React (`lucide-react` 0.546.0), Motion (`motion` 12.23.24)
* **Authentication & Database**: Firebase 12 (`firebase` 12.19.0) with Firestore and Firebase Auth
* **State Management**: Zero-dependency reactive store built with React's native `useSyncExternalStore`
* **Test Runner**: Node.js with TSX (`tsx` 4.21.0) and headless React server rendering (`react-dom/server`)

---

## Architecture

The project maintains separation between canonical specifications, deterministic math engines, service view-models, and presentation components:

```
src/
├── app/                  # Application root and route declarations (App.tsx)
├── components/           # Reusable UI primitives and domain component modules
│   ├── auth/             # ProtectedRoute and authentication cards
│   ├── caregiver/        # Competency matrix, gap reports, assessor form
│   ├── dashboard/        # Pillar ledger, Safety Gate, Fix First table
│   ├── equipment/        # Equipment register, lifecycle stages, drawer
│   ├── incident/         # Stepper, timeline builder, 5-Why, print dossier
│   ├── landing/          # Public header, hero, audience ledger, limits
│   ├── layout/           # AppShell, NavigationItem, responsive rail
│   ├── monitor/          # Observation timeline, confidence ribbon, gap banner
│   ├── pilot/            # Seed control, histograms, reliability panels
│   ├── settings/         # Profile, preferences, privacy, export sections
│   ├── standard/         # Pillar navigation, toolbar, indicator tables
│   └── ui/               # Core primitives: ScoreStamp, Button, Input, Badge
├── data/                 # Canonical data specifications
│   ├── standard.json     # CareProof Standard v1.4.0 single source of truth
│   └── standard.ts       # Typed accessors and validation helpers
├── engine/               # Pure mathematical and simulation engines (no UI dependencies)
│   ├── scoring.ts        # Pure scoring engine, weights, coverage, Safety Gate
│   └── simulate.ts       # Deterministic PRNG and synthetic cohort generator
├── pages/                # Top-level route page components
│   ├── Auth/
│   ├── Caregivers/
│   ├── Dashboard/
│   ├── Equipment/
│   ├── Incident/
│   ├── Landing/
│   ├── Monitor/
│   ├── Pilot/
│   ├── Settings/
│   └── Standard/
├── services/             # ViewModel derivation, domain logic, and exports
│   ├── auth.ts           # Firebase auth wrappers and session storage
│   ├── dashboard.ts      # ViewModel transformers for the dashboard
│   ├── monitor.ts        # Telemetry processing and confidence math
│   ├── pilot.ts          # Statistical reliability algorithms (kappa, alpha, AUC)
│   ├── settings.ts       # Local preference storage and JSON audit export
│   └── standardExplorer.ts# Filtering, sorting, and CSV/JSON export
├── store/                # Reactive application stores
│   └── authStore.ts      # Reactive auth store utilizing useSyncExternalStore
├── styles/               # Design tokens and fontsource stylesheet imports
│   └── tokens.css        # Palette variables and print media styles
├── tests/                # 24 automated unit and UI integration test suites
└── types/                # Domain TypeScript interfaces and enumerations
```

---

## Canonical Standard and Scoring

All scoring rules, weights, and criteria originate from `src/data/standard.json` (CareProof Standard v1.4.0).

### Scoring Behavior
1. **Indicator Scoring**: Individual indicators are evaluated against explicit numerical thresholds, returning a normalized score from 0.0 to 100.0. Indicators without observations are marked as `null` (not assessed) and are never silently converted to zero.
2. **Pillar Aggregation**: The score for each of the five pillars is the average of its assessed indicators:
   * Clinical Governance (Weight: 25%)
   * Medication Administration (Weight: 25%)
   * Equipment Verification (Weight: 15%)
   * Caregiver Competency (Weight: 20%)
   * Protocol Adherence (Weight: 15%)
3. **Composite Aggregation**: The overall audit score is the weighted sum of the assessed pillar scores, scaled by the proportion of total weight assessed.
4. **Audit Coverage Gate**: The engine calculates coverage as `(Assessed Weight / Total Weight) × 100`. A minimum coverage of 80% is required for standard tier standing; audits below 80% are capped as Provisional.
5. **Binary Safety Gate**: A critical indicator failure trips the Safety Gate immediately. Regardless of a high composite score (e.g., 95/100), tripping the Safety Gate caps the audit standing at **Tier 3 (Provisional / Safety Restricted)**.
6. **Tier Definitions**:
   * **Tier 1 (Exemplary)**: Composite score ≥ 90, Coverage ≥ 85%, Safety Gate cleared.
   * **Tier 2 (Standard Compliant)**: Composite score ≥ 75, Coverage ≥ 70%, Safety Gate cleared.
   * **Tier 3 (Provisional / Restricted)**: Composite score ≥ 60 or Safety Gate tripped.
   * **Tier 4 (Non-Compliant)**: Composite score < 60 or major audit failure.

*Note: The CareProof scoring engine is a proposed quality measurement model and is not an accredited regulatory certification.*

---

## Simulation and Reproducibility

To allow rigorous demonstration and auditing without compromising patient privacy, the application includes a deterministic in silico simulation engine (`src/engine/simulate.ts`):

* **Pseudorandom Generation**: Uses a seeded linear congruential generator to produce reproducible observation datasets.
* **Predictable Outcomes**: Supplying the same integer seed (e.g., Seed #42) produces the exact same series of patient vitals, telemetry timestamps, caregiver ratings, and equipment records.
* **Demonstration Purpose**: Synthetic data is used exclusively to validate scoring math, UI responsiveness, and edge-case behaviors (such as Safety Gate triggers). It does not represent real-world clinical findings.

---

## Research Integrity and Safety Boundaries

CareProof incorporates explicit ethical and clinical safeguards across the application:

* **Prominent Labeling**: All synthetic demonstration metrics, tables, and charts are marked with `SIMULATED DATA` or equivalent disclosures.
* **Decision Support Boundary**: Every page and printable report carries the notice: *"Decision support, not diagnosis."* CareProof evaluates process adherence; it does not diagnose medical conditions.
* **Methodological Status**: The framework is explicitly noted as: *"Proposed framework, not clinically validated."*
* **Zero Patient PII**: The repository contains no real patient names, Medical Record Numbers (MRNs), phone numbers, physical addresses, Social Security Numbers (SSNs), or protected health information.
* **No Exaggerated Claims**: The codebase strictly avoids hyperbolic terminology such as *"AI-powered"*, *"revolutionary"*, *"guaranteed safety"*, or *"clinically proven"*.

---

## Authentication and Demo Access

* **Standard Authentication**: Supports email and password sign-in via Firebase Authentication on `/auth`. User accounts can select an organizational role (`family`, `agency`, or `auditor`).
* **Route Protection**: Application routes (`/app/*`) are protected by `ProtectedRoute`. Unauthenticated users attempting to access application pages are redirected to `/auth`.
* **Sample / Judge Access**: Reviewers and judges can bypass authentication by appending `?mode=demo` to the URL or clicking **Open sample audit** on the landing page. This opens a read-only session without requiring sign-in or creating demo credentials.
* **No Third-Party OAuth**: The application intentionally excludes Google Sign-In and third-party OAuth providers to maintain a standalone audit console workflow.

---

## Local Development

### Prerequisites
* Node.js (v18 or higher recommended)
* npm (bundled with Node.js)

### Setup & Startup
```bash
# 1. Install dependencies
npm install

# 2. Start the local development server (port 3000)
npm run dev
```

The application will be accessible at:
```
http://localhost:3000
```

---

## Testing

The application contains 24 automated test suites covering canonical data validation, scoring logic, simulation, auth state, and UI component rendering:

```bash
# Run the complete test suite
npm test

# Run TypeScript type-checking and linter
npm run lint
```

### Verified Test Suite Breakdown (24 / 24 Passing)
1. `standardValidator.test.ts` — Validates `standard.json` structure, pillar weights, and thresholds.
2. `scoring.test.ts` — Tests composite score calculations, not-assessed handling, and coverage.
3. `simulation.test.ts` — Verifies PRNG determinism and synthetic dataset generation.
4. `auth.test.ts` — Unit tests for auth state management and credential validation.
5. `authUI.test.tsx` — Tests form rendering, password visibility toggles, and role selection.
6. `dashboard.test.ts` — Derivation logic for DashboardViewModel and Fix First ranking.
7. `dashboardUI.test.tsx` — Tests ScoreStamp rendering, Safety Gate banner, and pillar table.
8. `standardExplorer.test.ts` — Tests indicator queries, filtering, and CSV/JSON formatting.
9. `standardExplorerUI.test.tsx` — Tests indicator table, detail drawer, and filter toolbar.
10. `monitor.test.ts` — Tests telemetry processing, observation gaps, and confidence scores.
11. `monitorUI.test.tsx` — Tests observation timeline, broken line rendering, and alerts.
12. `equipment.test.ts` — Tests lifecycle stage transitions and asset register derivations.
13. `equipmentUI.test.tsx` — Tests five-stage ledger, drawer, and maintenance indicators.
14. `caregiver.test.ts` — Tests competency scale (0–4), gap rules, and dual-assessor pairs.
15. `caregiverUI.test.tsx` — Tests matrix table, gap report, and assessor entry form.
16. `scoringEngine.test.ts` — Exhaustive unit tests for boundary conditions in scoring.
17. `routes.test.ts` — Verifies that all 10 route components and primitives exist.
18. `pilot.test.ts` — Pure mathematical tests for Cohen's kappa, Cronbach's alpha, and ROC.
19. `pilotUI.test.tsx` — Tests seed controls, score distribution charts, and limitations box.
20. `incident.test.ts` — Tests 6-stage workflow logic, Five-Why validations, and tie-breaking.
21. `incidentUI.test.tsx` — Tests stepper, timeline builder, corrective actions, and print layout.
22. `landingUI.test.tsx` — Tests semantic landmarks, Score Stamp preview, and hero CTA.
23. `settingsUI.test.tsx` — Tests profile editing, preference persistence, and audit export.
24. `qaProduction.test.tsx` — Comprehensive production QA verifying landmarks, accessibility, route protection, and PII safeguards.

---

## Production Build

To compile an optimized production distribution:

```bash
# Build the production bundle into dist/
npm run build

# Preview the production build locally
npm run preview
```

The build produces optimized ES modules, CSS bundles, self-hosted font assets, and SPA rewrite configurations inside the `dist/` folder.

---

## Deployment

The application is built as a static Single Page Application (SPA) with pre-configured rewrite support for multiple deployment environments:

* **Vite SPA Fallback**: Configured via `vercel.json` (Vercel rewrites) and `public/_redirects` (Netlify and Cloudflare Pages SPA rules) to ensure deep routes like `/app/dashboard?mode=demo` resolve cleanly.
* **Hosted Cloud Preview URLs**:
  * Shared Preview URL: `https://ais-pre-arandxhxn52nc5e2msyqyw-1060888724685.asia-southeast1.run.app`
  * Development Preview URL: `https://ais-dev-arandxhxn52nc5e2msyqyw-1060888724685.asia-southeast1.run.app`

---

## Demo Flow

For evaluators and hackathon judges, follow the 2–3 minute demonstration sequence:

```
Landing → Demo Dashboard → Safety Gate → Patient Monitor → Pilot
```

1. **Landing (`/`)**: Note the problem definition, the live Score Stamp, and the five-pillar architecture. Click **Open sample audit**.
2. **Demo Dashboard (`/app/dashboard?mode=demo`)**: Inspect the read-only sample audit banner, composite score (82/100), coverage, and Fix First priority table.
3. **Safety Gate Demo**: Observe that critical indicator failures immediately cap the audit tier, preventing dangerous omissions from hiding behind high averages.
4. **Patient Monitor (`/app/monitor?mode=demo`)**: Observe broken lines across irregular observation intervals and dynamic confidence decay. Note the safe-harbor notice (*"Decision support, not diagnosis"*).
5. **Pilot Study (`/app/pilot?mode=demo`)**: Demonstrate reproducible simulation via Seed #42. Review Cohen's kappa, Cronbach's alpha, score histograms, and explicit research boundaries.

For the complete word-for-word narrative and timing breakdown, refer to [docs/demo-script.md](docs/demo-script.md).

---

## Backup and Recovery

In the event of network interruption or presentation failure during evaluation, refer to [docs/demo-backup.md](docs/demo-backup.md) for:

* Rapid local startup procedures
* Step-by-step fail-safe recovery order
* Screen recording parameters and segment checklist
* Required research-integrity disclosures

---

## Documentation

* [docs/demo-script.md](docs/demo-script.md) — 2–3 minute presentation script with segment timings, spoken narrative, and terminology guidelines.
* [docs/demo-backup.md](docs/demo-backup.md) — Continuity guide, local commands, live URLs, and offline recording instructions.

---

## Project Status

**Feature-complete hackathon/demo implementation with simulated data and explicit research limitations.**

All core roadmap milestones are complete:
* Canonical Standard v1.4.0 specification
* Pure scoring engine and binary Safety Gate
* Seeded deterministic simulation engine
* Production Audit Ledger user interface
* Full suite of 10 application and public views
* Complete 24-suite test automation coverage

---

## Important Limitations

* **Simulated Data**: All patient vitals, caregiver evaluations, equipment records, and incident histories are synthetically generated.
* **Proposed Methodology**: The scoring rules, weights, and thresholds represent a proposed framework undergoing technical demonstration.
* **Not Clinically Validated**: CareProof has not undergone clinical trials and makes no claims of clinical efficacy.
* **Decision Support Only**: Designed for process and protocol auditing; does not provide medical diagnosis or treatment recommendations.
* **No Real Patient Records**: No real-world patient records, clinical databases, or healthcare provider systems are connected.

---

## License

No license file is currently defined in this repository.
