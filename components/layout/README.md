# Layout Components

布局和导航组件，为整个应用提供一致的页面结构。

## 组件说明

### Header

顶部导航栏组件，包含 logo 和导航链接。

**特性：**
- Sticky 定位，滚动时保持在顶部
- 半透明背景，带有毛玻璃效果
- 响应式设计
- 当前页面的导航链接会高亮显示
- 使用 lucide-react 图标库

**导航链接：**
- 首页（/）
- 上传简历（/upload）
- 岗位配置（/job-config）

### Sidebar

侧边栏菜单组件，提供辅助导航。

**特性：**
- 仅在大屏幕（lg 及以上）显示
- 固定宽度 256px
- 底部显示应用信息
- 与 Header 共享相同的导航链接
- 当前页面会高亮显示

### Layout

主布局容器组件，整合 Header 和 Sidebar。

**特性：**
- 最小宽度 1280px（满足需求 17）
- Flex 布局，自动处理高度
- 主内容区域可滚动
- Container 容器自动居中，带有响应式内边距

**布局结构：**
```
┌─────────────────────────────────────────┐
│            Header (固定顶部)              │
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │     Main Content Area        │
│ (可选)   │     (可滚动)                  │
│          │                              │
└──────────┴──────────────────────────────┘
```

## 使用方法

布局组件已在 `app/layout.tsx` 中全局应用：

```tsx
import { Layout } from "@/components/layout/Layout";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
```

所有页面会自动使用这个布局。

## 样式说明

- 使用 Tailwind CSS 实现响应式设计
- 颜色和主题来自 shadcn/ui 设计系统
- 支持深色模式（通过 CSS 变量）
- 最小宽度 1280px 确保在大屏幕上正常显示

## 依赖

- `lucide-react`：图标库
- `@/components/ui/button`：shadcn/ui 按钮组件
- `next/link` 和 `next/navigation`：Next.js 路由
- `@/lib/utils`：工具函数（cn 用于条件类名）

## 导出

所有组件通过 `index.ts` 导出：

```tsx
import { Header, Sidebar, Layout } from "@/components/layout";
```
