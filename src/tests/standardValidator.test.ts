/**
 * CareProof Audit Console - Canonical Standard Validator Test Suite
 * Tests all 9 validation scenarios specified by roadmap requirements:
 * 1. Valid structure is accepted
 * 2. Missing required field is rejected
 * 3. Duplicate indicator ID is rejected
 * 4. Invalid evidence value is rejected
 * 5. Unknown pillarId is rejected
 * 6. Invalid weight type is rejected
 * 7. Invalid critical type is rejected
 * 8. Malformed reference is rejected
 * 9. Malformed threshold structure is rejected
 */

import standardData from '../data/standard.json';
import { validateStandard, assertValidStandard } from '../data/standardValidator';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST ASSERTION FAILED: ${message}`);
  }
}

console.log('=== CareProof Canonical Standard Validator Tests ===\n');

let passed = 0;
let total = 0;

function test(name: string, fn: () => void) {
  total++;
  try {
    fn();
    console.log(`✓ PASS: ${name}`);
    passed++;
  } catch (err: unknown) {
    console.error(`✗ FAIL: ${name}`);
    console.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}

// 1. Valid structure is accepted
test('1. Valid canonical standard structure is accepted without errors', () => {
  const result = validateStandard(standardData);
  assert(result.valid === true, `Expected valid, got errors: ${JSON.stringify(result.errors)}`);
  assert(result.errors.length === 0, `Expected 0 errors, got ${result.errors.length}`);

  // assertValidStandard returns the typed object
  const validated = assertValidStandard(standardData);
  assert(validated.version === '1.4.0', 'Version matches 1.4.0');
  assert(validated.pillars.length === 5, 'Has exactly 5 canonical pillars');
  assert(validated.indicators.length === 20, 'Has exactly 20 canonical indicators');
});

// 2. Missing required field is rejected
test('2. Missing required field (e.g. indicator definition) is rejected', () => {
  const invalidData = JSON.parse(JSON.stringify(standardData));
  delete invalidData.indicators[0].definition;
  delete invalidData.indicators[0].description;

  const result = validateStandard(invalidData);
  assert(result.valid === false, 'Expected validation failure for missing definition');
  assert(
    result.errors.some(e => e.path.includes('definition')),
    'Expected error message regarding missing definition'
  );
});

// 3. Duplicate indicator ID is rejected
test('3. Duplicate indicator ID is rejected', () => {
  const invalidData = JSON.parse(JSON.stringify(standardData));
  // Set second indicator ID to match first
  invalidData.indicators[1].id = invalidData.indicators[0].id;

  const result = validateStandard(invalidData);
  assert(result.valid === false, 'Expected validation failure for duplicate indicator ID');
  assert(
    result.errors.some(e => e.message.includes('Duplicate indicator ID')),
    'Expected duplicate indicator ID error message'
  );
});

// 4. Invalid evidence value is rejected
test('4. Invalid evidence value (e.g. "X") is rejected', () => {
  const invalidData = JSON.parse(JSON.stringify(standardData));
  invalidData.indicators[0].evidence = 'X';
  invalidData.indicators[0].evidenceClassification = 'X';

  const result = validateStandard(invalidData);
  assert(result.valid === false, 'Expected validation failure for invalid evidence value');
  assert(
    result.errors.some(e => e.path.includes('evidence')),
    'Expected error message regarding invalid evidence type'
  );
});

// 5. Unknown pillarId is rejected
test('5. Indicator referencing unknown pillarId is rejected', () => {
  const invalidData = JSON.parse(JSON.stringify(standardData));
  invalidData.indicators[0].pillarId = 'NONEXISTENT_PILLAR';

  const result = validateStandard(invalidData);
  assert(result.valid === false, 'Expected validation failure for unknown pillarId');
  assert(
    result.errors.some(e => e.message.includes('unknown pillarId')),
    'Expected error message regarding unknown pillarId'
  );
});

// 6. Invalid weight type is rejected
test('6. Invalid weight type (e.g. string or negative number) is rejected', () => {
  const invalidData1 = JSON.parse(JSON.stringify(standardData));
  invalidData1.indicators[0].weight = 'heavy'; // string instead of number

  const result1 = validateStandard(invalidData1);
  assert(result1.valid === false, 'Expected validation failure for string weight');
  assert(
    result1.errors.some(e => e.path.includes('weight')),
    'Expected weight error for string'
  );

  const invalidData2 = JSON.parse(JSON.stringify(standardData));
  invalidData2.indicators[0].weight = -1; // negative weight

  const result2 = validateStandard(invalidData2);
  assert(result2.valid === false, 'Expected validation failure for negative weight');
  assert(
    result2.errors.some(e => e.path.includes('weight')),
    'Expected weight error for negative value'
  );
});

// 7. Invalid critical type is rejected
test('7. Invalid critical flag type (non-boolean) is rejected', () => {
  const invalidData = JSON.parse(JSON.stringify(standardData));
  invalidData.indicators[0].critical = 'yes'; // string instead of boolean
  delete invalidData.indicators[0].isCritical;

  const result = validateStandard(invalidData);
  assert(result.valid === false, 'Expected validation failure for string critical flag');
  assert(
    result.errors.some(e => e.path.includes('critical')),
    'Expected error message regarding critical boolean flag'
  );
});

// 8. Malformed reference is rejected
test('8. Malformed reference structure is rejected', () => {
  const invalidData = JSON.parse(JSON.stringify(standardData));
  // Add malformed reference without title
  invalidData.indicators[0].refs = [{ id: 'ref-1' /* missing title */ }];

  const result = validateStandard(invalidData);
  assert(result.valid === false, 'Expected validation failure for malformed reference');
  assert(
    result.errors.some(e => e.path.includes('refs[0].title')),
    'Expected error message regarding missing reference title'
  );
});

// 9. Malformed threshold structure is rejected
test('9. Malformed threshold structure (empty bands or invalid level) is rejected', () => {
  const invalidData1 = JSON.parse(JSON.stringify(standardData));
  invalidData1.indicators[0].bands = []; // empty bands array

  const result1 = validateStandard(invalidData1);
  assert(result1.valid === false, 'Expected validation failure for empty bands');
  assert(
    result1.errors.some(e => e.path.includes('bands')),
    'Expected error message regarding empty bands'
  );

  const invalidData2 = JSON.parse(JSON.stringify(standardData));
  invalidData2.indicators[0].bands = [{ level: 'InvalidLevel' }]; // unknown band level

  const result2 = validateStandard(invalidData2);
  assert(result2.valid === false, 'Expected validation failure for invalid band level');
  assert(
    result2.errors.some(e => e.path.includes('bands[0].level')),
    'Expected error message regarding threshold band level'
  );
});

console.log(`\nResults: ${passed} of ${total} canonical standard validation tests passed.`);
if (passed !== total) {
  process.exit(1);
}
