/**
 * 测试简历上传 API
 * 使用: npm run dev 启动服务后，在另一个终端运行: npx tsx scripts/test-upload-api.ts
 */

import { promises as fs } from "fs";
import path from "path";

const API_BASE_URL = "http://localhost:3000";

async function testUploadAPI() {
  console.log("=== 测试简历上传 API ===\n");

  try {
    // 1. 检查测试文件是否存在
    const testFilePath = path.join(process.cwd(), "public", "uploads", "test-resume.pdf");
    let fileExists = false;
    
    try {
      await fs.access(testFilePath);
      fileExists = true;
      console.log("✓ 找到测试文件:", testFilePath);
    } catch {
      console.log("✗ 测试文件不存在:", testFilePath);
      console.log("  请先运行: npx tsx scripts/create-test-pdf.ts\n");
      return;
    }

    // 2. 读取测试文件
    const fileBuffer = await fs.readFile(testFilePath);
    const testFile = new File([fileBuffer], "test-resume.pdf", {
      type: "application/pdf",
    });

    console.log("✓ 读取测试文件成功\n");

    // 3. 创建 FormData
    const formData = new FormData();
    formData.append("files", testFile);

    console.log("发送上传请求...");

    // 4. 调用上传 API
    const response = await fetch(`${API_BASE_URL}/api/resumes/upload`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    console.log("\n响应状态:", response.status);
    console.log("响应数据:", JSON.stringify(result, null, 2));

    // 5. 验证响应
    if (response.ok && result.success) {
      console.log("\n✓ 上传成功!");
      
      if (result.data?.uploads) {
        console.log("\n上传文件详情:");
        result.data.uploads.forEach((upload: any, index: number) => {
          console.log(`\n文件 ${index + 1}:`);
          console.log(`  - 文件名: ${upload.fileName}`);
          console.log(`  - 文件ID: ${upload.fileId}`);
          console.log(`  - 状态: ${upload.status}`);
          console.log(`  - 文件路径: ${upload.filePath}`);
          console.log(`  - 文件大小: ${upload.fileSize} bytes`);
        });
      }

      if (result.data?.summary) {
        console.log("\n上传摘要:");
        console.log(`  - 总计: ${result.data.summary.total}`);
        console.log(`  - 成功: ${result.data.summary.successful}`);
        console.log(`  - 失败: ${result.data.summary.failed}`);
      }
    } else {
      console.log("\n✗ 上传失败");
      console.log("错误信息:", result.error);
      console.log("错误代码:", result.code);
    }

  } catch (error) {
    console.error("\n✗ 测试失败:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED")) {
        console.log("\n提示: 请先启动开发服务器: npm run dev");
      }
    }
  }

  console.log("\n=== 测试完成 ===");
}

// 测试多文件上传
async function testMultipleFilesUpload() {
  console.log("\n\n=== 测试多文件上传 ===\n");

  try {
    const testFilePath = path.join(process.cwd(), "public", "uploads", "test-resume.pdf");
    const fileBuffer = await fs.readFile(testFilePath);

    // 创建3个文件用于测试
    const formData = new FormData();
    for (let i = 1; i <= 3; i++) {
      const testFile = new File([fileBuffer], `test-resume-${i}.pdf`, {
        type: "application/pdf",
      });
      formData.append("files", testFile);
    }

    console.log("发送多文件上传请求 (3个文件)...");

    const response = await fetch(`${API_BASE_URL}/api/resumes/upload`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    console.log("\n响应状态:", response.status);
    console.log("上传摘要:", result.data?.summary);

    if (response.ok && result.success) {
      console.log("✓ 多文件上传成功!");
    } else {
      console.log("✗ 多文件上传失败:", result.error);
    }

  } catch (error) {
    console.error("✗ 测试失败:", error);
  }

  console.log("\n=== 测试完成 ===");
}

// 测试错误场景
async function testErrorScenarios() {
  console.log("\n\n=== 测试错误场景 ===\n");

  // 测试1: 无文件上传
  console.log("1. 测试无文件上传...");
  try {
    const formData = new FormData();
    const response = await fetch(`${API_BASE_URL}/api/resumes/upload`, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    
    if (response.status === 400 && !result.success) {
      console.log("✓ 正确拒绝无文件上传");
      console.log("  错误信息:", result.error);
    } else {
      console.log("✗ 应该返回 400 错误");
    }
  } catch (error) {
    console.error("✗ 请求失败:", error);
  }

  // 测试2: 非PDF文件
  console.log("\n2. 测试非PDF文件上传...");
  try {
    const textFile = new File(["test content"], "test.txt", {
      type: "text/plain",
    });
    const formData = new FormData();
    formData.append("files", textFile);

    const response = await fetch(`${API_BASE_URL}/api/resumes/upload`, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    
    if (response.status === 400 && !result.success) {
      console.log("✓ 正确拒绝非PDF文件");
      console.log("  错误信息:", result.data?.uploads?.[0]?.error);
    } else {
      console.log("✗ 应该返回 400 错误");
    }
  } catch (error) {
    console.error("✗ 请求失败:", error);
  }

  // 测试3: 超过最大文件数量 (6个文件)
  console.log("\n3. 测试超过最大文件数量 (6个文件)...");
  try {
    const formData = new FormData();
    for (let i = 1; i <= 6; i++) {
      const testFile = new File(["test"], `test-${i}.pdf`, {
        type: "application/pdf",
      });
      formData.append("files", testFile);
    }

    const response = await fetch(`${API_BASE_URL}/api/resumes/upload`, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    
    if (response.status === 400 && !result.success) {
      console.log("✓ 正确拒绝超过最大文件数量");
      console.log("  错误信息:", result.error);
    } else {
      console.log("✗ 应该返回 400 错误");
    }
  } catch (error) {
    console.error("✗ 请求失败:", error);
  }

  console.log("\n=== 错误场景测试完成 ===");
}

// 运行所有测试
async function runAllTests() {
  await testUploadAPI();
  await testMultipleFilesUpload();
  await testErrorScenarios();
}

runAllTests().catch(console.error);
