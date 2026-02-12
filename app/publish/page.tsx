"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

interface PublishForm {
  title: string;
  description: string;
  publishPrice: string;
  imageUrl: string;
}

export default function PublishPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [publishForm, setPublishForm] = useState<PublishForm>({
    title: '',
    description: '',
    publishPrice: '',
    imageUrl: '',
  });
  const [publishing, setPublishing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("退出登录失败:", error);
    }
  };

  const handlePublish = async () => {
    if (!publishForm.title || !publishForm.publishPrice) {
      alert('请填写完整信息');
      return;
    }

    const publishPrice = parseFloat(publishForm.publishPrice);

    if (isNaN(publishPrice) || publishPrice <= 0) {
      alert('请输入有效的价格');
      return;
    }

    try {
      setPublishing(true);
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: publishForm.title,
          description: publishForm.description,
          publishPrice: publishForm.publishPrice,
          targetPrice: '0', // 设置为 0，表示没有砍价底价
          imageUrl: publishForm.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || '发布失败');
      }

      const data = await res.json();
      alert('商品发布成功！');
      router.push('/dashboard');
    } catch (error: any) {
      console.error('发布商品失败:', error);
      alert(error.message || '发布商品失败，请重试');
    } finally {
      setPublishing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('只能上传图片文件');
      return;
    }

    // 验证文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || '上传失败');
      }

      const data = await res.json();
      setPublishForm({ ...publishForm, imageUrl: data.url });
    } catch (error: any) {
      console.error('上传图片失败:', error);
      alert(error.message || '上传图片失败，请重试');
    } finally {
      setUploading(false);
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
      <main className="mx-auto max-w-[1440px] px-10 py-10">
        <div className="mx-auto w-[800px]">
          {/* 表单卡片 */}
          <div className="bg-bg-card rounded-2xl shadow-card p-10">
            {/* 标题 */}
            <h1 className="text-text-primary text-3xl font-bold mb-8">发布新商品</h1>

            {/* 商品名称 */}
            <div className="mb-5">
              <label className="block text-text-primary text-sm font-semibold mb-3">
                商品名称
              </label>
              <input
                type="text"
                value={publishForm.title}
                onChange={(e) => setPublishForm({ ...publishForm, title: e.target.value })}
                placeholder="请输入商品名称"
                className="w-full h-12 rounded-lg border border-border-color px-4 outline-none focus:border-primary transition-color text-text-primary"
              />
            </div>

            {/* 商品描述 */}
            <div className="mb-5">
              <label className="block text-text-primary text-sm font-semibold mb-3">
                商品描述
              </label>
              <textarea
                value={publishForm.description}
                onChange={(e) => setPublishForm({ ...publishForm, description: e.target.value })}
                placeholder="请输入商品描述，详细介绍商品的特点、规格等信息"
                rows={4}
                className="w-full rounded-lg border border-border-color px-4 py-3 outline-none focus:border-primary transition-color text-text-primary resize-none"
              />
            </div>

            {/* 价格设置 */}
            <div className="mb-5">
              <label className="block text-text-primary text-sm font-semibold mb-3">
                商品原价 (元)
              </label>
              <input
                type="number"
                step="0.01"
                value={publishForm.publishPrice}
                onChange={(e) => setPublishForm({ ...publishForm, publishPrice: e.target.value })}
                placeholder="0.00"
                className="w-full h-12 rounded-lg border border-border-color px-4 outline-none focus:border-primary transition-color text-text-primary"
              />
            </div>

            {/* 商品图片 */}
            <div className="mb-8">
              <label className="block text-text-primary text-sm font-semibold mb-3">
                商品图片
              </label>
              {publishForm.imageUrl ? (
                <div className="relative w-full h-40 rounded-lg border-2 border-border-color overflow-hidden">
                  <img
                    src={publishForm.imageUrl}
                    alt="商品图片"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setPublishForm({ ...publishForm, imageUrl: '' })}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition-color"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div
                  className={`w-full h-40 rounded-lg border-2 border-dashed ${
                    dragActive ? 'border-primary bg-primary-bg' : 'border-border-color'
                  } flex flex-col items-center justify-center gap-2 cursor-pointer transition-color`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    id="upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleChange}
                    disabled={uploading}
                  />
                  <label htmlFor="upload" className="cursor-pointer flex flex-col items-center gap-2">
                    {uploading ? (
                      <>
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-text-light text-sm">上传中...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl">📸</span>
                        <span className="text-text-light text-sm">点击或拖拽上传图片</span>
                      </>
                    )}
                  </label>
                </div>
              )}
              <p className="text-text-light text-xs mt-2">支持 JPG、PNG 格式，最大 5MB</p>
            </div>

            {/* 提交按钮 */}
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="w-full h-14 bg-primary hover:bg-primary-light rounded-full shadow-button text-bg-card text-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {publishing ? (
                <>
                  <div className="w-5 h-5 border-2 border-bg-card border-t-transparent rounded-full animate-spin"></div>
                  <span>发布中...</span>
                </>
              ) : (
                '立即发布商品'
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
