# CareProof Audit Console — Demo Backup & Continuity Package

> **Disclosures & Research-Integrity Baseline**
> * **Clinical Boundary**: Decision support, not diagnosis.
> * **Scientific Baseline**: Proposed framework, not clinically validated.
> * **Dataset Character**: Synthetic simulation data for demonstration only. Zero patient PII.

---

## A. Local Startup Command

To launch the local development environment:

```bash
# 1. Install dependencies (if not already installed)
npm install

# 2. Start the local development server (runs on port 3000)
npm run dev
```

The application will be accessible at:
```
http://localhost:3000
```

---

## B. Production Build Command

To compile and verify the production bundle:

```bash
# 1. Run full type-check and linter
npm run lint

# 2. Run all unit and integration test suites
npm test

# 3. Compile optimized production distribution into dist/
npm run build

# 4. Preview compiled production bundle locally
npm run preview
```

---

## C. Demo URLs

* **Live Deployment**:
  `https://careproof-audit-consolee.ai.studio/`
* **Hosted Shared Preview App**:
  `https://ais-pre-arandxhxn52nc5e2msyqyw-1060888724685.asia-southeast1.run.app`
* **Hosted Development Preview App**:
  `https://ais-dev-arandxhxn52nc5e2msyqyw-1060888724685.asia-southeast1.run.app`
* **Local Development Server**:
  `http://localhost:3000`

---

## D. Core Demo Route

The primary zero-friction demonstration route (requires zero authentication or credentials):

```
/app/dashboard?mode=demo
```

Direct URLs for all presentation segments:
* **Public Landing Page**: `/`
* **Read-Only Sample Dashboard**: `/app/dashboard?mode=demo`
* **Canonical Standard Explorer**: `/app/standard?mode=demo`
* **Patient Monitor**: `/app/monitor?mode=demo`
* **Reproducible Pilot Study**: `/app/pilot?mode=demo`
* **Equipment Lifecycle**: `/app/equipment?mode=demo`
* **Caregiver Competency**: `/app/caregivers?mode=demo`
* **Incident Response**: `/app/incident?mode=demo`
* **System Settings & Data Governance**: `/app/settings?mode=demo`

---

## E. Fail-Safe Recovery Order

If the live cloud environment experiences latency, disconnection, or unavailable external network access during an evaluation:

1. **Step 1 — Fallback to Local Host**:
   Start the local server via `npm run dev` and open `http://localhost:3000`.
2. **Step 2 — Load Landing Page**:
   Open `http://localhost:3000/`. Confirm wordmark, Score Stamp, and Five Pillars.
3. **Step 3 — Launch Sample Audit**:
   Click **Open sample audit** to enter `http://localhost:3000/app/dashboard?mode=demo`.
4. **Step 4 — Follow Demo Script**:
   Follow `docs/demo-script.md` through Dashboard → Safety Gate → Patient Monitor → Pilot Study.
5. **Step 5 — Play Offline Screen Recording**:
   If browser rendering is completely unavailable, present the pre-recorded offline video backup as outlined in Section F below.

---

## F. Backup Recording Guidance

If preparing an offline video backup or screen recording, capture the following sequence at 1080p, 60fps or 30fps with audio commentary:

| Segment | Target Route | Duration | Key Elements to Capture |
| :--- | :--- | :--- | :--- |
| **1. Landing** | `/` | 0:00–0:20 | Wordmark, headline, Score Stamp (82/100 Tier 2), 5 pillars strip, "Open sample audit" button. |
| **2. Dashboard** | `/app/dashboard?mode=demo` | 0:20–1:00 | Read-only sample banner, Score Stamp, Safety Gate banner, Fix First priority table (Weight × Gap). |
| **3. Patient Monitor** | `/app/monitor?mode=demo` | 1:00–1:45 | Observation timeline with broken lines across gaps, confidence ribbon, data-gap notification, safe harbor notice. |
| **4. Pilot Study** | `/app/pilot?mode=demo` | 1:45–2:30 | Simulated results disclosure, reproducible seed #42, score histogram, Cohen's kappa, Cronbach's alpha, limitations box. |
| **5. Honest Limits** | `/` (Footer) | 2:30–2:45 | Four honest boundaries: Not Clinically Validated, Decision Support Only, Synthetic Test Data, Workflow Completeness Only. |

---

## G. Important Disclosures & Ethical Boundaries

When presenting the backup or speaking to evaluators:

1. **Decision Support, Not Diagnosis**:
   CareProof does not diagnose clinical conditions, prescribe medications, or replace healthcare practitioners.
2. **Proposed Framework, Not Clinically Validated**:
   The audit rules, scoring weights, and indicator criteria are a proposed technical standard undergoing simulated methodological evaluation.
3. **Synthetic Demonstration Data**:
   All patient names, vitals, telemetry, equipment records, and incident reports are deterministically generated synthetic artifacts. Zero real patient PII is stored or transmitted.
4. **Pure Deterministic Calculation**:
   All scores and pilot statistics derive from explicit, mathematical models with fixed random seeds for audit reproducibility.
