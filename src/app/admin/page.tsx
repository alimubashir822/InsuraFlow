'use client';

import React, { useState } from 'react';
import { useAppState, User, AuditLog } from '@/lib/context';
import { 
  Shield, 
  Users, 
  FileText, 
  Settings, 
  Database,
  Link as LinkIcon, 
  Check, 
  X,
  AlertCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  GitFork,
  ArrowRight,
  Plus,
  Trash2,
  Sparkles
} from 'lucide-react';

export default function Admin() {
  const { 
    users, 
    auditLogs, 
    clinics, 
    currentRole, 
    isLoading, 
    refreshData 
  } = useAppState();

  // Integrations state
  const [integrations, setIntegrations] = useState([
    { id: 'ehr', name: 'Athenahealth EHR', type: 'Clinical Data Sync', connected: true, logo: Database },
    { id: 'pms', name: 'WebPT Practice Management', type: 'Scheduling & Registration', connected: false, logo: Settings },
    { id: 'stripe', name: 'Stripe Payments', type: 'Patient Billing & Copays', connected: true, logo: ShieldCheck },
    { id: 'twilio', name: 'Twilio SMS & Email Gateway', type: 'Automated Follow-ups', connected: true, logo: LinkIcon },
  ]);

  // Workflow Automations State (n8n Style)
  const [workflows, setWorkflows] = useState([
    {
      id: 'wf-1',
      name: 'Missing Insurance Auto-Retrieve Drip',
      active: true,
      trigger: 'Patient Registered (Insurance Status: Missing)',
      condition: 'Patient has valid mobile or email details',
      steps: [
        { type: 'SMS & Email', detail: 'Day 1: Send secure uploader link' },
        { type: 'Delay', detail: 'Wait 3 Days' },
        { type: 'SMS Reminder', detail: 'Day 3: Send follow-up reminder' },
        { type: 'Clinic Alert', detail: 'Day 5: Notify reception desk' }
      ]
    },
    {
      id: 'wf-2',
      name: 'Prior Authorization Denial Guard',
      active: true,
      trigger: 'Major Claim Drafted (Code: D6010 / D2750)',
      condition: 'Payer rules require prior authorization',
      steps: [
        { type: 'AI Check', detail: 'Inspect clinical notes for authorization codes' },
        { type: 'Route Block', detail: 'If missing, block submission and set Risk: High' },
        { type: 'Task Assignment', detail: 'Create task for Billing Manager' }
      ]
    },
    {
      id: 'wf-3',
      name: 'Pre-Visit Deductible Upfront Collector',
      active: false,
      trigger: 'Eligibility Checked (Status: Active)',
      condition: 'Remaining deductible > $0',
      steps: [
        { type: 'AI Estimate', detail: 'Generate patient responsibility summary' },
        { type: 'EHR Flag', detail: 'Append "Collect Deductible at Desk" note to appointment' }
      ]
    }
  ]);

  const [activeTab, setActiveTab] = useState<'logs' | 'automations' | 'users' | 'integrations'>('logs');

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Loading system records...</p>
        </div>
      </div>
    );
  }

  // Restrict access to Admins only
  if (currentRole !== 'Admin') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 text-center flex-1 flex flex-col items-center justify-center">
        <div className="rounded-full bg-rose-50 p-4 text-rose-600 border border-rose-100 mb-4">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Access Restricted</h2>
        <p className="text-slate-500 mt-2">
          You are currently viewing as a <strong>{currentRole}</strong>. This module requires **Admin (Full Access)** simulation permissions. Use the simulation role dropdown in the header to switch to Admin.
        </p>
      </div>
    );
  }

  const handleToggleIntegration = (id: string) => {
    setIntegrations(prev => 
      prev.map(integration => {
        if (integration.id === id) {
          return { ...integration, connected: !integration.connected };
        }
        return integration;
      })
    );
  };

  const handleToggleWorkflow = (id: string) => {
    setWorkflows(prev =>
      prev.map(wf => {
        if (wf.id === id) {
          return { ...wf, active: !wf.active };
        }
        return wf;
      })
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 flex-1 flex flex-col">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">System Admin Portal</h1>
          <p className="text-sm text-slate-500">Access clinic user roles, integrations switchboard, and HIPAA compliance audit logs.</p>
        </div>
        <button
          onClick={() => refreshData()}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition w-full sm:w-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Sync Records
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="border-b border-slate-200 overflow-x-auto scrollbar-none">
        <nav className="-mb-px flex gap-6 whitespace-nowrap min-w-max pb-1" aria-label="Tabs">
          {[
            { id: 'logs', label: 'Compliance Audit Logs', icon: FileText },
            { id: 'automations', label: 'Workflow Automations', icon: GitFork },
            { id: 'users', label: 'Users & Permissions', icon: Users },
            { id: 'integrations', label: 'Connected Integrations', icon: LinkIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? 'border-cyan-600 text-cyan-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 flex flex-col">
        
        {/* PANEL 1: Audit Logs */}
        {activeTab === 'logs' && (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col animate-in fade-in duration-200">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">HIPAA Compliance Activity Log</h3>
              <p className="text-xs text-slate-500">Chronological history of patient data queries, insurance eligibility requests, and record mutations.</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/30 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-3">Timestamp</th>
                    <th className="px-6 py-3">Operator</th>
                    <th className="px-6 py-3">Action Type</th>
                    <th className="px-6 py-3">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-slate-400">
                        No audit logs found.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/30 transition">
                        <td className="px-6 py-4 text-xs font-medium text-slate-400 font-mono flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-300" />
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {log.userName}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${
                            log.action === 'Verify Insurance' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                            log.action === 'Scan Card' ? 'bg-cyan-50 text-cyan-800 border border-cyan-100' :
                            log.action === 'Add Patient' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                            log.action === 'Readiness Audit' ? 'bg-amber-50 text-amber-800 border border-amber-100' :
                            'bg-slate-50 text-slate-600 border border-slate-100'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-xs leading-relaxed max-w-md">
                          {log.details}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PANEL 2: Workflow Automation Builder (n8n Style) */}
        {activeTab === 'automations' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Workflow Automation Engines</h3>
                <p className="text-xs text-slate-500">Configure no-code clinical intelligence actions based on policy alerts.</p>
              </div>
              <button 
                onClick={() => alert("Creating a new canvas is disabled in demo mode.")}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-cyan-700 transition w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" />
                New Workflow
              </button>
            </div>

            {/* Display Workflows */}
            <div className="space-y-6">
              {workflows.map((wf) => (
                <div key={wf.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
                  
                  {/* Top Bar */}
                  <div className="px-5 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitFork className="h-4.5 w-4.5 text-cyan-600" />
                      <h4 className="font-extrabold text-slate-950 text-sm leading-snug">{wf.name}</h4>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${wf.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {wf.active ? 'Active & Running' : 'Paused'}
                      </span>
                      <button
                        onClick={() => handleToggleWorkflow(wf.id)}
                        className="transition focus:outline-none"
                      >
                        {wf.active ? (
                          <ToggleRight className="h-8 w-8 text-cyan-600 cursor-pointer" />
                        ) : (
                          <ToggleLeft className="h-8 w-8 text-slate-300 cursor-pointer" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Flow Canvas */}
                  <div className="p-6 overflow-x-auto bg-slate-50/20 scrollbar-none">
                    <div className="flex flex-row items-center gap-4 min-w-max">
                      
                      {/* Trigger Node */}
                      <div className="rounded-xl border border-cyan-200 bg-cyan-50/20 p-4 w-52 shrink-0 relative flex flex-col gap-1 shadow-sm">
                        <span className="text-[9px] uppercase font-bold text-cyan-700 tracking-wider">1. Trigger Event</span>
                        <span className="text-xs font-semibold text-slate-950 truncate">{wf.trigger}</span>
                      </div>
 
                      <ArrowRight className="h-4 w-4 text-slate-300 shrink-0" />
 
                      {/* Condition Node */}
                      <div className="rounded-xl border border-amber-200 bg-amber-50/20 p-4 w-52 shrink-0 relative flex flex-col gap-1 shadow-sm">
                        <span className="text-[9px] uppercase font-bold text-amber-700 tracking-wider">2. Check Condition</span>
                        <span className="text-xs font-semibold text-slate-950 truncate">{wf.condition}</span>
                      </div>
 
                      <ArrowRight className="h-4 w-4 text-slate-300 shrink-0" />
 
                      {/* Action Steps Sequence */}
                      <div className="flex items-center gap-3">
                        {wf.steps.map((step, idx) => (
                          <React.Fragment key={idx}>
                            <div className="rounded-xl border border-slate-200 bg-white p-4 w-48 shrink-0 flex flex-col gap-1 shadow-sm">
                              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Step {idx + 3}: {step.type}</span>
                              <span className="text-xs font-semibold text-slate-700 leading-normal">{step.detail}</span>
                            </div>
                            {idx < wf.steps.length - 1 && (
                              <ArrowRight className="h-4 w-4 text-slate-300 shrink-0" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PANEL 3: Users & Permissions */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 animate-in fade-in duration-200">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-sans">Active Clinic Team</h3>
                <p className="text-xs text-slate-500">Configure credentials and clinic privileges.</p>
              </div>

              <div className="divide-y divide-slate-100">
                {users.map((user) => (
                  <div key={user.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 block">{user.name}</span>
                      <span className="text-xs text-slate-500 block">{user.email}</span>
                    </div>
                    <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200/50">
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Clinic Directory</h3>
                <p className="text-xs text-slate-500">Organization profile and settings.</p>
              </div>

              {clinics.map((clinic) => (
                <div key={clinic.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-cyan-800 font-bold text-sm">
                    <Database className="h-4.5 w-4.5 text-cyan-600" />
                    {clinic.name}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Address: {clinic.address}</p>
                  <p className="text-xs text-slate-400 font-medium">Database Engine: SQLite local-file backend (`prisma/dev.db`)</p>
                </div>
              ))}

              <div className="bg-cyan-50/50 border border-cyan-100/50 p-4 rounded-xl text-xs text-cyan-800 space-y-2 leading-relaxed">
                <span className="font-bold flex items-center gap-1.5"><Shield className="h-4 w-4" /> Role Security Matrix</span>
                <p>Roles are verified at endpoints. For instance, **Doctors** have read-only access to insurance profiles but cannot scan new cards. **Front Desk** has scan rights, and **Billing Managers** control claim checkouts.</p>
              </div>
            </div>
          </div>
        )}

        {/* PANEL 4: Connected Integrations */}
        {activeTab === 'integrations' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">EHR & Operations Switchboard</h3>
              <p className="text-xs text-slate-500">Toggle system connections to auto-sync registrations, appointments, and payments.</p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {integrations.map((integration) => {
                const Logo = integration.logo;
                return (
                  <div 
                    key={integration.id} 
                    className={`rounded-xl border p-5 flex items-center justify-between shadow-sm transition hover:shadow-md bg-white ${
                      integration.connected ? 'border-cyan-200 bg-gradient-to-tr from-cyan-50/10 to-white' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`rounded-xl p-3 border ${
                        integration.connected ? 'bg-cyan-50 border-cyan-200 text-cyan-600' : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}>
                        <Logo className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">{integration.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{integration.type}</p>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold mt-2 uppercase ${
                          integration.connected ? 'text-emerald-600' : 'text-slate-400'
                        }`}>
                          {integration.connected ? (
                            <>
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                              Active & Connected
                            </>
                          ) : 'Offline'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleIntegration(integration.id)}
                      className={`text-slate-400 hover:text-slate-600 transition p-1.5 rounded-lg hover:bg-slate-50`}
                      title={integration.connected ? "Disconnect Integration" : "Connect Integration"}
                    >
                      {integration.connected ? (
                        <ToggleRight className="h-9 w-9 text-cyan-600 cursor-pointer" />
                      ) : (
                        <ToggleLeft className="h-9 w-9 text-slate-300 cursor-pointer" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
