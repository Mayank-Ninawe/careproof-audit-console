/**
 * CareProof Audit Console - Equipment Lifecycle Pure Data Service
 * Source of Truth: CareProof Website Roadmap (Phase 9A)
 * 
 * ARCHITECTURAL CONTRACT:
 * 1. 5-Stage Ledger: procure -> validate -> maintain -> monitor -> retire
 * 2. Pure & Side-Effect Free: Zero React, DOM, or Firebase dependencies.
 * 3. Deterministic: Predictable output matching source simulation dataset.
 * 4. Regulatory & Clinical Safety:
 *    - No invented calibration intervals or biomedical legal rules.
 *    - No fabricated incident counts (represented explicitly as null when unavailable).
 *    - No fake SOP steps or arbitrary retirement rules.
 * 5. Safe Harbor:
 *    - "Proposed framework, not clinically validated. Decision support, not diagnosis."
 */

import { SimulatedDataset } from '../types/simulation';
import {
  CANONICAL_EQUIPMENT_STAGES,
  EquipmentDetail,
  EquipmentFilterOptions,
  EquipmentHistoryLog,
  EquipmentLifecycleStage,
  EquipmentLifecycleSummary,
  EquipmentRegisterRow,
  EquipmentRetirementCriteria,
  EquipmentSOPChecklist,
  EquipmentStatus,
  EquipmentViewModel,
  SimulatedEquipmentRecord,
} from '../types/equipment';

export const EQUIPMENT_SAFE_HARBOR_DISCLAIMER =
  'Proposed framework, not clinically validated. Decision support, not diagnosis.';

/**
 * Stage ranking index for canonical deterministic sorting.
 */
const STAGE_ORDER_INDEX: Record<EquipmentLifecycleStage, number> = {
  procure: 0,
  validate: 1,
  maintain: 2,
  monitor: 3,
  retire: 4,
};

/**
 * Maps a synthetic device's lifecycle stage into one of the 5 canonical roadmap stages:
 * procure -> validate -> maintain -> monitor -> retire.
 * 
 * Deterministic mapping rules:
 * - Direct matches ('procure', 'validate', 'maintain', 'monitor', 'retire') preserve directly.
 * - 'maintenance_due' -> 'maintain'
 * - 'operational' -> 'monitor'
 * - 'retired' -> 'retire'
 * - 'commissioned':
 *   - Offline or standby devices represent initial procurement intake -> 'procure'
 *   - Active or alerting units represent validation / qualification testing -> 'validate'
 */
export function mapToEquipmentLifecycleStage(
  rawStage: string,
  status?: string
): EquipmentLifecycleStage {
  const normalized = (rawStage ?? '').toLowerCase().trim();

  if (normalized === 'procure' || normalized === 'procured') return 'procure';
  if (normalized === 'validate' || normalized === 'validation') return 'validate';
  if (normalized === 'maintain' || normalized === 'maintenance' || normalized === 'maintenance_due') return 'maintain';
  if (normalized === 'monitor' || normalized === 'operational' || normalized === 'monitored') return 'monitor';
  if (normalized === 'retire' || normalized === 'retired') return 'retire';

  if (normalized === 'commissioned') {
    if (status === 'offline' || status === 'standby') {
      return 'procure';
    }
    return 'validate';
  }

  return 'monitor';
}

/**
 * Generates summary counts for each of the 5 canonical equipment lifecycle stages.
 * Total staged devices guaranteed to match the underlying dataset count.
 */
export function getEquipmentLifecycleSummary(dataset: SimulatedDataset): EquipmentLifecycleSummary {
  const summary: EquipmentLifecycleSummary = {
    procure: 0,
    validate: 0,
    maintain: 0,
    monitor: 0,
    retire: 0,
    totalDevices: 0,
    stageOrder: CANONICAL_EQUIPMENT_STAGES,
  };

  if (!dataset || !Array.isArray(dataset.devices)) {
    return summary;
  }

  for (const dev of dataset.devices) {
    if (!dev || typeof dev.id !== 'string') continue;
    const stage = mapToEquipmentLifecycleStage(dev.lifecycleStage, dev.status);
    summary[stage]++;
    summary.totalDevices++;
  }

  return summary;
}

/**
 * Deterministically sorts equipment register rows:
 * 1. Primary sort: Canonical stage order (procure -> validate -> maintain -> monitor -> retire)
 * 2. Secondary sort: Device ID ascending
 */
export function sortEquipmentRegister(rows: readonly EquipmentRegisterRow[]): EquipmentRegisterRow[] {
  return [...rows].sort((a, b) => {
    const stageDiff = STAGE_ORDER_INDEX[a.lifecycleStage] - STAGE_ORDER_INDEX[b.lifecycleStage];
    if (stageDiff !== 0) return stageDiff;
    return a.id.localeCompare(b.id);
  });
}

/**
 * Transforms simulated devices from the dataset into UI-ready register rows.
 * Exposes only source fields without inventing unverified calibration or incident data.
 */
