import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to delay execution to mock network/API latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, userName, userId } = body;

    if (!patientId) {
      return NextResponse.json({ error: 'Patient ID is required' }, { status: 400 });
    }

    // 1. Fetch patient
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    if (!patient.insuranceProvider || !patient.memberId) {
      return NextResponse.json(
        { error: 'Patient is missing insurance details (Provider and Member ID are required)' },
        { status: 400 }
      );
    }

    // 2. Create Verification Request with Pending status
    const verificationRequest = await prisma.verificationRequest.create({
      data: {
        patientId: patient.id,
        status: 'Pending',
        requestedBy: userName || 'Billing System',
      },
    });

    // Update patient status to Pending
    await prisma.patient.update({
      where: { id: patient.id },
      data: { insuranceStatus: 'Pending' },
    });

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
    let missingInfo = null;

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
        deductibleMet = 250.0; // Met!
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
    await prisma.patient.update({
      where: { id: patient.id },
      data: { insuranceStatus: updatedStatus },
    });

    // 6. Update Verification Request
    await prisma.verificationRequest.update({
      where: { id: verificationRequest.id },
      data: { status: requestStatus },
    });

    // 7. Create Eligibility Result
    const eligibilityResult = await prisma.eligibilityResult.create({
      data: {
        requestId: verificationRequest.id,
        coverageStatus,
        planName,
        summaryNotes,
        dentalCleaningPct,
        xrayPct,
        estimatedPatientCost,
        missingInfo,
      },
    });

    // 8. Create Insurance Plan if successful
    if (coverageStatus === 'Active') {
      // Delete old plans for clean state
      await prisma.insurancePlan.deleteMany({
        where: { patientId: patient.id },
      });

      await prisma.insurancePlan.create({
        data: {
          patientId: patient.id,
          planName,
          providerName: patient.insuranceProvider,
          effectiveDate: new Date('2026-01-01'),
          preventiveCare: dentalCleaningPct > 0,
          specialistReq: planName.includes('HMO') || planName.includes('Select') || planName.includes('Choice Plus'),
          deductible,
          deductibleMet,
          copay,
          coinsurance,
        },
      });
    }

    // 9. Log Audit Event
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        userName: userName || 'AI Assistant',
        action: 'Verify Insurance',
        details: isInvalid
          ? `Attempted verification for ${patient.name} (${patient.insuranceProvider}). Failed: Invalid Member ID.`
          : `Verified active insurance eligibility for ${patient.name} (${patient.insuranceProvider} - ${planName}).`,
      },
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
