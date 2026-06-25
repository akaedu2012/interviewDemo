/**
 * 简化版 AI 提取 API（非 SSE）
 * POST /api/resumes/[fileId]/extract-simple
 * 
 * 用于 Vercel 免费账户（10秒超时限制）
 * 直接返回提取结果，不使用 Server-Sent Events
 */

import { NextRequest, NextResponse } from "next/server";
import { parseResume } from "@/services/pdfParser";
import { extractBasicInfo, extractEducation, extractExperience, extractSkills } from "@/services/aiExtractor";
import { createCandidate } from "@/services/candidateManager";
import type { Skills } from "@/types";
import path from "path";
import { promises as fs } from "fs";

// 配置路由
export const dynamic = 'force-dynamic';
export const maxDuration = 10;  // Vercel 免费账户最大值

/**
 * POST 处理器 - 直接返回 AI 提取结果
 */
export async function POST(
  request: NextRequest,
  { params }: { params { fileId: string } }
) {
  try {
    const { fileId } = params;

    // 验证 fileId
    if (!fileId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing fileId parameter",
          code: "INVALID_INPUT",
        },
        { status: 400 }
      );
    }

    console.log(`[Extract Simple] 开始处理文件: ${fileId}`);

    // 步骤 1: 构建文件路径
    const isVercel = process.env.VERCEL === '1';
    const fullPath = isVercel
      ? path.join('/tmp', 'uploads', `${fileId}.pdf`)
      : path.join(process.cwd(), "public", "uploads", `${fileId}.pdf`);

    // 检查文件是否存在
    try {
      await fs.access(fullPath);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "文件不存在或无法访问",
          code: "FILE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // 获取文件信息
    const fileStats = await fs.stat(fullPath);
    const fileName = `${fileId}.pdf`;
    const fileSize = fileStats.size;
    const filePath = isVercel ? `/tmp/uploads/${fileName}` : `/uploads/${fileName}`;

    // 步骤 2: 解析 PDF
    console.log(`[Extract Simple] 解析 PDF: ${fullPath}`);
    const parseResult = await parseResume(fullPath);

    if (!parseResult.success || !parseResult.text) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error || "PDF 解析失败",
          code: "PDF_PARSE_ERROR",
        },
        { status: 400 }
      );
    }

    const resumeText = parseResult.text;
    console.log(`[Extract Simple] PDF 解析成功，文本长度: ${resumeText.length}`);

    // 步骤 3: 并行提取所有信息（加快速度）
    console.log(`[Extract Simple] 开始 AI 提取`);
    
    const [basicInfo, education, experience, skills] = await Promise.all([
      extractBasicInfo(resumeText),
      extractEducation(resumeText),
      extractExperience(resumeText),
      extractSkills(resumeText),
    ]);

    console.log(`[Extract Simple] AI 提取完成`);

    // 验证基本信息
    if (!basicInfo || !basicInfo.name) {
      return NextResponse.json(
        {
          success: false,
          error: "未能提取到候选人姓名",
          code: "EXTRACTION_ERROR",
        },
        { status: 400 }
      );
    }

    // 步骤 4: 转换技能数据格式
    const skillEntries: Array<{
      skillType: "technical" | "tool" | "language";
      skillName: string;
    }> = [];

    if (skills.technical && Array.isArray(skills.technical)) {
      skills.technical.forEach((skill: string) => {
        skillEntries.push({ skillType: "technical", skillName: skill });
      });
    }

    if (skills.tools && Array.isArray(skills.tools)) {
      skills.tools.forEach((skill: string) => {
        skillEntries.push({ skillType: "tool", skillName: skill });
      });
    }

    if (skills.languages && Array.isArray(skills.languages)) {
      skills.languages.forEach((skill: string) => {
        skillEntries.push({ skillType: "language", skillName: skill });
      });
    }

    // 步骤 5: 保存候选人数据
    console.log(`[Extract Simple] 保存候选人数据`);
    
    const candidateData = {
      name: basicInfo.name,
      phone: basicInfo.phone,
      email: basicInfo.email,
      city: basicInfo.city,
      fileName,
      filePath,
      fileSize,
      education: education || [],
      experience: experience || [],
      skills: skillEntries,
    };

    const candidate = await createCandidate(candidateData);
    console.log(`[Extract Simple] 候选人保存成功，ID: ${candidate.id}`);

    // 返回成功结果
    return NextResponse.json(
      {
        success: true,
        data: {
          candidateId: candidate.id,
          message: "简历信息提取完成",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Extract Simple] 错误:", error);

    let errorMessage = "处理过程中发生未知错误";
    let errorCode = "INTERNAL_ERROR";

    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (errorMessage.includes("PDF")) {
        errorCode = "PDF_PARSE_ERROR";
      } else if (errorMessage.includes("AI") || errorMessage.includes("提取")) {
        errorCode = "EXTRACTION_ERROR";
      } else if (errorMessage.includes("数据库") || errorMessage.includes("保存")) {
        errorCode = "DATABASE_ERROR";
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: errorCode,
      },
      { status: 500 }
    );
  }
}
