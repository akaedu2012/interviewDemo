# AI 简历分析平台 - 问题诊断与修复记录

## 🎯 当前状态

### ✅ 已解决的问题

1. **PDF 解析失败** (Commit: `79daea1`)
   - 问题：URI malformed 错误
   - 原因：pdf2json 返回 URI 编码文本，特殊字符解码失败
   - 修复：添加 try-catch 安全解码

2. **数据库表结构不匹配** (Commit: `a0b2760`)
   - 问题：Failed to create candidate INTERNAL_ERROR
   - 原因：`db/index.ts` 初始化脚本与 `db/schema.ts` 定义不一致
   - 修复：统一所有表结构字段名称和类型

3. **岗位描述缺失** (Commit: `3e6a9b3`, `9646c27`)
   - 问题：点击"开始评分"时 404 错误
   - 原因：数据库中没有岗位描述数据
   - 修复：添加默认岗位描述 + 优化错误提示

### ⏳ 等待验证

- Vercel 正在自动部署最新修复
- 预计 1-2 分钟完成
- 需要重新测试完整上传流程

### ⚠️ 已知限制

**❌ Vercel 环境 SQLite 无法持久化数据**：
- 每个 serverless 函数实例有独立的 `/tmp` 目录
- 数据在不同实例间不共享
- POST 请求保存的数据，GET 请求可能看不到
- **当前配置无法用于生产环境**

**解决方案**：迁移到云数据库（Turso / Vercel Postgres / Supabase）
详见：`MIGRATE_TO_TURSO.md`

---

## 📋 问题历史

### 问题 1: PDF 解析库兼容性

**尝试 1 - pdf-parse**
- 错误：`DOMMatrix is not defined`
- 原因：需要 canvas 原生依赖，Vercel serverless 不支持
- 结果：❌ 放弃

**尝试 2 - pdfjs-dist**
- 错误：`Cannot find module './pdf.worker.js'`
- 原因：需要 worker 文件
- 结果：❌ 放弃

**尝试 3 - pdf2json** ✅
- 选择理由：纯 JS、无原生依赖、serverless 友好
- 初始问题：URI 解码错误
- 修复：添加安全解码 try-catch
- 结果：✅ 成功

### 问题 2: 数据库表结构不匹配

**症状**：
```
Extraction error: Failed to create candidate INTERNAL_ERROR
```

**根本原因**：
初始化脚本 (`db/index.ts`) 和 Schema (`db/schema.ts`) 字段不一致

**不匹配的表**：
1. `education` - 缺少 `school`, `graduation_time` 字段
2. `experience` - 字段名错误 (`position` vs `title`, `description` vs `responsibilities`)
3. `match_scores` - 字段名错误 (`skills_score` vs `skill_score`, `ai_commentary` vs `commentary`)
4. `job_descriptions` - 缺少 `description` 字段
5. `candidates` - 字段可空性不匹配

**修复内容**：
- 统一所有表结构定义
- 确保字段名称、类型、可空性与 schema 一致
- 结果：✅ 已修复

---

## 🔧 技术配置

### Vercel 环境

**文件系统**：
- ✅ 可写：`/tmp` (唯一可写目录)
- ❌ 只读：`public/`
- ✅ 已实现：环境自适应路径

**限制**：
- ⏱️ 函数超时：10 秒 (免费账户)
- 💾 `/tmp` 大小：512 MB
- ⚠️ 冷启动清空：数据不持久

**环境变量**：
- ✅ `DEEPSEEK_API_KEY` 已配置
- ✅ 已验证：通过 `/api/debug/test-ai` 测试成功

### 数据库

**当前方案**：
- 引擎：SQLite (better-sqlite3)
- ORM：Drizzle ORM
- 路径：`/tmp/resume-analyzer.db` (Vercel) 或 `./data/resume-analyzer.db` (本地)

**表结构**：
- `candidates` - 候选人基本信息
- `education` - 教育背景
- `experience` - 工作经历
- `skills` - 技能标签
- `job_descriptions` - 岗位描述
- `match_scores` - 匹配评分

---

## 📊 部署记录

### 最新部署

**Commit**: `9646c27`
**时间**: 刚刚
**包含修复**:
1. ✅ PDF URI 解码错误处理
2. ✅ 数据库表结构统一
3. ✅ 添加默认岗位描述
4. ✅ 优化错误提示

