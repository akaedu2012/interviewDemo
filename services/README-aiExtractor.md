# AI信息提取服务文档

## 概述

`aiExtractor.ts` 提供了完整的简历信息AI提取功能,使用 DeepSeek AI 模型从简历文本中提取结构化信息。

## 功能模块

### 任务 4.2 - 基本信息提取

**函数**: `extractBasicInfo(resumeText: string): Promise<BasicInfo>`

从简历文本中提取候选人的基本信息。

**返回格式**:
```typescript
{
  name: string | null,     // 候选人姓名
  phone: string | null,    // 电话号码
  email: string | null,    // 邮箱地址
  city: string | null      // 所在城市
}
```

**特性**:
- 使用 `callAIForJSON` 确保返回 JSON 格式
- 字段缺失时返回 `null`
- 电话号码保留原始格式
- 只提取市级或省级城市名称

### 任务 4.3 - 教育背景提取

**函数**: `extractEducation(resumeText: string): Promise<Education[]>`

从简历文本中提取教育背景信息数组。

**返回格式**:
```typescript
[
  {
    school: string,           // 学校名称
    major: string,            // 专业名称
    degree: string,           // 学位(本科/硕士/博士/专科)
    graduationTime: string    // 毕业时间(YYYY-MM 或 YYYY)
  }
]
```

**特性**:
- 按时间倒序排列(最近的在前)
- 支持多个教育背景条目
- 无教育背景时返回空数组

### 任务 4.4 - 工作经历提取

**函数**: `extractExperience(resumeText: string): Promise<Experience[]>`

从简历文本中提取工作经历信息数组。

**返回格式**:
```typescript
[
  {
    company: string,          // 公司名称
    title: string,            // 职位名称
    startDate: string,        // 开始日期(YYYY-MM)
    endDate: string,          // 结束日期(YYYY-MM 或 "至今")
    responsibilities: string  // 工作职责简要描述(不超过200字)
  }
]
```

**特性**:
- 按时间倒序排列(最近的在前)
- 支持在职状态(endDate: "至今")
- 无工作经历时返回空数组

### 任务 4.5 - 技能标签提取

**函数**: `extractSkills(resumeText: string): Promise<Skills>`

从简历文本中提取技能信息,并进行标准化处理。

**返回格式**:
```typescript
{
  technical: string[],   // 技术能力(如: 微服务, RESTful API)
  tools: string[],       // 工具/框架(如: React, Docker, Git)
  languages: string[]    // 编程语言(如: JavaScript, Python, Java)
}
```

**特性**:
- 自动标准化技能名称(如: "javascript" → "JavaScript")
- 自动去重
- 分类清晰(技术/工具/语言)
- 支持60+种常见技术的标准化映射

**技能标准化示例**:
```typescript
"javascript", "js" → "JavaScript"
"typescript", "ts" → "TypeScript"
"reactjs", "react" → "React"
"nodejs", "node.js" → "Node.js"
"mongodb", "mongo" → "MongoDB"
"k8s" → "Kubernetes"
```

### 任务 4.6 - 流式提取功能

#### 流式提取(支持 SSE)

**函数**: `extractAll(resumeText: string): AsyncGenerator<ExtractionProgress>`

按阶段依次提取所有信息,支持 Server-Sent Events 流式传输。

**提取阶段**:
1. **basic** - 提取基本信息
2. **education** - 提取教育背景
3. **experience** - 提取工作经历
4. **skills** - 提取技能标签
5. **complete** - 提取完成

**使用示例**:
```typescript
for await (const progress of extractAll(resumeText)) {
  console.log(`阶段: ${progress.stage}`);
  console.log(`数据:`, progress.data);
  
  // 通过 SSE 发送进度给前端
  // res.write(`event: progress\n`);
  // res.write(`data: ${JSON.stringify(progress)}\n\n`);
}
```

**返回格式**:
```typescript
{
  stage: 'basic' | 'education' | 'experience' | 'skills' | 'complete',
  data: {
    basicInfo?: BasicInfo,
    education?: Education[],
    experience?: Experience[],
    skills?: Skills
  }
}
```

