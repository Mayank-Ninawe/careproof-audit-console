/**
 * CareProof Audit Console - Pilot Study Pure Statistical & Simulation Service (Phase 10A)
 * Source of Truth: CareProof Website Roadmap (Phase 10A)
 * 
 * ARCHITECTURAL CONTRACT:
 * 1. Pure & Side-Effect Free: Zero React, DOM, or Firebase dependencies.
 * 2. Strictly Deterministic: Same seed + same config produces deeply identical serialized output.
 * 3. Synthetic Integrity:
 *    - All datasets and derived metrics are explicitly tagged as `SIMULATED`.
 *    - No claim of clinical validation, diagnostic accuracy, or real patient evidence.
 * 4. Mathematical Safety:
 *    - Degenerate/invalid edge cases for Cohen's Kappa, Cronbach's Alpha, and ROC/AUC
 *      return explicit 'unavailable' statuses with structured reasons.
 *    - No arbitrary fallback numbers (e.g. 0.75 or 0.90) are ever forced.
 * 5. Zero Non-Deterministic APIs: Math.random() and Date.now() are strictly forbidden.
 */

import { SeededRng } from '../engine/simulate';
import {
  InternalConsistencyResult,
  InterRaterResult,
  PilotEndpoint,
  PilotLimitations,
  PilotObservation,
  PilotProtocol,
  PilotSimulationResult,
  PilotStudyConfig,
  PilotValidationResult,
  PilotViewModel,
  RocPoint,
  RocResult,
  ScoreDistribution,
  ScoreDistributionBin,
} from '../types/pilot';

export const PILOT_SAFE_HARBOR_DISCLAIMER =
  'Proposed framework, not clinically validated. In silico demonstration simulation only, not real patient evidence.';

export const PILOT_LIMITATION_STATEMENTS: readonly string[] = [
  'All data and statistical analyses are generated synthetically for framework demonstration.',
  'No clinical validation or real-world diagnostic performance is established.',
  'Simulation does not establish clinical effectiveness, patient outcomes, or safety guarantees.',
  'Thresholds and parameters are demonstration values and must not be used as clinical decision cutoffs.',
  'Demonstration sample size is configured for simulation illustrative purposes only and is not statistically powered.',
  'Independent prospective clinical validation is required before any operational or diagnostic deployment.',
];

export const DEFAULT_PRIMARY_ENDPOINT: PilotEndpoint = {
  id: 'EP-PRI-01',
  type: 'primary',
  name: 'Synthetic Composite Safety Adherence Score',
  description: 'Proposed demonstration metric evaluating simulated multi-pillar audit compliance.',
  targetMetric: 'Composite Adherence Index (0–100)',
  isProposedDemo: true,
};

export const DEFAULT_SECONDARY_ENDPOINTS: readonly PilotEndpoint[] = [
  {
    id: 'EP-SEC-01',
    type: 'secondary',
    name: 'Simulated Inter-Rater Concordance',
    description: "Demonstration of dual-rater agreement index (Cohen's Kappa) on simulated audit observations.",
    targetMetric: "Cohen's Kappa Agreement",
    isProposedDemo: true,
  },
  {
    id: 'EP-SEC-02',
    type: 'secondary',
    name: 'Simulated Scale Consistency',
    description: "Demonstration of internal consistency (Cronbach's Alpha) across synthetic audit questionnaire items.",
    targetMetric: "Cronbach's Alpha",
    isProposedDemo: true,
  },
  {
    id: 'EP-SEC-03',
    type: 'secondary',
    name: 'Simulated Event Discrimination',
    description: 'Demonstration of receiver operating characteristic (ROC/AUC) for synthetic event classification.',
    targetMetric: 'Empirical AUC (Area Under Curve)',
    isProposedDemo: true,
  },
];

