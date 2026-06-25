# Vercel Cron Jobs 配置指南

## ⚠️ 免费账户限制

Vercel **Hobby（免费）账户**的 Cron Jobs 有以下限制：
- ✅ 每天最多运行 **1次**
- ❌ 不支持高频任务（如每10分钟）

### 为什么移除了 Cron 配置

原配置每10分钟运行一次健康检查：
```json
"crons": [
  {
    "path": "/api/health",
    "schedule": "*/10 * * * *"  // ❌ 免费账户不支持
  }
]
```

这会导致部署错误：
```
Hobby accounts are limited to daily cron jobs.
```

## ✅ 免费账户解决方案

### 方案1：接受冷启动（推荐）

**无需配置**，接受以下行为：
- 长时间无请求后会冷启动（5-10秒）
- 数据会在冷启动时丢失（SQLite在`/tmp`）
- 适合演示和测试环境

**优点**：
- 完全免费
- 无需额外配置
- 简单直接

### 方案2：每天运行一次健康检查

如果你希望保持一定的活跃度，可以配置每天一次的健康检查：

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/health",
      "schedule": "0 0 * * *"  // 每天午夜12点运行
    }
  ]
}
```

或者每天中午：
```json
{
  "crons": [
    {
      "path": "/api/health",
      "schedule": "0 12 * * *"  // 每天中午12点运行
    }
  ]
}
```

**注意**：这只能减少部分冷启动，不能完全避免。

### 方案3：使用外部监控服务（免费）

使用第三方服务定期访问你的应用：

#### 3.1 UptimeRobot（推荐）
- **网站**: https://uptimerobot.com
- **免费额度**: 50个监控器，5分钟检查间隔
- **配置**:
  1. 注册账号
  2. 添加监控：选择 "HTTP(s)"
  3. 输入 URL：`https://your-app.vercel.app/api/health`
  4. 设置检查间隔：5分钟
  5. 保存

**优点**：
- 完全免费
- 5分钟检查间隔
- 自动邮件/短信告警
- 正常运行时间统计

#### 3.2 Cron-job.org
- **网站**: https://cron-job.org
- **免费额度**: 无限任务，最快1分钟间隔
- **配置**:
  1. 注册账号
  2. 创建 Cron Job
  3. URL：`https://your-app.vercel.app/api/health`
  4. 时间表：每5分钟
  5. 保存

#### 3.3 Better Uptime
- **网站**: https://betteruptime.com
- **免费额度**: 10个监控器，30秒检查间隔
- **特点**: 更快的检查频率

### 方案4：升级到 Pro 计划

如果需要高频 Cron Jobs：

- **价格**: $20/月
- **Cron 功能**:
  - ✅ 无限制频率（最快1分钟）
  - ✅ 无限任务数
  - ✅ 自定义超时时间
- **其他优势**:
  - 函数执行时间：60秒（vs 10秒）
  - 函数内存：3008MB（vs 1024MB）
  - 无限带宽
  - 优先支持

**配置示例（Pro账户）**:
```json
{
  "crons": [
    {
      "path": "/api/health",
      "schedule": "*/5 * * * *"  // 每5分钟
    },
    {
      "path": "/api/metrics",
      "schedule": "0 * * * *"  // 每小时
    }
  ]
}
```

## 🎯 推荐方案对比

| 方案 | 成本 | 冷启动频率 | 数据持久化 | 配置难度 | 适用场景 |
|------|------|-----------|-----------|---------|---------|
| 方案1: 接受冷启动 | 免费 | 高 | ❌ | 简单 | 演示/测试 |
| 方案2: 每天1次Cron | 免费 | 高 | ❌ | 简单 | 低频演示 |
| 方案3: 外部监控 | 免费 | 低 | ❌ | 中等 | **推荐** |
| 方案4: 升级Pro | $20/月 | 很低 | ❌* | 简单 | 生产环境 |

*注：即使Pro计划，SQLite在`/tmp`仍不持久化，需迁移到云数据库

