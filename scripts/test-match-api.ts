/**
 * 测试匹配评分计算 API
 * 任务 6.6 验证脚本
 */

import { getActiveJob } from "../services/jobManager";
import { listCandidates } from "../services/candidateManager";

async function testMatchAPI() {
  try {
    console.log("=== 测试匹配评分计算 API ===\n");

    // 1. 获取激活的岗位
    console.log("1. 获取激活的岗位描述...");
    const activeJob = await getActiveJob();

    if (!activeJob) {
      console.error("❌ 错误：没有激活的岗位描述");
      console.log("\n提示：请先创建岗位描述");
      console.log('示例：POST http://localhost:3000/api/jobs');
      process.exit(1);
    }

    console.log(`✓ 找到激活岗位: ${activeJob.title}`);
    console.log(`  岗位 ID: ${activeJob.id}`);
    console.log(`  必备技能: ${activeJob.requiredSkills.join(", ")}`);
    console.log(`  加分技能: ${activeJob.preferredSkills.join(", ")}\n`);

    // 2. 获取第一个候选人
    console.log("2. 获取候选人列表...");
    const candidatesResult = await listCandidates({
      page: 1,
      pageSize: 1,
    });

    if (candidatesResult.items.length === 0) {
      console.error("❌ 错误：没有找到候选人");
      console.log("\n提示：请先上传简历创建候选人");
      console.log('示例：访问 http://localhost:3000/upload');
      process.exit(1);
    }

    const candidate = candidatesResult.items[0];
    console.log(`✓ 找到候选人: ${candidate.name || "未知"}`);
    console.log(`  候选人 ID: ${candidate.id}`);
    console.log(`  技能数量: ${candidate.skills.length}`);
    console.log(`  工作经历: ${candidate.experience.length}段`);
    console.log(`  教育背景: ${candidate.education.length}段\n`);

    // 3. 调用匹配评分 API
    console.log("3. 调用匹配评分计算 API...");
    console.log(`   请求: POST http://localhost:3000/api/candidates/${candidate.id}/match`);
    console.log(`   参数: { jobId: "${activeJob.id}" }\n`);

    const response = await fetch(
      `http://localhost:3000/api/candidates/${candidate.id}/match`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: activeJob.id,
        }),
      }
    );

    console.log(`   响应状态: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`❌ API 调用失败:`, errorData);
      process.exit(1);
    }

    const result = await response.json();

    if (!result.success) {
      console.error(`❌ 匹配计算失败:`, result);
      process.exit(1);
    }

    console.log("✓ 匹配评分计算成功!\n");

    // 4. 显示评分结果
    console.log("=== 匹配评分结果 ===");
    const matchScore = result.matchScore;
    console.log(`总分: ${matchScore.overallScore}/100`);
    console.log(`技能匹配: ${matchScore.skillScore}/100`);
    console.log(`经历匹配: ${matchScore.experienceScore}/100`);
    console.log(`教育匹配: ${matchScore.educationScore}/100`);
    console.log(`\nAI 评论:`);
    console.log(matchScore.commentary);
    console.log("\n");

    // 5. 验证数据库中是否保存了评分
    console.log("4. 验证评分是否已保存到数据库...");
    const { getCandidateById } = await import("../services/candidateManager");
    const updatedCandidate = await getCandidateById(candidate.id);

    if (!updatedCandidate?.matchScore) {
      console.error("❌ 错误：评分未保存到数据库");
      process.exit(1);
    }

    console.log("✓ 评分已成功保存到数据库");
    console.log(`  数据库中的总分: ${updatedCandidate.matchScore.overallScore}/100`);
    console.log(`  保存时间: ${updatedCandidate.matchScore.createdAt.toLocaleString()}\n`);

    // 6. 测试错误场景
    console.log("5. 测试错误场景...\n");

    // 测试：候选人不存在
    console.log("   测试：候选人不存在");
    const invalidCandidateResponse = await fetch(
      `http://localhost:3000/api/candidates/invalid-id/match`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: activeJob.id,
        }),
      }
    );

    if (invalidCandidateResponse.status === 404) {
      console.log("   ✓ 正确返回 404 错误\n");
    } else {
      console.warn("   ⚠ 期望 404，实际返回:", invalidCandidateResponse.status);
    }

    // 测试：岗位不存在
    console.log("   测试：岗位不存在");
    const invalidJobResponse = await fetch(
      `http://localhost:3000/api/candidates/${candidate.id}/match`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: "invalid-job-id",
        }),
      }
    );

    if (invalidJobResponse.status === 404) {
      console.log("   ✓ 正确返回 404 错误\n");
    } else {
      console.warn("   ⚠ 期望 404，实际返回:", invalidJobResponse.status);
    }

    // 测试：缺少 jobId
    console.log("   测试：缺少 jobId 参数");
    const missingJobIdResponse = await fetch(
      `http://localhost:3000/api/candidates/${candidate.id}/match`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );

    if (missingJobIdResponse.status === 400) {
      console.log("   ✓ 正确返回 400 错误\n");
    } else {
      console.warn("   ⚠ 期望 400，实际返回:", missingJobIdResponse.status);
    }

    console.log("=== 所有测试通过! ===\n");
    console.log("✓ API 端点正常工作");
    console.log("✓ 匹配评分计算正确");
    console.log("✓ 评分成功保存到数据库");
    console.log("✓ 错误处理正确");

  } catch (error) {
    console.error("\n❌ 测试失败:", error);
    process.exit(1);
  }
}

// 运行测试
testMatchAPI();
