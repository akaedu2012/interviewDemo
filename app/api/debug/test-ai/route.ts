/**
 * 调试 API：测试 DeepSeek AI 连接
 * GET /api/debug/test-ai
 * 
 * 功能：
 * 1. 验证 API Key 是否有效
 * 2. 测试 AI API 调用是否正常
 * 3. 返回详细的测试结果和错误信息
 */

import { NextRequest, NextResponse } from "next/server";
import { testAIConnection, callAI } from "@/lib/aiClient";

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

export async function GET(request: NextRequest) {
  console.log("[Debug Test AI] 开始测试 AI 连接");

  const startTime = Date.now();
  const apiKey = process.env.DEEPSEEK_API_KEY;

  const result: any = {
    timestamp: new Date().toISOString(),
    apiKeyExists: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyPrefix: apiKey?.substring(0, 10) || 'NOT_SET',
    testResult: null,
    error: null,
    duration: 0,
  };

  // 检查 API Key
  if (!apiKey) {
    result.error = "DEEPSEEK_API_KEY 环境变量未配置";
    result.testResult = "failed";
    result.duration = Date.now() - startTime;
    
    console.log("[Debug Test AI] API Key 未配置");
    
    return NextResponse.json({
      success: false,
      result,
    });
  }

  // 测试 AI 连接
  try {
    console.log("[Debug Test AI] 调用 AI API 测试...");
    
    const response = await callAI(
      "You are a helpful assistant. Please respond with exactly one word.",
      "Say 'OK'",
      {
        temperature: 0,
        maxTokens: 10,
      }
    );

    result.testResult = "success";
    result.response = response;
    result.duration = Date.now() - startTime;

    console.log("[Debug Test AI] AI 测试成功:", response);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    result.testResult = "failed";
    result.duration = Date.now() - startTime;

    if (error instanceof Error) {
      result.error = error.message;
      result.errorStack = error.stack;
    } else {
      result.error = String(error);
    }

    console.error("[Debug Test AI] AI 测试失败:", error);

    return NextResponse.json({
      success: false,
      result,
    });
  }
}