export const DEFAULT_PILOT_CONFIG: Required<PilotStudyConfig> = {
  sampleSize: 60,
  itemCount: 5,
  categories: ['Band-1', 'Band-2', 'Band-3', 'Band-4'],
  binCount: 5,
  scoreMin: 40.0,
  scoreMax: 100.0,
  referenceDate: '2026-01-01T00:00:00.000Z',
};

/**
 * Calculates deterministic score distribution statistics including mean, median,
 * sample standard deviation, and histogram bins across simulated scores.
 */
export function calculateScoreDistribution(
  scores: readonly number[],
  binCount = 5
): ScoreDistribution {
  if (scores.length === 0) {
    return {
      datasetType: 'SIMULATED',
      sampleSize: 0,
      mean: 0,
      median: 0,
      stdDev: 0,
      min: 0,
      max: 0,
      bins: [],
      isSimulated: true,
    };
  }

  const n = scores.length;
  const sorted = [...scores].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[n - 1];

  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const mean = sum / n;

  let median: number;
  if (n % 2 === 1) {
    median = sorted[Math.floor(n / 2)];
  } else {
    const mid = n / 2;
    median = (sorted[mid - 1] + sorted[mid]) / 2;
  }

  let stdDev = 0;
  if (n > 1) {
    const variance = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (n - 1);
    stdDev = Math.sqrt(variance);
  }

  // Construct histogram bins
  const bins: ScoreDistributionBin[] = [];
  const rangeSpan = Math.max(max - min, 1);
  const effectiveBinCount = Math.max(1, binCount);
  const binWidth = rangeSpan / effectiveBinCount;

  for (let b = 0; b < effectiveBinCount; b++) {
    const binStart = min + b * binWidth;
    const binEnd = b === effectiveBinCount - 1 ? max : min + (b + 1) * binWidth;

    const count = sorted.filter((score) => {
      if (b === effectiveBinCount - 1) {
        return score >= binStart && score <= binEnd;
      }
      return score >= binStart && score < binEnd;
    }).length;

    bins.push({
      binStart,
      binEnd,
      count,
      percentage: (count / n) * 100,
    });
  }

  return {
    datasetType: 'SIMULATED',
    sampleSize: n,
    mean,
    median,
    stdDev,
    min,
    max,
    bins,
    isSimulated: true,
  };
}

/**
 * Calculates Cohen's Kappa for categorical inter-rater reliability.
 * 
 * Formula:
 *   Kappa = (P_o - P_e) / (1 - P_e)
 *   where P_o is observed proportion of agreement,
 *         P_e is expected chance agreement sum(p_1k * p_2k).
 * 
 * If data cannot mathematically support kappa (e.g. fewer than 2 ratings,
 * fewer than 2 categories, or chance agreement P_e = 1.0 leading to 0/0),
 * an explicit 'unavailable' status is returned without fabrication.
 */
