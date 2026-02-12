"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  user?: any;
  onLogout?: () => void;
}

export function Navbar({ user, onLogout }: NavbarProps) {
  const pathname = usePathname();
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // 清理用户菜单定时器
  useEffect(() => {
    return () => {
      if (userMenuTimerRef.current) {
        clearTimeout(userMenuTimerRef.current);
      }
    };
  }, []);

  // 清除搜索历史
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  // 鼠标进入用户菜单区域
  const handleMouseEnter = () => {
    if (userMenuTimerRef.current) {
      clearTimeout(userMenuTimerRef.current);
      userMenuTimerRef.current = null;
    }
    setShowUserMenu(true);
  };

  // 鼠标离开用户菜单时延迟关闭
  const handleMouseLeave = () => {
    userMenuTimerRef.current = setTimeout(() => {
      setShowUserMenu(false);
    }, 300);
  };

  // 判断当前页面并设置样式
  const getNavStyle = (path: string) => {
    const isActive = pathname === path;
    if (path === '/dashboard') {
      return isActive
        ? "bg-primary shadow-button border-2 border-primary rounded-full px-5 py-2 text-bg-card text-sm font-semibold cursor-pointer"
        : "border-primary bg-bg-page hover:bg-primary-bg shadow-card rounded-full border-2 px-5 py-2 text-primary text-sm font-semibold transition-all cursor-pointer";
    }
    if (path === '/publish') {
      return isActive
        ? "bg-primary shadow-button border-2 border-primary rounded-full px-5 py-2 text-bg-card text-sm font-semibold cursor-pointer"
        : "border-primary bg-bg-page hover:bg-primary-bg shadow-card rounded-full border-2 px-5 py-2 text-primary text-sm font-semibold transition-all cursor-pointer";
    }
    return "text-text-secondary hover:text-primary text-sm font-semibold transition-color";
  };

  return (
    <header className="bg-bg-card shadow-sm">
      <div className="mx-auto max-w-[1440px] px-10">
        <div className="flex h-16 items-center gap-8">
          {/* Logo */}
          <Link href="/dashboard" className="text-primary text-2xl font-bold">
            多多砍价
          </Link>

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
                  placeholder="搜索商品名称、品牌"
                  className="flex-1 outline-none text-text-primary text-sm"
                  autoFocus
                />
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
          <nav className="flex items-center gap-8 whitespace-nowrap">
            <Link href="/" className={getNavStyle('/')}>
              首页
            </Link>
            <Link href="/dashboard" className={getNavStyle('/dashboard')}>
              砍价大厅
            </Link>
            <Link href="/my-bargains" className={getNavStyle('/my-bargains')}>
              我的砍价
            </Link>
            <Link href="/publish" className={getNavStyle('/publish')}>
              发布商品
            </Link>
          </nav>

          {/* 账号设置按钮 */}
          {user && (
            <div
              className="relative"
              ref={userMenuRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className="bg-primary shadow-button border-2 border-primary hover:bg-primary-light flex items-center gap-2 rounded-full px-5 py-2 text-bg-card text-sm font-semibold transition-all"
              >
                {user.image ? (
                  <img src={user.image} alt={user.name} className="h-6 w-6 rounded-full" />
                ) : (
                  <span>👤</span>
                )}
                <span>{user.name || '账号设置'}</span>
                <span className={`text-xs transition-transform ${showUserMenu ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {/* 用户菜单下拉列表 */}
              <div
                className={`absolute top-full right-0 mt-2 w-48 bg-bg-card rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 transition-all duration-200 origin-top-right ${
                  showUserMenu
                    ? 'opacity-100 scale-y-100 visible'
                    : 'opacity-0 scale-y-95 invisible pointer-events-none'
                }`}
              >
                <div className="py-2">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-text-primary hover:bg-bg-page text-sm font-medium transition-color"
                  >
                    <span>🚪</span>
                    <span>退出登录</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
