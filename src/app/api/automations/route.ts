import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { v4Polyfill as uuid } from '@/lib/uuid';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { ruleId, active, userName, userId } = body;

    if (!ruleId) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 });
    }

    const store = getStore();

    const ruleIndex = store.automationRules.findIndex((r) => r.id === ruleId);
    if (ruleIndex === -1) {
      return NextResponse.json({ error: 'Automation rule not found' }, { status: 404 });
    }

    store.automationRules[ruleIndex] = {
      ...store.automationRules[ruleIndex],
      active: !!active,
    };

    store.auditLogs.push({
      id: uuid(),
      userId: userId || null,
      userName: userName || 'Admin',
      action: 'Toggle Automation',
      details: `Toggled automation rule "${store.automationRules[ruleIndex].name}" to ${active ? 'Active' : 'Paused'}.`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(store.automationRules[ruleIndex]);
  } catch (error: any) {
    console.error('Error updating automation rule:', error);
    return NextResponse.json(
      { error: 'Failed to update automation rule', details: error.message },
      { status: 500 }
    );
  }
}
