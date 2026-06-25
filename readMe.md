# AI 简历分析平台

一个基于 AI 的智能简历分析和候选人匹配系统，帮助招聘团队快速筛选和评估候选人。

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)

## 🌟 功能特性

### 核心功能
- **📤 智能简历上传**: 支持拖拽和批量上传 PDF 简历（最多 5 个文件）
- **🤖 AI 信息提取**: 使用 **DeepSeek 大模型**自动提取候选人信息
  - 基本信息（姓名、电话、邮箱、城市）
  - 教育背景（学校、专业、学位、毕业时间）
  - 工作经历（公司、职位、时间、职责）
  - 技能标签（技术技能、工具、编程语言）
- **📊 智能匹配评分**: AI 驱动的候选人-岗位匹配算法
  - 技能匹配评分（必备技能 + 加分技能）
  - 工作经历相关性评分
  - 教育背景适配度评分
  - 综合匹配分数（0-100）
  - AI 生成的候选人评论和建议
- **🎯 候选人管理**
  - 表格/卡片双视图切换
  - 技能标签筛选
  - 关键词搜索（姓名、技能、学校）
  - 多维度排序（分数、时间）
  - 分页浏览
- **📋 候选人详情**
  - 完整信息展示
  - 评分可视化（雷达图、柱状图）
  - PDF 简历预览
  - 状态管理（待筛选、初筛通过、面试中、已录用、已淘汰）
- **⚙️ 岗位配置**: 配置岗位描述、必备技能和加分技能
- **⚡ 实时进度**: Server-Sent Events (SSE) 实时显示 AI 提取进度

### 技术亮点
- 🔥 **全栈 TypeScript**: 类型安全的前后端代码
- 🎨 **现代 UI**: 基于 shadcn/ui + Tailwind CSS 的美观界面
- 📱 **响应式设计**: 支持桌面设备（1280px+）
- 🚀 **性能优化**: 服务器端渲染 + 客户端缓存
- 🛡️ **错误处理**: 全局错误边界 + 统一错误提示
- 📦 **SQLite 数据库**: 轻量级本地数据持久化

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 14+ (App Router)
- **语言**: TypeScript 5+
- **UI 库**: React 18+
- **样式**: Tailwind CSS + shadcn/ui
- **图表**: Recharts
- **状态管理**: React Context / URL Parameters
- **文件上传**: react-dropzone
- **表单验证**: Zod

### 后端
- **运行时**: Node.js (Next.js API Routes)
- **数据库**: SQLite + Drizzle ORM
- **AI 服务**: DeepSeek API (兼容 OpenAI SDK)
- **PDF 解析**: pdf-parse

### 开发工具
- **代码检查**: ESLint
- **代码格式化**: Prettier
- **类型检查**: TypeScript
- **包管理**: npm

## 📦 安装和运行

### 环境要求
- Node.js 18+ 
- npm 9+

### 1. 克隆项目

```bash
git clone <repository-url>
cd interviewDemo
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 文件为 `.env.local` 并填入实际配置：

```bash
cp .env.example .env.local
```

**必需配置**:
```env
# DeepSeek API 密钥（必填）
# 访问 https://platform.deepseek.com/ 获取 API Key
DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here

# 数据库路径（默认值已足够）
DATABASE_PATH=data/resume-analyzer.db

# 文件上传目录（默认值已足够）
UPLOAD_DIR=public/uploads
MAX_FILE_SIZE=10485760
```

> **注意**: 本项目使用 **DeepSeek** 大模型进行 AI 信息提取和评分分析。
> - DeepSeek API 兼容 OpenAI SDK
> - 配置已内置在 `lib/aiClient.ts` 和 `lib/constants.ts` 中
> - 只需要在 `.env.local` 中配置 `DEEPSEEK_API_KEY` 即可

### 4. 初始化数据库

```bash
# 生成数据库迁移
npm run db:generate

