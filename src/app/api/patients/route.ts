import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { v4Polyfill as uuid } from '@/lib/uuid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, dob, email, phone, insuranceProvider, memberId, groupNumber, userName, userId } = body;

    if (!name || !dob) {
      return NextResponse.json({ error: 'Name and Date of Birth are required' }, { status: 400 });
    }

    const store = getStore();

    const clinic = store.clinics[0];
    if (!clinic) {
      return NextResponse.json({ error: 'No clinic found in database' }, { status: 500 });
    }

    const insuranceStatus = (insuranceProvider && memberId) ? 'Pending' : 'Missing';

    const patient = {
      id: uuid(),
      name,
      dob: new Date(dob).toISOString(),
      email: email || null,
      phone: phone || null,
      clinicId: clinic.id,
      insuranceProvider: insuranceProvider || null,
      memberId: memberId || null,
      groupNumber: groupNumber || null,
      insuranceStatus,
      createdAt: new Date().toISOString(),
    };

    store.patients.push(patient);

    // Create Audit Log
    store.auditLogs.push({
      id: uuid(),
      userId: userId || null,
      userName: userName || 'Front Desk',
      action: 'Add Patient',
      details: `Added patient ${name} to directory. Insurance status: ${insuranceStatus}.`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(patient);
  } catch (error: any) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { error: 'Failed to create patient', details: error.message },
      { status: 500 }
    );
  }
}
