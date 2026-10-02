/**
 * CareProof Audit Console - Pure Deterministic Scoring Engine
 * Source of Truth: CareProof Website Roadmap & Canonical Standard Model
 * 
 * DESIGN CONSTRAINTS & PRINCIPLES:
 * 1. Pure & Deterministic: Same inputs always produce identical outputs with zero side effects.
 * 2. Fully Decoupled: Independent of React, Firebase, DOM, and browser storage APIs.
 * 3. Configuration-Driven: Does not hardcode clinical assumptions or indicator definitions.
 * 4. Precision Policy: Intermediate calculations maintain full IEEE-754 64-bit floating-point
 *    precision. Rounding is applied strictly at the presentation/result boundary to avoid
 *    cumulative truncation distortion.
 * 
 * CLINICAL GOVERNANCE & ARCHITECTURAL NOTES:
 * - Why Not Assessed indicators are excluded:
 *   Missing or unassessed indicators reflect missing audit observations, not confirmed clinical
 *   deficiencies. Treating unassessed indicators as zero would falsely penalize facilities for
 *   scope limitations rather than measured non-compliance. Instead, unassessed indicators reduce
 *   audit Coverage.
 * - Why Coverage below 80% prevents Tier assignment:
 *   A composite tier rating represents comprehensive organizational standing. When fewer than 80%
 *   of applicable indicators are verified, the evidence base is statistically insufficient to
 *   confer an audit tier. In this case, tier is null with an explicit coverage status rather than
 *   "Not met".
 * - Why the Safety Gate caps Tier rather than changing numerical score:
 *   The Safety Gate isolates critical life-safety breaches (e.g., failed resuscitation equipment checks).
 *   The numerical score remains mathematically transparent (e.g., 92.5%), preserving auditor audit
 *   trail integrity, while the achieved standing is capped at "Conditional" to prevent high performance
 *   in routine areas from masking life-safety hazards.
 * - Why Tier thresholds are configurable/proposed:
 *   Thresholds (>=85 Hospital-Grade, 70-84 Approaching, 50-69 Conditional, <50 Not met) are proposed
 *   quality governance benchmarks under pilot evaluation. They are not hardcoded or claimed as
 *   medically validated standards.
 */

import { Indicator, Pillar } from '../types/standard';
import {
  AuditScoringResult,
  DiscreteBand,
  IndicatorAssessmentInput,
  IndicatorAssessments,
  IndicatorScoringResult,
  PillarScoringResult,
  ScoringConfig,
  TierName,
  TierThresholdConfig,
} from '../types/scoring';

/**
 * Proposed roadmap tier configuration.
 * Treated as configurable framework parameters, not clinically validated constants.
 */
export const DEFAULT_PROPOSED_TIER_CONFIG: TierThresholdConfig[] = [
  { name: 'Hospital-Grade', minScore: 85 },
  { name: 'Approaching', minScore: 70 },
  { name: 'Conditional', minScore: 50 },
  { name: 'Not met', minScore: 0 },
];

export const DEFAULT_MIN_COVERAGE_PERCENT = 80;
export const DEFAULT_SAFETY_GATE_CAP_TIER: TierName = 'Conditional';
export const DEFAULT_ROUNDING_DECIMALS = 2;

const VALID_DISCRETE_BANDS: readonly DiscreteBand[] = ['Meets', 'Partial', 'Fails'];

/**
 * Rounds a number to a specified number of decimal places for final presentation.
 */
