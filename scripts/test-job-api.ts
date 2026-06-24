/**
 * 测试岗位描述管理 API
 * 测试任务 6.7 的实现
 */

const BASE_URL = "http://localhost:3000";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * 测试创建岗位描述 API (POST /api/jobs)
 */
async function testCreateJob() {
  console.log("\n=== 测试 1: 创建岗位描述 ===");

  try {
    const jobData = {
      title: "高级全栈工程师",
      description:
        "我们正在寻找一位经验丰富的全栈工程师，负责开发和维护我们的Web应用平台。理想候选人应具备前端和后端开发经验，熟悉现代开发工具和框架。",
      requiredSkills: ["JavaScript", "React", "Node.js", "SQL", "TypeScript"],
      preferredSkills: ["Next.js", "AWS", "Docker", "GraphQL"],
    };

    const response = await fetch(`${BASE_URL}/api/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
    });

    const result: ApiResponse = await response.json();

    if (response.ok && result.success) {
      console.log("✓ 创建岗位描述成功");
      console.log("  岗位 ID:", result.data.id);
      console.log("  岗位标题:", result.data.title);
      console.log("  是否激活:", result.data.isActive);
      console.log("  必备技能:", result.data.requiredSkills.join(", "));
      console.log("  加分技能:", result.data.preferredSkills.join(", "));
      return result.data.id;
    } else {
      console.error("✗ 创建岗位描述失败");
      console.error("  错误:", result.error);
      console.error("  错误代码:", result.code);
      return null;
    }
  } catch (error) {
    console.error("✗ 请求失败:", error);
    return null;
  }
}

/**
 * 测试获取激活岗位描述 API (GET /api/jobs/active)
 */
async function testGetActiveJob() {
  console.log("\n=== 测试 2: 获取激活的岗位描述 ===");

  try {
    const response = await fetch(`${BASE_URL}/api/jobs/active`);
    const result: ApiResponse = await response.json();

    if (response.ok && result.success) {
      console.log("✓ 获取激活岗位描述成功");
      console.log("  岗位 ID:", result.data.id);
      console.log("  岗位标题:", result.data.title);
      console.log("  岗位描述:", result.data.description.substring(0, 50) + "...");
      console.log("  必备技能:", result.data.requiredSkills.join(", "));
      console.log("  加分技能:", result.data.preferredSkills.join(", "));
      console.log("  是否激活:", result.data.isActive);
      return true;
    } else {
      console.error("✗ 获取激活岗位描述失败");
      console.error("  错误:", result.error);
      console.error("  错误代码:", result.code);
      console.error("  HTTP 状态:", response.status);
      return false;
    }
  } catch (error) {
    console.error("✗ 请求失败:", error);
    return false;
  }
}

/**
 * 测试验证逻辑 - 空标题
 */
async function testValidationEmptyTitle() {
  console.log("\n=== 测试 3: 验证 - 空标题 ===");

  try {
    const jobData = {
      title: "",
      description: "测试描述",
      requiredSkills: ["JavaScript"],
      preferredSkills: [],
    };

    const response = await fetch(`${BASE_URL}/api/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
    });

    const result: ApiResponse = await response.json();

    if (response.status === 400 && !result.success) {
      console.log("✓ 验证成功 - 正确拒绝空标题");
      console.log("  错误消息:", result.error);
      console.log("  错误代码:", result.code);
      return true;
    } else {
      console.error("✗ 验证失败 - 应该拒绝空标题");
      return false;
    }
  } catch (error) {
    console.error("✗ 请求失败:", error);
    return false;
  }
}

/**
 * 测试验证逻辑 - 空描述
 */
async function testValidationEmptyDescription() {
  console.log("\n=== 测试 4: 验证 - 空描述 ===");

  try {
    const jobData = {
      title: "测试岗位",
      description: "",
      requiredSkills: ["JavaScript"],
      preferredSkills: [],
    };

    const response = await fetch(`${BASE_URL}/api/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
    });

    const result: ApiResponse = await response.json();

    if (response.status === 400 && !result.success) {
      console.log("✓ 验证成功 - 正确拒绝空描述");
      console.log("  错误消息:", result.error);
      console.log("  错误代码:", result.code);
      return true;
    } else {
      console.error("✗ 验证失败 - 应该拒绝空描述");
      return false;
    }
  } catch (error) {
    console.error("✗ 请求失败:", error);
    return false;
  }
}

/**
 * 测试验证逻辑 - 无必备技能
 */
async function testValidationNoRequiredSkills() {
  console.log("\n=== 测试 5: 验证 - 无必备技能 ===");

  try {
    const jobData = {
      title: "测试岗位",
      description: "测试描述",
      requiredSkills: [],
      preferredSkills: ["TypeScript"],
    };

    const response = await fetch(`${BASE_URL}/api/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jobData),
    });

    const result: ApiResponse = await response.json();

    if (response.status === 400 && !result.success) {
      console.log("✓ 验证成功 - 正确拒绝空必备技能");
      console.log("  错误消息:", result.error);
      console.log("  错误代码:", result.code);
      return true;
    } else {
      console.error("✗ 验证失败 - 应该拒绝空必备技能");
      return false;
    }
  } catch (error) {
    console.error("✗ 请求失败:", error);
    return false;
  }
}

