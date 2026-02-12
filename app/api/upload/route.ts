import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '没有上传文件' },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '只能上传图片文件' },
        { status: 400 }
      );
    }

    // 验证文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: '图片大小不能超过 5MB' },
        { status: 400 }
      );
    }

    // 检查是否配置了 Vercel Blob
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (!blobToken) {
      // 如果没有配置 Vercel Blob，返回错误提示
      return NextResponse.json(
        { error: '图片上传功能未配置，请联系管理员配置 BLOB_READ_WRITE_TOKEN 环境变量' },
        { status: 500 }
      );
    }

    // 使用 Vercel Blob 上传文件
    const filename = `${Date.now()}-${file.name}`;
    const blob = await put(filename, file, {
      access: 'public',
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: blob.pathname,
    });
  } catch (error: any) {
    console.error('上传文件失败:', error);
    return NextResponse.json(
      { error: error.message || '上传文件失败' },
      { status: 500 }
    );
  }
}
