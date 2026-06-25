# Vercel 部署快速开始 🚀

## 5分钟完成部署

### 步骤 1: 访问 Vercel (1分钟)
访问：https://vercel.com/new

点击 **"Import Git Repository"**

### 步骤 2: 选择仓库 (30秒)
1. 连接 GitHub 账号
2. 搜索并选择：`akaedu2012/interviewDemo`
3. 点击 **"Import"**

### 步骤 3: 配置环境变量 (2分钟) ⚠️ 必需
点击 **"Environment Variables"**，添加：

```bash
# 变量1 - DeepSeek API Key
DEEPSEEK_API_KEY = sk-你的实际密钥

# 变量2 - API Base URL
DEEPSEEK_API_BASE_URL = https://api.deepseek.com
```

**所有环境都勾选**：
- ✅ Production
- ✅ Preview  
- ✅ Development

**如何获取 API Key?**
访问：https://platform.deepseek.com/api_keys

### 步骤 4: 部署 (2-3分钟)
点击 **"Deploy"** 按钮

等待构建完成，会看到：
```
✓ Building...
✓ Deploying...
✓ Ready
```

### 步骤 5: 访问应用 (10秒)
点击 **"Visit"** 按钮或访问生成的URL

例如：`https://interview-demo-xxx.vercel.app`

---

## ✅ 完成！

你的 AI 简历分析系统已经部署成功！

### 测试功能
- 📄 上传 PDF 简历
- 🤖 AI 自动解析和评分
- 🔍 搜索和筛选候选人
- 📊 查看匹配度和评分可视化
- 🎨 享受科技感 UI

### ⚠️ 重要提醒

- **数据不持久化**: SQLite 在 `/tmp` 目录，冷启动后数据会丢失
- **冷启动**: 长时间无访问后首次打开需要 5-10 秒
- **仅供演示**: 不适合生产环境存储真实数据
- **减少冷启动**: 推荐使用 [UptimeRobot](https://uptimerobot.com)（免费）每5分钟自动访问，详见 [VERCEL_CRON_GUIDE.md](./VERCEL_CRON_GUIDE.md)

---

## 🔧 遇到问题？

### 构建失败？
检查环境变量是否正确设置

### API 调用失败？
确认 DeepSeek API Key 有效且有余额

### 页面空白？
查看 Vercel Deployment Logs 中的错误信息

---

## 📚 详细文档
查看完整部署指南：
- `VERCEL_DEPLOYMENT.md` - 详细部署文档
- `VERCEL_DEPLOYMENT_CHECKLIST.md` - 部署检查清单

---

**祝部署顺利！** 🎉
