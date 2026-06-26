# 开发快速开始指南

## 当前分支状态

✅ **已创建 dev 开发分支**
- 本地 dev 分支: ✅ 已创建
- 远程 dev 分支: ✅ 已推送
- 当前所在分支: **dev**

---

## 日常开发快速命令

### 📝 开始一天的工作

```bash
# 1. 确认在 dev 分支
git checkout dev

# 2. 拉取最新代码
git pull origin dev

# 3. 开始编码...
```

### 💾 提交代码到 dev 分支

```bash
# 1. 查看修改
git status

# 2. 添加所有修改
git add .

# 3. 提交（使用有意义的中文描述）
git commit -m "功能: 添加候选人筛选功能"

# 4. 推送到远程 dev
git push origin dev
```

### 🚀 部署到生产环境（dev 测试通过后）

```bash
# 1. 切换到 main 分支
git checkout main

# 2. 拉取最新 main 代码
git pull origin main

# 3. 合并 dev 分支
git merge dev

# 4. 推送到 main（触发生产部署）
git push origin main

# 5. 切换回 dev 继续开发
git checkout dev
```

---

## 提交信息规范

使用中文，格式如下：

```
功能: 添加用户登录模块
修复: 修复候选人列表分页问题
优化: 优化 PDF 解析性能
文档: 更新 API 使用文档
重构: 重构数据库连接逻辑
```

---

## 分支说明

| 分支 | 用途 | 部署环境 |
|------|------|----------|
| **dev** | 日常开发和测试 | Vercel 预览环境（可选） |
| **main** | 稳定的生产代码 | Vercel 生产环境 |

---

## 重要规则

1. ⚠️ **不要直接在 main 分支开发**
2. ✅ **所有开发都在 dev 分支进行**
3. ✅ **dev 测试通过后才合并到 main**
4. ✅ **每天开始工作前先 pull 最新代码**
5. ✅ **提交代码前先测试**

---

## 当前提交历史

```
* ff93e46 (HEAD -> dev, origin/dev) 文档: 添加 Git 开发流程说明
* 43f7867 (origin/main, main) 修复 Turso 异步 API 兼容性
* 65af61b 修复构建错误 - 标记所有数据库 API 路由为动态路由
* 2e9d5fa 修复所有 API 路由的数据库初始化问题
```

---

## 常见问题

### Q: 如何查看当前在哪个分支？
```bash
git branch
# * 号标记的就是当前分支
```

### Q: 如何撤销还未提交的修改？
```bash
# 撤销所有修改
git checkout .

# 撤销单个文件
git checkout -- 文件名
```

### Q: 如何查看 dev 和 main 的差异？
```bash
git diff main..dev
```

### Q: 合并时出现冲突怎么办？
1. 查看冲突文件: `git status`
2. 手动编辑冲突文件，删除冲突标记
3. 添加解决后的文件: `git add 文件名`
4. 完成合并: `git commit`

---

**准备就绪！现在可以在 dev 分支开始开发了 🎉**

详细流程请查看 [GIT_WORKFLOW.md](./GIT_WORKFLOW.md)
