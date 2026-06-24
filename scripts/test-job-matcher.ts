/**
 * 测试岗位匹配服务
 * 
 * 运行方式:
 * npx tsx scripts/test-job-matcher.ts
 */

import {
  calculateSkillScore,
  calculateExperienceScore,
  calculateEducationScore,
  calculateMatch,
} from "@/services/jobMatcher";
import type { Candidate, JobDescription, Skills, Education, Experience } from "@/types";

console.log("=".repeat(60));
console.log("测试岗位匹配服务");
console.log("=".repeat(60));

// 测试数据 - 候选人技能
const testSkills: Skills = {
  technical: ["JavaScript", "TypeScript", "React", "Node.js", "Python"],
  tools: ["Git", "Docker", "VS Code"],
  languages: ["中文", "英语"],
};

// 测试数据 - 岗位必备技能
const requiredSkills = ["JavaScript", "React", "Node.js"];
const preferredSkills = ["TypeScript", "Docker", "AWS"];

console.log("\n📊 测试 1: 技能匹配评分");
console.log("-".repeat(60));
console.log("候选人技能:", JSON.stringify(testSkills, null, 2));
console.log("必备技能:", requiredSkills.join(", "));
console.log("加分技能:", preferredSkills.join(", "));

const skillScore = calculateSkillScore(testSkills, requiredSkills, preferredSkills);
console.log(`\n✅ 技能匹配分数: ${skillScore}/100`);

// 测试大小写不敏感
console.log("\n📊 测试 2: 技能匹配 - 大小写不敏感");
console.log("-".repeat(60));
const testSkills2: Skills = {
  technical: ["javascript", "REACT", "nodejs"],
  tools: ["git"],
  languages: [],
};
const skillScore2 = calculateSkillScore(testSkills2, requiredSkills, preferredSkills);
console.log("候选人技能 (混合大小写):", testSkills2.technical.join(", "));
console.log(`✅ 技能匹配分数: ${skillScore2}/100`);

// 测试经历评分 (需要 AI)
console.log("\n📊 测试 3: 工作经历评分 (AI)");
console.log("-".repeat(60));

const testExperience: Experience[] = [
  {
    id: "exp1",
    candidateId: "test",
    company: "字节跳动",
    title: "全栈工程师",
    startDate: "2021-01",
    endDate: "2023-12",
    responsibilities: "负责使用 React 和 Node.js 开发公司内部管理系统，参与前后端架构设计，优化系统性能",
  },
  {
    id: "exp2",
    candidateId: "test",
    company: "腾讯",
    title: "前端开发实习生",
    startDate: "2020-06",
    endDate: "2020-12",
    responsibilities: "使用 Vue.js 开发移动端 H5 页面，配合后端完成接口对接",
  },
];

const jobDescription = `
职位: 高级全栈工程师

我们正在寻找一位经验丰富的全栈工程师，负责开发和维护公司的核心业务系统。

岗位要求:
- 3年以上全栈开发经验
- 精通 JavaScript/TypeScript
- 熟练使用 React 进行前端开发
- 熟练使用 Node.js 进行后端开发
- 有大型项目架构经验
- 良好的代码质量意识
`;

(async () => {
  try {
    const experienceScore = await calculateExperienceScore(
      testExperience,
      jobDescription
    );
    console.log(`✅ 工作经历分数: ${experienceScore}/100`);

    // 测试教育评分 (需要 AI)
    console.log("\n📊 测试 4: 教育背景评分 (AI)");
    console.log("-".repeat(60));

    const testEducation: Education[] = [
      {
        id: "edu1",
        candidateId: "test",
        school: "北京大学",
        major: "计算机科学与技术",
        degree: "本科",
        graduationTime: "2020-06",
      },
    ];

    const educationScore = await calculateEducationScore(
      testEducation,
      jobDescription
    );
    console.log(`✅ 教育背景分数: ${educationScore}/100`);

    // 测试综合匹配
    console.log("\n📊 测试 5: 综合匹配评分");
    console.log("-".repeat(60));

    const testCandidate: Candidate = {
      id: "test-candidate-1",
      name: "张三",
      phone: "13800138000",
      email: "zhangsan@example.com",
      city: "北京",
      fileName: "zhangsan-resume.pdf",
      filePath: "/uploads/zhangsan-resume.pdf",
      fileSize: 1024000,
      status: "待筛选",
      createdAt: new Date(),
      updatedAt: new Date(),
      education: testEducation,
      experience: testExperience,
      skills: [
        { id: "s1", candidateId: "test-candidate-1", skillType: "technical", skillName: "JavaScript" },
        { id: "s2", candidateId: "test-candidate-1", skillType: "technical", skillName: "TypeScript" },
        { id: "s3", candidateId: "test-candidate-1", skillType: "technical", skillName: "React" },
        { id: "s4", candidateId: "test-candidate-1", skillType: "technical", skillName: "Node.js" },
        { id: "s5", candidateId: "test-candidate-1", skillType: "technical", skillName: "Python" },
        { id: "s6", candidateId: "test-candidate-1", skillType: "tool", skillName: "Git" },
        { id: "s7", candidateId: "test-candidate-1", skillType: "tool", skillName: "Docker" },
      ],
    };

    const testJob: JobDescription = {
      id: "test-job-1",
      title: "高级全栈工程师",
      description: jobDescription,
      requiredSkills: ["JavaScript", "React", "Node.js"],
      preferredSkills: ["TypeScript", "Docker", "AWS"],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const matchResult = await calculateMatch(testCandidate, testJob);

    console.log("\n🎯 匹配结果:");
    console.log(`   总分: ${matchResult.overallScore}/100`);
    console.log(`   技能: ${matchResult.skillScore}/100`);
    console.log(`   经历: ${matchResult.experienceScore}/100`);
    console.log(`   教育: ${matchResult.educationScore}/100`);
    console.log(`\n💬 AI 评论:\n${matchResult.commentary}`);

    console.log("\n" + "=".repeat(60));
    console.log("✅ 所有测试完成!");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n❌ 测试失败:", error);
    process.exit(1);
  }
})();
