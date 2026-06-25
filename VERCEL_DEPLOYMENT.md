# Vercel 部署指南

## 🚨 重要提示

本项目使用 SQLite 数据库，在 Vercel 的无服务器环境中有以下限制：

### SQLite 在 Vercel 上的限制
1. **数据不持久化**: `/tmp` 目录在每次冷启动时都会清空
2. **只读功能**: 部署后的应用主要用于演示
3. **推荐方案**: 生产环境建议迁移到云数据库（如 PostgreSQL、MySQL）

## 📋 部署前准备

### 1. 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

```bash
# DeepSeek API 配置（必需）
DEEPSEEK_API_KEY=sk-your-api-key-here
DEEPSEEK_API_BASE_URL=https://api.deepseek.com

# 数据库配置（Vercel 自动设置）
DATABASE_URL=file:/tmp/resume-analyzer.db
```

### 2. Vercel 设置

1. 登录 Vercel Dashboard: https://vercel.com/dashboard
2. 点击 "Import Project"
3. 导入 GitHub 仓库: `akaedu2012/interviewDemo`
4. 配置项目设置：
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build:vercel`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
   - **Root Directory**: `./`

### 3. 环境变量设置步骤

进入项目设置 → Environment Variables，添加：

| 变量名 | 值 | 环境 |
|-------|-----|------|
| `DEEPSEEK_API_KEY` | 你的 DeepSeek API Key | Production, Preview, Development |
| `DEEPSEEK_API_BASE_URL` | https://api.deepseek.com | Production, Preview, Development |

## 🚀 部署步骤

### 方法一：通过 Vercel Dashboard（推荐）

1. **连接 GitHub**
   ```bash
   # 确保代码已推送到 GitHub
   git push origin main
   ```

2. **在 Vercel 导入项目**
   - 访问: https://vercel.com/new
   - 选择 GitHub 仓库
   - 配置项目设置
   - 添加环境变量
   - 点击 "Deploy"

3. **等待部署完成**
   - 构建时间: 约 2-3 分钟
   - 部署成功后会获得 URL

### 方法二：通过 Vercel CLI

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署到生产环境
vercel --prod

# 或者先部署到预览环境
vercel
```

## ⚙️ 构建流程说明

### 自动执行的步骤

1. **安装依赖**
   ```bash
   npm install
   ```

2. **数据库初始化**
   ```bash
   npm run postinstall  # 自动执行 db:push
   ```

3. **构建应用**
   ```bash
   npm run build:vercel  # 包含 db:push && next build
   ```

### 构建时发生的事情

1. ✅ 在 `/tmp` 目录创建 SQLite 数据库
2. ✅ 执行 Drizzle 迁移，创建表结构
3. ✅ 创建索引
4. ✅ 构建 Next.js 应用
5. ✅ 优化静态资源

## 🗄️ 数据库说明

### Vercel 环境中的数据库

```typescript
// db/index.ts
const isVercel = process.env.VERCEL === '1';
const dbDir = isVercel ? '/tmp' : path.join(process.cwd(), "data");
```

- **本地开发**: 使用 `./data/resume-analyzer.db`
- **Vercel 生产**: 使用 `/tmp/resume-analyzer.db`

### 数据持久化问题

⚠️ **重要**: Vercel 的 `/tmp` 目录不持久化！

**影响**:
- 每次冷启动（约10-15分钟无请求后）数据会丢失
- 上传的简历和候选人信息不会永久保存
- 岗位配置在重启后会重置

**解决方案**:

#### 短期（演示用）
当前配置已足够用于演示和测试

#### 长期（生产环境）
迁移到云数据库：

1. **PostgreSQL** (推荐)
   - Vercel Postgres
   - Supabase
   - Neon
   - Railway

2. **MySQL**
   - PlanetScale
   - Railway

3. **修改步骤**:
   ```typescript
   // 安装 PostgreSQL 驱动
   npm install drizzle-orm pg
   npm install -D @types/pg

   // 修改 db/index.ts
   import { drizzle } from 'drizzle-orm/node-postgres';
   import { Pool } from 'pg';

   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
   });

   export const db = drizzle(pool, { schema });
   ```

## 🔧 常见问题

### 1. 构建失败：数据库目录不存在

**错误**: `Cannot open database because the directory does not exist`

