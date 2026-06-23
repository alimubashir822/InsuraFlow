import { NextResponse } from 'next/server';
import { getStore, getAllPatientsWithRelations } from '@/lib/store';

export async function GET() {
  try {
    const store = getStore();

    const patients = getAllPatientsWithRelations(store);

    const auditLogs = [...store.auditLogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);

    return NextResponse.json({
      organizations: store.organizations,
      clinics: store.clinics,
      users: store.users,
      providers: store.insuranceProviders,
      patients,
      auditLogs,
      automationRules: store.automationRules,
      aiInsights: store.aiInsights,
    });
  } catch (error: any) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data', details: error.message },
      { status: 500 }
    );
  }
}
