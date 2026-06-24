/**
 * 测试候选人列表 API
 * 用法: npx tsx scripts/test-candidates-list-api.ts
 */

async function testCandidatesListAPI() {
  const baseUrl = "http://localhost:3000";
  
  console.log("=== 测试候选人列表 API ===\n");

  // 测试 1: 获取基本列表（默认参数）
  console.log("1. 测试获取基本列表（默认参数）");
  try {
    const response = await fetch(`${baseUrl}/api/candidates`);
    const data = await response.json();
    
    if (response.ok) {
      console.log("✓ 成功获取候选人列表");
      console.log(`  - 总数: ${data.data.total}`);
      console.log(`  - 当前页: ${data.data.page}`);
      console.log(`  - 每页大小: ${data.data.pageSize}`);
      console.log(`  - 总页数: ${data.data.totalPages}`);
      console.log(`  - 候选人数量: ${data.data.items.length}`);
      
      if (data.data.items.length > 0) {
        console.log("\n  第一个候选人:");
        const first = data.data.items[0];
        console.log(`    - ID: ${first.id}`);
        console.log(`    - 姓名: ${first.name || "未提取"}`);
        console.log(`    - 状态: ${first.status}`);
        console.log(`    - 创建时间: ${first.createdAt}`);
        if (first.matchScore) {
          console.log(`    - 总评分: ${first.matchScore.overallScore}`);
        }
      }
    } else {
      console.log(`✗ 失败: ${data.error}`);
    }
  } catch (error) {
    console.error("✗ 请求失败:", error);
  }
  
  console.log("\n" + "=".repeat(50) + "\n");

  // 测试 2: 分页测试
  console.log("2. 测试分页（page=1, pageSize=5）");
  try {
    const response = await fetch(`${baseUrl}/api/candidates?page=1&pageSize=5`);
    const data = await response.json();
    
    if (response.ok) {
      console.log("✓ 成功获取分页结果");
      console.log(`  - 返回候选人数量: ${data.data.items.length}`);
      console.log(`  - 每页大小: ${data.data.pageSize}`);
    } else {
      console.log(`✗ 失败: ${data.error}`);
    }
  } catch (error) {
    console.error("✗ 请求失败:", error);
  }
  
  console.log("\n" + "=".repeat(50) + "\n");

  // 测试 3: 按评分排序
  console.log("3. 测试按评分降序排序");
  try {
    const response = await fetch(
      `${baseUrl}/api/candidates?sortBy=score&sortOrder=desc&pageSize=5`
    );
    const data = await response.json();
    
    if (response.ok) {
      console.log("✓ 成功获取排序结果");
      console.log("  候选人评分:");
      data.data.items.forEach((candidate: any, index: number) => {
        const score = candidate.matchScore?.overallScore || "无评分";
        console.log(`    ${index + 1}. ${candidate.name || "未知"} - 评分: ${score}`);
      });
    } else {
      console.log(`✗ 失败: ${data.error}`);
    }
  } catch (error) {
    console.error("✗ 请求失败:", error);
  }
  
  console.log("\n" + "=".repeat(50) + "\n");

  // 测试 4: 按上传时间排序
  console.log("4. 测试按上传时间升序排序");
  try {
    const response = await fetch(
      `${baseUrl}/api/candidates?sortBy=uploadTime&sortOrder=asc&pageSize=3`
    );
    const data = await response.json();
    
    if (response.ok) {
      console.log("✓ 成功获取排序结果");
      console.log("  候选人上传时间:");
      data.data.items.forEach((candidate: any, index: number) => {
        console.log(`    ${index + 1}. ${candidate.name || "未知"} - ${candidate.createdAt}`);
      });
    } else {
      console.log(`✗ 失败: ${data.error}`);
    }
  } catch (error) {
    console.error("✗ 请求失败:", error);
  }
  
  console.log("\n" + "=".repeat(50) + "\n");

  // 测试 5: 技能筛选
  console.log("5. 测试技能筛选（JavaScript,React）");
  try {
    const response = await fetch(
      `${baseUrl}/api/candidates?skills=JavaScript,React`
    );
    const data = await response.json();
    
    if (response.ok) {
      console.log("✓ 成功获取筛选结果");
      console.log(`  - 符合条件的候选人数量: ${data.data.total}`);
      if (data.data.items.length > 0) {
        console.log("  符合条件的候选人:");
        data.data.items.slice(0, 3).forEach((candidate: any, index: number) => {
          console.log(`    ${index + 1}. ${candidate.name || "未知"}`);
        });
      }
    } else {
      console.log(`✗ 失败: ${data.error}`);
    }
  } catch (error) {
    console.error("✗ 请求失败:", error);
  }
  
  console.log("\n" + "=".repeat(50) + "\n");

  // 测试 6: 关键词搜索
  console.log("6. 测试关键词搜索（search=软件）");
  try {
    const response = await fetch(
      `${baseUrl}/api/candidates?search=${encodeURIComponent("软件")}`
    );
    const data = await response.json();
    
    if (response.ok) {
      console.log("✓ 成功获取搜索结果");
      console.log(`  - 匹配的候选人数量: ${data.data.total}`);
      if (data.data.items.length > 0) {
        console.log("  匹配的候选人:");
        data.data.items.slice(0, 3).forEach((candidate: any, index: number) => {
          console.log(`    ${index + 1}. ${candidate.name || "未知"}`);
        });
      }
    } else {
      console.log(`✗ 失败: ${data.error}`);
    }
  } catch (error) {
    console.error("✗ 请求失败:", error);
  }
  
  console.log("\n" + "=".repeat(50) + "\n");

  // 测试 7: 组合查询（搜索 + 排序 + 分页）
  console.log("7. 测试组合查询（搜索 + 按评分排序 + 分页）");
  try {
    const response = await fetch(
      `${baseUrl}/api/candidates?search=${encodeURIComponent("开发")}&sortBy=score&sortOrder=desc&page=1&pageSize=5`
    );
    const data = await response.json();
    
    if (response.ok) {
      console.log("✓ 成功获取组合查询结果");
      console.log(`  - 总数: ${data.data.total}`);
      console.log(`  - 当前返回: ${data.data.items.length} 个候选人`);
    } else {
      console.log(`✗ 失败: ${data.error}`);
    }
  } catch (error) {
    console.error("✗ 请求失败:", error);
  }
  
  console.log("\n" + "=".repeat(50) + "\n");

  // 测试 8: 无效参数测试
  console.log("8. 测试无效参数（page=-1）");
  try {
    const response = await fetch(`${baseUrl}/api/candidates?page=-1`);
    const data = await response.json();
    
    if (!response.ok && response.status === 400) {
      console.log("✓ 正确返回 400 错误");
      console.log(`  - 错误信息: ${data.error}`);
      console.log(`  - 错误代码: ${data.code}`);
    } else {
      console.log("✗ 应该返回 400 错误");
    }
  } catch (error) {
    console.error("✗ 请求失败:", error);
  }
  
  console.log("\n" + "=".repeat(50) + "\n");

  // 测试 9: 无效排序字段
  console.log("9. 测试无效排序字段（sortBy=invalid）");
  try {
    const response = await fetch(`${baseUrl}/api/candidates?sortBy=invalid`);
    const data = await response.json();
    
    if (!response.ok && response.status === 400) {
      console.log("✓ 正确返回 400 错误");
      console.log(`  - 错误信息: ${data.error}`);
    } else {
      console.log("✗ 应该返回 400 错误");
    }
  } catch (error) {
    console.error("✗ 请求失败:", error);
  }
  
  console.log("\n=== 测试完成 ===");
}

// 运行测试
testCandidatesListAPI().catch(console.error);
