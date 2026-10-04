/**
 * CareProof Audit Console - Caregiver Competency Pure Data Service
 * Source of Truth: CareProof Website Roadmap (Phase 9C)
 * 
 * ARCHITECTURAL CONTRACT:
 * 1. Pure & Side-Effect Free: Zero React, DOM, or Firebase dependencies.
 * 2. Deterministic: Predictable output matching source simulation dataset.
 * 3. Scope Boundaries:
 *    - Competency levels 0-4 strictly checked; invalid levels rejected.
 *    - Supported assessment methods: OSCE, Direct Observation, Knowledge Test.
 *    - Expiry logic uses actual dates only; missing dates are "not_configured" (never invented durations).
 *    - Gaps reported only when a target level is explicitly configured.
 *    - Dual assessors (A & B) supported without calculating Cohen's kappa.
 *    - No staffing ratios or fatigue thresholds invented.
 */

import { SimulatedDataset, SimulatedCaregiver } from '../types/simulation';
import {
  CaregiverAssessment,
  CaregiverAssessmentMethod,
  CaregiverCompetency,
  CaregiverCompetencyCell,
  CaregiverCompetencyLevel,
  CaregiverDetail,
  CaregiverExpiryStatus,
  CaregiverFilterOptions,
  CaregiverGap,
  CaregiverMatrixColumn,
  CaregiverMatrixRow,
  CaregiverRecord,
  CaregiverViewModel,
  DualAssessorPair,
  VALID_ASSESSMENT_METHODS,
} from '../types/caregiver';

export const CAREGIVER_SAFE_HARBOR_DISCLAIMER =
  'Proposed framework, not clinically validated. Decision support, not diagnosis.';

const DEFAULT_REFERENCE_DATE = '2026-01-01T00:00:00.000Z';

/**
 * Pure evaluation of expiry status based strictly on actual configured dates.
 * Zero expiration durations or intervals are invented.
 */
export function computeExpiryStatus(
  expiryDate?: string | null,
  referenceDate: string | Date = DEFAULT_REFERENCE_DATE
): CaregiverExpiryStatus {
  if (!expiryDate || typeof expiryDate !== 'string' || expiryDate.trim().length === 0) {
    return 'not_configured';
  }

  const expMs = Date.parse(expiryDate);
  if (isNaN(expMs)) {
    return 'not_configured';
  }

  const refMs = typeof referenceDate === 'string' ? Date.parse(referenceDate) : referenceDate.getTime();
  if (isNaN(refMs)) {
    return 'not_configured';
  }

  return expMs < refMs ? 'expired' : 'active';
}

/**
 * Deterministically sorts caregivers by Caregiver ID ascending.
 */