export function calculateCohenKappa(
  ratings: readonly { raterA: string; raterB: string }[],
  categories?: readonly string[]
): InterRaterResult {
  const n = ratings.length;
  const raters: [string, string] = ['Rater-A', 'Rater-B'];

  if (n < 2) {
    return {
      status: 'unavailable',
      kappa: null,
      ratingCount: n,
      categories: categories ? [...categories] : [],
      agreementMetadata: {
        observedAgreement: null,
        expectedAgreement: null,
        categoriesEvaluated: categories ? [...categories] : [],
        raters,
      },
      reason: "Insufficient paired ratings for Cohen's kappa (minimum 2 required).",
      datasetType: 'SIMULATED',
      isSimulated: true,
    };
  }

  // Derive distinct category list
  const categorySet = new Set<string>(categories ?? []);
  for (const r of ratings) {
    categorySet.add(r.raterA);
    categorySet.add(r.raterB);
  }
  const categoryList = Array.from(categorySet).sort();

  if (categoryList.length < 2) {
    return {
      status: 'unavailable',
      kappa: null,
      ratingCount: n,
      categories: categoryList,
      agreementMetadata: {
        observedAgreement: null,
        expectedAgreement: null,
        categoriesEvaluated: categoryList,
        raters,
      },
      reason: "Cohen's kappa requires at least 2 distinct categories.",
      datasetType: 'SIMULATED',
      isSimulated: true,
    };
  }

  // Observed agreement P_o
  const agreedCount = ratings.filter((r) => r.raterA === r.raterB).length;
  const observedAgreement = agreedCount / n;

  // Expected agreement P_e
  let expectedAgreement = 0;
  for (const cat of categoryList) {
    const p1 = ratings.filter((r) => r.raterA === cat).length / n;
    const p2 = ratings.filter((r) => r.raterB === cat).length / n;
    expectedAgreement += p1 * p2;
  }

  // Degenerate check: 1 - P_e is 0 (all ratings in single identical category by both raters)
  if (Math.abs(1 - expectedAgreement) < 1e-12) {
    return {
      status: 'unavailable',
      kappa: null,
      ratingCount: n,
      categories: categoryList,
      agreementMetadata: {
        observedAgreement,
        expectedAgreement,
        categoriesEvaluated: categoryList,
        raters,
      },
      reason: 'Chance-expected agreement is 1.0 (zero variation across categories); kappa is mathematically indeterminate.',
      datasetType: 'SIMULATED',
      isSimulated: true,
    };
  }

  const kappa = (observedAgreement - expectedAgreement) / (1 - expectedAgreement);

  return {
    status: 'calculated',
    kappa,
    ratingCount: n,
    categories: categoryList,
    agreementMetadata: {
      observedAgreement,
      expectedAgreement,
      categoriesEvaluated: categoryList,
      raters,
    },
    datasetType: 'SIMULATED',
    isSimulated: true,
  };
}

/**
 * Calculates Cronbach's Alpha (internal consistency) from an item-response matrix.
 * 
 * Matrix format: rows = subjects/observations, columns = items.
 * 
 * Formula:
 *   Alpha = (K / (K - 1)) * (1 - sum(sigma_item^2) / sigma_total^2)
 *   where K is number of items,
 *         sigma_item^2 is sample variance of each item,
 *         sigma_total^2 is sample variance of subject total scores.
 * 
 * If total score variance is zero, or item count < 2, or observation count < 2,
 * returns explicit 'unavailable' status.
 */
export function calculateCronbachAlpha(
  itemMatrix: readonly (readonly number[])[]
): InternalConsistencyResult {
  const observationCount = itemMatrix.length;
  if (observationCount < 2) {
    return {
      status: 'unavailable',
      alpha: null,
      itemCount: itemMatrix[0]?.length ?? 0,
      observationCount,
      reason: "Cronbach's alpha requires at least 2 observations to calculate sample variance.",
      datasetType: 'SIMULATED',
      isSimulated: true,
    };
  }

  const itemCount = itemMatrix[0].length;
  if (itemCount < 2) {
    return {
      status: 'unavailable',
      alpha: null,
      itemCount,
      observationCount,
      reason: "Cronbach's alpha requires at least 2 items in the questionnaire scale.",
      datasetType: 'SIMULATED',
      isSimulated: true,
    };
  }

  // Verify uniform row dimensions
  for (let i = 0; i < observationCount; i++) {
    if (itemMatrix[i].length !== itemCount) {
      return {
        status: 'unavailable',
        alpha: null,
        itemCount,
        observationCount,
        reason: 'Inconsistent item count across matrix observations.',
        datasetType: 'SIMULATED',
        isSimulated: true,
      };
    }
  }

  // Calculate item sample variances
  const itemVariances: number[] = [];
  for (let j = 0; j < itemCount; j++) {
    const itemValues = itemMatrix.map((row) => row[j]);
    const itemMean = itemValues.reduce((sum, v) => sum + v, 0) / observationCount;
    const itemVar =
      itemValues.reduce((sum, v) => sum + Math.pow(v - itemMean, 2), 0) / (observationCount - 1);
    itemVariances.push(itemVar);
  }

  // Calculate total score for each subject and total score sample variance
  const totalScores = itemMatrix.map((row) => row.reduce((sum, v) => sum + v, 0));
  const totalMean = totalScores.reduce((sum, v) => sum + v, 0) / observationCount;
  const totalVariance =
    totalScores.reduce((sum, v) => sum + Math.pow(v - totalMean, 2), 0) / (observationCount - 1);

  // If total score variance is zero, division by zero occurs
  if (totalVariance <= 1e-12) {
    return {
      status: 'unavailable',
      alpha: null,
      itemCount,
      observationCount,
      itemVariances,
      totalVariance,
      reason: 'Total score variance across observations is zero; Cronbach’s alpha is mathematically undefined.',
      datasetType: 'SIMULATED',
      isSimulated: true,
    };
  }

  const sumItemVariances = itemVariances.reduce((acc, v) => acc + v, 0);
  const alpha = (itemCount / (itemCount - 1)) * (1 - sumItemVariances / totalVariance);

  return {
    status: 'calculated',
    alpha,
    itemCount,
    observationCount,
    itemVariances,
    totalVariance,
    datasetType: 'SIMULATED',
    isSimulated: true,
  };
}

