# 实施计划：AI简历分析平台

## 概述

本实施计划将AI简历分析平台的技术设计转化为可执行的编码任务。该平台使用 Next.js 14 + TypeScript 构建，提供PDF简历上传、AI信息提取、智能岗位匹配和候选人管理等核心功能。

**技术栈：**
- 前端：Next.js 14+ (App Router), TypeScript, React, Tailwind CSS, shadcn/ui, Recharts
- 后端：Next.js API Routes, pdf-parse, OpenAI/Anthropic API, Zod
- 数据库：SQLite with Drizzle ORM
- 部署：Vercel 或 自托管 Docker

**实施策略：**
- 按照功能模块进行增量实施
- 每个任务都包含具体的文件和组件创建指引
- 所有任务引用具体的需求编号以确保需求覆盖
- 包含检查点任务以确保阶段性验证

## 任务列表

### 1. 项目初始化和基础设施搭建

- [x] 1.1 初始化 Next.js 项目并配置基础工具
  - 使用 `npx create-next-app@latest` 创建项目，选择 TypeScript、App Router、Tailwind CSS
  - 配置 ESLint 和 Prettier
  - 配置 TypeScript strict 模式
  - 安装 shadcn/ui CLI 并初始化：`npx shadcn-ui@latest init`
  - _需求: 15, 16_

- [x] 1.2 设置 SQLite 数据库和 ORM
  - 安装 Drizzle ORM 和 better-sqlite3：`npm install drizzle-orm better-sqlite3`
  - 安装开发依赖：`npm install -D drizzle-kit @types/better-sqlite3`
  - 创建 `src/db/schema.ts` 定义所有数据库表结构（candidates, education, experience, skills, job_descriptions, match_scores）
  - 创建 `src/db/index.ts` 初始化数据库连接
  - 创建数据库迁移脚本并执行初始化
  - _需求: 14_

- [x] 1.3 创建项目目录结构和类型定义
  - 创建目录：`src/components`, `src/services`, `src/lib`, `src/types`, `src/app/api`
  - 创建 `src/types/index.ts` 定义所有 TypeScript 类型和接口（Candidate, Education, Experience, SkillEntry, JobDescription, MatchScore, CandidateStatus）
  - 创建 `src/lib/constants.ts` 定义常量（候选人状态枚举、文件大小限制、分页配置）
  - _需求: 16_


### 2. 数据库访问层实现

- [x] 2.1 实现候选人管理服务（Candidate Manager）
  - 创建 `src/services/candidateManager.ts`
  - 实现 `createCandidate()` 方法：插入候选人及其关联的教育、经历、技能数据
  - 实现 `getCandidateById()` 方法：查询候选人完整信息（包含关联数据）
  - 实现 `listCandidates()` 方法：支持分页、排序、筛选、搜索
  - 实现 `updateCandidateStatus()` 方法：更新候选人状态
  - 实现 `saveMatchScore()` 方法：保存匹配评分结果
  - 使用事务确保数据一致性
  - _需求: 10, 11, 13, 14_

- [x] 2.2 实现岗位管理服务（Job Manager）
  - 创建 `src/services/jobManager.ts`
  - 实现 `createOrUpdateJob()` 方法：创建或更新岗位描述（将旧的岗位设为 inactive）
  - 实现 `getActiveJob()` 方法：获取当前激活的岗位描述
  - 实现 JSON 数组字段的序列化和反序列化（requiredSkills, preferredSkills）
  - _需求: 7, 14_

- [ ]* 2.3 编写数据库服务单元测试
  - 创建 `__tests__/services/candidateManager.test.ts`
  - 测试所有 CRUD 操作
  - 测试事务回滚场景
  - 使用内存 SQLite 数据库进行测试隔离
  - _需求: 14_

### 3. PDF解析和文件上传服务

- [x] 3.1 实现文件上传服务（Resume Upload Service）
  - 创建 `src/services/resumeUpload.ts`
  - 实现 `validateFile()` 方法：验证文件格式（仅 PDF）和大小限制
  - 实现 `storeFile()` 方法：保存文件到 `public/uploads` 目录或配置的存储路径
  - 生成唯一文件标识符（使用 UUID）
  - 返回文件元数据（fileId, fileName, filePath, fileSize, uploadedAt）
  - _需求: 1_

