# Git 开发流程说明

## 分支策略

### 分支结构
- **main** - 生产分支，部署到 Vercel 生产环境
- **dev** - 开发分支，用于日常开发和测试

### 工作流程

```
开发 → dev 分支测试 → 合并到 main 分支 → 生产部署
```

---

## 日常开发流程

### 1. 开始开发（确保在 dev 分支）

```bash
# 切换到 dev 分支
git checkout dev

# 拉取最新代码
git pull origin dev
```

### 2. 开发功能

在 dev 分支上进行代码修改和开发。

### 3. 提交代码到 dev 分支

```bash
# 查看修改状态
git status

# 添加修改的文件
git add .

# 提交代码（使用中文描述）
git commit -m "功能描述"

# 推送到远程 dev 分支
git push origin dev
```

### 4. 测试 dev 分支

在 Vercel 上可以为 dev 分支配置预览环境，确保功能正常工作。

### 5. 合并到 main 分支（测试通过后）

```bash
# 切换到 main 分支
git checkout main

# 拉取最新代码
git pull origin main

# 合并 dev 分支
git merge dev

# 推送到远程 main 分支（触发生产部署）
git push origin main

# 切换回 dev 分支继续开发
git checkout dev
```

---

## 当前分支状态

- ✅ **本地 dev 分支**: 已创建
- ✅ **远程 dev 分支**: 已创建并推送
- ✅ **当前所在分支**: dev
- ✅ **追踪设置**: dev 分支已设置追踪 origin/dev

---

## 常用命令速查

### 查看当前分支
```bash
git branch
```

### 查看所有分支（包括远程）
```bash
git branch -a
```

### 切换分支
```bash
git checkout dev    # 切换到 dev
git checkout main   # 切换到 main
```

### 查看分支差异
```bash
# 查看 dev 和 main 的差异
git diff main..dev
```

### 拉取远程分支最新代码
```bash
git pull origin dev   # 拉取 dev
git pull origin main  # 拉取 main
```

---

## 紧急修复流程（Hotfix）

如果生产环境（main）出现紧急问题需要修复：

```bash
# 1. 从 main 分支创建 hotfix 分支
git checkout main
git pull origin main
git checkout -b hotfix/问题描述

# 2. 修复问题并提交
git add .
git commit -m "修复: 问题描述"

# 3. 合并回 main
git checkout main
git merge hotfix/问题描述
git push origin main

# 4. 同步到 dev 分支
git checkout dev
git merge hotfix/问题描述
git push origin dev

# 5. 删除 hotfix 分支
git branch -d hotfix/问题描述
```

---

## 冲突解决

如果合并时出现冲突：

```bash
# 1. Git 会提示冲突文件
git status

# 2. 手动编辑冲突文件，解决冲突标记
#    <<<<<<< HEAD
#    当前分支的代码
#    =======
#    要合并的代码
#    >>>>>>> dev

# 3. 解决后添加文件
git add 冲突文件

# 4. 完成合并
git commit -m "解决合并冲突"
```

---

## 注意事项

1. **永远不要直接在 main 分支开发**
   - main 分支只接受来自 dev 的合并
   - main 分支代码应该始终是可部署的稳定版本

2. **提交前先测试**
   - 在 dev 分支充分测试后再合并到 main
   - 确保代码质量和功能完整性

3. **提交信息规范**
   ```
   功能: 添加用户登录功能
   修复: 修复候选人列表加载问题
   优化: 优化数据库查询性能
   文档: 更新 API 文档
   ```

4. **定期同步**
   - 每天开始工作前拉取最新代码
   - 及时推送本地提交到远程

5. **保持分支整洁**
   - 定期将 main 的更新合并到 dev
   - 删除已合并的临时分支

---

## Vercel 部署配置建议

### 生产环境（main 分支）
- 分支: main
- 域名: 主域名
- 环境变量: 生产环境配置

### 预览环境（dev 分支）
- 分支: dev
- 域名: dev 子域名或 Vercel 预览链接
- 环境变量: 开发/测试环境配置

---

**当前状态**: 已在 dev 分支，可以开始开发 🚀
