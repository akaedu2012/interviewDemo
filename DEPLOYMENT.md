# 部署指南

本文档提供 AI 简历分析平台的详细部署步骤和配置建议。

## 目录

- [部署选项概览](#部署选项概览)
- [Vercel 部署](#vercel-部署推荐)
- [Docker 部署](#docker-部署)
- [自托管部署](#自托管部署)
- [数据库配置](#数据库配置)
- [环境变量配置](#环境变量配置)
- [生产环境优化](#生产环境优化)
- [故障排查](#故障排查)

---

## 部署选项概览

| 部署方式 | 优点 | 缺点 | 适用场景 |
|---------|------|------|----------|
| Vercel | 简单快速、自动CI/CD、全球CDN | 需要云数据库、有函数时长限制 | 快速原型、小型项目 |
| Docker | 隔离环境、易于迁移、可本地部署 | 需要Docker知识、资源占用 | 生产环境、企业内部 |
| 自托管 | 完全控制、无限制 | 需要服务器运维知识 | 定制化需求、大型项目 |

---

## Vercel 部署（推荐）

### 前提条件
- GitHub/GitLab/Bitbucket 账号
- Vercel 账号（免费）
- OpenAI API 密钥

### 步骤

#### 1. 准备代码仓库
```bash
# 将项目推送到 Git 仓库
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

#### 2. 导入项目到 Vercel
1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "Import Project"
3. 选择你的 Git 仓库
4. 配置项目：
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### 3. 配置环境变量
在 Vercel 项目设置中添加以下环境变量：

```env
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4-turbo-preview
NODE_ENV=production
```

#### 4. 数据库迁移

**重要**: Vercel 部署不支持本地 SQLite 数据库文件（因为文件系统是只读的）。你需要迁移到云数据库。

##### 选项 A: Vercel Postgres（推荐）

1. 在 Vercel 项目中启用 Postgres
2. 更新 `db/index.ts` 使用 Postgres 连接
3. 更新环境变量：
```env
POSTGRES_URL=postgresql://...
```

##### 选项 B: Turso（SQLite 云服务）

1. 注册 [Turso](https://turso.tech/)
2. 创建数据库
3. 更新 `db/index.ts` 使用 Turso 连接
4. 添加环境变量：
```env
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```

##### 选项 C: 其他云数据库

- **Supabase** (PostgreSQL)
- **PlanetScale** (MySQL)
- **Neon** (PostgreSQL)

#### 5. 文件存储迁移

Vercel 的文件系统是只读的，上传的简历需要存储到云存储。

##### 选项 A: Vercel Blob Storage（推荐）

```typescript
// lib/storage.ts
import { put } from '@vercel/blob';

export async function uploadFile(file: File): Promise<string> {
  const blob = await put(file.name, file, {
    access: 'public',
  });
  return blob.url;
}
```

添加环境变量：
```env
BLOB_READ_WRITE_TOKEN=...
```

##### 选项 B: AWS S3

安装 AWS SDK：
```bash
npm install @aws-sdk/client-s3
```

配置环境变量：
```env
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

#### 6. 部署

1. 推送代码到 Git 仓库
2. Vercel 会自动触发构建和部署
3. 等待部署完成
4. 访问生成的 URL

### Vercel 部署限制

- **函数执行时间**: Hobby 计划 10 秒，Pro 计划 60 秒
- **文件大小**: 部署包最大 100MB
- **内存**: 1024 MB（Hobby），3008 MB（Pro）

**解决方案**: 
- 将长时间的 AI 提取任务移到后台队列（如 Vercel Cron + Queue）
- 使用流式响应减少单次执行时间

---

## Docker 部署

### Dockerfile

创建 `Dockerfile`：

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./
RUN npm ci

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM node:18-alpine AS runner

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制必要文件
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 创建数据和上传目录
RUN mkdir -p /app/data /app/public/uploads
RUN chown -R nextjs:nodejs /app/data /app/public/uploads

# 切换到非 root 用户
USER nextjs

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["node", "server.js"]
```

### docker-compose.yml

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: resume-analyzer
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - OPENAI_MODEL=${OPENAI_MODEL}
      - DATABASE_PATH=/app/data/resume-analyzer.db
    volumes:
      - ./data:/app/data
      - ./public/uploads:/app/public/uploads
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

# 可选：添加 Nginx 反向代理
  nginx:
    image: nginx:alpine
    container_name: resume-analyzer-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped
```

### 部署步骤

#### 1. 准备服务器
```bash
# 安装 Docker 和 Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt-get install docker-compose-plugin
```

#### 2. 克隆项目
```bash
git clone <your-repo-url>
cd interviewDemo
```

#### 3. 配置环境变量
```bash
cp .env.example .env.local
# 编辑 .env.local 填入配置
nano .env.local
```

#### 4. 构建和启动
```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

#### 5. 初始化数据库
```bash
# 进入容器
docker-compose exec app sh

# 运行数据库迁移
npm run db:push

# 退出容器
exit
```

### Docker 优化

#### 多阶段构建优化
```dockerfile
# 减小镜像大小
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
CMD ["npm", "start"]
```

---

## 自托管部署

### 使用 PM2

#### 1. 安装 PM2
```bash
npm install -g pm2
```

#### 2. 构建应用
```bash
npm run build
```

#### 3. 创建 PM2 配置文件

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [{
    name: 'resume-analyzer',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/interviewDemo',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env.local',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
  }]
}
```

#### 4. 启动应用
```bash
# 启动
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs resume-analyzer

# 重启
pm2 restart resume-analyzer

# 停止
pm2 stop resume-analyzer

# 设置开机自启
pm2 startup
pm2 save
```

### 使用 systemd

#### 1. 创建 systemd 服务文件

创建 `/etc/systemd/system/resume-analyzer.service`：

```ini
[Unit]
Description=AI Resume Analyzer
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/interviewDemo
Environment="NODE_ENV=production"
Environment="PORT=3000"
EnvironmentFile=/var/www/interviewDemo/.env.local
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=resume-analyzer

[Install]
WantedBy=multi-user.target
```

#### 2. 启动服务
```bash
# 重载 systemd
sudo systemctl daemon-reload

# 启动服务
sudo systemctl start resume-analyzer

# 查看状态
sudo systemctl status resume-analyzer

# 设置开机自启
sudo systemctl enable resume-analyzer

# 查看日志
sudo journalctl -u resume-analyzer -f
```

### Nginx 反向代理

创建 `/etc/nginx/sites-available/resume-analyzer`：

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL 证书配置
    ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.com.key;

    # SSL 优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 日志
    access_log /var/log/nginx/resume-analyzer-access.log;
    error_log /var/log/nginx/resume-analyzer-error.log;

    # 上传文件大小限制
    client_max_body_size 20M;

    # 代理到 Next.js 应用
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # SSE 支持
        proxy_buffering off;
        proxy_read_timeout 300s;
    }

    # 静态文件缓存
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /uploads {
        alias /var/www/interviewDemo/public/uploads;
        add_header Cache-Control "public, max-age=86400";
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/resume-analyzer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 数据库配置

### SQLite（本地部署）

默认配置，无需额外设置：

```env
DATABASE_PATH=./data/resume-analyzer.db
```

### PostgreSQL（云部署）

1. 安装 PostgreSQL 适配器：
```bash
npm install pg
```

2. 更新 `db/index.ts`：
```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);
```

3. 配置环境变量：
```env
DATABASE_URL=postgresql://user:password@host:5432/database
```

### 数据库备份

#### SQLite 备份
```bash
# 备份
cp data/resume-analyzer.db data/backup-$(date +%Y%m%d).db

# 定时备份（cron）
0 2 * * * cp /path/to/data/resume-analyzer.db /path/to/backups/backup-$(date +\%Y\%m\%d).db
```

#### PostgreSQL 备份
```bash
pg_dump $DATABASE_URL > backup.sql
```

---

## 环境变量配置

### 生产环境必需变量

```env
# AI API
OPENAI_API_KEY=sk-xxx
OPENAI_MODEL=gpt-4-turbo-preview

# 应用
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# 数据库
DATABASE_PATH=./data/resume-analyzer.db
# 或 DATABASE_URL=postgresql://...

# 安全（可选）
API_SECRET_KEY=your-secret-key
```

### 环境变量优先级

1. 系统环境变量
2. `.env.local` 文件
3. `.env.production` 文件
4. `.env` 文件

**注意**: 不要将 `.env.local` 提交到 Git！

---

## 生产环境优化

### 性能优化

1. **启用 Next.js 缓存**
```javascript
// next.config.js
module.exports = {
  swcMinify: true,
  compress: true,
  images: {
    domains: ['yourdomain.com'],
    formats: ['image/webp'],
  },
  experimental: {
    optimizeCss: true,
  },
}
```

2. **启用 Gzip 压缩**（Nginx）
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

3. **配置 CDN**
- 使用 Cloudflare 或其他 CDN
- 缓存静态资源和图片

### 安全加固

1. **环境变量保护**
```bash
chmod 600 .env.local
```

2. **限制文件上传**
- 验证文件类型
- 限制文件大小
- 扫描病毒（ClamAV）

3. **Rate Limiting**
```typescript
// middleware.ts
import { rateLimit } from './lib/rateLimit';

export async function middleware(request: NextRequest) {
  const identifier = request.ip || 'anonymous';
  const result = await rateLimit(identifier);
  
  if (!result.success) {
    return new Response('Too many requests', { status: 429 });
  }
}
```

4. **HTTPS 强制**
```nginx
# Nginx 配置已包含 HTTPS 重定向
```

### 监控和日志

1. **应用监控**
- 使用 Sentry 监控错误
- 使用 LogRocket 记录用户会话

2. **性能监控**
- 使用 Vercel Analytics
- 使用 Google Analytics

3. **日志管理**
```typescript
// 配置远程日志
configureLogger({
  level: LogLevel.INFO,
  enableRemote: true,
  remoteEndpoint: 'https://your-log-service.com/api/logs',
});
```

---

## 故障排查

### 常见问题

#### 1. 数据库连接失败
```
Error: unable to open database file
```

**解决方案**:
- 检查数据库文件路径
- 确保目录有写权限
- 运行 `npm run db:push` 初始化数据库

#### 2. AI API 调用失败
```
Error: OpenAI API key is invalid
```

**解决方案**:
- 检查 `OPENAI_API_KEY` 环境变量
- 验证 API 密钥有效性
- 检查 API 配额

#### 3. 文件上传失败
```
Error: ENOENT: no such file or directory
```

**解决方案**:
- 确保 `public/uploads` 目录存在
- 检查目录权限
- Vercel 部署需要使用云存储

#### 4. SSE 连接断开
```
EventSource failed: Connection closed
```

**解决方案**:
- 检查 Nginx 配置（`proxy_buffering off`）
- 增加超时时间（`proxy_read_timeout`）
- 确保防火墙允许长连接

#### 5. 内存不足
```
Error: JavaScript heap out of memory
```

**解决方案**:
```bash
# 增加 Node.js 内存限制
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

### 日志查看

#### PM2
```bash
pm2 logs resume-analyzer --lines 100
```

#### systemd
```bash
sudo journalctl -u resume-analyzer -n 100 -f
```

#### Docker
```bash
docker-compose logs -f --tail=100
```

### 健康检查

创建健康检查端点 `app/api/health/route.ts`：

```typescript
export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
```

---

## 总结

### 推荐部署方案

| 场景 | 推荐方案 | 理由 |
|------|---------|------|
| 快速原型 | Vercel | 零配置、自动部署 |
| 企业内部 | Docker | 隔离环境、易于管理 |
| 大型项目 | 自托管 + PM2 | 完全控制、性能最优 |

### 部署检查清单

- [ ] 环境变量配置完整
- [ ] 数据库初始化完成
- [ ] 文件上传目录权限正确
- [ ] AI API 密钥有效
- [ ] HTTPS 配置完成（生产环境）
- [ ] 备份策略实施
- [ ] 监控和日志配置
- [ ] 错误处理测试
- [ ] 性能测试通过
- [ ] 安全审计完成

---

如有问题，请参考 [README.md](./README.md) 或创建 Issue。