/**
 * Calculates empirical Receiver Operating Characteristic (ROC) curve points and
 * Area Under the Curve (AUC) from simulated scores and binary outcomes (1 = event, 0 = non-event).
 * 
 * Algorithm:
 * - Deterministic Wilcoxon-Mann-Whitney U statistic handles exact trapezoidal area under
 *   the empirical ROC curve with tied rank handling:
 *     AUC = sum_{i in Pos} sum_{j in Neg} S(score_i, score_j) / (N_pos * N_neg)
 *     where S(s_i, s_j) = 1.0 if s_i > s_j, 0.5 if s_i == s_j, 0.0 if s_i < s_j.
 * - ROC points are evaluated for each distinct score threshold (in descending order),
 *   plus an upper boundary point where threshold > max score.
 * 
 * Edge cases:
 * - Empty dataset -> unavailable
 * - No positive cases -> unavailable (sensitivity undefined)
 * - No negative cases -> unavailable (specificity undefined)
 * - Constant scores (all scores identical) -> unavailable (zero score discrimination)
 */
export function calculateRocAnalysis(
  data: readonly { score: number; outcome: number }[]
): RocResult {
  const totalCount = data.length;

  if (totalCount === 0) {
    return {
      status: 'unavailable',
      auc: null,
      points: [],
      positiveCount: 0,
      negativeCount: 0,
      totalCount: 0,
      thresholdsUsed: [],
      reason: 'Empty dataset; cannot compute ROC curve.',
      datasetType: 'SIMULATED',
      isSimulated: true,
    };
  }

  const positiveCount = data.filter((d) => d.outcome === 1).length;
  const negativeCount = data.filter((d) => d.outcome === 0).length;

  if (positiveCount === 0) {
    return {
      status: 'unavailable',
      auc: null,
      points: [],
      positiveCount: 0,
      negativeCount,
      totalCount,
      thresholdsUsed: [],
      reason: 'No positive cases present in dataset; sensitivity is undefined.',
      datasetType: 'SIMULATED',
      isSimulated: true,
    };
  }

  if (negativeCount === 0) {
    return {
      status: 'unavailable',
      auc: null,
      points: [],
      positiveCount,
      negativeCount: 0,
      totalCount,
      thresholdsUsed: [],
      reason: 'No negative cases present in dataset; specificity is undefined.',
      datasetType: 'SIMULATED',
      isSimulated: true,
    };
  }

  const scores = data.map((d) => d.score);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);

  if (minScore === maxScore) {
    return {
      status: 'unavailable',
      auc: null,
      points: [],
      positiveCount,
      negativeCount,
      totalCount,
      thresholdsUsed: [],
      reason: 'All scores are identical (zero score variance); ROC curve and AUC are undefined.',
      datasetType: 'SIMULATED',
      isSimulated: true,
    };
  }

  // Calculate AUC via Wilcoxon-Mann-Whitney U statistic
  let rankSum = 0;
  for (const pos of data) {
    if (pos.outcome !== 1) continue;
    for (const neg of data) {
      if (neg.outcome !== 0) continue;
      if (pos.score > neg.score) {
        rankSum += 1.0;
      } else if (pos.score === neg.score) {
        rankSum += 0.5;
      }
    }
  }
  const auc = rankSum / (positiveCount * negativeCount);

  // Generate distinct score thresholds in descending order
  const distinctScores = Array.from(new Set(scores)).sort((a, b) => b - a);
  const thresholdsUsed: number[] = [maxScore + 1, ...distinctScores];

  // Generate ROC points
  const points: RocPoint[] = [];

  for (const threshold of thresholdsUsed) {
    let tp = 0;
    let fp = 0;

    for (const item of data) {
      const isPredictedPositive = item.score >= threshold;
      if (item.outcome === 1 && isPredictedPositive) tp++;
      if (item.outcome === 0 && isPredictedPositive) fp++;
    }

    const fn = positiveCount - tp;
    const tn = negativeCount - fp;

    const tpr = tp / positiveCount;
    const fpr = fp / negativeCount;

    points.push({
      threshold,
      falsePositiveRate: fpr,
      truePositiveRate: tpr,
      sensitivity: tpr,
      specificity: tn / negativeCount,
      truePositives: tp,
      falsePositives: fp,
      trueNegatives: tn,
      falseNegatives: fn,
    });
  }

  return {
    status: 'calculated',
    auc,
    points,
    positiveCount,
    negativeCount,
    totalCount,
    thresholdsUsed,
    datasetType: 'SIMULATED',
    isSimulated: true,
  };
}

