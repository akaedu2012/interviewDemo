# 服务层 (Services Layer)

本目录包含所有业务逻辑服务。

## candidateManager.ts

候选人管理服务，负责候选人数据的 CRUD 操作。

### 主要功能

#### 1. `createCandidate(data: CreateCandidateInput): Promise<Candidate>`

创建候选人及其关联数据（教育背景、工作经历、技能）。

**特性：**
- 使用数据库事务确保数据一致性
- 自动生成候选人 ID 和关联数据 ID
- 默认状态为"待筛选"
- 返回完整的候选人信息

**示例：**
```typescript
const candidate = await createCandidate({
  name: "张三",
  phone: "+86 138-0000-0000",
  email: "zhangsan@example.com",
  city: "北京",
  fileName: "zhangsan_resume.pdf",
  filePath: "/uploads/abc-123.pdf",
  fileSize: 1024000,
  education: [
    {
      school: "清华大学",
      major: "计算机科学与技术",
      degree: "本科",
      graduationTime: "2020-06",
    },
  ],
  experience: [
    {
      company: "字节跳动",
      title: "前端工程师",
      startDate: "2020-07",
      endDate: "2023-12",
      responsibilities: "负责前端架构设计和开发",
    },
  ],
  skills: [
    { skillType: "technical", skillName: "JavaScript" },
    { skillType: "technical", skillName: "React" },
  ],
});
```

#### 2. `getCandidateById(id: string): Promise<Candidate | null>`

根据 ID 查询候选人完整信息。

**返回数据包括：**
- 候选人基本信息
- 教育背景列表
- 工作经历列表
- 技能列表
- 最新的匹配评分（如果存在）

**示例：**
```typescript
const candidate = await getCandidateById("candidate-123");
if (candidate) {
  console.log(candidate.name);
  console.log(candidate.education);
  console.log(candidate.matchScore?.overallScore);
}
```

#### 3. `listCandidates(options: ListOptions): Promise<PaginatedResult<Candidate>>`

列出候选人，支持分页、排序、筛选、搜索。

**支持的选项：**
- `page`: 页码（从 1 开始）
- `pageSize`: 每页数量
- `sortBy`: 排序字段（"score" 或 "uploadTime"）
- `sortOrder`: 排序方向（"asc" 或 "desc"）
- `skillFilters`: 技能筛选数组
- `searchKeyword`: 搜索关键词（搜索姓名、技能、学校）

**示例：**
```typescript
// 按评分降序排序
const result = await listCandidates({
  page: 1,
  pageSize: 20,
  sortBy: "score",
  sortOrder: "desc",
});

// 按技能筛选
const result = await listCandidates({
  page: 1,
  pageSize: 20,
  skillFilters: ["javascript", "react"],
});

// 关键词搜索
const result = await listCandidates({
  page: 1,
  pageSize: 20,
  searchKeyword: "清华",
});
```

#### 4. `updateCandidateStatus(id: string, status: CandidateStatus): Promise<void>`

更新候选人状态。

**支持的状态：**
- 待筛选
- 初筛通过
- 面试中
- 已录用
- 已淘汰

**示例：**
```typescript
await updateCandidateStatus("candidate-123", "初筛通过");
```

#### 5. `saveMatchScore(candidateId: string, jobId: string, matchResult: MatchResult): Promise<void>`

保存候选人与岗位的匹配评分结果。

**示例：**
```typescript
await saveMatchScore("candidate-123", "job-456", {
  overallScore: 85.5,
  skillScore: 90.0,
  experienceScore: 82.0,
  educationScore: 84.0,
  commentary: "候选人技术能力强，经验丰富。",
});
```

### 错误处理

所有方法都会捕获错误并抛出带有友好消息的 Error 对象。调用方应该使用 try-catch 处理这些错误。

```typescript
try {
  const candidate = await getCandidateById("invalid-id");
} catch (error) {
  console.error("Failed to get candidate:", error.message);
}
```

### 事务处理

`createCandidate` 方法使用数据库事务确保数据一致性。如果任何一步失败，所有更改都会回滚。

### 性能考虑

- `listCandidates` 方法在按评分排序时会执行较复杂的查询，包括 LEFT JOIN 和内存排序
- 技能筛选和关键词搜索会执行额外的子查询
- 建议在数据库中创建适当的索引以优化查询性能

### 依赖

- `@/db`: 数据库连接和 schema
- `drizzle-orm`: ORM 查询构建器
- `@/lib/utils`: 工具函数（generateId）
- `@/types`: TypeScript 类型定义
