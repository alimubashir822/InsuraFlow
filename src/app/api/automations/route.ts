import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { ruleId, active, userName, userId } = body;

    if (!ruleId) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400 });
    }

    const rule = await prisma.automationRule.update({
      where: { id: ruleId },
      data: {
        active: !!active,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        userName: userName || 'Admin',
        action: 'Toggle Automation',
        details: `Toggled automation rule "${rule.name}" to ${active ? 'Active' : 'Paused'}.`,
      },
    });

    return NextResponse.json(rule);
  } catch (error: any) {
    console.error('Error updating automation rule:', error);
    return NextResponse.json(
      { error: 'Failed to update automation rule', details: error.message },
      { status: 500 }
    );
  }
}
