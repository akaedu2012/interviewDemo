/**
 * 测试 AI 提取进度 SSE API
 * 测试 GET /api/resumes/[fileId]/extract
 */

import path from "path";
import { promises as fs } from "fs";

async function testExtractAPI() {
  console.log("===== 测试 AI 提取进度 SSE API =====\n");

  // 步骤 1: 找到一个已上传的 PDF 文件
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  
  try {
    const files = await fs.readdir(uploadsDir);
    const pdfFiles = files.filter((file) => file.endsWith(".pdf"));

    if (pdfFiles.length === 0) {
      console.error("❌ 未找到已上传的 PDF 文件");
      console.log("请先运行 test-upload-api.ts 上传一个简历文件\n");
      return;
    }

    // 使用第一个找到的 PDF 文件
    const testFile = pdfFiles[0];
    const fileId = path.basename(testFile, ".pdf");
    
    console.log(`✓ 找到测试文件: ${testFile}`);
    console.log(`✓ fileId: ${fileId}\n`);

    // 步骤 2: 调用 SSE API
    const apiUrl = `http://localhost:3000/api/resumes/${fileId}/extract`;
    console.log(`发送 GET 请求到: ${apiUrl}\n`);

    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error(`❌ 请求失败: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error("错误响应:", errorText);
      return;
    }

    if (!response.body) {
      console.error("❌ 响应体为空");
      return;
    }

    console.log("✓ SSE 连接已建立，开始接收事件...\n");

    // 步骤 3: 读取 SSE 流
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let candidateId = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log("\n✓ SSE 流已关闭");
        break;
      }

      // 解码数据块
      buffer += decoder.decode(value, { stream: true });

      // 处理完整的 SSE 消息
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // 保留不完整的行

      let currentEvent = "";
      let currentData = "";

      for (const line of lines) {
        if (line.startsWith("event:")) {
          currentEvent = line.substring(6).trim();
        } else if (line.startsWith("data:")) {
          currentData = line.substring(5).trim();
        } else if (line === "" && currentEvent && currentData) {
          // 完整的 SSE 消息
          try {
            const data = JSON.parse(currentData);

            if (currentEvent === "progress") {
              console.log(`📡 进度事件 [${data.stage}]:`);
              
              // 显示提取的数据摘要
              if (data.stage === "basic" && data.data.basicInfo) {
                console.log(`   姓名: ${data.data.basicInfo.name}`);
                console.log(`   邮箱: ${data.data.basicInfo.email}`);
                console.log(`   电话: ${data.data.basicInfo.phone}`);
                console.log(`   城市: ${data.data.basicInfo.city}`);
              } else if (data.stage === "education" && data.data.education) {
                console.log(`   提取教育背景: ${data.data.education.length} 条`);
              } else if (data.stage === "experience" && data.data.experience) {
                console.log(`   提取工作经历: ${data.data.experience.length} 条`);
              } else if (data.stage === "skills" && data.data.skills) {
                const skills = data.data.skills;
                const totalSkills = 
                  (skills.technical?.length || 0) +
                  (skills.tools?.length || 0) +
                  (skills.languages?.length || 0);
                console.log(`   提取技能标签: ${totalSkills} 个`);
              } else if (data.stage === "complete") {
                console.log(`   ✓ 所有信息提取完成`);
              }
              console.log();
            } else if (currentEvent === "complete") {
              console.log("🎉 提取完成事件:");
              console.log(`   候选人ID: ${data.candidateId}`);
              console.log(`   消息: ${data.message}`);
              console.log();
              candidateId = data.candidateId;
            } else if (currentEvent === "error") {
              console.error("❌ 错误事件:");
              console.error(`   错误: ${data.error}`);
              console.error(`   代码: ${data.code}`);
              console.log();
            }
          } catch (error) {
            console.error("解析 SSE 数据失败:", error);
            console.error("原始数据:", currentData);
          }

          // 重置
          currentEvent = "";
          currentData = "";
        }
      }
    }

    // 步骤 4: 验证候选人是否已保存到数据库
    if (candidateId) {
      console.log("\n===== 验证候选人数据 =====");
      const candidateUrl = `http://localhost:3000/api/candidates/${candidateId}`;
      console.log(`查询候选人: ${candidateUrl}\n`);

      const candidateResponse = await fetch(candidateUrl);

      if (candidateResponse.ok) {
        const candidateData = await candidateResponse.json();
        
        if (candidateData.success && candidateData.data) {
          const candidate = candidateData.data;
          console.log("✓ 候选人数据已保存:");
          console.log(`   姓名: ${candidate.name}`);
          console.log(`   邮箱: ${candidate.email}`);
          console.log(`   状态: ${candidate.status}`);
          console.log(`   教育背景: ${candidate.education.length} 条`);
          console.log(`   工作经历: ${candidate.experience.length} 条`);
          console.log(`   技能标签: ${candidate.skills.length} 个`);
          console.log();
        } else {
          console.error("❌ 候选人数据格式错误");
        }
      } else {
        console.error(`❌ 查询候选人失败: ${candidateResponse.status}`);
      }
    }

    console.log("===== 测试完成 =====\n");
  } catch (error) {
    console.error("测试过程中发生错误:", error);
  }
}

// 运行测试
testExtractAPI();
