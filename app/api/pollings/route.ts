import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const pollings = await prisma.villaPolling.findMany({
      orderBy: [
        { isActive: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    type PollingRow = (typeof pollings)[number];

    const normalized = pollings.map((p: PollingRow) => {
      const imageUrls = (p.imageUrls && p.imageUrls.length > 0)
        ? p.imageUrls
        : (p.imageUrl ? [p.imageUrl] : []);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { imageUrl, ...rest } = p;
      return {
        ...rest,
        imageUrls,
      };
    });

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Error fetching pollings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pollings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      imageUrl,
      imageUrls,
      capacity,
      facilities,
      description,
      price,
      link,
      locationLink,
    } = body;

    const normalizedImageUrls: string[] = Array.isArray(imageUrls)
      ? imageUrls.filter((u: unknown) => typeof u === 'string' && u.trim().length > 0)
      : (typeof imageUrl === 'string' && imageUrl.trim().length > 0 ? [imageUrl.trim()] : []);

    const polling = await prisma.villaPolling.create({
      data: {
        name,
        imageUrls: normalizedImageUrls,
        capacity: capacity || 0,
        facilities: facilities || [],
        description: description || null,
        price: price || 0,
        link: link || null,
        locationLink: locationLink || null,
        isActive: true,
      },
    });

    return NextResponse.json(polling, { status: 201 });
  } catch (error) {
    console.error('Error creating polling:', error);
    return NextResponse.json(
      { error: 'Failed to create polling' },
      { status: 500 }
    );
  }
}
