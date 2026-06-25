# Next.js 入门教程 — 结合 AI 简历分析平台项目

> 本教程基于本项目（AI 简历分析平台）的实际代码，帮助你从零理解 Next.js 的核心概念和用法。

---

## 一、Next.js 是什么？

Next.js 是由 Vercel 开发的 **React 全栈框架**。它不是"另一个 React UI 库"，而是把 React 从一个纯前端库升级为一个**前后端一体**的解决方案。

### 为什么需要 Next.js？

| 纯 React (SPA) | Next.js |
|---|---|
| 只有客户端渲染（CSR），首屏白屏时间长 | 支持服务器端渲染（SSR），首屏秒出 |
| 没有 SEO，搜索引擎看不到页面内容 | SSR 天然对 SEO 友好 |
| 前端代码和后端 API 分属两个项目 | 前后端代码在同一个项目，共享类型和逻辑 |
| 需要手动配置路由、打包、代码分割 | 全自动路由、打包优化、代码分割 |
| 需要单独部署前端和后端 | 一键部署到 Vercel 或任何 Node 服务器 |

**一句话总结**：Next.js = React + 路由 + SSR/API + 打包优化 + 全栈能力。

---

## 二、App Router — 项目的核心路由系统

本项目使用的是 Next.js **App Router**（`app/` 目录），这是 Next.js 13+ 推荐的新路由系统，取代了旧的 Pages Router（`pages/` 目录）。

### 2.1 文件即路由

App Router 的核心哲学是**文件系统路由**——你不需要写任何路由配置代码，只要在 `app/` 目录下放文件，Next.js 就自动创建对应的 URL 路径。

看本项目的 `app/` 目录：

```
app/
├── page.tsx                  → 对应 URL: /
├── layout.tsx                → 所有页面的公共布局
├── upload/
│   └── page.tsx              → 对应 URL: /upload
├── candidates/
│   └── [id]/
│       └── page.tsx          → 对应 URL: /candidates/:id （动态路由）
├── job-config/
│   └── page.tsx              → 对应 URL: /job-config
├── api/
│   ├── resumes/upload/
│   │   └── route.ts          → 对应 API: POST /api/resumes/upload
│   ├── resumes/[fileId]/extract/
│   │   └── route.ts          → 对应 API: GET /api/resumes/:fileId/extract
│   ├── candidates/
│   │   └── route.ts          → 对应 API: GET /api/candidates
│   ├── candidates/[id]/
│   │   ├── route.ts          → 对应 API: GET /api/candidates/:id
│   │   ├── match/route.ts    → 对应 API: POST /api/candidates/:id/match
│   │   └── status/route.ts   → 对应 API: PATCH /api/candidates/:id/status
│   └── jobs/
│       ├── route.ts          → 对应 API: POST /api/jobs
│       └── active/route.ts   → 对应 API: GET /api/jobs/active
```

**规则总结**：
- `page.tsx` → 创建一个页面路由
- `layout.tsx` → 创建一个布局（嵌套包裹子页面）
- `route.ts` → 创建一个 API 路由
- `[id]` 或 `[fileId]` → 动态路由段（匹配任意值）
- `api/` 目录下的所有 `route.ts` → API 端点，不会渲染 UI

### 2.2 动态路由详解 — `candidates/[id]/page.tsx`

本项目候选人详情页使用了动态路由：

```tsx
// app/candidates/[id]/page.tsx
export default function CandidateDetailPage({
  params,           // ← Next.js 自动注入的参数！
}: {
  params: { id: string };  // id 就是 URL 中 [id] 对应的值
}) {
  // 当用户访问 /candidates/abc123 时，params.id = "abc123"
  const response = await fetch(`/api/candidates/${params.id}`);
  // ...
}
```

访问 `/candidates/abc123` → `params.id = "abc123"`
访问 `/candidates/xyz789` → `params.id = "xyz789"`

这就是 `[id]` 文件名的作用——它是一个**参数占位符**，Next.js 自动把 URL 中对应位置的值传给 `params`。

---

## 三、layout.tsx — 全局布局

每个 `layout.tsx` 会包裹同目录及子目录下的所有 `page.tsx`。本项目的根布局：

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

// ★ Metadata：不是 <title> HTML标签，而是 Next.js 的 SEO API
export const metadata: Metadata = {
  title: "AI 简历分析平台",
  description: "智能简历分析和候选人匹配系统",
};

