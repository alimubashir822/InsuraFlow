'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppState, Patient, Claim, Authorization } from '@/lib/context';
import { 
  Users, 
  Search, 
  Plus, 
  UserCircle2, 
  Phone, 
  Mail, 
  Calendar, 
  BrainCircuit, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  UploadCloud, 
  FileText, 
  AlertCircle, 
  Play, 
  Send, 
  Activity,
  ChevronRight,
  PlusCircle,
  HelpCircle,
  ShieldCheck,
  TrendingDown,
  Info,
  Check,
  ArrowRight,
  Database,
  ShieldAlert,
  Loader2
} from 'lucide-react';

function PatientsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { 
    patients, 
    isActionLoading, 
    addPatient, 
    verifyInsurance, 
    scanCard, 
    createClaim, 
    auditClaim, 
    submitClaim,
    createAuthorization,
    updateAuthorization,
    currentRole 
  } = useAppState();

  const activeId = searchParams.get('id');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Compare Insurance Toggle
  const [isComparing, setIsComparing] = useState(false);

  // Add Patient Modal Form
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDob, setNewDob] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newProvider, setNewProvider] = useState('');
  const [newMemberId, setNewMemberId] = useState('');
  const [newGroupNumber, setNewGroupNumber] = useState('');

  // OCR scanning simulator state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState('');

  // Prior Auth Form
  const [isPriorAuthOpen, setIsPriorAuthOpen] = useState(false);
  const [newAuthCode, setNewAuthCode] = useState('D6010');
  const [newAuthDesc, setNewAuthDesc] = useState('Surgical Placement of Implant Body');
  const [newAuthDetails, setNewAuthDetails] = useState('');

  // Cost Estimator state
  const [selectedTreatment, setSelectedTreatment] = useState('D1110'); // Dental Cleaning
  const [estimationResult, setEstimationResult] = useState<{
    totalCost: number;
    insPays: number;
    patPays: number;
    coveragePct: number;
    copay: number;
    coinsurance: number;
  } | null>(null);

  // Draft Claim form state
  const [claimCode, setClaimCode] = useState('D1110');
  const [claimDesc, setClaimDesc] = useState('Prophylaxis - Adult Cleaning');
  const [claimCharge, setClaimCharge] = useState('150');

  // Trigger patient detail change based on search parameters
  useEffect(() => {
    if (activeId) {
      const patient = patients.find(p => p.id === activeId);
      if (patient) {
        setSelectedPatient(patient);
      }
    } else if (patients.length > 0 && !selectedPatient) {
      setSelectedPatient(patients[0]);
    }
  }, [activeId, patients]);

  // Recalculate AI billing estimate when active patient or selected treatment changes
  useEffect(() => {
    if (selectedPatient) {
      calculateEstimate();
    }
  }, [selectedPatient, selectedTreatment]);

  // Treatment Catalog
  const treatments = [
    { code: 'D1110', name: 'Prophylaxis - Adult Cleaning', charge: 150 },
    { code: 'D0220', name: 'Intraoral - Periapical First Radiograph (X-Ray)', charge: 85 },
    { code: 'D0150', name: 'Comprehensive Oral Evaluation', charge: 120 },
    { code: 'D2750', name: 'Crown - Porcelain Fused to High Noble Metal', charge: 1200 },
    { code: 'D6010', name: 'Surgical Placement of Implant Body', charge: 2400 },
    { code: 'D3330', name: 'Endodontic Therapy - Molar (Root Canal)', charge: 950 },
    { code: 'D2391', name: 'Composite Resin - One Surface, Posterior (Filling)', charge: 220 },
  ];

  const handleTreatmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedTreatment(code);
    const treatObj = treatments.find(t => t.code === code);
    if (treatObj) {
      setClaimCode(treatObj.code);
      setClaimDesc(treatObj.name);
      setClaimCharge(treatObj.charge.toString());
    }
  };

  const calculateEstimate = () => {
    if (!selectedPatient) return;
    const activePlan = selectedPatient.insurancePlans[0];
    const treat = treatments.find(t => t.code === selectedTreatment);
    if (!treat) return;

    let totalCost = treat.charge;
    let insPays = 0;
    let patPays = totalCost;
    let coveragePct = 0;
    let copay = 0;
    let coinsurance = 0;

    if (selectedPatient.insuranceStatus === 'Verified' && activePlan) {
      copay = activePlan.copay;
      coinsurance = activePlan.coinsurance;

      const remainingDeductible = Math.max(0, activePlan.deductible - activePlan.deductibleMet);

      if (treat.code === 'D1110') {
        coveragePct = 100;
        insPays = totalCost;
        patPays = 0;
        copay = 0;
        coinsurance = 0;
      } else {
        let patientShare = remainingDeductible;
        const costAfterDeductible = Math.max(0, totalCost - remainingDeductible);
        const coinShare = costAfterDeductible * (coinsurance / 100);
        patientShare += coinShare + copay;

        patPays = Math.min(totalCost, patientShare);
        insPays = totalCost - patPays;
        coveragePct = Math.round((insPays / totalCost) * 100);
      }
    }

    setEstimationResult({
      totalCost,
      insPays,
      patPays,
      coveragePct,
      copay,
      coinsurance
    });
  };

  const handleAddPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newDob) return;

    try {
      const p = await addPatient({
        name: newName,
        dob: newDob,
        email: newEmail,
        phone: newPhone,
        insuranceProvider: newProvider || undefined,
        memberId: newMemberId || undefined,
        groupNumber: newGroupNumber || undefined,
      });
      setIsAddModalOpen(false);
      setNewName('');
      setNewDob('');
      setNewEmail('');
      setNewPhone('');
      setNewProvider('');
      setNewMemberId('');
      setNewGroupNumber('');
      router.push(`/patients?id=${p.id}`);
    } catch (err) {
      alert('Error creating patient');
    }
  };

  const handleVerify = async () => {
    if (!selectedPatient) return;
    await verifyInsurance(selectedPatient.id);
  };

  const handleScanSimulation = async (type: string) => {
    if (!selectedPatient) return;
    setIsScanning(true);
    setScanProgress(10);
    setScanMessage('Uploading card image securely to HIPAA cloud...');

    const runProgress = (progress: number, msg: string, ms: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setScanProgress(progress);
          setScanMessage(msg);
          resolve();
        }, ms);
      });
    };

    await runProgress(35, 'Preprocessing card image & checking credentials...', 600);
    await runProgress(65, 'Running AI OCR parser on card lines...', 800);
    await runProgress(90, 'Validating plan details with payer databases...', 500);

    try {
      await scanCard(selectedPatient.id, `${selectedPatient.name.toLowerCase().replace(' ', '_')}_${type}.png`);
      setScanProgress(100);
      setScanMessage('Scan Successful! Details extracted.');
      setTimeout(() => {
        setIsScanning(false);
      }, 500);
    } catch (err) {
      alert('Scanning failed');
      setIsScanning(false);
    }
  };

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !claimCode || !claimCharge) return;

    try {
      await createClaim({
        patientId: selectedPatient.id,
        treatmentCode: claimCode,
        treatmentDesc: claimDesc,
        totalCharge: parseFloat(claimCharge),
      });
    } catch (e) {
      alert('Failed to create claim');
    }
  };

  const handleCreatePriorAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !newAuthCode || !newAuthDesc) return;

    try {
      await createAuthorization({
        patientId: selectedPatient.id,
        procedureCode: newAuthCode,
        procedureDesc: newAuthDesc,
        details: newAuthDetails || undefined
      });
      setIsPriorAuthOpen(false);
      setNewAuthDetails('');
    } catch (err) {
      alert('Failed to initiate authorization');
    }
  };

  const handleApproveAuth = async (authId: string) => {
    try {
      await updateAuthorization({
        authId,
        action: 'approve',
        details: 'AI Prior Authorization successfully approved by payer medical board. Payer token generated.'
      });
    } catch (err) {
      alert('Failed to update auth');
    }
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.memberId && p.memberId.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || p.insuranceStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectPatient = (id: string) => {
    router.push(`/patients?id=${id}`);
    setIsComparing(false);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 flex-1 flex flex-col lg:flex-row gap-8">
      
      {/* LEFT PANE: Patients Index */}
      <div className="w-full lg:w-96 flex flex-col gap-5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-slate-500" />
            <h2 className="text-xl font-bold text-slate-900">Patients</h2>
          </div>
          {currentRole !== 'Patient' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-cyan-700 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Patient
            </button>
          )}
        </div>

        {/* Filter Switcher */}
        <div className="grid grid-cols-4 gap-1 rounded-lg bg-slate-100 p-1 text-xs font-medium text-slate-600">
          {['All', 'Verified', 'Pending', 'Issues'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-md py-1 text-center transition ${
                statusFilter === status 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'hover:bg-slate-50/50 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name or member ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-sm outline-none transition focus:border-cyan-500 bg-white"
          />
        </div>

        {/* List of Patients */}
        <div className="flex-1 overflow-y-auto max-h-[500px] lg:max-h-[650px] border border-slate-200 rounded-xl bg-white divide-y divide-slate-100 shadow-sm">
          {filteredPatients.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No patients found.
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => selectPatient(patient.id)}
                className={`w-full text-left p-4 flex items-center justify-between transition hover:bg-slate-50/60 ${
                  selectedPatient?.id === patient.id ? 'bg-cyan-50/40 border-r-4 border-cyan-600' : ''
                }`}
              >
                <div className="min-w-0 pr-3">
                  <span className="font-semibold text-slate-900 block truncate">{patient.name}</span>
                  <span className="text-xs text-slate-500 block">DOB: {new Date(patient.dob).toLocaleDateString()}</span>
                  <span className="text-[11px] text-slate-400 block truncate mt-0.5">
                    {patient.insuranceProvider ? `${patient.insuranceProvider}` : 'No Insurance'}
                  </span>
                </div>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                  patient.insuranceStatus === 'Verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                  patient.insuranceStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                  patient.insuranceStatus === 'Issues' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                  'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {patient.insuranceStatus}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANE: Selected Patient Details */}
      <div className="flex-1 space-y-6 min-w-0">
        {selectedPatient ? (
          <>
            {/* Header & Details Overview */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-cyan-100">
                  <UserCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">{selectedPatient.name}</h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-slate-400" /> DOB: {new Date(selectedPatient.dob).toLocaleDateString()}</span>
                    {selectedPatient.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-slate-400" /> {selectedPatient.phone}</span>}
                    {selectedPatient.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-slate-400" /> {selectedPatient.email}</span>}
                  </div>
                </div>
              </div>

              {/* Verify Trigger Button */}
              {currentRole !== 'Patient' && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  {selectedPatient.insuranceStatus === 'Verified' && (
                    <button
                      onClick={() => setIsComparing(!isComparing)}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3.5 py-2.5 text-sm font-bold shadow-sm transition w-full sm:w-auto ${
                        isComparing 
                          ? 'bg-cyan-50 text-cyan-700 border-cyan-200' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Info className="h-4 w-4" />
                      {isComparing ? 'Close Comparison' : 'Compare Secondary Plan'}
                    </button>
                  )}
                  <button
                    onClick={handleVerify}
                    disabled={isActionLoading || !selectedPatient.insuranceProvider || !selectedPatient.memberId}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-cyan-700 disabled:opacity-50 transition w-full sm:w-auto"
                  >
                    <BrainCircuit className="h-4 w-4" />
                    AI Eligibility Verify
                  </button>
                </div>
              )}
            </div>

            {/* Multi-Insurance Comparison Panel */}
            {isComparing && selectedPatient.insuranceStatus === 'Verified' && (
              <div className="rounded-xl border border-cyan-150 bg-gradient-to-tr from-cyan-50/10 to-white p-6 shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-cyan-600" />
                    <h3 className="text-md font-bold text-slate-900">AI Multi-Insurance Benefit Compare</h3>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-700 bg-cyan-100/50 px-2 py-0.5 rounded">Secondary Coverage simulated</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Primary Plan (Active)</span>
                    <h4 className="font-extrabold text-slate-800 text-sm">{selectedPatient.insuranceProvider} - Premium PPO</h4>
                    
                    <ul className="text-xs text-slate-600 space-y-1.5 pt-2">
                      <li className="flex justify-between"><span>Deductible:</span> <strong>$500 ($150 remaining)</strong></li>
                      <li className="flex justify-between text-emerald-600 font-medium"><span>Preventive:</span> <strong>100% Covered</strong></li>
                      <li className="flex justify-between"><span>X-Ray:</span> <strong>80% Covered</strong></li>
                      <li className="flex justify-between"><span>Major Implant:</span> <strong>50% Coverage ($1200 out-of-pocket)</strong></li>
                    </ul>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Secondary Plan (Alternative)</span>
                    <h4 className="font-extrabold text-slate-800 text-sm">Aetna Gold Choice - Select HMO</h4>
                    
                    <ul className="text-xs text-slate-600 space-y-1.5 pt-2">
                      <li className="flex justify-between"><span>Deductible:</span> <strong>$750 ($550 remaining)</strong></li>
                      <li className="flex justify-between text-emerald-600 font-medium"><span>Preventive:</span> <strong>100% Covered</strong></li>
                      <li className="flex justify-between"><span>X-Ray:</span> <strong>85% Covered</strong></li>
                      <li className="flex justify-between text-cyan-700 font-semibold"><span>Major Implant:</span> <strong>85% Coverage ($360 out-of-pocket!)</strong></li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl bg-cyan-50 border border-cyan-100 p-4 text-xs text-cyan-800 flex items-start gap-2.5">
                  <BrainCircuit className="h-5 w-5 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">AI Optimization Strategy:</span>
                    <p className="mt-0.5 leading-relaxed">
                      For standard **preventive care**, submit under **Primary BCBS** (reaches 100% with no referral required). For major surgeries like **Dental Implant (D6010)**, route as a dual-coordination claim or prioritize **Secondary Aetna**—this secures an 85% major procedure coverage bracket, **saving the patient $840** in out-of-pocket responsibility.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Insurance Operations Timeline */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Insurance Operations Lifecycle</h3>
              
              <div className="relative border-l border-slate-200 ml-4.5 pl-6 space-y-6">
                {[
                  { title: 'Plan Created', date: 'Jan 2026', desc: 'Patient demographics matching record registered in InsuraFlow directory.', active: true, done: true },
                  { title: 'Card Scanned via OCR', date: 'Feb 2026', desc: 'Primary document credentials extracted and uploaded to HIPAA cloud.', active: !!selectedPatient.insuranceProvider, done: !!selectedPatient.insuranceProvider },
                  { title: 'AI Eligibility Checked', date: 'Feb 2026', desc: 'Payer gateway dispatched API verification request.', active: selectedPatient.insuranceStatus !== 'Missing', done: selectedPatient.insuranceStatus === 'Verified' || selectedPatient.insuranceStatus === 'Issues' },
                  { title: 'Denial Rejection Audit', date: 'Mar 2026', desc: 'AI compliance engine parsed codes for pre-authorization risks.', active: selectedPatient.insuranceStatus === 'Verified' || selectedPatient.insuranceStatus === 'Issues', done: selectedPatient.insuranceStatus === 'Verified' },
                  { title: 'Claim Settle / Checkout', date: 'Apr 2026', desc: 'Insurer coordination completes and patient responsibility clears.', active: selectedPatient.insuranceStatus === 'Verified', done: selectedPatient.insuranceStatus === 'Verified' && selectedPatient.claims.some(c => c.status === 'Paid') },
                ].map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-10 top-0.5 h-7 w-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all ${
                      item.done ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' :
                      item.active ? 'bg-cyan-50 border-cyan-500 text-cyan-600' :
                      'bg-white border-slate-200 text-slate-300'
                    }`}>
                      {item.done ? '✓' : idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-bold ${item.active ? 'text-slate-800' : 'text-slate-400'}`}>{item.title}</h4>
                        <span className="text-[10px] text-slate-400 font-bold">{item.date}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 max-w-xl leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid Layout for details and simulators */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

              {/* Left Grid Section */}
              <div className="space-y-6">
                
                {/* Insurance Fields Card */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-md font-bold text-slate-900">Payer Details</h3>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      selectedPatient.insuranceStatus === 'Verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      selectedPatient.insuranceStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      selectedPatient.insuranceStatus === 'Issues' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                      'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {selectedPatient.insuranceStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Insurance Company</span>
                      <span className="font-semibold text-slate-800">{selectedPatient.insuranceProvider || <span className="text-slate-400 italic">Not set</span>}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Member ID</span>
                      <span className="font-mono text-xs font-semibold text-slate-800">{selectedPatient.memberId || <span className="text-slate-400 italic">Not set</span>}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Group number</span>
                      <span className="font-mono text-xs font-semibold text-slate-800">{selectedPatient.groupNumber || <span className="text-slate-400 italic">Not set</span>}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Effective Date</span>
                      <span className="font-semibold text-slate-800">
                        {selectedPatient.insurancePlans[0] 
                          ? new Date(selectedPatient.insurancePlans[0].effectiveDate).toLocaleDateString()
                          : <span className="text-slate-400 italic">No plan active</span>
                        }
                      </span>
                    </div>
                  </div>

                  {selectedPatient.insurancePlans[0] && (
                    <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-center text-xs">
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Plan Deductible</span>
                        <span className="font-bold text-slate-800">${selectedPatient.insurancePlans[0].deductible}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Deductible Met</span>
                        <span className="font-bold text-emerald-600">${selectedPatient.insurancePlans[0].deductibleMet}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Copay / Coins</span>
                        <span className="font-bold text-slate-800">${selectedPatient.insurancePlans[0].copay} / {selectedPatient.insurancePlans[0].coinsurance}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* UPGRADE: AI Prior Authorization Manager */}
                {currentRole !== 'Patient' && (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-md font-bold text-slate-900 flex items-center gap-1.5">
                        <ShieldCheck className="h-5 w-5 text-cyan-600" />
                        AI Prior Authorization Manager
                      </h3>
                      <button
                        onClick={() => setIsPriorAuthOpen(true)}
                        className="text-xs font-bold text-cyan-600 hover:text-cyan-800 transition"
                      >
                        Initiate Auth
                      </button>
                    </div>

                    <div className="space-y-3 max-h-56 overflow-y-auto">
                      {selectedPatient.authorizations.length === 0 ? (
                        <p className="text-xs text-slate-400 italic text-center py-4">No active authorizations required or submitted for this patient.</p>
                      ) : (
                        selectedPatient.authorizations.map(auth => (
                          <div key={auth.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2 text-xs">
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-slate-800">{auth.procedureCode} - {auth.procedureDesc}</span>
                              <span className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${
                                auth.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-cyan-50 text-cyan-700 border border-cyan-150 animate-pulse'
                              }`}>{auth.status}</span>
                            </div>
                            <p className="text-slate-500 font-medium leading-relaxed bg-white p-2 rounded border border-slate-100/50">{auth.details}</p>
                            
                            {auth.status === 'Submitted' && (
                              <button
                                onClick={() => handleApproveAuth(auth.id)}
                                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 transition block mt-1"
                              >
                                Trigger Sim Payer Approval
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Insurance Card OCR Simulator */}
                {currentRole !== 'Patient' && (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div>
                      <h3 className="text-md font-bold text-slate-900 font-sans">Insurance Card Scanner</h3>
                      <p className="text-xs text-slate-500">Scan and extract details from client insurance cards instantly via OCR.</p>
                    </div>

                    {isScanning ? (
                      <div className="border-2 border-dashed border-cyan-200 rounded-xl bg-cyan-50/10 p-6 flex flex-col items-center justify-center relative overflow-hidden h-36">
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 shadow-md shadow-cyan-400 animate-bounce w-full"></div>
                        <div className="flex flex-col items-center gap-3 w-full">
                          <Activity className="h-6 w-6 animate-pulse text-cyan-600" />
                          <span className="text-xs font-semibold text-cyan-800">{scanMessage}</span>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-1.5 transition-all duration-300" style={{ width: `${scanProgress}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          onClick={() => handleScanSimulation('front')}
                          className="border border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition cursor-pointer text-slate-600 gap-1.5"
                        >
                          <UploadCloud className="h-5 w-5 text-slate-400" />
                          <span className="text-xs font-bold">Scan Card Front</span>
                          <span className="text-[10px] text-slate-400">Extracts Payer & Member ID</span>
                        </button>
                        <button
                          onClick={() => handleScanSimulation('back')}
                          className="border border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition cursor-pointer text-slate-600 gap-1.5"
                        >
                          <UploadCloud className="h-5 w-5 text-slate-400" />
                          <span className="text-xs font-bold">Scan Card Back</span>
                          <span className="text-[10px] text-slate-400">Extracts Phone & Address</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Right Grid Section */}
              <div className="space-y-6">

                {/* AI Denial Prevention Audit System */}
                {selectedPatient.insuranceStatus !== 'Missing' && (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-5 w-5 text-cyan-600" />
                        <h3 className="text-md font-bold text-slate-900">AI Denial Prevention Audit</h3>
                      </div>
                      <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-black uppercase ${
                        selectedPatient.insuranceStatus === 'Verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {selectedPatient.insuranceStatus === 'Verified' ? 'Low Risk (98%)' : 'High Rejection Risk'}
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100/50">
                        <span className="text-slate-600 font-medium">1. Patient & Subscriber matching</span>
                        <span className="text-emerald-600 font-bold flex items-center gap-1">✓ Match</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100/50">
                        <span className="text-slate-600 font-medium">2. Insurance eligibility date</span>
                        <span className={`font-bold flex items-center gap-1 ${
                          selectedPatient.insuranceStatus === 'Verified' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'
                        }`}>
                          {selectedPatient.insuranceStatus === 'Verified' ? '✓ Active Plan' : '❌ Verification Failed'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100/50">
                        <span className="text-slate-600 font-medium">3. Prior Authorization compliance</span>
                        <span className={`font-bold flex items-center gap-1 ${
                          selectedPatient.insuranceStatus === 'Verified' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {selectedPatient.insuranceStatus === 'Verified' ? '✓ None Required (PPO)' : '❌ Missing Auth'}
                        </span>
                      </div>
                    </div>

                    {selectedPatient.insuranceStatus === 'Issues' && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-800 space-y-1.5">
                        <span className="font-bold flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> Resolution Action Required:</span>
                        <p className="leading-relaxed">
                          Payer gate reported rejection index **CIG-AUTH-403**. You must upload the doctor referral signature details before submitting crown or implant codes.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* AI Coverage Summary */}
                {selectedPatient.verificationRequests[0]?.results[0] && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/20 p-6 shadow-sm space-y-3">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="h-5 w-5 text-emerald-600" />
                      <h3 className="text-md font-bold text-emerald-800">AI Decoded Coverage Summary</h3>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-emerald-100/40 text-sm text-slate-700 leading-relaxed relative overflow-hidden font-sans">
                      <p>{selectedPatient.verificationRequests[0].results[0].summaryNotes}</p>
                      
                      {selectedPatient.verificationRequests[0].results[0].missingInfo && (
                        <div className="mt-3 flex items-start gap-1.5 text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          <span><strong>Warnings:</strong> {selectedPatient.verificationRequests[0].results[0].missingInfo}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 italic block">
                      Disclaimer: AI generated analysis for internal reference. Do not provide as official legal or financial coverage guarantee.
                    </span>
                  </div>
                )}

                {/* AI Pre-Treatment Billing Cost Estimator */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-cyan-600" />
                    <h3 className="text-md font-bold text-slate-900 font-sans">AI Pre-Treatment Cost Estimator</h3>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 block">Select Treatment Code</label>
                    <select
                      value={selectedTreatment}
                      onChange={handleTreatmentChange}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none bg-white transition focus:border-cyan-500"
                    >
                      {treatments.map((treat) => (
                        <option key={treat.code} value={treat.code}>
                          {treat.code} - {treat.name} (${treat.charge})
                        </option>
                      ))}
                    </select>
                  </div>

                  {estimationResult && (
                    <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-sm space-y-3 font-sans">
                      <div className="flex justify-between items-center text-slate-500">
                        <span>Total Charge:</span>
                        <span className="font-semibold text-slate-800">${estimationResult.totalCost.toFixed(2)}</span>
                      </div>
                      
                      {selectedPatient.insuranceStatus === 'Verified' ? (
                        <>
                          <div className="flex justify-between items-center text-slate-500">
                            <span>Estimated Insurance Pays ({estimationResult.coveragePct}%):</span>
                            <span className="font-semibold text-emerald-600">${estimationResult.insPays.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-slate-200/60 pt-2.5 text-md font-bold text-slate-900">
                            <span>Estimated Patient Pays:</span>
                            <span className="text-cyan-700 font-extrabold">${estimationResult.patPays.toFixed(2)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                          <span>Insurance not verified. Estimating at 100% patient responsibility. Verify insurance to apply benefits.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Patient Claims & Claim Readiness Checker */}
                {currentRole !== 'Patient' && (
                  <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-md font-bold text-slate-900 font-sans">Claims Readiness & Operations</h3>
                      <span className="text-xs text-slate-400 font-semibold">{selectedPatient.claims.length} Claims</span>
                    </div>

                    <div className="space-y-3.5 max-h-56 overflow-y-auto">
                      {selectedPatient.claims.length === 0 ? (
                        <p className="text-xs text-slate-400 italic text-center py-4">No claims recorded for this patient.</p>
                      ) : (
                        selectedPatient.claims.map((claim) => (
                          <div key={claim.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3.5">
                            <div className="flex justify-between items-start text-xs">
                              <div>
                                <span className="font-bold text-slate-800">{claim.treatmentCode} - {claim.treatmentDesc}</span>
                                <span className="block text-[10px] text-slate-400">Total Charge: ${claim.totalCharge.toFixed(2)}</span>
                              </div>
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                claim.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                claim.status === 'Submitted' ? 'bg-cyan-50 text-cyan-700 border border-cyan-100' :
                                claim.status === 'Denied' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>{claim.status}</span>
                            </div>

                            <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100">
                              <span className="flex items-center gap-1.5 text-slate-500">
                                AI Risk Check: 
                                <span className={`font-bold uppercase ${
                                  claim.riskScore === 'Low' ? 'text-emerald-600' :
                                  claim.riskScore === 'Medium' ? 'text-amber-600' : 'text-rose-600'
                                }`}>
                                  {claim.riskScore === 'Low' ? '98% Scrub' :
                                   claim.riskScore === 'Medium' ? '76% Audit' : '35% Failed'}
                                </span>
                              </span>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => auditClaim(claim.id)}
                                  disabled={isActionLoading}
                                  className="text-[10px] font-bold text-cyan-600 hover:text-cyan-800 transition"
                                >
                                  Scrub Code
                                </button>
                                {claim.status === 'Draft' && (
                                  <button
                                    onClick={() => submitClaim(claim.id)}
                                    disabled={isActionLoading || claim.riskScore === 'High'}
                                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 disabled:opacity-50 transition"
                                  >
                                    Submit
                                  </button>
                                )}
                              </div>
                            </div>

                            {claim.missingCodes && (
                              <div className="text-[10px] text-rose-700 bg-rose-50 p-2 rounded border border-rose-100 leading-normal">
                                <strong>Scrub Failures:</strong> {claim.missingCodes}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <form onSubmit={handleCreateClaim} className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row gap-2">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="e.g. D1110"
                          value={claimCode}
                          onChange={(e) => setClaimCode(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none bg-white transition focus:border-cyan-500"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Description"
                          value={claimDesc}
                          onChange={(e) => setClaimDesc(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none bg-white transition focus:border-cyan-500"
                        />
                      </div>
                      <div className="w-full sm:w-20">
                        <input
                          type="number"
                          placeholder="$"
                          value={claimCharge}
                          onChange={(e) => setClaimCharge(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none bg-white transition focus:border-cyan-500"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isActionLoading}
                        className="inline-flex items-center justify-center rounded-lg bg-cyan-600 px-3 py-1.5 sm:py-0 text-xs font-bold text-white shadow hover:bg-cyan-700 transition w-full sm:w-auto"
                      >
                        Scrub Draft
                      </button>
                    </form>
                  </div>
                )}

              </div>

            </div>
          </>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            No patient selected. Please select a patient from the left column or create a new one.
          </div>
        )}
      </div>

      {/* MODAL DIALOG: Add Patient */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-100 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 font-sans">Add New Patient Profile</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPatientSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={newDob}
                    onChange={(e) => setNewDob(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="555-123-4567"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h3 className="font-semibold text-slate-800 font-sans">Insurance Payer Details (Optional)</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Payer Provider</label>
                    <input
                      type="text"
                      value={newProvider}
                      onChange={(e) => setNewProvider(e.target.value)}
                      placeholder="e.g. Blue Cross"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Member ID</label>
                    <input
                      type="text"
                      value={newMemberId}
                      onChange={(e) => setNewMemberId(e.target.value)}
                      placeholder="Member ID"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1">Group number</label>
                    <input
                      type="text"
                      value={newGroupNumber}
                      onChange={(e) => setNewGroupNumber(e.target.value)}
                      placeholder="Group #"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="rounded-lg bg-cyan-600 px-4 py-2 font-bold text-white shadow hover:bg-cyan-700 transition"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DIALOG: Prior Authorization Request */}
      {isPriorAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 font-sans">Request Prior Authorization</h3>
              <button 
                onClick={() => setIsPriorAuthOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePriorAuth} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Procedure Code</label>
                  <input
                    type="text"
                    required
                    value={newAuthCode}
                    onChange={(e) => setNewAuthCode(e.target.value)}
                    placeholder="e.g. D6010"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Procedure Title</label>
                  <input
                    type="text"
                    required
                    value={newAuthDesc}
                    onChange={(e) => setNewAuthDesc(e.target.value)}
                    placeholder="e.g. Implant Placement"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Clinical necessity notes</label>
                <textarea
                  value={newAuthDetails}
                  onChange={(e) => setNewAuthDetails(e.target.value)}
                  placeholder="Attach diagnosis codes, xray references, etc."
                  className="w-full h-20 rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-cyan-500 transition resize-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPriorAuthOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cyan-600 px-4 py-2 font-bold text-white shadow hover:bg-cyan-700 transition"
                >
                  Request Authorization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function Patients() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Loading patients directory...</p>
        </div>
      </div>
    }>
      <PatientsContent />
    </Suspense>
  );
}
