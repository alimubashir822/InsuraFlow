'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppState, Patient, Claim, Authorization, AIInsight } from '@/lib/context';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  ArrowUpRight, 
  FileCheck2, 
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  Search,
  UserPlus,
  Sparkles,
  HelpCircle,
  AlertCircle,
  CalendarDays,
  Users,
  Send,
  Database,
  ShieldCheck,
  Settings,
  Shield,
  Layers,
  ArrowRight,
  TrendingDown,
  Info,
  ChevronDown,
  Plus
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function Dashboard() {
  const { 
    patients, 
    currentRole, 
    isLoading, 
    verifyInsurance, 
    isActionLoading,
    aiInsights,
    createAuthorization,
    updateAuthorization,
    auditClaim
  } = useAppState();

  const [searchQuery, setSearchQuery] = useState('');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  
  // Tab states
  const [activeQueueTab, setActiveQueueTab] = useState<'all' | 'tomorrow'>('all');
  
  // Billing Manager UI states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPatientId, setAuthPatientId] = useState('');
  const [authProcedure, setAuthProcedure] = useState('MRI');
  const [authDesc, setAuthDesc] = useState('Magnetic Resonance Imaging (MRI)');
  const [authDetails, setAuthDetails] = useState('');

  // Patient Cost Portal states
  const [selectedPatientTreatment, setSelectedPatientTreatment] = useState('D2750'); // Crown
  const [paymentPlan, setPaymentPlan] = useState<'full' | '3month' | '6month'>('full');

  // Trigger default selection of patient ID in auth modal
  useEffect(() => {
    if (patients.length > 0 && !authPatientId) {
      setAuthPatientId(patients[0].id);
    }
  }, [patients]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Loading platform records...</p>
        </div>
      </div>
    );
  }

  // Treatment library for patient cost preview
  const patientTreatments = [
    { code: 'D2750', name: 'Dental Crown restoration', total: 1200, insPaid: 960, patientPay: 240, coinsurance: 20 },
    { code: 'D6010', name: 'Surgical Placement of Implant', total: 2400, insPaid: 1200, patientPay: 1200, coinsurance: 50 },
    { code: 'D3330', name: 'Molar Root Canal surgery', total: 950, insPaid: 760, patientPay: 190, coinsurance: 20 },
  ];

  const monthlyTrendData = [
    { name: 'Jan', Verified: 4000 },
    { name: 'Feb', Verified: 7500 },
    { name: 'Mar', Verified: 12000 },
    { name: 'Apr', Verified: 18000 },
    { name: 'May', Verified: 29000 },
    { name: 'Jun', Verified: 42000 },
  ];

  const pendingCount = patients.filter((p) => p.insuranceStatus === 'Pending').length;
  const verifiedCount = patients.filter((p) => p.insuranceStatus === 'Verified').length;
  const issuesCount = patients.filter((p) => p.insuranceStatus === 'Issues').length;
  
  // Calculation of lost revenue opportunities from Insights
  const totalLeakageSum = aiInsights
    .filter(i => i.type === 'Leakage')
    .reduce((sum, i) => sum + i.potentialRevenue, 0);

  const totalClaimsAudited = patients.reduce((acc, p) => acc + p.claims.length, 0);
  const activeAuths = patients.reduce((acc, p) => acc + p.authorizations.length, 0);

  const queuePatients = patients.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const queuePatientsList = queuePatients.slice(0, 8);

  const tomorrowScheduleData = [
    {
      id: 'patient-john-smith',
      name: 'John Smith',
      time: '09:00 AM',
      provider: 'Blue Cross Blue Shield',
      memberId: 'BCB987654321',
      status: 'Verified',
      estBalance: 75.00,
      risk: 'Low Risk',
      reason: '✓ Active policy, ✓ No missing data, ✓ Auth verified',
      action: 'No Action Required (Collect copay)'
    },
    {
      id: 'patient-mary-watson',
      name: 'Mary Watson',
      time: '10:30 AM',
      provider: 'Aetna Health',
      memberId: 'AET123456789',
      status: 'Pending',
      estBalance: 120.00,
      risk: 'Medium Risk',
      reason: '⚠️ Eligibility check pending submission',
      action: 'Verify Eligibility Now'
    },
    {
      id: 'patient-robert-downey',
      name: 'Robert Downey',
      time: '01:15 PM',
      provider: 'Cigna Dental',
      memberId: 'CIGINVALID00',
      status: 'Issues',
      estBalance: 1200.00,
      risk: 'High Rejection Risk',
      reason: '❌ Invalid member ID, ❌ Pre-auth missing',
      action: 'Update Card & Call Cigna'
    },
    {
      id: 'patient-emily-watson',
      name: 'Emily Watson',
      time: '03:30 PM',
      provider: null,
      memberId: null,
      status: 'Missing',
      estBalance: 220.00,
      risk: 'Critical Risk',
      reason: '❌ Insurance card missing entirely',
      action: 'Trigger SMS Card Uploader'
    }
  ];

  const handleQuickVerify = async (patientId: string) => {
    if (!patientId) return;
    setVerifyingId(patientId);
    try {
      await verifyInsurance(patientId);
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleTriggerFollowupDesk = (patientId: string) => {
    alert("Verification follow-up card uploader link sent via SMS to Emily Watson.");
  };

  // -------------------------------------------------------------
  // ROLE 5: PATIENT DASHBOARD LAYOUT
  // -------------------------------------------------------------
  if (currentRole === 'Patient') {
    const activePatient = patients.find(p => p.name === 'John Smith') || patients[0];
    const selectedTreatObj = patientTreatments.find(t => t.code === selectedPatientTreatment) || patientTreatments[0];

    const monthlyInstallment = paymentPlan === '3month' 
      ? Math.round(selectedTreatObj.patientPay / 3)
      : Math.round(selectedTreatObj.patientPay / 6);

    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Welcome, {activePatient.name}</h1>
          <p className="text-sm text-slate-500">Your health coverage dashboard and transparent billing center.</p>
        </div>

        {/* Patient Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Cost transparency portal */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-cyan-600" />
                  My Healthcare Cost Predictor
                </h2>
                <p className="text-xs text-slate-500">Review real-time estimates of insurance contribution vs. your personal responsibility.</p>
              </div>

              {/* Treatment selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1.5">Select Proposed Treatment</label>
                  <select
                    value={selectedPatientTreatment}
                    onChange={(e) => setSelectedPatientTreatment(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none bg-white transition focus:border-cyan-500"
                  >
                    {patientTreatments.map(t => (
                      <option key={t.code} value={t.code}>{t.name} ({t.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Billing Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimated Total Cost</span>
                  <span className="text-lg font-black text-slate-900">${selectedTreatObj.total.toFixed(2)}</span>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl">
                  <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">Insurance Contribution</span>
                  <span className="text-lg font-black text-emerald-700">${selectedTreatObj.insPaid.toFixed(2)}</span>
                </div>
                <div className="bg-cyan-50/50 border border-cyan-100 p-4 rounded-xl">
                  <span className="text-[10px] text-cyan-800 font-bold uppercase tracking-wider block">Your Responsibility</span>
                  <span className="text-lg font-black text-cyan-700">${selectedTreatObj.patientPay.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment plan selector */}
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Patient Installment Options</span>
                  <span className="text-[11px] text-slate-400">Distribute your out-of-pocket balance over monthly intervals with 0% interest.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'full', label: 'Pay In Full', desc: `$${selectedTreatObj.patientPay} today` },
                    { id: '3month', label: '3-Month Plan', desc: `$${monthlyInstallment}/mo for 3 mos` },
                    { id: '6month', label: '6-Month Plan', desc: `$${monthlyInstallment}/mo for 6 mos` }
                  ].map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setPaymentPlan(plan.id as any)}
                      className={`text-left p-3.5 border rounded-xl transition ${
                        paymentPlan === plan.id 
                          ? 'border-cyan-500 bg-cyan-50/20 shadow-sm' 
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-800 block">{plan.label}</span>
                      <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{plan.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Insurance profile status */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-950 mb-3">Active Coverage Plans</h3>
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="rounded-full bg-emerald-100 p-2.5 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-slate-800 text-xs block">Premium PPO Plan</span>
                  <span className="text-[10px] text-slate-500 block">Payer Company: {activePatient.insuranceProvider || 'BCBS'}</span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Verified Active</span>
              </div>
            </div>

          </div>

          {/* Quick links & Documents */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Upload Insurance Document</h3>
              <p className="text-xs text-slate-500">Scan and update your active insurance details prior to booking.</p>
              
              <Link href={`/patients?id=${activePatient.id}`} className="w-full inline-flex items-center justify-center rounded-lg bg-cyan-600 px-4 py-2.5 text-xs font-semibold text-white shadow hover:bg-cyan-700 transition">
                Scan Insurance Card Front
              </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scanned Document Vault</h3>
              {activePatient.documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 border border-slate-100 text-xs">
                  <span className="font-medium text-slate-700 truncate max-w-[150px]">{doc.name}</span>
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">{doc.docType}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // Clinic Owner specific computations

  // -------------------------------------------------------------
  // ROLE 1: CLINIC OWNER DASHBOARD LAYOUT
  // -------------------------------------------------------------
  if (currentRole === 'Admin') {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 flex-1 flex flex-col animate-in fade-in duration-200">
        
        {/* Executive Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Executive Revenue Intelligence</h1>
            <p className="text-sm text-slate-500">Clinic performance audits, billing error trends, and claim denial parameters.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
            <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
            Revenue Sync: Active
          </span>
        </div>

        {/* Executive stats card panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          
          <div className="rounded-xl border border-rose-150 bg-gradient-to-tr from-rose-50/10 to-white p-6 shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Potential Revenue Leaked</span>
            <h3 className="text-3xl font-black text-rose-600 mt-1">${totalLeakageSum.toLocaleString()}</h3>
            <span className="text-xs text-rose-800 font-semibold block mt-3">⚠️ Missed checks & unverified plans</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Claim Approval Rate</span>
            <h3 className="text-3xl font-black text-slate-900 mt-1">94.2%</h3>
            <span className="text-xs text-emerald-700 font-semibold block mt-3">✓ 3.2% increase since InsuraFlow</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Average Verification Time</span>
            <h3 className="text-3xl font-black text-slate-900 mt-1">2.1 min</h3>
            <span className="text-xs text-slate-500 font-semibold block mt-3">⚡ 82% faster than payer portals</span>
          </div>

          <div className="rounded-xl border border-cyan-150 bg-gradient-to-tr from-cyan-50/30 to-white p-6 shadow-sm">
            <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-800">Billing Accuracy Rating</span>
            <h3 className="text-3xl font-black text-cyan-900 mt-1">96.8%</h3>
            <span className="text-xs text-cyan-800 font-bold block mt-3">✓ 87% reduction in claim scrubs</span>
          </div>

        </div>

        {/* Revenue Leakage Detector and Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Leakage details */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Revenue Leakage Detector</h3>
              <p className="text-xs text-slate-500">AI pinpointing unresolved coverage items affecting payouts.</p>
            </div>

            <div className="space-y-3.5">
              {aiInsights.map((insight) => (
                <div key={insight.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-start justify-between gap-3 text-xs">
                  <div className="min-w-0 space-y-1">
                    <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      insight.type === 'Leakage' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                    }`}>{insight.type}</span>
                    <p className="text-slate-600 leading-relaxed font-semibold">{insight.description}</p>
                  </div>
                  <span className="font-extrabold text-slate-900 shrink-0">+${insight.potentialRevenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Area charts */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Payout Trends</h3>
              <p className="text-xs text-slate-500">Aggregated verified claims payout trend (January - June).</p>
            </div>

            <div className="h-[230px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0891b2" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#0891b2" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip formatter={(value) => [`$${value}`, undefined]} />
                  <Area type="monotone" dataKey="Verified" stroke="#0891b2" strokeWidth={2} fillOpacity={1} fill="url(#colorVerified)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    );
  }

  // -------------------------------------------------------------
  // ROLE 2: BILLING MANAGER DASHBOARD LAYOUT
  // -------------------------------------------------------------
  if (currentRole === 'BillingManager') {
    // Gather all authorizations and claims
    const allAuths = patients.reduce((acc: Authorization[], p) => [...acc, ...p.authorizations], []);
    const allClaims = patients.reduce((acc: Claim[], p) => [...acc, ...p.claims], []);

    const handleCreateAuthSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!authPatientId || !authProcedure) return;
      await createAuthorization({
        patientId: authPatientId,
        procedureCode: authProcedure,
        procedureDesc: authDesc,
        details: authDetails || undefined
      });
      setIsAuthModalOpen(false);
      setAuthDetails('');
    };

    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 flex-1 flex flex-col animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Billing Operations Workspace</h1>
            <p className="text-sm text-slate-500">Scrub clinical claims, check pre-authorizations status, and review cost distributions.</p>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 transition"
          >
            <Plus className="h-4 w-4" />
            Request Prior Auth
          </button>
        </div>

        {/* Prior Auth and Claim Scrubbing Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          
          {/* AI Prior Auth Manager */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-cyan-600" />
                AI Prior Authorization Tracker
              </h3>
              <p className="text-xs text-slate-500">Review insurer verification requirements for scheduled major treatments.</p>
            </div>

            <div className="space-y-3.5 max-h-96 overflow-y-auto">
              {allAuths.map((auth) => (
                <div key={auth.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2.5 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-extrabold text-slate-800 text-sm">{auth.procedureCode} - {auth.procedureDesc}</span>
                      <span className="block text-[10px] text-slate-400 mt-0.5">Patient ID Reference: {auth.patientId.slice(0,8)}...</span>
                    </div>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 font-bold uppercase text-[9px] tracking-wide ${
                      auth.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      auth.status === 'Submitted' ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' :
                      'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>{auth.status}</span>
                  </div>

                  <p className="text-slate-500 font-medium leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100/50">{auth.details}</p>
                  
                  {auth.authCode && (
                    <div className="flex justify-between text-[10px] font-bold text-slate-600 border-t border-slate-100 pt-2">
                      <span>Auth Code:</span>
                      <span className="font-mono text-cyan-700">{auth.authCode}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Claim Scrubbing Dashboard */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-cyan-600 animate-pulse" />
                AI Claim Scrubbing Hub
              </h3>
              <p className="text-xs text-slate-500">Pre-flight checks assessing claim details against compliance parameters before dispatch.</p>
            </div>

            <div className="space-y-3.5 max-h-96 overflow-y-auto">
              {allClaims.map((claim) => (
                <div key={claim.id} className="p-4 rounded-xl border border-slate-100 bg-white space-y-3 shadow-sm border-l-4 border-l-slate-200">
                  <div className="flex justify-between items-start text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{claim.treatmentCode} - {claim.treatmentDesc}</span>
                      <span className="text-[10px] text-slate-400">Total charge: ${claim.totalCharge.toFixed(2)}</span>
                    </div>
                    <span className={`inline-flex rounded px-1.5 py-0.5 font-bold uppercase text-[9px] ${
                      claim.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      claim.status === 'Denied' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                      'bg-slate-50 text-slate-600 border border-slate-200'
                    }`}>{claim.status}</span>
                  </div>

                  {/* Scrubber Gauge info */}
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      Scrub Score: 
                      <span className={`font-black tracking-wide ${
                        claim.riskScore === 'Low' ? 'text-emerald-600' :
                        claim.riskScore === 'Medium' ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {claim.riskScore === 'Low' ? '98% (Ready)' :
                         claim.riskScore === 'Medium' ? '76% (Review)' : '35% (Warning)'}
                      </span>
                    </span>
                    <button
                      onClick={() => auditClaim(claim.id)}
                      disabled={isActionLoading}
                      className="text-[10px] font-bold text-cyan-600 hover:text-cyan-800 transition"
                    >
                      Audit Code
                    </button>
                  </div>

                  {claim.missingCodes && (
                    <div className="text-[10px] text-rose-700 bg-rose-50 p-2 rounded border border-rose-100 leading-normal">
                      <strong>Scrub Warnings:</strong> {claim.missingCodes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* MODAL DIALOG: Prior Authorization Request */}
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Request Prior Authorization</h3>
                <button 
                  onClick={() => setIsAuthModalOpen(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAuthSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Select Patient</label>
                  <select
                    value={authPatientId}
                    onChange={(e) => setAuthPatientId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none bg-white transition focus:border-cyan-500"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Procedure Code</label>
                    <input
                      type="text"
                      required
                      value={authProcedure}
                      onChange={(e) => setAuthProcedure(e.target.value)}
                      placeholder="e.g. D6010"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Procedure Title</label>
                    <input
                      type="text"
                      required
                      value={authDesc}
                      onChange={(e) => setAuthDesc(e.target.value)}
                      placeholder="e.g. Implant Surgery"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Clinical Details</label>
                  <textarea
                    value={authDetails}
                    onChange={(e) => setAuthDetails(e.target.value)}
                    placeholder="Describe clinical necessity, attach notes link, etc."
                    className="w-full h-20 rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-cyan-500 transition resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-cyan-600 px-4 py-2 font-bold text-white shadow hover:bg-cyan-700 transition"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  }

  // -------------------------------------------------------------
  // ROLE 4: PROVIDER (DOCTOR) DASHBOARD LAYOUT
  // -------------------------------------------------------------
  if (currentRole === 'Doctor') {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 flex-1 flex flex-col animate-in fade-in duration-200">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Clinical Patient Board</h1>
          <p className="text-sm text-slate-500">Track active procedures, eligibility risk warnings, and authorization statuses.</p>
        </div>

        {/* Provider Directory */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-base font-bold text-slate-900">Active Patient Directory (Clinical Checklist)</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-3">Patient Name</th>
                  <th className="px-6 py-3">Insurance Company</th>
                  <th className="px-6 py-3">Active Authorizations</th>
                  <th className="px-6 py-3">Rejection Risk Score</th>
                  <th className="px-6 py-3 text-right">Review Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {patients.map((patient) => {
                  const verified = patient.insuranceStatus === 'Verified';
                  const auths = patient.authorizations.map(a => a.procedureCode).join(', ') || 'No Active Auths';
                  
                  return (
                    <tr key={patient.id} className="hover:bg-slate-50/30 transition">
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {patient.name}
                        <span className="block text-[10px] text-slate-400 font-medium">DOB: {new Date(patient.dob).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">
                        {patient.insuranceProvider || 'None Provided'}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600 font-semibold">
                        {auths}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          patient.insuranceStatus === 'Verified' ? 'bg-emerald-50 text-emerald-700' :
                          patient.insuranceStatus === 'Issues' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {patient.insuranceStatus === 'Verified' ? 'Low Risk' :
                           patient.insuranceStatus === 'Issues' ? 'High Rejection Risk' : 'Medium Risk'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/patients?id=${patient.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 transition"
                        >
                          Open Profile
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  }

  // -------------------------------------------------------------
  // ROLE 3: FRONT DESK DASHBOARD LAYOUT (DEFAULT COMMAND CENTER)
  // -------------------------------------------------------------
  const totalRequestsCount = patients.length + 119;
  const verifiedRequestsCount = verifiedCount + 106;
  const issuesRequestsCount = issuesCount + 13;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 flex-1 flex flex-col animate-in fade-in duration-200">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Verification Command Center</h1>
          <p className="text-sm text-slate-500">Real-time scheduling reviews, card scans, and front-desk eligibility audits.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/patients"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-700 transition"
          >
            <UserPlus className="h-4 w-4" />
            Add Patient
          </Link>
        </div>
      </div>

      {/* Operations Panel */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Requests Today</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{totalRequestsCount}</h3>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-slate-600 border border-slate-200/50">
              <Layers className="h-6 w-6" />
            </div>
          </div>
          <span className="text-xs text-slate-400 font-semibold block mt-4">Payer queries processed</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verified eligibility</p>
              <h3 className="text-3xl font-extrabold text-emerald-600 mt-1">{verifiedRequestsCount}</h3>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
          <span className="text-xs text-emerald-700 font-semibold block mt-4">Active & eligible records</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Issues Found</p>
              <h3 className="text-3xl font-extrabold text-rose-600 mt-1">{issuesRequestsCount}</h3>
            </div>
            <div className="rounded-xl bg-rose-50 p-3 text-rose-600 border border-rose-100">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
          <span className="text-xs text-rose-700 font-semibold block mt-4">Requires manual reconciliation</span>
        </div>

        <div className="rounded-xl border border-cyan-100 bg-gradient-to-tr from-cyan-50/50 to-white p-6 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-cyan-800 uppercase tracking-wider">Revenue Leakage Risk</p>
              <h3 className="text-3xl font-extrabold text-cyan-900 mt-1">$8,400.00</h3>
            </div>
            <div className="rounded-xl bg-cyan-100/50 p-3 text-cyan-700 border border-cyan-200">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
          <span className="text-xs text-cyan-800 font-bold block mt-4">Claims missing authorizations</span>
        </div>

      </div>

      {/* Tabs list queue */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between px-6 py-5 border-b border-slate-100 gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-bold text-slate-900">Verification Worklists</h3>
            
            <div className="flex bg-slate-100 p-1 rounded-lg w-fit text-xs font-semibold text-slate-600">
              <button
                onClick={() => setActiveQueueTab('all')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition ${
                  activeQueueTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-800'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                Eligibility Verification Queue
              </button>
              <button
                onClick={() => setActiveQueueTab('tomorrow')}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition ${
                  activeQueueTab === 'tomorrow' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-800'
                }`}
              >
                <CalendarDays className="h-3.5 w-3.5 text-cyan-600" />
                Tomorrow's Pre-Appointment Audit
              </button>
            </div>
          </div>

          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-1.5 text-sm outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {activeQueueTab === 'all' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-3">Patient Name</th>
                  <th className="px-6 py-3">Payer Details</th>
                  <th className="px-6 py-3">Member ID</th>
                  <th className="px-6 py-3">Verification Status</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {queuePatientsList.map((patient) => {
                  const hasInsurance = patient.insuranceProvider && patient.memberId;
                  const isVerifying = verifyingId === patient.id;
                  
                  return (
                    <tr key={patient.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <Link href={`/patients?id=${patient.id}`} className="font-semibold text-cyan-700 hover:text-cyan-800 hover:underline">
                          {patient.name}
                        </Link>
                        <span className="block text-[11px] text-slate-400">DOB: {new Date(patient.dob).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {patient.insuranceProvider || (
                          <span className="text-slate-400 italic">None Provided</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">
                        {patient.memberId || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          patient.insuranceStatus === 'Verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          patient.insuranceStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          patient.insuranceStatus === 'Issues' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {patient.insuranceStatus === 'Verified' && <CheckCircle2 className="h-3 w-3" />}
                          {patient.insuranceStatus === 'Pending' && <Clock className="h-3 w-3" />}
                          {patient.insuranceStatus === 'Issues' && <AlertTriangle className="h-3 w-3" />}
                          {patient.insuranceStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(patient.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {hasInsurance ? (
                            <button
                              onClick={() => handleQuickVerify(patient.id)}
                              disabled={isVerifying || isActionLoading}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-cyan-600 shadow-sm hover:bg-slate-50 hover:text-cyan-700 transition disabled:opacity-50"
                            >
                              <BrainCircuit className={`h-3.5 w-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                              {isVerifying ? 'Verifying...' : 'AI Verify'}
                            </button>
                          ) : (
                            <Link
                              href={`/patients?id=${patient.id}`}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-800 transition"
                            >
                              Scan Card
                            </Link>
                          )}
                          <Link 
                            href={`/patients?id=${patient.id}`}
                            className="text-slate-400 hover:text-slate-600 transition"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-3">Time / Patient</th>
                  <th className="px-6 py-3">Insurance details</th>
                  <th className="px-6 py-3">Risk Assessment</th>
                  <th className="px-6 py-3">Estimated Copay to Collect</th>
                  <th className="px-6 py-3">Compliance Reason</th>
                  <th className="px-6 py-3 text-right">Required Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {tomorrowScheduleData.map((appointment) => {
                  const isProcessing = verifyingId === appointment.id;
                  
                  return (
                    <tr key={appointment.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <span className="font-bold text-cyan-600 block text-xs tracking-wider">{appointment.time}</span>
                        <Link href={`/patients?id=${patients.find(p => p.name === appointment.name)?.id}`} className="font-bold text-slate-900 hover:underline">
                          {appointment.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800 block text-xs">
                          {appointment.provider || 'Unassigned'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {appointment.memberId || 'Missing ID'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase border ${
                          appointment.risk.includes('Low') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          appointment.risk.includes('Medium') ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-rose-50 text-rose-700 border-rose-100 animate-pulse'
                        }`}>
                          {appointment.risk}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        ${appointment.estBalance.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-medium leading-relaxed max-w-[220px]">
                        {appointment.reason}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {appointment.status === 'Verified' ? (
                          <span className="text-xs text-slate-400 font-bold">✓ Complete</span>
                        ) : appointment.status === 'Missing' ? (
                          <button
                            onClick={() => handleTriggerFollowupDesk(appointment.id)}
                            disabled={isProcessing || isActionLoading}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-rose-700 transition"
                          >
                            <Send className="h-3 w-3" />
                            Send Uploader SMS
                          </button>
                        ) : (
                          <button
                            onClick={() => handleQuickVerify(patients.find(p => p.name === appointment.name)?.id || '')}
                            disabled={isProcessing || isActionLoading}
                            className="inline-flex items-center gap-1 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-cyan-700 transition"
                          >
                            <BrainCircuit className="h-3.5 w-3.5" />
                            Check Eligibility
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
