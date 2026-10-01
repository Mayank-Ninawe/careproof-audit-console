/**
 * CareProof Audit Console - Pure Deterministic Scoring Engine
 * Single Source of Truth: src/data/standard.json
 * 
 * Clinical audit decision support engine.
 * Notice: Proposed framework, not clinically validated. Decision support, not diagnosis.
 */

import standardData from '../data/standard.json';
import {
  AuditScoreResult,
  AuditTierId,
  CareProofStandard,
  ConfidenceLevel,
  ConfidenceResult,
  EvaluatedIndicatorScore,
  FacilityAuditRecord,
  IndicatorAssessment,
  IndicatorDefinition,
  PerformanceBand,
  PillarScoreResult,
  SafetyGateResult,
  SafetyGateViolation,
  TierDefinition,
} from '../types/standard';

// Export canonical standard object
export const CANONICAL_STANDARD: CareProofStandard = standardData as CareProofStandard;

/**
 * Evaluates an individual indicator against its defined thresholds.
 * Pure deterministic function.
 */
export function evaluateIndicator(
  indicator: IndicatorDefinition,
  assessment?: IndicatorAssessment
): EvaluatedIndicatorScore {
  if (!assessment || assessment.status !== 'assessed' || assessment.measuredValue === null || isNaN(assessment.measuredValue)) {
    return {
      indicatorId: indicator.id,
      code: indicator.code,
      name: indicator.name,
      evidenceClassification: indicator.evidenceClassification,
      isCritical: indicator.isCritical,
      weight: indicator.weight,
      measuredValue: null,
      unit: indicator.unit,
      evaluatedScore: 0,
      band: 'not_assessed',
      status: 'not_assessed',
      dataSource: indicator.dataSource,
      isLowerBetter: indicator.isLowerBetter,
      safetyGateCap: indicator.safetyGateCap,
      guidance: indicator.guidance,
      notes: assessment?.notes,
    };
  }

  const val = assessment.measuredValue;
  const isLowerBetter = !!indicator.isLowerBetter;
  const { pass, warning, fail } = indicator.thresholds;

  let score = 0;
  let band: PerformanceBand = 'fail';

  if (isLowerBetter) {
    // Lower is better (e.g., latency, volatility index)
    if (val <= pass) {
      score = 100;
      band = 'pass';
    } else if (val >= fail) {
      score = 0;
      band = 'fail';
    } else {
      // Linear interpolation between pass (100) and fail (0)
      const range = fail - pass;
      const progress = (fail - val) / range;
      score = Math.max(0, Math.min(100, Math.round(progress * 1000) / 10));
      band = val <= warning ? 'warning' : 'fail';
    }
  } else {
    // Higher is better (percentages, rates)
    if (val >= pass) {
      score = 100;
      band = 'pass';
    } else if (val <= fail) {
      score = 0;
      band = 'fail';
    } else {
      // Linear interpolation between fail (0) and pass (100)
      const range = pass - fail;
      const progress = (val - fail) / range;
      score = Math.max(0, Math.min(100, Math.round(progress * 1000) / 10));
      band = val >= warning ? 'warning' : 'fail';
    }
  }

  return {
    indicatorId: indicator.id,
    code: indicator.code,
    name: indicator.name,
    evidenceClassification: indicator.evidenceClassification,
    isCritical: indicator.isCritical,
    weight: indicator.weight,
    measuredValue: val,
    unit: indicator.unit,
    evaluatedScore: score,
    band,
    status: 'assessed',
    dataSource: indicator.dataSource,
    isLowerBetter: indicator.isLowerBetter,
    safetyGateCap: indicator.safetyGateCap,
    guidance: indicator.guidance,
    notes: assessment.notes,
  };
}

/**
 * Calculates safety gate status across all indicators.
 * A critical indicator that evaluates to 'fail' trips the safety gate.
 */
