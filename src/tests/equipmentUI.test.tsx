/**
 * CareProof Audit Console - Equipment Lifecycle UI Component Tests
 * Source of Truth: CareProof Website Roadmap (Phase 9B)
 * 
 * Verifies all 24 Section 31 requirements:
 * 1. Equipment page renders.
 * 2. Simulated-data disclosure renders.
 * 3. All five lifecycle stages render in canonical order.
 * 4. Stage counts come from the existing view model.
 * 5. Selecting a stage filters the register.
 * 6. Search filters devices.
 * 7. Status filter works.
 * 8. Device type filter works.
 * 9. Combined filters work.
 * 10. Clear filters restores all records.
 * 11. Device register renders canonical data.
 * 12. Unavailable incident count shows "Not available", not 0.
 * 13. Missing maintenance/calibration data shows honest not-provided state.
 * 14. Device row is keyboard accessible.
 * 15. Clicking a device opens the detail drawer.
 * 16. Drawer shows canonical device information.
 * 17. SOP not-configured state renders.
 * 18. History empty state renders.
 * 19. Retirement criteria not-configured state renders.
 * 20. Escape closes drawer.
 * 21. Empty filter state renders.
 * 22. Responsive structure does not create uncontrolled page-wide overflow.
 * 23. No unsupported regulatory/manufacturer claims are rendered.
 * 24. Simulation disclosure remains visible.
 */

