import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const votes = await prisma.vote.findMany({
      include: { 
        member: {
          select: { id: true, name: true }
        }
      }
    });
    return NextResponse.json(votes);
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch votes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { memberId, villaId } = body;

    if (!memberId || !villaId) {
      return NextResponse.json(
        { error: 'Missing memberId or villaId' },
        { status: 400 }
      );
    }

    const existingVote = await prisma.vote.findUnique({
      where: { memberId },
    });

    if (existingVote && existingVote.villaId === villaId) {
      // Unvote if clicking the same villa
      await prisma.vote.delete({
        where: { memberId },
      });
      return NextResponse.json({ message: 'Vote removed' }, { status: 200 });
    }

    const vote = await prisma.vote.upsert({
      where: { memberId },
      update: { villaId },
      create: { memberId, villaId },
      include: {
        member: {
          select: { id: true, name: true }
        }
      }
    });

    return NextResponse.json(vote, { status: 200 });
  } catch (error) {
    console.error('Error submitting vote:', error);
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Vote ID required' }, { status: 400 });
    }

    await prisma.vote.delete({
      where: { id }
    });
    
    return NextResponse.json({ message: 'Vote deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting vote:', error);
    return NextResponse.json({ error: 'Failed to delete vote' }, { status: 500 });
  }
}