## 📝 当前配置（免费账户）

我们已经移除了 Cron 配置，采用**方案1：接受冷启动**。

如果你想使用其他方案：

### 添加每天一次的健康检查（方案2）

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

### 使用 UptimeRobot（方案3 - 推荐）

1. 访问 https://uptimerobot.com
2. 注册免费账号
3. 添加新监控：
   - Monitor Type: HTTP(s)
   - Friendly Name: Interview Demo Health
   - URL: `https://your-app.vercel.app/api/health`
   - Monitoring Interval: 5 minutes
4. 保存

这样可以实现每5分钟自动访问，保持应用活跃。

## 🔧 Cron 表达式参考

如果升级到 Pro 或使用外部服务，以下是常用的 Cron 表达式：

```bash
# 格式: 分 时 日 月 周
# *    *  *  *  *

*/5 * * * *      # 每5分钟
*/10 * * * *     # 每10分钟
*/15 * * * *     # 每15分钟
0 * * * *        # 每小时
0 */6 * * *      # 每6小时
0 0 * * *        # 每天午夜
0 12 * * *       # 每天中午12点
0 0 * * 0        # 每周日午夜
0 0 1 * *        # 每月1日午夜
```

## 💡 最佳实践

### 演示/测试环境（免费账户）
✅ **推荐方案**：外部监控服务（UptimeRobot）
- 完全免费
- 5分钟间隔足够保持活跃
- 自动邮件告警

### 生产环境
✅ **推荐方案**：
1. 升级 Vercel Pro（$20/月）
2. 迁移到云数据库（PostgreSQL/MySQL）
3. 配置高频Cron Jobs
4. 添加错误监控（Sentry）

## 📊 效果对比

### 无Cron（冷启动）
```
用户访问 → 冷启动(5-10秒) → 响应
10分钟后 → 冷启动(5-10秒) → 响应
20分钟后 → 冷启动(5-10秒) → 响应
```

### 有Cron/外部监控（5分钟间隔）
```
用户访问 → 立即响应 ✅
10分钟后 → 立即响应 ✅
20分钟后 → 立即响应 ✅
```

## 🚀 快速设置 UptimeRobot（推荐）

### 步骤1：注册
访问 https://uptimerobot.com/signup/

### 步骤2：添加监控
1. 点击 "+ Add New Monitor"
2. 填写：
   ```
   Monitor Type: HTTP(s)
   Friendly Name: Interview Demo
   URL (or IP): https://your-app.vercel.app/api/health
   Monitoring Interval: 5 minutes
   ```
3. 点击 "Create Monitor"

### 步骤3：配置告警（可选）
- 添加邮箱/短信接收告警
- 当应用宕机时自动通知

### 完成！
现在你的应用每5分钟会被自动访问，保持活跃状态。

## ❓ 常见问题

### Q: 为什么不默认配置每天一次的Cron？
A: 每天一次的频率太低，无法有效减少冷启动。外部监控服务（5分钟间隔）效果更好且完全免费。

### Q: UptimeRobot会消耗我的Vercel配额吗？
A: 会消耗少量带宽和函数调用次数，但免费账户的配额(100GB带宽/100GB-Hours函数执行)远远足够。

### Q: 数据还是会丢失吗？
A: 是的。无论使用哪种Cron方案，SQLite在`/tmp`的数据都不持久化。要解决此问题需要迁移到云数据库。

### Q: Pro计划值得吗？
A: 
- **演示/个人项目**: 不需要，使用免费外部监控即可
- **生产环境**: 值得，配合云数据库使用

## 📚 相关文档

- [Vercel Cron Jobs 文档](https://vercel.com/docs/cron-jobs)
- [UptimeRobot 使用指南](https://uptimerobot.com/blog/how-to-use-uptimerobot/)
- [Cron 表达式生成器](https://crontab.guru/)

---

**建议**：使用 UptimeRobot（方案3），完全免费且效果最佳！ ✨
