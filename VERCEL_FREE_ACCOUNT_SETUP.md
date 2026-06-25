# Vercel 免费账户部署设置指南

## 🎯 快速总结

本项目已针对 Vercel **Hobby（免费）账户**进行优化配置。

### ✅ 已完成的优化

1. **移除了高频 Cron Jobs** - 免费账户不支持
2. **提供了4种替代方案** - 减少冷启动
3. **推荐使用 UptimeRobot** - 免费且效果最佳

---

## 🚀 快速部署（3步）

### 第1步：部署到 Vercel
访问：https://vercel.com/new

1. 选择仓库：`akaedu2012/interviewDemo`
2. 配置环境变量：
   ```
   DEEPSEEK_API_KEY = sk-你的密钥
   DEEPSEEK_API_BASE_URL = https://api.deepseek.com
   ```
3. 点击 **Deploy**

### 第2步：设置 UptimeRobot（可选但推荐）

**为什么需要？** 减少冷启动，保持应用响应快速。

1. 访问：https://uptimerobot.com/signup/
2. 注册免费账号
3. 添加监控：
   - Monitor Type: `HTTP(s)`
   - URL: `https://your-app.vercel.app/api/health`
   - Monitoring Interval: `5 minutes`
4. 点击 "Create Monitor"

### 第3步：测试
访问你的应用：`https://your-app.vercel.app`

---

## 💡 关于 Cron Jobs 的说明

### 问题
部署时可能看到此警告：
```
Hobby accounts are limited to daily cron jobs.
This cron expression (*/10 * * * *) would run more than once per day.
```

### 解决方案
✅ **已修复** - 我们已移除 `vercel.json` 中的高频 Cron 配置。

### 替代方案

| 方案 | 成本 | 效果 | 推荐度 |
|------|------|------|--------|
| 1. 接受冷启动 | 免费 | 首次访问5-10秒 | ⭐⭐ |
| 2. 每天1次Cron | 免费 | 轻微改善 | ⭐⭐ |
| 3. **UptimeRobot** | **免费** | **立即响应** | ⭐⭐⭐⭐⭐ |
| 4. 升级Pro | $20/月 | 最佳 | ⭐⭐⭐⭐ |

**推荐：方案3 - UptimeRobot**
- 完全免费
- 5分钟检查间隔
- 自动邮件告警
- 设置仅需2分钟

---

## 📊 使用 UptimeRobot 的效果

### 不使用监控
```
用户访问 → 冷启动(5-10秒) → 响应 ❌
```

### 使用 UptimeRobot（推荐）
```
用户访问 → 立即响应(<1秒) ✅
```

---

## 🔧 详细配置说明

### 如果你想配置每天一次的 Cron

编辑 `vercel.json`，添加：

```json
{
  "crons": [
    {
      "path": "/api/health",
      "schedule": "0 12 * * *"
    }
  ]
}
```

然后重新部署。

**注意**：每天一次的频率太低，效果有限。

### 如果你升级到 Pro 计划

可以配置高频 Cron：

```json
{
  "crons": [
    {
      "path": "/api/health",
      "schedule": "*/5 * * * *"  // 每5分钟
    }
  ]
}
```

---

## 📚 完整文档

- **VERCEL_CRON_GUIDE.md** - Cron Jobs 完整指南（推荐阅读）
- **VERCEL_QUICKSTART.md** - 5分钟快速部署
- **VERCEL_DEPLOYMENT.md** - 详细部署文档

---

## ❓ 常见问题

### Q: 为什么不默认配置每天一次的 Cron？
A: 每天一次无法有效减少冷启动。使用 UptimeRobot（5分钟间隔）效果更好且完全免费。

### Q: UptimeRobot 是否安全？
A: 是的，UptimeRobot 是业界知名的正常运行时间监控服务，全球超过100万用户使用。

### Q: UptimeRobot 会消耗我的 Vercel 配额吗？
A: 会消耗少量（每5分钟一次请求），但免费账户配额远远足够：
- 带宽：100GB/月（UptimeRobot消耗 < 1MB/月）
- 函数执行：100GB-Hours/月（完全足够）

### Q: 数据还是会丢失吗？
A: 是的。UptimeRobot 只能减少冷启动，无法解决数据持久化问题。要解决此问题需要：
- 迁移到云数据库（PostgreSQL/MySQL）
- 或接受数据仅用于演示

### Q: 升级 Pro 计划值得吗？
A: 
- **演示/个人项目**: 不需要，免费 + UptimeRobot 足够
- **生产环境**: 值得，配合云数据库使用

---

## 🎉 部署成功后

### 测试清单
- [ ] 访问主页正常
- [ ] `/api/health` 返回 "healthy"
- [ ] 候选人列表显示正常
- [ ] 上传页面工作正常

### 设置 UptimeRobot（推荐）
- [ ] 注册账号
- [ ] 添加监控
- [ ] 测试监控是否正常工作

### 验证监控效果
- 10分钟后访问应用，应该立即响应（无冷启动）✅

---

## 🚀 下一步

1. ✅ 部署到 Vercel
2. ✅ 设置 UptimeRobot
3. 📝 测试所有功能
4. 🎨 享受你的 AI 简历分析系统！

---

**祝部署成功！** 🎊

如有问题，请查看 [VERCEL_CRON_GUIDE.md](./VERCEL_CRON_GUIDE.md) 获取更多详细信息。