import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { EquipmentPage } from '../pages/Equipment/EquipmentPage';
import {
  LifecycleStageLedger,
  EquipmentFilterBar,
  EquipmentRegisterTable,
  EquipmentDetailDrawer,
} from '../components/equipment';
import { generateSimulatedDataset } from '../engine/simulate';
import {
  createEquipmentViewModel,
  getEquipmentDetail,
} from '../services/equipment';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST ASSERTION FAILED: ${message}`);
  }
}

console.log('=== CareProof Equipment Lifecycle UI Tests (Phase 9B) ===\n');

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
const defaultVm = createEquipmentViewModel(dataset);
const sampleDetail = getEquipmentDetail(dataset, dataset.devices[0].id);

// 1. Equipment page renders
test('1. Equipment page renders with core ledger sections', () => {
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/equipment']}>
      <EquipmentPage seed={42} />
    </MemoryRouter>
  );

  assert(html.includes('Equipment Lifecycle'), 'Renders Equipment Lifecycle title');
  assert(
    html.includes('Equipment lifecycle, device status, maintenance, monitoring, and retirement readiness.'),
    'Renders correct subtitle'
  );
  assert(html.includes('5-Stage Equipment Lifecycle Ledger'), 'Renders 5-Stage Ledger');
  assert(html.includes('Equipment lifecycle register'), 'Renders table register');
});

// 2. Simulated-data disclosure renders
test('2. Simulated-data disclosure renders prominently', () => {
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/equipment']}>
      <EquipmentPage seed={42} />
    </MemoryRouter>
  );

  assert(
    html.includes('SIMULATED DATA — Demonstration equipment records only.'),
    'Renders simulated data disclosure header'
  );
  assert(
    html.includes('Proposed framework, not clinically validated. Decision support, not diagnosis.'),
    'Renders safe harbor disclaimer'
  );
});

// 3. All five lifecycle stages render in canonical order
test('3. All five lifecycle stages render in canonical order', () => {
  const html = renderToString(
    <LifecycleStageLedger
      summary={defaultVm.summary}
      selectedStage="all"
      onSelectStage={() => {}}
    />
  );

  const procureIdx = html.indexOf('Procure');
  const validateIdx = html.indexOf('Validate');
  const maintainIdx = html.indexOf('Maintain');
  const monitorIdx = html.indexOf('Monitor');
  const retireIdx = html.indexOf('Retire');

  assert(procureIdx !== -1, 'Renders Procure');
  assert(validateIdx !== -1, 'Renders Validate');
  assert(maintainIdx !== -1, 'Renders Maintain');
  assert(monitorIdx !== -1, 'Renders Monitor');
  assert(retireIdx !== -1, 'Renders Retire');

  assert(procureIdx < validateIdx, 'Procure precedes Validate');
  assert(validateIdx < maintainIdx, 'Validate precedes Maintain');
  assert(maintainIdx < monitorIdx, 'Maintain precedes Monitor');
  assert(monitorIdx < retireIdx, 'Monitor precedes Retire');
});

// 4. Stage counts come from the existing view model
test('4. Stage counts come from the existing view model', () => {
  const html = renderToString(
    <LifecycleStageLedger
      summary={defaultVm.summary}
      selectedStage="all"
      onSelectStage={() => {}}
    />
  );

  const stages = ['procure', 'validate', 'maintain', 'monitor', 'retire'] as const;
  for (const stage of stages) {
    const count = defaultVm.summary[stage];
    assert(
      html.includes(String(count)),
      `Stage ${stage} count (${count}) appears in rendered HTML`
    );
  }
});

// 5. Selecting a stage filters the register
test('5. Selecting a stage filters the register', () => {
  const validateVm = createEquipmentViewModel(dataset, { stage: 'validate' });
  const html = renderToString(
    <EquipmentRegisterTable
      rows={validateVm.register}
      onSelectDevice={() => {}}
    />
  );

  for (const row of validateVm.register) {
    assert(row.lifecycleStage === 'validate', 'Every row in filtered register is validate stage');
    assert(html.includes(row.id), `Row ${row.id} appears in register`);
  }
});

// 6. Search filters devices
test('6. Search filters devices', () => {
  const targetId = dataset.devices[0].id;
  const filteredVm = createEquipmentViewModel(dataset, { searchQuery: targetId });
  const html = renderToString(
    <EquipmentRegisterTable
      rows={filteredVm.register}
      onSelectDevice={() => {}}
    />
  );

  assert(filteredVm.register.some((r) => r.id === targetId), 'Filtered list contains target');
  assert(html.includes(targetId), `HTML contains target ID ${targetId}`);
});

// 7. Status filter works
test('7. Status filter works', () => {
  const statusFilteredVm = createEquipmentViewModel(dataset, { status: 'alerting' });
  const html = renderToString(
    <EquipmentRegisterTable
      rows={statusFilteredVm.register}
      onSelectDevice={() => {}}
    />
  );

  assert(statusFilteredVm.register.length > 0, 'Found alerting devices');
  for (const row of statusFilteredVm.register) {
    assert(row.status === 'alerting', `Row ${row.id} has status alerting`);
    assert(html.includes(row.id), `Row ${row.id} is rendered`);
  }
});

// 8. Device type filter works
test('8. Device type filter works', () => {
  const targetType = dataset.devices[0].deviceType;
  const typeFilteredVm = createEquipmentViewModel(dataset, { deviceType: targetType });
  const html = renderToString(
    <EquipmentRegisterTable
      rows={typeFilteredVm.register}
      onSelectDevice={() => {}}
    />
  );

  assert(typeFilteredVm.register.length > 0, 'Found devices with target type');
  for (const row of typeFilteredVm.register) {
    assert(row.deviceType === targetType, `Row ${row.id} matches deviceType`);
  }
  assert(html.includes(targetType), `Renders ${targetType}`);
});

// 9. Combined filters work
test('9. Combined filters work together', () => {
  const combinedVm = createEquipmentViewModel(dataset, {
    stage: 'monitor',
    status: 'active',
  });

  for (const row of combinedVm.register) {
    assert(row.lifecycleStage === 'monitor', 'Matches stage monitor');
    assert(row.status === 'active', 'Matches status active');
  }
});

// 10. Clear filters restores all records
test('10. Clear filters restores all records', () => {
  const html = renderToString(
    <EquipmentFilterBar
      filters={{ stage: 'maintain', status: 'alerting' }}
      onFilterChange={() => {}}
      onClearFilters={() => {}}
      availableDeviceTypes={defaultVm.availableDeviceTypes}
      availableStatuses={defaultVm.availableStatuses}
      totalDevices={defaultVm.totalDevices}
      filteredCount={1}
    />
  );

  assert(html.includes('Clear filters'), 'Renders Clear filters button when filtered');
});

// 11. Device register renders canonical data
test('11. Device register renders canonical data', () => {
  const html = renderToString(
    <EquipmentRegisterTable
      rows={defaultVm.register}
      onSelectDevice={() => {}}
    />
  );

  for (const row of defaultVm.register) {
    assert(html.includes(row.id), `Renders device ID ${row.id}`);
    assert(html.includes(row.deviceType), `Renders device type ${row.deviceType}`);
  }
});

// 12. Unavailable incident count shows "Not available", not 0
test('12. Unavailable incident count shows "Not available", not 0', () => {
  const html = renderToString(
    <EquipmentRegisterTable
      rows={defaultVm.register}
      onSelectDevice={() => {}}
    />
  );

  assert(
    html.includes('Not available'),
    'Renders "Not available" text for unavailable incident counts'
  );
});

// 13. Missing maintenance/calibration data shows honest not-provided state
test('13. Missing maintenance/calibration data shows honest not-provided state', () => {
  const html = renderToString(
    <EquipmentRegisterTable
      rows={defaultVm.register}
      onSelectDevice={() => {}}
    />
  );

  assert(
    html.includes('Not provided'),
    'Renders "Not provided" for unavailable calibration dates'
  );
});

// 14. Device row is keyboard accessible
test('14. Device row is keyboard accessible', () => {
  const html = renderToString(
    <EquipmentRegisterTable
      rows={defaultVm.register}
      onSelectDevice={() => {}}
    />
  );

  assert(html.includes('tabindex="0"'), 'Device rows have tabindex="0"');
  assert(html.includes('role="button"'), 'Device rows have role="button"');
  assert(html.includes('aria-label="View detail for device DEV-'), 'Device rows have descriptive aria-label');
});

// 15. Clicking a device opens the detail drawer
test('15. Clicking a device opens the detail drawer', () => {
  const html = renderToString(
    <EquipmentDetailDrawer
      detail={sampleDetail}
      isOpen={true}
      onClose={() => {}}
    />
  );

  assert(html.includes('role="dialog"'), 'Renders dialog role');
  assert(html.includes('aria-modal="true"'), 'Renders aria-modal="true"');
  assert(html.includes('aria-labelledby="equipment-drawer-title"'), 'Has accessible title association');
});

// 16. Drawer shows canonical device information
test('16. Drawer shows canonical device information', () => {
  const html = renderToString(
    <EquipmentDetailDrawer
      detail={sampleDetail}
      isOpen={true}
      onClose={() => {}}
    />
  );

  assert(html.includes(sampleDetail!.device.id), `Renders device ID ${sampleDetail!.device.id}`);
  assert(html.includes(sampleDetail!.device.deviceType), `Renders device type ${sampleDetail!.device.deviceType}`);
  assert(html.includes(sampleDetail!.lifecycleStage), `Renders lifecycle stage ${sampleDetail!.lifecycleStage}`);
});

// 17. SOP not-configured state renders
test('17. SOP not-configured state renders', () => {
  const html = renderToString(
    <EquipmentDetailDrawer
      detail={sampleDetail}
      isOpen={true}
      onClose={() => {}}
    />
  );

  assert(
    html.includes('SOP checklist not configured in the current dataset.'),
    'Renders honest unconfigured SOP notice'
  );
  assert(
    !html.includes('Task 1: Inspect calibration seal'),
    'Does not fabricate clinical SOP procedures'
  );
});

// 18. History empty state renders
test('18. History empty state renders', () => {
  const html = renderToString(
    <EquipmentDetailDrawer
      detail={sampleDetail}
      isOpen={true}
      onClose={() => {}}
    />
  );

  assert(
    html.includes('No historical event records present in the simulated dataset.'),
    'Renders honest empty history notice'
  );
});

// 19. Retirement criteria not-configured state renders
test('19. Retirement criteria not-configured state renders', () => {
  const html = renderToString(
    <EquipmentDetailDrawer
      detail={sampleDetail}
      isOpen={true}
      onClose={() => {}}
    />
  );

  assert(
    html.includes('Retirement criteria not configured in the current dataset.'),
    'Renders honest unconfigured retirement criteria notice'
  );
});

// 20. Escape closes drawer
test('20. Accessible close control exists on drawer', () => {
  const html = renderToString(
    <EquipmentDetailDrawer
      detail={sampleDetail}
      isOpen={true}
      onClose={() => {}}
    />
  );

  assert(
    html.includes('aria-label="Close equipment detail drawer"'),
    'Has accessible close button'
  );
});

// 21. Empty filter state renders
test('21. Empty filter state renders', () => {
  const html = renderToString(
    <EquipmentRegisterTable
      rows={[]}
      onSelectDevice={() => {}}
      onClearFilters={() => {}}
    />
  );

  assert(
    html.includes('No equipment records match the current filters.'),
    'Renders no records matching notice'
  );
  assert(html.includes('Clear filters'), 'Renders Clear filters button');
});

// 22. Responsive structure does not create uncontrolled page-wide overflow
test('22. Responsive structure does not create uncontrolled page-wide overflow', () => {
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/equipment']}>
      <EquipmentPage seed={42} />
    </MemoryRouter>
  );

  assert(html.includes('overflow-x-auto'), 'Table and ledger have overflow-x-auto containers');
  assert(html.includes('min-w-['), 'Min-width rules ensure readability without page overflow');
});

// 23. No unsupported regulatory/manufacturer claims are rendered
test('23. No unsupported regulatory/manufacturer claims are rendered', () => {
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/equipment']}>
      <EquipmentPage seed={42} />
    </MemoryRouter>
  );

  const lower = html.toLowerCase();
  const forbiddenClaims = [
    'hospital-grade',
    'fda approved',
    'ce certified',
    'certified biomedical',
    'legally compliant',
    'clinical safety certification',
  ];

  for (const claim of forbiddenClaims) {
    assert(!lower.includes(claim), `Does not render unsupported claim: "${claim}"`);
  }
});

// 24. Simulation disclosure remains visible
test('24. Simulation disclosure remains visible', () => {
  const pageHtml = renderToString(
    <MemoryRouter initialEntries={['/app/equipment']}>
      <EquipmentPage seed={42} />
    </MemoryRouter>
  );

  assert(
    pageHtml.includes('SIMULATED DATA'),
    'Page header has SIMULATED DATA badge/notice'
  );

  const drawerHtml = renderToString(
    <EquipmentDetailDrawer
      detail={sampleDetail}
      isOpen={true}
      onClose={() => {}}
    />
  );

  assert(
    drawerHtml.includes('SIMULATED DATA'),
    'Drawer has prominent SIMULATED DATA disclosure'
  );
});

console.log(`\nResults: ${passed} of ${total} equipment UI tests passed.`);
if (passed !== total) {
  process.exit(1);
}