- [x] 3.2 实现 PDF 解析服务（PDF Parser Service）
  - 安装 pdf-parse：`npm install pdf-parse`
  - 创建 `src/services/pdfParser.ts`
  - 实现 `parseResume()` 方法：从 PDF 文件提取文本
  - 实现 `cleanText()` 方法：清理多余空白和特殊字符
  - 处理多页 PDF 文档
  - 处理解析错误并返回结构化错误信息
  - _需求: 2_

- [ ]* 3.3 编写 PDF 解析服务测试
  - 创建测试用例使用示例 PDF 文件
  - 测试多页文档解析
  - 测试文本清理功能
  - 测试错误处理（损坏的 PDF、加密的 PDF）
  - _需求: 2_


### 4. AI信息提取服务实现

- [x] 4.1 配置 AI API 客户端
  - 安装 OpenAI SDK：`npm install openai` 或 Anthropic SDK：`npm install @anthropic-ai/sdk`
  - 创建 `src/lib/aiClient.ts` 初始化 AI 客户端
  - 在 `.env.local` 中配置 API 密钥
  - 创建错误处理包装器处理 API 限流和超时
  - _需求: 3, 4, 5, 6_

- [x] 4.2 实现 AI 提取服务 - 基本信息提取
  - 创建 `src/services/aiExtractor.ts`
  - 设计基本信息提取的 prompt 模板（要求返回 JSON 格式）
  - 实现 `extractBasicInfo()` 方法：提取姓名、电话、邮箱、城市
  - 使用 Zod schema 验证 AI 返回的 JSON 结构
  - 处理字段缺失情况（返回 null）
  - _需求: 3_

- [x] 4.3 实现 AI 提取服务 - 教育背景提取
  - 设计教育背景提取的 prompt 模板
  - 实现 `extractEducation()` 方法：提取学校、专业、学位、毕业时间数组
  - 使用 Zod schema 验证返回数据
  - _需求: 4_

- [x] 4.4 实现 AI 提取服务 - 工作经历提取
  - 设计工作经历提取的 prompt 模板
  - 实现 `extractExperience()` 方法：提取公司、职位、起止日期、职责描述数组
  - 使用 Zod schema 验证返回数据
  - _需求: 5_

- [x] 4.5 实现 AI 提取服务 - 技能标签提取
  - 设计技能提取的 prompt 模板
  - 实现 `extractSkills()` 方法：提取技术技能、工具、编程语言数组
  - 实现技能标签标准化逻辑（统一大小写、同义词映射）
  - _需求: 6_

- [x] 4.6 实现流式提取功能（SSE 支持）
  - 实现 `extractAll()` 异步生成器方法：按阶段依次提取所有信息
  - 在每个提取阶段完成后 yield 进度数据
  - 定义 ExtractionProgress 类型（stage: 'basic' | 'education' | 'experience' | 'skills' | 'complete'）
  - _需求: 3, 4, 5, 6_

- [ ]* 4.7 编写 AI 提取服务测试
  - 使用 mock AI API 响应进行测试
  - 测试每种信息类型的提取
  - 测试 JSON 解析错误处理
  - 测试技能标准化逻辑
  - _需求: 3, 4, 5, 6_


### 5. 岗位匹配和评分服务实现

- [x] 5.1 实现技能匹配评分算法
  - 创建 `src/services/jobMatcher.ts`
  - 实现 `calculateSkillScore()` 方法：
    - 计算必备技能匹配度（权重 60%）
    - 计算加分技能匹配度（权重 30%）
    - 计算额外相关技能加分（权重 10%）
    - 返回 0-100 分数
  - 实现技能匹配逻辑（忽略大小写、支持部分匹配）
  - _需求: 8_

- [x] 5.2 实现经历和教育评分（AI 辅助）
  - 实现 `calculateExperienceScore()` 方法：使用 AI 分析经历与岗位描述的相关性
  - 实现 `calculateEducationScore()` 方法：使用 AI 分析教育背景的匹配度
  - 设计 prompt 要求 AI 返回 0-100 分数和简短理由
  - _需求: 8_

- [x] 5.3 实现综合匹配评分和评论生成
  - 实现 `calculateMatch()` 方法：协调所有子评分计算
  - 计算总分：`(skillScore * 0.4) + (experienceScore * 0.4) + (educationScore * 0.2)`
  - 使用 AI 生成综合评论（描述候选人优势和不足）
  - 返回 MatchResult 对象（包含所有分数和评论）
  - _需求: 8_

