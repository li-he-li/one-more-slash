"use client";

import { useEffect, useState, useRef } from "react";
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
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

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

  // 加载搜索历史
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // 点击外部关闭搜索面板
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchPanel(false);
      }
    };

    if (showSearchPanel) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearchPanel]);

  // 添加搜索历史
  const addToSearchHistory = (query: string) => {
    if (!query.trim()) return;

    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    setShowSearchPanel(false);
    // TODO: 执行搜索逻辑
  };

  // 清除搜索历史
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

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
          <div className="flex h-16 items-center gap-6">
            {/* Logo */}
            <div className="text-primary text-2xl font-bold">多多砍价</div>

            {/* 搜索框 */}
            <div className="relative" ref={searchRef}>
              <div
                onClick={() => setShowSearchPanel(!showSearchPanel)}
                className="flex h-10 w-[500px] cursor-pointer items-center gap-3 rounded-full bg-bg-page px-4 hover:shadow-md transition-shadow"
              >
                <span className="text-lg">🔍</span>
                <span className="text-text-light text-sm">搜索商品</span>
              </div>

              {/* 搜索悬浮面板 */}
              <div
                className={`absolute top-full mt-2 w-full max-w-[500px] bg-bg-card rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 transition-all duration-300 origin-top ${
                  showSearchPanel
                    ? 'opacity-100 scale-y-100 visible'
                    : 'opacity-0 scale-y-95 invisible pointer-events-none'
                }`}
              >
                  {/* 搜索输入框 */}
                  <div className="flex items-center gap-3 border-b border-gray-100 p-4">
                    <span className="text-lg text-text-secondary">🔍</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addToSearchHistory(searchQuery);
                        }
                      }}
                      placeholder="搜索商品名称、品牌"
                      className="flex-1 outline-none text-text-primary text-sm"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="text-text-secondary hover:text-text-primary transition-color"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* 搜索历史 */}
                  {searchHistory.length > 0 && (
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-text-secondary text-xs font-semibold">搜索历史</span>
                        <button
                          onClick={clearSearchHistory}
                          className="text-text-light text-xs hover:text-primary transition-color"
                        >
                          清空
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {searchHistory.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => addToSearchHistory(item)}
                            className="flex items-center gap-1 bg-bg-page hover:bg-primary-bg text-text-primary hover:text-primary px-3 py-1.5 rounded-full text-sm transition-all"
                          >
                            <span className="text-xs">🕐</span>
                            <span>{item}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 热门搜索 */}
                  <div className="border-t border-gray-100 p-4">
                    <span className="text-text-secondary text-xs font-semibold">热门搜索</span>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {['iPhone 15', 'AirPods', 'Switch', '小米手环', '戴森吹风机'].map((item, index) => (
                        <button
                          key={index}
                          onClick={() => addToSearchHistory(item)}
                          className="flex items-center gap-1 bg-bg-page hover:bg-primary-bg text-text-primary hover:text-primary px-3 py-1.5 rounded-full text-sm transition-all"
                        >
                          <span className="text-xs">🔥</span>
                          <span>{item}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
            </div>

            {/* 占据剩余空间，让右边的元素靠右对齐 */}
            <div className="flex-1"></div>

            {/* 导航链接 */}
            <nav className="flex items-center gap-4 lg:gap-8 whitespace-nowrap">
              <a href="/" className="text-text-primary hover:text-primary text-sm font-semibold transition-color">
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