export function evaluateSafetyGate(
  evaluatedScores: EvaluatedIndicatorScore[]
): SafetyGateResult {
  const violations: SafetyGateViolation[] = [];

  for (const score of evaluatedScores) {
    if (score.isCritical && score.status === 'assessed') {
      // Failed critical indicator
      if (score.band === 'fail' || score.evaluatedScore < 50) {
        const canonicalInd = CANONICAL_STANDARD.indicators.find(i => i.id === score.indicatorId);
        violations.push({
          indicatorId: score.indicatorId,
          code: score.code,
          name: score.name,
          measuredValue: score.measuredValue,
          thresholdPass: canonicalInd?.thresholds.pass ?? 0,
          thresholdFail: canonicalInd?.thresholds.fail ?? 0,
          unit: score.unit,
          safetyGateCap: score.safetyGateCap || 'Tier 3',
          dataSource: score.dataSource,
          reason: `Critical life-safety indicator failed: measured ${score.measuredValue}${score.unit} (pass: ${canonicalInd?.thresholds.pass}${score.unit}, fail: ${canonicalInd?.thresholds.fail}${score.unit}). Imposes safety gate tier cap.`
        });
      }
    }
  }

  const tripped = violations.length > 0;
  // If tripped, tier is capped at Tier 3 (or Tier 4 if multiple severe violations)
  const maxAchievableTier: AuditTierId = tripped ? 'Tier 3' : 'Tier 1';

  return {
    tripped,
    trippedCount: violations.length,
    maxAchievableTier,
    violations,
  };
}

/**
 * Computes audit confidence level based on coverage and evidence composition.
 */
export function evaluateConfidence(
  coveragePercent: number,
  evaluatedScores: EvaluatedIndicatorScore[]
): ConfidenceResult {
  const assessed = evaluatedScores.filter(s => s.status === 'assessed');
  const totalAssessedWeight = assessed.reduce((acc, s) => acc + s.weight, 0);
  const totalPossibleWeight = CANONICAL_STANDARD.indicators.reduce((acc, i) => acc + i.weight, 0);

  const establishedAssessedWeight = assessed
    .filter(s => s.evidenceClassification === 'E')
    .reduce((acc, s) => acc + s.weight, 0);

  const establishedWeightRatio = totalAssessedWeight > 0
    ? establishedAssessedWeight / totalAssessedWeight
    : 0;

  const { high, medium } = CANONICAL_STANDARD.confidenceThresholds;

  let level: ConfidenceLevel = 'Low';
  let explanation = '';

  if (coveragePercent >= high.minCoverage && establishedWeightRatio >= high.minEstablishedWeightRatio) {
    level = 'High';
    explanation = `Comprehensive audit coverage (${coveragePercent.toFixed(1)}%) with strong established evidence foundation (${(establishedWeightRatio * 100).toFixed(0)}% Established [E] weight).`;
  } else if (coveragePercent >= medium.minCoverage && establishedWeightRatio >= medium.minEstablishedWeightRatio) {
    level = 'Medium';
    explanation = `Moderate audit coverage (${coveragePercent.toFixed(1)}%) with acceptable evidence balance (${(establishedWeightRatio * 100).toFixed(0)}% Established [E] weight).`;
  } else {
    level = 'Low';
    explanation = `Sub-optimal audit coverage (${coveragePercent.toFixed(1)}%) or insufficient established evidence basis. Findings should be treated as provisional.`;
  }

  return {
    level,
    coveragePercent,
    establishedWeightRatio,
    totalAssessedWeight,
    totalPossibleWeight,
    explanation,
  };
}

/**
 * Assigns Tier based on composite score, coverage, and safety gate caps.
 */
export function determineTier(
  compositeScore: number,
  coveragePercent: number,
  safetyGate: SafetyGateResult
): { assignedTier: AuditTierId; uncappedTier: AuditTierId; tierCappedBySafetyGate: boolean; tierDetails: TierDefinition } {
  let uncappedTier: AuditTierId = 'Tier 4';

  if (compositeScore >= 90 && coveragePercent >= 85) {
    uncappedTier = 'Tier 1';
  } else if (compositeScore >= 75 && coveragePercent >= 70) {
    uncappedTier = 'Tier 2';
  } else if (compositeScore >= 60 && coveragePercent >= 50) {
    uncappedTier = 'Tier 3';
  } else {
    uncappedTier = 'Tier 4';
  }

  let assignedTier = uncappedTier;
  let tierCappedBySafetyGate = false;

  if (safetyGate.tripped) {
    if (assignedTier === 'Tier 1' || assignedTier === 'Tier 2') {
      assignedTier = 'Tier 3';
      tierCappedBySafetyGate = true;
    }
  }

  const tierDetails = CANONICAL_STANDARD.tierDefinitions.find(t => t.tier === assignedTier) || CANONICAL_STANDARD.tierDefinitions[3];

  return {
    assignedTier,
    uncappedTier,
    tierCappedBySafetyGate,
    tierDetails,
  };
}

