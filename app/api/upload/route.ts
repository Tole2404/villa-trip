import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: Request) {
  try {
    // Check if BLOB_READ_WRITE_TOKEN is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN is not set');
      return NextResponse.json(
        { error: 'Server configuration error: BLOB_READ_WRITE_TOKEN not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `payments/${timestamp}-${file.name}`;

    console.log('Uploading file:', filename, 'Size:', file.size, 'Type:', file.type);

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    });

    console.log('Upload successful:', blob.url);
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to upload file', details: errorMessage },
      { status: 500 }
    );
  }
}
