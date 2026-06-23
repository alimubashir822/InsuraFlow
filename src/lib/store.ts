// In-memory data store with embedded seed data
// This replaces SQLite/Prisma for Vercel deployment compatibility.
// Data resets on each cold start but all operations work within a session.

import { v4Polyfill } from './uuid';

const uuid = v4Polyfill;

// ─── Seed IDs (stable so cross-references work) ────────────────────────────

const ORG_ID = 'org-apex-001';
const CLINIC_ID = 'clinic-apex-001';

const USER_ADMIN_ID = 'user-admin-001';
const USER_BILLING_ID = 'user-billing-001';
const USER_FRONTDESK_ID = 'user-frontdesk-001';
const USER_DOCTOR_ID = 'user-doctor-001';

const PATIENT_JOHN_ID = 'patient-john-001';
const PATIENT_MARY_ID = 'patient-mary-001';
const PATIENT_ROBERT_ID = 'patient-robert-001';
const PATIENT_EMILY_ID = 'patient-emily-001';
const PATIENT_DAVID_ID = 'patient-david-001';

const VERIF_JOHN_ID = 'verif-john-001';
const VERIF_MARY_ID = 'verif-mary-001';
const VERIF_ROBERT_ID = 'verif-robert-001';

const AUTH_JOHN_ID = 'auth-john-001';
const AUTH_ROBERT_ID = 'auth-robert-001';
const AUTH_DAVID_ID = 'auth-david-001';

const CLAIM_1_ID = 'claim-001';
const CLAIM_2_ID = 'claim-002';
const CLAIM_3_ID = 'claim-003';
const CLAIM_4_ID = 'claim-004';

const PAYMENT_1_ID = 'payment-001';

// ─── Data Tables ────────────────────────────────────────────────────────────

export interface StoreData {
  organizations: any[];
  clinics: any[];
  users: any[];
  insuranceProviders: any[];
  patients: any[];
  insurancePlans: any[];
  verificationRequests: any[];
  eligibilityResults: any[];
  authorizations: any[];
  claims: any[];
  payments: any[];
  documents: any[];
  automationRules: any[];
  aiInsights: any[];
  auditLogs: any[];
}

