import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const clinics = await prisma.clinic.findMany();
    const users = await prisma.user.findMany();
    const providers = await prisma.insuranceProvider.findMany();
    const organizations = await prisma.organization.findMany();
    const automationRules = await prisma.automationRule.findMany();
    const aiInsights = await prisma.aIInsight.findMany();
    
    // Fetch patients with their nested relations (including authorizations and insights)
    const patients = await prisma.patient.findMany({
      include: {
        insurancePlans: true,
        verificationRequests: {
          include: {
            results: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        authorizations: {
          orderBy: {
            submittedDate: 'desc',
          },
        },
        claims: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        documents: true,
        aiInsights: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const auditLogs = await prisma.auditLog.findMany({
      orderBy: {
        timestamp: 'desc',
      },
      take: 50,
    });

    return NextResponse.json({
      organizations,
      clinics,
      users,
      providers,
      patients,
      auditLogs,
      automationRules,
      aiInsights,
    });
  } catch (error: any) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error.message },
      { status: 500 }
    );
  }
}
