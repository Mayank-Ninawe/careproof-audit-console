/**
 * CareProof Audit Console - Pilot Study Domain Types
 * Single Source of Truth for Deterministic Synthetic Pilot Simulation (Phase 10A)
 * 
 * RESEARCH-INTEGRITY CONTRACT:
 * 1. Strictly Simulated: All datasets, distributions, reliability indices,
 *    and ROC curves are synthetically generated for demonstration.
 * 2. Zero Fabricated Claims: The engine never claims clinical validation,
 *    diagnostic accuracy, statistically proven effectiveness, or real patient evidence.
 * 3. Deterministic: Same seed + same configuration yields identical results.
 */

export interface PilotEndpoint {
  id: string;
  type: 'primary' | 'secondary';
  name: string;
  description: string;
  targetMetric: string;
  isProposedDemo: true;
}

export interface PilotProtocolSampleSize {
  size: number;
  label: 'simulated / demonstration configuration';
  description: string;
}

export interface PilotLimitations {
  datasetType: 'SIMULATED';
  isSimulated: true;
  statements: readonly string[];
  safeHarborNotice: string;
}

export interface PilotProtocol {
  protocolId: string;
  studyDesign: string;
  sampleSize: PilotProtocolSampleSize;
  primaryEndpoint: PilotEndpoint;
  secondaryEndpoints: readonly PilotEndpoint[];
  seed: number;
  simulationMetadata: {
    datasetType: 'SIMULATED';
    generator: string;
    isSimulated: true;
    deterministicTimestamp: string;
  };
  limitations: PilotLimitations;
}

export interface PilotStudyConfig {
  sampleSize?: number;            // Default: 60 (demonstration sample size)
  itemCount?: number;             // Default: 5 (items for Cronbach's alpha matrix)
  categories?: readonly string[]; // Default: ['Band-1', 'Band-2', 'Band-3', 'Band-4']
  binCount?: number;              // Default: 5 (histogram bins)
  scoreMin?: number;              // Default: 40.0
  scoreMax?: number;              // Default: 100.0
  referenceDate?: string;         // Default: '2026-01-01T00:00:00.000Z'
}

export interface PilotObservation {
  id: string;
  patientId: string;
  score: number;
  binaryOutcome: 0 | 1;
  raterRatings: {
    raterA: string;
    raterB: string;
  };
  itemScores: readonly number[];
  isSimulated: true;
}

export interface ScoreDistributionBin {
  binStart: number;
  binEnd: number;
  count: number;
  percentage: number;
}

export interface ScoreDistribution {
  datasetType: 'SIMULATED';
  sampleSize: number;
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  bins: readonly ScoreDistributionBin[];
  isSimulated: true;
}

export interface InterRaterAgreementMetadata {
  observedAgreement: number | null; // P_o
  expectedAgreement: number | null; // P_e
  categoriesEvaluated: readonly string[];
  raters: readonly [string, string];
}

export interface InterRaterResult {
  status: 'calculated' | 'unavailable';
  kappa: number | null;
  ratingCount: number;
  categories: readonly string[];
  agreementMetadata: InterRaterAgreementMetadata;
  reason?: string;
  datasetType: 'SIMULATED';
  isSimulated: true;
}

export interface InternalConsistencyResult {
  status: 'calculated' | 'unavailable';
  alpha: number | null;
  itemCount: number;
  observationCount: number;
  itemVariances?: readonly number[];
  totalVariance?: number;
  reason?: string;
  datasetType: 'SIMULATED';
  isSimulated: true;
}

export interface RocPoint {
  threshold: number;
  falsePositiveRate: number; // FPR (1 - Specificity)
  truePositiveRate: number;  // TPR (Sensitivity)
  sensitivity: number;
  specificity: number;
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
}

export interface RocResult {
  status: 'calculated' | 'unavailable';
  auc: number | null;
  points: readonly RocPoint[];
  positiveCount: number;
  negativeCount: number;
  totalCount: number;
  thresholdsUsed: readonly number[];
  reason?: string;
  datasetType: 'SIMULATED';
  isSimulated: true;
}

export interface PilotValidationResult {
  scoreDistribution: ScoreDistribution;
  interRater: InterRaterResult;
  internalConsistency: InternalConsistencyResult;
  roc: RocResult;
  datasetType: 'SIMULATED';
  isSimulated: true;
}

export interface PilotSimulationResult {
  datasetType: 'SIMULATED';
  seed: number;
  config: Required<PilotStudyConfig>;
  protocol: PilotProtocol;
  observations: readonly PilotObservation[];
  validation: PilotValidationResult;
  limitations: PilotLimitations;
  isSimulated: true;
  generatedAt: string;
}

export interface PilotViewModel {
  protocol: PilotProtocol;
  simulatedStatus: 'SIMULATED';
  scoreDistribution: ScoreDistribution;
  interRater: InterRaterResult;
  internalConsistency: InternalConsistencyResult;
  roc: RocResult;
  seed: number;
  reproducibility: {
    seed: number;
    isDeterministic: true;
    deterministicTimestamp: string;
    sampleSizeLabel: string;
  };
  limitations: PilotLimitations;
}
