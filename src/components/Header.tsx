'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppState } from '@/lib/context';
import { Shield, Users, Activity, FileText, UserCircle2, RefreshCw, Menu, X } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const { currentRole, switchRole, currentUser, refreshData, isActionLoading } = useAppState();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Activity, roles: ['Admin', 'BillingManager', 'FrontDesk', 'Doctor'] },
    { name: 'Patients', href: '/patients', icon: Users, roles: ['Admin', 'BillingManager', 'FrontDesk', 'Doctor', 'Patient'] },
    { name: 'System Logs & Admin', href: '/admin', icon: Shield, roles: ['Admin'] },
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(currentRole));

  const roleLabels: Record<string, string> = {
    Admin: 'Admin (Full Access)',
    BillingManager: 'Billing Manager',
    FrontDesk: 'Front Desk',
    Doctor: 'Doctor',
    Patient: 'Patient (Self-Service)',
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Branding Logo */}
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 shadow-md shadow-cyan-100">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="hidden sm:inline bg-gradient-to-r from-slate-900 via-cyan-800 to-cyan-600 bg-clip-text text-base sm:text-xl font-bold tracking-tight text-transparent">
                InsuraFlow AI
              </span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href) || (item.href === '/dashboard' && pathname === '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-cyan-50/80 text-cyan-700 shadow-sm border border-cyan-100/50'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-600' : 'text-slate-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Action Controls & Role Switcher */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Refresh Data button */}
            <button
              onClick={() => refreshData()}
              disabled={isActionLoading}
              title="Refresh Database Data"
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 disabled:opacity-50 transition"
            >
              <RefreshCw className={`h-4 w-4 ${isActionLoading ? 'animate-spin text-cyan-500' : ''}`} />
            </button>

            {/* Active Role Selector (High-fidelity switcher for demo purposes) */}
            <div className="hidden md:flex items-center gap-2">
              <span className="hidden lg:inline text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Simulation Role:
              </span>
              <select
                value={currentRole}
                onChange={(e) => switchRole(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 focus:border-cyan-500 focus:outline-none"
              >
                {Object.keys(roleLabels).map((role) => (
                  <option key={role} value={role}>
                    {roleLabels[role]}
                  </option>
                ))}
              </select>
            </div>

            {/* Active User Card */}
            <div className="hidden sm:flex items-center gap-2.5 border-l border-slate-200 pl-4">
              <div className="text-right hidden md:block">
                <p className="text-xs font-semibold text-slate-950 leading-tight">
                  {currentUser?.name || 'Jane Doe'}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  {currentUser?.role === 'Admin' ? 'Apex Administrator' : currentUser?.role || 'Patient'}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 border border-slate-100">
                <UserCircle2 className="h-5 w-5" />
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

          </div>

        </div>
      </header>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-4.5 space-y-4 shadow-lg sticky top-16 z-30 animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col gap-2">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href) || (item.href === '/dashboard' && pathname === '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-cyan-50 text-cyan-700 border border-cyan-100/50 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-cyan-600' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          {/* Active Role Selector (Mobile version inside drawer) */}
          <div className="border-t border-slate-100 pt-4 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Simulation Role:
            </span>
            <select
              value={currentRole}
              onChange={(e) => {
                switchRole(e.target.value);
                setIsOpen(false);
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 focus:border-cyan-500 focus:outline-none"
            >
              {Object.keys(roleLabels).map((role) => (
                <option key={role} value={role}>
                  {roleLabels[role]}
                </option>
              ))}
            </select>
          </div>

          {/* User info (Mobile version inside drawer) */}
          <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 border border-slate-100">
              <UserCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-950 leading-tight">
                {currentUser?.name || 'Jane Doe'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                {currentUser?.role === 'Admin' ? 'Apex Administrator' : currentUser?.role || 'Patient'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
