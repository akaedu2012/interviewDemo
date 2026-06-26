/**
 * 调试 API：检查环境变量配置
 * GET /api/debug/env
 * 
 * 功能：
 * 1. 检查 DEEPSEEK_API_KEY 是否配置
 * 2. 检查其他关键环境变量
 * 3. 返回诊断信息（不泄露密钥值）
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  console.log("[Debug ENV] 检查环境变量配置");

  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    isVercel: process.env.VERCEL === '1',
    vercelEnv: process.env.VERCEL_ENV,
    checks: {
      deepseekApiKey: {
        exists: !!process.env.DEEPSEEK_API_KEY,
        length: process.env.DEEPSEEK_API_KEY?.length || 0,
        prefix: process.env.DEEPSEEK_API_KEY?.substring(0, 10) || 'NOT_SET',
      },
      deepseekBaseUrl: {
        exists: !!process.env.DEEPSEEK_API_BASE_URL,
        value: process.env.DEEPSEEK_API_BASE_URL || 'NOT_SET',
      },
      nodeEnv: process.env.NODE_ENV,
      vercelRegion: process.env.VERCEL_REGION || 'NOT_SET',
    },
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.includes('DEEPSEEK') || key.includes('VERCEL')
    ).sort(),
  };

  console.log("[Debug ENV] 诊断结果:", JSON.stringify(diagnostics, null, 2));

  return NextResponse.json({
    success: true,
    diagnostics,
  });
}