export default function RootLayout({
  children,  // ← Next.js 自动注入当前页面内容
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={cn("font-sans", inter.variable)}>
      <body className="antialiased">
        <ErrorBoundary>
          <Layout>{children}</Layout>  // ← children 就是 page.tsx 的渲染结果
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

**关键理解**：
1. `RootLayout` 是**最顶层布局**，必须包含 `<html>` 和 `<body>`
2. `children` 是 Next.js 自动注入的——用户访问 `/` 时 children 就是 `app/page.tsx`；访问 `/upload` 时就是 `app/upload/page.tsx`
3. `metadata` 是 Next.js 的 **SEO API**——它会被自动转成 `<title>` 和 `<meta>` 标签注入 HTML 头部
4. `Inter` 字体来自 `next/font/google`——Next.js 会自动优化字体加载，避免布局抖动

### 布局嵌套原理

如果 `app/upload/layout.tsx` 也存在，那么 `/upload` 页面的渲染层级是：

```
RootLayout (app/layout.tsx)
  └─ UploadLayout (app/upload/layout.tsx)
      └─ UploadPage (app/upload/page.tsx)
```

本项目没有子布局，所以所有页面共享同一个 `RootLayout`。

---

## 四、"use client" — 客户端组件 vs 服务器组件

这是 Next.js App Router **最重要的概念**。

### 4.1 两种组件模式

| | 服务器组件 (默认) | 客户端组件 ("use client") |
|---|---|---|
| **渲染位置** | 在服务器上渲染 HTML | 在浏览器中渲染 |
| **能用的 React 功能** | 不能用 useState、useEffect、onClick | 可以用所有 React 功能 |
| **能访问的后端资源** | 直接读数据库、文件系统 | 只能通过 API 请求 |
| **发送到浏览器的代码** | 只发送 HTML 结果，不发送 JS | 发送组件代码 + HTML |
| **SEO** | 天然 SEO 友好（HTML 直接返回） | 需要等待 JS 加载后才能渲染 |

### 4.2 本项目中的实际例子

**客户端组件** — `app/page.tsx`（候选人列表页）：

```tsx
"use client";  // ← 第一行声明：这个组件在浏览器中运行

import { useRouter, useSearchParams } from "next/navigation";

export default function Home() {
  const router = useRouter();           // ← 需要客户端路由
  const searchParams = useSearchParams(); // ← 需要读取 URL 参数
  
  const [candidates, setCandidates] = React.useState([]); // ← 需要状态
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {               // ← 需要副作用
    fetchCandidates();
  }, []);
  
  const handleUploadClick = () => {     // ← 需要点击事件
    router.push("/upload");
  };
  // ...
}
```

为什么用客户端组件？因为这个页面需要：
- `useState` 管理候选人列表数据
- `useEffect` 在加载时发 API 请求
- `onClick` 处理用户点击
- `useRouter` / `useSearchParams` 与 URL 交互

**服务器组件** — `app/layout.tsx`（根布局）：

```tsx
// 没有 "use client" → 默认是服务器组件！

import type { Metadata } from "next";

export const metadata: Metadata = {    // ← 只有服务器组件能用 Metadata
  title: "AI 简历分析平台",
};

export default function RootLayout({ children }) {
  return <html>...<body>{children}</body></html>;
}
```

为什么是服务器组件？因为：
- 布局不需要 `useState` 或 `onClick`
- `Metadata` API 只能在服务器组件中使用
- 服务器组件渲染更快，发送到浏览器的 JS 更少

### 4.3 选择原则

**简单判断法**：
- 需要交互（点击、输入）→ `"use client"`
- 需要状态（useState、useReducer）→ `"use client"`
- 需要生命周期（useEffect）→ `"use client"`
- 需要浏览器 API（window、localStorage）→ `"use client"`
- 其他情况 → 尽量用服务器组件（默认）

本项目中，所有 `page.tsx` 都标注了 `"use client"`，因为每个页面都需要交互和数据获取。但在更复杂的项目中，你可以把交互部分抽成客户端子组件，页面本身保持服务器组件。

---

## 五、API Routes — 在 Next.js 中写后端

这是 Next.js 最强大的全栈特性：**你不需要单独的 Express/FastAPI 后端，API 直接写在 Next.js 项目里**。

### 5.1 route.ts 的基本结构

本项目的每个 `route.ts` 文件导出与 HTTP 方法同名的函数：

```tsx
// app/api/resumes/upload/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {  // ← 函数名 = HTTP 方法
  const formData = await request.formData();         // ← 解析请求体
  
  // ... 业务逻辑 ...
  
  return NextResponse.json({                          // ← 返回 JSON 响应
    success: true,
    data: { uploads, summary },
  }, { status: 200 });                               // ← 设置状态码
}
```

```tsx
// app/api/candidates/route.ts
export async function GET(request: NextRequest) {   // ← GET 方法
  const { searchParams } = new URL(request.url);     // ← 解析查询参数
  
  const page = searchParams.get("page") || "1";
  // ...
  
  return NextResponse.json({ success: true, data: result }, { status: 200 });
}
```

**核心 API**：
- `NextRequest` — 封装了 HTTP 请求，提供 `formData()`、`json()`、`url` 等属性
- `NextResponse.json()` — 创建 JSON 响应，支持状态码和自定义头
- 函数名必须是 `GET`、`POST`、`PUT`、`PATCH`、`DELETE`、`HEAD`、`OPTIONS` 之一
- 一个 `route.ts` 可以导出多个方法函数

### 5.2 动态路由 API — `candidates/[id]/route.ts`

```tsx
// app/api/candidates/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }  // ← 和页面路由一样，自动注入参数
) {
  const candidate = await getCandidateById(params.id);
  
  if (!candidate) {
    return NextResponse.json(
      { success: false, error: "候选人不存在" },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ success: true, data: candidate });
}
```

同一个 `candidates/[id]/` 目录下可以有多个 `route.ts`（子路由）：
- `route.ts` → `GET /api/candidates/:id`
- `match/route.ts` → `POST /api/candidates/:id/match`
- `status/route.ts` → `PATCH /api/candidates/:id/status`

### 5.3 SSE 流式响应 — 本项目的高级用法

本项目的 AI 提取 API 使用了 **Server-Sent Events (SSE)**，这是 Next.js API Routes 的一个高级技巧：

```tsx
// app/api/resumes/[fileId]/extract/route.ts
export async function GET(request: NextRequest, { params }) {
  // 创建 ReadableStream 用于 SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      // 辅助函数：发送 SSE 事件
      const sendEvent = (event: string, data: any) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      // 步骤 1: 解析 PDF
      sendEvent("progress", { stage: "basic", data: ... });
      
      // 步骤 2: AI 提取（异步迭代器）
      for await (const progress of extractAll(resumeText)) {
        sendEvent("progress", progress);
      }
      
      // 步骤 3: 完成
      sendEvent("complete", { candidateId: candidate.id });
      controller.close();
    },
  });

  // 返回流式响应
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",    // ← SSE 的标准 Content-Type
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
```

前端用 `EventSource` API 连接：

```tsx
// app/upload/page.tsx（前端）
const eventSource = new EventSource(`/api/resumes/${uploadedFileId}/extract`);

eventSource.addEventListener('progress', (event) => {
  const data = JSON.parse(event.data);
  // 更新 UI 显示提取进度...
});

eventSource.addEventListener('complete', (event) => {
  // 提取完成！
  eventSource.close();
});
```

**这是一个完美的全栈流程**：同一个项目里，后端用 `ReadableStream` 推送数据，前端用 `EventSource` 接收数据，类型定义（`types/index.ts`）前后端共享。

---

## 六、next/font — 字体优化

本项目使用了 `next/font/google`：

```tsx
// app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

// 在 <html> 上使用 CSS 变量方式
<html className={cn("font-sans", inter.variable)}>
```

**Next.js 字体优化的好处**：
- 自动下载字体文件，**不需要外部网络请求**（提升速度、隐私）
- 防止布局抖动（字体加载期间文字位置不变）
- 支持 CSS 变量模式（`variable`），方便在 Tailwind 中引用

本项目在 `tailwind.config.ts` 中配置了：
```ts
fontFamily: {
  sans: ["var(--font-sans)", ...],  // ← 使用 next/font 生成的 CSS 变量
}
```

---

## 七、next/navigation — 客户端路由

本项目中大量使用了 Next.js 的客户端路由 API：

### 7.1 useRouter — 页面跳转

```tsx
import { useRouter } from "next/navigation";

const router = useRouter();

// 跳转到上传页面
router.push("/upload");

// 跳转并更新 URL 参数（不滚动到页面顶部）
router.push(`/?${params.toString()}`, { scroll: false });

// 返回上一页
router.back();
```

### 7.2 useSearchParams — 读取 URL 参数

```tsx
import { useSearchParams } from "next/navigation";

const searchParams = useSearchParams();

const page = parseInt(searchParams.get("page") || "1", 10);
const sortBy = searchParams.get("sortBy") || "uploadTime";
const searchKeyword = searchParams.get("search") || "";
```

本项目的主页把所有筛选/排序/分页状态都存到了 URL 参数中，这样：
- 用户刷新页面不会丢失筛选状态
- 可以复制 URL 分享给他人
- 不需要复杂的状态管理库

**注意**：`useSearchParams` 只能在客户端组件中使用（需要 `"use client"`）。

---

## 八、next.config.js — 项目配置

本项目的配置文件：

```js
// next.config.js
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 将 pdf-parse 和 canvas 标记为外部依赖（服务器端）
      config.externals = config.externals || [];
      config.externals.push({
        'pdf-parse': 'commonjs pdf-parse',
        canvas: 'commonjs canvas',
      });
    }
    return config;
  },
}

module.exports = nextConfig
```

**为什么需要这个配置？**
- `pdf-parse` 是一个 Node.js 库，依赖 `canvas`（一个 C++ 原生模块）
- 在服务器端（API Route）使用时，需要告诉 webpack 不要打包它，而是用 `require()` 直接加载
- `isServer` 参数让你区分服务器端和客户端的打包配置

常用 `next.config.js` 配置项：
- `reactStrictMode: true` — 启用 React 严格模式
- `images.domains` — 允许外部图片域名
- `env` — 环境变量注入
- `webpack` — 自定义打包配置（本项目用了）

---

## 九、路径别名 — @/ 导入

本项目的导入路径使用了 `@/` 别名：

```tsx
import { CandidateList } from "@/components/candidates";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { uploadResumes } from "@/services/resumeUpload";
import type { ApiResponse } from "@/types";
```

`@/` 代表项目根目录。这个配置在 `tsconfig.json` 中：

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]   // ← @/xxx 映射到 ./xxx（项目根目录下的 xxx）
    }
  }
}
```

**好处**：
- 不用写 `../../../components/ui/Button` 这种丑陋的相对路径
- 移动文件时不需要修改大量导入路径
- Next.js 自动识别这个配置

---

## 十、环境变量 — .env.local

本项目使用 `.env.local` 存储敏感配置：

```env
# .env.local（不提交到 Git！）
DEEPSEEK_API_KEY=sk-your-api-key-here
DATABASE_PATH=data/resume-analyzer.db
UPLOAD_DIR=public/uploads
```

**Next.js 环境变量规则**：

| 前缀 | 可访问位置 | 例子 |
|---|---|---|
| 无前缀 | 只在服务器端可用（API Routes、服务器组件） | `DEEPSEEK_API_KEY` |
| `NEXT_PUBLIC_` | 服务器端 + 客户端都能用 | `NEXT_PUBLIC_API_URL` |

**安全提醒**：没有 `NEXT_PUBLIC_` 前缀的变量**绝对不会**被发送到浏览器，所以你的 API Key 是安全的。本项目正确地把 `DEEPSEEK_API_KEY` 放在服务器端，只在 API Route 中使用。

---

## 十一、项目完整数据流

让我们追踪一个完整的用户操作流程，理解前后端如何协作：

### 流程：上传简历 → AI 提取 → 查看候选人

```
1. 用户在前端拖拽 PDF 文件
   ↓