#### 同步提取(无流式)

**函数**: `extractAllSync(resumeText: string): Promise<ExtractedData>`

一次性提取所有信息,适用于不需要实时进度反馈的场景。

**特性**:
- 并行调用所有提取函数以提高效率
- 返回完整的提取结果
- 不支持实时进度反馈

## 错误处理

所有提取函数都包含完善的错误处理:

1. **AI API 调用失败**: 捕获并抛出友好的错误信息
2. **JSON 解析失败**: 在 `callAIForJSON` 中处理
3. **字段缺失**: 返回 `null` 或空数组
4. **网络错误**: 由 `aiClient.ts` 统一处理

## 使用示例

### 单独提取基本信息
```typescript
import { extractBasicInfo } from '@/services/aiExtractor';

const resumeText = "...简历文本...";
const basicInfo = await extractBasicInfo(resumeText);
console.log(basicInfo);
// { name: "张三", phone: "138-1234-5678", email: "zhang@example.com", city: "北京" }
```

### 流式提取(用于 SSE)
```typescript
import { extractAll } from '@/services/aiExtractor';

export async function GET(request: Request) {
  const stream = new ReadableStream({
    async start(controller) {
      for await (const progress of extractAll(resumeText)) {
        const data = `event: progress\ndata: ${JSON.stringify(progress)}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));
      }
      controller.close();
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### 同步提取
```typescript
import { extractAllSync } from '@/services/aiExtractor';

const resumeText = "...简历文本...";
const result = await extractAllSync(resumeText);
console.log(result);
// { basicInfo: {...}, education: [...], experience: [...], skills: {...} }
```

## 配置要求

### 环境变量
确保在 `.env.local` 中配置了 DeepSeek API Key:
```
DEEPSEEK_API_KEY=your-api-key-here
```

### AI 配置
AI 配置在 `lib/constants.ts` 中定义:
```typescript
export const AI_CONFIG = {
  MODEL: "deepseek-chat",
  MAX_TOKENS: 4000,
  TEMPERATURE: 0.1,
  API_BASE_URL: "https://api.deepseek.com/v1",
};
```

## 测试

运行测试脚本验证功能:
```bash
npx tsx scripts/test-ai-extractor.ts
```

**注意**: 测试需要配置有效的 `DEEPSEEK_API_KEY`。

## 技术细节

### Prompt 设计原则

1. **明确输出格式**: 在 system prompt 中指定严格的 JSON 格式
2. **规则清晰**: 明确字段缺失时的处理方式
3. **示例指导**: 提供格式示例帮助 AI 理解
4. **中文交互**: 所有 prompt 使用中文以提高准确性

### 性能优化

1. **并行提取**: `extractAllSync` 使用 `Promise.all` 并行调用
2. **Token 控制**: 根据不同任务设置合适的 `maxTokens`
3. **Temperature 设置**: 使用 0.1 保证输出稳定性

### 类型安全

所有函数都有明确的 TypeScript 类型定义,确保类型安全:
- 输入: `string` (resumeText)
- 输出: 明确的接口类型 (`BasicInfo`, `Education[]`, 等)

## 依赖的需求

- **需求 3**: AI结构化信息提取 - 基本信息
- **需求 4**: AI结构化信息提取 - 教育背景
- **需求 5**: AI结构化信息提取 - 工作经历
- **需求 6**: AI结构化信息提取 - 技能标签

## 相关文件

- `lib/aiClient.ts` - AI API 客户端封装
- `lib/constants.ts` - AI 配置常量
- `types/index.ts` - TypeScript 类型定义
- `scripts/test-ai-extractor.ts` - 测试脚本

## 未来改进

1. **缓存机制**: 对相同简历文本的提取结果进行缓存
2. **重试逻辑**: AI API 调用失败时自动重试
3. **批量提取**: 支持一次提取多份简历
4. **自定义 Prompt**: 支持用户自定义提取规则
5. **提取质量评分**: 评估提取结果的可信度
