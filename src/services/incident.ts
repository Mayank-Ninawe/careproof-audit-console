/**
 * CareProof Audit Console - Incident Response Pure Workflow Service (Phase 11A)
 * Source of Truth: CareProof Website Roadmap (Phase 11A)
 * 
 * ARCHITECTURAL CONTRACT:
 * 1. Pure & Side-Effect Free: Zero React, DOM, or Firebase dependencies.
 * 2. Strictly Deterministic: Predictable output matching input parameters.
 * 3. Scope Boundaries:
 *    - Workflow statuses represent software lifecycle stages only; no clinical/legal claims.
 *    - Indicator mappings strictly validated against canonical standard.json.
 *    - 5-Why root-cause analysis limited to 1–5 ordered steps; zero auto-filled answers.
 *    - Corrective actions and re-audit plans are audit/process workflows, not medical advice.
 *    - Zero patient PII (no names, MRNs, addresses, phone numbers).
 *    - All mock/generated entities tagged as SIMULATED.
 */

import { CANONICAL_STANDARD } from '../data/standard';
import { Standard } from '../types/standard';
import {
  IncidentFilterOptions,
  IncidentPrintViewData,
  IncidentProgress,
  IncidentRecord,
  IncidentTimelineEvent,
  IncidentValidationResult,
  IncidentViewModel,
  VALID_ACTION_STATUSES,
  VALID_INCIDENT_STATUSES,
  VALID_REAUDIT_STATUSES,
} from '../types/incident';

export const INCIDENT_SAFE_HARBOR_DISCLAIMER =
  'Proposed framework, not clinically validated. Decision support, not diagnosis. Proposed workflow, not clinically validated. Workflow completeness only, not medical judgment or legal conclusion.';

export const INCIDENT_SIMULATED_DISCLOSURE =
  'All incident data are synthetic demonstration records. Zero real-world patient events or adverse incidents are depicted.';

/**
 * Extracts a Set of all valid canonical indicator IDs from the loaded standard.
 */
export function getCanonicalIndicatorIds(standard: Standard = CANONICAL_STANDARD): Set<string> {
  const ids = new Set<string>();
  if (standard && Array.isArray(standard.indicators)) {
    for (const indicator of standard.indicators) {
      if (indicator && typeof indicator.id === 'string') {
        ids.add(indicator.id);
      }
    }
  }
  return ids;
}

/**
 * Pure validation for Incident Records and related workflow artifacts.
 * Rejects malformed input, missing required fields, and non-canonical indicator links.
 */