**解决**: 已在 `db/index.ts` 中添加自动创建目录的代码
```typescript
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
```

### 2. API 路由超时

**错误**: Function execution timeout

**解决**: 
- 已在 `vercel.json` 中设置 `maxDuration: 10`
- DeepSeek API 调用通常在 3-5 秒内完成
- 如需更长时间，升级到 Vercel Pro

### 3. 环境变量未生效

**检查**:
1. Vercel Dashboard → 项目 → Settings → Environment Variables
2. 确保变量已添加到 Production 环境
3. 重新部署: Dashboard → Deployments → Redeploy

### 4. 数据丢失

**原因**: Vercel 函数冷启动导致 `/tmp` 清空

**临时方案**:
- 保持应用活跃（定期访问）
- 使用 cron job 定期访问

**永久方案**: 迁移到云数据库

### 5. 文件上传问题

**限制**: Vercel 函数请求体大小限制 4.5MB

**解决**: 
- 限制 PDF 文件大小 ≤ 4MB
- 或使用 Vercel Blob Storage
- 或使用 AWS S3/Cloudflare R2

## 📊 性能优化

### 1. 边缘函数（可选）

```json
// vercel.json
{
  "functions": {
    "app/api/jobs/active/route.ts": {
      "runtime": "edge"
    }
  }
}
```

### 2. 缓存策略

```typescript
// app/api/jobs/active/route.ts
export const revalidate = 60; // 缓存 60 秒
```

### 3. 区域配置

```json
// vercel.json
{
  "regions": ["iad1"]  // 使用距离最近的区域
}
```

## 🌐 访问部署的应用

部署成功后，你会获得：

- **生产 URL**: `https://interview-demo-xxx.vercel.app`
- **自定义域名**: 可在 Vercel Dashboard 中配置

### 功能测试清单

- [ ] 访问主页
- [ ] 上传简历（注意：数据会在冷启动后丢失）
- [ ] 查看候选人列表
- [ ] 配置岗位描述
- [ ] 触发 AI 匹配评分
- [ ] 更改候选人状态
- [ ] 搜索和筛选功能
- [ ] 分页功能

## 📝 部署后配置

### 自定义域名

1. Vercel Dashboard → 项目 → Settings → Domains
2. 添加你的域名
3. 配置 DNS 记录（Vercel 会提供指导）

### 监控和日志

1. Vercel Dashboard → 项目 → Analytics
2. 查看：
   - 函数调用次数
   - 响应时间
   - 错误率
   - 流量统计

### 环境管理

- **Production**: 生产环境，从 `main` 分支部署
- **Preview**: 预览环境，从 PR 自动部署
- **Development**: 本地开发环境

## 🚧 限制和注意事项

### Vercel 免费计划限制

- 函数执行时间: 10 秒
- 函数内存: 1024 MB
- 带宽: 100 GB/月
- 构建时间: 6000 分钟/月
- 无数据库持久化

### 付费计划优势（Pro: $20/月）

- 函数执行时间: 60 秒
- 函数内存: 3008 MB
- 无限带宽
- 更多并发
- 优先支持

## 🔄 更新部署

### 自动部署

每次推送到 `main` 分支都会自动触发部署：

```bash
git add .
git commit -m "更新功能"
git push origin main
```

### 手动重新部署

1. Vercel Dashboard → 项目 → Deployments
2. 找到最新部署
3. 点击 "..." → Redeploy

## 📚 参考资源

- [Vercel 文档](https://vercel.com/docs)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [DeepSeek API 文档](https://platform.deepseek.com/docs)

## ⚡ 快速命令

```bash
# 本地测试
npm run dev

# 本地构建测试
npm run build && npm start

# Vercel 部署
vercel --prod

# 查看部署日志
vercel logs

# 查看环境变量
vercel env ls
```

## 🎯 生产环境建议

为了真正的生产使用，建议：

1. ✅ 迁移到 PostgreSQL 数据库
2. ✅ 配置 CDN 加速静态资源
3. ✅ 添加用户认证系统
4. ✅ 实现文件存储服务（S3/R2）
5. ✅ 配置错误监控（Sentry）
6. ✅ 添加分析工具（Google Analytics）
7. ✅ 设置备份策略
8. ✅ 配置 CI/CD 管道

---

**部署成功后，请访问您的应用并测试所有功能！** 🎉
