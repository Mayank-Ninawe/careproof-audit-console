/**
 * CareProof Audit Console - Equipment Lifecycle Domain Types
 * Source of Truth: CareProof Website Roadmap (Phase 9A)
 * 
 * ARCHITECTURAL CONTRACT:
 * 1. 5-Stage Canonical Ledger: procure -> validate -> maintain -> monitor -> retire
 * 2. Pure Data Layer: Decoupled from React, DOM, and Firebase APIs.
 * 3. Synthetic Data Integrity: Strictly synthetic devices from SimulatedDataset.
 * 4. Honest Boundaries: Zero fabricated clinical/manufacturer regulations or fake SOP steps.
 */

import { DeviceOperationalStatus, SimulatedDevice } from './simulation';

/**
 * Exactly the 5 canonical equipment lifecycle stages defined by the CareProof roadmap.
 * Strict ordering: procure -> validate -> maintain -> monitor -> retire
 */
export type EquipmentLifecycleStage =
  | 'procure'
  | 'validate'
  | 'maintain'
  | 'monitor'
  | 'retire';

export const CANONICAL_EQUIPMENT_STAGES: readonly EquipmentLifecycleStage[] = [
  'procure',
  'validate',
  'maintain',
  'monitor',
  'retire',
] as const;

/**
 * Operational status of equipment matching the canonical simulation model.
 */
export type EquipmentStatus = DeviceOperationalStatus;

/**
 * Synthetic equipment record entity, reusing and extending SimulatedDevice.
 */
export interface SimulatedEquipmentRecord extends SimulatedDevice {
  canonicalStage: EquipmentLifecycleStage;
}

/**
 * Summary counts across the 5 canonical lifecycle stages.
 */
export interface EquipmentLifecycleSummary {
  procure: number;
  validate: number;
  maintain: number;
  monitor: number;
  retire: number;
  totalDevices: number;
  stageOrder: readonly EquipmentLifecycleStage[];
}

/**
 * UI-ready register row representing an equipment device.
 */
export interface EquipmentRegisterRow {
  id: string;                     // e.g. "DEV-001"
  deviceType: string;             // e.g. "Biometric Telemetry Hub"
  lifecycleStage: EquipmentLifecycleStage;
  status: EquipmentStatus;
  nextMaintenanceDate: string | null; // ISO 8601 deterministic timestamp or null
  nextCalibrationDate: string | null; // Explicit not-provided state if unavailable
  uptimePercent: number;          // Exact simulated value (e.g. 99.3)
  alertCount: number;             // Exact simulated alert count
  incidentCount: number | null;   // Explicit null when source data is unavailable
  hasAlerts: boolean;
  isSimulated: true;
}

/**
 * Typed SOP item data structure.
 */
export interface EquipmentSOPItem {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  isMandatory: boolean;
  status: 'pending' | 'verified' | 'unconfigured';
}

/**
 * SOP Checklist model for equipment detail view.
 * If no approved SOP exists, status is "not_configured" with an empty list.
 */
export interface EquipmentSOPChecklist {
  status: 'configured' | 'not_configured';
  items: EquipmentSOPItem[];
  notice: string;
}

export type EquipmentHistoryEventType =
  | 'lifecycle_change'
  | 'maintenance'
  | 'validation'
  | 'monitoring'
  | 'alert';

/**
 * Typed history log entry for equipment lifecycle auditing.
 */
export interface EquipmentHistoryEntry {
  id: string;
  deviceId: string;
  timestamp: string;
  eventType: EquipmentHistoryEventType;
  summary: string;
  details?: string;
  isSimulated: true;
}

/**
 * History log container. If historical events are not present in simulation,
 * status is "empty" rather than fabricated.
 */
export interface EquipmentHistoryLog {
  status: 'available' | 'empty';
  entries: EquipmentHistoryEntry[];
  notice: string;
}

/**
 * Typed retirement criteria model.
 * If criteria are unconfigured, status is "not_configured" without invented rules.
 */
export interface EquipmentRetirementCriteria {
  status: 'configured' | 'not_configured';
  criteriaList: string[];
  maxAgeMonths: number | null;
  minUptimePercent: number | null;
  notice: string;
}

/**
 * Detailed view of an individual equipment device.
 */
export interface EquipmentDetail {
  device: SimulatedEquipmentRecord;
  lifecycleStage: EquipmentLifecycleStage;
  status: EquipmentStatus;
  nextMaintenanceDate: string | null;
  nextCalibrationDate: string | null;
  uptimePercent: number;
  alertCount: number;
  incidentCount: number | null;
  sopChecklist: EquipmentSOPChecklist;
  historyLog: EquipmentHistoryLog;
  retireCriteria: EquipmentRetirementCriteria;
  isSimulated: true;
}

/**
 * Filter options for equipment register queries.
 */
export interface EquipmentFilterOptions {
  stage?: EquipmentLifecycleStage | 'all';
  status?: EquipmentStatus | 'all';
  deviceType?: string | 'all';
  searchQuery?: string;
}

/**
 * Top-level view model for the Equipment module.
 */
export interface EquipmentViewModel {
  summary: EquipmentLifecycleSummary;
  register: EquipmentRegisterRow[];
  totalDevices: number;
  filteredCount: number;
  availableDeviceTypes: string[];
  availableStatuses: EquipmentStatus[];
  isSimulated: true;
  disclaimer: string;
}
