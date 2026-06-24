/**
 * AI 客户端测试脚本
 * 用于验证 DeepSeek API 配置和连接
 * 
 * Usage: npx tsx scripts/test-ai-client.ts
 */

import { callAI, callAIForJSON, testAIConnection } from "../lib/aiClient";

async function testAIClient() {
  console.log("=== DeepSeek AI 客户端测试 ===\n");

  // Test 1: 连接测试
  console.log("Test 1: AI 连接测试");
  console.log("-".repeat(50));
  
  const isConnected = await testAIConnection();
  if (isConnected) {
    console.log("✓ AI 连接成功\n");
  } else {
    console.log("✗ AI 连接失败 - 请检查 DEEPSEEK_API_KEY 环境变量\n");
    console.log("请在 .env.local 文件中配置正确的 API Key");
    return;
  }

  // Test 2: 基本文本生成
  console.log("Test 2: 基本文本生成");
  console.log("-".repeat(50));
  
  try {
    const response = await callAI(
      "你是一个专业的简历分析助手。",
      "请用一句话介绍自己。",
      { temperature: 0.1, maxTokens: 100 }
    );
    console.log("AI 响应:", response);
    console.log("✓ Test 2 passed\n");
  } catch (error) {
    console.error("✗ Test 2 failed:", error);
    return;
  }

  // Test 3: JSON 格式提取
  console.log("Test 3: JSON 格式数据提取");
  console.log("-".repeat(50));
  
  try {
    interface TestData {
      name: string;
      age: number;
      skills: string[];
    }

    const jsonResponse = await callAIForJSON<TestData>(
      "你是一个数据提取助手。根据用户输入，提取结构化信息并返回 JSON 格式。",
      "张三，28岁，精通 JavaScript、Python 和 React。请提取姓名、年龄和技能列表。",
      { temperature: 0 }
    );

    console.log("提取的 JSON 数据:");
    console.log(JSON.stringify(jsonResponse, null, 2));
    
    if (jsonResponse.name && jsonResponse.age && Array.isArray(jsonResponse.skills)) {
      console.log("✓ Test 3 passed - JSON 格式正确\n");
    } else {
      console.log("✗ Test 3 failed - JSON 格式不符合预期\n");
    }
  } catch (error) {
    console.error("✗ Test 3 failed:", error);
    return;
  }

  // Test 4: 简历信息提取示例
  console.log("Test 4: 简历信息提取示例");
  console.log("-".repeat(50));
  
  try {
    const resumeText = `
      张三
      电话: 138-0000-0000
      邮箱: zhangsan@example.com
      城市: 北京

      教育背景:
      清华大学 | 计算机科学与技术 | 本科 | 2016-2020

      工作经历:
      字节跳动 | 前端工程师 | 2020-2023
      负责抖音前端架构设计和开发

      技能:
      JavaScript, React, TypeScript, Node.js
    `;

    interface ResumeInfo {
      name: string | null;
      phone: string | null;
      email: string | null;
      city: string | null;
    }

    const extractedInfo = await callAIForJSON<ResumeInfo>(
      "你是一个专业的简历信息提取助手。从简历文本中提取基本信息，返回 JSON 格式。如果某个字段无法提取，返回 null。",
      `请从以下简历中提取基本信息（姓名、电话、邮箱、城市）：\n\n${resumeText}`,
      { temperature: 0 }
    );

    console.log("提取的简历信息:");
    console.log(JSON.stringify(extractedInfo, null, 2));
    
    if (extractedInfo.name === "张三" && extractedInfo.phone && extractedInfo.email) {
      console.log("✓ Test 4 passed - 成功提取简历信息\n");
    } else {
      console.log("✗ Test 4 failed - 提取的信息不完整\n");
    }
  } catch (error) {
    console.error("✗ Test 4 failed:", error);
    return;
  }

  console.log("=== 所有测试完成 ===");
  console.log("\n✓ DeepSeek AI 客户端配置正确，可以正常使用！");
}

// 运行测试
testAIClient().catch((error) => {
  console.error("测试脚本失败:", error);
  process.exit(1);
});