- [ ]* 5.4 编写匹配服务单元测试
  - 测试技能评分算法（已知输入输出）
  - 测试总分计算公式
  - 使用 mock AI 响应测试经历和教育评分
  - _需求: 8_

### 6. 后端 API 路由实现

- [x] 6.1 实现简历上传 API
  - 创建 `src/app/api/resumes/upload/route.ts`
  - 使用 Next.js FormData 处理多文件上传
  - 验证文件格式和大小（最多 5 个文件）
  - 调用 Resume Upload Service 存储文件
  - 返回上传结果数组（fileId, fileName, status）
  - 处理错误并返回标准错误响应（400/500）
  - _需求: 1, 15_

- [x] 6.2 实现 AI 提取进度 SSE API
  - 创建 `src/app/api/resumes/[fileId]/extract/route.ts`
  - 设置 SSE 响应头（Content-Type: text/event-stream）
  - 调用 PDF Parser Service 提取文本
  - 调用 AI Extractor Service 的 `extractAll()` 生成器
  - 在每个提取阶段通过 SSE 发送进度事件
  - 提取完成后调用 Candidate Manager 保存数据
  - 发送 complete 事件返回 candidateId
  - 处理错误并发送 error 事件
  - _需求: 2, 3, 4, 5, 6, 15_

- [x] 6.3 实现候选人列表查询 API
  - 创建 `src/app/api/candidates/route.ts`
  - 解析查询参数（page, pageSize, sortBy, sortOrder, skills, search）
  - 使用 Zod 验证查询参数
  - 调用 Candidate Manager 的 `listCandidates()` 方法
  - 返回分页结果（items, total, page, pageSize, totalPages）
  - _需求: 10, 11, 15_


- [x] 6.4 实现候选人详情查询 API
  - 创建 `src/app/api/candidates/[id]/route.ts`
  - 调用 Candidate Manager 的 `getCandidateById()` 方法
  - 返回完整候选人信息（包括教育、经历、技能、匹配分数）
  - 处理候选人不存在情况（返回 404）
  - _需求: 12, 15_

- [x] 6.5 实现候选人状态更新 API
  - 创建 `src/app/api/candidates/[id]/status/route.ts`（PATCH 方法）
  - 使用 Zod 验证状态值（待筛选/初筛通过/面试中/已录用/已淘汰）
  - 调用 Candidate Manager 的 `updateCandidateStatus()` 方法
  - 返回更新后的状态和时间戳
  - _需求: 13, 15_

- [x] 6.6 实现匹配评分计算触发 API
  - 创建 `src/app/api/candidates/[id]/match/route.ts`（POST 方法）
  - 从请求体获取 jobId
  - 获取候选人信息和岗位描述
  - 调用 Job Matcher Service 计算匹配分数
  - 调用 Candidate Manager 保存匹配分数
  - 返回 MatchResult
  - _需求: 8, 15_

- [x] 6.7 实现岗位描述管理 API
  - 创建 `src/app/api/jobs/route.ts`（POST 方法）
  - 使用 Zod 验证岗位描述数据（title, description, requiredSkills, preferredSkills）
  - 调用 Job Manager 的 `createOrUpdateJob()` 方法
  - 返回创建的岗位信息
  - 创建 `src/app/api/jobs/active/route.ts`（GET 方法）
  - 调用 Job Manager 的 `getActiveJob()` 方法
  - 处理无激活岗位情况（返回 404）
  - _需求: 7, 15_

- [ ]* 6.8 编写 API 集成测试
  - 测试所有 API 端点的成功场景
  - 测试错误场景（400, 404, 500）
  - 测试 SSE 流式响应
  - 使用测试数据库隔离测试
  - _需求: 15_

### 7. 检查点 - 后端服务验证

- [x] 7.1 检查点：确保所有后端服务和 API 正常工作
  - 手动测试文件上传流程
  - 手动测试 SSE 提取进度流
  - 手动测试候选人列表查询（分页、排序、筛选）
  - 手动测试匹配评分计算
  - 手动测试岗位描述配置
  - 检查数据库数据完整性
  - 确认所有测试通过（如果有）
  - 如有问题，向用户汇报


### 8. 通用 UI 组件开发