2. UploadPage (客户端组件) 调用 fetch('/api/resumes/upload', { body: FormData })
   ↓
3. API Route: POST /api/resumes/upload (服务器端)
   - 接收 FormData，验证文件格式和大小
   - 保存文件到 public/uploads/
   - 返回 { fileId, fileName, filePath }
   ↓
4. 前端收到上传结果，建立 SSE 连接:
   new EventSource(`/api/resumes/${fileId}/extract`)
   ↓
5. API Route: GET /api/resumes/:fileId/extract (服务器端)
   - 创建 ReadableStream
   - 解析 PDF → 推送 "progress: basic" 事件
   - AI 提取教育 → 推送 "progress: education" 事件
   - AI 提取经历 → 推送 "progress: experience" 事件
   - AI 提取技能 → 推送 "progress: skills" 事件
   - 保存到 SQLite → 推送 "complete" 事件（含 candidateId）
   ↓
6. 前端逐步更新进度条（25% → 50% → 75% → 90% → 100%）
   ↓
7. 提取完成后跳转到主页 /，useEffect 触发 fetch('/api/candidates')
   ↓
8. API Route: GET /api/candidates (服务器端)
   - 从 SQLite 查询候选人列表
   - 支持分页、排序、搜索、技能筛选
   - 返回分页结果
   ↓
