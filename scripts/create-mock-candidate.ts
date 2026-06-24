/**
 * 创建模拟候选人数据用于测试
 * 直接插入数据库，绕过 AI 提取步骤
 */

import { db } from "../db";
import { candidates, education, experience, skills, matchScores, jobDescriptions } from "../db/schema";
import { randomUUID } from "crypto";

async function createMockCandidate() {
  console.log("📝 Creating mock candidate for testing...\n");
  
  try {
    // 1. 创建候选人基本信息
    const candidateId = randomUUID();
    const fileName = "mock-resume.pdf";
    const filePath = "/uploads/test-resume.pdf";
    
    await db.insert(candidates).values({
      id: candidateId,
      name: "张三 (Zhang San)",
      phone: "+86-138-0000-0000",
      email: "zhangsan@example.com",
      city: "北京 Beijing",
      fileName: fileName,
      filePath: filePath,
      fileSize: 736,
      status: "待筛选",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    console.log(`✅ Created candidate: ${candidateId}`);
    console.log(`   Name: 张三 (Zhang San)`);
    console.log(`   Email: zhangsan@example.com\n`);
    
    // 2. 创建教育背景
    const educationId1 = randomUUID();
    const educationId2 = randomUUID();
    
    await db.insert(education).values([
      {
        id: educationId1,
        candidateId: candidateId,
        school: "清华大学 Tsinghua University",
        major: "计算机科学与技术 Computer Science",
        degree: "本科 Bachelor",
        graduationTime: "2018-06",
      },
      {
        id: educationId2,
        candidateId: candidateId,
        school: "北京大学 Peking University",
        major: "软件工程 Software Engineering",
        degree: "硕士 Master",
        graduationTime: "2020-06",
      },
    ]);
    
    console.log("✅ Created 2 education entries");
    
    // 3. 创建工作经历
    const experienceId1 = randomUUID();
    const experienceId2 = randomUUID();
    
    await db.insert(experience).values([
      {
        id: experienceId1,
        candidateId: candidateId,
        company: "阿里巴巴集团 Alibaba Group",
        title: "高级前端工程师 Senior Frontend Engineer",
        startDate: "2020-07",
        endDate: "2022-12",
        responsibilities: "负责电商平台前端架构设计和开发。使用 React、TypeScript、Next.js 等技术栈。带领5人团队完成多个核心业务模块。优化页面性能，首屏加载时间减少40%。",
      },
      {
        id: experienceId2,
        candidateId: candidateId,
        company: "腾讯科技 Tencent",
        title: "全栈工程师 Full Stack Engineer",
        startDate: "2023-01",
        endDate: "至今 Present",
        responsibilities: "负责微信小程序和后端 API 开发。使用 Node.js、Express、MongoDB 技术栈。参与系统架构升级，提升并发处理能力。实现CI/CD流程，提高部署效率。",
      },
    ]);
    
    console.log("✅ Created 2 work experience entries");
    
    // 4. 创建技能标签
    const skillsList = [
      { type: "language", name: "JavaScript" },
      { type: "language", name: "TypeScript" },
      { type: "language", name: "Python" },
      { type: "technical", name: "React" },
      { type: "technical", name: "Next.js" },
      { type: "technical", name: "Node.js" },
      { type: "technical", name: "Vue.js" },
      { type: "technical", name: "Express" },
      { type: "tool", name: "Git" },
      { type: "tool", name: "Docker" },
      { type: "tool", name: "MongoDB" },
      { type: "tool", name: "Redis" },
      { type: "tool", name: "Webpack" },
    ];
    
    const skillsToInsert = skillsList.map(skill => ({
      id: randomUUID(),
      candidateId: candidateId,
      skillType: skill.type,
      skillName: skill.name,
    }));
    
    await db.insert(skills).values(skillsToInsert);
    
    console.log(`✅ Created ${skillsList.length} skill entries`);
    
    // 5. 创建岗位描述（可选，用于匹配评分）
    const jobId = randomUUID();
    
    await db.insert(jobDescriptions).values({
      id: jobId,
      title: "高级全栈工程师 Senior Full Stack Engineer",
      description: "我们正在寻找一位经验丰富的全栈工程师，负责前后端开发工作。需要熟练掌握 React、Node.js 等现代 Web 技术栈。",
      requiredSkills: JSON.stringify(["JavaScript", "React", "Node.js", "TypeScript"]),
      preferredSkills: JSON.stringify(["Next.js", "MongoDB", "Docker", "AWS"]),
      isActive: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    console.log("✅ Created job description");
    
    // 6. 创建匹配评分
    const matchScoreId = randomUUID();
    
    await db.insert(matchScores).values({
      id: matchScoreId,
      candidateId: candidateId,
      jobId: jobId,
      overallScore: 87.5,
      skillScore: 92.0,
      experienceScore: 85.0,
      educationScore: 86.0,
      commentary: "候选人技能匹配度很高，具备所有必需技能（JavaScript、React、Node.js、TypeScript）。拥有5年相关工作经验，曾在阿里巴巴和腾讯担任高级工程师职位。教育背景优秀，来自清华大学和北京大学。综合评估为优秀候选人。",
      createdAt: new Date().toISOString(),
    });
    
    console.log("✅ Created match score");
    
    // 总结
    console.log("\n" + "=".repeat(60));
    console.log("🎉 Mock candidate created successfully!");
    console.log("\n📋 Summary:");
    console.log(`   Candidate ID: ${candidateId}`);
    console.log(`   Name: 张三 (Zhang San)`);
    console.log(`   Email: zhangsan@example.com`);
    console.log(`   Education: 2 entries`);
    console.log(`   Experience: 2 entries`);
    console.log(`   Skills: ${skillsList.length} skills`);
    console.log(`   Match Score: 87.5/100`);
    console.log("\n💡 You can now test the candidate detail API with:");
    console.log(`   curl http://localhost:3000/api/candidates/${candidateId}`);
    console.log(`   OR run: npx tsx scripts/test-task-6.4-simple.ts`);
    console.log("=".repeat(60));
    
  } catch (error) {
    console.error("❌ Error creating mock candidate:", error);
    throw error;
  }
}

createMockCandidate();