- [x] 8.1 安装和配置 shadcn/ui 核心组件
  - 安装以下 shadcn/ui 组件：
    - `npx shadcn-ui@latest add button card input select badge dialog dropdown-menu toast table`
  - 配置 Tailwind CSS 主题（颜色、字体、间距）
  - 创建全局样式文件 `src/app/globals.css`
  - _需求: 16, 20_

- [x] 8.2 创建通用 UI 组件（基于 shadcn/ui）
  - 创建 `src/components/ui/LoadingSpinner.tsx`：加载指示器组件
  - 创建 `src/components/ui/Modal.tsx`：模态对话框组件（基于 shadcn dialog）
  - 创建 `src/components/ui/Notification.tsx`：通知/Toast 组件（基于 shadcn toast）
  - 创建 `src/components/ui/TagInput.tsx`：多值标签输入组件
  - 创建 `src/components/ui/ErrorBoundary.tsx`：React 错误边界组件
  - _需求: 16, 18, 19, 20_

- [~] 8.3 创建布局和导航组件
  - 创建 `src/components/layout/Header.tsx`：顶部导航栏（含 logo、导航链接）
  - 创建 `src/components/layout/Sidebar.tsx`：侧边栏菜单（可选）
  - 创建 `src/components/layout/Layout.tsx`：主布局容器
  - 更新 `src/app/layout.tsx` 使用自定义布局
  - 实现响应式布局（最小宽度 1280px）
  - _需求: 16, 17_

### 9. 简历上传功能前端实现

- [~] 9.1 实现文件上传组件
  - 安装 react-dropzone：`npm install react-dropzone`
  - 创建 `src/components/upload/FileDropzone.tsx`
  - 实现拖拽上传和点击浏览功能
  - 限制文件类型为 PDF
  - 显示文件选择提示和说明
  - _需求: 1_

- [~] 9.2 实现上传进度和状态显示组件
  - 创建 `src/components/upload/FileUploadProgress.tsx`：单个文件上传进度条
  - 创建 `src/components/upload/FileUploadList.tsx`：上传文件列表容器
  - 显示每个文件的状态（uploading, success, failed）
  - 显示上传进度百分比
  - 显示文件名和大小
  - 提供重试按钮（失败时）
  - _需求: 1_

- [~] 9.3 实现上传页面和 SSE 提取进度展示
  - 创建 `src/app/upload/page.tsx`
  - 集成 FileDropzone 和 FileUploadList 组件
  - 实现文件上传逻辑（调用 `/api/resumes/upload`）
  - 实现 SSE 连接监听提取进度（EventSource API）
  - 实时显示 AI 提取进度（basic → education → experience → skills → complete）
  - 提取完成后显示成功通知并导航到候选人列表
  - 处理上传和提取错误，显示错误消息
  - _需求: 1, 3, 4, 5, 6, 19_

- [ ]* 9.4 编写上传组件测试
  - 测试文件拖拽和选择交互
  - 测试文件类型验证
  - 测试上传进度更新
  - 测试 SSE 事件处理
  - _需求: 1_


### 10. 候选人列表功能前端实现

- [~] 10.1 实现候选人表格和卡片视图组件
  - 创建 `src/components/candidates/CandidateTable.tsx`
  - 使用 shadcn/ui Table 组件显示候选人列表
  - 显示列：姓名、总分、上传时间、状态
  - 实现列排序功能（点击列头切换升序/降序）
  - 点击行导航到候选人详情页
  - 创建 `src/components/candidates/CandidateCard.tsx`
  - 以卡片形式显示候选人摘要信息
  - _需求: 10_

- [~] 10.2 实现筛选和排序控件
  - 创建 `src/components/candidates/CandidateFilters.tsx`
  - 实现技能标签筛选（多选下拉框或标签列表）
  - 实现关键词搜索输入框（搜索姓名、技能、学校）
  - 创建 `src/components/candidates/CandidateSorter.tsx`
  - 实现排序选择器（按分数/上传时间，升序/降序）
  - _需求: 11_

- [~] 10.3 实现候选人列表容器和分页
  - 创建 `src/components/candidates/CandidateList.tsx`
  - 管理表格视图和卡片视图切换
  - 集成筛选和排序控件
  - 实现分页控件（使用 shadcn/ui pagination 或自定义）
  - 显示筛选结果数量
  - _需求: 10, 11_

