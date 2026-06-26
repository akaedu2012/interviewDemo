# Interview Demo - AI 简历分析系统

基于 Next.js 14 + TypeScript + DeepSeek AI 的智能简历筛选系统。

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，添加你的 DEEPSEEK_API_KEY

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### Vercel 部署

1. 部署项目到 Vercel
2. 配置环境变量（重要！）
3. 运行诊断检查

## ⚙️ 环境变量配置

### 必需配置

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `DEEPSEEK_API_KEY` | DeepSeek AI API 密钥 | `sk-xxxx...` |

### 可选配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DEEPSEEK_API_BASE_URL` | API 基础地址 | `https://api.deepseek.com/v1` |

## 🔧 Vercel 部署故障排除

### 第一步：运行诊断

部署完成后，访问：
```
https://your-app.vercel.app/diagnostic
```

或者访问诊断 API：
```
https://your-app.vercel.app/api/debug/env
```

### 常见问题

#### 1. 简历上传后 AI 提取失败

**症状：**
- EventSource MIME type 错误
- "UNKNOWN_ERROR" 提示

**原因：**
- 环境变量未配置或未生效

**解决：**
1. Vercel Dashboard → Settings → Environment Variables
2. 添加 `DEEPSEEK_API_KEY`
3. 确保勾选 **Production** 和 **Preview** 环境
4. **重新部署**（关键！）

```bash
git commit --allow-empty -m "chore: redeploy"
git push origin main
```

#### 2. API Key 配置了但不生效

**症状：**
- 诊断 API 显示 `exists: false`
- Dashboard 能看到配置

**解决：**
- 环境变量修改后必须重新部署
- 检查是否勾选了正确的环境（Production/Preview）

#### 3. Vercel 函数超时

**症状：**
- FUNCTION_INVOCATION_TIMEOUT 错误
- 提取过程中断

**解决：**
- 已优化为并行提取（2-4秒完成）
- 免费账户限制 10 秒，正常情况不会超时

## 📚 详细文档

- [快速诊断指南](./QUICK_DIAGNOSTIC.md) - 快速排查 Vercel 部署问题
- [详细调试文档](./VERCEL_DEPLOYMENT_DEBUG.md) - 深入的故障排除指南

## 🛠 技术栈

- **前端**: Next.js 14, React, TypeScript, TailwindCSS
- **后端**: Next.js API Routes, Node.js
- **数据库**: SQLite + Drizzle ORM
- **AI**: DeepSeek API (兼容 OpenAI SDK)
- **部署**: Vercel

## 📦 主要功能

1. **简历上传**
   - 支持 PDF 格式
   - 文件大小限制 5MB
   - 自动文本提取

2. **AI 智能提取**
   - 基本信息（姓名、电话、邮箱、城市）
   - 教育背景
   - 工作经历
   - 技能标签

3. **候选人管理**
   - 候选人列表
   - 筛选和排序
   - 详情查看

4. **职位匹配**
   - AI 职位匹配分析
   - 匹配度评分
   - 推荐理由

## 🔒 安全说明

- 永远不要在代码中硬编码 API Key
- 使用环境变量管理敏感信息
- `.env.local` 文件已在 `.gitignore` 中忽略
- Vercel 环境变量通过 Dashboard 配置，不会暴露在代码中

## 📝 开发规范

- 所有代码和注释使用中文
- 遵循 TypeScript 严格模式
- 使用 ESLint 和 Prettier 格式化代码

## 🆘 获取帮助

如果遇到问题：

1. 查看 [快速诊断指南](./QUICK_DIAGNOSTIC.md)
2. 运行诊断工具：https://your-app.vercel.app/diagnostic
3. 查看 Vercel Functions 日志
4. 提供完整的错误信息和诊断结果

## 📄 License

MIT
