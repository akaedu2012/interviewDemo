/**
 * AI提取服务测试脚本
 * 测试各个提取函数的功能
 */

import {
  extractBasicInfo,
  extractEducation,
  extractExperience,
  extractSkills,
  extractAll,
  extractAllSync,
} from "../services/aiExtractor";

// 模拟简历文本
const mockResumeText = `
张三
电话：138-1234-5678
邮箱：zhangsan@example.com
现居：北京市

教育背景：
2015-09 至 2019-06  清华大学  计算机科学与技术  本科
2019-09 至 2022-06  北京大学  软件工程  硕士

工作经历：
2022-07 至 至今  字节跳动  高级前端工程师
- 负责抖音电商前端架构设计和开发
- 使用 React、TypeScript 开发大型 Web 应用
- 优化首屏加载速度，提升用户体验

2021-07 至 2022-06  腾讯  前端开发实习生
- 参与微信小程序开发
- 使用 Vue.js 开发企业管理系统
- 学习并实践前端工程化

技能：
编程语言：JavaScript, TypeScript, Python, Java
前端技术：React, Vue.js, Next.js, Webpack, Vite
后端技术：Node.js, Express, NestJS
数据库：MySQL, MongoDB, Redis
工具：Git, Docker, Jenkins
`;

async function testBasicInfo() {
  console.log("\n========== 测试基本信息提取 ==========");
  try {
    const result = await extractBasicInfo(mockResumeText);
    console.log("提取结果:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("测试失败:", error);
  }
}

async function testEducation() {
  console.log("\n========== 测试教育背景提取 ==========");
  try {
    const result = await extractEducation(mockResumeText);
    console.log("提取结果:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("测试失败:", error);
  }
}

async function testExperience() {
  console.log("\n========== 测试工作经历提取 ==========");
  try {
    const result = await extractExperience(mockResumeText);
    console.log("提取结果:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("测试失败:", error);
  }
}

async function testSkills() {
  console.log("\n========== 测试技能提取 ==========");
  try {
    const result = await extractSkills(mockResumeText);
    console.log("提取结果:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("测试失败:", error);
  }
}

async function testExtractAll() {
  console.log("\n========== 测试流式提取 ==========");
  try {
    for await (const progress of extractAll(mockResumeText)) {
      console.log(`\n阶段: ${progress.stage}`);
      console.log("数据:", JSON.stringify(progress.data, null, 2));
    }
  } catch (error) {
    console.error("测试失败:", error);
  }
}

async function testExtractAllSync() {
  console.log("\n========== 测试同步提取 ==========");
  try {
    const result = await extractAllSync(mockResumeText);
    console.log("提取结果:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("测试失败:", error);
  }
}

async function runAllTests() {
  console.log("开始测试 AI 提取服务...\n");

  // 测试各个单独的提取函数
  await testBasicInfo();
  await testEducation();
  await testExperience();
  await testSkills();

  // 测试流式提取
  await testExtractAll();

  // 测试同步提取
  // await testExtractAllSync();

  console.log("\n所有测试完成!");
}

// 运行测试
runAllTests().catch(console.error);
