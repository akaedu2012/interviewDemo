# Vercel 构建问题排查指南

## 🐛 当前问题

**错误信息**:
```
Attempted import error: 'jobs' is not exported from '@/db/schema'
Attempted import error: 'resumes' is not exported from '@/db/schema'
```

## ✅ 已完成的修复

### 提交记录
- **Commit**: `e34ef9e` - 修复构建错误：更正数据库表名引用
- **时间**: 2026-06-25 16:44:58
- **状态**: ✅ 已推送到 GitHub

### 修复内容
1. ✅ 修复 `app/api/metrics/route.ts`
   - 将 `jobs` 改为 `jobDescriptions`
   - 移除 `resumes`，改用 `candidates` 表统计简历

2. ✅ 修复 `lib/db-health.ts`
   - 更新表名检查列表

## 🔍 Vercel 仍然报错的可能原因

### 原因1: Vercel 缓存问题（最常见）
Vercel 可能使用了旧的构建缓存。

### 原因2: 部署分支不正确
Vercel 可能没有部署 `main` 分支的最新提交。

### 原因3: 自动部署未触发
GitHub 到 Vercel 的 webhook 可能有延迟。

## 🔧 解决方案

### 方案1: 在 Vercel Dashboard 清除缓存并重新部署（推荐）

#### 步骤：

1. **登录 Vercel Dashboard**
   - 访问：https://vercel.com/dashboard
   - 找到你的项目

2. **进入项目设置**
   - 点击项目名称
   - 点击顶部的 "Settings" 标签

3. **清除缓存**
   - 滚动到底部
   - 找到 "Clear Cache" 或 "Build Cache" 部分
   - 点击 "Clear Cache" 按钮

4. **手动触发重新部署**
   - 返回项目首页
   - 点击 "Deployments" 标签
   - 找到最新的部署（应该是 commit `93e67ad`）
   - 如果没有看到，点击 "Redeploy" 按钮
   - 或者点击 "..." → "Redeploy"

5. **确认使用最新代码**
   - 在部署页面，查看 "Source" 部分
   - 确认 Git Commit 是 `93e67ad` 或 `e34ef9e`
   - 确认分支是 `main`

### 方案2: 检查并修复 Git 集成

1. **进入项目设置**
   - Vercel Dashboard → 你的项目 → Settings

2. **检查 Git 配置**
   - 点击左侧 "Git"
   - 确认：
     - Repository: `akaedu2012/interviewDemo` ✓
     - Branch: `main` ✓
     - Production Branch: `main` ✓

3. **重新连接 Git（如果需要）**
   - 点击 "Disconnect" 按钮
   - 重新连接 GitHub 仓库
   - 选择 `akaedu2012/interviewDemo`
   - 选择 `main` 分支

### 方案3: 通过 Vercel CLI 强制部署

```bash
# 1. 安装 Vercel CLI（如果还没安装）
npm install -g vercel

# 2. 登录
vercel login

# 3. 链接项目
vercel link

# 4. 强制重新部署（忽略缓存）
vercel --prod --force
```

### 方案4: 创建一个新的 Commit 触发部署

如果以上方法都不行，创建一个空提交来触发新的部署：

```bash
# 1. 创建空提交
git commit --allow-empty -m "触发 Vercel 重新部署"

# 2. 推送
git push origin main

# 3. 在 Vercel Dashboard 检查新的部署
```

## 📋 验证清单

部署完成后，检查以下内容：

### 1. 在 Vercel Dashboard
- [ ] 部署状态显示 "Ready"（绿色）
- [ ] Git Commit SHA 是 `93e67ad` 或更新
- [ ] 构建日志中没有错误
- [ ] 构建日志显示正确的导入：
  ```
  import { candidates, jobDescriptions } from "@/db/schema";
  ```

### 2. 访问部署的应用
- [ ] 主页可以访问：`https://your-app.vercel.app`
- [ ] 健康检查正常：`https://your-app.vercel.app/api/health`
- [ ] 指标端点正常：`https://your-app.vercel.app/api/metrics`

### 3. 测试 API 响应
```bash
# 健康检查
curl https://your-app.vercel.app/api/health

# 应该返回类似：
{
  "status": "healthy",
  "database": {
    "status": "healthy",
    "schema": {
      "valid": true,
      "tables": ["candidates", "education", "experience", "skills", "job_descriptions"],
      "missing": []
    }
  }
}

# 性能指标
curl https://your-app.vercel.app/api/metrics

# 应该返回候选人、岗位、简历的统计数据
```

## 🔍 查看构建日志

如果部署失败，查看详细日志：

1. **进入部署页面**
   - Vercel Dashboard → 项目 → Deployments
   - 点击失败的部署

2. **查看构建日志**
   - 点击 "Building" 步骤
   - 查找错误信息
   - 特别注意：
     - TypeScript 编译错误
     - 模块导入错误
     - 环境变量问题

3. **查看运行时日志（如果构建成功但运行失败）**
   - 点击 "Functions" 标签
   - 查看函数执行日志

## 🆘 如果仍然失败

### 检查代码是否真的更新了

在 Vercel 构建日志中搜索：
```
app/api/metrics/route.ts
```

查看导入语句是否是：
```typescript
import { candidates, jobDescriptions } from "@/db/schema";
```

如果仍然是旧的：
```typescript
import { candidates, jobs, resumes } from "@/db/schema";  // ❌ 错误
```

说明 Vercel 没有拉取到最新代码，使用**方案2**重新连接 Git。

### 确认 GitHub 上的代码

访问：https://github.com/akaedu2012/interviewDemo/blob/main/app/api/metrics/route.ts

检查第3行是否是：
```typescript
import { candidates, jobDescriptions } from "@/db/schema";
```

如果是，但 Vercel 仍然报错，说明是 Vercel 的缓存或同步问题。

## 💡 快速解决步骤

如果你想快速解决，按以下顺序尝试：

1. ✅ **最快**: Vercel Dashboard → Deployments → 最新部署 → Redeploy
2. ✅ **有效**: Settings → 找到 Cache 设置 → Clear Cache → Redeploy
3. ✅ **彻底**: Settings → Git → Disconnect → 重新连接 → Deploy
4. ✅ **终极**: 使用 Vercel CLI 强制部署：`vercel --prod --force`

## 📞 获取帮助

如果问题仍然存在：

1. **查看 Vercel 状态页**
   - https://www.vercel-status.com
   - 确认 Vercel 服务正常

2. **联系 Vercel 支持**
   - https://vercel.com/support
   - 提供部署日志和错误信息

3. **查看 Vercel 文档**
   - https://vercel.com/docs
   - 搜索 "build cache" 或 "deployment issues"

## 📝 预期的正确构建日志

成功的构建日志应该包含：

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Route (app)                              Size
┌ ○ /                                   X kB
├ ○ /api/health                         X kB
├ ○ /api/metrics                        X kB
...

○  (Static)  prerendered as static content
```

**不应该出现**：
```
❌ Attempted import error: 'jobs' is not exported
❌ Attempted import error: 'resumes' is not exported
```

---

## ✅ 确认修复成功

当你看到以下情况，说明问题已解决：

1. ✅ 构建状态：Ready（绿色）
2. ✅ 没有 TypeScript 错误
3. ✅ `/api/health` 返回 `"status": "healthy"`
4. ✅ `/api/metrics` 返回数据
5. ✅ 主页正常显示

---

**最后提交**: `93e67ad` - 添加构建ID文件以强制Vercel重新构建

**下一步**: 在 Vercel Dashboard 中清除缓存并重新部署 🚀