- [~] 10.4 实现主页（候选人列表页面）
  - 创建 `src/app/page.tsx`（首页）
  - 集成 CandidateList 组件
  - 实现数据获取逻辑（调用 `/api/candidates`）
  - 管理筛选、排序、分页状态（使用 URL query params）
  - 实现客户端状态管理（Zustand 或 React Context）
  - 显示加载状态和空状态
  - 提供"上传简历"按钮导航到上传页面
  - 确保在 500ms 内响应筛选和搜索操作
  - _需求: 10, 11, 19_

- [ ]* 10.5 编写候选人列表组件测试
  - 测试表格和卡片视图切换
  - 测试排序功能
  - 测试筛选功能
  - 测试分页导航
  - _需求: 10, 11_

### 11. 候选人详情功能前端实现

- [~] 11.1 实现候选人信息展示组件
  - 创建 `src/components/candidates/BasicInfoSection.tsx`：展示基本信息（姓名、电话、邮箱、城市）
  - 创建 `src/components/candidates/EducationSection.tsx`：展示教育背景列表
  - 创建 `src/components/candidates/ExperienceSection.tsx`：展示工作经历列表
  - 创建 `src/components/candidates/SkillsSection.tsx`：展示技能标签（使用 Badge 组件）
  - 使用 Card 组件组织各个部分
  - _需求: 12_

- [~] 11.2 实现评分可视化组件
  - 安装 recharts：`npm install recharts`
  - 创建 `src/components/candidates/ScoreVisualization.tsx`
  - 实现雷达图展示四个维度分数（总分、技能、经历、教育）
  - 实现柱状图展示各维度分数对比
  - 使用不同颜色区分分数范围（红色 <60, 黄色 60-80, 绿色 >80）
  - 显示数值标签
  - _需求: 9_


- [~] 11.3 实现 AI 评论和状态管理组件
  - 创建 `src/components/candidates/AICommentary.tsx`：格式化展示 AI 生成的评论文本
  - 创建 `src/components/candidates/StatusSelector.tsx`
  - 使用 shadcn/ui Select 组件实现状态下拉选择器
  - 显示五个状态选项（待筛选、初筛通过、面试中、已录用、已淘汰）
  - 状态改变时调用 API 更新
  - 显示加载状态和成功/失败反馈
  - _需求: 9, 13_

- [~] 11.4 实现 PDF 预览组件
  - 创建 `src/components/candidates/PDFViewer.tsx`
  - 使用 `<embed>` 或 `<iframe>` 标签嵌入 PDF 文件
  - 提供下载按钮
  - 处理 PDF 加载失败情况
  - _需求: 12_

- [~] 11.5 实现候选人详情页面
  - 创建 `src/app/candidates/[id]/page.tsx`
  - 集成所有候选人详情展示组件
  - 实现数据获取逻辑（调用 `/api/candidates/[id]`）
  - 实现状态更新逻辑（调用 `/api/candidates/[id]/status`）
  - 实现匹配评分触发按钮（调用 `/api/candidates/[id]/match`）
  - 显示加载状态和错误状态
  - 处理候选人不存在情况（显示 404）
  - 提供返回列表按钮
  - _需求: 12, 13, 19_

- [ ]* 11.6 编写候选人详情组件测试
  - 测试各信息展示组件渲染
  - 测试评分可视化图表渲染
  - 测试状态选择器交互
  - 测试 PDF 预览加载
  - _需求: 12, 13_

### 12. 岗位配置功能前端实现

- [~] 12.1 实现岗位配置表单页面
  - 创建 `src/app/job-config/page.tsx`
  - 使用 shadcn/ui Form 组件创建表单
  - 实现岗位标题输入框（Input）
  - 实现岗位描述文本编辑器（Textarea，支持多行）
  - 实现必备技能标签输入（使用 TagInput 组件）
  - 实现加分技能标签输入（使用 TagInput 组件）
  - _需求: 7_

- [~] 12.2 实现表单验证和提交逻辑
  - 使用 Zod schema 定义表单验证规则
  - 验证岗位描述不为空
  - 验证至少有一个必备技能
  - 实现表单提交逻辑（调用 `/api/jobs`）
  - 显示验证错误信息（内联显示）
  - 提交成功后显示通知
  - 显示加载状态（禁用提交按钮）
  - 页面加载时获取当前激活的岗位描述并填充表单
  - _需求: 7, 19_

