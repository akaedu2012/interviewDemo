#!/usr/bin/env node
/**
 * Vercel 部署清理脚本
 * 批量删除失败的部署
 */

const { execSync } = require('child_process');

// 配置
const CONFIG = {
  // 要删除的部署状态
  deleteStatuses: ['ERROR', 'CANCELED'],
  
  // 是否删除旧的成功部署（保留最近N个）
  deleteOldSuccess: false,
  keepRecentSuccess: 5,
  
  // 是否进行试运行（不实际删除）
  dryRun: false,
};

/**
 * 获取所有部署
 */
function getDeployments() {
  try {
    console.log('📋 获取部署列表...\n');
    const output = execSync('vercel ls --yes', { encoding: 'utf8' });
    return output;
  } catch (error) {
    console.error('❌ 获取部署列表失败:', error.message);
    process.exit(1);
  }
}

/**
 * 解析部署列表
 */
function parseDeployments(output) {
  const lines = output.split('\n');
  const deployments = [];
  
  for (const line of lines) {
    // 跳过标题和空行
    if (!line.trim() || line.includes('Age') || line.includes('---')) {
      continue;
    }
    
    // 解析部署信息
    const match = line.match(/\s+(https:\/\/[^\s]+)\s+(\w+)\s+/);
    if (match) {
      const url = match[1];
      const status = match[2];
      deployments.push({ url, status });
    }
  }
  
  return deployments;
}

/**
 * 删除单个部署
 */
function deleteDeployment(url, dryRun = false) {
  if (dryRun) {
    console.log(`🔍 [试运行] 将删除: ${url}`);
    return true;
  }
  
  try {
    execSync(`vercel rm ${url} --yes`, { stdio: 'ignore' });
    console.log(`✅ 已删除: ${url}`);
    return true;
  } catch (error) {
    console.error(`❌ 删除失败: ${url}`);
    return false;
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🧹 Vercel 部署清理工具\n');
  console.log('配置:');
  console.log(`  - 删除状态: ${CONFIG.deleteStatuses.join(', ')}`);
  console.log(`  - 试运行模式: ${CONFIG.dryRun ? '是' : '否'}`);
  console.log('');
  
  // 获取部署列表
  const output = getDeployments();
  const deployments = parseDeployments(output);
  
  console.log(`📊 总部署数: ${deployments.length}\n`);
  
  // 统计
  const stats = {
    total: deployments.length,
    toDelete: 0,
    deleted: 0,
    failed: 0,
  };
  
  // 按状态分组
  const byStatus = {};
  deployments.forEach(d => {
    byStatus[d.status] = (byStatus[d.status] || 0) + 1;
  });
  
  console.log('状态分布:');
  Object.entries(byStatus).forEach(([status, count]) => {
    console.log(`  - ${status}: ${count}`);
  });
  console.log('');
  
  // 筛选要删除的部署
  const toDelete = deployments.filter(d => 
    CONFIG.deleteStatuses.includes(d.status)
  );
  
  stats.toDelete = toDelete.length;
  
  if (toDelete.length === 0) {
    console.log('✨ 没有需要删除的部署！');
    return;
  }
  
  console.log(`🗑️  将删除 ${toDelete.length} 个部署\n`);
  
  if (CONFIG.dryRun) {
    console.log('⚠️  试运行模式 - 不会实际删除\n');
  }
  
  // 删除部署
  for (const deployment of toDelete) {
    const success = deleteDeployment(deployment.url, CONFIG.dryRun);
    if (success) {
      stats.deleted++;
    } else {
      stats.failed++;
    }
  }
  
  // 输出统计
  console.log('\n📊 删除统计:');
  console.log(`  - 总部署数: ${stats.total}`);
  console.log(`  - 需要删除: ${stats.toDelete}`);
  console.log(`  - 成功删除: ${stats.deleted}`);
  console.log(`  - 删除失败: ${stats.failed}`);
  
  if (CONFIG.dryRun) {
    console.log('\n💡 提示: 关闭试运行模式以实际删除部署');
    console.log('   修改脚本中的 dryRun: false');
  } else {
    console.log('\n✅ 清理完成！');
  }
}

// 运行
main();