/**
 * Main Pure Scoring Function.
 * Evaluates full audit assessments deterministically against the canonical standard.
 */
export function computeAuditScore(
  assessments: Record<string, IndicatorAssessment>
): AuditScoreResult {
  // 1. Evaluate every indicator
  const evaluatedIndicators: EvaluatedIndicatorScore[] = CANONICAL_STANDARD.indicators.map(ind => {
    const assessment = assessments[ind.id];
    return evaluateIndicator(ind, assessment);
  });

  // 2. Group and calculate per-pillar scores
  const pillarScores: Record<string, PillarScoreResult> = {};
  let totalAssessedWeightAllPillars = 0;
  let totalPossibleWeightAllPillars = 0;

  for (const pillar of CANONICAL_STANDARD.pillars) {
    const pillarEvaluations = evaluatedIndicators.filter(e => {
      const ind = CANONICAL_STANDARD.indicators.find(i => i.id === e.indicatorId);
      return ind?.pillarId === pillar.id;
    });

    const assessedEvaluations = pillarEvaluations.filter(e => e.status === 'assessed');
    const assessedWeight = assessedEvaluations.reduce((acc, e) => acc + e.weight, 0);
    const totalWeight = pillarEvaluations.reduce((acc, e) => acc + e.weight, 0);

    totalAssessedWeightAllPillars += assessedWeight;
    totalPossibleWeightAllPillars += totalWeight;

    let rawPillarScore = 0;
    if (assessedWeight > 0) {
      const weightedSum = assessedEvaluations.reduce((acc, e) => acc + (e.evaluatedScore * e.weight), 0);
      rawPillarScore = Math.round((weightedSum / assessedWeight) * 10) / 10;
    }

    const coveragePercent = totalWeight > 0 ? (assessedWeight / totalWeight) * 100 : 0;
    const weightedContribution = Math.round(rawPillarScore * pillar.weight * 10) / 10;

    pillarScores[pillar.id] = {
      pillarId: pillar.id,
      pillarName: pillar.name,
      pillarWeight: pillar.weight,
      assessedIndicatorsCount: assessedEvaluations.length,
      totalIndicatorsCount: pillarEvaluations.length,
      assessedWeight,
      totalWeight,
      coveragePercent: Math.round(coveragePercent * 10) / 10,
      rawPillarScore,
      weightedContribution,
      indicatorScores: pillarEvaluations,
    };
  }

  // 3. Overall coverage calculation
  const overallCoveragePercent = totalPossibleWeightAllPillars > 0
    ? Math.round((totalAssessedWeightAllPillars / totalPossibleWeightAllPillars) * 1000) / 10
    : 0;

  // 4. Overall composite score calculation
  // Weighted sum of pillar scores based on pillar weights among assessed pillars
  let compositeScore = 0;
  const pillarsWithAssessments = Object.values(pillarScores).filter(p => p.assessedIndicatorsCount > 0);
  const activePillarWeightSum = pillarsWithAssessments.reduce((acc, p) => acc + p.pillarWeight, 0);

  if (activePillarWeightSum > 0) {
    const weightedPillarSum = pillarsWithAssessments.reduce((acc, p) => acc + (p.rawPillarScore * p.pillarWeight), 0);
    compositeScore = Math.round((weightedPillarSum / activePillarWeightSum) * 10) / 10;
  }

  // 5. Safety Gate evaluation
  const safetyGate = evaluateSafetyGate(evaluatedIndicators);

  // 6. Tier determination
  const tierResult = determineTier(compositeScore, overallCoveragePercent, safetyGate);

  // 7. Confidence evaluation
  const confidence = evaluateConfidence(overallCoveragePercent, evaluatedIndicators);

  // 8. Summary statistics
  const assessedList = evaluatedIndicators.filter(e => e.status === 'assessed');
  const criticalList = evaluatedIndicators.filter(e => e.isCritical);
  const criticalAssessed = criticalList.filter(e => e.status === 'assessed');

  const summary = {
    totalIndicators: evaluatedIndicators.length,
    assessedIndicators: assessedList.length,
    notAssessedIndicators: evaluatedIndicators.length - assessedList.length,
    criticalTotal: criticalList.length,
    criticalPassed: criticalAssessed.filter(e => e.band !== 'fail').length,
    criticalFailed: criticalAssessed.filter(e => e.band === 'fail').length,
    passCount: assessedList.filter(e => e.band === 'pass').length,
    warningCount: assessedList.filter(e => e.band === 'warning').length,
    failCount: assessedList.filter(e => e.band === 'fail').length,
  };

  return {
    compositeScore,
    assignedTier: tierResult.assignedTier,
    tierDetails: tierResult.tierDetails,
    tierCappedBySafetyGate: tierResult.tierCappedBySafetyGate,
    uncappedTier: tierResult.uncappedTier,
    safetyGate,
    confidence,
    pillarScores,
    summary,
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Seeded Pseudo-Random Number Generator (Mulberry32)
 * Ensures 100% deterministic simulation:
 * same seed + same inputs = same dataset/results.
 */
export function createDeterministicRng(seed: number) {
  let s = seed >>> 0;
  return function next(): number {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministically generates a simulated facility audit record from a seed.
 */
export function generateSimulatedAuditRecord(
  seed: number,
  facilityName: string,
  department: string = 'Critical & Acute Inpatient Unit 4B',
  scenarioBias: 'exemplary' | 'critical_breach' | 'low_coverage' | 'mixed' = 'exemplary'
): FacilityAuditRecord {
  const rng = createDeterministicRng(seed);
  const assessments: Record<string, IndicatorAssessment> = {};

  for (const ind of CANONICAL_STANDARD.indicators) {
    const isCritical = ind.isCritical;
    let status: 'assessed' | 'not_assessed' = 'assessed';

    if (scenarioBias === 'low_coverage') {
      // 45% omitted to test low coverage handling
      if (rng() < 0.45 && !isCritical) {
        status = 'not_assessed';
      }
    }

    if (status === 'not_assessed') {
      assessments[ind.id] = {
        indicatorId: ind.id,
        status: 'not_assessed',
        measuredValue: null,
        notes: 'Omitted from provisional sample run; pending auditor verification.',
      };
      continue;
    }

    const { pass, warning, fail } = ind.thresholds;
    const isLowerBetter = !!ind.isLowerBetter;
    let measuredValue: number;

    if (scenarioBias === 'exemplary') {
      if (isLowerBetter) {
        measuredValue = pass - (rng() * (pass * 0.25));
      } else {
        const delta = 100 - pass;
        measuredValue = pass + (rng() * delta * 0.7);
      }
    } else if (scenarioBias === 'critical_breach' && ind.id === 'CSP-01') {
      // Intentionally fail the critical Medication Dual-Verification indicator!
      measuredValue = fail - 4.5;
    } else if (scenarioBias === 'critical_breach') {
      if (isLowerBetter) {
        measuredValue = pass + ((warning - pass) * rng());
      } else {
        measuredValue = warning + ((pass - warning) * rng());
      }
    } else {
      // Mixed
      const roll = rng();
      if (roll > 0.3) {
        measuredValue = isLowerBetter ? pass : pass + (rng() * 4);
      } else if (roll > 0.1) {
        measuredValue = isLowerBetter ? warning : warning + (rng() * 3);
      } else {
        measuredValue = isLowerBetter ? fail + 2 : fail - 2;
      }
    }

    measuredValue = Math.round(measuredValue * 10) / 10;

    assessments[ind.id] = {
      indicatorId: ind.id,
      status: 'assessed',
      measuredValue,
      notes: `Deterministic audit sample generated from PRNG seed ${seed}. Audited against source: ${ind.dataSource}.`,
      lastAuditedAt: '2026-09-30T14:00:00.000Z',
      auditorName: 'Lead Auditor J. Vance (RN, CPHQ)',
    };
  }

  const scoreResult = computeAuditScore(assessments);

  return {
    id: `AUD-SIM-${seed}-${facilityName.replace(/\s+/g, '-').toUpperCase()}`,
    facilityName,
    facilityId: `FAC-${(seed % 900 + 100)}`,
    facilityType: 'Specialized Inpatient & Skilled Nursing Facility',
    departmentOrUnit: department,
    leadAuditor: 'J. Vance, RN, BSN, CPHQ (Auditor ID #9042)',
    auditDate: '2026-09-30',
    auditScope: 'Comprehensive Tier Standing & Life-Safety Gate Verification',
    isSimulated: true,
    simulationSeed: seed,
    assessments,
    scoreResult,
    auditNotes: 'SIMULATED DATASET: Generated using seeded deterministic PRNG for algorithmic audit ledger demonstration. Not clinically validated.',
  };
}
