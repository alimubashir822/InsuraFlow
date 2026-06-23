const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.auditLog.deleteMany({});
  await prisma.aIInsight.deleteMany({});
  await prisma.automationRule.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.claim.deleteMany({});
  await prisma.authorization.deleteMany({});
  await prisma.eligibilityResult.deleteMany({});
  await prisma.verificationRequest.deleteMany({});
  await prisma.insurancePlan.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.clinic.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.insuranceProvider.deleteMany({});

  console.log('Seeding InsuraFlow AI Revenue Cycle database...');

  // 1. Create Insurance Providers
  const bcbs = await prisma.insuranceProvider.create({
    data: {
      name: 'Blue Cross Blue Shield',
      payerId: 'BCBS001',
      phone: '800-521-9874',
      portalUrl: 'https://bcbs-provider.com',
    },
  });

  const aetna = await prisma.insuranceProvider.create({
    data: {
      name: 'Aetna Health',
      payerId: 'AET002',
      phone: '800-872-3862',
      portalUrl: 'https://aetna-provider.com',
    },
  });

  const cigna = await prisma.insuranceProvider.create({
    data: {
      name: 'Cigna Dental',
      payerId: 'CIG303',
      phone: '800-244-6224',
      portalUrl: 'https://cigna-dental.com',
    },
  });

  const uhc = await prisma.insuranceProvider.create({
    data: {
      name: 'UnitedHealthcare',
      payerId: 'UHC404',
      phone: '877-842-3210',
      portalUrl: 'https://uhcprovider.com',
    },
  });

  // 2. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'Apex Health Network',
    },
  });

  // 3. Create Clinic
  const clinic = await prisma.clinic.create({
    data: {
      name: 'Apex Health Group',
      address: '742 Evergreen Terrace, Springfield',
      organizationId: org.id,
    },
  });

  // 4. Create Users (Roles: Admin, BillingManager, FrontDesk, Doctor, Patient)
  const userAdmin = await prisma.user.create({
    data: {
      name: 'Alexandra Vance',
      email: 'alexandra@apexhealth.com',
      role: 'Admin',
      clinicId: clinic.id,
    },
  });

  const userBilling = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah@apexhealth.com',
      role: 'BillingManager',
      clinicId: clinic.id,
    },
  });

  const userFrontDesk = await prisma.user.create({
    data: {
      name: 'Michael Chen',
      email: 'michael@apexhealth.com',
      role: 'FrontDesk',
      clinicId: clinic.id,
    },
  });

  const userDoctor = await prisma.user.create({
    data: {
      name: 'Dr. Elizabeth Blackwell',
      email: 'elizabeth@apexhealth.com',
      role: 'Doctor',
      clinicId: clinic.id,
    },
  });

  // 5. Create Patients
  // Patient 1: John Smith (Verified PPO)
  const patientJohn = await prisma.patient.create({
    data: {
      name: 'John Smith',
      dob: new Date('1984-05-15'),
      email: 'john.smith@gmail.com',
      phone: '555-019-2834',
      clinicId: clinic.id,
      insuranceProvider: 'Blue Cross Blue Shield',
      memberId: 'BCB987654321',
      groupNumber: 'GRP98234',
      insuranceStatus: 'Verified',
    },
  });

  // Patient 2: Mary Watson (Pending verification)
  const patientMary = await prisma.patient.create({
    data: {
      name: 'Mary Watson',
      dob: new Date('1991-08-22'),
      email: 'mary.watson@yahoo.com',
      phone: '555-014-9988',
      clinicId: clinic.id,
      insuranceProvider: 'Aetna Health',
      memberId: 'AET123456789',
      groupNumber: 'GRP12345',
      insuranceStatus: 'Pending',
    },
  });

  // Patient 3: Robert Downey (Issues)
  const patientRobert = await prisma.patient.create({
    data: {
      name: 'Robert Downey',
      dob: new Date('1965-04-04'),
      email: 'robert.downey@outlook.com',
      phone: '555-012-3456',
      clinicId: clinic.id,
      insuranceProvider: 'Cigna Dental',
      memberId: 'CIGINVALID00',
      groupNumber: 'GRP007',
      insuranceStatus: 'Issues',
    },
  });

  // Patient 4: Emily Watson (Missing insurance details)
  const patientEmily = await prisma.patient.create({
    data: {
      name: 'Emily Watson',
      dob: new Date('1998-11-30'),
      email: 'emily.w@gmail.com',
      phone: '555-015-1212',
      clinicId: clinic.id,
      insuranceStatus: 'Missing',
    },
  });

  // Patient 5: David Miller (Verified)
  const patientDavid = await prisma.patient.create({
    data: {
      name: 'David Miller',
      dob: new Date('1972-12-01'),
      email: 'david.miller@gmail.com',
      phone: '555-017-8899',
      clinicId: clinic.id,
      insuranceProvider: 'UnitedHealthcare',
      memberId: 'UHC887766554',
      groupNumber: 'GRPUHC99',
      insuranceStatus: 'Verified',
    },
  });

  // 6. Create Insurance Plans
  await prisma.insurancePlan.create({
    data: {
      patientId: patientJohn.id,
      planName: 'Premium PPO',
      providerName: 'Blue Cross Blue Shield',
      effectiveDate: new Date('2025-01-01'),
      preventiveCare: true,
      specialistReq: false,
      deductible: 500.0,
      deductibleMet: 350.0,
      copay: 20.0,
      coinsurance: 10.0,
    },
  });

  await prisma.insurancePlan.create({
    data: {
      patientId: patientDavid.id,
      planName: 'Choice HMO',
      providerName: 'UnitedHealthcare',
      effectiveDate: new Date('2025-06-01'),
      preventiveCare: true,
      specialistReq: true,
      deductible: 1000.0,
      deductibleMet: 1000.0,
      copay: 35.0,
      coinsurance: 20.0,
    },
  });

  // 7. Verification Requests & Eligibility Results
  const reqJohn = await prisma.verificationRequest.create({
    data: {
      patientId: patientJohn.id,
      status: 'Completed',
      requestedBy: 'Michael Chen',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  });

  await prisma.eligibilityResult.create({
    data: {
      requestId: reqJohn.id,
      coverageStatus: 'Active',
      planName: 'Premium PPO',
      summaryNotes: 'Patient has active Premium PPO coverage. Preventive care covered at 100%. Diagnostic services covered at 80% after deductible. Deductible is $500, with $350 met. Coinsurance is 10%. Specialist visits do not require a referral.',
      dentalCleaningPct: 100,
      xrayPct: 80,
      estimatedPatientCost: 50.0,
    },
  });

  await prisma.verificationRequest.create({
    data: {
      patientId: patientMary.id,
      status: 'Pending',
      requestedBy: 'Michael Chen',
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
    },
  });

  const reqRobert = await prisma.verificationRequest.create({
    data: {
      patientId: patientRobert.id,
      status: 'Failed',
      requestedBy: 'Sarah Jenkins',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  });

  await prisma.eligibilityResult.create({
    data: {
      requestId: reqRobert.id,
      coverageStatus: 'Inactive',
      planName: 'Unknown Plan',
      summaryNotes: 'Verification failed. Member ID CIGINVALID00 was not recognized by the payer gateway. Please check card spelling and resubmit.',
      dentalCleaningPct: 0,
      xrayPct: 0,
      estimatedPatientCost: 0.0,
      missingInfo: 'Member ID is invalid. Missing primary subscriber signature indicator.',
    },
  });

  // 8. Seeding Prior Authorizations
  await prisma.authorization.create({
    data: {
      patientId: patientJohn.id,
      procedureCode: 'MRI',
      procedureDesc: 'Magnetic Resonance Imaging (MRI) - Brain Scans',
      status: 'Approved',
      authCode: 'AUTH-MRI-9988',
      details: 'Prior Authorization approved under Blue Cross Clinical Guidelines. Expiration: Nov 2026.',
    },
  });

  await prisma.authorization.create({
    data: {
      patientId: patientRobert.id,
      procedureCode: 'D6010',
      procedureDesc: 'Surgical Placement of Implant Body (Dental Implant)',
      status: 'Submitted',
      details: 'Authorization request submitted to Cigna Dental gateway. Currently undergoing peer review.',
    },
  });

  await prisma.authorization.create({
    data: {
      patientId: patientDavid.id,
      procedureCode: 'D2750',
      procedureDesc: 'Crown - Porcelain Fused to High Noble Metal',
      status: 'Approved',
      authCode: 'AUTH-CRN-5544',
      details: 'Authorization approved under UHC Choice HMO referral protocol.',
    },
  });

  // 9. Claims
  await prisma.claim.create({
    data: {
      patientId: patientJohn.id,
      treatmentCode: 'D1110',
      treatmentDesc: 'Prophylaxis - Adult Cleaning',
      totalCharge: 150.0,
      insurancePaid: 150.0,
      patientPaid: 0.0,
      status: 'Paid',
      riskScore: 'Low',
    },
  });

  await prisma.claim.create({
    data: {
      patientId: patientRobert.id,
      treatmentCode: 'D2750',
      treatmentDesc: 'Crown - Porcelain Fused to High Noble Metal',
      totalCharge: 1200.0,
      insurancePaid: 0.0,
      patientPaid: 0.0,
      status: 'Denied',
      riskScore: 'High',
      missingCodes: 'Missing valid pre-authorization code, Missing diagnosis code',
    },
  });

  await prisma.claim.create({
    data: {
      patientId: patientDavid.id,
      treatmentCode: 'D6010',
      treatmentDesc: 'Surgical Placement of Implant Body',
      totalCharge: 2400.0,
      insurancePaid: 1500.0,
      patientPaid: 0.0,
      status: 'Reviewing',
      riskScore: 'Medium',
      missingCodes: 'Missing post-operative radiograph link',
    },
  });

  await prisma.claim.create({
    data: {
      patientId: patientJohn.id,
      treatmentCode: 'D0220',
      treatmentDesc: 'Intraoral - Periapical First Radiograph',
      totalCharge: 85.0,
      status: 'Draft',
      riskScore: 'Low',
    },
  });

  // 10. Payments
  await prisma.payment.create({
    data: {
      patientId: patientJohn.id,
      amount: 150.0,
      method: 'Insurance',
      status: 'Completed',
    },
  });

  // 11. Documents
  await prisma.document.create({
    data: {
      patientId: patientJohn.id,
      name: 'john_smith_bcbs_front.jpg',
      fileUrl: '/mock-documents/john_smith_bcbs_front.jpg',
      docType: 'InsuranceCardFront',
    },
  });

  // 12. Seeding Automation Rules (n8n node settings)
  await prisma.automationRule.create({
    data: {
      name: 'Missing Insurance Auto-Retrieve Drip',
      trigger: 'Patient Registered (Insurance Status: Missing)',
      condition: 'Patient has mobile or email details',
      actions: 'SMS secure uploader link, Wait 3 Days, Send reminder SMS, Notify receptionist',
      active: true,
    },
  });

  await prisma.automationRule.create({
    data: {
      name: 'Prior Authorization Denial Guard',
      trigger: 'Major Claim Drafted (Code: D6010 / D2750)',
      condition: 'Payer rules require prior authorization',
      actions: 'AI check clinical notes for auth codes, Block submission if missing, Create task for Billing Manager',
      active: true,
    },
  });

  await prisma.automationRule.create({
    data: {
      name: 'Pre-Visit Deductible Upfront Collector',
      trigger: 'Eligibility Checked (Status: Active)',
      condition: 'Remaining deductible > $0',
      actions: 'Generate patient responsibility estimate, Append desk flag to appointment',
      active: false,
    },
  });

  // 13. Seeding AI Insights (Revenue opportunities for owner)
  await prisma.aIInsight.create({
    data: {
      type: 'Leakage',
      potentialRevenue: 24500.0,
      description: 'Potential lost revenue detected due to unverified insurance policies on 12 tomorrow schedules.',
    },
  });

  await prisma.aIInsight.create({
    data: {
      type: 'Leakage',
      potentialRevenue: 17500.0,
      description: 'Leaked revenue opportunities due to expired plans on 3 active patients.',
    },
  });

  await prisma.aIInsight.create({
    data: {
      type: 'DenialRisk',
      potentialRevenue: 8400.0,
      description: 'High rejection risk found on 5 claims missing pre-authorization code links.',
    },
  });

  // 14. Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: userFrontDesk.id,
      userName: userFrontDesk.name,
      action: 'Add Patient',
      details: 'Added patient John Smith to clinic directory.',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: userFrontDesk.id,
      userName: userFrontDesk.name,
      action: 'Verify Insurance',
      details: 'Initiated insurance verification request for John Smith (Blue Cross Blue Shield).',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: userBilling.id,
      userName: userBilling.name,
      action: 'Review Coverage',
      details: 'Reviewed AI eligibility summary for John Smith. Deductible is $500, met $350.',
      timestamp: new Date(Date.now() - 1.8 * 60 * 60 * 1000),
    },
  });

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
