import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, treatmentCode, treatmentDesc, totalCharge, userName, userId } = body;

    if (!patientId || !treatmentCode || !totalCharge) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const claim = await prisma.claim.create({
      data: {
        patientId,
        treatmentCode,
        treatmentDesc,
        totalCharge: parseFloat(totalCharge),
        status: 'Draft',
        riskScore: 'Medium',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        userName: userName || 'Billing Manager',
        action: 'Create Claim',
        details: `Created draft claim for patient ID ${patientId}. Amount: $${totalCharge}.`,
      },
    });

    return NextResponse.json(claim);
  } catch (error: any) {
    console.error('Error creating claim:', error);
    return NextResponse.json(
      { error: 'Failed to create claim', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { claimId, action, userName, userId } = body;

    if (!claimId || !action) {
      return NextResponse.json({ error: 'Claim ID and Action are required' }, { status: 400 });
    }

    const claim = await prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        patient: true,
      },
    });

    if (!claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    let updatedClaim;

    if (action === 'check_readiness') {
      // Analyze readiness based on code
      let riskScore = 'Low';
      let missingCodes = [];

      // Check for missing data
      if (!claim.patient.insuranceProvider || !claim.patient.memberId) {
        missingCodes.push('Missing active insurance provider details');
        riskScore = 'High';
      }

      // Check code formatting
      if (!claim.treatmentCode.startsWith('D') && !claim.treatmentCode.startsWith('C')) {
        missingCodes.push('Invalid ICD-10 or Dental Procedure code format');
        riskScore = 'High';
      }

      if (claim.treatmentCode === 'D6010' && !claim.missingCodes?.includes('radiograph')) {
        missingCodes.push('Missing post-operative radiograph link');
        riskScore = 'Medium';
      }

      if (claim.totalCharge > 1000 && !claim.missingCodes?.includes('prior authorization')) {
        missingCodes.push('Missing prior authorization approval code');
        riskScore = 'Medium';
      }

      // Mock audit check: if there is no diagnosis code
      if (!claim.treatmentCode.match(/^D\d{4}$/) && !claim.treatmentCode.match(/^[A-Z]\d{2}\.?\d?$/)) {
        missingCodes.push('Missing standard diagnosis code (ICD-10)');
        riskScore = 'High';
      }

      const missingCodesStr = missingCodes.join(', ');

      updatedClaim = await prisma.claim.update({
        where: { id: claimId },
        data: {
          riskScore,
          missingCodes: missingCodesStr || null,
          status: missingCodes.length > 0 ? 'Reviewing' : 'Ready',
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: userId || null,
          userName: userName || 'AI Auditor',
          action: 'Readiness Audit',
          details: `Performed AI audit check on claim ${claimId}. Results: Risk ${riskScore}, Issues identified: ${missingCodes.length}.`,
        },
      });
    } else if (action === 'submit') {
      // Submit claim to insurer
      const estimatedPaid = claim.totalCharge * 0.8; // Assume 80% coverage
      const patientResp = claim.totalCharge - estimatedPaid;

      updatedClaim = await prisma.claim.update({
        where: { id: claimId },
        data: {
          status: 'Submitted',
          insurancePaid: estimatedPaid,
          patientPaid: patientResp,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: userId || null,
          userName: userName || 'Billing Manager',
          action: 'Submit Claim',
          details: `Submitted claim ${claimId} to ${claim.patient.insuranceProvider || 'insurer'}. Expected Paid: $${estimatedPaid.toFixed(2)}.`,
        },
      });

      // Also create a payment if submitted successfully
      await prisma.payment.create({
        data: {
          patientId: claim.patientId,
          amount: estimatedPaid,
          method: 'Insurance',
          status: 'Pending',
        },
      });
    } else if (action === 'approve') {
      // Approve and settle claim (Paid)
      updatedClaim = await prisma.claim.update({
        where: { id: claimId },
        data: {
          status: 'Paid',
        },
      });

      // Complete payment
      const pendingPayment = await prisma.payment.findFirst({
        where: { patientId: claim.patientId, status: 'Pending' },
        orderBy: { createdAt: 'desc' },
      });

      if (pendingPayment) {
        await prisma.payment.update({
          where: { id: pendingPayment.id },
          data: { status: 'Completed' },
        });
      }

      await prisma.auditLog.create({
        data: {
          userId: userId || null,
          userName: userName || 'Payer Gateway',
          action: 'Settle Claim',
          details: `Claim ${claimId} approved and settled by insurer. Paid: $${claim.insurancePaid.toFixed(2)}.`,
        },
      });
    } else if (action === 'deny') {
      // Deny claim
      updatedClaim = await prisma.claim.update({
        where: { id: claimId },
        data: {
          status: 'Denied',
          insurancePaid: 0.0,
          patientPaid: claim.totalCharge,
        },
      });

      // Fail pending payment
      const pendingPayment = await prisma.payment.findFirst({
        where: { patientId: claim.patientId, status: 'Pending' },
        orderBy: { createdAt: 'desc' },
      });

      if (pendingPayment) {
        await prisma.payment.update({
          where: { id: pendingPayment.id },
          data: { status: 'Failed' },
        });
      }

      await prisma.auditLog.create({
        data: {
          userId: userId || null,
          userName: userName || 'Payer Gateway',
          action: 'Deny Claim',
          details: `Claim ${claimId} denied by insurer due to missing authorization.`,
        },
      });
    }

    return NextResponse.json(updatedClaim);
  } catch (error: any) {
    console.error('Error updating claim:', error);
    return NextResponse.json(
      { error: 'Failed to update claim', details: error.message },
      { status: 500 }
    );
  }
}
