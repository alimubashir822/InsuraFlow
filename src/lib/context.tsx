'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define Types based on schema
export interface InsurancePlan {
  id: string;
  patientId: string;
  planName: string;
  providerName: string;
  effectiveDate: string;
  preventiveCare: boolean;
  specialistReq: boolean;
  deductible: number;
  deductibleMet: number;
  copay: number;
  coinsurance: number;
}

export interface EligibilityResult {
  id: string;
  requestId: string;
  coverageStatus: string;
  planName: string;
  summaryNotes: string;
  dentalCleaningPct: number;
  xrayPct: number;
  estimatedPatientCost: number;
  missingInfo: string | null;
  createdAt: string;
}

export interface VerificationRequest {
  id: string;
  patientId: string;
  status: string;
  requestedBy: string;
  createdAt: string;
  updatedAt: string;
  results: EligibilityResult[];
}

export interface Authorization {
  id: string;
  patientId: string;
  procedureCode: string;
  procedureDesc: string;
  status: string; // Submitted, InReview, Approved, Denied
  submittedDate: string;
  updatedAt: string;
  authCode: string | null;
  details: string | null;
}

export interface Claim {
  id: string;
  patientId: string;
  treatmentCode: string;
  treatmentDesc: string;
  totalCharge: number;
  insurancePaid: number;
  patientPaid: number;
  status: string;
  riskScore: string;
  missingCodes: string | null;
  createdAt: string;
}

export interface Payment {
  id: string;
  patientId: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
}

export interface Document {
  id: string;
  patientId: string;
  name: string;
  fileUrl: string;
  docType: string;
  createdAt: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  actions: string; // comma-separated
  active: boolean;
  createdAt: string;
}

export interface AIInsight {
  id: string;
  patientId: string | null;
  type: string; // Leakage, DenialRisk, Expiration
  potentialRevenue: number;
  description: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  dob: string;
  email: string | null;
  phone: string | null;
  clinicId: string;
  insuranceProvider: string | null;
  memberId: string | null;
  groupNumber: string | null;
  insuranceStatus: string; // Missing, Pending, Verified, Issues
  insurancePlans: InsurancePlan[];
  verificationRequests: VerificationRequest[];
  authorizations: Authorization[];
  claims: Claim[];
  payments: Payment[];
  documents: Document[];
  aiInsights: AIInsight[];
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  clinicId: string | null;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  organizationId: string | null;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  payerId: string;
  phone: string | null;
  portalUrl: string | null;
}

