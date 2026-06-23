import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, dob, email, phone, insuranceProvider, memberId, groupNumber, userName, userId } = body;

    if (!name || !dob) {
      return NextResponse.json({ error: 'Name and Date of Birth are required' }, { status: 400 });
    }

    // Get the first clinic to assign the patient to
    const clinic = await prisma.clinic.findFirst();
    if (!clinic) {
      return NextResponse.json({ error: 'No clinic found in database' }, { status: 500 });
    }

    const insuranceStatus = (insuranceProvider && memberId) ? 'Pending' : 'Missing';

    const patient = await prisma.patient.create({
      data: {
        name,
        dob: new Date(dob),
        email: email || null,
        phone: phone || null,
        clinicId: clinic.id,
        insuranceProvider: insuranceProvider || null,
        memberId: memberId || null,
        groupNumber: groupNumber || null,
        insuranceStatus,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        userName: userName || 'Front Desk',
        action: 'Add Patient',
        details: `Added patient ${name} to directory. Insurance status: ${insuranceStatus}.`,
      },
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
