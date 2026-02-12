"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductCard } from '@/components/ProductCard';

interface Product {
  id: string;
  title: string;
  progress: number;
  currentPrice: string;
  targetPrice: string;
  publishPrice: string;
  user: string;
  timeLeft: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentSearch, setCurrentSearch] = useState('');
  const [page, setPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [publishForm, setPublishForm] = useState({
    title: '',
    publishPrice: '',
    targetPrice: '',
    imageUrl: '',
  });
  const [publishing, setPublishing] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const userMenuTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasMoreRef = useRef(hasMore);
  const loadingMoreRefState = useRef(loadingMore);
  const isSearchingRef = useRef(isSearching);
  const currentSearchRef = useRef(currentSearch);
  const pageRef = useRef(page);
  const searchPageRef = useRef(searchPage);

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

  // 更新 refs
  useEffect(() => {
    hasMoreRef.current = hasMore;
    loadingMoreRefState.current = loadingMore;
    isSearchingRef.current = isSearching;
    currentSearchRef.current = currentSearch;
    pageRef.current = page;
    searchPageRef.current = searchPage;
  }, [hasMore, loadingMore, isSearching, currentSearch, page, searchPage]);

  // 获取产品数据
  const fetchProducts = useCallback(async (pageNum: number, searchQuery: string, append = false) => {
    try {
      if (!append) {
        setLoading(true);
      } else {
        loadingMoreRefState.current = true;
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '8',
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error('获取产品失败');

      const data = await res.json();

      if (append) {
        setProducts(prev => [...prev, ...data.products]);
      } else {
        setProducts(data.products);
      }

      setHasMore(data.pagination.hasMore);
      setTotalCount(data.pagination.total);

      if (searchQuery) {
        searchPageRef.current = pageNum;
        setSearchPage(pageNum);
      } else {
        pageRef.current = pageNum;
        setPage(pageNum);
      }
    } catch (error) {
      console.error('获取产品失败:', error);
    } finally {
      loadingMoreRefState.current = false;
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // 初始加载产品
  useEffect(() => {
    fetchProducts(1, '');
  }, [fetchProducts]);

  // 加载更多产品
  const loadMoreProducts = useCallback(() => {
    if (!hasMoreRef.current || loadingMoreRefState.current) {
      return;
    }

    const currentPage = isSearchingRef.current ? searchPageRef.current : pageRef.current;
    const nextPage = currentPage + 1;
    const search = currentSearchRef.current;

    fetchProducts(nextPage, search, true);
  }, [fetchProducts]);

  // 无限滚动加载更多
  useEffect(() => {
    const loadMoreObserver = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting) {
          loadMoreProducts();
        }
      },
      { rootMargin: '200px' }
    );

    const observedElement = loadMoreRef.current;
    if (observedElement) {
      loadMoreObserver.observe(observedElement);
    }

    return () => {
      if (observedElement) {
        loadMoreObserver.unobserve(observedElement);
      }
    };
  }, [loadMoreProducts]);

  // 添加搜索历史并执行搜索
  const addToSearchHistory = (query: string) => {
    if (!query.trim()) return;

    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    setShowSearchPanel(false);

    // 执行搜索
    performSearch(query);
  };

  // 执行搜索
  const performSearch = (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      // 清除搜索
      isSearchingRef.current = false;
      currentSearchRef.current = '';
      searchPageRef.current = 1;
      setIsSearching(false);
      setCurrentSearch('');
      setSearchPage(1);
      fetchProducts(1, '', false);
      return;
    }

    isSearchingRef.current = true;
    currentSearchRef.current = trimmedQuery;
    searchPageRef.current = 1;
    setIsSearching(true);
    setCurrentSearch(trimmedQuery);
    setSearchPage(1);
    fetchProducts(1, trimmedQuery, false);
  };

  // 清除搜索
  const clearSearch = () => {
    isSearchingRef.current = false;
    currentSearchRef.current = '';
    searchPageRef.current = 1;
    setIsSearching(false);
    setCurrentSearch('');
    setSearchPage(1);
    fetchProducts(1, '', false);
    setSearchQuery('');
  };

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
    // 清除关闭定时器
    if (userMenuTimerRef.current) {
      clearTimeout(userMenuTimerRef.current);
      userMenuTimerRef.current = null;
    }
    setShowUserMenu(true);
  };

  // 鼠标离开用户菜单时延迟关闭
  const handleMouseLeave = () => {
    // 延迟 300ms 关闭，给用户时间移动到下拉菜单
    userMenuTimerRef.current = setTimeout(() => {
      setShowUserMenu(false);
    }, 300);
  };

  // 退出登录
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("退出登录失败:", error);
    }
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
                          if (!searchQuery.trim()) {
                            clearSearch();
                            setShowSearchPanel(false);
                          } else {
                            addToSearchHistory(searchQuery);
                          }
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
              <Link href="/" className="text-text-primary hover:text-primary text-sm font-semibold transition-color">
                首页
              </Link>
              <span
                onClick={() => isSearching && clearSearch()}
                className="bg-primary shadow-button border-2 border-primary rounded-full px-5 py-2 text-bg-card text-sm font-semibold cursor-pointer"
              >
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
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-text-primary hover:bg-bg-page text-sm font-medium transition-color"
                  >
                    <span>🚪</span>
                    <span>退出登录</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="mx-auto max-w-[1440px] px-10 py-6">
        {/* 页面标题 */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-text-primary text-2xl font-bold">
              {isSearching ? `🔍 搜索"${currentSearch}"` : '🔥 砍价大厅'}
            </h1>
            {!isSearching && (
              <p className="text-text-secondary text-sm">邀请好友帮忙砍价，0元免费拿好物！</p>
            )}
            {isSearching && (
              <p className="text-text-secondary text-sm">
                找到 <span className="text-primary font-semibold">{totalCount}</span> 个商品
              </p>
            )}
          </div>
          {isSearching && (
            <button
              onClick={clearSearch}
              className="flex items-center gap-2 text-text-primary hover:text-primary transition-color text-sm font-medium"
            >
              <span>✕</span>
              <span>清除搜索</span>
            </button>
          )}
        </div>

        {/* 商品网格 */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-text-primary text-xl font-semibold mb-2">没有找到相关商品</h3>
            <p className="text-text-secondary text-sm mb-6">试试搜索其他关键词吧</p>
            <button
              onClick={clearSearch}
              className="bg-primary hover:bg-primary-light text-bg-card px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-button"
            >
              返回砍价大厅
            </button>
          </div>
        )}

        {/* 加载更多指示器 */}
        {products.length > 0 && (
          <div ref={loadMoreRef} className="flex justify-center items-center py-8">
            {loadingMore && (
              <div className="flex items-center gap-3 text-primary">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-semibold">加载更多商品...</span>
              </div>
            )}
            {!hasMore && products.length > 8 && (
              <div className="text-text-secondary text-sm">
                没有更多商品了
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
