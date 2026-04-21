import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rundown = await prisma.rundown.findMany({
      orderBy: [
        { day: 'asc' },
        { order: 'asc' },
        { time: 'asc' }
      ]
    });
    return NextResponse.json(rundown);
  } catch (error) {
    console.error('GET rundown error:', error);
    return NextResponse.json({ error: 'Failed to fetch rundown' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const item = await prisma.rundown.create({
      data: {
        day: data.day,
        time: data.time,
        activity: data.activity,
        note: data.note,
        icon: data.icon,
        order: data.order || 0
      }
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('POST rundown error:', error);
    return NextResponse.json({ error: 'Failed to create rundown item' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, ...updates } = data;
    const item = await prisma.rundown.update({
      where: { id },
      data: updates
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error('PUT rundown error:', error);
    return NextResponse.json({ error: 'Failed to update rundown item' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    await prisma.rundown.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE rundown error:', error);
    return NextResponse.json({ error: 'Failed to delete rundown item' }, { status: 500 });
  }
}
