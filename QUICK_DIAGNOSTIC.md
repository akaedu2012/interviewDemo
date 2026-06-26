# 🚨 Vercel 部署快速诊断

## 第一步：立即检查（必做！）

### 1️⃣ 访问诊断 API

等待 Vercel 部署完成（约 1-2 分钟），然后访问：

```
https://interview-demo-25d1.vercel.app/api/debug/env
```

**期望结果：**
```json
{
  "success": true,
  "diagnostics": {
    "checks": {
      "deepseekApiKey": {
        "exists": true,        ← 必须是 true
        "length": 50,          ← 应该大于 40
        "prefix": "sk-6bbe3e8" ← 应该匹配你的 Key
      }
    }
  }
}
```

### ❌ 如果 `exists: false` 或 `length: 0`

**这就是根本原因！** 环境变量未正确加载。

**立即修复：**

#### 步骤 A: 检查 Vercel Dashboard

1. 访问：https://vercel.com/akaedu2012/interview-demo-25d1/settings/environment-variables
2. 找到 `DEEPSEEK_API_KEY` 变量
3. 确认配置如下：

| 项目 | 配置 |
|------|------|
| Name | `DEEPSEEK_API_KEY` |
| Value | `YOUR_DEEPSEEK_API_KEY` |
| **Environments** | ✅ **Production** ✅ **Preview** |

**⚠️ 关键：必须勾选 Production 和 Preview！**

#### 步骤 B: 强制重新部署

环境变量修改后**必须**重新部署才能生效！

**方法 1 - 使用 Git（推荐）：**
```bash
git commit --allow-empty -m "chore: 触发 Vercel 重新部署"
git push origin main
```

**方法 2 - Vercel Dashboard：**
1. 进入项目 Deployments 页面
2. 找到最新部署，点击右侧的 "..." 菜单
3. 选择 "Redeploy"
4. 确认 "Redeploy with existing Build Cache"

#### 步骤 C: 再次验证

等待重新部署完成后，再次访问：
```
https://interview-demo-25d1.vercel.app/api/debug/env
```

确认 `exists: true` 和正确的 `length`。

---

## 第二步：测试上传功能

诊断 API 显示 `exists: true` 后，测试上传：

1. 访问：https://interview-demo-25d1.vercel.app/upload
2. 上传测试简历
3. 观察进度条

### ✅ 期望结果

进度条依次显示：
- 上传中 → 完成
- AI 提取中 - 基本信息（400ms）
- AI 提取中 - 教育背景（400ms）
- AI 提取中 - 工作经历（400ms）
- AI 提取中 - 技能标签（立即）
- 完成 ✓

### ❌ 如果仍然失败

打开浏览器开发者工具：

1. **F12** 打开开发者工具
2. 切换到 **Console** 标签
3. 查看错误信息
4. 切换到 **Network** 标签
5. 找到 SSE 请求（类型为 `eventsource`）
6. 查看 **Response** 标签内容

**截图以下内容并提供：**
- Console 中的完整错误信息
- Network 中 SSE 请求的 Response 内容
- Network 中 SSE 请求的 Headers 信息

---

## 第三步：查看 Vercel 函数日志

如果上传失败，查看服务端日志：

1. 访问：https://vercel.com/akaedu2012/interview-demo-25d1/deployments
2. 点击最新的 **Deployment**
3. 点击 **Functions** 标签
4. 找到 `app/api/resumes/[fileId]/extract.func`
5. 点击查看日志

**搜索关键词：**
```
[Extract SSE] API Key 检查
```

**期望日志：**
```
[Extract SSE] API Key 检查: 存在 (长度: 50)
[Extract SSE] 开始 AI 提取
[Extract SSE] AI 提取成功
```

**错误日志：**
```
[Extract SSE] DEEPSEEK_API_KEY 未配置
```

---

## 常见问题速查

### Q1: 诊断 API 返回 `exists: false`

**A**: 环境变量未配置或未应用到正确的环境。

**解决：**
1. Vercel Dashboard → Environment Variables
2. 确保勾选 **Production** 和 **Preview**
3. 点击 Save
4. **重新部署**（这是关键！）

### Q2: 诊断 API 返回 `exists: true`，但上传仍失败

**A**: API Key 可能无效或被限流。

**解决：**
1. 使用 curl 测试 API Key：
```bash
curl https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_DEEPSEEK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"hi"}]}'
```

2. 如果返回错误，API Key 可能失效，需要重新生成

### Q3: 日志显示 "AI API 请求频率超限"

**A**: DeepSeek 限流（30 RPM）。

**解决：**
1. 等待 1 分钟后重试
2. 或升级 DeepSeek 账户

### Q4: 本地开发正常，Vercel 失败

**A**: 环境差异问题。

**解决：**
1. 检查 Vercel 环境变量是否完整
2. 查看 Vercel 函数日志定位具体错误
3. 使用诊断 API 对比配置

---

## 📊 诊断流程图

```
开始
 ↓
访问 /api/debug/env
 ↓
exists: true? ────→ NO → 配置环境变量 → 重新部署 → 重试
 ↓ YES
上传简历测试
 ↓
成功? ────→ YES → ✅ 问题解决
 ↓ NO
查看浏览器 Console 错误
 ↓
查看 Vercel Functions 日志
 ↓
根据错误类型处理：
 ├─ API_KEY_MISSING → 重新配置环境变量
 ├─ AI_API_ERROR → 测试 API Key 有效性
 ├─ RATE_LIMIT → 等待或升级账户
 └─ 其他错误 → 提供完整日志寻求帮助
```

---

## 🎯 最关键的检查点

**90% 的问题都是这个原因：**

1. ✅ Vercel 环境变量已配置
2. ❌ **但环境变量修改后没有重新部署！**

**记住：环境变量的任何修改都需要重新部署才能生效！**

```bash
# 最简单的重新部署方法
git commit --allow-empty -m "chore: redeploy"
git push origin main
```

---

## 📞 需要帮助？

如果以上步骤都无法解决，请提供：

1. `/api/debug/env` 的完整 JSON 响应
2. Vercel Dashboard 中环境变量配置的截图
3. 浏览器 Console 的完整错误
4. Vercel Functions 日志的截图

**当前时间：** 部署正在进行中，预计 1-2 分钟完成

**第一件事：** 等待部署完成后，立即访问 `/api/debug/env` ！
