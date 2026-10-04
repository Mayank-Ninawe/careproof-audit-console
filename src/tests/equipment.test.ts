/**
 * CareProof Audit Console - Equipment Lifecycle Pure Logic Tests
 * Source of Truth: CareProof Website Roadmap (Phase 9A)
 * 
 * Verifies all 20 Section 22 requirements:
 * 1. lifecycle stage order is correct
 * 2. lifecycle summary counts match dataset
 * 3. register rows are deterministic
 * 4. register contains all devices
 * 5. device filtering by stage works
 * 6. device filtering by status works
 * 7. device filtering by type works
 * 8. device lookup by ID works
 * 9. unknown device returns not-found/empty state
 * 10. maintenance date is preserved
 * 11. uptime is preserved
 * 12. alert count is preserved
 * 13. incident count remains unavailable when source data is unavailable
 * 14. no fake SOP steps are generated
 * 15. no fake history entries are generated
 * 16. no fake retirement criteria are generated
 * 17. simulated metadata is preserved
 * 18. deterministic sorting works
 * 19. same dataset produces identical view models
 * 20. no unrelated patient/auth data enters the equipment model
 */

import { generateSimulatedDataset } from '../engine/simulate';
import {
  createEquipmentViewModel,
  filterEquipmentRegister,
  getEquipmentDetail,
  getEquipmentLifecycleSummary,
  getEquipmentRegister,
  sortEquipmentRegister,
} from '../services/equipment';
import { CANONICAL_EQUIPMENT_STAGES, EquipmentLifecycleStage } from '../types/equipment';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST ASSERTION FAILED: ${message}`);
  }
}

console.log('=== CareProof Equipment Lifecycle Data & Logic Tests (Phase 9A) ===\n');

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

const dataset = generateSimulatedDataset(42);

// 1. Lifecycle stage order is correct
test('1. lifecycle stage order is correct', () => {
  const expectedOrder: EquipmentLifecycleStage[] = [
    'procure',
    'validate',
    'maintain',
    'monitor',
    'retire',
  ];

  assert(
    CANONICAL_EQUIPMENT_STAGES.length === 5,
    'Canonical stages has exactly 5 stages'
  );
  for (let i = 0; i < expectedOrder.length; i++) {
    assert(
      CANONICAL_EQUIPMENT_STAGES[i] === expectedOrder[i],
      `Stage ${i} is ${expectedOrder[i]}`
    );
  }

  const summary = getEquipmentLifecycleSummary(dataset);
  assert(
    summary.stageOrder.length === 5,
    'Summary stageOrder contains all 5 stages'
  );
  for (let i = 0; i < expectedOrder.length; i++) {
    assert(
      summary.stageOrder[i] === expectedOrder[i],
      `Summary stageOrder ${i} matches ${expectedOrder[i]}`
    );
  }
});

// 2. Lifecycle summary counts match dataset
test('2. lifecycle summary counts match dataset', () => {
  const summary = getEquipmentLifecycleSummary(dataset);
  const calculatedSum =
    summary.procure +
    summary.validate +
    summary.maintain +
    summary.monitor +
    summary.retire;

  assert(
    summary.totalDevices === dataset.devices.length,
    `Total devices in summary (${summary.totalDevices}) matches dataset.devices.length (${dataset.devices.length})`
  );
  assert(
    calculatedSum === dataset.devices.length,
    `Sum of stage counts (${calculatedSum}) equals dataset total (${dataset.devices.length})`
  );
});

// 3. Register rows are deterministic
test('3. register rows are deterministic', () => {
  const run1 = getEquipmentRegister(dataset);
  const run2 = getEquipmentRegister(dataset);

  assert(run1.length === run2.length, 'Register lengths match');
  for (let i = 0; i < run1.length; i++) {
    assert(run1[i].id === run2[i].id, `Row ${i} ID matches`);
    assert(run1[i].deviceType === run2[i].deviceType, `Row ${i} deviceType matches`);
    assert(run1[i].lifecycleStage === run2[i].lifecycleStage, `Row ${i} stage matches`);
    assert(run1[i].status === run2[i].status, `Row ${i} status matches`);
    assert(run1[i].uptimePercent === run2[i].uptimePercent, `Row ${i} uptime matches`);
  }
});

// 4. Register contains all devices
test('4. register contains all devices', () => {
  const register = getEquipmentRegister(dataset);

  assert(
    register.length === dataset.devices.length,
    `Register row count (${register.length}) equals dataset device count (${dataset.devices.length})`
  );

  const registerIds = new Set(register.map((r) => r.id));
  for (const dev of dataset.devices) {
    assert(registerIds.has(dev.id), `Dataset device ${dev.id} exists in register`);
  }
});

// 5. Device filtering by stage works
test('5. device filtering by stage works', () => {
  const allRows = getEquipmentRegister(dataset);

  for (const stage of CANONICAL_EQUIPMENT_STAGES) {
    const filtered = filterEquipmentRegister(allRows, { stage });
    assert(
      filtered.every((r) => r.lifecycleStage === stage),
      `Every row in stage filter "${stage}" has lifecycleStage === "${stage}"`
    );
  }

  // Filter "all" returns all rows
  const allFiltered = filterEquipmentRegister(allRows, { stage: 'all' });
  assert(allFiltered.length === allRows.length, 'Stage filter "all" returns all rows');
});

// 6. Device filtering by status works
test('6. device filtering by status works', () => {
  const allRows = getEquipmentRegister(dataset);
  const sampleStatus = allRows[0].status;

  const filtered = filterEquipmentRegister(allRows, { status: sampleStatus });
  assert(
    filtered.every((r) => r.status === sampleStatus),
    `Filtered rows strictly have status "${sampleStatus}"`
  );
  assert(filtered.length > 0, `At least one device matches status "${sampleStatus}"`);
});

// 7. Device filtering by type works
test('7. device filtering by type works', () => {
  const allRows = getEquipmentRegister(dataset);
  const sampleType = allRows[0].deviceType;

  const filtered = filterEquipmentRegister(allRows, { deviceType: sampleType });
  assert(
    filtered.every((r) => r.deviceType === sampleType),
    `Filtered rows strictly match deviceType "${sampleType}"`
  );
  assert(filtered.length > 0, `At least one device matches deviceType "${sampleType}"`);
});

// 8. Device lookup by ID works
test('8. device lookup by ID works', () => {
  const targetId = dataset.devices[0].id;
  const detail = getEquipmentDetail(dataset, targetId);

  assert(detail !== null, 'Found device detail by ID');
  assert(detail!.device.id === targetId, 'Returned detail has matching device ID');
  assert(detail!.device.deviceType === dataset.devices[0].deviceType, 'Device type matches source');
  assert(detail!.isSimulated === true, 'Detail carries isSimulated: true');
});

// 9. Unknown device returns not-found/empty state
test('9. unknown device returns not-found/empty state', () => {
  const detail = getEquipmentDetail(dataset, 'DEV-NONEXISTENT-999');
  assert(detail === null, 'Unknown device ID returns strictly null');
});

// 10. Maintenance date is preserved
test('10. maintenance date is preserved', () => {
  const targetDev = dataset.devices[0];
  const register = getEquipmentRegister(dataset);
  const matchedRow = register.find((r) => r.id === targetDev.id);

  assert(Boolean(matchedRow), 'Found matching row in register');
  assert(
    matchedRow!.nextMaintenanceDate === targetDev.nextMaintenance,
    `nextMaintenanceDate "${matchedRow!.nextMaintenanceDate}" matches source "${targetDev.nextMaintenance}"`
  );
});

// 11. Uptime is preserved
test('11. uptime is preserved', () => {
  const targetDev = dataset.devices[0];
  const register = getEquipmentRegister(dataset);
  const matchedRow = register.find((r) => r.id === targetDev.id);

  assert(Boolean(matchedRow), 'Found matching row in register');
  assert(
    matchedRow!.uptimePercent === targetDev.uptimePercent,
    `uptimePercent ${matchedRow!.uptimePercent} matches source ${targetDev.uptimePercent}`
  );
});

// 12. Alert count is preserved
test('12. alert count is preserved', () => {
  const targetDev = dataset.devices[0];
  const register = getEquipmentRegister(dataset);
  const matchedRow = register.find((r) => r.id === targetDev.id);

  assert(Boolean(matchedRow), 'Found matching row in register');
  assert(
    matchedRow!.alertCount === targetDev.alertCount,
    `alertCount ${matchedRow!.alertCount} matches source ${targetDev.alertCount}`
  );
});

// 13. Incident count remains unavailable when source data is unavailable
test('13. incident count remains unavailable when source data is unavailable', () => {
  const register = getEquipmentRegister(dataset);
  for (const row of register) {
    assert(
      row.incidentCount === null,
      `Row ${row.id} reports incidentCount as null rather than fabricated count`
    );
  }

  const detail = getEquipmentDetail(dataset, dataset.devices[0].id);
  assert(detail !== null, 'Detail exists');
  assert(
    detail!.incidentCount === null,
    'Detail reports incidentCount as null when unavailable in simulation model'
  );
});

// 14. No fake SOP steps are generated
test('14. no fake SOP steps are generated', () => {
  const detail = getEquipmentDetail(dataset, dataset.devices[0].id);
  assert(detail !== null, 'Detail exists');
  assert(
    detail!.sopChecklist.status === 'not_configured',
    'SOP checklist status is "not_configured"'
  );
  assert(
    detail!.sopChecklist.items.length === 0,
    'SOP checklist items list is strictly empty'
  );
  assert(
    detail!.sopChecklist.notice.includes('not configured'),
    'Notice explicitly states SOP is not configured'
  );
});

// 15. No fake history entries are generated
test('15. no fake history entries are generated', () => {
  const detail = getEquipmentDetail(dataset, dataset.devices[0].id);
  assert(detail !== null, 'Detail exists');
  assert(
    detail!.historyLog.status === 'empty',
    'History log status is "empty"'
  );
  assert(
    detail!.historyLog.entries.length === 0,
    'History log entries list is strictly empty'
  );
});

// 16. No fake retirement criteria are generated
test('16. no fake retirement criteria are generated', () => {
  const detail = getEquipmentDetail(dataset, dataset.devices[0].id);
  assert(detail !== null, 'Detail exists');
  assert(
    detail!.retireCriteria.status === 'not_configured',
    'Retirement criteria status is "not_configured"'
  );
  assert(
    detail!.retireCriteria.criteriaList.length === 0,
    'Criteria list is strictly empty'
  );
  assert(
    detail!.retireCriteria.maxAgeMonths === null,
    'maxAgeMonths is null'
  );
  assert(
    detail!.retireCriteria.minUptimePercent === null,
    'minUptimePercent is null'
  );
});

// 17. Simulated metadata is preserved
test('17. simulated metadata is preserved', () => {
  const register = getEquipmentRegister(dataset);
  assert(
    register.every((r) => r.isSimulated === true),
    'Every register row carries isSimulated: true'
  );

  const detail = getEquipmentDetail(dataset, dataset.devices[0].id);
  assert(detail!.isSimulated === true, 'Detail carries isSimulated: true');
  assert(detail!.device.isSimulated === true, 'Detail device entity carries isSimulated: true');

  const vm = createEquipmentViewModel(dataset);
  assert(vm.isSimulated === true, 'ViewModel carries isSimulated: true');
});

// 18. Deterministic sorting works
test('18. deterministic sorting works', () => {
  const register = getEquipmentRegister(dataset);
  const stageIndices: Record<EquipmentLifecycleStage, number> = {
    procure: 0,
    validate: 1,
    maintain: 2,
    monitor: 3,
    retire: 4,
  };

  for (let i = 1; i < register.length; i++) {
    const prev = register[i - 1];
    const curr = register[i];
    const prevStageIdx = stageIndices[prev.lifecycleStage];
    const currStageIdx = stageIndices[curr.lifecycleStage];

    assert(
      currStageIdx >= prevStageIdx,
      `Stage at ${i} (${curr.lifecycleStage}) is >= previous stage (${prev.lifecycleStage})`
    );

    if (currStageIdx === prevStageIdx) {
      assert(
        curr.id.localeCompare(prev.id) >= 0,
        `Device ID at ${i} (${curr.id}) is >= previous ID (${prev.id}) within same stage`
      );
    }
  }

  // Idempotency: sorting already sorted array produces identical output
  const resort = sortEquipmentRegister(register);
  for (let i = 0; i < register.length; i++) {
    assert(resort[i].id === register[i].id, `Resorted ID at ${i} matches`);
  }
});

// 19. Same dataset produces identical view models
test('19. same dataset produces identical view models', () => {
  const vm1 = createEquipmentViewModel(dataset);
  const vm2 = createEquipmentViewModel(dataset);

  assert(
    JSON.stringify(vm1) === JSON.stringify(vm2),
    'View models are bit-for-bit identical across runs'
  );
});

// 20. No unrelated patient/auth data enters the equipment model
test('20. no unrelated patient/auth data enters the equipment model', () => {
  const vm = createEquipmentViewModel(dataset);
  const serialized = JSON.stringify(vm).toLowerCase();

  const forbiddenTerms = [
    'patientid',
    'channel1',
    'channel2',
    'userprofile',
    'password',
    'caregiverid',
    'token',
    'secret',
  ];

  for (const term of forbiddenTerms) {
    assert(
      !serialized.includes(`"${term}"`),
      `Equipment ViewModel does not contain unrelated domain key "${term}"`
    );
  }
});

console.log(`\nResults: ${passed} of ${total} equipment logic tests passed.`);
if (passed !== total) {
  process.exit(1);
}
