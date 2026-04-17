import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;

    const normalizedBody = { ...body } as Record<string, unknown>;
    if ('imageUrls' in normalizedBody || 'imageUrl' in normalizedBody) {
      const imageUrls = normalizedBody.imageUrls;
      const imageUrl = normalizedBody.imageUrl;

      const normalizedImageUrls: string[] = Array.isArray(imageUrls)
        ? imageUrls.filter((u: unknown) => typeof u === 'string' && u.trim().length > 0)
        : (typeof imageUrl === 'string' && imageUrl.trim().length > 0 ? [imageUrl.trim()] : []);

      normalizedBody.imageUrls = normalizedImageUrls;
      delete normalizedBody.imageUrl;
    }

    const polling = await prisma.villaPolling.update({
      where: { id },
      data: normalizedBody,
    });

    return NextResponse.json(polling);
  } catch (error) {
    console.error('Error updating polling:', error);
    return NextResponse.json(
      { error: 'Failed to update polling' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.villaPolling.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting polling:', error);
    return NextResponse.json(
      { error: 'Failed to delete polling' },
      { status: 500 }
    );
  }
}
