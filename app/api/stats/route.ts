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
    
    const dpCompleted = await prisma.member.count({
      where: { dpPaid: true },
    });

    // Get fully paid members (total paid >= target)
    const membersWithPayments = await prisma.member.findMany({
      include: {
        payments: {
          select: { amount: true },
        },
      },
    });

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
