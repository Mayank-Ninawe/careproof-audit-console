import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Application Routes wrapped in CareProof AppShell */}
        <Route
          path="/app/dashboard"
          element={
            <AppShell>
              <DashboardPage />
            </AppShell>
          }
        />
        <Route
          path="/app/standard"
          element={
            <AppShell>
              <StandardPage />
            </AppShell>
          }
        />
        <Route
          path="/app/monitor"
          element={
            <AppShell>
              <MonitorPage />
            </AppShell>
          }
        />
        <Route
          path="/app/pilot"
          element={
            <AppShell>
              <PilotPage />
            </AppShell>
          }
        />
        <Route
          path="/app/equipment"
          element={
            <AppShell>
              <EquipmentPage />
            </AppShell>
          }
        />
        <Route
          path="/app/caregivers"
          element={
            <AppShell>
              <CaregiversPage />
            </AppShell>
          }
        />
        <Route
          path="/app/incident"
          element={
            <AppShell>
              <IncidentPage />
            </AppShell>
          }
        />
        <Route
          path="/app/settings"
          element={
            <AppShell>
              <SettingsPage />
            </AppShell>
          }
        />

        {/* Catch-all redirect to Dashboard */}
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
