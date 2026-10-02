/**
 * CareProof Audit Console - Canonical Standard Domain Types
 * Single source of truth: src/data/standard.json
 * 
 * Strict, extensible domain types representing the CareProof standard:
 * Standard, Pillar, Indicator, ThresholdBand, EvidenceType, Reference
 */

// Roadmap Evidence Classification: E = Established, I = Interpretation, P = Proposed
export type EvidenceType = 'E' | 'I' | 'P';
export type EvidenceClassification = EvidenceType;

// Roadmap Threshold Band Levels: Meets, Partial, Fails
export type BandLevel = 'Meets' | 'Partial' | 'Fails';

export interface ThresholdBand {
  level: BandLevel;
  threshold?: number;
  label?: string;
  description?: string;
  lowerBound?: number | null;
  upperBound?: number | null;
}

export interface Reference {
  id: string;
  title: string;
  citation?: string;
  sourceUrl?: string;
  publicationYear?: number;
}

export interface Pillar {
  id: string;
  name: string;
  description: string;
  ordering: number;
  weight: number;
  leadAuditorRole?: string;
}

export type PillarDefinition = Pillar;

export interface ThresholdConfig {
  pass: number;
  warning: number;
  fail: number;
}

export type MetricType = 'percentage' | 'rate' | 'scale' | 'boolean';

export interface Indicator {
  id: string;
  pillarId: string;
  name: string;
  definition: string;
  dataSource: string;
  bands: ThresholdBand[];
  weight: number;
  critical: boolean;
  evidence: EvidenceType;
  refs: Reference[];

  // Compatibility fields for existing application code and tests
  code: string;
  isCritical: boolean;
  evidenceClassification: EvidenceClassification;
  description: string;
  guidance: string;
  thresholds: ThresholdConfig;
  unit: string;
  metricType: MetricType;
  safetyGateCap: string | null;
  isLowerBetter?: boolean;
}

export type IndicatorDefinition = Indicator;

export interface StandardMetadata {
  description?: string;
  effectiveDate?: string;
  frameworkStatus?: string;
  clinicalScope?: string;
  evidencePolicy?: string;
  references?: Reference[];
}

export interface StandardDisclaimer {
  frameworkStatus: string;
  clinicalScope: string;
  evidencePolicy: string;
}

export type AuditTierId = 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4';

export interface TierDefinition {
  tier: AuditTierId;
  name: string;
  minCompositeScore: number;
  minCoveragePercent: number;
  requiresSafetyGateClear: boolean;
  badgeClass: string;
  description: string;
}

export interface Standard {
  version: string;
  name: string;
  pillars: Pillar[];
  indicators: Indicator[];
  metadata?: StandardMetadata;

  // Compatibility fields for existing scoring engine
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
}

export type CareProofStandard = Standard;

// --- Supporting Scoring Engine Types (Preserved for compatibility) ---

export type PerformanceBand = 'pass' | 'warning' | 'fail' | 'not_assessed';
export type AssessmentStatus = 'assessed' | 'not_assessed' | 'exempt';

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
  evaluatedScore: number;
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
  rawPillarScore: number;
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
