"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductCard } from '@/components/ProductCard';
import { Navbar } from '@/components/Navbar';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentSearch, setCurrentSearch] = useState('');
  const [page, setPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const loadMoreRef = useRef<HTMLDivElement>(null);
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
      {/* 共用导航栏 */}
      <Navbar user={user} onLogout={handleLogout} />

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
