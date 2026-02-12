# 部署指南

## 图片上传功能配置

本项目使用 **Vercel Blob Storage** 来存储用户上传的图片，支持生产环境部署。

### Vercel 部署

1. **创建 Blob Store**

   在 Vercel 项目中：
   - 进入项目设置 → Storage
   - 创建一个新的 Blob Store
   - Vercel 会自动创建 `BLOB_READ_WRITE_TOKEN` 环境变量

2. **环境变量**

   以下环境变量会自动配置：
   - `BLOB_READ_WRITE_TOKEN` - Vercel Blob 访问令牌（自动创建）

3. **部署**

   ```bash
   npm run build
   ```

   或推送到 GitHub，通过 Vercel 自动部署。

### 本地开发

如果要测试图片上传功能：

1. **获取 Blob Token**

   - 在 Vercel 项目中复制 `BLOB_READ_WRITE_TOKEN`
   - 或访问 Vercel Dashboard → 你的项目 → Settings → Environment Variables

2. **配置本地环境**

   在 `.env.local` 文件中添加：

   ```env
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
   ```

3. **启动开发服务器**

   ```bash
   npm run dev
   ```

### 图片上传限制

- 文件类型：仅支持图片（JPG、PNG、GIF、WebP 等）
- 文件大小：最大 5MB
- 存储：使用 Vercel Blob Storage，自动 CDN 加速

### 其他部署平台

如果要部署到其他平台（非 Vercel），可以替换 `/app/api/upload/route.ts` 中的存储逻辑：

**选项 1：Cloudinary**
```bash
npm install cloudinary
```

**选项 2：AWS S3**
```bash
npm install @aws-sdk/client-s3
```

**选项 3：本地存储（不推荐生产环境）**
- 将图片保存到 `public/uploads` 目录
- 注意：Vercel 等平台文件系统是只读的

## 环境变量清单

| 变量名 | 说明 | 必需 | 示例 |
|---------|------|------|------|
| `DATABASE_URL` | 数据库连接 | 是 | `file:./dev.db` |
| `NEXTAUTH_URL` | NextAuth URL | 是 | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth 密钥 | 是 | 随机字符串 |
| `SECONDME_APP_ID` | SecondMe App ID | 是 | `your_app_id` |
| `SECONDME_APP_SECRET` | SecondMe App Secret | 是 | `your_app_secret` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob Token | 是* | `vercel_blob_rw_...` |

* 仅在使用图片上传功能时必需

## 常见问题

### Q: 图片上传失败？
A: 检查是否配置了 `BLOB_READ_WRITE_TOKEN` 环境变量。

### Q: 本地开发如何测试图片上传？
A: 从 Vercel 项目中复制 `BLOB_READ_WRITE_TOKEN` 到本地 `.env.local` 文件。

### Q: 如何更换图片存储服务？
A: 修改 `/app/api/upload/route.ts` 文件，替换存储逻辑。
