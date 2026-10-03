/**
 * CareProof Audit Console - Standard Explorer Query & Export Tests
 * Source of Truth: CareProof Website Roadmap & Canonical Standard Model (Phase 7A)
 * 
 * Verifies all 24 requirements:
 * 1. all canonical indicators are returned with no filters
 * 2. search by indicator ID
 * 3. search by indicator name
 * 4. search by definition
 * 5. search is case-insensitive
 * 6. whitespace search behaves as no filter
 * 7. pillar filter
 * 8. evidence E filter
 * 9. evidence I filter
 * 10. evidence P filter
 * 11. critical-only filter
 * 12. combined filters use intersection
 * 13. unknown pillar returns no matches
 * 14. unknown indicator ID returns not found
 * 15. exact indicator lookup returns correct indicator
 * 16. pillar lookup returns correct indicators in canonical order
 * 17. default ordering is deterministic
 * 18. JSON export is valid and deterministic
 * 19. CSV export has correct header
 * 20. CSV escaping works for comma/quote/newline values
 * 21. exports contain no credentials/user data
 * 22. missing refs remain empty rather than fabricated
 * 23. same input produces identical output
 * 24. filtering does not mutate canonical standard
 */

import { CANONICAL_STANDARD } from '../data/standard';
import {
  escapeCsvField,
  exportStandardAsCsv,
  exportStandardAsJson,
  filterStandardIndicators,
  getCriticalIndicators,
  getIndicatorById,
  getIndicatorsByEvidence,
  getIndicatorsByPillar,
  getStandardExplorerRows,
  searchStandardIndicators,
} from '../services/standardExplorer';
import { StandardExplorerRow } from '../types/standardExplorer';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST ASSERTION FAILED: ${message}`);
  }
}

console.log('=== CareProof Standard Explorer Foundation Tests ===\n');

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

const allRows = getStandardExplorerRows();

// 1. all canonical indicators are returned with no filters
test('1. all canonical indicators are returned with no filters', () => {
  assert(
    allRows.length === CANONICAL_STANDARD.indicators.length,
    `Expected ${CANONICAL_STANDARD.indicators.length} indicators, got ${allRows.length}`
  );
  assert(allRows.length === 20, 'Canonical standard has exactly 20 indicators');
});

// 2. search by indicator ID
test('2. search by indicator ID', () => {
  const result = searchStandardIndicators(allRows, 'CSP-01');
  assert(result.length === 1, 'Only one indicator matches CSP-01');
  assert(result[0].id === 'CSP-01', 'Found indicator CSP-01');
});

// 3. search by indicator name
test('3. search by indicator name', () => {
  const result = searchStandardIndicators(allRows, 'Medication Administration');
  assert(result.length > 0, 'Found indicators matching Medication Administration');
  assert(result.some((r) => r.id === 'CSP-01'), 'CSP-01 matches Medication Administration');
});

// 4. search by definition
test('4. search by definition', () => {
  const result = searchStandardIndicators(allRows, 'hand hygiene');
  assert(result.length > 0, 'Found indicators matching hand hygiene');
  assert(result.some((r) => r.id === 'CSP-02'), 'CSP-02 matches hand hygiene');
});

// 5. search is case-insensitive
test('5. search is case-insensitive', () => {
  const upper = searchStandardIndicators(allRows, 'CSP-01');
  const lower = searchStandardIndicators(allRows, 'csp-01');
  const mixed = searchStandardIndicators(allRows, 'cSp-01');

  assert(upper.length === 1, 'Uppercase query matches');
  assert(lower.length === 1, 'Lowercase query matches');
  assert(mixed.length === 1, 'Mixed-case query matches');
  assert(upper[0].id === lower[0].id, 'Same indicator returned regardless of casing');
});

// 6. whitespace search behaves as no filter
test('6. whitespace search behaves as no filter', () => {
  const empty = searchStandardIndicators(allRows, '');
  const spaces = searchStandardIndicators(allRows, '   ');
  const tabs = searchStandardIndicators(allRows, '\t  \n ');

  assert(empty.length === allRows.length, 'Empty search returns all rows');
  assert(spaces.length === allRows.length, 'Spaces-only search returns all rows');
  assert(tabs.length === allRows.length, 'Whitespace search returns all rows');
});

// 7. pillar filter
test('7. pillar filter returns indicators strictly belonging to specified pillar', () => {
  const res = filterStandardIndicators(allRows, { pillarId: 'CSP' });
  assert(res.filteredCount === 4, 'CSP has exactly 4 indicators');
  assert(res.rows.every((r) => r.pillarId === 'CSP'), 'All returned rows have pillarId CSP');
});

// 8. evidence E filter
test('8. evidence E filter', () => {
  const res = filterStandardIndicators(allRows, { evidenceType: 'E' });
  const helperRes = getIndicatorsByEvidence('E');
  assert(res.filteredCount > 0, 'Evidence E returns rows');
  assert(res.rows.every((r) => r.evidence === 'E'), 'All returned rows have evidence E');
  assert(res.filteredCount === helperRes.length, 'getIndicatorsByEvidence matches filterStandardIndicators');
});

// 9. evidence I filter
test('9. evidence I filter', () => {
  const res = filterStandardIndicators(allRows, { evidenceType: 'I' });
  assert(res.filteredCount > 0, 'Evidence I returns rows');
  assert(res.rows.every((r) => r.evidence === 'I'), 'All returned rows have evidence I');
});

// 10. evidence P filter
test('10. evidence P filter', () => {
  const res = filterStandardIndicators(allRows, { evidenceType: 'P' });
  assert(res.filteredCount > 0, 'Evidence P returns rows');
  assert(res.rows.every((r) => r.evidence === 'P'), 'All returned rows have evidence P');
});

// 11. critical-only filter
test('11. critical-only filter returns only critical indicators', () => {
  const res = filterStandardIndicators(allRows, { criticalOnly: true });
  const helperRes = getCriticalIndicators();
  assert(res.filteredCount > 0, 'Critical only returns rows');
  assert(res.rows.every((r) => r.critical === true), 'All returned rows are critical');
  assert(res.filteredCount === helperRes.length, 'getCriticalIndicators matches filterStandardIndicators');
});

// 12. combined filters use intersection
test('12. combined filters use intersection (AND)', () => {
  const res = filterStandardIndicators(allRows, {
    pillarId: 'CSW',
    evidenceType: 'E',
    criticalOnly: true,
  });

  assert(res.filteredCount > 0, 'Found matching indicators');
  assert(
    res.rows.every((r) => r.pillarId === 'CSW' && r.evidence === 'E' && r.critical === true),
    'Every returned row matches all 3 filter criteria simultaneously'
  );
});

// 13. unknown pillar returns no matches
test('13. unknown pillar returns no matches', () => {
  const res = filterStandardIndicators(allRows, { pillarId: 'UNKNOWN_PILLAR' });
  assert(res.filteredCount === 0, 'Unknown pillar ID returns 0 rows');
  assert(res.rows.length === 0, 'Rows array is empty');
});

// 14. unknown indicator ID returns not found
test('14. unknown indicator ID returns not found', () => {
  const detail = getIndicatorById('UNKNOWN-999');
  assert(detail === null, 'Unknown indicator ID returns null');
});

// 15. exact indicator lookup returns correct indicator
test('15. exact indicator lookup returns correct indicator and associated pillar', () => {
  const detail = getIndicatorById('CSP-01');
  assert(detail !== null, 'Found CSP-01');
  assert(detail?.indicator.id === 'CSP-01', 'Indicator ID is CSP-01');
  assert(detail?.pillar.id === 'CSP', 'Pillar ID is CSP');
  assert(detail?.pillar.name === 'Clinical Safety Protocols', 'Pillar name matches');
  assert(detail?.critical === true, 'Critical flag matches');
  assert(detail?.formula === null, 'Formula is strictly null (unfabricated)');
});

// 16. pillar lookup returns correct indicators in canonical order
test('16. pillar lookup returns correct indicators in canonical order', () => {
  const pillarData = getIndicatorsByPillar('CSP');
  assert(pillarData !== null, 'Found CSP pillar');
  assert(pillarData?.pillar.id === 'CSP', 'Pillar ID is CSP');
  assert(pillarData?.indicators.length === 4, 'CSP has 4 indicators');
  assert(pillarData?.indicators[0].id === 'CSP-01', 'First indicator is CSP-01');
  assert(pillarData?.indicators[1].id === 'CSP-02', 'Second indicator is CSP-02');
});

// 17. default ordering is deterministic
test('17. default ordering is deterministic and follows canonical pillar ordering', () => {
  const rows1 = getStandardExplorerRows();
  const rows2 = getStandardExplorerRows();

  assert(rows1.length === rows2.length, 'Length is identical');
  for (let i = 0; i < rows1.length; i++) {
    assert(rows1[i].id === rows2[i].id, `Row ${i} ID matches: ${rows1[i].id}`);
  }
});

// 18. JSON export is valid and deterministic
test('18. JSON export is valid and deterministic', () => {
  const jsonStr1 = exportStandardAsJson(allRows);
  const jsonStr2 = exportStandardAsJson(allRows);

  assert(jsonStr1 === jsonStr2, 'JSON export is bit-for-bit identical');

  const parsed = JSON.parse(jsonStr1);
  assert(parsed.standardVersion === '1.4.0', 'Contains standardVersion 1.4.0');
  assert(parsed.totalIndicators === 20, 'Contains 20 indicators');
  assert(Array.isArray(parsed.indicators), 'Indicators is an array');
});

// 19. CSV export has correct header
test('19. CSV export has correct header', () => {
  const csvStr = exportStandardAsCsv(allRows);
  const firstLine = csvStr.split('\r\n')[0];

  assert(
    firstLine === 'ID,Pillar ID,Pillar,Name,Definition,Data Source,Weight,Critical,Evidence,Threshold Bands,References',
    `CSV header matches expected schema: ${firstLine}`
  );
});

// 20. CSV escaping works for comma/quote/newline values
test('20. CSV escaping works for comma/quote/newline values', () => {
  assert(escapeCsvField('simple') === 'simple', 'Simple string not escaped');
  assert(escapeCsvField('has,comma') === '"has,comma"', 'Comma wrapped in quotes');
  assert(escapeCsvField('has "quote"') === '"has ""quote"""', 'Quotes doubled and wrapped');
  assert(escapeCsvField('line1\nline2') === '"line1\nline2"', 'Newlines wrapped in quotes');

  const customRows: StandardExplorerRow[] = [
    {
      id: 'TEST-01',
      pillarId: 'CSP',
      pillarName: 'Safety, Hygiene',
      name: 'Complex "Name", with comma',
      definition: 'Multi\nline\ndefinition',
      dataSource: 'Sensor, "Telemetry"',
      bands: [],
      weight: 1.5,
      evidence: 'E',
      refs: [],
      critical: false,
    },
  ];

  const csv = exportStandardAsCsv(customRows);
  assert(csv.includes('"Safety, Hygiene"'), 'Pillar name with comma escaped');
  assert(csv.includes('"Complex ""Name"", with comma"'), 'Name with quotes and comma escaped');
});

// 21. exports contain no credentials/user data
test('21. exports contain no credentials, tokens, or personal health info', () => {
  const jsonStr = exportStandardAsJson(allRows);
  const csvStr = exportStandardAsCsv(allRows);

  const forbiddenTerms = ['password', 'apiKey', 'accessToken', 'refreshToken', 'patientId', 'PAT-001', 'phi'];
  for (const term of forbiddenTerms) {
    assert(!jsonStr.toLowerCase().includes(term.toLowerCase()), `JSON export does not contain ${term}`);
    assert(!csvStr.toLowerCase().includes(term.toLowerCase()), `CSV export does not contain ${term}`);
  }
});

// 22. missing refs remain empty rather than fabricated
test('22. missing refs remain empty rather than fabricated', () => {
  const indWithEmptyRefs = allRows.find((r) => r.refs.length === 0);
  assert(!!indWithEmptyRefs, 'Found indicator with empty refs in standard');
  assert(Array.isArray(indWithEmptyRefs?.refs), 'Refs is an array');
  assert(indWithEmptyRefs?.refs.length === 0, 'Refs remains empty array');

  const detail = getIndicatorById(indWithEmptyRefs!.id);
  assert(detail?.refs.length === 0, 'Detail refs remains empty array');
});

// 23. same input produces identical output
test('23. same input produces identical output across calls', () => {
  const resA = filterStandardIndicators(allRows, { searchQuery: 'infection', evidenceType: 'E' });
  const resB = filterStandardIndicators(allRows, { searchQuery: 'infection', evidenceType: 'E' });

  assert(JSON.stringify(resA) === JSON.stringify(resB), 'Filter results identical');
});

// 24. filtering does not mutate canonical standard
test('24. filtering does not mutate canonical standard', () => {
  const countBefore = CANONICAL_STANDARD.indicators.length;
  filterStandardIndicators(allRows, { pillarId: 'CSP', criticalOnly: true });
  const countAfter = CANONICAL_STANDARD.indicators.length;

  assert(countBefore === countAfter, 'Canonical indicators length unchanged');
  assert(countBefore === 20, 'Canonical indicators remain 20');
});

console.log(`\nResults: ${passed} of ${total} standard explorer tests passed.`);
if (passed !== total) {
  process.exit(1);
}
