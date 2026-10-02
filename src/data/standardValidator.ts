/**
 * CareProof Audit Console - Canonical Standard Validator
 * Validates canonical CareProof standard data according to roadmap specifications.
 * 
 * Checks:
 * - Top-level required fields (version, name, pillars, indicators)
 * - Pillar validity and uniqueness
 * - Indicator required fields (id, pillarId, name, definition, dataSource, bands, weight, critical, evidence, refs)
 * - Indicator uniqueness
 * - Indicator references valid pillarId
 * - Evidence validity ('E', 'I', 'P')
 * - Weight is a finite positive number
 * - Critical is a boolean
 * - Bands structure (non-empty array, valid levels: 'Meets', 'Partial', 'Fails')
 * - References structure (valid id and title)
 */

import { Standard, EvidenceType, BandLevel } from '../types/standard';

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

const VALID_EVIDENCE_TYPES: readonly EvidenceType[] = ['E', 'I', 'P'];
const VALID_BAND_LEVELS: readonly BandLevel[] = ['Meets', 'Partial', 'Fails'];

export function validateStandard(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!data || typeof data !== 'object') {
    return {
      valid: false,
      errors: [{ path: 'root', message: 'Standard data must be a non-null object' }],
    };
  }

  const obj = data as Record<string, unknown>;

  // 1. Version validation
  const version = obj.version ?? obj.standardVersion;
  if (!version || typeof version !== 'string' || version.trim() === '') {
    errors.push({ path: 'version', message: 'Standard version is required and must be a non-empty string' });
  }

  // 2. Name validation
  const name = obj.name ?? obj.standardName;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push({ path: 'name', message: 'Standard name is required and must be a non-empty string' });
  }

  // 3. Pillars validation
  if (!Array.isArray(obj.pillars) || obj.pillars.length === 0) {
    errors.push({ path: 'pillars', message: 'Standard pillars must be a non-empty array' });
  }

  const pillarIds = new Set<string>();

  if (Array.isArray(obj.pillars)) {
    obj.pillars.forEach((p, idx) => {
      const pPath = `pillars[${idx}]`;
      if (!p || typeof p !== 'object') {
        errors.push({ path: pPath, message: 'Pillar must be an object' });
        return;
      }
      const pillar = p as Record<string, unknown>;
      if (!pillar.id || typeof pillar.id !== 'string' || pillar.id.trim() === '') {
        errors.push({ path: `${pPath}.id`, message: 'Pillar id is required and must be a string' });
      } else {
        if (pillarIds.has(pillar.id)) {
          errors.push({ path: `${pPath}.id`, message: `Duplicate pillar ID "${pillar.id}"` });
        }
        pillarIds.add(pillar.id);
      }

      if (!pillar.name || typeof pillar.name !== 'string' || pillar.name.trim() === '') {
        errors.push({ path: `${pPath}.name`, message: 'Pillar name is required and must be a string' });
      }

      if (typeof pillar.description !== 'string' || pillar.description.trim() === '') {
        errors.push({ path: `${pPath}.description`, message: 'Pillar description is required and must be a string' });
      }

      if (pillar.ordering !== undefined && (typeof pillar.ordering !== 'number' || isNaN(pillar.ordering))) {
        errors.push({ path: `${pPath}.ordering`, message: 'Pillar ordering must be a valid number' });
      }
    });
  }

  // 4. Indicators validation
  if (!Array.isArray(obj.indicators) || obj.indicators.length === 0) {
    errors.push({ path: 'indicators', message: 'Standard indicators must be a non-empty array' });
  }

  const indicatorIds = new Set<string>();

  if (Array.isArray(obj.indicators)) {
    obj.indicators.forEach((ind, idx) => {
      const indPath = `indicators[${idx}]`;
      if (!ind || typeof ind !== 'object') {
        errors.push({ path: indPath, message: 'Indicator must be an object' });
        return;
      }
      const indicator = ind as Record<string, unknown>;

      // id
      if (!indicator.id || typeof indicator.id !== 'string' || indicator.id.trim() === '') {
        errors.push({ path: `${indPath}.id`, message: 'Indicator id is required and must be a string' });
      } else {
        if (indicatorIds.has(indicator.id)) {
          errors.push({ path: `${indPath}.id`, message: `Duplicate indicator ID "${indicator.id}"` });
        }
        indicatorIds.add(indicator.id);
      }

      // pillarId
      if (!indicator.pillarId || typeof indicator.pillarId !== 'string' || indicator.pillarId.trim() === '') {
        errors.push({ path: `${indPath}.pillarId`, message: 'Indicator pillarId is required and must be a string' });
      } else if (pillarIds.size > 0 && !pillarIds.has(indicator.pillarId)) {
        errors.push({
          path: `${indPath}.pillarId`,
          message: `Indicator references unknown pillarId "${indicator.pillarId}"`,
        });
      }

      // name
      if (!indicator.name || typeof indicator.name !== 'string' || indicator.name.trim() === '') {
        errors.push({ path: `${indPath}.name`, message: 'Indicator name is required and must be a string' });
      }

      // definition (or description for backwards compatibility)
      const definition = indicator.definition ?? indicator.description;
      if (!definition || typeof definition !== 'string' || (definition as string).trim() === '') {
        errors.push({ path: `${indPath}.definition`, message: 'Indicator definition is required and must be a string' });
      }

      // dataSource
      if (!indicator.dataSource || typeof indicator.dataSource !== 'string' || indicator.dataSource.trim() === '') {
        errors.push({ path: `${indPath}.dataSource`, message: 'Indicator dataSource is required and must be a string' });
      }

      // weight
      if (typeof indicator.weight !== 'number' || isNaN(indicator.weight) || indicator.weight <= 0) {
        errors.push({ path: `${indPath}.weight`, message: 'Indicator weight must be a positive number' });
      }

      // critical (or isCritical)
      const critical = indicator.critical !== undefined ? indicator.critical : indicator.isCritical;
      if (typeof critical !== 'boolean') {
        errors.push({ path: `${indPath}.critical`, message: 'Indicator critical flag must be a boolean' });
      }

      // evidence (or evidenceClassification)
      const evidence = (indicator.evidence ?? indicator.evidenceClassification) as string;
      if (!evidence || !VALID_EVIDENCE_TYPES.includes(evidence as EvidenceType)) {
        errors.push({
          path: `${indPath}.evidence`,
          message: `Indicator evidence must be one of: ${VALID_EVIDENCE_TYPES.join(', ')}`,
        });
      }

      // bands
      if (!Array.isArray(indicator.bands) || indicator.bands.length === 0) {
        errors.push({ path: `${indPath}.bands`, message: 'Indicator bands must be a non-empty array' });
      } else {
        indicator.bands.forEach((b, bIdx) => {
          const bPath = `${indPath}.bands[${bIdx}]`;
          if (!b || typeof b !== 'object') {
            errors.push({ path: bPath, message: 'Threshold band must be an object' });
            return;
          }
          const band = b as Record<string, unknown>;
          if (!band.level || !VALID_BAND_LEVELS.includes(band.level as BandLevel)) {
            errors.push({
              path: `${bPath}.level`,
              message: `Threshold band level must be one of: ${VALID_BAND_LEVELS.join(', ')}`,
            });
          }
        });
      }

      // refs
      if (indicator.refs !== undefined) {
        if (!Array.isArray(indicator.refs)) {
          errors.push({ path: `${indPath}.refs`, message: 'Indicator refs must be an array' });
        } else {
          indicator.refs.forEach((r, rIdx) => {
            const rPath = `${indPath}.refs[${rIdx}]`;
            if (!r || typeof r !== 'object') {
              errors.push({ path: rPath, message: 'Reference item must be an object' });
              return;
            }
            const ref = r as Record<string, unknown>;
            if (!ref.id || typeof ref.id !== 'string') {
              errors.push({ path: `${rPath}.id`, message: 'Reference id is required and must be a string' });
            }
            if (!ref.title || typeof ref.title !== 'string') {
              errors.push({ path: `${rPath}.title`, message: 'Reference title is required and must be a string' });
            }
          });
        }
      } else {
        errors.push({ path: `${indPath}.refs`, message: 'Indicator refs array is required' });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Asserts standard validity; returns the typed Standard or throws an informative error.
 */
export function assertValidStandard(data: unknown): Standard {
  const result = validateStandard(data);
  if (!result.valid) {
    const errorDetails = result.errors.map(e => ` - [${e.path}]: ${e.message}`).join('\n');
    throw new Error(`Canonical CareProof Standard validation failed:\n${errorDetails}`);
  }
  return data as Standard;
}
