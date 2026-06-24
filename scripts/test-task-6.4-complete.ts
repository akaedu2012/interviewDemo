/**
 * 完整测试任务 6.4: 候选人详情查询 API
 * 
 * 测试流程:
 * 1. 上传一个测试简历
 * 2. 触发 AI 提取
 * 3. 测试 GET /api/candidates/[id] 端点
 * 4. 验证返回的数据完整性
 */

import * as fs from "fs";
import * as path from "path";

// 等待函数
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 1. 上传测试简历
async function uploadTestResume(): Promise<string | null> {
  console.log("📤 Step 1: Uploading test resume...");
  
  try {
    const testPdfPath = path.join(process.cwd(), "public", "uploads", "test-resume.pdf");
    
    if (!fs.existsSync(testPdfPath)) {
      console.error("❌ Test PDF not found:", testPdfPath);
      return null;
    }
    
    const fileBuffer = fs.readFileSync(testPdfPath);
    const blob = new Blob([fileBuffer], { type: "application/pdf" });
    
    const formData = new FormData();
    formData.append("files", blob, "test-resume.pdf");
    
    const response = await fetch("http://localhost:3000/api/resumes/upload", {
      method: "POST",
      body: formData,
    });
    
    const data = await response.json();
    
    if (data.success && data.uploads.length > 0) {
      const fileId = data.uploads[0].fileId;
      console.log(`✅ Upload successful. File ID: ${fileId}\n`);
      return fileId;
    } else {
      console.error("❌ Upload failed:", data);
      return null;
    }
  } catch (error) {
    console.error("❌ Upload error:", error);
    return null;
  }
}

// 2. 触发 AI 提取并等待完成
async function extractResume(fileId: string): Promise<string | null> {
  console.log("🤖 Step 2: Extracting resume with AI...");
  console.log("   (This may take 30-60 seconds)\n");
  
  return new Promise((resolve) => {
    const eventSource = new EventSource(
      `http://localhost:3000/api/resumes/${fileId}/extract`
    );
    
    let candidateId: string | null = null;
    
    eventSource.addEventListener("progress", (event: any) => {
      const data = JSON.parse(event.data);
      console.log(`   Progress: ${data.stage}`);
    });
    
    eventSource.addEventListener("complete", (event: any) => {
      const data = JSON.parse(event.data);
      candidateId = data.candidateId;
      console.log(`✅ Extraction complete. Candidate ID: ${candidateId}\n`);
      eventSource.close();
      resolve(candidateId);
    });
    
    eventSource.addEventListener("error", (event: any) => {
      console.error("❌ Extraction error:", event);
      eventSource.close();
      resolve(null);
    });
    
    // Timeout after 120 seconds
    setTimeout(() => {
      console.error("❌ Extraction timeout");
      eventSource.close();
      resolve(null);
    }, 120000);
  });
}

