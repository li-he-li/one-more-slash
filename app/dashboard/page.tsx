"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProductCard } from '@/components/ProductCard';

const products = [
  {
    id: 1,
    title: 'Apple iPhone 15 Pro Max 256GB',
    progress: 180,
    currentPrice: '¥5,980',
    targetPrice: '¥6,999',
    publishPrice: '¥7,999',
    user: '小红正在砍价',
    timeLeft: '23:45:12',
  },
  {
    id: 2,
    title: 'iPad Pro 11英寸 M2芯片 256GB',
    progress: 150,
    currentPrice: '¥4,200',
    targetPrice: '¥5,499',
    publishPrice: '¥6,199',
    user: '小明正在砍价',
    timeLeft: '18:30:45',
  },
  {
    id: 3,
    title: 'AirPods Pro 2代 主动降噪',
    progress: 200,
    currentPrice: '¥1,500',
    targetPrice: '¥1,799',
    publishPrice: '¥1,899',
    user: '阿华正在砍价',
    timeLeft: '12:15:30',
  },
  {
    id: 4,
    title: 'Nintendo Switch OLED 版主机',
    progress: 120,
    currentPrice: '¥1,800',
    targetPrice: '¥2,299',
    publishPrice: '¥2,599',
    user: '大伟正在砍价',
    timeLeft: '08:42:18',
  },
  {
    id: 5,
    title: 'Dyson 戴森吹风机 HD08',
    progress: 220,
    currentPrice: '¥2,100',
    targetPrice: '¥2,690',
    publishPrice: '¥2,990',
    user: '莉莉正在砍价',
    timeLeft: '05:20:00',
  },
  {
    id: 6,
    title: '小米手环8 Pro NFC版',
    progress: 240,
    currentPrice: '¥320',
    targetPrice: '¥399',
    publishPrice: '¥499',
    user: '强哥正在砍价',
    timeLeft: '02:58:45',
  },
  {
    id: 7,
    title: 'Sony WH-1000XM5 无线降噪耳机',
    progress: 190,
    currentPrice: '¥1,850',
    targetPrice: '¥2,299',
    publishPrice: '¥2,499',
    user: '阿杰正在砍价',
    timeLeft: '15:30:00',
  },
  {
    id: 8,
    title: 'Keychron K2 Pro 机械键盘 RGB',
    progress: 160,
    currentPrice: '¥420',
    targetPrice: '¥528',
    publishPrice: '¥598',
    user: '小雨正在砍价',
    timeLeft: '09:15:30',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/");
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-page">
        <div className="text-primary text-xl font-bold animate-pulse">加载中...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg-page">
      {/* 导航栏 */}
      <header className="bg-bg-card shadow-sm">
        <div className="mx-auto max-w-[1440px] px-10">
          <div className="flex h-16 items-center gap-10">
            {/* Logo */}
            <div className="text-primary text-2xl font-bold">多多砍价</div>

            {/* 搜索框 */}
            <div className="flex h-10 w-full max-w-[500px] flex-1 items-center gap-3 rounded-full bg-bg-page px-4">
              <span className="text-lg">🔍</span>
              <span className="text-text-light text-sm">搜索商品</span>
            </div>

            {/* 导航链接 */}
            <nav className="flex items-center gap-4 lg:gap-8 whitespace-nowrap">
              <a href="/" className="text-text-primary hover:text-primary text-sm font-semibold transition-colors">
                首页
              </a>
              <span className="bg-primary shadow-button border-2 border-primary rounded-full px-5 py-2 text-bg-card text-sm font-semibold cursor-pointer">
                砍价大厅
              </span>
              <span className="border-primary bg-bg-page hover:bg-primary-bg shadow-card rounded-full border-2 px-5 py-2 text-primary text-sm font-semibold transition-all cursor-pointer">
                我的砍价
              </span>
              <span className="bg-primary shadow-button hover:bg-primary-light border-2 border-primary rounded-full px-5 py-2 text-bg-card text-sm font-semibold transition-all cursor-pointer">
                + 发布商品
              </span>
            </nav>

            {/* 账号设置按钮 */}
            <button className="bg-primary shadow-button border-2 border-primary hover:bg-primary-light flex items-center gap-2 rounded-full px-5 py-2 text-bg-card text-sm font-semibold transition-all">
              {user.image ? (
                <img src={user.image} alt={user.name} className="h-6 w-6 rounded-full" />
              ) : (
                <span>👤</span>
              )}
              <span>{user.name || '账号设置'}</span>
              <span className="text-xs">▼</span>
            </button>
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="mx-auto max-w-[1440px] px-10 py-6">
        {/* 页面标题 */}
        <div className="mb-6 flex items-center gap-4">
          <h1 className="text-text-primary text-2xl font-bold">🔥 砍价大厅</h1>
          <p className="text-text-secondary text-sm">邀请好友帮忙砍价，0元免费拿好物！</p>
        </div>

        {/* 商品网格 - 2行4列 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </main>
    </div>
  );
}
