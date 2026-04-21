import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const totalMembers = await prisma.member.count();
    
    const totalTargetAgg = await prisma.member.aggregate({
      _sum: { targetAmount: true },
    });
    
    const totalCollectedAgg = await prisma.payment.aggregate({
      _sum: { amount: true },
    });
    
    // Get all members with payments to calculate true DP and Full status
    const membersWithPayments = await prisma.member.findMany({
      include: {
        payments: {
          select: { amount: true },
        },
      },
    });

    const DP_THRESHOLD = 30000;

    const dpCompleted = membersWithPayments.filter((m) => {
      const totalPaid = m.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      return totalPaid >= DP_THRESHOLD;
    }).length;

    const fullyPaid = membersWithPayments.filter((m) => {
      const totalPaid = m.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      return totalPaid >= m.targetAmount;
    }).length;

    return NextResponse.json({
      total_members: totalMembers,
      total_target: totalTargetAgg._sum.targetAmount || 0,
      total_collected: totalCollectedAgg._sum.amount || 0,
      dp_completed: dpCompleted,
      fully_paid: fullyPaid,
    });
  } catch (error) {
    console.error('GET stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
