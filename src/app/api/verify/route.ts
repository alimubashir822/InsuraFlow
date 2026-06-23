import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { v4Polyfill as uuid } from '@/lib/uuid';

// Helper to delay execution to mock network/API latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, userName, userId } = body;

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    const store = getStore();

    // 1. Fetch patient
    const patientIndex = store.patients.findIndex((p) => p.id === patientId);
    if (patientIndex === -1) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const patient = store.patients[patientIndex];

    if (!patient.insuranceProvider || !patient.memberId) {
      return NextResponse.json(
        { error: 'Patient is missing insurance details (Provider and Member ID are required)' },
        { status: 400 }
      );
    }

    // 2. Create Verification Request with Pending status
    const verificationRequestId = uuid();
    const verificationRequest = {
      id: verificationRequestId,
      patientId: patient.id,
      status: 'Pending',
      requestedBy: userName || 'Billing System',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.verificationRequests.push(verificationRequest);

    // Update patient status to Pending
    store.patients[patientIndex] = { ...patient, insuranceStatus: 'Pending' };

    // 3. Wait for 1.5 seconds to simulate API/OCR/AI processing latency
    await delay(1500);

    // 4. Evaluate eligibility logic based on Member ID
    const isInvalid =
      patient.memberId.toUpperCase().includes('INVALID') ||
      patient.memberId.length < 5;

    let updatedStatus = 'Verified';
    let requestStatus = 'Completed';
    let coverageStatus = 'Active';
    let summaryNotes = '';
    let planName = 'Premium PPO';
    let dentalCleaningPct = 100;
    let xrayPct = 80;
    let deductible = 500.0;
    let deductibleMet = 350.0;
    let copay = 20.0;
    let coinsurance = 10.0;
    let estimatedPatientCost = 75.0;
    let missingInfo: string | null = null;

    if (isInvalid) {
      updatedStatus = 'Issues';
      requestStatus = 'Failed';
      coverageStatus = 'Inactive';
      planName = 'Basic Care Plan';
      dentalCleaningPct = 0;
      xrayPct = 0;
      deductible = 0.0;
      deductibleMet = 0.0;
      copay = 0.0;
      coinsurance = 0.0;
      estimatedPatientCost = 0.0;
      missingInfo = 'Payer Gateway Error: Invalid Member ID. Diagnosis code D11.0 missing primary approval.';
      summaryNotes = `AI Verification Alert: The verification request for ${patient.insuranceProvider} failed. The member identifier "${patient.memberId}" was not found in the insurance payer directory. Please review spelling, verify active status directly with provider at ${patient.insuranceProvider === 'Blue Cross Blue Shield' ? '800-521-9874' : '800-872-3862'}, or obtain a physical copy of the insurance card.`;
    } else {
      // Customize based on provider name
      const providerLower = patient.insuranceProvider.toLowerCase();
      if (providerLower.includes('aetna')) {
        planName = 'Aetna Select Gold';
        copay = 25.0;
        coinsurance = 15.0;
        deductible = 750.0;
        deductibleMet = 200.0;
        estimatedPatientCost = 120.0;
        summaryNotes = `AI Coverage Analysis: Patient has active ${planName} coverage. Preventive Care (Cleaning, exams) is covered at 100% (No copay required). Restorative services (X-Rays, fillings) are covered at 85% with a 15% coinsurance after meeting the remaining deductible. Total deductible is $750, of which $200 has been met ($550 remaining). Specialist office visits require a referral from their primary care provider (PCP).`;
      } else if (providerLower.includes('cigna')) {
        planName = 'Cigna DPPO Advantage';
        copay = 10.0;
        coinsurance = 20.0;
        deductible = 250.0;
        deductibleMet = 250.0;
        estimatedPatientCost = 45.0;
        summaryNotes = `AI Coverage Analysis: Patient has active ${planName} coverage. Preventive care is covered at 100%. Major treatments are covered at 80% with a 20% coinsurance. Deductible of $250 has been fully MET for the calendar year. Estimated out-of-pocket responsibility for basic diagnostic exams is $45. Specialist visits do not require a pre-authorization.`;
      } else if (providerLower.includes('united') || providerLower.includes('uhc')) {
        planName = 'UHC Choice Plus';
        copay = 35.0;
        coinsurance = 20.0;
        deductible = 1000.0;
        deductibleMet = 600.0;
        estimatedPatientCost = 180.0;
        summaryNotes = `AI Coverage Analysis: Patient has active ${planName} coverage. Preventive care is covered at 100%. Special treatments are covered at 80% with a 20% coinsurance. Deductible is $1000, of which $600 has been met. Specialist visits require a written referral. Pre-authorization is required for high-cost surgical procedures.`;
      } else {
        // Default Blue Cross
        summaryNotes = `AI Coverage Analysis: Patient has active Premium PPO coverage. Preventive Care (like cleanings and routine checkups) is fully covered at 100% with no patient copay. Diagnostic radiology (X-Rays) is covered at 80% after meeting the deductible. Deductible is $500, with $350 already met ($150 remaining). Estimated out-of-pocket cost for standard procedure is $75.`;
      }
    }

    // 5. Update patient status
    store.patients[patientIndex] = { ...store.patients[patientIndex], insuranceStatus: updatedStatus };

    // 6. Update Verification Request
    const vReqIndex = store.verificationRequests.findIndex((v) => v.id === verificationRequestId);
    if (vReqIndex !== -1) {
      store.verificationRequests[vReqIndex] = {
        ...store.verificationRequests[vReqIndex],
        status: requestStatus,
        updatedAt: new Date().toISOString(),
      };
    }

    // 7. Create Eligibility Result
    const eligibilityResult = {
      id: uuid(),
      requestId: verificationRequestId,
      coverageStatus,
      planName,
      summaryNotes,
      dentalCleaningPct,
      xrayPct,
      estimatedPatientCost,
      missingInfo,
      createdAt: new Date().toISOString(),
    };

    store.eligibilityResults.push(eligibilityResult);

    // 8. Create Insurance Plan if successful
    if (coverageStatus === 'Active') {
      // Delete old plans for clean state
      store.insurancePlans = store.insurancePlans.filter((p) => p.patientId !== patient.id);

      store.insurancePlans.push({
        id: uuid(),
        patientId: patient.id,
        planName,
        providerName: patient.insuranceProvider,
        effectiveDate: '2026-01-01T00:00:00.000Z',
        preventiveCare: dentalCleaningPct > 0,
        specialistReq: planName.includes('HMO') || planName.includes('Select') || planName.includes('Choice Plus'),
        deductible,
        deductibleMet,
        copay,
        coinsurance,
      });
    }

    // 9. Log Audit Event
    store.auditLogs.push({
      id: uuid(),
      userId: userId || null,
      userName: userName || 'AI Assistant',
      action: 'Verify Insurance',
      details: isInvalid
        ? `Attempted verification for ${patient.name} (${patient.insuranceProvider}). Failed: Invalid Member ID.`
        : `Verified active insurance eligibility for ${patient.name} (${patient.insuranceProvider} - ${planName}).`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: !isInvalid,
      request: {
        ...verificationRequest,
        status: requestStatus,
      },
      result: eligibilityResult,
    });
  } catch (error: any) {
    console.error('Error running verification:', error);
    return NextResponse.json(
      { error: 'Failed to process verification', details: error.message },
      { status: 500 }
    );
  }
}