9. 前端渲染候选人列表（表格/卡片视图）
```

**关键洞察**：
- 前端和后端在**同一个项目**中，共享 `types/index.ts` 里的类型定义
- API Routes 就是后端，不需要 Express 或 FastAPI
- SSE 流式通信让用户实时看到 AI 提取进度，而不是等几十秒才看到结果
- 所有数据获取都在客户端组件中通过 `fetch` 调用自己的 API Route

---

## 十二、Tailwind CSS + shadcn/ui — 样式系统

本项目使用 Tailwind CSS + shadcn/ui 作为样式方案，这是 Next.js 项目中最流行的组合。

### Tailwind CSS

在 `page.tsx` 中你会看到大量这样的类名：

```tsx
<h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
  候选人管理
</h1>
```

- `text-4xl` — 字体大小 2.25rem
- `font-bold` — 粗体
- `bg-gradient-to-r` — 从左到右的渐变
- `from-cyan-400 via-blue-500 to-purple-500` — 渐变颜色
- `bg-clip-text text-transparent` — 渐变只应用到文字（彩虹文字效果）

Tailwind 的理念是**用类名直接写样式**，不需要 CSS 文件。本项目的自定义样式在 `tailwind.config.ts` 中扩展（自定义颜色、动画等）。

### shadcn/ui

`components/ui/` 目录下的组件来自 shadcn/ui：

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
```

