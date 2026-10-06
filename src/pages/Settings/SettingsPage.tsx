/**
 * CareProof Audit Console - Production Settings Page (Phase 13)
 * Source of Truth: CareProof Website Roadmap (Phase 13)
 * 
 * CORE CONTRACT:
 * 1. Sections rendered in exact order:
 *    1. Profile (Name, Role, Organisation)
 *    2. Preferences (Density, Units)
 *    3. Privacy & Demo Data (Consent log, Delete demo data with confirmation)
 *    4. Export (Export JSON without secrets)
 *    5. About & References (v1.4.0, references, simulated data disclaimer)
 * 2. Uses existing auth state (useAuth, authStore, saveStoredSession).
 * 3. Local browser persistence; zero extraneous Firebase overhead.
 * 4. Fully accessible, responsive, and adheres to the Audit Ledger design system.
 */

import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { useAuth, authStore } from '../../store/authStore';
import { saveStoredSession } from '../../services/auth';
import {
  ProfileSection,
  PreferencesSection,
  PrivacySection,
  ExportSection,
  AboutSection,
} from '../../components/settings';
import {
  getSettingsPreferences,
  saveSettingsPreferences,
} from '../../services/settings';
import { SettingsPreferences } from '../../types/settings';
import { AuthRole } from '../../types/auth';
import { CANONICAL_STANDARD } from '../../data/standard';

export const SettingsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const location = useLocation();
  const isDemo = new URLSearchParams(location.search).get('mode') === 'demo';

  const [preferences, setPreferences] = useState<SettingsPreferences>(() =>
    getSettingsPreferences()
  );

  const handleSaveProfile = (data: {
    displayName: string;
    role: AuthRole;
    organizationName: string;
  }) => {
    // 1. Update application auth store and local session storage if user exists
    if (user) {
      const updatedProfile = {
        uid: user.uid,
        role: data.role,
        displayName: data.displayName || null,
        organizationName: data.organizationName || null,
        createdAt: profile?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      authStore.setProfile(updatedProfile);
      saveStoredSession(user, updatedProfile);
    }

    // 2. Persist local organization preference
    const updatedPrefs: SettingsPreferences = {
      ...preferences,
      organizationName: data.organizationName,
    };
    saveSettingsPreferences(updatedPrefs);
    setPreferences(updatedPrefs);
  };

  const handleSavePreferences = (updated: Partial<SettingsPreferences>) => {
    const nextPrefs: SettingsPreferences = {
      ...preferences,
      ...updated,
    };
    saveSettingsPreferences(nextPrefs);
    setPreferences(nextPrefs);
  };

  const handleDemoDataDeleted = () => {
    setPreferences(getSettingsPreferences());
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 text-left font-body">
      {/* Read-Only Demo Banner */}
      {isDemo && (
        <div
          role="region"
          aria-label="Demo mode notice"
          className="p-3 bg-[#0F6B6E]/10 border border-[#0F6B6E]/30 rounded-[2px] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#0F6B6E]"
        >
          <div className="flex items-center gap-2">
            <span className="font-bold px-1.5 py-0.5 bg-[#0F6B6E] text-white rounded-[2px] text-[10px]">
              READ-ONLY SAMPLE
            </span>
            <span>
              Demo settings active. Configuration changes persist to browser local storage only.
            </span>
          </div>
          <Link
            to="/auth"
            className="text-xs font-semibold text-[#0F6B6E] hover:underline"
          >
            Sign in for full auditor console &rarr;
          </Link>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Settings"
        subtitle="Auditor profile, interface preferences, privacy controls, audit export, and system details."
        badge={<Badge variant="neutral">PREFERENCES &amp; EXPORT</Badge>}
        metadata={
          <>
            <span>
              Standard: <strong>v{CANONICAL_STANDARD.version}</strong>
            </span>
            <span>·</span>
            <span>
              Role: <strong>{(profile?.role || 'Auditor').toUpperCase()}</strong>
            </span>
            <span>·</span>
            <span>
              Storage: <strong>Local Session</strong>
            </span>
          </>
        }
      />

      {/* Section 1: Profile */}
      <ProfileSection
        user={user}
        profile={profile}
        initialOrganization={preferences.organizationName}
        onSaveProfile={handleSaveProfile}
      />

      {/* Section 2: Preferences */}
      <PreferencesSection
        preferences={preferences}
        onSavePreferences={handleSavePreferences}
      />

      {/* Section 3: Privacy & Demo Data */}
      <PrivacySection onDemoDataDeleted={handleDemoDataDeleted} />

      {/* Section 4: Export */}
      <ExportSection
        user={user}
        profile={profile}
        preferences={preferences}
      />

      {/* Section 5: About & References */}
      <AboutSection isDemo={isDemo} />
    </div>
  );
};

export default SettingsPage;