- [ ]* 12.3 编写岗位配置表单测试
  - 测试表单验证逻辑
  - 测试表单提交流程
  - 测试错误处理
  - _需求: 7_

### 13. 检查点 - 前端功能验证

- [~] 13.1 检查点：确保所有前端功能正常工作
  - 手动测试完整的上传流程（拖拽文件 → 上传 → 实时进度 → 提取完成）
  - 手动测试候选人列表（筛选、排序、搜索、分页、视图切换）
  - 手动测试候选人详情（信息展示、评分可视化、PDF 预览、状态更新）
  - 手动测试岗位配置（填写表单、验证、提交、回显）
  - 测试响应式布局（1280px 及以上分辨率）
  - 测试所有加载状态和错误处理
  - 测试颜色对比度和可访问性基础要求
  - 确认所有测试通过（如果有）
  - 如有问题，向用户汇报


### 14. 错误处理和用户反馈优化

- [~] 14.1 实现全局错误处理
  - 在 `src/app/layout.tsx` 中包裹 ErrorBoundary 组件
  - 创建 `src/lib/apiClient.ts`：封装 API 请求逻辑
  - 实现统一错误拦截和映射（将错误代码映射为用户友好消息）
  - 实现自动重试机制（针对网络错误）
  - 所有 API 错误通过 Toast 通知显示给用户
  - _需求: 18_

- [~] 14.2 完善加载状态管理
  - 确保所有异步操作显示加载指示器
  - 异步操作期间禁用相关交互元素
  - 实现骨架屏（Skeleton）用于页面级加载
  - 确保加载指示器在操作完成后 300ms 内移除
  - _需求: 19_

- [~] 14.3 优化用户交互反馈
  - 确保所有按钮和链接有 hover、active、focus 状态样式
  - 确保所有用户操作在 100ms 内有视觉反馈
  - 实现操作成功的通知提示（使用 Toast）
  - 实现表单字段验证的即时反馈
  - _需求: 20_

- [~] 14.4 实现客户端表单验证
  - 为所有表单添加 Zod schema 验证
  - 在用户输入时显示实时验证错误
  - 阻止无效表单提交
  - 验证错误显示在对应字段下方
  - _需求: 7, 18_

### 15. 性能优化和代码质量提升

- [~] 15.1 实现前端性能优化
  - 使用 Next.js Image 组件优化图片加载
  - 实现候选人列表虚拟滚动（如果数据量大）
  - 使用 React.memo 优化组件重渲染
  - 实现 API 响应缓存（使用 SWR 或 React Query）
  - 优化 PDF 文件加载（延迟加载、压缩）
  - _需求: 10, 12_

- [~] 15.2 代码重构和类型安全
  - 确保所有组件和函数有明确的 TypeScript 类型定义
  - 移除所有 `any` 类型（使用具体类型）
  - 提取重复代码为共享工具函数（创建 `src/lib/utils.ts`）
  - 确保所有 async 函数有适当的错误处理
  - 运行 ESLint 修复所有 lint 警告
  - _需求: 16_

- [~] 15.3 添加日志和监控
  - 创建 `src/lib/logger.ts`：统一日志工具
  - 在所有 API 路由添加请求日志（请求方法、路径、状态码、耗时）
  - 在服务层添加关键操作日志（PDF 解析、AI 提取、评分计算）
  - 记录所有错误到控制台（包含堆栈信息）
  - 为生产环境配置日志级别
  - _需求: 18_

- [ ]* 15.4 添加端到端测试
  - 安装 Playwright：`npm install -D @playwright/test`
  - 编写 E2E 测试场景：
    - 完整简历上传和提取流程
    - 候选人列表筛选和导航
    - 候选人详情查看和状态更新
    - 岗位配置保存和回显
  - 配置 CI/CD 运行 E2E 测试
  - _需求: 1, 10, 12, 13_


### 16. 部署准备和文档

- [~] 16.1 配置环境变量和部署设置
  - 创建 `.env.example` 文件列出所有必需的环境变量
  - 配置数据库文件路径（生产环境使用持久化存储）
  - 配置文件上传目录（生产环境使用对象存储如 S3 或 Vercel Blob）
  - 配置 AI API 密钥和模型选择
  - 创建 `next.config.js` 生产环境优化配置
  - _需求: 15_

