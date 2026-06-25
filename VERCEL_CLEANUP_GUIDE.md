# Vercel 部署批量清理指南

## 📋 问题
Vercel Dashboard 中有太多失败的部署，手动删除太慢。

## ✅ 解决方案

### 方法 1: 使用 PowerShell 脚本（推荐 - 最简单）

#### 前置要求
```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login
```

#### 使用步骤

1. **运行清理脚本**
```powershell
cd e:\interviewDemo
.\scripts\cleanup-vercel.ps1
```

2. **确认删除**
   - 脚本会提示确认
   - 输入 `y` 继续
   - 脚本会自动删除所有失败（ERROR）的部署

3. **查看结果**
   - 成功删除的数量
   - 失败的数量

---

### 方法 2: 使用 Node.js 脚本（功能更强大）

#### 使用步骤

1. **编辑配置**（可选）

编辑 `scripts/cleanup-vercel-deployments.js`：

```javascript
const CONFIG = {
  // 要删除的部署状态
  deleteStatuses: ['ERROR', 'CANCELED'],  // 可以添加 'QUEUED'
  
  // 试运行（不实际删除，只显示）
  dryRun: false,  // 改为 false 实际删除
};
```

2. **运行脚本**
```bash
node scripts/cleanup-vercel-deployments.js
```

---

### 方法 3: 手动使用 Vercel CLI

#### 删除单个部署
```bash
# 语法
vercel rm <deployment-url> --yes

# 示例
vercel rm https://interview-demo-abc123.vercel.app --yes
```

#### 批量删除（手动）
```bash
# 1. 列出所有部署
vercel ls

# 2. 逐个删除失败的部署
vercel rm https://interview-demo-error1.vercel.app --yes
vercel rm https://interview-demo-error2.vercel.app --yes
# ... 依次类推
```

---

### 方法 4: 使用 Vercel Dashboard（手动）

虽然没有批量删除功能，但可以快速删除：

1. 访问：https://vercel.com/dashboard
2. 进入项目：点击项目名称
3. 点击 **"Deployments"** 标签
4. 对于每个失败的部署：
   - 点击右侧的 **"..."** 按钮
   - 选择 **"Delete"**
   - 确认删除

**技巧**：
- 使用键盘快捷键加速
- 可以在一个标签页打开多个删除确认
- 专注删除 `Error` 状态的部署

---

## 🎯 推荐的清理策略

### 优先删除
1. ✅ **ERROR** 状态的部署（构建失败）
2. ✅ **CANCELED** 状态的部署（已取消）
3. ✅ **QUEUED** 状态且超过1小时的（卡住的）

### 保留
1. ⚠️ **READY** 状态的部署（成功的）
2. ⚠️ **BUILDING** 状态的部署（正在构建）
3. ⚠️ 最近的部署（最近1小时）

### 建议
- 保留最近 3-5 个成功的部署
- 定期清理（每周或每月）
- 使用脚本自动化清理

---

## 📝 脚本使用示例

### 示例 1: 试运行（不实际删除）

编辑 `scripts/cleanup-vercel-deployments.js`：
```javascript
const CONFIG = {
  deleteStatuses: ['ERROR'],
  dryRun: true,  // 试运行
};
```

运行：
```bash
node scripts/cleanup-vercel-deployments.js
```

输出：
```
🧹 Vercel 部署清理工具

📋 获取部署列表...
📊 总部署数: 45

状态分布:
  - READY: 5
  - ERROR: 35
  - BUILDING: 2
  - CANCELED: 3

🗑️  将删除 35 个部署

⚠️  试运行模式 - 不会实际删除

🔍 [试运行] 将删除: https://interview-demo-abc1.vercel.app
🔍 [试运行] 将删除: https://interview-demo-abc2.vercel.app
...
```

### 示例 2: 实际删除

编辑配置：
```javascript
const CONFIG = {
  deleteStatuses: ['ERROR', 'CANCELED'],
  dryRun: false,  // 实际删除
};
```

运行：
```bash
node scripts/cleanup-vercel-deployments.js
```

输出：
```
🗑️  将删除 38 个部署

✅ 已删除: https://interview-demo-abc1.vercel.app
✅ 已删除: https://interview-demo-abc2.vercel.app
...

📊 删除统计:
  - 总部署数: 45
  - 需要删除: 38
  - 成功删除: 38
  - 删除失败: 0

✅ 清理完成！
```

---

## 🔧 故障排查

### 问题 1: `vercel: command not found`

**解决**:
```bash
# 安装 Vercel CLI
npm install -g vercel

# 或使用 yarn
yarn global add vercel
```

### 问题 2: `Error: Not authenticated`

**解决**:
```bash
# 登录 Vercel
vercel login
```

### 问题 3: `Error: No deployments found`

**原因**: 可能是：
- 没有链接到项目
- 项目名称不正确

**解决**:
```bash
# 切换到项目目录
cd e:\interviewDemo

# 链接项目
vercel link

# 选择正确的项目
```

### 问题 4: 脚本无法运行

**PowerShell 执行策略问题**:
```powershell
# 临时允许脚本运行
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# 然后运行脚本
.\scripts\cleanup-vercel.ps1
```

---

## 💡 高级用法

### 只删除特定时间之前的部署

编辑 `scripts/cleanup-vercel-deployments.js`，添加：

```javascript
const CONFIG = {
  deleteStatuses: ['ERROR'],
  dryRun: false,
  
  // 只删除 N 天前的部署
  deleteBefore: 7, // 7天前
};

// 在 parseDeployments 函数中添加时间过滤
function parseDeployments(output) {
  const lines = output.split('\n');
  const deployments = [];
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - CONFIG.deleteBefore);
  
  // ... 解析逻辑
  // 添加时间过滤
  if (deployment.createdAt < cutoffDate) {
    deployments.push(deployment);
  }
  
  return deployments;
}
```

### 保留最近 N 个成功的部署

```javascript
const CONFIG = {
  deleteStatuses: ['READY'],  // 删除成功的部署
  keepRecentSuccess: 5,       // 保留最近5个
  dryRun: false,
};
```

---

## 📊 清理前后对比

### 清理前
```
总部署: 45
- READY: 5
- ERROR: 35
- CANCELED: 3
- BUILDING: 2
```

### 清理后
```
总部署: 7
- READY: 5
- BUILDING: 2
```

**收益**:
- ✅ 减少 38 个无用部署
- ✅ Dashboard 更清爽
- ✅ 更容易找到有效部署
- ✅ 降低存储占用（虽然很小）

---

## ⚠️ 注意事项

1. **备份重要部署**
   - 删除前确认没有需要的部署
   - 特别是包含重要配置或测试数据的部署

2. **不要删除正在使用的部署**
   - READY 状态的部署可能正在服务用户
   - Production 部署不要删除

3. **试运行测试**
   - 第一次使用时先设置 `dryRun: true`
   - 确认删除列表无误后再实际删除

4. **频率控制**
   - 不要过于频繁运行脚本
   - 建议每周清理一次即可

---

## 🚀 快速开始

最简单的方法：

```powershell
# 1. 确保已安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 运行 PowerShell 脚本
cd e:\interviewDemo
.\scripts\cleanup-vercel.ps1

# 4. 确认删除
# 输入 y 并按回车

# 5. 完成！
```

---

## 📚 相关文档

- [Vercel CLI 文档](https://vercel.com/docs/cli)
- [Vercel Deployments API](https://vercel.com/docs/rest-api/endpoints/deployments)

---

**提示**: 建议先使用 PowerShell 脚本（最简单），如果需要更多自定义功能，再使用 Node.js 脚本。✨
