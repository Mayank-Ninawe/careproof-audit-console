# CareProof Audit Console — Official 2–3 Minute Demonstration Script

> **Disclosures & Clinical Safe Harbor**
> * **Status**: Proposed framework, not clinically validated.
> * **Function**: Decision support, not diagnosis.
> * **Data Source**: Deterministic synthetic simulation; strictly zero patient PII.

---

## Overview & Timing Summary

* **Total Duration**: ~2 minutes 30 seconds (Max 2 minutes 45 seconds)
* **Core Flow**: Landing (`/`) → Sample Audit Dashboard (`/app/dashboard?mode=demo`) → Safety Gate Demo → Patient Monitor (`/app/monitor?mode=demo`) → Pilot Study (`/app/pilot?mode=demo`) → Honest Limits
* **Primary URL Target**: `/` (Public Landing) and `/app/dashboard?mode=demo` (Direct Read-Only Exploration)

---

## Demonstration Script

### Segment 1: Landing Page — Problem & Five Pillars (0:00 – 0:20)

* **Screen**: Public Landing Page (`/`)
* **Visual Actions**:
  1. Start at the top of `/`. Note the clean Audit Ledger design, self-hosted typography, and the persistent safe-harbor notice: *"Decision support, not diagnosis."*
  2. Scroll slightly to highlight the **Audit Score Stamp** (82 / 100, Tier 2) and the **Five CareProof Pillars**: Clinical Governance, Medication Administration, Equipment Verification, Caregiver Competency, and Protocol Adherence.
  3. Point to the primary action: **Open sample audit**.

* **Spoken Narrative**:
> "Home-based clinical care is expanding rapidly, but families, agencies, and auditors lack a standardized way to measure whether care protocols are actually being delivered as specified. 
> 
> CareProof is an auditable framework and console that measures structured care delivery against explicit, numerical compliance thresholds defined in CareProof Standard v1.4.0. Rather than subjective claims, it calculates a weighted composite score across five foundational pillars."

---

### Segment 2: Sample Dashboard & Safety Gate Verification (0:20 – 1:00)

* **Screen**: Sample Audit Dashboard (`/app/dashboard?mode=demo`)
* **Visual Actions**:
  1. Click **Open sample audit** (navigates to `/app/dashboard?mode=demo` without requiring credentials).
  2. Highlight the **Sample Audit Banner** confirming this is a read-only demonstration ledger.
  3. Review the **Score Stamp** (82 / 100, Tier 2, 85% coverage) and the **Pillar Ledger Table**.
  4. Point to the **Safety Gate Banner** and the **Fix First Priority Table** (ranked deterministically by Weight × Gap).
  5. Demonstrate the Safety Gate principle: show that critical-indicator failures immediately trip the gate, capping the maximum tier at Tier 3 or Provisional regardless of a high composite score.

* **Spoken Narrative**:
> "By opening the sample audit, we enter the ledger in read-only demonstration mode—no authentication barrier or simulated credentials required.
> 
> Here we see the deterministic scoring engine at work. The overall score is 82, derived from our five weighted pillars with 85% audit coverage. 
> 
> Crucially, CareProof implements a binary Safety Gate. If any critical indicator—such as emergency escalation or vital sign telemetry—fails, the Safety Gate trips immediately. Even if the numerical score is 95, the audit tier is capped, preventing high averages from masking dangerous gaps. The Fix First ledger ranks deficiencies deterministically by weight multiplied by compliance gap so agencies know exactly what to address first."

---

### Segment 3: Patient Monitor — Observation Freshness & Confidence (1:00 – 1:45)

* **Screen**: Patient Monitor (`/app/monitor?mode=demo`)
* **Visual Actions**:
  1. Click **Patient Monitor** in the left rail.
  2. Highlight the **Observation Timeline**: show irregular observation spacing with broken lines across gaps (never artificially smoothed or connected).
  3. Highlight the **Confidence Ribbon**: show how missing telemetry and time elapsed reduce observation confidence.
  4. Point to the **Data Gap Alert** and the persistent disclaimer: *"Decision support, not diagnosis."*

* **Spoken Narrative**:
> "Next, we examine operational telemetry in the Patient Monitor. 
> 
> Real-world home care data is rarely continuous. When observations are delayed or irregular, CareProof renders broken lines across gaps rather than interpolating fake readings. 
> 
> Above the timeline, the confidence ribbon dynamically reflects data completeness and elapsed time. When readings lapse past configured intervals, an explicit data gap is declared and confidence drops. 
> 
> As disclosed throughout: CareProof is decision support, not diagnosis. It measures protocol execution, not medical pathology."

---

### Segment 4: Pilot Study — Reproducibility & Research Disclosures (1:45 – 2:30)

* **Screen**: Pilot Study (`/app/pilot?mode=demo`)
* **Visual Actions**:
  1. Click **Pilot Study** in the left navigation.
  2. Highlight the prominent **SIMULATED PILOT RESULTS** disclosure banner.
  3. Show the **Reproducibility Seed Control** (Seed #42). Show that the same seed deterministically yields the exact same distribution, Cohen's kappa, and Cronbach's alpha.
  4. Point out the **Score Distribution Histogram** and **Inter-Rater Reliability Panel**.
  5. Scroll to the **Methodological Limitations Box**.

* **Spoken Narrative**:
> "In the Pilot Study module, we demonstrate measurement reproducibility through in silico synthetic simulation.
> 
> These are simulated demonstration results, not clinical validation. By using deterministic random seeds, anyone can reproduce the exact score distributions, inter-rater agreement, and internal consistency metrics shown here. 
> 
> We explicitly present our research boundaries: this pilot demonstrates measurement reliability and protocol completeness in synthetic test cohorts. It does not replace clinical judgment or establish clinical efficacy."

---

### Segment 5: Honest Limits & Wrap-Up (2:30 – 2:45)

* **Screen**: Return to Landing (`/`) or Settings About (`/app/settings?mode=demo`)
* **Visual Actions**:
  1. Click **Overview** or navigate back to the landing page footer / Honest Limits section.
  2. Point to the four explicit boundaries: Not Clinically Validated, Decision Support Only, Synthetic Test Data, and Workflow Completeness Only.

* **Spoken Narrative**:
> "CareProof replaces subjective assurances with an auditable, reproducible ledger. It is a proposed framework designed to make home-care protocols measurable, transparent, and verifiable."

---

## Approved Terminology & Style Guide

| Use Plain, Auditable Language | Strictly Avoid Hype Language |
| :--- | :--- |
| Measurable | ~~AI-powered~~ |
| Auditable framework | ~~Revolutionary~~ |
| Deterministic scoring | ~~Seamless~~ |
| Proposed standard | ~~Guaranteed safety~~ |
| Simulated demonstration | ~~Clinically validated / proven~~ |
| Confidence-aware telemetry | ~~Hospital certified~~ |
| Binary safety gate | ~~Intelligent healthcare~~ |
| Evidence classification | ~~Automated medical diagnosis~~ |
