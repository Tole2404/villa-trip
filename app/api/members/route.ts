import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      include: {
        payments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate stats for each member
    const membersWithStats = members.map((member) => {
      const totalPaid = member.payments.reduce((sum, p) => sum + p.amount, 0);
      const remaining = member.targetAmount - totalPaid;

      let status = 'pending';
      const DP_THRESHOLD = 30000;
      
      if (remaining <= 0) {
        status = 'completed';
      } else if (totalPaid > DP_THRESHOLD) {
        status = 'savings';
      } else if (totalPaid >= DP_THRESHOLD) {
        status = member.payments.some((p) => p.type === 'savings') ? 'savings' : 'dp';
      }

      return {
        id: member.id,
        name: member.name,
        phone: member.phone ?? undefined,
        target_amount: member.targetAmount,
        dp_amount: member.dpAmount,
        dp_paid: member.dpPaid,
        created_at: member.createdAt.toISOString(),
        total_paid: totalPaid,
        remaining: Math.max(0, remaining),
        status,
      };
    });

    return NextResponse.json(membersWithStats);
  } catch (error) {
    console.error('GET members error:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, phone, targetAmount, dpAmount } = await request.json();

    const member = await prisma.member.create({
      data: {
        name,
        phone,
        targetAmount,
        dpAmount,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('POST member error:', error);
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 });
  }
}
