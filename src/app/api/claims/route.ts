import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { v4Polyfill as uuid } from '@/lib/uuid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, treatmentCode, treatmentDesc, totalCharge, userName, userId } = body;

    if (!patientId || !treatmentCode || !totalCharge) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const store = getStore();

    const claim = {
      id: uuid(),
      patientId,
      treatmentCode,
      treatmentDesc,
      totalCharge: parseFloat(totalCharge),
      insurancePaid: 0.0,
      patientPaid: 0.0,
      status: 'Draft',
      riskScore: 'Medium',
      missingCodes: null as string | null,
      createdAt: new Date().toISOString(),
    };

    store.claims.push(claim);

    store.auditLogs.push({
      id: uuid(),
      userId: userId || null,
      userName: userName || 'Billing Manager',
      action: 'Create Claim',
      details: `Created draft claim for patient ID ${patientId}. Amount: $${totalCharge}.`,
      timestamp: new Date().toISOString(),
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

    const store = getStore();

    const claimIndex = store.claims.findIndex((c) => c.id === claimId);
    if (claimIndex === -1) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    const claim = store.claims[claimIndex];
    const patient = store.patients.find((p) => p.id === claim.patientId);

    if (action === 'check_readiness') {
      let riskScore = 'Low';
      const missingCodes: string[] = [];

      if (!patient?.insuranceProvider || !patient?.memberId) {
        missingCodes.push('Missing active insurance provider details');
        riskScore = 'High';
      }

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

      if (!claim.treatmentCode.match(/^D\d{4}$/) && !claim.treatmentCode.match(/^[A-Z]\d{2}\.?\d?$/)) {
        missingCodes.push('Missing standard diagnosis code (ICD-10)');
        riskScore = 'High';
      }

      const missingCodesStr = missingCodes.join(', ');

      store.claims[claimIndex] = {
        ...claim,
        riskScore,
        missingCodes: missingCodesStr || null,
        status: missingCodes.length > 0 ? 'Reviewing' : 'Ready',
      };

      store.auditLogs.push({
        id: uuid(),
        userId: userId || null,
        userName: userName || 'AI Auditor',
        action: 'Readiness Audit',
        details: `Performed AI audit check on claim ${claimId}. Results: Risk ${riskScore}, Issues identified: ${missingCodes.length}.`,
        timestamp: new Date().toISOString(),
      });
    } else if (action === 'submit') {
      const estimatedPaid = claim.totalCharge * 0.8;
      const patientResp = claim.totalCharge - estimatedPaid;

      store.claims[claimIndex] = {
        ...claim,
        status: 'Submitted',
        insurancePaid: estimatedPaid,
        patientPaid: patientResp,
      };

      store.auditLogs.push({
        id: uuid(),
        userId: userId || null,
        userName: userName || 'Billing Manager',
        action: 'Submit Claim',
        details: `Submitted claim ${claimId} to ${patient?.insuranceProvider || 'insurer'}. Expected Paid: $${estimatedPaid.toFixed(2)}.`,
        timestamp: new Date().toISOString(),
      });

      store.payments.push({
        id: uuid(),
        patientId: claim.patientId,
        amount: estimatedPaid,
        method: 'Insurance',
        status: 'Pending',
        createdAt: new Date().toISOString(),
      });
    } else if (action === 'approve') {
      store.claims[claimIndex] = {
        ...claim,
        status: 'Paid',
      };

      const pendingPaymentIndex = store.payments.findIndex(
        (p) => p.patientId === claim.patientId && p.status === 'Pending'
      );
      if (pendingPaymentIndex !== -1) {
        store.payments[pendingPaymentIndex] = {
          ...store.payments[pendingPaymentIndex],
          status: 'Completed',
        };
      }

      store.auditLogs.push({
        id: uuid(),
        userId: userId || null,
        userName: userName || 'Payer Gateway',
        action: 'Settle Claim',
        details: `Claim ${claimId} approved and settled by insurer. Paid: $${claim.insurancePaid.toFixed(2)}.`,
        timestamp: new Date().toISOString(),
      });
    } else if (action === 'deny') {
      store.claims[claimIndex] = {
        ...claim,
        status: 'Denied',
        insurancePaid: 0.0,
        patientPaid: claim.totalCharge,
      };

      const pendingPaymentIndex = store.payments.findIndex(
        (p) => p.patientId === claim.patientId && p.status === 'Pending'
      );
      if (pendingPaymentIndex !== -1) {
        store.payments[pendingPaymentIndex] = {
          ...store.payments[pendingPaymentIndex],
          status: 'Failed',
        };
      }

      store.auditLogs.push({
        id: uuid(),
        userId: userId || null,
        userName: userName || 'Payer Gateway',
        action: 'Deny Claim',
        details: `Claim ${claimId} denied by insurer due to missing authorization.`,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json(store.claims[claimIndex]);
  } catch (error: any) {
    console.error('Error updating claim:', error);
    return NextResponse.json(
      { error: 'Failed to update claim', details: error.message },
      { status: 500 }
    );
  }
}
