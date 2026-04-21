import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Ambil pembayaran terbaru
    const recentPayments = await prisma.payment.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        member: { select: { name: true } },
      },
    });

    // Ambil pengeluaran terbaru
    const recentExpenses = await prisma.expense.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    // Gabung dan urutkan
    const activities = [
      ...recentPayments.map(p => ({
        id: p.id,
        type: 'payment',
        amount: p.amount,
        createdAt: p.createdAt,
        name: p.member.name,
        category: p.type, // 'dp', 'savings', 'full'
      })),
      ...recentExpenses.map(e => ({
        id: e.id,
        type: 'expense',
        amount: e.amount,
        createdAt: e.createdAt,
        name: e.name || 'Pengeluaran',
        category: e.category,
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(activities.slice(0, 15));
  } catch (error) {
    console.error('GET activities error:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