export function sortCaregiverRecords(
  caregivers: readonly SimulatedCaregiver[]
): SimulatedCaregiver[] {
  return [...caregivers].sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Validates that a numeric level is strictly a valid CaregiverCompetencyLevel (0 | 1 | 2 | 3 | 4).
 */
export function isValidCompetencyLevel(level: unknown): level is CaregiverCompetencyLevel {
  return typeof level === 'number' && Number.isInteger(level) && level >= 0 && level <= 4;
}

/**
 * Validates that an assessment method is strictly in the roadmap's union.
 */
export function isValidAssessmentMethod(method: unknown): method is CaregiverAssessmentMethod {
  return (
    typeof method === 'string' &&
    VALID_ASSESSMENT_METHODS.includes(method as CaregiverAssessmentMethod)
  );
}

/**
 * Generates the Caregiver Competency Matrix (Rows = Caregivers, Columns = Competencies).
 * If competencies are not provided/configured, returns explicit unconfigured columns/cells.
 */
export function getCaregiverMatrix(
  dataset: SimulatedDataset,
  competencies: readonly CaregiverCompetency[] = [],
  assessments: readonly CaregiverAssessment[] = [],
  referenceDate: string | Date = DEFAULT_REFERENCE_DATE
): {
  columns: CaregiverMatrixColumn[];
  rows: CaregiverMatrixRow[];
  isConfigured: boolean;
} {
  if (!dataset || !Array.isArray(dataset.caregivers)) {
    return { columns: [], rows: [], isConfigured: false };
  }

  const sortedCaregivers = sortCaregiverRecords(dataset.caregivers);
  const isConfigured = competencies.length > 0;

  // Build columns
  const columns: CaregiverMatrixColumn[] = competencies.map((comp) => ({
    competencyId: comp.id,
    name: comp.name,
    targetLevel: comp.targetLevel,
    isConfigured: true,
  }));

  // Build rows
  const rows: CaregiverMatrixRow[] = sortedCaregivers.map((cg) => {
    const cells: Record<string, CaregiverCompetencyCell> = {};

    for (const comp of competencies) {
      // Find assessments for this caregiver & competency
      const matched = assessments.filter(
        (a) => a.caregiverId === cg.id && a.competencyId === comp.id
      );

      // Latest assessment
      const latest = matched.length > 0 ? matched[matched.length - 1] : undefined;
      const level = latest ? latest.level : null;
      const expiryStatus = computeExpiryStatus(latest?.expiryDate, referenceDate);

      let status: CaregiverCompetencyCell['status'] = 'not_assessed';
      if (latest) {
        if (expiryStatus === 'expired') {
          status = 'expired';
        } else {
          status = 'assessed';
        }
      }

      cells[comp.id] = {
        competencyId: comp.id,
        level,
        status,
        primaryMethod: latest?.method,
        latestAssessment: latest,
        expiryStatus,
        expiryDate: latest?.expiryDate ?? null,
        isConfigured: true,
      };
    }

    return {
      caregiverId: cg.id,
      roleId: cg.roleId,
      competencyProfile: cg.competencyProfile,
      assessmentStatus: cg.assessmentStatus,
      licenseExpires: cg.licenseExpires,
      trainingCompletedPercent: cg.trainingCompletedPercent,
      cells,
      isSimulated: true,
    };
  });

  return { columns, rows, isConfigured };
}

/**
 * Pure Gap Analysis Report.
 * Gaps are only identified when a targetLevel is explicitly configured.
 * Missing target level DOES NOT create a fake gap.
 */
export function getCaregiverGapReport(
  caregivers: readonly SimulatedCaregiver[],
  competencies: readonly CaregiverCompetency[],
  assessments: readonly CaregiverAssessment[]
): CaregiverGap[] {
  const gaps: CaregiverGap[] = [];

  for (const comp of competencies) {
    // If targetLevel is not configured, do not invent requirements
    if (comp.targetLevel === undefined || comp.targetLevel === null) {
      continue;
    }

    for (const cg of caregivers) {
      const matched = assessments.filter(
        (a) => a.caregiverId === cg.id && a.competencyId === comp.id
      );
      const latest = matched.length > 0 ? matched[matched.length - 1] : null;
      const currentLevel = latest ? latest.level : null;

      if (currentLevel === null) {
        gaps.push({
          caregiverId: cg.id,
          competencyId: comp.id,
          currentLevel: null,
          targetLevel: comp.targetLevel,
          gapDeficit: comp.targetLevel,
          status: 'unassessed',
          reason: `Caregiver ${cg.id} is unassessed for configured competency ${comp.name} (${comp.id}).`,
        });
      } else if (currentLevel < comp.targetLevel) {
        gaps.push({
          caregiverId: cg.id,
          competencyId: comp.id,
          currentLevel,
          targetLevel: comp.targetLevel,
          gapDeficit: comp.targetLevel - currentLevel,
          status: 'below_target',
          reason: `Caregiver ${cg.id} assessed at Level ${currentLevel}, below configured target Level ${comp.targetLevel}.`,
        });
      }
    }
  }

  return gaps;
}

/**
 * Organizes assessment pairs for inter-rater validation (Assessor A & B).
 * Explicitly preserves assessment pairs without calculating Cohen's kappa.
 */
export function getDualAssessorPairs(
  assessments: readonly CaregiverAssessment[]
): DualAssessorPair[] {
  const map = new Map<string, { a?: CaregiverAssessment; b?: CaregiverAssessment }>();

  for (const a of assessments) {
    const key = `${a.caregiverId}::${a.competencyId}`;
    const pair = map.get(key) || {};

    if (a.assessorRole === 'assessor_b') {
      pair.b = a;
    } else if (a.assessorRole === 'assessor_a') {
      pair.a = a;
    } else if (!pair.a) {
      pair.a = a;
    } else if (!pair.b) {
      pair.b = a;
    }

    map.set(key, pair);
  }

  const pairs: DualAssessorPair[] = [];
  for (const [key, val] of map.entries()) {
    const [caregiverId, competencyId] = key.split('::');
    const hasBothAssessors = Boolean(val.a && val.b);
    const levelAgreement = hasBothAssessors ? val.a!.level === val.b!.level : null;

    pairs.push({
      caregiverId,
      competencyId,
      assessorA: val.a,
      assessorB: val.b,
      hasBothAssessors,
      levelAgreement,
    });
  }

  return pairs;
}

/**
 * Filters matrix rows based on search query, competency status, method, and expiry.
 */
export function filterCaregiverRows(
  rows: readonly CaregiverMatrixRow[],
  filters?: CaregiverFilterOptions,
  assessments: readonly CaregiverAssessment[] = []
): CaregiverMatrixRow[] {
  if (!filters) return [...rows];

  return rows.filter((row) => {
    // 1. Role filter
    if (filters.roleId && filters.roleId !== 'all' && row.roleId !== filters.roleId) {
      return false;
    }

    // 2. Search query (matches caregiver ID, role ID, or profile)
    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchId = row.caregiverId.toLowerCase().includes(q);
      const matchRole = row.roleId.toLowerCase().includes(q);
      const matchProfile = row.competencyProfile.toLowerCase().includes(q);
      if (!matchId && !matchRole && !matchProfile) {
        return false;
      }
    }

    // 3. Expiry status filter (matches license or assessment expiry)
    if (filters.expiryStatus && filters.expiryStatus !== 'all') {
      const licenseExpiryStatus = computeExpiryStatus(row.licenseExpires);
      const hasMatchingCell = Object.values(row.cells).some(
        (c) => c.expiryStatus === filters.expiryStatus
      );
      if (licenseExpiryStatus !== filters.expiryStatus && !hasMatchingCell) {
        return false;
      }
    }

    // 4. Competency status filter
    if (filters.competencyStatus && filters.competencyStatus !== 'all') {
      const hasMatchingCell = Object.values(row.cells).some(
        (c) => c.status === filters.competencyStatus
      );
      if (!hasMatchingCell) {
        return false;
      }
    }

    // 5. Assessment method filter
    if (filters.assessmentMethod && filters.assessmentMethod !== 'all') {
      const cgAssessments = assessments.filter((a) => a.caregiverId === row.caregiverId);
      const hasMethod = cgAssessments.some((a) => a.method === filters.assessmentMethod);
      if (!hasMethod) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Retrieves detailed audit context for an individual caregiver.
 */
export function getCaregiverDetail(
  dataset: SimulatedDataset,
  caregiverId: string,
  competencies: readonly CaregiverCompetency[] = [],
  assessments: readonly CaregiverAssessment[] = [],
  referenceDate: string | Date = DEFAULT_REFERENCE_DATE
): CaregiverDetail | null {
  if (!dataset || !Array.isArray(dataset.caregivers) || !caregiverId) {
    return null;
  }

  const rawCaregiver = dataset.caregivers.find((cg) => cg && cg.id === caregiverId);
  if (!rawCaregiver) {
    return null;
  }

  const caregiverRecord: CaregiverRecord = {
    ...rawCaregiver,
    caregiverId: rawCaregiver.id,
  };

  const matrix = getCaregiverMatrix(
    { ...dataset, caregivers: [rawCaregiver] },
    competencies,
    assessments,
    referenceDate
  );

  const matrixRow = matrix.rows[0];
  const caregiverAssessments = assessments.filter((a) => a.caregiverId === caregiverId);
  const expiryStatus = computeExpiryStatus(rawCaregiver.licenseExpires, referenceDate);
  const gaps = getCaregiverGapReport([rawCaregiver], competencies, assessments);
  const assessorPairs = getDualAssessorPairs(caregiverAssessments);

  return {
    caregiver: caregiverRecord,
    matrixRow,
    assessments: caregiverAssessments,
    expiryStatus,
    gaps,
    assessorPairs,
    isSimulated: true,
  };
}

/**
 * Validates an assessor entry payload.
 * Rejects invalid levels (< 0 or > 4 or non-integer) and invalid methods.
 */
export function validateAssessmentEntry(entry: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!entry || typeof entry !== 'object') {
    return { valid: false, errors: ['Assessment entry must be an object.'] };
  }

  const e = entry as Record<string, unknown>;

  if (typeof e.caregiverId !== 'string' || e.caregiverId.trim().length === 0) {
    errors.push('Caregiver ID is required.');
  }

  if (typeof e.competencyId !== 'string' || e.competencyId.trim().length === 0) {
    errors.push('Competency ID is required.');
  }

  if (!isValidCompetencyLevel(e.level)) {
    errors.push('Competency level must be an integer between 0 and 4.');
  }

  if (!isValidAssessmentMethod(e.method)) {
    errors.push('Assessment method must be OSCE, Direct Observation, or Knowledge Test.');
  }

  if (typeof e.assessorId !== 'string' || e.assessorId.trim().length === 0) {
    errors.push('Assessor ID is required.');
  }

  if (typeof e.timestamp !== 'string' || isNaN(Date.parse(e.timestamp))) {
    errors.push('Timestamp must be a valid ISO-8601 date string.');
  }

  if (e.expiryDate !== undefined && e.expiryDate !== null) {
    if (typeof e.expiryDate !== 'string' || isNaN(Date.parse(e.expiryDate))) {
      errors.push('Expiry date must be a valid ISO-8601 date string if provided.');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Creates the primary Caregiver Competency ViewModel.
 */
export function createCaregiverViewModel(
  dataset: SimulatedDataset,
  options?: {
    competencies?: readonly CaregiverCompetency[];
    assessments?: readonly CaregiverAssessment[];
    filters?: CaregiverFilterOptions;
    referenceDate?: string | Date;
  }
): CaregiverViewModel {
  const competencies = options?.competencies ?? [];
  const assessments = options?.assessments ?? [];
  const referenceDate = options?.referenceDate ?? DEFAULT_REFERENCE_DATE;

  const matrix = getCaregiverMatrix(dataset, competencies, assessments, referenceDate);
  const gaps = getCaregiverGapReport(dataset.caregivers ?? [], competencies, assessments);
  const filteredRows = filterCaregiverRows(matrix.rows, options?.filters, assessments);

  const availableRoles = Array.from(
    new Set((dataset.caregivers ?? []).map((cg) => cg.roleId))
  ).sort();

  return {
    columns: matrix.columns,
    rows: filteredRows,
    totalCaregivers: matrix.rows.length,
    filteredCount: filteredRows.length,
    gaps,
    isCompetenciesConfigured: matrix.isConfigured,
    availableRoles,
    availableMethods: [...VALID_ASSESSMENT_METHODS],
    isSimulated: true,
    disclaimer: CAREGIVER_SAFE_HARBOR_DISCLAIMER,
  };
}