shadcn/ui 不是 npm 包，而是**可复制的组件代码**——你用 `npx shadcn add button` 命令把 Button 组件源码下载到自己的项目中，然后可以自由修改。这就是为什么你会在 `components/ui/` 里看到这些组件的源码文件。

---

## 十三、常用命令速查

| 命令 | 作用 |
|---|---|
| `npm run dev` | 启动开发服务器（http://localhost:3000），支持热更新 |
| `npm run build` | 构建生产版本，检查类型错误，优化打包 |
| `npm run start` | 启动生产服务器（需要先 build） |
| `npm run lint` | 运行 ESLint 检查代码质量 |
| `npm run type-check` | 运行 TypeScript 类型检查 |
| `npm run db:push` | 推送数据库 schema 到 SQLite |

---

## 十四、常见问题

### Q1: 为什么 API Route 返回的数据要手动 `.toISOString()`？

```tsx
// app/api/candidates/route.ts
const serializedItems = result.items.map((candidate) => ({
  ...candidate,
  createdAt: candidate.createdAt.toISOString(),  // ← Date → 字符串
}));
```

因为 `NextResponse.json()` 使用 `JSON.stringify()`，而 `JSON.stringify(new Date())` 会自动调用 `.toISOString()`——但显式转换更安全、可读性更好，且 TypeScript 类型推断更准确。

### Q2: 为什么 page.tsx 都用了 "use client"？能不能用服务器组件？

理论上可以。服务器组件可以直接访问数据库，不需要 `fetch` 调用：

```tsx
// 服务器组件版本（假设）
// app/page.tsx（无 "use client"）
import { listCandidates } from "@/services/candidateManager";

export default async function Home() {
  const result = await listCandidates({ page: 1, pageSize: 20 });  // 直接查数据库！
  return <CandidateList candidates={result.items} />;
}
```

但本项目选择客户端组件 + API Route 的模式，因为：
1. 页面需要交互（筛选、搜索、排序、分页）
2. URL 参数驱动状态需要 `useSearchParams`
3. 页面跳转需要 `useRouter`
4. 把 UI 交互和数据获取解耦，API Route 可以独立测试和复用

### Q3: SSE 和 WebSocket 有什么区别？

| SSE | WebSocket |
|---|---|
| 服务器 → 客户端单向推送 | 双向通信 |
| 基于 HTTP，自动重连 | 需要单独协议，手动重连 |
| 适合进度推送、通知 | 适合聊天、游戏 |
| 浏览器原生 `EventSource` API | 需要 socket.io 等库 |

本项目用 SSE 是因为 AI 提取只需要服务器推数据给前端，不需要前端反向发数据，SSE 更简单。

---

## 十五、下一步学习建议

1. **深入学习 App Router**：[Next.js 官方文档 - Routing](https://nextjs.org/docs/app/building-your-application/routing)
2. **理解渲染模式**：[Server vs Client Components](https://nextjs.org/docs/app/building-your-application/rendering)
3. **数据获取策略**：[Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
4. **实践建议**：
   - 尝试把候选人列表页改成服务器组件（直接查数据库，不通过 API）
   - 给子路由添加 `loading.tsx`（骨架屏加载效果）
   - 给子路由添加 `error.tsx`（优雅的错误页面）
   - 添加 `not-found.tsx` 处理 404
   - 尝试使用 Next.js 的 `generateStaticParams` 预渲染候选人详情页

---

**本教程基于项目实际代码编写，所有代码引用均来自本项目。如有疑问，可直接查看对应源码文件。**
