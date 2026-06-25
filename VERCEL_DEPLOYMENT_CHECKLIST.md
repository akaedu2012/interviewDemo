# Vercel 部署检查清单 ✅

## 第一步：准备工作 ✅
- [x] 代码已推送到 GitHub
- [x] 创建了 `vercel.json` 配置文件
- [x] 创建了 `.vercelignore` 文件
- [x] 修改了 `db/index.ts` 支持 Vercel 环境
- [x] 更新了 `package.json` 构建脚本
- [x] 创建了 `.env.example` 环境变量示例

## 第二步：Vercel Dashboard 配置 🚀

### 1. 导入项目
访问：https://vercel.com/new

1. 点击 "Import Git Repository"
2. 选择 GitHub 账号
3. 选择仓库：`akaedu2012/interviewDemo`
4. 点击 "Import"

### 2. 配置项目设置

**Framework Preset**: Next.js ✓ (自动检测)

**Build & Development Settings**:
- Build Command: `npm run build:vercel` (已在 vercel.json 配置)
- Output Directory: `.next` (已配置)
- Install Command: `npm install` (已配置)

### 3. 环境变量配置 ⚠️ 重要！

点击 "Environment Variables"，添加以下变量：

| 变量名 | 值 | 适用环境 |
|--------|-----|----------|
| `DEEPSEEK_API_KEY` | `sk-你的实际API密钥` | ✅ Production<br>✅ Preview<br>✅ Development |
| `DEEPSEEK_API_BASE_URL` | `https://api.deepseek.com` | ✅ Production<br>✅ Preview<br>✅ Development |

**获取 DeepSeek API Key**:
1. 访问：https://platform.deepseek.com/api_keys
2. 登录账号
3. 创建新的 API Key
4. 复制密钥并粘贴到 Vercel 环境变量中

### 4. 部署
点击 "Deploy" 按钮，等待构建完成（约 2-3 分钟）

## 第三步：验证部署 🧪

### 构建成功标志
- ✅ Building (约 1-2 分钟)
- ✅ Deploying
- ✅ Ready

### 部署成功后测试

访问您的应用 URL (例如：`https://interview-demo-xxx.vercel.app`)

**测试清单**:
- [ ] 主页可以访问
- [ ] 候选人列表显示正常
- [ ] 上传页面可以访问
- [ ] 岗位配置页面可以访问
- [ ] 科技风格UI显示正常（深色主题、青色边框、玻璃态效果）

**功能测试** (可选):
- [ ] 上传一个PDF简历
- [ ] 查看简历解析结果
- [ ] 配置岗位描述
- [ ] 触发AI匹配评分
- [ ] 筛选和排序候选人
- [ ] 修改候选人状态

## ⚠️ 重要提醒

### SQLite 数据不持久化
- Vercel 使用 `/tmp` 目录存储数据库
- 每次冷启动（约 10-15 分钟无请求后）数据会丢失
- **这只是演示环境，不适合生产使用**

### 冷启动时间
- 首次访问可能需要 5-10 秒（冷启动）
- 后续请求会很快（缓存）
- 长时间无请求后会再次冷启动

### 数据库自动初始化
- 构建时运行：`npm run postinstall` → `drizzle-kit push`
- 自动创建表结构和索引
- 数据库位置：`/tmp/resume-analyzer.db`

## 🔧 常见问题

### 问题1：构建失败 - 数据库错误
**错误**: `Cannot open database because the directory does not exist`

**解决**: 已修复，`db/index.ts` 会自动创建目录

### 问题2：环境变量未生效
**检查**:
1. Vercel Dashboard → 项目 → Settings → Environment Variables
2. 确认 `DEEPSEEK_API_KEY` 已添加
3. 确认变量应用到 "Production" 环境
4. 点击 Deployments → 找到最新部署 → Redeploy

### 问题3：API 调用失败
**可能原因**:
- DeepSeek API Key 无效或余额不足
- API 调用超时（>10秒）

**解决**:
1. 检查 API Key 是否正确
2. 查看 Vercel Functions 日志
3. 确认 DeepSeek 账户有余额

### 问题4：页面显示空白
**可能原因**:
- 数据库初始化失败
- 环境变量缺失

**解决**:
1. 查看 Vercel Deployment 日志
2. 确认构建成功
3. 检查 Runtime Logs 中的错误信息

## 📊 监控和日志

### 查看日志
1. Vercel Dashboard → 项目 → Deployments
2. 点击最新部署
3. 查看 "Building" 和 "Runtime Logs"

### 性能监控
1. Vercel Dashboard → 项目 → Analytics
2. 查看：
   - 请求次数
   - 响应时间
   - 错误率

## 🔄 后续更新

每次推送代码到 `main` 分支都会自动触发部署：

```bash
# 修改代码后
git add .
git commit -m "更新功能"
git push origin main

# Vercel 会自动检测并重新部署
```

## 🎯 下一步（可选）

### 如果需要生产级部署，建议：

1. **迁移到云数据库**
   - PostgreSQL (Vercel Postgres, Supabase, Neon)
   - MySQL (PlanetScale)

2. **配置自定义域名**
   - Vercel Dashboard → Settings → Domains
   - 添加你的域名并配置 DNS

3. **升级 Vercel 计划**
   - Pro 计划：$20/月
   - 更长的函数执行时间（60秒）
   - 更多内存（3GB）
   - 无限带宽

4. **添加监控**
   - Sentry (错误监控)
   - Google Analytics (用户分析)

---

## 📞 获取帮助

- **Vercel 文档**: https://vercel.com/docs
- **Next.js 文档**: https://nextjs.org/docs/deployment
- **DeepSeek API**: https://platform.deepseek.com/docs
- **项目仓库**: https://github.com/akaedu2012/interviewDemo

---

**准备好了吗？开始部署吧！** 🚀
