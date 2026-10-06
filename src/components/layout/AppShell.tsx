import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Activity,
  FlaskConical,
  Wrench,
  Users,
  AlertTriangle,
  Settings,
  Menu,
  X,
  Shield,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { NavigationItem } from './NavigationItem';
import { useAuth } from '../../store/authStore';
import { signOutUser } from '../../services/auth';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDemo = new URLSearchParams(location.search).get('mode') === 'demo';

  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch {
      // Allow local navigation regardless of transient signout errors
    } finally {
      navigate('/auth');
    }
  };

  const navGroups = [
    {
      title: 'Clinical Audit Core',
      items: [
        {
          to: '/app/dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
          to: '/app/standard',
          label: 'Standard Explorer',
          icon: <BookOpen className="w-4 h-4" />,
          badge: 'v1.4',
        },
        {
          to: '/app/monitor',
          label: 'Patient Monitor',
          icon: <Activity className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'Operational Assurance',
      items: [
        {
          to: '/app/pilot',
          label: 'Pilot Study',
          icon: <FlaskConical className="w-4 h-4" />,
        },
        {
          to: '/app/equipment',
          label: 'Equipment Lifecycle',
          icon: <Wrench className="w-4 h-4" />,
        },
        {
          to: '/app/caregivers',
          label: 'Caregiver Competency',
          icon: <Users className="w-4 h-4" />,
        },
        {
          to: '/app/incident',
          label: 'Incident Response',
          icon: <AlertTriangle className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          to: '/app/settings',
          label: 'Settings',
          icon: <Settings className="w-4 h-4" />,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#14213D] flex flex-col font-body">
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-[#14213D] focus:text-[#FAF8F3] focus:border focus:border-[#D9D3C5] focus:text-xs focus:font-mono"
      >
        Skip to main content
      </a>

      {/* Top Clinical Disclaimer */}
      <div className="bg-[#14213D] text-[#FAF8F3] px-4 py-1 text-[11px] font-mono-ledger flex items-center justify-between border-b border-[#14213D]">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <Shield className="w-3 h-3 text-[#0F6B6E] shrink-0" />
          <span className="truncate">
            Decision support, not diagnosis.
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 shrink-0 text-[#FAF8F3]/80">
          <Link
            to="/"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span>Overview</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </Link>
          <span aria-hidden="true" className="text-[#5B6475]">|</span>
          {user ? (
            <button
              onClick={handleSignOut}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-2.5 h-2.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <Link
              to="/auth"
              className="hover:text-white transition-colors"
            >
              Auditor Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Main Layout Container: Left Rail + Main Stage */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Mobile Header Bar */}
        <div className="md:hidden border-b border-[#D9D3C5] bg-white px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-decoration-none">
            <span className="font-display font-bold text-lg text-[#14213D] tracking-tight">
              CareProof
            </span>
            <span className="text-[10px] font-mono uppercase px-1 py-0.5 border border-[#D9D3C5] rounded-[2px] text-[#5B6475]">
              Console
            </span>
          </Link>
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileNavOpen}
            aria-controls="navigation-rail"
            className="p-1.5 text-[#14213D] border border-[#D9D3C5] rounded-[2px] hover:bg-[#FAF8F3] cursor-pointer"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Left Navigation Rail (Desktop + Mobile Drawer) */}
        <aside
          id="navigation-rail"
          aria-label="Application navigation"
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#D9D3C5] transform transition-transform duration-150 ease-in-out md:translate-x-0 md:static md:w-60 md:shrink-0 flex flex-col ${
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Rail Header Brand */}
          <div className="p-4 border-b border-[#D9D3C5] hidden md:block">
            <Link to="/" className="block">
              <span className="font-display font-bold text-xl text-[#14213D] tracking-tight block">
                CareProof
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#5B6475] block mt-0.5">
                Audit Console
              </span>
            </Link>
          </div>

          {/* Navigation Links by Group */}
          <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <div className="px-3 text-[10px] font-mono uppercase tracking-wider text-[#5B6475] font-semibold mb-1">
                  {group.title}
                </div>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <NavigationItem
                      key={item.to}
                      to={isDemo ? `${item.to}?mode=demo` : item.to}
                      label={item.label}
                      icon={item.icon}
                      badge={item.badge}
                      onClick={() => setMobileNavOpen(false)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Rail Footer Information */}
          <div className="p-3 border-t border-[#D9D3C5] bg-[#FAF8F3]/60 text-[11px] font-mono-ledger text-[#5B6475] space-y-2">
            <div className="flex items-center justify-between">
              <span>Standard:</span>
              <span className="font-semibold text-[#14213D]">v1.4.0</span>
            </div>
            {user ? (
              <div className="pt-2 border-t border-[#D9D3C5] space-y-1.5">
                <div className="truncate">
                  <span className="text-[#14213D] font-medium block truncate">
                    {user.displayName || user.email || 'Authenticated User'}
                  </span>
                  {user.displayName && user.email && (
                    <span className="text-[10px] text-[#5B6475] block truncate">
                      {user.email}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left text-xs font-mono text-[#B3341A] hover:underline flex items-center gap-1.5 pt-1 cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-[#D9D3C5] space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#0F6B6E] font-semibold block">
                  {isDemo ? 'Sample Audit (Read-Only)' : 'Guest Session'}
                </span>
                <Link to="/auth" className="text-[11px] text-[#0F6B6E] hover:underline block font-body">
                  Sign in for full access &rarr;
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* Mobile backdrop */}
        {mobileNavOpen && (
          <div
            className="fixed inset-0 bg-[#14213D]/30 z-30 md:hidden"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Main Application Stage */}
        <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col min-w-0 outline-none">
          {/* Desktop Sub-Header Bar (Application Context) */}
          <div className="hidden md:flex items-center justify-between px-6 py-2.5 bg-white border-b border-[#D9D3C5] text-xs font-mono-ledger text-[#5B6475]">
            <div className="flex items-center gap-2">
              <span className="text-[#14213D] font-medium">
                CareProof Audit Console
              </span>
              <span aria-hidden="true">/</span>
              <span className="text-[#0F6B6E] font-semibold">
                {location.pathname}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              {user ? (
                <>
                  <span className="text-[#14213D] font-mono">
                    {user.email || user.displayName}
                  </span>
                  <span aria-hidden="true" className="text-[#D9D3C5]">|</span>
                  <button
                    onClick={handleSignOut}
                    className="hover:text-[#B3341A] transition-colors cursor-pointer text-[#5B6475]"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/auth" className="hover:text-[#14213D] transition-colors">
                  Auditor Workspace
                </Link>
              )}
            </div>
          </div>

          {/* Main Route Content Container (Max width 1200px centered) */}
          <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>

          {/* Clean Ledger Footer */}
          <footer className="border-t border-[#D9D3C5] bg-white px-4 sm:px-8 py-4 text-xs font-mono-ledger text-[#5B6475]">
            <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                CareProof Audit Console
              </div>
              <div className="text-[11px] text-[#5B6475]">
                Decision support, not diagnosis.
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
