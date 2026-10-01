/**
 * CareProof Audit Console - Canonical Domain & Standard Types
 * Source of Truth: standard.json
 */

export type EvidenceClassification = 'E' | 'I' | 'P';

export type MetricType = 'percentage' | 'rate' | 'scale' | 'boolean';

export type AuditTierId = 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4';

export type PerformanceBand = 'pass' | 'warning' | 'fail' | 'not_assessed';

export type AssessmentStatus = 'assessed' | 'not_assessed' | 'exempt';

export interface ThresholdConfig {
  pass: number;
  warning: number;
  fail: number;
}

export interface IndicatorDefinition {
  id: string;
  pillarId: string;
  code: string;
  name: string;
  evidenceClassification: EvidenceClassification;
  isCritical: boolean;
  weight: number;
  metricType: MetricType;
  unit: string;
  thresholds: ThresholdConfig;
  isLowerBetter?: boolean;
  safetyGateCap: string | null;
  dataSource: string;
  description: string;
  guidance: string;
}

export interface PillarDefinition {
  id: string;
  name: string;
  weight: number;
  description: string;
  leadAuditorRole: string;
}

export interface TierDefinition {
  tier: AuditTierId;
  name: string;
  minCompositeScore: number;
  minCoveragePercent: number;
  requiresSafetyGateClear: boolean;
  badgeClass: string;
  description: string;
}

export interface StandardDisclaimer {
  frameworkStatus: string;
  clinicalScope: string;
  evidencePolicy: string;
}

export interface CareProofStandard {
  standardVersion: string;
  standardName: string;
  effectiveDate: string;
  disclaimer: StandardDisclaimer;
  tierDefinitions: TierDefinition[];
  confidenceThresholds: {
    high: { minCoverage: number; minEstablishedWeightRatio: number };
    medium: { minCoverage: number; minEstablishedWeightRatio: number };
    low: { minCoverage: number; minEstablishedWeightRatio: number };
  };
  pillars: PillarDefinition[];
  indicators: IndicatorDefinition[];
}

export interface IndicatorAssessment {
  indicatorId: string;
  status: AssessmentStatus;
  measuredValue: number | null;
  notes?: string;
  lastAuditedAt?: string;
  auditorName?: string;
}

export interface EvaluatedIndicatorScore {
  indicatorId: string;
  code: string;
  name: string;
  evidenceClassification: EvidenceClassification;
  isCritical: boolean;
  weight: number;
  measuredValue: number | null;
  unit: string;
  evaluatedScore: number; // 0 - 100
  band: PerformanceBand;
  status: AssessmentStatus;
  dataSource: string;
  isLowerBetter?: boolean;
  safetyGateCap: string | null;
  guidance: string;
  notes?: string;
}

export interface PillarScoreResult {
  pillarId: string;
  pillarName: string;
  pillarWeight: number;
  assessedIndicatorsCount: number;
  totalIndicatorsCount: number;
  assessedWeight: number;
  totalWeight: number;
  coveragePercent: number;
  rawPillarScore: number; // 0 - 100
  weightedContribution: number;
  indicatorScores: EvaluatedIndicatorScore[];
}

export interface SafetyGateViolation {
  indicatorId: string;
  code: string;
  name: string;
  measuredValue: number | null;
  thresholdPass: number;
  thresholdFail: number;
  unit: string;
  safetyGateCap: string;
  dataSource: string;
  reason: string;
}

export interface SafetyGateResult {
  tripped: boolean;
  trippedCount: number;
  maxAchievableTier: AuditTierId;
  violations: SafetyGateViolation[];
}

export type ConfidenceLevel = 'High' | 'Medium' | 'Low';

export interface ConfidenceResult {
  level: ConfidenceLevel;
  coveragePercent: number;
  establishedWeightRatio: number;
  totalAssessedWeight: number;
  totalPossibleWeight: number;
  explanation: string;
}

export interface AuditScoreSummary {
  totalIndicators: number;
  assessedIndicators: number;
  notAssessedIndicators: number;
  criticalTotal: number;
  criticalPassed: number;
  criticalFailed: number;
  passCount: number;
  warningCount: number;
  failCount: number;
}

export interface AuditScoreResult {
  compositeScore: number;
  assignedTier: AuditTierId;
  tierDetails: TierDefinition;
  tierCappedBySafetyGate: boolean;
  uncappedTier: AuditTierId;
  safetyGate: SafetyGateResult;
  confidence: ConfidenceResult;
  pillarScores: Record<string, PillarScoreResult>;
  summary: AuditScoreSummary;
  evaluatedAt: string;
}

export interface FacilityAuditRecord {
  id: string;
  facilityName: string;
  facilityId: string;
  facilityType: string;
  departmentOrUnit: string;
  leadAuditor: string;
  auditDate: string;
  auditScope: string;
  isSimulated: boolean;
  simulationSeed?: number;
  assessments: Record<string, IndicatorAssessment>;
  scoreResult?: AuditScoreResult;
  auditNotes?: string;
}
