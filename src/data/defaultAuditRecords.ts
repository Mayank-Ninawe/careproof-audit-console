/**
 * Pre-configured deterministic audit scenarios generated via seeded PRNG.
 * Fully compliant with the canonical standard.
 * Explicitly labeled as SIMULATED.
 */

import { generateSimulatedAuditRecord } from '../scoring/scoringEngine';
import { FacilityAuditRecord } from '../types/standard';

// Scenario 1: Exemplary High-Performing Unit (Clean Tier 1, High Coverage)
export const SCENARIO_EXEMPLARY: FacilityAuditRecord = generateSimulatedAuditRecord(
  1042,
  'Mercy Valley Regional Hospital',
  'Cardiovascular Acute ICU - Wing 4A',
  'exemplary'
);

// Scenario 2: Critical Safety Gate Violation (High score overall, but critical medication protocol failed)
export const SCENARIO_CRITICAL_BREACH: FacilityAuditRecord = generateSimulatedAuditRecord(
  8391,
  'Pine Ridge Skilled Nursing & Rehabilitation',
  'Subacute Care & Memory Unit 2B',
  'critical_breach'
);

// Scenario 3: Low Coverage / Incomplete Assessment (Confidence degraded)
export const SCENARIO_LOW_COVERAGE: FacilityAuditRecord = generateSimulatedAuditRecord(
  5520,
  'Crestview Community Health Center',
  'Outpatient Infusion & Dialysis Suite',
  'low_coverage'
);

// Scenario 4: Post-Remediation Re-Audit Baseline (Mixed)
export const SCENARIO_MIXED_REMEDIATION: FacilityAuditRecord = generateSimulatedAuditRecord(
  3719,
  'St. Luke Long-Term Care Pavilion',
  'Long-Term Geriatric Care Ward 3C',
  'mixed'
);

export const PRESET_AUDITS: FacilityAuditRecord[] = [
  SCENARIO_EXEMPLARY,
  SCENARIO_CRITICAL_BREACH,
  SCENARIO_LOW_COVERAGE,
  SCENARIO_MIXED_REMEDIATION,
];
