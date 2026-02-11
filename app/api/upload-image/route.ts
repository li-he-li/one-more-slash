import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * POST /api/upload-image - Upload product image
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: '只支持上传图片文件 (jpg, png, webp)' },
        { status: 400 }
      );
    }

    // Validate file size
    const bytes = await file.arrayBuffer();
    if (bytes.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: '图片大小不能超过 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = randomBytes(4).toString('hex');
    const extension = file.name.split('.').pop();
    const filename = `${timestamp}-${random}.${extension}`;

    // Save file to public/uploads
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    const filepath = join(uploadsDir, filename);

    await writeFile(filepath, Buffer.from(bytes));

    // Return URL
    const url = `/uploads/${filename}`;

    return NextResponse.json({
      url,
      message: '图片上传成功',
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
