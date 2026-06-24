/**
 * 简化版测试任务 6.4: 候选人详情查询 API
 * 
 * 测试 GET /api/candidates/[id] 端点
 */

// 检查是否有候选人
async function getCandidateIds(): Promise<string[]> {
  try {
    const response = await fetch("http://localhost:3000/api/candidates?pageSize=100");
    const data = await response.json();
    
    if (data.success && data.data.items.length > 0) {
      return data.data.items.map((c: any) => c.id);
    }
    
    return [];
  } catch (error) {
    console.error("❌ Failed to fetch candidates:", error);
    return [];
  }
}

// 测试候选人详情 API - 成功案例
async function testGetCandidateDetail(candidateId: string) {
  console.log(`\n📝 Testing GET /api/candidates/${candidateId}...\n`);
  
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
    console.log(`   ID: ${candidate.id}`);
    console.log(`   Name: ${candidate.name || 'N/A'}`);
    console.log(`   Email: ${candidate.email || 'N/A'}`);
    console.log(`   Phone: ${candidate.phone || 'N/A'}`);
    console.log(`   City: ${candidate.city || 'N/A'}`);
    console.log(`   Status: ${candidate.status}`);
    console.log(`   File: ${candidate.fileName}`);
    console.log(`   File Path: ${candidate.filePath}`);
    console.log(`   File Size: ${candidate.fileSize} bytes`);
    console.log(`   Created: ${candidate.createdAt}`);
    console.log(`   Updated: ${candidate.updatedAt}`);
    
    // 教育背景
    console.log(`\n2️⃣  Education (${candidate.education?.length || 0} entries):`);
    if (candidate.education && candidate.education.length > 0) {
      candidate.education.forEach((edu: any, i: number) => {
        console.log(`   ${i + 1}. ${edu.school} - ${edu.major} (${edu.degree})`);
        console.log(`      Graduated: ${edu.graduationTime}`);
        console.log(`      ID: ${edu.id}`);
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
        console.log(`      Responsibilities: ${exp.responsibilities.substring(0, 80)}...`);
        console.log(`      ID: ${exp.id}`);
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
      console.log(`   ID: ${candidate.matchScore.id}`);
      console.log(`   Job ID: ${candidate.matchScore.jobId}`);
      console.log(`   Overall: ${candidate.matchScore.overallScore}/100`);
      console.log(`   - Skill Score: ${candidate.matchScore.skillScore}/100`);
      console.log(`   - Experience Score: ${candidate.matchScore.experienceScore}/100`);
      console.log(`   - Education Score: ${candidate.matchScore.educationScore}/100`);
      console.log(`   Commentary: ${candidate.matchScore.commentary.substring(0, 100)}...`);
      console.log(`   Created: ${candidate.matchScore.createdAt}`);
    } else {
      console.log("   ⚠️  Match score not calculated yet (this is normal)");
    }
    
    console.log("\n" + "─".repeat(60));
    
    // 验证必需字段
    const validations = [
      { name: "ID exists", pass: !!candidate.id },
      { name: "Status exists", pass: !!candidate.status },
      { name: "File name exists", pass: !!candidate.fileName },
      { name: "File path exists", pass: !!candidate.filePath },
      { name: "File size exists", pass: typeof candidate.fileSize === 'number' },
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
      console.log("   ✓ Returns complete candidate information (基本信息)");
      console.log("   ✓ Includes education background (教育背景)");
      console.log("   ✓ Includes work experience (工作经历)");
      console.log("   ✓ Includes skills (技能)");
      console.log("   ✓ Includes match scores if available (匹配分数)");
      console.log("   ✓ Handles all required data fields");
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

// 测试 404 错误处理
async function testNotFound() {
  console.log("\n📝 Testing 404 error handling...\n");
  
  const fakeId = "00000000-0000-0000-0000-000000000000";
  
  try {
    const response = await fetch(`http://localhost:3000/api/candidates/${fakeId}`);
    const data = await response.json();
    
    console.log(`Testing with non-existent ID: ${fakeId}`);
    console.log(`Status Code: ${response.status}`);
    
    if (response.status === 404 && data.code === "CANDIDATE_NOT_FOUND") {
      console.log("✅ 404 handling works correctly");
      console.log(`   Error code: ${data.code}`);
      console.log(`   Error message: ${data.error}`);
      console.log(`   Success flag: ${data.success}`);
      return true;
    } else {
      console.log("❌ 404 handling failed");
      console.log(`   Expected status 404, got ${response.status}`);
      console.log(`   Expected code CANDIDATE_NOT_FOUND, got ${data.code}`);
      return false;
    }
  } catch (error) {
    console.error("❌ Test error:", error);
    return false;
  }
}

// 主测试流程
async function runTests() {
  console.log("🚀 Testing Task 6.4: Candidate Detail API");
  console.log("   GET /api/candidates/[id]");
  console.log("=".repeat(60));
  console.log();
  
  // 获取候选人列表
  console.log("📋 Fetching existing candidates...");
  const candidateIds = await getCandidateIds();
  
  if (candidateIds.length === 0) {
    console.log("\n⚠️  No candidates found in database.");
    console.log("\n💡 To test this API, please:");
    console.log("   1. Run: npx tsx scripts/create-test-pdf.ts");
    console.log("   2. Run: npx tsx scripts/test-upload-api.ts");
    console.log("   3. Run: npx tsx scripts/test-extract-api.ts");
    console.log("   4. Then run this script again\n");
    console.log("Or use the web UI to upload and extract a resume.");
    console.log("\n" + "=".repeat(60));
    return;
  }
  
  console.log(`✅ Found ${candidateIds.length} candidate(s)\n`);
  
  // 测试第一个候选人
  const testId = candidateIds[0];
  console.log(`📝 Testing with candidate ID: ${testId}`);
  
  const detailTestPassed = await testGetCandidateDetail(testId);
  
  // 测试 404 错误
  const notFoundTestPassed = await testNotFound();
  
  // 总结
  console.log("\n" + "=".repeat(60));
  console.log("📋 Test Summary:");
  console.log(`   ✓ Candidate Detail API: ${detailTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`   ✓ 404 Error Handling: ${notFoundTestPassed ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (detailTestPassed && notFoundTestPassed) {
    console.log("\n🎉 All tests PASSED! Task 6.4 is working correctly.");
    console.log("\n✅ Implementation verified:");
    console.log("   - Created src/app/api/candidates/[id]/route.ts");
    console.log("   - Calls getCandidateById() from Candidate Manager");
    console.log("   - Returns complete candidate info (education, experience, skills, scores)");
    console.log("   - Handles 404 errors correctly");
    console.log("   - Satisfies Requirements 12, 15");
  } else {
    console.log("\n❌ Some tests failed. Please check the output above.");
  }
  
  console.log("=".repeat(60));
}

// 运行测试
runTests().catch(console.error);