function createSeedData(): StoreData {
  const now = new Date().toISOString();
  const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

  return {
    organizations: [
      { id: ORG_ID, name: 'Apex Health Network', createdAt: now },
    ],

    clinics: [
      { id: CLINIC_ID, name: 'Apex Health Group', address: '742 Evergreen Terrace, Springfield', organizationId: ORG_ID, createdAt: now },
    ],

    users: [
      { id: USER_ADMIN_ID, email: 'alexandra@apexhealth.com', name: 'Alexandra Vance', role: 'Admin', clinicId: CLINIC_ID, createdAt: now },
      { id: USER_BILLING_ID, email: 'sarah@apexhealth.com', name: 'Sarah Jenkins', role: 'BillingManager', clinicId: CLINIC_ID, createdAt: now },
      { id: USER_FRONTDESK_ID, email: 'michael@apexhealth.com', name: 'Michael Chen', role: 'FrontDesk', clinicId: CLINIC_ID, createdAt: now },
      { id: USER_DOCTOR_ID, email: 'elizabeth@apexhealth.com', name: 'Dr. Elizabeth Blackwell', role: 'Doctor', clinicId: CLINIC_ID, createdAt: now },
    ],

    insuranceProviders: [
      { id: 'ip-bcbs', name: 'Blue Cross Blue Shield', payerId: 'BCBS001', phone: '800-521-9874', portalUrl: 'https://bcbs-provider.com' },
      { id: 'ip-aetna', name: 'Aetna Health', payerId: 'AET002', phone: '800-872-3862', portalUrl: 'https://aetna-provider.com' },
      { id: 'ip-cigna', name: 'Cigna Dental', payerId: 'CIG303', phone: '800-244-6224', portalUrl: 'https://cigna-dental.com' },
      { id: 'ip-uhc', name: 'UnitedHealthcare', payerId: 'UHC404', phone: '877-842-3210', portalUrl: 'https://uhcprovider.com' },
    ],

    patients: [
      {
        id: PATIENT_JOHN_ID, name: 'John Smith', dob: '1984-05-15T00:00:00.000Z',
        email: 'john.smith@gmail.com', phone: '555-019-2834', clinicId: CLINIC_ID,
        insuranceProvider: 'Blue Cross Blue Shield', memberId: 'BCB987654321', groupNumber: 'GRP98234',
        insuranceStatus: 'Verified', createdAt: now,
      },
      {
        id: PATIENT_MARY_ID, name: 'Mary Watson', dob: '1991-08-22T00:00:00.000Z',
        email: 'mary.watson@yahoo.com', phone: '555-014-9988', clinicId: CLINIC_ID,
        insuranceProvider: 'Aetna Health', memberId: 'AET123456789', groupNumber: 'GRP12345',
        insuranceStatus: 'Pending', createdAt: now,
      },
      {
        id: PATIENT_ROBERT_ID, name: 'Robert Downey', dob: '1965-04-04T00:00:00.000Z',
        email: 'robert.downey@outlook.com', phone: '555-012-3456', clinicId: CLINIC_ID,
        insuranceProvider: 'Cigna Dental', memberId: 'CIGINVALID00', groupNumber: 'GRP007',
        insuranceStatus: 'Issues', createdAt: now,
      },
      {
        id: PATIENT_EMILY_ID, name: 'Emily Watson', dob: '1998-11-30T00:00:00.000Z',
        email: 'emily.w@gmail.com', phone: '555-015-1212', clinicId: CLINIC_ID,
        insuranceProvider: null, memberId: null, groupNumber: null,
        insuranceStatus: 'Missing', createdAt: now,
      },
      {
        id: PATIENT_DAVID_ID, name: 'David Miller', dob: '1972-12-01T00:00:00.000Z',
        email: 'david.miller@gmail.com', phone: '555-017-8899', clinicId: CLINIC_ID,
        insuranceProvider: 'UnitedHealthcare', memberId: 'UHC887766554', groupNumber: 'GRPUHC99',
        insuranceStatus: 'Verified', createdAt: now,
      },
    ],

    insurancePlans: [
      {
        id: 'plan-john-001', patientId: PATIENT_JOHN_ID, planName: 'Premium PPO',
        providerName: 'Blue Cross Blue Shield', effectiveDate: '2025-01-01T00:00:00.000Z',
        preventiveCare: true, specialistReq: false, deductible: 500.0,
        deductibleMet: 350.0, copay: 20.0, coinsurance: 10.0,
      },
      {
        id: 'plan-david-001', patientId: PATIENT_DAVID_ID, planName: 'Choice HMO',
        providerName: 'UnitedHealthcare', effectiveDate: '2025-06-01T00:00:00.000Z',
        preventiveCare: true, specialistReq: true, deductible: 1000.0,
        deductibleMet: 1000.0, copay: 35.0, coinsurance: 20.0,
      },
    ],

    verificationRequests: [
      { id: VERIF_JOHN_ID, patientId: PATIENT_JOHN_ID, status: 'Completed', requestedBy: 'Michael Chen', createdAt: hoursAgo(2), updatedAt: hoursAgo(2) },
      { id: VERIF_MARY_ID, patientId: PATIENT_MARY_ID, status: 'Pending', requestedBy: 'Michael Chen', createdAt: hoursAgo(0.5), updatedAt: hoursAgo(0.5) },
      { id: VERIF_ROBERT_ID, patientId: PATIENT_ROBERT_ID, status: 'Failed', requestedBy: 'Sarah Jenkins', createdAt: hoursAgo(24), updatedAt: hoursAgo(24) },
    ],

    eligibilityResults: [
      {
        id: 'elig-john-001', requestId: VERIF_JOHN_ID, coverageStatus: 'Active', planName: 'Premium PPO',
        summaryNotes: 'Patient has active Premium PPO coverage. Preventive care covered at 100%. Diagnostic services covered at 80% after deductible. Deductible is $500, with $350 met. Coinsurance is 10%. Specialist visits do not require a referral.',
        dentalCleaningPct: 100, xrayPct: 80, estimatedPatientCost: 50.0, missingInfo: null, createdAt: hoursAgo(2),
      },
      {
        id: 'elig-robert-001', requestId: VERIF_ROBERT_ID, coverageStatus: 'Inactive', planName: 'Unknown Plan',
        summaryNotes: 'Verification failed. Member ID CIGINVALID00 was not recognized by the payer gateway. Please check card spelling and resubmit.',
        dentalCleaningPct: 0, xrayPct: 0, estimatedPatientCost: 0.0,
        missingInfo: 'Member ID is invalid. Missing primary subscriber signature indicator.', createdAt: hoursAgo(24),
      },
    ],

    authorizations: [
      {
        id: AUTH_JOHN_ID, patientId: PATIENT_JOHN_ID, procedureCode: 'MRI',
        procedureDesc: 'Magnetic Resonance Imaging (MRI) - Brain Scans', status: 'Approved',
        submittedDate: now, updatedAt: now, authCode: 'AUTH-MRI-9988',
        details: 'Prior Authorization approved under Blue Cross Clinical Guidelines. Expiration: Nov 2026.',
      },
      {
        id: AUTH_ROBERT_ID, patientId: PATIENT_ROBERT_ID, procedureCode: 'D6010',
        procedureDesc: 'Surgical Placement of Implant Body (Dental Implant)', status: 'Submitted',
        submittedDate: now, updatedAt: now, authCode: null,
        details: 'Authorization request submitted to Cigna Dental gateway. Currently undergoing peer review.',
      },
      {
        id: AUTH_DAVID_ID, patientId: PATIENT_DAVID_ID, procedureCode: 'D2750',
        procedureDesc: 'Crown - Porcelain Fused to High Noble Metal', status: 'Approved',
        submittedDate: now, updatedAt: now, authCode: 'AUTH-CRN-5544',
        details: 'Authorization approved under UHC Choice HMO referral protocol.',
      },
    ],

    claims: [
      {
        id: CLAIM_1_ID, patientId: PATIENT_JOHN_ID, treatmentCode: 'D1110',
        treatmentDesc: 'Prophylaxis - Adult Cleaning', totalCharge: 150.0,
        insurancePaid: 150.0, patientPaid: 0.0, status: 'Paid',
        riskScore: 'Low', missingCodes: null, createdAt: now,
      },
      {
        id: CLAIM_2_ID, patientId: PATIENT_ROBERT_ID, treatmentCode: 'D2750',
        treatmentDesc: 'Crown - Porcelain Fused to High Noble Metal', totalCharge: 1200.0,
        insurancePaid: 0.0, patientPaid: 0.0, status: 'Denied',
        riskScore: 'High', missingCodes: 'Missing valid pre-authorization code, Missing diagnosis code',
        createdAt: now,
      },
      {
        id: CLAIM_3_ID, patientId: PATIENT_DAVID_ID, treatmentCode: 'D6010',
        treatmentDesc: 'Surgical Placement of Implant Body', totalCharge: 2400.0,
        insurancePaid: 1500.0, patientPaid: 0.0, status: 'Reviewing',
        riskScore: 'Medium', missingCodes: 'Missing post-operative radiograph link',
        createdAt: now,
      },
      {
        id: CLAIM_4_ID, patientId: PATIENT_JOHN_ID, treatmentCode: 'D0220',
        treatmentDesc: 'Intraoral - Periapical First Radiograph', totalCharge: 85.0,
        insurancePaid: 0.0, patientPaid: 0.0, status: 'Draft',
        riskScore: 'Low', missingCodes: null, createdAt: now,
      },
    ],

    payments: [
      { id: PAYMENT_1_ID, patientId: PATIENT_JOHN_ID, amount: 150.0, method: 'Insurance', status: 'Completed', createdAt: now },
    ],

    documents: [
      { id: 'doc-001', patientId: PATIENT_JOHN_ID, name: 'john_smith_bcbs_front.jpg', fileUrl: '/mock-documents/john_smith_bcbs_front.jpg', docType: 'InsuranceCardFront', createdAt: now },
    ],

    automationRules: [
      {
        id: 'rule-001', name: 'Missing Insurance Auto-Retrieve Drip',
        trigger: 'Patient Registered (Insurance Status: Missing)',
        condition: 'Patient has mobile or email details',
        actions: 'SMS secure uploader link, Wait 3 Days, Send reminder SMS, Notify receptionist',
        active: true, createdAt: now,
      },
      {
        id: 'rule-002', name: 'Prior Authorization Denial Guard',
        trigger: 'Major Claim Drafted (Code: D6010 / D2750)',
        condition: 'Payer rules require prior authorization',
        actions: 'AI check clinical notes for auth codes, Block submission if missing, Create task for Billing Manager',
        active: true, createdAt: now,
      },
      {
        id: 'rule-003', name: 'Pre-Visit Deductible Upfront Collector',
        trigger: 'Eligibility Checked (Status: Active)',
        condition: 'Remaining deductible > $0',
        actions: 'Generate patient responsibility estimate, Append desk flag to appointment',
        active: false, createdAt: now,
      },
    ],

    aiInsights: [
      { id: 'insight-001', patientId: null, type: 'Leakage', potentialRevenue: 24500.0, description: 'Potential lost revenue detected due to unverified insurance policies on 12 tomorrow schedules.', createdAt: now },
      { id: 'insight-002', patientId: null, type: 'Leakage', potentialRevenue: 17500.0, description: 'Leaked revenue opportunities due to expired plans on 3 active patients.', createdAt: now },
      { id: 'insight-003', patientId: null, type: 'DenialRisk', potentialRevenue: 8400.0, description: 'High rejection risk found on 5 claims missing pre-authorization code links.', createdAt: now },
    ],

    auditLogs: [
      { id: 'log-001', userId: USER_FRONTDESK_ID, userName: 'Michael Chen', action: 'Add Patient', details: 'Added patient John Smith to clinic directory.', timestamp: hoursAgo(3) },
      { id: 'log-002', userId: USER_FRONTDESK_ID, userName: 'Michael Chen', action: 'Verify Insurance', details: 'Initiated insurance verification request for John Smith (Blue Cross Blue Shield).', timestamp: hoursAgo(2) },
      { id: 'log-003', userId: USER_BILLING_ID, userName: 'Sarah Jenkins', action: 'Review Coverage', details: 'Reviewed AI eligibility summary for John Smith. Deductible is $500, met $350.', timestamp: hoursAgo(1.8) },
    ],
  };
}

