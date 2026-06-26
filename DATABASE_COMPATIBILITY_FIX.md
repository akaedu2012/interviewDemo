# 数据库兼容性修复总结

## 问题描述

### 症状
- **Vercel 生产环境**: `/api/candidates` 返回 500 DATABASE_ERROR
- **本地开发环境**: `SQLite error: no such table: candidates`

### 根本原因

**问题 1**: Turso (libsql) 和 better-sqlite3 API 差异
- **Turso (libsql)**: 异步 API，所有操作返回 Promise
- **better-sqlite3**: 同步 API，需要调用 `.run()` 方法

**问题 2**: 代码统一使用了异步 API
- `candidateManager.ts` 和 `jobManager.ts` 使用 `await` 语句
- better-sqlite3 的 Drizzle 驱动不支持 `await`，需要 `.run()`

**问题 3**: 变量作用域问题
- `isLibsql` 在函数内部声明，无法在模块级别导出

---

## 修复方案

### 1. 模块级变量 `isLibsqlDb`

```typescript
// db/index.ts
let isLibsqlDb = false; // 模块级变量

async function initializeDatabase() {
  if (useTurso) {
    // Turso
    isLibsqlDb = true;
  } else {
    // better-sqlite3
    isLibsqlDb = false;
  }
}

export { db, initializeDatabase, dbInitPromise, isLibsqlDb };
```

### 2. 兼容两种数据库的插入操作

```typescript
// candidateManager.ts / jobManager.ts
import { db, isLibsqlDb } from "@/db";

// 插入操作
const insertQuery = db.insert(table).values({...});

// 兼容两种数据库
if (isLibsqlDb) {
  await insertQuery;  // Turso: 异步
} else if ((insertQuery as any).run) {
  (insertQuery as any).run();  // better-sqlite3: 同步
}
```

### 3. 兼容两种数据库的更新操作

```typescript
// jobManager.ts
const updateQuery = db.update(table).set({...}).where(...);

if (isLibsqlDb) {
  await updateQuery;
} else if ((updateQuery as any).run) {
  (updateQuery as any).run();
}
```

---

## 修改的文件

### 1. `db/index.ts`
- ✅ 将 `isLibsql` 改为 `isLibsqlDb` 并声明为模块级变量
- ✅ 导出 `isLibsqlDb`
- ✅ 修复默认岗位插入逻辑

### 2. `services/candidateManager.ts`
- ✅ 导入 `isLibsqlDb`
- ✅ 所有插入操作添加数据库类型判断
- ✅ Turso 使用 `await`，better-sqlite3 使用 `.run()`

### 3. `services/jobManager.ts`
- ✅ 导入 `isLibsqlDb`
- ✅ 更新和插入操作添加数据库类型判断

---

## 提交历史

```
* 0945aac (HEAD -> dev, origin/dev) 修复: 修正 isLibsql 变量名为 isLibsqlDb 并确保模块级导出
* c26250d 修复: 兼容 better-sqlite3 和 libsql 两种数据库驱动
* 85242d1 文档: 添加分支设置完成总结文档
* 6dd9579 文档: 添加开发快速开始指南
* ff93e46 文档: 添加 Git 开发流程说明
* 43f7867 (origin/main, main) 修复 Turso 异步 API 兼容性 - 移除同步方法调用
```

---

## 技术细节

### Drizzle ORM 驱动差异

| 特性 | better-sqlite3 | libsql (Turso) |
|------|----------------|----------------|
| **API 类型** | 同步 | 异步 |
| **执行方法** | `.run()` | `await` |
| **查询结果** | 直接返回 | Promise |
| **事务** | `db.transaction()` | 无（暂不支持） |

### 兼容性检查逻辑

```typescript
// 判断数据库类型
if (isLibsqlDb) {
  // Turso: 使用异步 API
  await insertQuery;
} else if ((insertQuery as any).run) {
  // better-sqlite3: 使用同步 API
  (insertQuery as any).run();
}
```

**为什么需要 `(insertQuery as any).run`？**
- TypeScript 类型定义中 Drizzle 查询对象没有 `.run()` 方法
- better-sqlite3 驱动在运行时添加了这个方法
- 使用 `as any` 绕过类型检查

---

## 测试状态

### 本地开发环境
- ✅ 使用 better-sqlite3
- ✅ 数据库文件: `./data/resume-analyzer.db`
- ✅ 开发服务器: `http://localhost:3000`
- 🔄 **待测试**: 刷新页面验证候选人列表加载

### Vercel 生产环境
- ✅ 使用 Turso 云数据库
- ✅ 数据库 URL: `libsql://resume-analyzer-akaedu2012.aws-ap-northeast-1.turso.io`
- 🔄 **待部署**: dev 分支推送后自动部署

---

## 下一步

1. **验证本地环境**
   - 刷新浏览器 `http://localhost:3000`
   - 检查候选人列表是否正常加载
   - 测试上传简历功能

2. **部署到 Vercel**
   - dev 分支已推送，等待 Vercel 部署
   - 测试生产环境 API

3. **合并到 main（测试通过后）**
   ```bash
   git checkout main
   git merge dev
   git push origin main
   ```

---

## 经验教训

### 1. 多数据库兼容性
- 不同 ORM 驱动可能有不同的 API（同步 vs 异步）
- 需要运行时判断并分别处理

### 2. 模块级变量导出
- 在函数内部赋值的变量需要在模块级别声明
- 导出的变量必须在模块顶层可访问

### 3. TypeScript 类型断言
- 有时需要使用 `as any` 绕过类型检查
- 但要确保运行时确实存在该方法

### 4. 测试策略
- 本地使用一种数据库（better-sqlite3）
- 生产使用另一种（Turso）
- 代码必须兼容两者

---

**状态**: ✅ 修复已完成并推送到 dev 分支
**待验证**: 本地开发环境和 Vercel 生产环境
