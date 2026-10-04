/**
 * CareProof Audit Console - Caregiver Competency Domain Types
 * Source of Truth: CareProof Website Roadmap (Phase 9C)
 * 
 * ARCHITECTURAL CONTRACT:
 * 1. Matrix Model: Rows = Caregivers, Columns = Competencies, Cells = Level 0-4.
 * 2. Strict Competency Levels: Exactly 0 | 1 | 2 | 3 | 4 (no arbitrary levels).
 * 3. Assessment Methods: Exactly 'OSCE' | 'Direct Observation' | 'Knowledge Test'.
 * 4. Dual Assessor Support: Structures for Assessor A & B without calculating kappa.
 * 5. Honest Boundaries:
 *    - Zero invented staffing ratios or fatigue limits.
 *    - Zero invented clinical competency or licensing standards.
 *    - No invented expiration durations; missing expiry = not_configured.
 */

import { CaregiverAssessmentStatus, SimulatedCaregiver } from './simulation';

/**
 * Strict numeric competency level scale (0 to 4).
 * Ordered levels preserved without invented medical meanings.
 */
export type CaregiverCompetencyLevel = 0 | 1 | 2 | 3 | 4;

export const VALID_COMPETENCY_LEVELS: readonly CaregiverCompetencyLevel[] = [
  0, 1, 2, 3, 4,
] as const;

/**
 * Roadmap canonical assessment methods.
 */
export type CaregiverAssessmentMethod =
  | 'OSCE'
  | 'Direct Observation'
  | 'Knowledge Test';

export const VALID_ASSESSMENT_METHODS: readonly CaregiverAssessmentMethod[] = [
  'OSCE',
  'Direct Observation',
  'Knowledge Test',
] as const;

/**
 * Assessment evaluation status in matrix cells.
 */
export type CaregiverMatrixStatus =
  | 'assessed'
  | 'not_assessed'
  | 'expired'
  | 'pending';

/**
 * Expiry status for an assessment or license.
 */
export type CaregiverExpiryStatus = 'active' | 'expired' | 'not_configured';

/**
 * Configured competency definition.
 * If targetLevel is undefined, gap analysis rules remain not-configured.
 */
export interface CaregiverCompetency {
  id: string;                      // e.g. "COMP-01"
  name: string;                    // e.g. "Vital Signs Telemetry"
  description?: string;
  targetLevel?: CaregiverCompetencyLevel; // Optional benchmark level
}

/**
 * Single evaluation assessment record.
 */
export interface CaregiverAssessment {
  id: string;
  caregiverId: string;
  competencyId: string;
  level: CaregiverCompetencyLevel;
  method: CaregiverAssessmentMethod;
  assessorId: string;
  assessorRole?: 'assessor_a' | 'assessor_b';
  timestamp: string;               // ISO 8601 deterministic timestamp
  expiryDate?: string | null;      // Optional explicit expiry date
  isSimulated: true;
}

/**
 * Individual matrix cell for a given caregiver and competency.
 */
export interface CaregiverCompetencyCell {
  competencyId: string;
  level: CaregiverCompetencyLevel | null;
  status: CaregiverMatrixStatus;
  primaryMethod?: CaregiverAssessmentMethod;
  latestAssessment?: CaregiverAssessment;
  expiryStatus: CaregiverExpiryStatus;
  expiryDate?: string | null;
  isConfigured: boolean;
}

/**
 * Canonical caregiver record extending SimulatedCaregiver.
 */
export interface CaregiverRecord extends SimulatedCaregiver {
  caregiverId: string;
}

/**
 * A matrix row representing one caregiver across all configured competency columns.
 */
export interface CaregiverMatrixRow {
  caregiverId: string;
  roleId: string;
  competencyProfile: string;
  assessmentStatus: CaregiverAssessmentStatus;
  licenseExpires: string;
  trainingCompletedPercent: number;
  cells: Record<string, CaregiverCompetencyCell>;
  isSimulated: true;
}

/**
 * A matrix column representing a competency.
 */
export interface CaregiverMatrixColumn {
  competencyId: string;
  name: string;
  targetLevel?: CaregiverCompetencyLevel;
  isConfigured: boolean;
}

/**
 * Assessor entry payload for submitting new competency evaluations.
 */
export interface CaregiverAssessmentEntry {
  caregiverId: string;
  competencyId: string;
  level: CaregiverCompetencyLevel;
  method: CaregiverAssessmentMethod;
  assessorId: string;
  assessorRole?: 'assessor_a' | 'assessor_b';
  timestamp: string;
  expiryDate?: string | null;
  notes?: string;
}

/**
 * Gap report item indicating an unmet competency target.
 */
export interface CaregiverGap {
  caregiverId: string;
  competencyId: string;
  currentLevel: CaregiverCompetencyLevel | null;
  targetLevel: CaregiverCompetencyLevel;
  gapDeficit: number;
  status: 'below_target' | 'unassessed';
  reason: string;
}

/**
 * Pair of assessments by Assessor A and Assessor B for inter-rater validation.
 */
export interface DualAssessorPair {
  caregiverId: string;
  competencyId: string;
  assessorA?: CaregiverAssessment;
  assessorB?: CaregiverAssessment;
  hasBothAssessors: boolean;
  levelAgreement: boolean | null;
}

/**
 * Detailed view for an individual caregiver.
 */
export interface CaregiverDetail {
  caregiver: CaregiverRecord;
  matrixRow: CaregiverMatrixRow;
  assessments: CaregiverAssessment[];
  expiryStatus: CaregiverExpiryStatus;
  gaps: CaregiverGap[];
  assessorPairs: DualAssessorPair[];
  isSimulated: true;
}

/**
 * Filter options for caregiver queries.
 */
export interface CaregiverFilterOptions {
  searchQuery?: string;
  competencyStatus?: CaregiverMatrixStatus | 'all';
  assessmentMethod?: CaregiverAssessmentMethod | 'all';
  expiryStatus?: CaregiverExpiryStatus | 'all';
  roleId?: string | 'all';
}

/**
 * Primary View Model for the Caregiver module.
 */
export interface CaregiverViewModel {
  columns: CaregiverMatrixColumn[];
  rows: CaregiverMatrixRow[];
  totalCaregivers: number;
  filteredCount: number;
  gaps: CaregiverGap[];
  isCompetenciesConfigured: boolean;
  availableRoles: string[];
  availableMethods: CaregiverAssessmentMethod[];
  isSimulated: true;
  disclaimer: string;
}
