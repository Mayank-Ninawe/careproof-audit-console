/**
 * CareProof Audit Console - Incident Response Domain Types (Phase 11A)
 * Source of Truth: CareProof Website Roadmap (Phase 11A)
 * 
 * CORE CONTRACT:
 * 1. Application Workflow Only: Workflow statuses represent software lifecycle stages,
 *    never external medical, legal, or hospital regulatory standards.
 * 2. Zero PHI: No patient names, MRNs, addresses, or phone numbers.
 * 3. Canonical Indicator Integrity: References canonical indicators from standard.json.
 * 4. Synthetic Integrity: Tagged as SIMULATED; no real-world incident claims.
 */

export type IncidentStatus =
  | 'draft'
  | 'open'
  | 'analysis'
  | 'actions_pending'
  | 're_audit_pending'
  | 'closed';

export const VALID_INCIDENT_STATUSES: readonly IncidentStatus[] = [
  'draft',
  'open',
  'analysis',
  'actions_pending',
  're_audit_pending',
  'closed',
];

export interface IncidentIntake {
  id: string; // e.g. "INC-2026-001"
  timestamp: string; // ISO 8601 deterministic timestamp
  title: string;
  summary: string;
  location?: string; // Generic location/context e.g. "Ward 4 Telemetry Unit"
  reporterId: string; // Generic user/auditor ID e.g. "USR-001"
  description: string;
  status: IncidentStatus;
  isSimulated: true;
}

export type TimelineEventType =
  | 'observation'
  | 'alert'
  | 'action'
  | 'review'
  | 'system';

export interface IncidentTimelineEvent {
  id: string; // e.g. "EVT-001"
  timestamp: string; // ISO 8601
  title: string;
  type?: TimelineEventType;
  authorId?: string;
  notes?: string;
  isSimulated: true;
}

export interface IncidentIndicatorMapping {
  indicatorId: string; // Must exist in canonical standard.json e.g. "PMI-01"
  reason?: string; // Auditor rationale for linking
  evidenceReference?: string; // Document or ledger reference
  isSimulated: true;
}

export interface FiveWhyStep {
  whyNumber: number; // 1 to 5
  question: string;
  answer: string;
  notes?: string;
}

export type RootCauseStatus = 'not_started' | 'in_progress' | 'completed';

export interface RootCauseAnalysis {
  steps: FiveWhyStep[];
  rootCauseSummary?: string;
  status: RootCauseStatus;
  isSimulated: true;
}

export type CorrectiveActionStatus =
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export const VALID_ACTION_STATUSES: readonly CorrectiveActionStatus[] = [
  'planned',
  'in_progress',
  'completed',
  'cancelled',
];

export interface CorrectiveAction {
  id: string; // e.g. "ACT-001"
  description: string;
  assigneeId?: string; // Auditor/Staff role ID
  dueDate?: string; // ISO 8601
  status: CorrectiveActionStatus;
  completedDate?: string; // ISO 8601
  verificationNotes?: string;
  isSimulated: true;
}

export type ReauditStatus =
  | 'not_scheduled'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export const VALID_REAUDIT_STATUSES: readonly ReauditStatus[] = [
  'not_scheduled',
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
];

export interface ReauditPlan {
  plannedDate?: string; // ISO 8601
  scope?: string;
  linkedIndicatorIds: string[];
  responsibleAuditorId?: string;
  status: ReauditStatus;
  notes?: string;
  outcome?: string;
  isSimulated: true;
}

export interface IncidentRecord {
  id: string;
  intake: IncidentIntake;
  status: IncidentStatus;
  timeline: IncidentTimelineEvent[];
  linkedIndicators: IncidentIndicatorMapping[];
  rootCause: RootCauseAnalysis;
  correctiveActions: CorrectiveAction[];
  reauditPlan: ReauditPlan;
  datasetType: 'SIMULATED';
  isSimulated: true;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentValidationResult {
  isValid: boolean;
  errors: readonly string[];
  warnings: readonly string[];
}

export interface IncidentProgress {
  intakeComplete: boolean;
  timelineComplete: boolean;
  indicatorMappingPresent: boolean;
  rootCausePresent: boolean;
  correctiveActionsPresent: boolean;
  reauditPlanPresent: boolean;
  isClosed: boolean;
  completedStepCount: number;
  totalStepCount: number;
  percentComplete: number; // 0 - 100
}

export interface IncidentPrintViewData {
  incidentSummary: {
    id: string;
    title: string;
    timestamp: string;
    status: IncidentStatus;
    location?: string;
    reporterId: string;
    summary: string;
    description: string;
  };
  timeline: readonly IncidentTimelineEvent[];
  linkedIndicators: readonly {
    indicatorId: string;
    indicatorName?: string;
    pillarId?: string;
    reason?: string;
    evidenceReference?: string;
  }[];
  rootCause: {
    steps: readonly FiveWhyStep[];
    rootCauseSummary?: string;
    status: RootCauseStatus;
  };
  correctiveActions: readonly CorrectiveAction[];
  reauditPlan: ReauditPlan;
  status: IncidentStatus;
  progress: IncidentProgress;
  disclaimer: string;
  datasetType: 'SIMULATED';
  isSimulated: true;
  printedAt: string;
}

export interface IncidentFilterOptions {
  searchQuery?: string;
  status?: IncidentStatus | 'all';
  indicatorId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface IncidentViewModel {
  records: readonly IncidentRecord[];
  activeRecord: IncidentRecord | null;
  totalCount: number;
  filteredCount: number;
  filterOptions: IncidentFilterOptions;
  datasetType: 'SIMULATED';
  isSimulated: true;
  disclaimer: string;
}
