# Vercel 部署问题详细调试指南

## 🔍 问题现象

上传简历后出现错误：
```
EventSource's response has a MIME type ("text/html") that is not "text/event-stream"
Extraction error: 提取过程中发生错误 UNKNOWN_ERROR
```

## 🎯 问题根因

**SSE API 返回了 HTML 错误页面而不是事件流**，这通常意味着：

1. ❌ API 路由抛出了未捕获的异常
2. ❌ DEEPSEEK_API_KEY 环境变量配置错误
3. ❌ AI API 调用失败但错误处理不完善

## 📋 详细排查步骤

### 步骤 1: 验证环境变量配置

#### 1.1 检查 Vercel 环境变量

访问调试 API 确认配置：
```
https://your-app.vercel.app/api/debug/env
```

**期望结果：**
```json
{
  "checks": {
    "deepseekApiKey": {
      "exists": true,
      "length": 50,
      "prefix": "sk-6bbe3e8"
    }
  }
}
```

#### 1.2 Vercel Dashboard 检查清单

1. 访问：https://vercel.com/your-username/interview-demo-25d1/settings/environment-variables
2. 确认以下配置：

| 变量名 | 值前缀 | 环境 | 状态 |
|--------|--------|------|------|
| `DEEPSEEK_API_KEY` | `sk-6bbe3e8...` | Production, Preview | ✅ |
| `DEEPSEEK_API_BASE_URL` | `https://api.deepseek.com/v1` | Production, Preview | ⚠️ 可选 |

**⚠️ 重要：环境变量修改后需要重新部署！**

#### 1.3 触发重新部署

环境变量更改后必须重新部署：

**方法 1 - Vercel Dashboard：**
1. 进入 Deployments 页面
2. 找到最新的部署
3. 点击 "Redeploy" → "Redeploy with existing Build Cache"

**方法 2 - Git Push：**
```bash
git commit --allow-empty -m "chore: 触发 Vercel 重新部署"
git push origin main
```

### 步骤 2: 查看 Vercel 运行时日志

#### 2.1 访问实时日志

1. 进入 Vercel Dashboard
2. 选择项目 → Deployments → 最新部署
3. 点击 "Functions" 标签页
4. 找到 `app/api/resumes/[fileId]/extract/route.ts`
5. 点击查看实时日志

#### 2.2 关键日志标记

搜索以下日志关键词：

```bash
# API Key 检查
[Extract SSE] API Key 检查

# 文件上传
[Extract SSE] 文件存在

# PDF 解析
[Extract SSE] PDF 解析成功

# AI 提取
[Extract SSE] 开始 AI 提取
[Extract SSE] AI 提取成功

# 错误信息
[Extract SSE] 处理过程中发生错误
```

#### 2.3 常见错误模式

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `DEEPSEEK_API_KEY 未配置` | 环境变量未设置 | 在 Vercel 配置环境变量 |
| `AI API 密钥无效或未配置` | API Key 错误 | 验证 Key 是否正确 |
| `AI API 请求频率超限` | DeepSeek 限流 | 等待或升级账户 |
| `文件不存在或无法访问` | 文件上传失败 | 检查 /tmp 目录权限 |
| `PDF 解析失败` | PDF 损坏或格式不支持 | 尝试其他 PDF 文件 |

### 步骤 3: 本地模拟 Vercel 环境测试

#### 3.1 创建 Vercel 环境变量

在本地创建 `.env.local` 文件：

```env
DEEPSEEK_API_KEY=YOUR_DEEPSEEK_API_KEY
VERCEL=1
VERCEL_ENV=production
NODE_ENV=production
```

#### 3.2 本地运行测试