**Git 历史**:
```
9646c27 - improve: 优化无岗位描述时的错误提示 (HEAD)
3e6a9b3 - fix: 在数据库初始化时添加默认岗位描述
a0b2760 - fix: 修复数据库表结构定义与 schema 不匹配的问题
79daea1 - fix: 添加 URI 解码错误处理以支持 pdf2json 特殊字符
ec07cf4 - refactor: 切换到 pdf2json 替代 pdfjs-dist
...
```

---

## ✅ 验证清单

### 等 Vercel 部署完成后测试：

1. **PDF 上传和解析**
   - [ ] 拖拽上传 PDF 文件
   - [ ] 显示上传进度
   - [ ] PDF 解析成功（无 URI 错误）

2. **AI 信息提取**
   - [ ] 基本信息提取 (姓名、电话、邮箱、城市)
   - [ ] 教育背景提取 (学校、专业、学位、毕业时间)
   - [ ] 工作经历提取 (公司、职位、时间、职责)
   - [ ] 技能提取 (技术技能、工具、语言)

3. **数据库保存** ← 新修复重点
   - [ ] 候选人创建成功（无 INTERNAL_ERROR）
   - [ ] 返回 candidateId
   - [ ] 跳转到候选人列表

4. **候选人列表**
   - [ ] 显示新上传的候选人
   - [ ] 显示基本信息
   - [ ] 可以点击查看详情

5. **匹配评分** ← 新修复重点
   - [ ] 点击"开始评分"按钮
   - [ ] 成功获取默认岗位描述
   - [ ] 显示评分结果（总分、技能、经历、教育）
   - [ ] 显示 AI 评论

6. **岗位配置** (可选)
   - [ ] 访问【岗位配置】页面
   - [ ] 自定义岗位信息
   - [ ] 保存成功
   - [ ] 使用新岗位重新评分

---

## 🚨 如果仍然失败

### 查看 Vercel 日志
```bash
vercel logs --follow
```

### 关键日志标记
- `[DB Init]` - 数据库初始化
- `[Extract SSE]` - SSE 提取流程
- `[PDF Parser]` - PDF 解析
- `Failed to create candidate` - 候选人创建错误

### 诊断 API 端点
- `/api/debug/env` - 检查环境变量
- `/api/debug/test-ai` - 测试 AI 连接
- `/api/health` - 检查服务健康状态

---

## 📚 相关文档

- `JOB_DESCRIPTION_FIX_SUMMARY.md` - 岗位描述问题修复详细记录
- `PDF_PARSING_FIX_SUMMARY.md` - PDF 解析问题详细记录
- `DATABASE_FIX_SUMMARY.md` - 数据库修复详细记录
- `README.md` - 项目说明
- `DEPLOYMENT.md` - 部署指南

---

## 🎯 下一步计划

### 立即行动
1. ⏳ 等待 Vercel 部署完成 (约 1-2 分钟)
2. 🧪 测试完整上传流程
3. ✅ 验证所有功能正常

### 可选改进
1. **数据持久化** - 迁移到 Vercel Postgres 或 Turso
2. **测试覆盖** - 实施剩余 10 个可选测试任务
3. **错误监控** - 集成 Sentry 或其他监控工具
4. **性能优化** - 添加缓存和 CDN

---

## � 生产环境建议

### 数据持久化方案

**选项 A: Vercel Postgres** (推荐)
- 免费套餐：256 MB
- 完全托管
- 修改成本：中等（需改 ORM 配置）

**选项 B: Turso** (推荐)
- SQLite 兼容
- 免费套餐：500 MB
- 修改成本：低（仅改连接字符串）

**选项 C: Supabase**
- PostgreSQL + 存储
- 免费套餐：500 MB
- 修改成本：中等

### 文件存储方案

**选项 A: Vercel Blob**
- 与 Vercel 集成
- 免费套餐：有限
- 修改成本：低

**选项 B: Cloudflare R2**
- S3 兼容
- 10 GB 免费
- 修改成本：低

**选项 C: AWS S3**
- 标准 S3
- 5 GB 免费
- 修改成本：低

---

**最后更新**: 2026-06-26
**状态**: 等待 Vercel 部署完成验证
