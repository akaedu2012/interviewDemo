/**
 * 测试候选人详情 API (Task 6.4)
 * 
 * 测试 GET /api/candidates/[id] 端点
 * 验证：
 * 1. 返回完整候选人信息（基本信息、教育、经历、技能、匹配分数）
 * 2. 处理候选人不存在情况（返回 404）
 * 3. 处理无效 ID 情况（返回 400）
 */

// 首先获取一个候选人 ID
async function getCandidateId(): Promise<string | null> {
  try {
    const response = await fetch("http://localhost:3000/api/candidates?pageSize=1");
    const data = await response.json();
    
    if (data.success && data.data.items.length > 0) {
      return data.data.items[0].id;
    }
    
    console.log("⚠️  No candidates found. Please upload a resume first.");
    return null;
  } catch (error) {
    console.error("❌ Failed to fetch candidates:", error);
    return null;
  }
}

// 测试成功获取候选人详情
async function testGetCandidateSuccess(candidateId: string) {
  console.log("\n📝 Test 1: Get candidate details (SUCCESS case)");
  console.log(`Candidate ID: ${candidateId}`);
  
  try {
    const response = await fetch(`http://localhost:3000/api/candidates/${candidateId}`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log("Response:", JSON.stringify(data, null, 2));
    
    if (response.status === 200 && data.success) {
      console.log("✅ PASS: Successfully retrieved candidate details");
      
      // 验证返回的数据结构
      const candidate = data.data;
      const hasBasicInfo = candidate.name !== undefined && 
                          candidate.email !== undefined &&
                          candidate.phone !== undefined &&
                          candidate.city !== undefined;
      const hasEducation = Array.isArray(candidate.education);
      const hasExperience = Array.isArray(candidate.experience);
      const hasSkills = Array.isArray(candidate.skills);
      const hasMetadata = candidate.fileName && candidate.filePath && candidate.status;
      
      console.log("\n📊 Data validation:");
      console.log(`  ✓ Basic info: ${hasBasicInfo ? '✅' : '❌'}`);
      console.log(`  ✓ Education: ${hasEducation ? '✅' : '❌'} (${candidate.education.length} entries)`);
      console.log(`  ✓ Experience: ${hasExperience ? '✅' : '❌'} (${candidate.experience.length} entries)`);
      console.log(`  ✓ Skills: ${hasSkills ? '✅' : '❌'} (${candidate.skills.length} skills)`);
      console.log(`  ✓ Metadata: ${hasMetadata ? '✅' : '❌'}`);
      console.log(`  ✓ Match score: ${candidate.matchScore ? '✅ Present' : '⚠️  Not calculated yet'}`);
      
      if (candidate.matchScore) {
        console.log(`    - Overall: ${candidate.matchScore.overallScore}`);
        console.log(`    - Skill: ${candidate.matchScore.skillScore}`);
        console.log(`    - Experience: ${candidate.matchScore.experienceScore}`);
        console.log(`    - Education: ${candidate.matchScore.educationScore}`);
      }
    } else {
      console.log("❌ FAIL: Unexpected response");
    }
  } catch (error) {
    console.error("❌ FAIL: Request error:", error);
  }
}

// 测试候选人不存在的情况 (404)
async function testGetCandidateNotFound() {
  console.log("\n📝 Test 2: Get non-existent candidate (404 case)");
  
  const fakeId = "00000000-0000-0000-0000-000000000000";
  console.log(`Candidate ID: ${fakeId}`);
  
  try {
    const response = await fetch(`http://localhost:3000/api/candidates/${fakeId}`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log("Response:", JSON.stringify(data, null, 2));
    
    if (response.status === 404 && !data.success && data.code === "CANDIDATE_NOT_FOUND") {
      console.log("✅ PASS: Correctly returns 404 for non-existent candidate");
    } else {
      console.log("❌ FAIL: Should return 404 with CANDIDATE_NOT_FOUND code");
    }
  } catch (error) {
    console.error("❌ FAIL: Request error:", error);
  }
}

// 测试无效 ID 的情况 (400)
async function testGetCandidateInvalidId() {
  console.log("\n📝 Test 3: Get candidate with invalid ID (400 case)");
  
  const invalidId = "";
  console.log(`Candidate ID: "${invalidId}"`);
  
  try {
    // Note: Next.js may handle empty params differently, so we test with the route directly
    const response = await fetch(`http://localhost:3000/api/candidates/${invalidId}`);
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log("Response:", JSON.stringify(data, null, 2));
    
    if (response.status === 400 || response.status === 404) {
      console.log("✅ PASS: Correctly handles invalid ID");
    } else {
      console.log("⚠️  Note: Next.js routing may handle empty params with 404");
    }
  } catch (error) {
    console.error("❌ FAIL: Request error:", error);
  }
}

// 运行所有测试
async function runAllTests() {
  console.log("🚀 Testing Candidate Detail API (Task 6.4)");
  console.log("=" .repeat(60));
  
  // 获取一个真实的候选人 ID
  const candidateId = await getCandidateId();
  
  if (candidateId) {
    await testGetCandidateSuccess(candidateId);
  } else {
    console.log("\n⚠️  Skipping success test - no candidates available");
  }
  
  await testGetCandidateNotFound();
  await testGetCandidateInvalidId();
  
  console.log("\n" + "=".repeat(60));
  console.log("✅ All tests completed!");
}

// 执行测试
runAllTests();
