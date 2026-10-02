/**
 * CareProof Audit Console - Production Authentication Page
 * Source of Truth: CareProof Website Roadmap (Phase 5B)
 * 
 * DESIGN SPECIFICATION:
 * - Split layout: Left panel = restrained "audit dossier", Right panel = authentication form.
 * - Login / Sign Up toggle with inline validation.
 * - Show/hide password controls with accessible labels.
 * - Application role picker (Family, Agency, Auditor) during signup.
 * - Real Firebase Auth integration (signInWithEmail, signUpWithEmail).
 * - Normalized error alerts, disabled loading states.
 * - Honest demo auditor entry disclosure (no fake authentication).
 * - Automatic redirect to /app/dashboard if already authenticated.
 */

import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Shield,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  FileText,
  CheckCircle2,
  Lock,
  Info,
  X,
} from 'lucide-react';
import { useAuth } from '../../store/authStore';
import { signInWithEmail, signUpWithEmail } from '../../services/auth';
import { AuthRole, isValidAuthRole } from '../../types/auth';

type AuthMode = 'login' | 'signup';

interface RoleOption {
  id: AuthRole;
  title: string;
  description: string;
}

const ROLE_OPTIONS: readonly RoleOption[] = [
  {
    id: 'family',
    title: 'Family',
    description: 'Understand whether care is safe',
  },
  {
    id: 'agency',
    title: 'Agency',
    description: 'Understand what to fix first',
  },
  {
    id: 'auditor',
    title: 'Auditor',
    description: 'Understand how the score and evidence work',
  },
];