// 3. 测试候选人详情 API - 成功案例
async function testGetCandidateDetail(candidateId: string) {
  console.log("📝 Step 3: Testing GET /api/candidates/[id]...\n");
  
  try {
    const response = await fetch(`http://localhost:3000/api/candidates/${candidateId}`);
    const data = await response.json();
    
    console.log(`Status Code: ${response.status}`);
    
    if (response.status !== 200) {
      console.error("❌ FAIL: Expected status 200, got", response.status);
      console.error("Response:", JSON.stringify(data, null, 2));
      return false;
    }
    
    if (!data.success) {
      console.error("❌ FAIL: Response success should be true");
      console.error("Response:", JSON.stringify(data, null, 2));
      return false;
    }
    
    const candidate = data.data;
    
    // 验证数据结构
    console.log("✅ Response structure valid\n");
    console.log("📊 Candidate Data:");
    console.log("─".repeat(60));
    
    // 基本信息
    console.log("\n1️⃣  Basic Information:");
    console.log(`   Name: ${candidate.name || 'N/A'}`);
    console.log(`   Email: ${candidate.email || 'N/A'}`);
    console.log(`   Phone: ${candidate.phone || 'N/A'}`);
    console.log(`   City: ${candidate.city || 'N/A'}`);
    console.log(`   Status: ${candidate.status}`);
    console.log(`   File: ${candidate.fileName}`);
    
    // 教育背景
    console.log(`\n2️⃣  Education (${candidate.education?.length || 0} entries):`);
    if (candidate.education && candidate.education.length > 0) {
      candidate.education.forEach((edu: any, i: number) => {
        console.log(`   ${i + 1}. ${edu.school} - ${edu.major} (${edu.degree})`);
        console.log(`      Graduated: ${edu.graduationTime}`);
      });
    } else {
      console.log("   No education data");
    }
    
    // 工作经历
    console.log(`\n3️⃣  Work Experience (${candidate.experience?.length || 0} entries):`);
    if (candidate.experience && candidate.experience.length > 0) {
      candidate.experience.forEach((exp: any, i: number) => {
        console.log(`   ${i + 1}. ${exp.title} at ${exp.company}`);
        console.log(`      Period: ${exp.startDate} to ${exp.endDate}`);
        console.log(`      Responsibilities: ${exp.responsibilities.substring(0, 100)}...`);
      });
    } else {
      console.log("   No work experience data");
    }
    
    // 技能
    console.log(`\n4️⃣  Skills (${candidate.skills?.length || 0} skills):`);
    if (candidate.skills && candidate.skills.length > 0) {
      const skillsByType = candidate.skills.reduce((acc: any, skill: any) => {
        if (!acc[skill.skillType]) acc[skill.skillType] = [];
        acc[skill.skillType].push(skill.skillName);
        return acc;
      }, {});
      
      Object.entries(skillsByType).forEach(([type, skills]: [string, any]) => {
        console.log(`   ${type}: ${skills.join(", ")}`);
      });
    } else {
      console.log("   No skills data");
    }
    
    // 匹配评分
    console.log(`\n5️⃣  Match Score:`);
    if (candidate.matchScore) {
      console.log(`   Overall: ${candidate.matchScore.overallScore}/100`);
      console.log(`   - Skill Score: ${candidate.matchScore.skillScore}/100`);
      console.log(`   - Experience Score: ${candidate.matchScore.experienceScore}/100`);
      console.log(`   - Education Score: ${candidate.matchScore.educationScore}/100`);
      console.log(`   Commentary: ${candidate.matchScore.commentary.substring(0, 100)}...`);
    } else {
      console.log("   ⚠️  Match score not calculated yet (this is OK)");
    }
    
    console.log("\n" + "─".repeat(60));
    
    // 验证必需字段
    const validations = [
      { name: "ID exists", pass: !!candidate.id },
      { name: "Status exists", pass: !!candidate.status },
      { name: "File name exists", pass: !!candidate.fileName },
      { name: "File path exists", pass: !!candidate.filePath },
      { name: "Education is array", pass: Array.isArray(candidate.education) },
      { name: "Experience is array", pass: Array.isArray(candidate.experience) },
      { name: "Skills is array", pass: Array.isArray(candidate.skills) },
      { name: "CreatedAt exists", pass: !!candidate.createdAt },
      { name: "UpdatedAt exists", pass: !!candidate.updatedAt },
    ];
    
    console.log("\n✅ Validation Results:");
    validations.forEach((v) => {
      console.log(`   ${v.pass ? '✅' : '❌'} ${v.name}`);
    });
    
    const allPassed = validations.every((v) => v.pass);
    
    if (allPassed) {
      console.log("\n🎉 Task 6.4 API Test PASSED!");
      console.log("   ✓ Returns complete candidate information");
      console.log("   ✓ Includes education, experience, skills");
      console.log("   ✓ Includes match scores (if available)");
      return true;
    } else {
      console.log("\n❌ Some validations failed");
      return false;
    }
    
  } catch (error) {
    console.error("❌ Test error:", error);
    return false;
  }
}

// 4. 测试 404 错误处理
async function testNotFound() {
  console.log("\n📝 Step 4: Testing 404 error handling...\n");
  
  const fakeId = "00000000-0000-0000-0000-000000000000";
  
  try {
    const response = await fetch(`http://localhost:3000/api/candidates/${fakeId}`);
    const data = await response.json();
    
    if (response.status === 404 && data.code === "CANDIDATE_NOT_FOUND") {
      console.log("✅ 404 handling works correctly");
      console.log(`   Status: ${response.status}`);
      console.log(`   Error code: ${data.code}`);
      console.log(`   Error message: ${data.error}`);
      return true;
    } else {
      console.log("❌ 404 handling failed");
      console.log(`   Expected status 404, got ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error("❌ Test error:", error);
    return false;
  }
}

// 主测试流程
async function runCompleteTest() {
  console.log("🚀 Complete Test for Task 6.4: Candidate Detail API");
  console.log("=".repeat(60));
  console.log();
  
  // 如果需要，可以导入 eventsource 用于 SSE
  try {
    const { default: EventSource } = await import("eventsource");
    (global as any).EventSource = EventSource;
  } catch (error) {
    console.log("⚠️  Installing eventsource package...");
    const { execSync } = await import("child_process");
    execSync("npm install --save-dev eventsource", { stdio: "inherit" });
    const { default: EventSource } = await import("eventsource");
    (global as any).EventSource = EventSource;
  }
  
  // Step 1: 上传简历
  const fileId = await uploadTestResume();
  if (!fileId) {
    console.error("❌ Failed to upload resume. Aborting test.");
    return;
  }
  
  // Step 2: 提取简历
  const candidateId = await extractResume(fileId);
  if (!candidateId) {
    console.error("❌ Failed to extract resume. Aborting test.");
    return;
  }
  
  // 等待数据库写入完成
  await sleep(2000);
  
  // Step 3: 测试获取候选人详情
  const detailTestPassed = await testGetCandidateDetail(candidateId);
  
  // Step 4: 测试 404 错误
  const notFoundTestPassed = await testNotFound();
  
  // 总结
  console.log("\n" + "=".repeat(60));
  console.log("📋 Test Summary:");
  console.log(`   Detail API Test: ${detailTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   404 Error Test: ${notFoundTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (detailTestPassed && notFoundTestPassed) {
    console.log("\n🎉 All tests PASSED! Task 6.4 is working correctly.");
  } else {
    console.log("\n❌ Some tests failed. Please check the output above.");
  }
  
  console.log("=".repeat(60));
}

// 运行测试
runCompleteTest().catch(console.error);
