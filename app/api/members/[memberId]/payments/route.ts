import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const { memberId } = params;

    const payments = await prisma.payment.findMany({
      where: { memberId },
      orderBy: [
        { date: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('GET payments error:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { memberId: string } }
) {
  try {
    const { memberId } = params;
    const { type, amount, date, note, proof } = await request.json();

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        memberId,
        type,
        amount,
        date: new Date(date),
        note,
        proof,
      },
    });

    // Update dp_paid status
    const totalPaid = await prisma.payment.aggregate({
      where: { memberId },
      _sum: { amount: true },
    });

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { dpAmount: true },
    });

    if (member && totalPaid._sum.amount !== null) {
      await prisma.member.update({
        where: { id: memberId },
        data: {
          dpPaid: totalPaid._sum.amount >= member.dpAmount,
        },
      });
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('POST payment error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { memberId: string; paymentId: string } }
) {
  try {
    const { memberId, paymentId } = params;

    await prisma.payment.delete({
      where: { id: paymentId },
    });

    // Update dp_paid status
    const totalPaid = await prisma.payment.aggregate({
      where: { memberId },
      _sum: { amount: true },
    });

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { dpAmount: true },
    });

    if (member) {
      await prisma.member.update({
        where: { id: memberId },
        data: {
          dpPaid: (totalPaid._sum.amount || 0) >= member.dpAmount,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE payment error:', error);
    return NextResponse.json({ error: 'Failed to delete payment' }, { status: 500 });
  }
}