- [~] 16.2 准备部署文档
  - 编写 README.md：
    - 项目介绍和功能列表
    - 技术栈说明
    - 本地开发环境搭建步骤
    - 环境变量配置说明
    - 数据库初始化命令
    - 运行和测试命令
  - 编写 DEPLOYMENT.md：
    - Vercel 部署步骤
    - Docker 部署步骤（包含 Dockerfile 和 docker-compose.yml）
    - 数据库迁移说明
    - 生产环境配置建议
  - _需求: 所有_

- [~] 16.3 创建 Docker 部署配置（可选）
  - 创建 `Dockerfile`：构建 Next.js 应用镜像
  - 创建 `docker-compose.yml`：编排应用和数据库
  - 配置持久化卷挂载（数据库文件、上传文件）
  - 测试 Docker 部署流程
  - _需求: 15_

### 17. 最终检查点

- [~] 17.1 最终检查点：全面验证系统功能
  - 使用真实简历测试完整流程（上传 → 提取 → 匹配 → 管理）
  - 验证 AI 提取准确性（测试至少 5 份不同格式的简历）
  - 验证评分算法合理性（检查分数是否符合预期）
  - 测试所有错误场景：
    - 无效文件格式
    - PDF 解析失败
    - AI API 错误
    - 数据库错误
    - 网络错误
  - 测试性能：
    - 多文件并发上传（5 个文件）
    - 大文件上传（10MB PDF）
    - 候选人列表查询（模拟 1000+ 候选人）
  - 检查代码质量：
    - 运行 `npm run lint` 确保无错误
    - 运行 `npm run type-check` 确保类型安全
    - 检查所有 TODO 和 FIXME 注释
  - 检查文档完整性：
    - README.md 是否清晰准确
    - 所有环境变量是否有说明
    - 部署步骤是否可执行
  - 所有检查通过后，系统可交付使用
  - 如有问题，返回相应任务修复


## 注释

- 标记 `*` 的子任务为可选任务，可以跳过以加快 MVP 开发
- 每个任务都引用了具体的需求编号，确保需求追溯性
- 检查点任务确保阶段性增量验证
- 所有测试相关的子任务都标记为可选，核心实现任务必须完成
- 任务按照技术依赖顺序组织：基础设施 → 后端服务 → API → 前端组件 → 集成优化

## 任务依赖图

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1.1", "1.2", "1.3"]
    },
    {
      "id": 1,
      "tasks": ["2.1", "2.2", "3.1", "3.2"]
    },
    {
      "id": 2,
      "tasks": ["2.3", "3.3", "4.1"]
    },
    {
      "id": 3,
      "tasks": ["4.2", "4.3", "4.4", "4.5"]
    },
    {
      "id": 4,
      "tasks": ["4.6", "4.7"]
    },
    {
      "id": 5,
      "tasks": ["5.1", "5.2"]
    },
    {
      "id": 6,
      "tasks": ["5.3", "5.4"]
    },
    {
      "id": 7,
      "tasks": ["6.1", "6.2", "6.3", "6.4", "6.5", "6.6", "6.7"]
    },
    {
      "id": 8,
      "tasks": ["6.8", "7.1"]
    },
    {
      "id": 9,
      "tasks": ["8.1", "8.2", "8.3"]
    },
    {
      "id": 10,
      "tasks": ["9.1", "9.2"]
    },
    {
      "id": 11,
      "tasks": ["9.3", "9.4"]
    },
    {
      "id": 12,
      "tasks": ["10.1", "10.2", "10.3"]
    },
    {
      "id": 13,
      "tasks": ["10.4", "10.5"]
    },
    {
      "id": 14,
      "tasks": ["11.1", "11.2", "11.3", "11.4"]
    },
    {
      "id": 15,
      "tasks": ["11.5", "11.6"]
    },
    {
      "id": 16,
      "tasks": ["12.1", "12.2", "12.3"]
    },
    {
      "id": 17,
      "tasks": ["13.1"]
    },
    {
      "id": 18,
      "tasks": ["14.1", "14.2", "14.3", "14.4"]
    },
    {
      "id": 19,
      "tasks": ["15.1", "15.2", "15.3", "15.4"]
    },
    {
      "id": 20,
      "tasks": ["16.1", "16.2", "16.3"]
    },
    {
      "id": 21,
      "tasks": ["17.1"]
    }
  ]
}
```
