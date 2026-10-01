import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const AuthPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#14213D] flex flex-col justify-between font-body">
      {/* Top Header Link */}
      <div className="p-4 sm:p-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#5B6475] hover:text-[#14213D] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Overview</span>
        </Link>
      </div>

      {/* Main Auth Container */}
      <div className="w-full max-w-md mx-auto px-4 py-8">
        <div className="border border-[#D9D3C5] bg-white p-6 sm:p-8 rounded-[2px] text-left">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-[#0F6B6E]" />
            <span className="font-display font-bold text-xl text-[#14213D]">
              CareProof
            </span>
          </div>

          <h1 className="text-lg font-display font-semibold text-[#14213D] mb-1">
            Auditor Sign In
          </h1>
          <p className="text-xs text-[#5B6475] mb-6 leading-relaxed">
            Auditor workspace access.
          </p>

          {/* Phase 2 Informational Notice */}
          <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] text-xs font-mono mb-6 text-[#5B6475]">
            <div className="font-semibold text-[#14213D] mb-1 flex items-center gap-1.5 text-[11px]">
              <Lock className="w-3 h-3 text-[#0F6B6E]" />
              <span>AUTHENTICATION INFRASTRUCTURE</span>
            </div>
            <p className="text-[11px] leading-relaxed m-0">
              Firebase Authentication is configured at the infrastructure layer. Auditor access workflows will be enabled in the authentication phase.
            </p>
          </div>

          {/* Form Foundation Shell */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="space-y-4"
          >
            <Input
              label="Email Address"
              type="email"
              placeholder="auditor@facility.org"
              disabled
              helperText="Authentication active in authentication phase."
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              disabled
            />

            <div className="pt-2">
              <Button variant="primary" fullWidth disabled>
                Sign In (Foundation Shell)
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-[#D9D3C5] text-center">
            <Link
              to="/app/dashboard"
              className="text-xs font-mono text-[#0F6B6E] hover:underline"
            >
              Continue to Console &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 text-center text-xs font-mono-ledger text-[#5B6475]">
        CareProof Audit Console • Decision support, not diagnosis.
      </div>
    </div>
  );
};
