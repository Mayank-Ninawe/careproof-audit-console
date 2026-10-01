/**
 * CareProof Audit Console - Phase 2 Route & Shell Verification Tests
 */

import {
  LandingPage,
  AuthPage,
  DashboardPage,
  StandardPage,
  MonitorPage,
  PilotPage,
  EquipmentPage,
  CaregiversPage,
  IncidentPage,
  SettingsPage,
} from '../pages';
import { ScoreStamp } from '../components/ui/ScoreStamp';
import { EvidenceTag } from '../components/ui/EvidenceTag';
import { LedgerRow } from '../components/ui/LedgerRow';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✓ PASS: ${message}`);
}

console.log('=== CareProof Audit Console Phase 2 Architecture Verification ===');

// Verify all 10 route components exist and are callable React functions
assert(typeof LandingPage === 'function', 'LandingPage route component loaded');
assert(typeof AuthPage === 'function', 'AuthPage route component loaded');
assert(typeof DashboardPage === 'function', 'DashboardPage route component loaded');
assert(typeof StandardPage === 'function', 'StandardPage route component loaded');
assert(typeof MonitorPage === 'function', 'MonitorPage route component loaded');
assert(typeof PilotPage === 'function', 'PilotPage route component loaded');
assert(typeof EquipmentPage === 'function', 'EquipmentPage route component loaded');
assert(typeof CaregiversPage === 'function', 'CaregiversPage route component loaded');
assert(typeof IncidentPage === 'function', 'IncidentPage route component loaded');
assert(typeof SettingsPage === 'function', 'SettingsPage route component loaded');

// Verify UI Signature Primitives
assert(typeof ScoreStamp === 'function', 'ScoreStamp visual primitive component loaded');
assert(typeof EvidenceTag === 'function', 'EvidenceTag signature component loaded');
assert(typeof LedgerRow === 'function', 'LedgerRow signature component loaded');

console.log('Results: All Phase 2 route modules & UI primitives verified.');
