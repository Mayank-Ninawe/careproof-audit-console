/**
 * CareProof Audit Console - Canonical Standard Access Module
 * Single Source of Truth: standard.json
 * 
 * Safely imports, validates, and exposes canonical standard configuration.
 */

import standardRaw from './standard.json';
import { Standard } from '../types/standard';
import { validateStandard, assertValidStandard, ValidationResult } from './standardValidator';

// Validates the canonical standard at module load time
export const CANONICAL_STANDARD: Standard = assertValidStandard(standardRaw);

export { validateStandard, assertValidStandard };
export type { ValidationResult };

export default CANONICAL_STANDARD;
