# 🚀 立即部署到 Vercel

## 三步完成部署

### 第 1 步：导入项目（30秒）

1. 访问：https://vercel.com/new
2. 选择 GitHub 仓库：`akaedu2012/interviewDemo`
3. 点击 **Import**

### 第 2 步：配置环境变量（1分钟）⚠️

在 Environment Variables 区域添加：

```
DEEPSEEK_API_KEY = sk-你的密钥
DEEPSEEK_API_BASE_URL = https://api.deepseek.com
```

**✅ 所有环境都勾选**（Production + Preview + Development）

> 获取 API Key：https://platform.deepseek.com/api_keys

### 第 3 步：部署（2分钟）

点击 **Deploy** 按钮，等待构建完成

---

## 部署完成后测试

访问你的应用 URL（例如：`https://interview-demo-xxx.vercel.app`）

### 快速测试清单

- [ ] 主页正常显示
- [ ] 健康检查：`/api/health`
- [ ] 性能指标：`/api/metrics`
- [ ] 候选人列表正常显示

### 使用验证脚本（可选）

```bash
npx ts-node scripts/verify-deployment.ts https://your-app.vercel.app
```

---

## ⚠️ 重要提醒

- **数据不持久化**：SQLite 数据在冷启动后丢失
- **每 10 分钟自动健康检查**：减少冷启动次数
- **仅供演示使用**：不适合生产环境

---

## 📊 新增功能

### 1. 健康检查 API
```bash
GET /api/health
```
返回：
- 数据库状态
- 环境变量验证
- 系统运行时间
- 响应时间

### 2. 性能指标 API
```bash
GET /api/metrics
```
返回：
- 候选人统计
- 岗位统计
- 数据库大小
- 系统内存使用

### 3. 自动保活
- Vercel Cron：每 10 分钟调用健康检查
- 减少冷启动，保持数据库连接

### 4. 错误处理
- 统一错误响应格式
- 结构化日志记录
- API 请求计时

---

## 🔧 故障排查

### 构建失败
- 检查环境变量是否设置
- 查看 Build Logs

### API 调用失败
- 验证 `DEEPSEEK_API_KEY` 是否正确
- 检查 API 余额

### 数据库错误
- 查看 Runtime Logs
- 验证表是否已创建

---

## 📚 详细文档

- `VERCEL_QUICKSTART.md` - 快速开始（5分钟）
- `VERCEL_DEPLOYMENT.md` - 完整部署指南
- `VERCEL_DEPLOYMENT_CHECKLIST.md` - 详细检查清单

---

**准备好了吗？点击下面的链接开始部署：**

👉 https://vercel.com/new

**祝部署成功！** 🎉