# 推送数据库 schema
npm run db:push
```

### 5. 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:3000 启动。

### 6. 构建生产版本

```bash
npm run build
npm start
```

## 📖 使用指南

### 1. 配置岗位信息
1. 访问 "岗位配置" 页面
2. 填写岗位标题、描述、必备技能和加分技能
3. 点击 "保存配置"

### 2. 上传简历
1. 点击 "上传简历" 按钮或访问上传页面
2. 拖拽 PDF 文件到上传区域或点击选择文件
3. 系统将自动上传并实时显示 AI 提取进度
4. 提取完成后自动跳转到候选人列表

### 3. 查看候选人列表
1. 在主页查看所有候选人
2. 使用筛选、搜索、排序功能快速定位
3. 切换表格/卡片视图
4. 点击候选人查看详情

### 4. 查看候选人详情
1. 查看完整的候选人信息
2. 查看 AI 匹配评分和评论
3. 预览原始 PDF 简历
4. 更新候选人招聘状态
5. 触发重新匹配计算（如果岗位配置有更新）

## 🗂️ 项目结构

```
interviewDemo/
├── app/                          # Next.js App Router 页面
│   ├── api/                      # API 路由
│   │   ├── candidates/           # 候选人 API
│   │   ├── jobs/                 # 岗位 API
│   │   └── resumes/              # 简历上传和提取 API
│   ├── candidates/               # 候选人详情页
│   ├── job-config/               # 岗位配置页
│   ├── upload/                   # 简历上传页
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 主页（候选人列表）
│   └── globals.css               # 全局样式
├── components/                   # React 组件
│   ├── candidates/               # 候选人相关组件
│   ├── layout/                   # 布局组件
│   ├── ui/                       # 通用 UI 组件
│   └── upload/                   # 上传组件
├── db/                           # 数据库配置
│   ├── schema.ts                 # 数据库 schema
│   ├── index.ts                  # 数据库连接
│   └── init.ts                   # 数据库初始化
├── lib/                          # 工具函数和配置
│   ├── aiClient.ts               # AI API 客户端
│   ├── apiClient.ts              # API 请求封装
│   ├── constants.ts              # 常量定义
│   ├── logger.ts                 # 日志工具
│   └── utils.ts                  # 工具函数
├── services/                     # 业务逻辑服务
│   ├── aiExtractor.ts            # AI 信息提取
│   ├── candidateManager.ts       # 候选人管理
│   ├── jobManager.ts             # 岗位管理
│   ├── jobMatcher.ts             # 匹配评分
│   ├── pdfParser.ts              # PDF 解析
│   └── resumeUpload.ts           # 文件上传
├── types/                        # TypeScript 类型定义
│   └── index.ts                  # 共享类型
├── public/                       # 静态资源
│   └── uploads/                  # 上传的简历文件
├── data/                         # 数据文件
│   └── resume-analyzer.db        # SQLite 数据库
├── .env.example                  # 环境变量示例
├── .env.local                    # 本地环境变量（不提交）
├── package.json                  # 项目依赖
├── tsconfig.json                 # TypeScript 配置
├── tailwind.config.ts            # Tailwind CSS 配置
├── next.config.js                # Next.js 配置
└── README.md                     # 项目文档
```

## 🔧 可用命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本
npm start                # 启动生产服务器

# 代码质量
npm run lint             # 运行 ESLint
npm run type-check       # TypeScript 类型检查

# 数据库
npm run db:generate      # 生成数据库迁移
npm run db:migrate       # 运行数据库迁移
npm run db:push          # 推送 schema 到数据库
npm run db:studio        # 打开 Drizzle Studio（数据库可视化工具）
```

## 🔐 环境变量说明

详细的环境变量说明请参考 [`.env.example`](./.env.example) 文件。

### 必需变量
- `OPENAI_API_KEY`: OpenAI API 密钥（或 `ANTHROPIC_API_KEY`）
- `DATABASE_PATH`: SQLite 数据库文件路径

### 可选变量
- `LOG_LEVEL`: 日志级别（DEBUG, INFO, WARN, ERROR）
- `MAX_FILE_SIZE`: 最大文件大小（字节）
- `MAX_FILES`: 最大同时上传文件数
- 更多配置请参考 `.env.example`

## 🚀 部署

### Vercel 部署（推荐）

1. Fork 本项目到你的 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量（`OPENAI_API_KEY` 等）
4. 部署！

**注意**: Vercel 部署需要将 SQLite 迁移到 Vercel Postgres 或其他云数据库。

### Docker 部署

请参考 [DEPLOYMENT.md](./DEPLOYMENT.md) 获取 Docker 部署详细说明。

### 自托管部署

1. 构建项目：`npm run build`
2. 配置环境变量
3. 启动服务：`npm start`
4. 使用 PM2 或 systemd 管理进程

## 📊 数据库 Schema

### 主要表
- `candidates`: 候选人基本信息
- `education`: 教育背景
- `experience`: 工作经历
- `skills`: 技能标签
- `job_descriptions`: 岗位描述
- `match_scores`: 匹配评分

详细 schema 请查看 [`db/schema.ts`](./db/schema.ts)。

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📝 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](./LICENSE) 文件。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 全栈框架
- [shadcn/ui](https://ui.shadcn.com/) - 现代 UI 组件库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [OpenAI](https://openai.com/) - AI API 提供商
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM

## 📧 联系方式

如有问题或建议，请创建 Issue 或联系项目维护者。

---

**⭐ 如果这个项目对你有帮助，请给个 Star！**
