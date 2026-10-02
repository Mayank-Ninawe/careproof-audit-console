/**
 * CareProof Audit Console - Scoring Engine Domain Types
 * Source of Truth: CareProof Website Roadmap & Canonical Standard Model
 * 
 * Pure, deterministic scoring types for indicator assessment, pillar aggregation,
 * coverage gating, and safety gate evaluation.
 */

import { Indicator, Pillar, AssessmentStatus } from './standard';

// Roadmap discrete scoring levels
export type DiscreteBand = 'Meets' | 'Partial' | 'Fails';

/**
 * Input representation of an indicator's assessment state.
 */
export interface IndicatorAssessmentInput {
  indicatorId: string;
  band?: DiscreteBand | null;
  status?: AssessmentStatus;
  measuredValue?: number | null;
}

/**
 * Supported assessment input structures:
 * - Map of indicatorId -> band string ('Meets' | 'Partial' | 'Fails')
 * - Map of indicatorId -> IndicatorAssessmentInput
 * - Array of IndicatorAssessmentInput
 */
export type IndicatorAssessments =
  | Record<string, DiscreteBand | IndicatorAssessmentInput | null | undefined>
  | IndicatorAssessmentInput[];

/**
 * Result of evaluating an individual indicator.
 */
export interface IndicatorScoringResult {
  indicatorId: string;
  pillarId: string;
  name: string;
  weight: number;
  critical: boolean;
  status: AssessmentStatus;
  band: DiscreteBand | null;
  score: number | null; // 100 for Meets, 50 for Partial, 0 for Fails; null if not assessed
}

/**
 * Result of aggregating indicator scores within a pillar.
 */
export interface PillarScoringResult {
  pillarId: string;
  name: string;
  weight: number;
  status: AssessmentStatus;
  score: number | null; // Weighted mean of assessed indicators, or null if none assessed
  assessedIndicatorCount: number;
  totalIndicatorCount: number;
  assessedWeight: number;
  totalWeight: number;
  indicatorIds: string[];
}

// Proposed framework tier levels (configurable, non-clinically validated)
export type ProposedTier = 'Hospital-Grade' | 'Approaching' | 'Conditional' | 'Not met';
export type TierName = ProposedTier | string;

/**
 * Configurable tier boundary definition.
 */
export interface TierThresholdConfig {
  name: TierName;
  minScore: number;
}

/**
 * Configurable options for the scoring engine.
 */
export interface ScoringConfig {
  tiers?: TierThresholdConfig[];
  minCoverageForTier?: number; // Default: 80%
  safetyGateCapTier?: TierName; // Default: 'Conditional'
  roundToDecimals?: number;    // Default: 2 (applied at result boundary)
}

/**
 * Comprehensive result returned by computeAuditScore.
 */
export interface AuditScoringResult {
  overallScore: number | null;         // Weighted mean of pillar scores (null if no pillars assessed)
  coverage: number;                    // (assessed indicators / total indicators) * 100
  tier: TierName | null;               // Assigned tier (null if coverage < 80%)
  calculatedTier: TierName | null;     // Uncapped tier based on numerical score (null if coverage < 80%)
  finalTier: TierName | null;          // Final tier after applying Safety Gate (null if coverage < 80%)
  coverageGatePassed: boolean;         // True if coverage >= minCoverage (80%)
  safetyGateTriggered: boolean;        // True if any critical indicator scored 'Fails'
  safetyGateIndicators: string[];      // IDs of critical indicators triggering the Safety Gate
  coverageReason?: string;             // Informative message when tier assignment is suppressed by coverage
  pillarResults: Record<string, PillarScoringResult>;
  indicatorResults: Record<string, IndicatorScoringResult>;
  notAssessedIndicators: string[];     // IDs of indicators that were not assessed
}

/**
 * Full inputs required by the pure scoring engine.
 */
export interface ScoringEngineInput {
  indicators: Indicator[];
  pillars: Pillar[];
  assessments: IndicatorAssessments;
  config?: ScoringConfig;
}
