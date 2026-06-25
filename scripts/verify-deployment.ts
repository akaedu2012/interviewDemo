#!/usr/bin/env ts-node
/**
 * Vercel 部署验证脚本
 * 用于验证部署后的应用是否正常运行
 */

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration?: number;
}

/**
 * 测试健康检查端点
 */
async function testHealthEndpoint(baseUrl: string): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${baseUrl}/api/health`);
    const data = await response.json();
    const duration = Date.now() - startTime;
    
    if (response.status === 200 && data.status === 'healthy') {
      return {
        name: '健康检查',
        passed: true,
        message: '✓ 应用健康状态正常',
        duration,
      };
    } else {
      return {
        name: '健康检查',
        passed: false,
        message: `✗ 健康状态异常: ${data.status}`,
        duration,
      };
    }
  } catch (error) {
    return {
      name: '健康检查',
      passed: false,
      message: `✗ 无法连接到健康检查端点: ${error}`,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * 测试主页
 */
async function testHomePage(baseUrl: string): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(baseUrl);
    const duration = Date.now() - startTime;
    
    if (response.status === 200) {
      return {
        name: '主页加载',
        passed: true,
        message: '✓ 主页加载成功',
        duration,
      };
    } else {
      return {
        name: '主页加载',
        passed: false,
        message: `✗ 主页返回状态码: ${response.status}`,
        duration,
      };
    }
  } catch (error) {
    return {
      name: '主页加载',
      passed: false,
      message: `✗ 无法加载主页: ${error}`,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * 测试API端点
 */
async function testApiEndpoint(baseUrl: string): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${baseUrl}/api/candidates`);
    const duration = Date.now() - startTime;
    
    if (response.status === 200) {
      const data = await response.json();
      return {
        name: 'API端点',
        passed: true,
        message: `✓ API响应成功 (${data.candidates?.length || 0} 条候选人数据)`,
        duration,
      };
    } else {
      return {
        name: 'API端点',
        passed: false,
        message: `✗ API返回状态码: ${response.status}`,
        duration,
      };
    }
  } catch (error) {
    return {
      name: 'API端点',
      passed: false,
      message: `✗ API请求失败: ${error}`,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * 测试性能指标端点
 */
async function testMetricsEndpoint(baseUrl: string): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${baseUrl}/api/metrics`);
    const duration = Date.now() - startTime;
    
    if (response.status === 200) {
      const data = await response.json();
      return {
        name: '性能指标',
        passed: true,
        message: `✓ 指标获取成功 (运行时间: ${data.system?.uptime || 'N/A'}s)`,
        duration,
      };
    } else {
      return {
        name: '性能指标',
        passed: false,
        message: `✗ 指标端点返回状态码: ${response.status}`,
        duration,
      };
    }
  } catch (error) {
    return {
      name: '性能指标',
      passed: false,
      message: `✗ 指标请求失败: ${error}`,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * 打印测试结果
 */
function printResults(results: TestResult[]): void {
  console.log('\n' + '='.repeat(60));
  console.log('Vercel 部署验证结果');
  console.log('='.repeat(60) + '\n');
  
  results.forEach(result => {
    const color = result.passed ? COLORS.green : COLORS.red;
    const durationStr = result.duration ? ` (${result.duration}ms)` : '';
    console.log(`${color}${result.message}${COLORS.reset}${durationStr}`);
  });
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const allPassed = passed === total;
  
  console.log('\n' + '-'.repeat(60));
  const summaryColor = allPassed ? COLORS.green : COLORS.yellow;
  console.log(`${summaryColor}通过: ${passed}/${total}${COLORS.reset}`);
  console.log('-'.repeat(60) + '\n');
  
  if (allPassed) {
    console.log(`${COLORS.green}🎉 所有测试通过！部署成功！${COLORS.reset}\n`);
  } else {
    console.log(`${COLORS.yellow}⚠ 部分测试失败，请检查配置${COLORS.reset}\n`);
  }
}

/**
 * 主函数
 */
async function main() {
  const baseUrl = process.argv[2];
  
  if (!baseUrl) {
    console.error(`${COLORS.red}错误: 请提供部署的URL${COLORS.reset}`);
    console.log('\n使用方法:');
    console.log('  ts-node scripts/verify-deployment.ts <URL>');
    console.log('\n示例:');
    console.log('  ts-node scripts/verify-deployment.ts https://your-app.vercel.app');
    process.exit(1);
  }
  
  console.log(`${COLORS.blue}开始验证部署: ${baseUrl}${COLORS.reset}\n`);
  
  const results: TestResult[] = [];
  
  // 运行所有测试
  results.push(await testHealthEndpoint(baseUrl));
  results.push(await testHomePage(baseUrl));
  results.push(await testApiEndpoint(baseUrl));
  results.push(await testMetricsEndpoint(baseUrl));
  
  // 打印结果
  printResults(results);
  
  // 根据结果设置退出码
  const allPassed = results.every(r => r.passed);
  process.exit(allPassed ? 0 : 1);
}

// 运行
main().catch(error => {
  console.error(`${COLORS.red}验证过程出错: ${error}${COLORS.reset}`);
  process.exit(1);
});
