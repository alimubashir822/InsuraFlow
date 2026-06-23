'use client';

import React from 'react';
import { Activity, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-200 bg-white/60 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
          {/* Left — Branding */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-500 shadow-sm">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-slate-800 via-cyan-700 to-cyan-600 bg-clip-text text-sm font-bold tracking-tight text-transparent">
              InsuraFlow AI
            </span>
          </div>

          {/* Center — Med Clinic X attribution */}
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <span className="font-medium">Healthcare system by</span>
            <a
              href="https://www.medclinicx.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-cyan-700 hover:text-cyan-900 transition-colors underline decoration-cyan-300 underline-offset-2 hover:decoration-cyan-500"
            >
              Med Clinic X
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Right — Copyright */}
          <p className="text-xs text-slate-400 font-medium">
            &copy; {currentYear} InsuraFlow AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
