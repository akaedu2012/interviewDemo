# Candidates Components

候选人管理相关的 UI 组件集合。

## 组件列表

### CandidateTable

**功能：** 以表格形式显示候选人列表

**特性：**
- 显示列：姓名、总分、上传时间、状态
- 支持列排序（点击列头切换升序/降序）
- 点击行导航到候选人详情页
- 分数颜色区分（绿色>=80，黄色>=60，红色<60）
- 状态徽章显示

**使用示例：**
```tsx
<CandidateTable
  candidates={candidates}
  sortBy="score"
  sortOrder="desc"
  onSort={(field) => console.log('Sort by:', field)}
/>
```

### CandidateCard

**功能：** 以卡片形式显示候选人摘要信息

**特性：**
- 紧凑的卡片布局
- 显示姓名、分数、上传时间、状态
- Hover 效果和点击导航
- 分数颜色区分

**使用示例：**
```tsx
<CandidateCard candidate={candidate} />
```

### CandidateFilters

**功能：** 候选人筛选控件

**特性：**
- 关键词搜索（搜索姓名、技能、学校）
- 技能标签多选筛选
- 清除筛选按钮
- 实时搜索（带清除按钮）

**使用示例：**
```tsx
<CandidateFilters
  searchKeyword={searchKeyword}
  selectedSkills={selectedSkills}
  availableSkills={availableSkills}
  onSearchChange={(keyword) => setSearchKeyword(keyword)}
  onSkillToggle={(skill) => toggleSkill(skill)}
  onClearFilters={() => clearFilters()}
/>
```

### CandidateSorter

**功能：** 候选人排序选择器

**特性：**
- 按分数排序（升序/降序）
- 按上传时间排序（升序/降序）
- 下拉选择器界面

**使用示例：**
```tsx
<CandidateSorter
  sortBy="score"
  sortOrder="desc"
  onSortChange={(sortBy, sortOrder) => updateSort(sortBy, sortOrder)}
/>
```

### CandidateList

**功能：** 候选人列表容器组件（集成所有功能）

**特性：**
- 表格/卡片视图切换
- 集成筛选和排序控件
- 分页控件
- 显示筛选结果数量
- 完整的列表管理功能

**使用示例：**
```tsx
<CandidateList
  candidates={candidates}
  total={total}
  page={page}
  pageSize={pageSize}
  totalPages={totalPages}
  viewMode="table"
  sortBy="score"
  sortOrder="desc"
  searchKeyword=""
  selectedSkills={[]}
  availableSkills={allSkills}
  onViewModeChange={(mode) => setViewMode(mode)}
  onSortChange={(sortBy, sortOrder) => updateSort(sortBy, sortOrder)}
  onSearchChange={(keyword) => setSearchKeyword(keyword)}
  onSkillToggle={(skill) => toggleSkill(skill)}
  onClearFilters={() => clearFilters()}
  onPageChange={(page) => setPage(page)}
/>
```

## 实现的需求

- **需求 10：** 候选人列表管理
  - ✅ 表格视图和卡片视图
  - ✅ 视图切换功能
  - ✅ 显示候选人关键信息
  - ✅ 点击导航到详情页
  - ✅ 分页支持（20 条/页）

- **需求 11：** 候选人筛选和排序
  - ✅ 按分数排序（升序/降序）
  - ✅ 按上传时间排序（升序/降序）
  - ✅ 技能标签筛选（多选）
  - ✅ 关键词搜索（姓名、技能、学校）
  - ✅ 500ms 内响应筛选和搜索
  - ✅ 显示筛选结果数量

- **需求 19：** 加载状态管理
  - ✅ API 请求加载指示器
  - ✅ 页面级加载状态

## 技术实现

### 状态管理
- 使用 URL query params 管理所有筛选、排序、分页状态
- 支持浏览器前进/后退
- 状态持久化到 URL

### 性能优化
- 搜索防抖（300ms）确保响应在 500ms 内
- React.useCallback 优化回调函数
- React.useMemo 优化计算

### 响应式设计
- 卡片视图：1列（移动端）、2列（平板）、3列（桌面）
- 表格视图：横向滚动支持

### 用户体验
- 分数颜色区分（红色/黄色/绿色）
- 状态徽章颜色区分
- Hover 效果和过渡动画
- 清晰的视觉反馈

## 目录结构

```
components/candidates/
├── CandidateTable.tsx      # 表格视图组件
├── CandidateCard.tsx       # 卡片视图组件
├── CandidateFilters.tsx    # 筛选控件组件
├── CandidateSorter.tsx     # 排序选择器组件
├── CandidateList.tsx       # 列表容器组件
├── index.ts                # 导出文件
└── README.md               # 文档（本文件）
```

## 相关文件

- **页面：** `app/page.tsx` - 主页（候选人列表页面）
- **API：** `app/api/candidates/route.ts` - 候选人列表 API
- **类型：** `types/index.ts` - TypeScript 类型定义

## 下一步

任务 11 将实现候选人详情页面，包括：
- 完整信息展示
- PDF 预览
- 评分可视化
- 状态管理
