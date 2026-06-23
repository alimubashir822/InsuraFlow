import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { v4Polyfill as uuid } from '@/lib/uuid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, procedureCode, procedureDesc, details, userName, userId } = body;

    if (!patientId || !procedureCode || !procedureDesc) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const store = getStore();

    const auth = {
      id: uuid(),
      patientId,
      procedureCode,
      procedureDesc,
      status: 'Submitted',
      submittedDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authCode: null as string | null,
      details: details || 'Prior Authorization request submitted to insurer gateway. Awaiting medical review.',
    };

    store.authorizations.push(auth);

    store.auditLogs.push({
      id: uuid(),
      userId: userId || null,
      userName: userName || 'Billing Manager',
      action: 'Prior Auth Request',
      details: `Submitted Prior Auth for patient ID ${patientId}. Code: ${procedureCode} (${procedureDesc}).`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(auth);
  } catch (error: any) {
    console.error('Error creating auth request:', error);
    return NextResponse.json(
      { error: 'Failed to create prior auth request', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { authId, action, authCode, details, userName, userId } = body;

    if (!authId || !action) {
      return NextResponse.json({ error: 'Authorization ID and Action are required' }, { status: 400 });
    }

    const store = getStore();

    const authIndex = store.authorizations.findIndex((a) => a.id === authId);
    if (authIndex === -1) {
      return NextResponse.json({ error: 'Authorization not found' }, { status: 404 });
    }

    const status = action === 'approve' ? 'Approved' : 'Denied';
    const finalAuthCode = action === 'approve' ? (authCode || 'AUTH-MOCK-' + Math.floor(1000 + Math.random() * 9000)) : null;

    store.authorizations[authIndex] = {
      ...store.authorizations[authIndex],
      status,
      authCode: finalAuthCode,
      details: details || (action === 'approve' ? 'Authorization approved under clinical guidelines.' : 'Authorization denied due to insufficient diagnostic documentation.'),
      updatedAt: new Date().toISOString(),
    };

    store.auditLogs.push({
      id: uuid(),
      userId: userId || null,
      userName: userName || 'Payer Gateway',
      action: action === 'approve' ? 'Prior Auth Approved' : 'Prior Auth Denied',
      details: `Prior Auth ID ${authId} ${status}. Payer Code: ${finalAuthCode || 'None'}.`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(store.authorizations[authIndex]);
  } catch (error: any) {
    console.error('Error updating auth request:', error);
    return NextResponse.json(
      { error: 'Failed to update prior auth', details: error.message },
      { status: 500 }
    );
  }
}