export function getEquipmentRegister(dataset: SimulatedDataset): EquipmentRegisterRow[] {
  if (!dataset || !Array.isArray(dataset.devices)) {
    return [];
  }

  const rows: EquipmentRegisterRow[] = [];

  for (const dev of dataset.devices) {
    if (!dev || typeof dev.id !== 'string') continue;

    const canonicalStage = mapToEquipmentLifecycleStage(dev.lifecycleStage, dev.status);

    // If incidentCount is explicitly present in future extended simulation models, preserve it;
    // otherwise report as null (unavailable) rather than fabricating fake incidents.
    const rawIncident = (dev as unknown as { incidentCount?: number }).incidentCount;
    const incidentCount = typeof rawIncident === 'number' && Number.isFinite(rawIncident)
      ? rawIncident
      : null;

    // Calibration date if present, otherwise explicit null
    const rawCalibration = (dev as unknown as { nextCalibration?: string }).nextCalibration;
    const nextCalibrationDate = typeof rawCalibration === 'string' && rawCalibration.trim().length > 0
      ? rawCalibration
      : null;

    rows.push({
      id: dev.id,
      deviceType: dev.deviceType,
      lifecycleStage: canonicalStage,
      status: dev.status,
      nextMaintenanceDate: dev.nextMaintenance ?? null,
      nextCalibrationDate,
      uptimePercent: dev.uptimePercent,
      alertCount: dev.alertCount ?? 0,
      incidentCount,
      hasAlerts: (dev.alertCount ?? 0) > 0 || dev.status === 'alerting',
      isSimulated: true,
    });
  }

  return sortEquipmentRegister(rows);
}

/**
 * Pure filter function for the equipment register.
 */
export function filterEquipmentRegister(
  rows: readonly EquipmentRegisterRow[],
  filters?: EquipmentFilterOptions
): EquipmentRegisterRow[] {
  if (!filters) {
    return [...rows];
  }

  return rows.filter((row) => {
    // 1. Stage filter
    if (filters.stage && filters.stage !== 'all' && row.lifecycleStage !== filters.stage) {
      return false;
    }

    // 2. Status filter
    if (filters.status && filters.status !== 'all' && row.status !== filters.status) {
      return false;
    }

    // 3. Device type filter
    if (filters.deviceType && filters.deviceType !== 'all' && row.deviceType !== filters.deviceType) {
      return false;
    }

    // 4. Search query (matches device ID or type)
    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchId = row.id.toLowerCase().includes(q);
      const matchType = row.deviceType.toLowerCase().includes(q);
      if (!matchId && !matchType) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Retrieves full detail for a single equipment device.
 * For unconfigured structures (SOP checklist, history log, retire criteria),
 * returns explicit unconfigured / empty states without fabricating clinical content.
 */
export function getEquipmentDetail(
  dataset: SimulatedDataset,
  deviceId: string
): EquipmentDetail | null {
  if (!dataset || !Array.isArray(dataset.devices) || !deviceId || typeof deviceId !== 'string') {
    return null;
  }

  const rawDev = dataset.devices.find((d) => d && d.id === deviceId);
  if (!rawDev) {
    return null;
  }

  const canonicalStage = mapToEquipmentLifecycleStage(rawDev.lifecycleStage, rawDev.status);

  const device: SimulatedEquipmentRecord = {
    ...rawDev,
    canonicalStage,
  };

  // Safe incident extraction
  const rawIncident = (rawDev as unknown as { incidentCount?: number }).incidentCount;
  const incidentCount = typeof rawIncident === 'number' && Number.isFinite(rawIncident)
    ? rawIncident
    : null;

  const rawCalibration = (rawDev as unknown as { nextCalibration?: string }).nextCalibration;
  const nextCalibrationDate = typeof rawCalibration === 'string' && rawCalibration.trim().length > 0
    ? rawCalibration
    : null;

  // SOP Checklist: Unconfigured in demonstration dataset (honest state)
  const sopChecklist: EquipmentSOPChecklist = {
    status: 'not_configured',
    items: [],
    notice: 'SOP checklist not configured in the current dataset.',
  };

  // History Log: Empty in demonstration dataset (no fabricated events)
  const historyLog: EquipmentHistoryLog = {
    status: 'empty',
    entries: [],
    notice: 'No historical event records present in the simulated dataset.',
  };

  // Retirement Criteria: Unconfigured in demonstration dataset
  const retireCriteria: EquipmentRetirementCriteria = {
    status: 'not_configured',
    criteriaList: [],
    maxAgeMonths: null,
    minUptimePercent: null,
    notice: 'Retirement criteria not configured in the current dataset.',
  };

  return {
    device,
    lifecycleStage: canonicalStage,
    status: rawDev.status,
    nextMaintenanceDate: rawDev.nextMaintenance ?? null,
    nextCalibrationDate,
    uptimePercent: rawDev.uptimePercent,
    alertCount: rawDev.alertCount ?? 0,
    incidentCount,
    sopChecklist,
    historyLog,
    retireCriteria,
    isSimulated: true,
  };
}

/**
 * Creates the primary Equipment module view model.
 */
export function createEquipmentViewModel(
  dataset: SimulatedDataset,
  filters?: EquipmentFilterOptions
): EquipmentViewModel {
  const summary = getEquipmentLifecycleSummary(dataset);
  const allRows = getEquipmentRegister(dataset);
  const filteredRows = filterEquipmentRegister(allRows, filters);

  const availableDeviceTypes = Array.from(new Set(allRows.map((r) => r.deviceType))).sort();
  const availableStatuses = Array.from(new Set(allRows.map((r) => r.status))).sort() as EquipmentStatus[];

  return {
    summary,
    register: filteredRows,
    totalDevices: allRows.length,
    filteredCount: filteredRows.length,
    availableDeviceTypes,
    availableStatuses,
    isSimulated: true,
    disclaimer: EQUIPMENT_SAFE_HARBOR_DISCLAIMER,
  };
}