export interface Organization {
  id: string;
  name: string;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

interface AppContextType {
  organizations: Organization[];
  clinics: Clinic[];
  users: User[];
  providers: InsuranceProvider[];
  patients: Patient[];
  auditLogs: AuditLog[];
  automationRules: AutomationRule[];
  aiInsights: AIInsight[];
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
  currentRole: string;
  currentUser: User | null;
  switchRole: (role: string) => void;
  refreshData: () => Promise<void>;
  addPatient: (data: { name: string; dob: string; email?: string; phone?: string; insuranceProvider?: string; memberId?: string; groupNumber?: string }) => Promise<any>;
  verifyInsurance: (patientId: string) => Promise<any>;
  scanCard: (patientId: string, fileName: string) => Promise<any>;
  createClaim: (data: { patientId: string; treatmentCode: string; treatmentDesc: string; totalCharge: number }) => Promise<any>;
  auditClaim: (claimId: string) => Promise<any>;
  submitClaim: (claimId: string) => Promise<any>;
  settleClaim: (claimId: string, action: 'approve' | 'deny') => Promise<any>;
  createAuthorization: (data: { patientId: string; procedureCode: string; procedureDesc: string; details?: string }) => Promise<any>;
  updateAuthorization: (data: { authId: string; action: 'approve' | 'deny'; authCode?: string; details?: string }) => Promise<any>;
  toggleAutomationRule: (ruleId: string, active: boolean) => Promise<any>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<InsuranceProvider[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock roles/user switching state
  const [currentRole, setCurrentRole] = useState<string>('Admin');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const refreshData = async () => {
    try {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      
      setOrganizations(data.organizations || []);
      setClinics(data.clinics || []);
      setUsers(data.users || []);
      setProviders(data.providers || []);
      setPatients(data.patients || []);
      setAuditLogs(data.auditLogs || []);
      setAutomationRules(data.automationRules || []);
      setAiInsights(data.aiInsights || []);
      
      // Update logged in user matching role
      if (data.users && data.users.length > 0) {
        const matchedUser = data.users.find((u: User) => u.role === currentRole);
        if (matchedUser) {
          setCurrentUser(matchedUser);
        } else {
          // Fallback user shape if none matches
          setCurrentUser({
            id: 'mock-user-id',
            name: `${currentRole} User`,
            email: `${currentRole.toLowerCase()}@apexhealth.com`,
            role: currentRole,
            clinicId: data.clinics?.[0]?.id || null,
          });
        }
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load app state');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [currentRole]);

  const switchRole = (role: string) => {
    setCurrentRole(role);
  };

  const addPatient = async (data: any) => {
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userName: currentUser?.name || 'Front Desk',
          userId: currentUser?.id || null,
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to add patient');
      await refreshData();
      return resData;
    } finally {
      setIsActionLoading(false);
    }
  };

  const verifyInsurance = async (patientId: string) => {
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          userName: currentUser?.name || 'Eligibility Engine',
          userId: currentUser?.id || null,
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to verify insurance');
      await refreshData();
      return resData;
    } finally {
      setIsActionLoading(false);
    }
  };

  const scanCard = async (patientId: string, fileName: string) => {
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId,
          fileName,
          userName: currentUser?.name || 'Card Scanner',
          userId: currentUser?.id || null,
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to scan card');
      await refreshData();
      return resData;
    } finally {
      setIsActionLoading(false);
    }
  };

  const createClaim = async (data: any) => {
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userName: currentUser?.name || 'Billing Team',
          userId: currentUser?.id || null,
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to create claim');
      await refreshData();
      return resData;
    } finally {
      setIsActionLoading(false);
    }
  };

  const auditClaim = async (claimId: string) => {
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/claims', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId,
          action: 'check_readiness',
          userName: currentUser?.name || 'AI Auditor',
          userId: currentUser?.id || null,
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to audit claim');
      await refreshData();
      return resData;
    } finally {
      setIsActionLoading(false);
    }
  };

  const submitClaim = async (claimId: string) => {
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/claims', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId,
          action: 'submit',
          userName: currentUser?.name || 'Billing Manager',
          userId: currentUser?.id || null,
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to submit claim');
      await refreshData();
      return resData;
    } finally {
      setIsActionLoading(false);
    }
  };

  const settleClaim = async (claimId: string, action: 'approve' | 'deny') => {
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/claims', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId,
          action,
          userName: currentUser?.name || 'Insurer Gate',
          userId: currentUser?.id || null,
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to settle claim');
      await refreshData();
      return resData;
    } finally {
      setIsActionLoading(false);
    }
  };

  const createAuthorization = async (data: any) => {
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/authorizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userName: currentUser?.name || 'Billing Manager',
          userId: currentUser?.id || null,
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to create prior auth');
      await refreshData();
      return resData;
    } finally {
      setIsActionLoading(false);
    }
  };

  const updateAuthorization = async (data: any) => {
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/authorizations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          userName: currentUser?.name || 'Insurer Gate',
          userId: currentUser?.id || null,
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to update prior auth');
      await refreshData();
      return resData;
    } finally {
      setIsActionLoading(false);
    }
  };

  const toggleAutomationRule = async (ruleId: string, active: boolean) => {
    setIsActionLoading(true);
    try {
      const res = await fetch('/api/automations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ruleId,
          active,
          userName: currentUser?.name || 'Admin',
          userId: currentUser?.id || null,
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to update automation rule');
      await refreshData();
      return resData;
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        organizations,
        clinics,
        users,
        providers,
        patients,
        auditLogs,
        automationRules,
        aiInsights,
        isLoading,
        isActionLoading,
        error,
        currentRole,
        currentUser,
        switchRole,
        refreshData,
        addPatient,
        verifyInsurance,
        scanCard,
        createClaim,
        auditClaim,
        submitClaim,
        settleClaim,
        createAuthorization,
        updateAuthorization,
        toggleAutomationRule,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