export function roundToDecimals(value: number, decimals = DEFAULT_ROUNDING_DECIMALS): number {
  if (!Number.isFinite(value)) {
    return value;
  }
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Normalizes user assessment inputs into a structured lookup map.
 */
export function normalizeAssessments(
  assessments: IndicatorAssessments
): Map<string, IndicatorAssessmentInput> {
  const map = new Map<string, IndicatorAssessmentInput>();

  if (Array.isArray(assessments)) {
    for (const item of assessments) {
      if (!item || typeof item !== 'object' || !item.indicatorId) {
        throw new Error('Invalid assessment input: array item must contain a non-empty indicatorId');
      }
      map.set(item.indicatorId, item);
    }
  } else if (assessments && typeof assessments === 'object') {
    for (const [key, value] of Object.entries(assessments)) {
      if (value === null || value === undefined) {
        map.set(key, { indicatorId: key, status: 'not_assessed' });
      } else if (typeof value === 'string') {
        map.set(key, { indicatorId: key, band: value as DiscreteBand, status: 'assessed' });
      } else if (typeof value === 'object') {
        map.set(key, { ...value, indicatorId: key });
      } else {
        throw new Error(`Invalid assessment input value for indicator "${key}"`);
      }
    }
  }

  return map;
}

/**
 * Evaluator for discrete roadmap band scoring:
 * Meets = 100, Partial = 50, Fails = 0.
 * Boundary design allows pluggable continuous interpolation in future phases.
 */
export function scoreDiscreteBand(band: DiscreteBand): number {
  switch (band) {
    case 'Meets':
      return 100;
    case 'Partial':
      return 50;
    case 'Fails':
      return 0;
    default:
      throw new Error(`Invalid discrete band: "${band}". Expected "Meets", "Partial", or "Fails".`);
  }
}

/**
 * Evaluates a single indicator against its assessment.
 * Pure and side-effect free.
 */
export function evaluateIndicatorScore(
  indicator: Indicator,
  assessment?: IndicatorAssessmentInput | DiscreteBand | null
): IndicatorScoringResult {
  // Validate indicator integrity
  if (!indicator || typeof indicator !== 'object') {
    throw new Error('Indicator must be a valid object');
  }
  if (!indicator.id || typeof indicator.id !== 'string') {
    throw new Error('Indicator id must be a non-empty string');
  }
  if (typeof indicator.weight !== 'number' || isNaN(indicator.weight) || indicator.weight <= 0) {
    throw new Error(`Indicator "${indicator.id}" has invalid weight: ${indicator.weight}. Weight must be a positive number.`);
  }

  const isCritical = indicator.critical !== undefined ? indicator.critical : !!indicator.isCritical;

  // Resolve assessment input
  let parsedAssessment: IndicatorAssessmentInput | null = null;
  if (typeof assessment === 'string') {
    parsedAssessment = { indicatorId: indicator.id, band: assessment as DiscreteBand, status: 'assessed' };
  } else if (assessment && typeof assessment === 'object') {
    parsedAssessment = assessment;
  }

  // Not Assessed Handling: Excluded from score calculation, score remains null
  if (
    !parsedAssessment ||
    parsedAssessment.status === 'not_assessed' ||
    parsedAssessment.band === null ||
    parsedAssessment.band === undefined
  ) {
    return {
      indicatorId: indicator.id,
      pillarId: indicator.pillarId,
      name: indicator.name,
      weight: indicator.weight,
      critical: isCritical,
      status: 'not_assessed',
      band: null,
      score: null,
    };
  }

  // Validate supplied band level
  const band = parsedAssessment.band;
  if (!VALID_DISCRETE_BANDS.includes(band)) {
    throw new Error(
      `Indicator "${indicator.id}" received invalid band "${band}". Valid bands are: ${VALID_DISCRETE_BANDS.join(', ')}.`
    );
  }

  const score = scoreDiscreteBand(band);

  return {
    indicatorId: indicator.id,
    pillarId: indicator.pillarId,
    name: indicator.name,
    weight: indicator.weight,
    critical: isCritical,
    status: 'assessed',
    band,
    score,
  };
}

/**
 * Calculates the weighted score for a single pillar from evaluated indicator results.
 * Formula: sum(indicatorScore * weight) / sum(weight) for assessed indicators.
 * If no indicators are assessed, returns status: 'not_assessed', score: null.
 */
export function calculatePillarScore(
  pillar: Pillar,
  indicators: Indicator[],
  indicatorResults: Record<string, IndicatorScoringResult>
): PillarScoringResult {
  if (!pillar || typeof pillar !== 'object' || !pillar.id) {
    throw new Error('Pillar must be a valid object with a non-empty id');
  }
  if (typeof pillar.weight !== 'number' || isNaN(pillar.weight) || pillar.weight <= 0) {
    throw new Error(`Pillar "${pillar.id}" has invalid weight: ${pillar.weight}. Weight must be a positive number.`);
  }

  const pillarIndicators = indicators.filter(ind => ind.pillarId === pillar.id);
  if (pillarIndicators.length === 0) {
    throw new Error(`Pillar "${pillar.id}" contains no associated indicators in standard.`);
  }

  let assessedScoreWeightSum = 0;
  let assessedWeightSum = 0;
  let totalWeight = 0;
  let assessedCount = 0;
  const indicatorIds: string[] = [];

  for (const ind of pillarIndicators) {
    indicatorIds.push(ind.id);
    totalWeight += ind.weight;

    const res = indicatorResults[ind.id];
    if (!res) {
      throw new Error(`Missing evaluated result for indicator "${ind.id}" in pillar "${pillar.id}"`);
    }

    if (res.status === 'assessed' && res.score !== null) {
      assessedScoreWeightSum += res.score * ind.weight;
      assessedWeightSum += ind.weight;
      assessedCount++;
    }
  }

  if (assessedCount === 0 || assessedWeightSum === 0) {
    return {
      pillarId: pillar.id,
      name: pillar.name,
      weight: pillar.weight,
      status: 'not_assessed',
      score: null,
      assessedIndicatorCount: 0,
      totalIndicatorCount: pillarIndicators.length,
      assessedWeight: 0,
      totalWeight,
      indicatorIds,
    };
  }

  // Exact unrounded intermediate score
  const rawPillarScore = assessedScoreWeightSum / assessedWeightSum;

  return {
    pillarId: pillar.id,
    name: pillar.name,
    weight: pillar.weight,
    status: 'assessed',
    score: rawPillarScore,
    assessedIndicatorCount: assessedCount,
    totalIndicatorCount: pillarIndicators.length,
    assessedWeight: assessedWeightSum,
    totalWeight,
    indicatorIds,
  };
}

/**
 * Calculates the overall weighted score across all pillars.
 * Formula: sum(pillarScore * pillarWeight) / sum(pillarWeight) for assessed pillars.
 * Caller explicitly supplies the pillar configurations.
 */
export function calculateOverallScore(
  pillars: Pillar[],
  pillarResults: Record<string, PillarScoringResult>
): number | null {
  if (!Array.isArray(pillars) || pillars.length === 0) {
    throw new Error('Pillars array cannot be empty');
  }

  let totalScoreWeight = 0;
  let totalPillarWeight = 0;
  let assessedPillarCount = 0;

  for (const pillar of pillars) {
    const pResult = pillarResults[pillar.id];
    if (!pResult) {
      throw new Error(`Missing scoring result for pillar "${pillar.id}"`);
    }

    if (pResult.status === 'assessed' && pResult.score !== null) {
      totalScoreWeight += pResult.score * pillar.weight;
      totalPillarWeight += pillar.weight;
      assessedPillarCount++;
    }
  }

  if (assessedPillarCount === 0 || totalPillarWeight === 0) {
    return null;
  }

  return totalScoreWeight / totalPillarWeight;
}

/**
 * Calculates audit coverage percentage: (assessed indicators / total indicators) * 100.
 * Safely handles zero indicators.
 */
export function calculateCoverage(assessedCount: number, totalApplicableCount: number): number {
  if (totalApplicableCount <= 0) {
    return 0;
  }
  return (assessedCount / totalApplicableCount) * 100;
}

/**
 * Evaluates numerical tier standing against configurable boundaries.
 * Boundary comparisons are strictly numerical:
 * >= 85 -> Hospital-Grade, 70-84.99 -> Approaching, 50-69.99 -> Conditional, < 50 -> Not met.
 */
export function determineTier(
  score: number | null,
  tiers: TierThresholdConfig[] = DEFAULT_PROPOSED_TIER_CONFIG
): TierName | null {
  if (score === null || !Number.isFinite(score)) {
    return null;
  }

  // Sort descending by minScore to ensure boundary safety
  const sorted = [...tiers].sort((a, b) => b.minScore - a.minScore);

  for (const tier of sorted) {
    if (score >= tier.minScore) {
      return tier.name;
    }
  }

  return sorted[sorted.length - 1]?.name ?? null;
}

/**
 * Evaluates the Safety Gate across all indicators.
 * If ANY critical indicator scores 'Fails' (0), the Safety Gate is triggered.
 * Unassessed critical indicators do NOT trigger the Safety Gate.
 */
export function evaluateSafetyGate(
  indicators: Indicator[],
  indicatorResults: Record<string, IndicatorScoringResult>
): { triggered: boolean; failedCriticalIndicators: string[] } {
  const failedCriticalIndicators: string[] = [];

  for (const ind of indicators) {
    const isCritical = ind.critical !== undefined ? ind.critical : !!ind.isCritical;
    if (isCritical) {
      const res = indicatorResults[ind.id];
      if (res && res.status === 'assessed' && res.band === 'Fails') {
        failedCriticalIndicators.push(ind.id);
      }
    }
  }

  return {
    triggered: failedCriticalIndicators.length > 0,
    failedCriticalIndicators,
  };
}

/**
 * Pure, deterministic master scoring function.
 * 
 * Aggregates indicator assessments, computes pillar scores and overall weighted score,
 * evaluates the Coverage Gate (minimum 80%), and applies the Safety Gate cap.
 */
export function computeAuditScore(
  indicators: Indicator[],
  pillars: Pillar[],
  assessments: IndicatorAssessments,
  config: ScoringConfig = {}
): AuditScoringResult {
  // 1. Validate Input Architecture
  if (!Array.isArray(indicators) || indicators.length === 0) {
    throw new Error('Scoring engine requires a non-empty indicators array');
  }
  if (!Array.isArray(pillars) || pillars.length === 0) {
    throw new Error('Scoring engine requires a non-empty pillars array');
  }

  const pillarMap = new Map<string, Pillar>();
  let totalPillarWeight = 0;
  for (const p of pillars) {
    if (pillarMap.has(p.id)) {
      throw new Error(`Duplicate pillar ID detected: "${p.id}"`);
    }
    if (typeof p.weight !== 'number' || isNaN(p.weight) || p.weight <= 0) {
      throw new Error(`Pillar "${p.id}" has invalid weight: ${p.weight}. Weight must be positive.`);
    }
    totalPillarWeight += p.weight;
    pillarMap.set(p.id, p);
  }

  if (totalPillarWeight <= 0) {
    throw new Error('Total pillar weight must be strictly positive');
  }

  const indicatorMap = new Map<string, Indicator>();
  for (const ind of indicators) {
    if (indicatorMap.has(ind.id)) {
      throw new Error(`Duplicate indicator ID detected: "${ind.id}"`);
    }
    if (!pillarMap.has(ind.pillarId)) {
      throw new Error(`Indicator "${ind.id}" references unknown pillar "${ind.pillarId}"`);
    }
    if (typeof ind.weight !== 'number' || isNaN(ind.weight) || ind.weight <= 0) {
      throw new Error(`Indicator "${ind.id}" has invalid weight: ${ind.weight}. Weight must be positive.`);
    }
    indicatorMap.set(ind.id, ind);
  }

  // Normalize assessments and validate no unknown indicator IDs
  const assessmentMap = normalizeAssessments(assessments);
  for (const assessmentId of assessmentMap.keys()) {
    if (!indicatorMap.has(assessmentId)) {
      throw new Error(`Assessment received for unknown indicator ID: "${assessmentId}"`);
    }
  }

  const minCoverage = config.minCoverageForTier ?? DEFAULT_MIN_COVERAGE_PERCENT;
  const tiers = config.tiers ?? DEFAULT_PROPOSED_TIER_CONFIG;
  const safetyGateCapTier = config.safetyGateCapTier ?? DEFAULT_SAFETY_GATE_CAP_TIER;
  const decimals = config.roundToDecimals ?? DEFAULT_ROUNDING_DECIMALS;

  // 2. Evaluate Individual Indicators
  const indicatorResults: Record<string, IndicatorScoringResult> = {};
  const notAssessedIndicators: string[] = [];
  let assessedCount = 0;

  for (const ind of indicators) {
    const rawAssessment = assessmentMap.get(ind.id);
    const result = evaluateIndicatorScore(ind, rawAssessment);
    indicatorResults[ind.id] = result;

    if (result.status === 'assessed') {
      assessedCount++;
    } else {
      notAssessedIndicators.push(ind.id);
    }
  }

  // 3. Evaluate Pillar Scores
  const pillarResults: Record<string, PillarScoringResult> = {};
  for (const p of pillars) {
    const pResult = calculatePillarScore(p, indicators, indicatorResults);
    pillarResults[p.id] = {
      ...pResult,
      score: pResult.score !== null ? roundToDecimals(pResult.score, decimals) : null,
    };
  }

  // 4. Calculate Overall Score & Coverage
  const rawOverallScore = calculateOverallScore(pillars, pillarResults);
  const rawCoverage = calculateCoverage(assessedCount, indicators.length);

  const overallScore = rawOverallScore !== null ? roundToDecimals(rawOverallScore, decimals) : null;
  const coverage = roundToDecimals(rawCoverage, decimals);

  // 5. Evaluate Coverage Gate
  // If coverage < 80%: No tier is assigned (tier = null with reason)
  const coverageGatePassed = rawCoverage >= minCoverage;
  let coverageReason: string | undefined;
  if (!coverageGatePassed) {
    coverageReason = `Audit coverage (${coverage}%) is below the minimum threshold (${minCoverage}%) required for tier classification.`;
  }

  // 6. Evaluate Safety Gate
  const safetyGate = evaluateSafetyGate(indicators, indicatorResults);

  // 7. Determine Tiers
  let calculatedTier: TierName | null = null;
  let finalTier: TierName | null = null;

  if (coverageGatePassed && overallScore !== null) {
    // Uncapped tier purely based on numerical composite score
    calculatedTier = determineTier(overallScore, tiers);

    if (safetyGate.triggered) {
      // Find index of calculated tier and cap tier in hierarchy
      const sortedTiers = [...tiers].sort((a, b) => b.minScore - a.minScore).map(t => t.name);
      const calculatedIndex = sortedTiers.indexOf(calculatedTier ?? '');
      const capIndex = sortedTiers.indexOf(safetyGateCapTier);

      // If calculated tier is higher than Conditional (lower index = higher tier), cap it
      if (calculatedIndex !== -1 && capIndex !== -1 && calculatedIndex < capIndex) {
        finalTier = safetyGateCapTier;
      } else {
        finalTier = calculatedTier;
      }
    } else {
      finalTier = calculatedTier;
    }
  }

  return {
    overallScore,
    coverage,
    tier: finalTier,
    calculatedTier,
    finalTier,
    coverageGatePassed,
    safetyGateTriggered: safetyGate.triggered,
    safetyGateIndicators: safetyGate.failedCriticalIndicators,
    coverageReason,
    pillarResults,
    indicatorResults,
    notAssessedIndicators,
  };
}
