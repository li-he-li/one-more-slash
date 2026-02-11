import React from 'react';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  id: string;
  title: string;
  progress: number;
  currentPrice: string;
  targetPrice: string;
  publishPrice: string;
  publishPriceNum?: number;
  targetPriceNum?: number;
  user: string;
  timeLeft: string;
}

export function ProductCard({
  id,
  title,
  progress,
  currentPrice,
  targetPrice,
  publishPrice,
  publishPriceNum,
  targetPriceNum,
  user,
  timeLeft,
}: ProductCardProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = React.useState(false);

  const handleBargainClick = async () => {
    if (isCreating) return;

    setIsCreating(true);
    try {
      const res = await fetch('/api/bargain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: id,
          productName: title,
          publishPrice: publishPriceNum || parseInt(publishPrice.replace(/[^\d]/g, ''), 10),
          targetPrice: targetPriceNum || parseInt(targetPrice.replace(/[^\d]/g, ''), 10),
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Please log in first to bargain');
        }
        throw new Error('Failed to create bargain session');
      }

      const data = await res.json();
      router.push(`/bargain/${data.sessionId}`);
    } catch (error) {
      console.error('Error creating bargain session:', error);
      const errorMessage = error instanceof Error ? error.message : '创建砍价会话失败，请稍后再试';
      alert(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };
  return (
    <div className="bg-bg-card shadow-card hover:shadow-xl w-full rounded-xl overflow-hidden transition-all duration-300">
      {/* 商品图片 */}
      <div className="bg-primary-bg h-[200px] flex items-center justify-center">
        <span className="text-primary text-5xl">📦</span>
      </div>

      {/* 商品信息 */}
      <div className="p-4">
        {/* 商品标题 */}
        <h3 className="text-text-primary mb-3 text-base font-semibold line-clamp-2">
          {title}
        </h3>

        {/* 砍价进度区 */}
        <div className="mb-3 space-y-2">
          {/* 进度条 */}
          <div className="bg-primary-bg h-2 w-full overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}px` }}
            />
          </div>

          {/* 价格信息 */}
          <div className="flex items-center gap-2">
            <span className="text-primary text-sm font-bold">
              已砍 {currentPrice}
            </span>
            <span className="text-text-light text-xs">
              / 目标 {targetPrice}
            </span>
          </div>

          {/* 发布价 */}
          <div className="flex items-center gap-2">
            <span className="text-text-light text-xs">发布价</span>
            <span className="text-text-secondary text-sm line-through">
              {publishPrice}
            </span>
          </div>
        </div>

        {/* 用户信息 */}
        <div className="mb-2 flex items-center gap-2">
          <div className="bg-primary-bg flex h-8 w-8 items-center justify-center rounded-full">
            <span>👤</span>
          </div>
          <span className="text-text-secondary text-xs">{user}</span>
        </div>

        {/* 剩余时间 */}
        <div className="mb-3 flex items-center gap-1">
          <span className="text-xs">⏰</span>
          <span className="text-text-secondary text-xs">还剩 {timeLeft}</span>
        </div>

        {/* 砍价按钮 */}
        <button
          onClick={handleBargainClick}
          disabled={isCreating}
          className="bg-primary shadow-button border-2 border-primary hover:bg-primary-light hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 w-full rounded-full px-6 py-3 text-bg-card text-base font-bold transition-all duration-200"
        >
          {isCreating ? '创建中...' : '帮他砍一刀 🔪'}
        </button>
      </div>
    </div>
  );
}