export function validateIncident(
  record: Partial<IncidentRecord>,
  standard: Standard = CANONICAL_STANDARD
): IncidentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Core ID validation
  if (!record.id || typeof record.id !== 'string' || record.id.trim().length === 0) {
    errors.push('Incident ID is required.');
  }

  // 2. Intake validation
  if (!record.intake) {
    errors.push('Incident intake information is required.');
  } else {
    if (!record.intake.title || typeof record.intake.title !== 'string' || record.intake.title.trim().length === 0) {
      errors.push('Incident title is required.');
    }
    if (!record.intake.summary || typeof record.intake.summary !== 'string' || record.intake.summary.trim().length === 0) {
      errors.push('Incident summary is required.');
    }
    if (!record.intake.reporterId || typeof record.intake.reporterId !== 'string' || record.intake.reporterId.trim().length === 0) {
      errors.push('Reporter ID is required.');
    }
    if (!record.intake.timestamp || isNaN(Date.parse(record.intake.timestamp))) {
      errors.push('Valid intake timestamp (ISO 8601) is required.');
    }
  }

  // 3. Status validation
  if (!record.status || !VALID_INCIDENT_STATUSES.includes(record.status)) {
    errors.push(`Invalid incident status: "${String(record.status)}". Allowed: ${VALID_INCIDENT_STATUSES.join(', ')}.`);
  }

  // 4. Timeline validation
  if (record.timeline && Array.isArray(record.timeline)) {
    const eventIds = new Set<string>();
    for (let i = 0; i < record.timeline.length; i++) {
      const evt = record.timeline[i];
      if (!evt.id || typeof evt.id !== 'string' || evt.id.trim().length === 0) {
        errors.push(`Timeline event at index ${i} is missing a required event ID.`);
      } else {
        if (eventIds.has(evt.id)) {
          errors.push(`Duplicate timeline event ID detected: "${evt.id}".`);
        }
        eventIds.add(evt.id);
      }

      if (!evt.timestamp || isNaN(Date.parse(evt.timestamp))) {
        errors.push(`Timeline event "${evt.id || i}" has an invalid timestamp.`);
      }
      if (!evt.title || typeof evt.title !== 'string' || evt.title.trim().length === 0) {
        errors.push(`Timeline event "${evt.id || i}" is missing a required title.`);
      }
    }
  }

  // 5. Canonical Indicator Mapping validation
  const canonicalIds = getCanonicalIndicatorIds(standard);
  if (record.linkedIndicators && Array.isArray(record.linkedIndicators)) {
    const mappedIds = new Set<string>();
    for (const mapping of record.linkedIndicators) {
      if (!mapping.indicatorId || typeof mapping.indicatorId !== 'string') {
        errors.push('Linked indicator mapping is missing an indicator ID.');
        continue;
      }

      if (!canonicalIds.has(mapping.indicatorId)) {
        errors.push(`Unknown indicator ID: "${mapping.indicatorId}". Must exist in canonical standard.`);
      }

      if (mappedIds.has(mapping.indicatorId)) {
        warnings.push(`Duplicate indicator mapping for "${mapping.indicatorId}".`);
      }
      mappedIds.add(mapping.indicatorId);
    }
  }

  // 6. Five-Why Root Cause validation
  if (record.rootCause && record.rootCause.steps) {
    const steps = record.rootCause.steps;
    if (steps.length > 5) {
      errors.push('Five-Why analysis cannot exceed 5 steps.');
    }

    const whyNumbers = new Set<number>();
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (typeof step.whyNumber !== 'number' || step.whyNumber < 1 || step.whyNumber > 5) {
        errors.push(`Invalid why number: ${step.whyNumber}. Must be an integer between 1 and 5.`);
      } else {
        if (whyNumbers.has(step.whyNumber)) {
          errors.push(`Duplicate Five-Why step number detected: ${step.whyNumber}.`);
        }
        whyNumbers.add(step.whyNumber);
      }

      if (step.whyNumber !== i + 1) {
        warnings.push(`Five-Why step at index ${i} has whyNumber ${step.whyNumber} (expected ${i + 1}).`);
      }
    }
  }

  // 7. Corrective Actions validation
  if (record.correctiveActions && Array.isArray(record.correctiveActions)) {
    const actionIds = new Set<string>();
    for (let i = 0; i < record.correctiveActions.length; i++) {
      const act = record.correctiveActions[i];
      if (!act.id || typeof act.id !== 'string') {
        errors.push(`Corrective action at index ${i} is missing a required ID.`);
      } else {
        if (actionIds.has(act.id)) {
          errors.push(`Duplicate corrective action ID detected: "${act.id}".`);
        }
        actionIds.add(act.id);
      }

      if (!VALID_ACTION_STATUSES.includes(act.status)) {
        errors.push(`Invalid corrective action status: "${act.status}". Allowed: ${VALID_ACTION_STATUSES.join(', ')}.`);
      }
      if (act.dueDate && isNaN(Date.parse(act.dueDate))) {
        errors.push(`Corrective action "${act.id || i}" has an invalid due date.`);
      }
      if (act.completedDate && isNaN(Date.parse(act.completedDate))) {
        errors.push(`Corrective action "${act.id || i}" has an invalid completion date.`);
      }
    }
  }

  // 8. Re-audit Plan validation
  if (record.reauditPlan) {
    const plan = record.reauditPlan;
    if (!VALID_REAUDIT_STATUSES.includes(plan.status)) {
      errors.push(`Invalid re-audit status: "${plan.status}". Allowed: ${VALID_REAUDIT_STATUSES.join(', ')}.`);
    }
    if (plan.plannedDate && isNaN(Date.parse(plan.plannedDate))) {
      errors.push('Re-audit plan has an invalid planned date.');
    }
    if (plan.linkedIndicatorIds && Array.isArray(plan.linkedIndicatorIds)) {
      for (const id of plan.linkedIndicatorIds) {
        if (!canonicalIds.has(id)) {
          errors.push(`Re-audit plan references unknown indicator ID: "${id}".`);
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Deterministically sorts timeline events chronologically (ascending by timestamp).
 * Uses event ID as a stable tie-breaker for events sharing the exact same timestamp.
 */
export function sortTimelineEvents(
  events: readonly IncidentTimelineEvent[]
): IncidentTimelineEvent[] {
  return [...events].sort((a, b) => {
    const timeA = Date.parse(a.timestamp);
    const timeB = Date.parse(b.timestamp);
    if (timeA !== timeB) {
      return timeA - timeB;
    }
    return a.id.localeCompare(b.id);
  });
}

/**
 * Deterministically sorts incident records by intake timestamp.
 * Uses incident ID as a stable tie-breaker.
 */
export function sortIncidentRecords(
  records: readonly IncidentRecord[],
  order: 'desc' | 'asc' = 'desc'
): IncidentRecord[] {
  return [...records].sort((a, b) => {
    const timeA = Date.parse(a.intake.timestamp);
    const timeB = Date.parse(b.intake.timestamp);
    if (timeA !== timeB) {
      return order === 'desc' ? timeB - timeA : timeA - timeB;
    }
    return a.id.localeCompare(b.id);
  });
}

/**
 * Derives workflow progress across the roadmap's 6 stages:
 * Intake -> Timeline -> Indicator Mapping -> 5-Why -> Actions -> Re-Audit
 * 
 * IMPORTANT: This reflects audit documentation progress only;
 * it does NOT imply clinical resolution or safety efficacy.
 */
export function deriveIncidentProgress(record: IncidentRecord): IncidentProgress {
  const intakeComplete = Boolean(
    record.intake &&
      record.intake.title.trim().length > 0 &&
      record.intake.summary.trim().length > 0 &&
      record.intake.reporterId.trim().length > 0
  );

  const timelineComplete = Array.isArray(record.timeline) && record.timeline.length > 0;
  const indicatorMappingPresent =
    Array.isArray(record.linkedIndicators) && record.linkedIndicators.length > 0;
  const rootCausePresent =
    Boolean(record.rootCause && record.rootCause.steps.length > 0 && record.rootCause.status === 'completed');
  const correctiveActionsPresent =
    Array.isArray(record.correctiveActions) && record.correctiveActions.length > 0;
  const reauditPlanPresent = Boolean(
    record.reauditPlan &&
      (record.reauditPlan.plannedDate !== undefined || record.reauditPlan.status !== 'not_scheduled')
  );
  const isClosed = record.status === 'closed';

  let completedStepCount = 0;
  if (intakeComplete) completedStepCount++;
  if (timelineComplete) completedStepCount++;
  if (indicatorMappingPresent) completedStepCount++;
  if (rootCausePresent) completedStepCount++;
  if (correctiveActionsPresent) completedStepCount++;
  if (reauditPlanPresent) completedStepCount++;

  const totalStepCount = 6;
  const percentComplete = Math.round((completedStepCount / totalStepCount) * 100);

  return {
    intakeComplete,
    timelineComplete,
    indicatorMappingPresent,
    rootCausePresent,
    correctiveActionsPresent,
    reauditPlanPresent,
    isClosed,
    completedStepCount,
    totalStepCount,
    percentComplete,
  };
}

/**
 * Pure filtering for incident records based on search query, status, and linked indicator.
 */
export function filterIncidentRecords(
  records: readonly IncidentRecord[],
  filters: IncidentFilterOptions
): IncidentRecord[] {
  let result = [...records];

  if (filters.status && filters.status !== 'all') {
    result = result.filter((r) => r.status === filters.status);
  }

  if (filters.indicatorId && filters.indicatorId.trim().length > 0) {
    const targetId = filters.indicatorId.trim();
    result = result.filter((r) =>
      r.linkedIndicators.some((li) => li.indicatorId === targetId)
    );
  }

  if (filters.dateFrom) {
    const fromMs = Date.parse(filters.dateFrom);
    if (!isNaN(fromMs)) {
      result = result.filter((r) => Date.parse(r.intake.timestamp) >= fromMs);
    }
  }

  if (filters.dateTo) {
    const toMs = Date.parse(filters.dateTo);
    if (!isNaN(toMs)) {
      result = result.filter((r) => Date.parse(r.intake.timestamp) <= toMs);
    }
  }

  if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
    const q = filters.searchQuery.toLowerCase().trim();
    result = result.filter((r) => {
      const matchId = r.id.toLowerCase().includes(q);
      const matchTitle = r.intake.title.toLowerCase().includes(q);
      const matchSummary = r.intake.summary.toLowerCase().includes(q);
      const matchDesc = r.intake.description.toLowerCase().includes(q);
      const matchLoc = r.intake.location ? r.intake.location.toLowerCase().includes(q) : false;
      return matchId || matchTitle || matchSummary || matchDesc || matchLoc;
    });
  }

  return sortIncidentRecords(result, 'desc');
}

/**
 * Look up an incident record by ID.
 */
export function getIncidentById(
  records: readonly IncidentRecord[],
  id: string
): IncidentRecord | null {
  return records.find((r) => r.id === id) ?? null;
}

/**
 * Prepares print-friendly one-page view data structure.
 */
export function createIncidentPrintViewData(
  record: IncidentRecord,
  standard: Standard = CANONICAL_STANDARD,
  referenceTimestamp = '2026-01-01T00:00:00.000Z'
): IncidentPrintViewData {
  const sortedTimeline = sortTimelineEvents(record.timeline);
  const progress = deriveIncidentProgress(record);

  // Look up indicator metadata from canonical standard
  const canonicalMap = new Map<string, { name: string; pillarId: string }>();
  if (standard && Array.isArray(standard.indicators)) {
    for (const ind of standard.indicators) {
      canonicalMap.set(ind.id, { name: ind.name, pillarId: ind.pillarId });
    }
  }

  const enrichedIndicators = record.linkedIndicators.map((li) => {
    const meta = canonicalMap.get(li.indicatorId);
    return {
      indicatorId: li.indicatorId,
      indicatorName: meta?.name,
      pillarId: meta?.pillarId,
      reason: li.reason,
      evidenceReference: li.evidenceReference,
    };
  });

  return {
    incidentSummary: {
      id: record.id,
      title: record.intake.title,
      timestamp: record.intake.timestamp,
      status: record.status,
      location: record.intake.location,
      reporterId: record.intake.reporterId,
      summary: record.intake.summary,
      description: record.intake.description,
    },
    timeline: sortedTimeline,
    linkedIndicators: enrichedIndicators,
    rootCause: {
      steps: record.rootCause.steps,
      rootCauseSummary: record.rootCause.rootCauseSummary,
      status: record.rootCause.status,
    },
    correctiveActions: record.correctiveActions,
    reauditPlan: record.reauditPlan,
    status: record.status,
    progress,
    disclaimer: `${INCIDENT_SAFE_HARBOR_DISCLAIMER} ${INCIDENT_SIMULATED_DISCLOSURE}`,
    datasetType: 'SIMULATED',
    isSimulated: true,
    printedAt: referenceTimestamp,
  };
}

/**
 * Creates the top-level Incident View Model.
 */
export function createIncidentViewModel(
  records: readonly IncidentRecord[] = getSimulatedIncidentRecords(),
  activeId?: string,
  filters: IncidentFilterOptions = {}
): IncidentViewModel {
  const filtered = filterIncidentRecords(records, filters);
  const activeRecord = activeId ? getIncidentById(records, activeId) : filtered[0] ?? null;

  return {
    records: filtered,
    activeRecord,
    totalCount: records.length,
    filteredCount: filtered.length,
    filterOptions: filters,
    datasetType: 'SIMULATED',
    isSimulated: true,
    disclaimer: INCIDENT_SAFE_HARBOR_DISCLAIMER,
  };
}

/**
 * Deterministic mock synthetic incident records for workflow testing.
 * All records strictly tagged as SIMULATED.
 */
export function getSimulatedIncidentRecords(): IncidentRecord[] {
  return [
    {
      id: 'INC-2026-001',
      intake: {
        id: 'INC-2026-001',
        timestamp: '2026-01-15T08:30:00.000Z',
        title: 'Telemetry Stream Latency Spike During Shift Handoff',
        summary: 'Synthetic telemetry feed showed an irregular delay exceeding the 30-second target interval.',
        location: 'Telemetry Ward A - Hub 2',
        reporterId: 'AUD-001',
        description: 'During a simulated shift handoff, the real-time observation pipeline recorded a 45-second latency spike.',
        status: 'analysis',
        isSimulated: true,
      },
      status: 'analysis',
      timeline: [
        {
          id: 'EVT-001',
          timestamp: '2026-01-15T08:15:00.000Z',
          title: 'Simulated Shift Change Commenced',
          type: 'observation',
          authorId: 'AUD-001',
          notes: 'Standard staff handoff started.',
          isSimulated: true,
        },
        {
          id: 'EVT-002',
          timestamp: '2026-01-15T08:25:00.000Z',
          title: 'Buffer Queue Threshold Warning',
          type: 'alert',
          authorId: 'SYS-AUDIT',
          notes: 'Queue depth increased past nominal watermark.',
          isSimulated: true,
        },
        {
          id: 'EVT-003',
          timestamp: '2026-01-15T08:30:00.000Z',
          title: 'Latency Threshold Breach Logged',
          type: 'system',
          authorId: 'SYS-AUDIT',
          notes: 'Latency reached 45 seconds.',
          isSimulated: true,
        },
      ],
      linkedIndicators: [
        {
          indicatorId: 'PMI-01',
          reason: 'Telemetry Latency indicator threshold was exceeded during the event.',
          evidenceReference: 'LOG-TEL-20260115',
          isSimulated: true,
        },
      ],
      rootCause: {
        steps: [
          {
            whyNumber: 1,
            question: 'Why did the telemetry display show stale measurements?',
            answer: 'The client buffering queue backed up during the handoff period.',
          },
          {
            whyNumber: 2,
            question: 'Why did the client buffering queue back up?',
            answer: 'Network socket reconnection coincided with workstation authentication reload.',
          },
          {
            whyNumber: 3,
            question: 'Why did authentication reload during telemetry transmission?',
            answer: 'Session timeout rules forced an unannounced credential refresh.',
          },
        ],
        rootCauseSummary: 'Session timeout configuration lacks grace periods for active telemetry sessions.',
        status: 'in_progress',
        isSimulated: true,
      },
      correctiveActions: [
        {
          id: 'ACT-001',
          description: 'Update session refresh grace interval to preserve WebSocket continuity.',
          assigneeId: 'SEC-TEAM',
          dueDate: '2026-02-01T00:00:00.000Z',
          status: 'in_progress',
          isSimulated: true,
        },
      ],
      reauditPlan: {
        plannedDate: '2026-02-15T00:00:00.000Z',
        scope: 'Evaluate PMI-01 continuous latency across three simulated handoffs.',
        linkedIndicatorIds: ['PMI-01'],
        responsibleAuditorId: 'AUD-001',
        status: 'scheduled',
        isSimulated: true,
      },
      datasetType: 'SIMULATED',
      isSimulated: true,
      createdAt: '2026-01-15T08:35:00.000Z',
      updatedAt: '2026-01-15T09:00:00.000Z',
    },
    {
      id: 'INC-2026-002',
      intake: {
        id: 'INC-2026-002',
        timestamp: '2026-01-20T14:00:00.000Z',
        title: 'Biometric Sensor Calibration Expiry Overlook',
        summary: 'A simulated physiological monitor operated past its recommended calibration cycle.',
        location: 'Equipment Bay West',
        reporterId: 'AUD-002',
        description: 'Audit spot-check identified DEV-004 operational 5 days past configured maintenance date.',
        status: 'actions_pending',
        isSimulated: true,
      },
      status: 'actions_pending',
      timeline: [
        {
          id: 'EVT-101',
          timestamp: '2026-01-15T00:00:00.000Z',
          title: 'Scheduled Maintenance Due Date Reached',
          type: 'system',
          authorId: 'SYS-MAINT',
          notes: 'Maintenance due marker reached.',
          isSimulated: true,
        },
        {
          id: 'EVT-102',
          timestamp: '2026-01-20T13:45:00.000Z',
          title: 'Routine Audit Inspection Conducted',
          type: 'review',
          authorId: 'AUD-002',
          notes: 'Auditor flagged overdue calibration sticker.',
          isSimulated: true,
        },
      ],
      linkedIndicators: [
        {
          indicatorId: 'EEH-01',
          reason: 'Biomedical sensor lifecycle calibration maintenance check failed.',
          evidenceReference: 'CAL-DEV-004-LOG',
          isSimulated: true,
        },
      ],
      rootCause: {
        steps: [
          {
            whyNumber: 1,
            question: 'Why was the device not removed for recalibration?',
            answer: 'Automated notification was routed to a legacy email distribution list.',
          },
          {
            whyNumber: 2,
            question: 'Why was the distribution list outdated?',
            answer: 'Departmental reorganization altered equipment supervisor routing.',
          },
          {
            whyNumber: 3,
            question: 'Why was the routing not updated in the equipment register?',
            answer: 'Equipment register lacks an annual contact verification checkpoint.',
          },
        ],
        rootCauseSummary: 'Maintenance notification routing failed due to unverified distribution list.',
        status: 'completed',
        isSimulated: true,
      },
      correctiveActions: [
        {
          id: 'ACT-101',
          description: 'Recalibrate DEV-004 and verify sensor tolerances.',
          assigneeId: 'BIOMED-TECH-01',
          dueDate: '2026-01-22T00:00:00.000Z',
          status: 'completed',
          completedDate: '2026-01-21T16:00:00.000Z',
          verificationNotes: 'Calibration certified in synthetic test harness.',
          isSimulated: true,
        },
        {
          id: 'ACT-102',
          description: 'Configure direct dashboard notification for maintenance due warnings.',
          assigneeId: 'ADMIN-OPS',
          dueDate: '2026-02-05T00:00:00.000Z',
          status: 'in_progress',
          isSimulated: true,
        },
      ],
      reauditPlan: {
        plannedDate: '2026-02-20T00:00:00.000Z',
        scope: 'Inspect calibration statuses across all registered EEH-01 equipment.',
        linkedIndicatorIds: ['EEH-01'],
        responsibleAuditorId: 'AUD-002',
        status: 'scheduled',
        isSimulated: true,
      },
      datasetType: 'SIMULATED',
      isSimulated: true,
      createdAt: '2026-01-20T14:10:00.000Z',
      updatedAt: '2026-01-21T16:30:00.000Z',
    },
  ];
}
