# DeepSeek 配置指南

本项目使用 **DeepSeek 大模型**进行 AI 简历信息提取和候选人评分分析。

## 📋 配置步骤

### 1. 获取 DeepSeek API Key

1. 访问 DeepSeek 官网：https://platform.deepseek.com/
2. 注册/登录账号
3. 进入 API Keys 管理页面
4. 创建新的 API Key
5. 复制生成的 API Key（格式：`sk-xxxxxxxxxxxxxxxx`）

### 2. 配置环境变量

编辑项目根目录的 `.env.local` 文件：

```env
# 将下面的 API Key 替换为您的真实 DeepSeek API Key
DEEPSEEK_API_KEY=sk-your-actual-deepseek-api-key-here
```

### 3. 验证配置

启动开发服务器：

```bash
npm run dev
```

访问 http://localhost:3000 并尝试上传一份 PDF 简历，系统将自动使用 DeepSeek 进行信息提取。

## 🔧 技术实现

### 当前配置

项目已配置为使用 DeepSeek：

**文件：`lib/constants.ts`**
```typescript
export const AI_CONFIG = {
  MODEL: "deepseek-chat",                    // DeepSeek 聊天模型
  MAX_TOKENS: 4000,                          // 最大 token 数
  TEMPERATURE: 0.1,                          // 温度参数（低温度 = 更确定性）
  API_BASE_URL: "https://api.deepseek.com/v1", // DeepSeek API 端点
}
```

**文件：`lib/aiClient.ts`**
- 使用 OpenAI SDK（DeepSeek API 完全兼容）
- 自动错误处理和重试机制
- 支持 JSON 格式响应

### DeepSeek API 特点

✅ **优势**：
- 兼容 OpenAI API 格式（无缝迁移）
- 高性价比（相比 GPT-4）
- 中文能力强
- 响应速度快

⚠️ **注意事项**：
- 需要确保网络可访问 `api.deepseek.com`
- API Key 需要有充足的额度
- 建议设置合理的并发限制

## 🧪 测试 API 连接

可以使用以下脚本测试 DeepSeek API 连接：

```bash
# 创建测试脚本
cat > test-deepseek.js << 'EOF'
import { testAIConnection } from './lib/aiClient.js';

async function test() {
  console.log('Testing DeepSeek API connection...');
  const result = await testAIConnection();
  
  if (result) {
    console.log('✅ DeepSeek API 连接成功！');
  } else {
    console.log('❌ DeepSeek API 连接失败，请检查配置。');
  }
}

test();
EOF

# 运行测试
node test-deepseek.js
```

## 🔒 安全建议

1. **不要提交 API Key 到版本控制**
   - `.env.local` 已在 `.gitignore` 中
   - 确保不要将 API Key 写入代码中

2. **使用环境变量**
   - 生产环境在服务器/平台上配置环境变量
   - 不要在前端代码中暴露 API Key

3. **监控使用量**
   - 定期检查 DeepSeek 控制台的使用统计
   - 设置用量告警

## 💰 费用说明

DeepSeek 按 token 使用量计费：

- **输入 token**：约 ¥0.001 / 1K tokens
- **输出 token**：约 ¥0.002 / 1K tokens

典型简历提取消耗：
- 单份简历文本：约 1,000 - 3,000 tokens (输入)
- AI 提取结果：约 500 - 1,500 tokens (输出)
- **平均成本**：约 ¥0.005 - ¥0.015 / 份简历

## ❓ 常见问题

### Q1: API Key 无效

**错误信息**：`AI API 密钥无效或未配置`

**解决方案**：
1. 检查 `.env.local` 中的 `DEEPSEEK_API_KEY` 是否正确
2. 确认 API Key 没有多余的空格或换行符
3. 在 DeepSeek 控制台验证 API Key 是否有效

### Q2: 连接超时

**错误信息**：`AI API 请求超时`

**解决方案**：
1. 检查网络连接是否正常
2. 确认能访问 `api.deepseek.com`
3. 如在国内，可能需要配置代理

### Q3: 频率限制

**错误信息**：`AI API 请求频率超限`

**解决方案**：
1. 等待一段时间后重试
2. 检查 DeepSeek 账户的频率限制
3. 考虑升级账户计划

### Q4: 切换回 OpenAI/Claude

如需切换到其他 AI 服务：

1. 修改 `lib/constants.ts`：
```typescript
export const AI_CONFIG = {
  MODEL: "gpt-4-turbo-preview",           // 修改为 OpenAI 模型
  API_BASE_URL: "https://api.openai.com/v1", // 修改为 OpenAI 端点
  // ...
}
```

2. 修改 `.env.local`：
```env
OPENAI_API_KEY=sk-your-openai-key-here
```

3. 修改 `lib/aiClient.ts` 中的环境变量读取：
```typescript
const apiKey = process.env.OPENAI_API_KEY; // 改为读取 OPENAI_API_KEY
```

## 📚 相关文档

- DeepSeek 官方文档：https://platform.deepseek.com/docs
- OpenAI SDK 文档：https://github.com/openai/openai-node
- 项目 README：./README.md
- 部署指南：./DEPLOYMENT.md

## 🆘 获取帮助

如遇到问题：
1. 查看 DeepSeek 官方文档
2. 检查项目 GitHub Issues
3. 查看控制台日志获取详细错误信息

---

**最后更新**：2024-01-20
**项目版本**：1.0.0
