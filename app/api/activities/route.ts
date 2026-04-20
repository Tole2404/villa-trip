import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const recentPayments = await prisma.payment.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        member: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(recentPayments);
  } catch (error) {
    console.error('GET activities error:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