export const AuthPage: React.FC = () => {
  const { status } = useAuth();

  // View state
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Form field state
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<AuthRole>('auditor');

  // Submission & validation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);

  // Redirect if already authenticated
  if (status === 'authenticated') {
    return <Navigate to="/app/dashboard" replace />;
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Email validation
    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    // Signup-specific validation
    if (mode === 'signup') {
      if (!displayName.trim()) {
        errors.displayName = 'Full name / designation is required.';
      }

      if (!confirmPassword) {
        errors.confirmPassword = 'Confirmation password is required.';
      } else if (confirmPassword !== password) {
        errors.confirmPassword = 'Passwords do not match.';
      }

      if (!isValidAuthRole(selectedRole)) {
        errors.role = 'Please select a valid application role.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email.trim(), password);
      } else {
        await signUpWithEmail(email.trim(), password, displayName.trim());
      }
      // Auth observer automatically transitions status to 'authenticated',
      // triggering the redirect to /app/dashboard above.
    } catch (err: unknown) {
      const normalized = err as { message?: string };
      setAuthError(normalized?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setValidationErrors({});
    setAuthError(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#14213D] flex flex-col font-body">
      {/* Top Clinical Utility Bar */}
      <div className="bg-[#14213D] text-[#FAF8F3] px-4 py-1.5 text-[11px] font-mono-ledger flex items-center justify-between border-b border-[#14213D]">
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3 text-[#0F6B6E] shrink-0" />
          <span className="font-semibold tracking-wider">CAREPROOF AUDIT CONSOLE</span>
          <span aria-hidden="true" className="text-[#5B6475]">|</span>
          <span className="text-[#FAF8F3]/70 hidden sm:inline">Standard v1.4.0 Verification</span>
        </div>
        <Link
          to="/"
          className="hover:text-white transition-colors flex items-center gap-1 text-[11px]"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>Return to Overview</span>
        </Link>
      </div>

      {/* Main Split Layout Container */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1240px] w-full mx-auto p-4 sm:p-6 lg:p-8 gap-6 lg:gap-8 items-stretch justify-center">
        {/* LEFT PANEL: Restrained Audit Dossier */}
        <aside className="w-full lg:w-[420px] bg-white border border-[#D9D3C5] rounded-[2px] p-6 sm:p-8 flex flex-col justify-between shrink-0">
          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-[#D9D3C5] pb-4 mb-6">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0F6B6E]" />
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#5B6475]">
                  Audit Dossier • Access
                </span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 border border-[#D9D3C5] rounded-[2px] text-[#14213D] bg-[#FAF8F3]">
                REF-AUTH-1.4
              </span>
            </div>

            <h2 className="font-display font-bold text-2xl text-[#14213D] tracking-tight mb-2">
              CareProof Standard Audit Console
            </h2>

            <p className="text-xs text-[#5B6475] leading-relaxed mb-6">
              Deterministic scoring and ledger validation for acute care and residential healthcare facilities.
            </p>

            {/* Protocol Standard Highlights */}
            <div className="space-y-3 mb-6">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#5B6475] font-semibold">
                Accredited Protocol Pillars
              </div>
              <ul className="space-y-2 text-xs text-[#14213D] m-0 p-0 list-none">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0F6B6E] shrink-0 mt-0.5" />
                  <span><strong>CSP:</strong> Clinical Safety Protocols & Verification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0F6B6E] shrink-0 mt-0.5" />
                  <span><strong>CSW:</strong> Staffing Competency & Ratio Alignment</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0F6B6E] shrink-0 mt-0.5" />
                  <span><strong>EEH:</strong> Equipment Calibration & Telemetry Safety</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0F6B6E] shrink-0 mt-0.5" />
                  <span><strong>PMI:</strong> Continuous Monitoring & Alarm Latency</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0F6B6E] shrink-0 mt-0.5" />
                  <span><strong>CGE:</strong> Caregiver Transparency & Engagement</span>
                </li>
              </ul>
            </div>

            {/* Security Architecture Note */}
            <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] text-xs font-mono text-[#5B6475] space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#14213D]">
                <Lock className="w-3 h-3 text-[#0F6B6E]" />
                <span>CRYPTOGRAPHIC AUDIT TRAIL</span>
              </div>
              <p className="text-[11px] leading-relaxed m-0 text-[#5B6475]">
                Assessments are cryptographically sealed. Identity credentials are required to evaluate compliance ledgers and inspect telemetry evidence.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-[#D9D3C5] mt-6 text-[11px] font-mono-ledger text-[#5B6475]">
            CareProof Standard v1.4.0 • Decision support, not diagnosis.
          </div>
        </aside>

        {/* RIGHT PANEL: Authentication Form */}
        <main className="flex-1 max-w-xl bg-white border border-[#D9D3C5] rounded-[2px] p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Mode Switcher Tabs */}
            <div className="flex items-center border-b border-[#D9D3C5] mb-6">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 pb-3 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                  mode === 'login'
                    ? 'border-[#0F6B6E] text-[#0F6B6E] font-bold'
                    : 'border-transparent text-[#5B6475] hover:text-[#14213D]'
                }`}
                aria-selected={mode === 'login'}
                role="tab"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`flex-1 pb-3 text-xs font-mono uppercase tracking-wider transition-colors border-b-2 cursor-pointer ${
                  mode === 'signup'
                    ? 'border-[#0F6B6E] text-[#0F6B6E] font-bold'
                    : 'border-transparent text-[#5B6475] hover:text-[#14213D]'
                }`}
                aria-selected={mode === 'signup'}
                role="tab"
              >
                Create Account
              </button>
            </div>

            {/* Mode Title & Description */}
            <div className="mb-6">
              <h1 className="font-display font-bold text-xl text-[#14213D] tracking-tight mb-1">
                {mode === 'login' ? 'Auditor Workspace Sign In' : 'Register Auditor Account'}
              </h1>
              <p className="text-xs text-[#5B6475] leading-relaxed">
                {mode === 'login'
                  ? 'Enter your accredited credentials to access the CareProof audit console.'
                  : 'Select your evaluation perspective to register a workspace identity.'}
              </p>
            </div>

            {/* Error Banner */}
            {authError && (
              <div
                role="alert"
                className="mb-5 p-3 bg-[#FAF0ED] border border-[#B3341A]/30 rounded-[2px] flex items-start gap-2.5 text-xs text-[#B3341A]"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <div className="font-semibold">Authentication Notice</div>
                  <div>{authError}</div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Sign Up: Display Name */}
              {mode === 'signup' && (
                <div className="flex flex-col gap-1 w-full text-left">
                  <label htmlFor="auth-display-name" className="text-xs font-semibold text-[#14213D]">
                    Full Name / Professional Designation <span className="text-[#B3341A]">*</span>
                  </label>
                  <input
                    id="auth-display-name"
                    type="text"
                    autoComplete="name"
                    placeholder="e.g. Jane Doe, RN"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      if (validationErrors.displayName) {
                        setValidationErrors((prev) => ({ ...prev, displayName: '' }));
                      }
                    }}
                    disabled={isSubmitting}
                    className={`h-9 px-3 text-xs bg-white text-[#14213D] border rounded-[2px] transition-colors placeholder:text-[#5B6475]/60 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0F6B6E] disabled:bg-[#FAF8F3] disabled:text-[#5B6475] ${
                      validationErrors.displayName
                        ? 'border-[#B3341A] focus-visible:outline-[#B3341A]'
                        : 'border-[#D9D3C5] hover:border-[#5B6475]'
                    }`}
                  />
                  {validationErrors.displayName && (
                    <span className="text-[11px] text-[#B3341A] font-medium">
                      {validationErrors.displayName}
                    </span>
                  )}
                </div>
              )}

              {/* Email Address */}
              <div className="flex flex-col gap-1 w-full text-left">
                <label htmlFor="auth-email" className="text-xs font-semibold text-[#14213D]">
                  Work Email Address <span className="text-[#B3341A]">*</span>
                </label>
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  placeholder="auditor@facility.org"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) {
                      setValidationErrors((prev) => ({ ...prev, email: '' }));
                    }
                  }}
                  disabled={isSubmitting}
                  className={`h-9 px-3 text-xs bg-white text-[#14213D] border rounded-[2px] transition-colors placeholder:text-[#5B6475]/60 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0F6B6E] disabled:bg-[#FAF8F3] disabled:text-[#5B6475] ${
                    validationErrors.email
                      ? 'border-[#B3341A] focus-visible:outline-[#B3341A]'
                      : 'border-[#D9D3C5] hover:border-[#5B6475]'
                  }`}
                />
                {validationErrors.email && (
                  <span className="text-[11px] text-[#B3341A] font-medium">
                    {validationErrors.email}
                  </span>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1 w-full text-left">
                <div className="flex items-center justify-between">
                  <label htmlFor="auth-password" className="text-xs font-semibold text-[#14213D]">
                    Password <span className="text-[#B3341A]">*</span>
                  </label>
                  <span className="text-[10px] text-[#5B6475] font-mono">Min. 6 characters</span>
                </div>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (validationErrors.password) {
                        setValidationErrors((prev) => ({ ...prev, password: '' }));
                      }
                    }}
                    disabled={isSubmitting}
                    className={`h-9 w-full pl-3 pr-10 text-xs bg-white text-[#14213D] border rounded-[2px] transition-colors placeholder:text-[#5B6475]/60 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0F6B6E] disabled:bg-[#FAF8F3] disabled:text-[#5B6475] ${
                      validationErrors.password
                        ? 'border-[#B3341A] focus-visible:outline-[#B3341A]'
                        : 'border-[#D9D3C5] hover:border-[#5B6475]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5B6475] hover:text-[#14213D] p-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0F6B6E]"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {validationErrors.password && (
                  <span className="text-[11px] text-[#B3341A] font-medium">
                    {validationErrors.password}
                  </span>
                )}
              </div>

              {/* Sign Up: Confirm Password */}
              {mode === 'signup' && (
                <div className="flex flex-col gap-1 w-full text-left">
                  <label htmlFor="auth-confirm-password" className="text-xs font-semibold text-[#14213D]">
                    Confirm Password <span className="text-[#B3341A]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="auth-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (validationErrors.confirmPassword) {
                          setValidationErrors((prev) => ({ ...prev, confirmPassword: '' }));
                        }
                      }}
                      disabled={isSubmitting}
                      className={`h-9 w-full pl-3 pr-10 text-xs bg-white text-[#14213D] border rounded-[2px] transition-colors placeholder:text-[#5B6475]/60 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0F6B6E] disabled:bg-[#FAF8F3] disabled:text-[#5B6475] ${
                        validationErrors.confirmPassword
                          ? 'border-[#B3341A] focus-visible:outline-[#B3341A]'
                          : 'border-[#D9D3C5] hover:border-[#5B6475]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5B6475] hover:text-[#14213D] p-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0F6B6E]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <span className="text-[11px] text-[#B3341A] font-medium">
                      {validationErrors.confirmPassword}
                    </span>
                  )}
                </div>
              )}

              {/* Sign Up: Role Picker */}
              {mode === 'signup' && (
                <div className="pt-2 text-left">
                  <div className="text-xs font-semibold text-[#14213D] mb-1.5 flex items-center justify-between">
                    <span>Application Role & Perspective <span className="text-[#B3341A]">*</span></span>
                    <span className="text-[10px] text-[#5B6475] font-mono">Select one</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Application Role">
                    {ROLE_OPTIONS.map((opt) => {
                      const isSelected = selectedRole === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setSelectedRole(opt.id)}
                          className={`p-2.5 text-left border rounded-[2px] transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#0F6B6E] bg-[#0F6B6E]/5 text-[#14213D]'
                              : 'border-[#D9D3C5] bg-white text-[#5B6475] hover:border-[#5B6475]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-xs text-[#14213D]">{opt.title}</span>
                            <span
                              className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                                isSelected ? 'border-[#0F6B6E] bg-[#0F6B6E]' : 'border-[#D9D3C5]'
                              }`}
                            >
                              {isSelected && <span className="w-1 h-1 bg-white rounded-full" />}
                            </span>
                          </div>
                          <span className="text-[11px] leading-tight text-[#5B6475]">
                            {opt.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {validationErrors.role && (
                    <span className="text-[11px] text-[#B3341A] font-medium block mt-1">
                      {validationErrors.role}
                    </span>
                  )}
                  <p className="text-[10px] text-[#5B6475] font-mono mt-1.5 m-0">
                    Application roles configure contextual views and do not bypass server authorization rules.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 px-4 py-2 bg-[#0F6B6E] text-white border border-[#0F6B6E] hover:bg-[#0c575a] active:bg-[#0a484a] font-medium text-xs rounded-[2px] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-[#0F6B6E]"
                >
                  {isSubmitting ? (
                    <span>Processing Authentication...</span>
                  ) : mode === 'login' ? (
                    <span>Sign In to Workspace</span>
                  ) : (
                    <span>Create CareProof Account</span>
                  )}
                </button>
              </div>
            </form>

            {/* Demo Auditor Entrypoint */}
            <div className="mt-6 pt-4 border-t border-[#D9D3C5]">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <div className="text-xs font-semibold text-[#14213D]">
                    Evaluation Demonstration
                  </div>
                  <div className="text-[11px] text-[#5B6475]">
                    Explore sample facility audit without personal credentials
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDemoModal(true)}
                  className="px-3 py-1.5 text-xs font-mono border border-[#D9D3C5] bg-[#FAF8F3] hover:bg-[#eae5d8] text-[#14213D] rounded-[2px] transition-colors cursor-pointer"
                >
                  Enter as demo auditor
                </button>
              </div>
            </div>
          </div>

          {/* Form Footer */}
          <div className="mt-8 pt-4 border-t border-[#D9D3C5] text-center text-xs text-[#5B6475] font-mono-ledger">
            {mode === 'login' ? (
              <span>
                Need access credentials?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="text-[#0F6B6E] hover:underline font-semibold cursor-pointer"
                >
                  Create an account
                </button>
              </span>
            ) : (
              <span>
                Already have credentials?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-[#0F6B6E] hover:underline font-semibold cursor-pointer"
                >
                  Sign in here
                </button>
              </span>
            )}
          </div>
        </main>
      </div>

      {/* Honest Demo Auditor Disclosure Modal */}
      {showDemoModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-modal-title"
          className="fixed inset-0 z-50 bg-[#14213D]/40 backdrop-blur-none flex items-center justify-center p-4 font-body"
        >
          <div className="bg-white border border-[#D9D3C5] max-w-md w-full p-6 rounded-[2px] shadow-none text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9D3C5] mb-4">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#0F6B6E]" />
                <span id="demo-modal-title" className="font-display font-bold text-sm text-[#14213D]">
                  Demo Auditor Access
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                aria-label="Close modal"
                className="text-[#5B6475] hover:text-[#14213D] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#14213D] leading-relaxed mb-4">
              Demo access will be connected to the seeded sample audit in the application-data phase.
            </p>

            <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] text-[11px] font-mono text-[#5B6475] mb-5">
              <span>SECURITY NOTICE: CareProof does not bypass Firebase authentication with mock sessions. Live workspaces require valid credentials.</span>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="px-4 py-2 bg-[#0F6B6E] text-white text-xs font-medium rounded-[2px] hover:bg-[#0c575a] cursor-pointer"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