// ─── Singleton store (persists for the lifetime of the serverless instance) ──

const globalStore = globalThis as unknown as { __insuraflowStore: StoreData };

export function getStore(): StoreData {
  if (!globalStore.__insuraflowStore) {
    globalStore.__insuraflowStore = createSeedData();
  }
  return globalStore.__insuraflowStore;
}

// ─── Helper: build patient with nested relations ────────────────────────────

export function getPatientWithRelations(store: StoreData, patientId: string) {
  const patient = store.patients.find((p) => p.id === patientId);
  if (!patient) return null;
  return buildPatientWithRelations(store, patient);
}

export function buildPatientWithRelations(store: StoreData, patient: any) {
  const verificationRequests = store.verificationRequests
    .filter((v) => v.patientId === patient.id)
    .map((v) => ({
      ...v,
      results: store.eligibilityResults.filter((e) => e.requestId === v.id),
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return {
    ...patient,
    insurancePlans: store.insurancePlans.filter((p) => p.patientId === patient.id),
    verificationRequests,
    authorizations: store.authorizations
      .filter((a) => a.patientId === patient.id)
      .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime()),
    claims: store.claims
      .filter((c) => c.patientId === patient.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    payments: store.payments
      .filter((p) => p.patientId === patient.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    documents: store.documents.filter((d) => d.patientId === patient.id),
    aiInsights: store.aiInsights.filter((i) => i.patientId === patient.id),
  };
}

export function getAllPatientsWithRelations(store: StoreData) {
  return store.patients
    .map((p) => buildPatientWithRelations(store, p))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