/**
 * 测试多次创建岗位 - 验证旧岗位被设为 inactive
 */
async function testMultipleJobCreation() {
  console.log("\n=== 测试 6: 多次创建岗位 - 验证激活状态切换 ===");

  try {
    // 创建第一个岗位
    const job1Data = {
      title: "初级开发工程师",
      description: "入门级开发岗位",
      requiredSkills: ["JavaScript", "HTML", "CSS"],
      preferredSkills: ["React"],
    };

    const response1 = await fetch(`${BASE_URL}/api/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(job1Data),
    });

    const result1: ApiResponse = await response1.json();

    if (!response1.ok || !result1.success) {
      console.error("✗ 创建第一个岗位失败");
      return false;
    }

    console.log("✓ 创建第一个岗位成功:", result1.data.title);

    // 创建第二个岗位
    const job2Data = {
      title: "高级架构师",
      description: "资深架构设计岗位",
      requiredSkills: ["Java", "Microservices", "Kubernetes"],
      preferredSkills: ["AWS", "Terraform"],
    };

    const response2 = await fetch(`${BASE_URL}/api/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(job2Data),
    });

    const result2: ApiResponse = await response2.json();

    if (!response2.ok || !result2.success) {
      console.error("✗ 创建第二个岗位失败");
      return false;
    }

    console.log("✓ 创建第二个岗位成功:", result2.data.title);

    // 验证激活的岗位是第二个
    const activeResponse = await fetch(`${BASE_URL}/api/jobs/active`);
    const activeResult: ApiResponse = await activeResponse.json();

    if (activeResponse.ok && activeResult.success) {
      if (activeResult.data.id === result2.data.id) {
        console.log("✓ 验证成功 - 最新创建的岗位已激活");
        console.log("  激活岗位:", activeResult.data.title);
        return true;
      } else {
        console.error("✗ 验证失败 - 激活的岗位不是最新创建的");
        return false;
      }
    } else {
      console.error("✗ 获取激活岗位失败");
      return false;
    }
  } catch (error) {
    console.error("✗ 请求失败:", error);
    return false;
  }
}

/**
 * 主测试函数
 */
async function runTests() {
  console.log("开始测试岗位描述管理 API...");
  console.log("确保开发服务器正在运行: npm run dev");

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  // 测试 1: 创建岗位描述
  results.total++;
  const jobId = await testCreateJob();
  if (jobId) results.passed++;
  else results.failed++;

  // 测试 2: 获取激活岗位描述
  results.total++;
  const getActiveSuccess = await testGetActiveJob();
  if (getActiveSuccess) results.passed++;
  else results.failed++;

  // 测试 3: 验证 - 空标题
  results.total++;
  const validationTitle = await testValidationEmptyTitle();
  if (validationTitle) results.passed++;
  else results.failed++;

  // 测试 4: 验证 - 空描述
  results.total++;
  const validationDesc = await testValidationEmptyDescription();
  if (validationDesc) results.passed++;
  else results.failed++;

  // 测试 5: 验证 - 无必备技能
  results.total++;
  const validationSkills = await testValidationNoRequiredSkills();
  if (validationSkills) results.passed++;
  else results.failed++;

  // 测试 6: 多次创建岗位
  results.total++;
  const multipleJobs = await testMultipleJobCreation();
  if (multipleJobs) results.passed++;
  else results.failed++;

  // 总结
  console.log("\n=================================");
  console.log("测试总结");
  console.log("=================================");
  console.log(`总测试数: ${results.total}`);
  console.log(`通过: ${results.passed}`);
  console.log(`失败: ${results.failed}`);
  console.log(
    `成功率: ${((results.passed / results.total) * 100).toFixed(1)}%`
  );
  console.log("=================================\n");

  if (results.failed > 0) {
    process.exit(1);
  }
}

// 运行测试
runTests().catch((error) => {
  console.error("测试运行失败:", error);
  process.exit(1);
});
