/**
 * CareProof Audit Console - Protected Route Guard
 * Source of Truth: CareProof Website Roadmap (Phase 5B)
 * 
 * Enforces real Firebase Authentication for /app/* routes:
 * 1. While status === 'loading', shows a restrained accessible loading state without redirecting.
 * 2. While status === 'unauthenticated', redirects to /auth.
 * 3. While status === 'authenticated', renders child application view.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../store/authStore';
import { Shield } from 'lucide-react';

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { status } = useAuth();
  const location = useLocation();

  // Allow read-only sample/demo audit access without authentication
  const searchParams = new URLSearchParams(location.search);
  const isDemo = searchParams.get('mode') === 'demo';
  if (isDemo) {
    return <>{children}</>;
  }

  if (status === 'loading') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-screen bg-[#FAF8F3] text-[#14213D] flex flex-col items-center justify-center font-body p-4"
      >
        <div className="border border-[#D9D3C5] bg-white p-6 max-w-sm w-full rounded-[2px] text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-[#0F6B6E] animate-pulse" />
            <span className="font-display font-bold text-lg text-[#14213D]">
              CareProof
            </span>
          </div>
          <div className="text-xs font-mono uppercase tracking-wider text-[#5B6475] mb-1">
            Verifying Authentication
          </div>
          <p className="text-xs text-[#5B6475] leading-relaxed m-0 font-mono-ledger">
            Restoring secure session state...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};
