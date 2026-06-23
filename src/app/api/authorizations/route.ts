import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientId, procedureCode, procedureDesc, details, userName, userId } = body;

    if (!patientId || !procedureCode || !procedureDesc) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const auth = await prisma.authorization.create({
      data: {
        patientId,
        procedureCode,
        procedureDesc,
        status: 'Submitted',
        details: details || 'Prior Authorization request submitted to insurer gateway. Awaiting medical review.',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        userName: userName || 'Billing Manager',
        action: 'Prior Auth Request',
        details: `Submitted Prior Auth for patient ID ${patientId}. Code: ${procedureCode} (${procedureDesc}).`,
      },
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

    const status = action === 'approve' ? 'Approved' : 'Denied';
    const finalAuthCode = action === 'approve' ? (authCode || 'AUTH-MOCK-' + Math.floor(1000 + Math.random() * 9000)) : null;

    const auth = await prisma.authorization.update({
      where: { id: authId },
      data: {
        status,
        authCode: finalAuthCode,
        details: details || (action === 'approve' ? 'Authorization approved under clinical guidelines.' : 'Authorization denied due to insufficient diagnostic documentation.'),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        userName: userName || 'Payer Gateway',
        action: action === 'approve' ? 'Prior Auth Approved' : 'Prior Auth Denied',
        details: `Prior Auth ID ${authId} ${status}. Payer Code: ${finalAuthCode || 'None'}.`,
      },
    });

    return NextResponse.json(auth);
  } catch (error: any) {
    console.error('Error updating auth request:', error);
    return NextResponse.json(
      { error: 'Failed to update prior auth', details: error.message },
      { status: 500 }
    );
  }
}
