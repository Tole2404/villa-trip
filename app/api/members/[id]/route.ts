import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { name, phone, targetAmount, dpAmount } = await request.json();

    const member = await prisma.member.update({
      where: { id },
      data: {
        name,
        phone,
        targetAmount,
        dpAmount,
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error('PUT member error:', error);
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.member.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE member error:', error);
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}
