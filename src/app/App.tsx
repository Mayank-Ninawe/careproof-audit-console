import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { ProtectedRoute } from '../components/auth';
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

        {/* Application Routes wrapped in ProtectedRoute and CareProof AppShell */}
        <Route
          path="/app/dashboard"
          element={
            <ProtectedRoute>
              <AppShell>
                <DashboardPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/standard"
          element={
            <ProtectedRoute>
              <AppShell>
                <StandardPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/monitor"
          element={
            <ProtectedRoute>
              <AppShell>
                <MonitorPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/pilot"
          element={
            <ProtectedRoute>
              <AppShell>
                <PilotPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/equipment"
          element={
            <ProtectedRoute>
              <AppShell>
                <EquipmentPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/caregivers"
          element={
            <ProtectedRoute>
              <AppShell>
                <CaregiversPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/incident"
          element={
            <ProtectedRoute>
              <AppShell>
                <IncidentPage />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/settings"
          element={
            <ProtectedRoute>
              <AppShell>
                <SettingsPage />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect to Dashboard */}
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

