import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/app/api/auth/[...nextauth]/config';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, publishPrice, targetPrice, imageUrl } = body;

    if (!title || !publishPrice) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 创建商品
    const product = await prisma.product.create({
      data: {
        title,
        description: description || '',
        publishPrice: parseFloat(publishPrice),
        targetPrice: parseFloat(targetPrice || '0'),
        currentPrice: parseFloat(publishPrice),
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
        userId: user.id,
        status: 'active',
        progress: 0,
      },
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('创建商品失败:', error);
    return NextResponse.json(
      { error: '创建商品失败' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '8');
    const search = (searchParams.get('search') || '').trim();

    const skip = (page - 1) * limit;

    // 构建查询条件
    const where = search
      ? {
          status: 'active',
          title: {
            contains: search,
          },
        }
      : { status: 'active' };

    // 查询产品总数
    const total = await prisma.product.count({ where });

    // 查询产品
    const products = await prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 转换数据格式以匹配前端期望
    const formattedProducts = products.map((product) => ({
      id: product.id,
      title: product.title,
      progress: product.progress,
      currentPrice: `¥${product.currentPrice.toLocaleString()}`,
      targetPrice: `¥${product.targetPrice.toLocaleString()}`,
      publishPrice: `¥${product.publishPrice.toLocaleString()}`,
      user: '正在砍价', // 后续可以从用户表获取
      timeLeft: `${Math.floor(Math.random() * 24)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    }));

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + products.length < total,
      },
    });
  } catch (error) {
    console.error('获取产品失败:', error);
    return NextResponse.json(
      { error: '获取产品失败' },
      { status: 500 }
    );
  }
}