```bash
# 安装依赖
npm install

# 清理缓存
npm run clean
rm -rf .next

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

#### 3.3 测试上传功能

访问：http://localhost:3000/upload

上传测试简历，观察：
1. 浏览器控制台输出
2. 终端服务器日志
3. Network 标签中的 SSE 连接

### 步骤 4: API Key 有效性测试

#### 4.1 使用 curl 测试 DeepSeek API

```bash
curl https://api.deepseek.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_DEEPSEEK_API_KEY" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }'
```

**期望结果：**
```json
{
  "choices": [{
    "message": {
      "content": "Hello! How can I..."
    }
  }]
}
```

**错误响应：**
```json
{
  "error": {
    "message": "Invalid API key",
    "type": "invalid_request_error"
  }
}
```

#### 4.2 检查 API Key 限制

DeepSeek 免费账户限制：
- ✅ 每分钟请求数：30 RPM
- ✅ 每天 tokens：无限制（但有速率限制）
- ⚠️ 并发请求：最多 5 个

### 步骤 5: 检查 Vercel 函数限制

#### 5.1 函数配置

确认 `app/api/resumes/[fileId]/extract/route.ts` 配置：

```typescript
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 10; // Vercel 免费账户最大 10 秒
```

#### 5.2 超时问题排查

如果看到 `FUNCTION_INVOCATION_TIMEOUT` 错误：

1. 检查 AI 提取是否超过 10 秒
2. 查看日志中的时间戳
3. 考虑优化 AI 调用（已实现并行提取）

#### 5.3 内存限制

Vercel 免费账户内存限制：1024 MB

检查内存使用：
```typescript
console.log('Memory:', process.memoryUsage());
```

## 🔧 快速修复方案

### 方案 A: 强制刷新环境变量

```bash
# 1. 删除现有环境变量
# 在 Vercel Dashboard 删除 DEEPSEEK_API_KEY

# 2. 重新添加环境变量
# Variable Name: DEEPSEEK_API_KEY
# Value: YOUR_DEEPSEEK_API_KEY
# Environments: Production, Preview

# 3. 触发重新部署
git commit --allow-empty -m "chore: 强制 Vercel 重新部署"
git push origin main
```

### 方案 B: 使用 Vercel CLI 检查

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 拉取环境变量
vercel env pull .env.vercel

# 检查环境变量
cat .env.vercel | grep DEEPSEEK
```

### 方案 C: 添加回退机制

如果 AI 提取失败，返回部分数据而不是完全失败：

```typescript
// 在 aiExtractor.ts 中添加
try {
  const basicInfo = await extractBasicInfo(resumeText);
  // ... 其他提取
} catch (error) {
  console.error("提取失败，返回空数据", error);
  return {
    basicInfo: { name: null, phone: null, email: null, city: null },
    education: [],
    experience: [],
    skills: { technical: [], tools: [], languages: [] }
  };
}
```

## 📊 诊断检查清单

使用以下清单逐项排查：

- [ ] **步骤 1.1**: 访问 `/api/debug/env` 确认 API Key 存在
- [ ] **步骤 1.2**: Vercel Dashboard 确认环境变量配置正确
- [ ] **步骤 1.3**: 环境变量修改后已重新部署
- [ ] **步骤 2.1**: 查看 Vercel 函数日志
- [ ] **步骤 2.2**: 日志中有 `[Extract SSE] API Key 检查: 存在`
- [ ] **步骤 4.1**: curl 测试 API Key 有效
- [ ] **步骤 4.2**: API Key 未超出速率限制

## 🎯 最可能的问题

根据错误信息 `EventSource response has MIME type "text/html"`，最可能的原因是：

### 原因 1: 环境变量未生效（90% 可能性）

**症状：**
- 环境变量已在 Dashboard 配置
- 但 API 调用时仍然读取不到
- 日志显示 `DEEPSEEK_API_KEY 未配置`

**解决：**
1. 确认环境变量应用到了正确的环境（Production/Preview）
2. **关键：修改环境变量后必须重新部署！**
3. 使用 `/api/debug/env` 验证变量已生效

### 原因 2: AI Client 初始化失败（5% 可能性）

**症状：**
- API Key 存在但 AI 调用失败
- 抛出未捕获的异常
- SSE 流返回错误 HTML

**解决：**
- 检查 `lib/aiClient.ts` 的错误处理
- 确保 baseURL 正确：`https://api.deepseek.com/v1`
- 添加更详细的错误日志

### 原因 3: Vercel 函数冷启动超时（5% 可能性）

**症状：**
- 第一次请求失败
- 后续请求成功
- 日志显示部分执行后中断

**解决：**
- 优化冷启动性能
- 添加预热请求
- 考虑升级 Vercel 账户

## 📞 需要帮助？

如果以上步骤都无法解决问题，请提供以下信息：

1. `/api/debug/env` 的完整响应
2. Vercel Functions 日志截图（最近 10 条）
3. 浏览器 Network 标签中 SSE 请求的详细信息
4. 浏览器 Console 中的完整错误堆栈

---

**更新时间：** 2024-12-27
**Vercel 项目：** interview-demo-25d1
**DeepSeek API Key：** 请从 Vercel Dashboard 环境变量中查看