/**
 * Runs a complete deterministic pilot study simulation from a numeric seed and configuration.
 * 
 * CONTRACT:
 * - Strictly reproducible: same seed + same config produces deeply identical serialized output.
 * - Different seeds produce different simulated output.
 * - Zero non-deterministic system randomness.
 */
export function runPilotSimulation(
  seed: number,
  config?: PilotStudyConfig
): PilotSimulationResult {
  const mergedConfig: Required<PilotStudyConfig> = {
    ...DEFAULT_PILOT_CONFIG,
    ...config,
  };

  const rng = new SeededRng(seed);
  const observations: PilotObservation[] = [];

  const categories = mergedConfig.categories;
  const catCount = categories.length;

  for (let i = 0; i < mergedConfig.sampleSize; i++) {
    const obsId = `OBS-PILOT-${(i + 1).toString().padStart(4, '0')}`;
    const patientId = `PAT-${((i % 25) + 1).toString().padStart(3, '0')}`;

    // Deterministic synthetic score within configured bounds
    const rawScore = rng.nextRoundedFloat(mergedConfig.scoreMin, mergedConfig.scoreMax, 1);

    // Synthetic normalized adherence [0, 1]
    const norm = (rawScore - mergedConfig.scoreMin) / (mergedConfig.scoreMax - mergedConfig.scoreMin);

    // Deterministic synthetic binary event outcome correlated with simulated score
    // Higher simulated adherence score has higher probability of achieving the synthetic milestone
    const outcomeProbability = Math.min(0.95, Math.max(0.05, 0.15 + 0.70 * norm));
    const binaryOutcome: 0 | 1 = rng.nextBool(outcomeProbability) ? 1 : 0;

    // Rater A & B categorical assessment across configured bands
    const baseCatIdx = Math.min(catCount - 1, Math.floor(norm * catCount));
    const raterA = categories[baseCatIdx];

    // Rater B concordance: 70% chance of exact agreement, otherwise picks category
    let raterB = raterA;
    if (!rng.nextBool(0.70)) {
      raterB = rng.pick(categories);
    }

    // Synthetic item-response matrix row for Cronbach's Alpha
    // Latent base rating (1 to 5) with deterministic noise
    const latentLevel = Math.max(1, Math.min(5, Math.floor(norm * 4) + 1));
    const itemScores: number[] = [];
    for (let j = 0; j < mergedConfig.itemCount; j++) {
      const noise = rng.nextInt(-1, 1);
      const scoreVal = Math.max(1, Math.min(5, latentLevel + noise));
      itemScores.push(scoreVal);
    }

    observations.push({
      id: obsId,
      patientId,
      score: rawScore,
      binaryOutcome,
      raterRatings: {
        raterA,
        raterB,
      },
      itemScores,
      isSimulated: true,
    });
  }

  // Calculate validation metrics
  const scores = observations.map((o) => o.score);
  const scoreDistribution = calculateScoreDistribution(
    scores,
    mergedConfig.binCount
  );

  const interRater = calculateCohenKappa(
    observations.map((o) => o.raterRatings),
    mergedConfig.categories
  );

  const internalConsistency = calculateCronbachAlpha(observations.map((o) => o.itemScores));

  const roc = calculateRocAnalysis(
    observations.map((o) => ({ score: o.score, outcome: o.binaryOutcome }))
  );

  const limitations: PilotLimitations = {
    datasetType: 'SIMULATED',
    isSimulated: true,
    statements: PILOT_LIMITATION_STATEMENTS,
    safeHarborNotice: PILOT_SAFE_HARBOR_DISCLAIMER,
  };

  const protocol: PilotProtocol = {
    protocolId: 'PROTO-PILOT-SIM-001',
    studyDesign: 'Proposed In Silico Simulation Protocol (Synthetic Demonstration Only)',
    sampleSize: {
      size: mergedConfig.sampleSize,
      label: 'simulated / demonstration configuration',
      description:
        'Demonstration sample size configured for simulation testing only; not clinically powered or statistically powered.',
    },
    primaryEndpoint: DEFAULT_PRIMARY_ENDPOINT,
    secondaryEndpoints: DEFAULT_SECONDARY_ENDPOINTS,
    seed,
    simulationMetadata: {
      datasetType: 'SIMULATED',
      generator: 'CareProof Seeded Mulberry32 Synthetic Engine',
      isSimulated: true,
      deterministicTimestamp: mergedConfig.referenceDate,
    },
    limitations,
  };

  const validation: PilotValidationResult = {
    scoreDistribution,
    interRater,
    internalConsistency,
    roc,
    datasetType: 'SIMULATED',
    isSimulated: true,
  };

  return {
    datasetType: 'SIMULATED',
    seed,
    config: mergedConfig,
    protocol,
    observations,
    validation,
    limitations,
    isSimulated: true,
    generatedAt: mergedConfig.referenceDate,
  };
}

/**
 * Creates the complete Pilot Study view model for presentation consumption.
 * Pure and side-effect free. Zero React, DOM, or Firebase dependencies.
 */
export function createPilotViewModel(
  config?: PilotStudyConfig,
  seed = 42
): PilotViewModel {
  const result = runPilotSimulation(seed, config);

  return {
    protocol: result.protocol,
    simulatedStatus: 'SIMULATED',
    scoreDistribution: result.validation.scoreDistribution,
    interRater: result.validation.interRater,
    internalConsistency: result.validation.internalConsistency,
    roc: result.validation.roc,
    seed: result.seed,
    reproducibility: {
      seed: result.seed,
      isDeterministic: true,
      deterministicTimestamp: result.generatedAt,
      sampleSizeLabel: result.protocol.sampleSize.label,
    },
    limitations: result.limitations,
  };
}
