/**
 * SSE API 端点：AI 提取进度流
 * GET /api/resumes/[fileId]/extract
 * 
 * 功能：
 * 1. 从 PDF 文件提取文本
 * 2. 使用 AI 提取结构化信息（流式）
 * 3. 通过 SSE 实时推送提取进度
 * 4. 提取完成后保存候选人数据
 * 5. 返回 candidateId
 * 
 * SSE 事件格式：
 * - event: progress, data: { stage, data }
 * - event: complete, data: { candidateId, message }
 * - event: error, data: { error, code }
 */

import { NextRequest } from "next/server";
import { parseResume } from "@/services/pdfParser";
import { extractAll } from "@/services/aiExtractor";
import { createCandidate } from "@/services/candidateManager";
import type { Skills, SkillEntry } from "@/types";
import path from "path";
import { promises as fs } from "fs";

// 配置路由为动态和 Node.js runtime（SSE 需要）
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// Vercel 免费账户最大 10 秒
export const maxDuration = 10;

/**
 * GET 处理器 - 流式返回 AI 提取进度
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const { fileId } = params;

  // 验证 fileId 参数
  if (!fileId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Missing fileId parameter",
        code: "INVALID_INPUT",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // 创建 ReadableStream 用于 SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // 辅助函数：发送 SSE 事件
        const sendEvent = (event: string, data: any) => {
          const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        // 步骤 1: 构建文件路径并验证文件存在
        // 根据环境选择文件路径
        const isVercel = process.env.VERCEL === '1';
        const filePath = isVercel 
          ? `/tmp/uploads/${fileId}.pdf`
          : `/uploads/${fileId}.pdf`;
        const fullPath = isVercel
          ? path.join('/tmp', 'uploads', `${fileId}.pdf`)
          : path.join(process.cwd(), "public", filePath);

        // 检查文件是否存在
        try {
          await fs.access(fullPath);
        } catch {
          sendEvent("error", {
            error: "文件不存在或无法访问",
            code: "FILE_NOT_FOUND",
          });
          controller.close();
          return;
        }

        // 获取文件信息
        const fileStats = await fs.stat(fullPath);
        const fileName = `${fileId}.pdf`;
        const fileSize = fileStats.size;

        // 步骤 2: 调用 PDF Parser 提取文本（传入完整路径）
        console.log(`[Extract API] 开始解析 PDF 文件: ${fullPath}`);
        const parseResult = await parseResume(fullPath);

        if (!parseResult.success || !parseResult.text) {
          sendEvent("error", {
            error: parseResult.error || "PDF 解析失败",
            code: "PDF_PARSE_ERROR",
          });
          controller.close();
          return;
        }

        const resumeText = parseResult.text;
        console.log(`[Extract API] PDF 解析成功，文本长度: ${resumeText.length}`);

        // 步骤 3: 调用 AI Extractor 的 extractAll() 生成器
        console.log(`[Extract API] 开始 AI 提取流程`);
        
        let extractedData: any = null;

        for await (const progress of extractAll(resumeText)) {
          // 在每个提取阶段通过 SSE 发送进度事件
          sendEvent("progress", progress);
          console.log(`[Extract API] 提取进度: ${progress.stage}`);
          
          // 保存最后的完整数据
          if (progress.stage === "complete") {
            extractedData = progress.data;
          }
        }

        // 验证是否成功提取所有数据
        if (!extractedData || !extractedData.basicInfo) {
          sendEvent("error", {
            error: "AI 提取失败，未能获取完整数据",
            code: "EXTRACTION_ERROR",
          });
          controller.close();
          return;
        }

        // 步骤 4: 转换技能数据格式为 SkillEntry 数组
        const skillEntries: Array<{
          skillType: "technical" | "tool" | "language";
          skillName: string;
        }> = [];

        const skills = extractedData.skills as Skills;
        
        // 技术技能
        if (skills.technical && Array.isArray(skills.technical)) {
          skills.technical.forEach((skill: string) => {
            skillEntries.push({
              skillType: "technical",
              skillName: skill,
            });
          });
        }

        // 工具/框架
        if (skills.tools && Array.isArray(skills.tools)) {
          skills.tools.forEach((skill: string) => {
            skillEntries.push({
              skillType: "tool",
              skillName: skill,
            });
          });
        }

        // 编程语言
        if (skills.languages && Array.isArray(skills.languages)) {
          skills.languages.forEach((skill: string) => {
            skillEntries.push({
              skillType: "language",
              skillName: skill,
            });
          });
        }

        // 步骤 5: 调用 Candidate Manager 保存候选人数据
        console.log(`[Extract API] 开始保存候选人数据`);
        
        const candidateData = {
          name: extractedData.basicInfo.name,
          phone: extractedData.basicInfo.phone,
          email: extractedData.basicInfo.email,
          city: extractedData.basicInfo.city,
          fileName,
          filePath,
          fileSize,
          education: extractedData.education || [],
          experience: extractedData.experience || [],
          skills: skillEntries,
        };

        const candidate = await createCandidate(candidateData);
        console.log(`[Extract API] 候选人数据保存成功，ID: ${candidate.id}`);

        // 步骤 6: 发送 complete 事件返回 candidateId
        sendEvent("complete", {
          candidateId: candidate.id,
          message: "简历信息提取完成",
        });

        // 关闭流
        controller.close();
      } catch (error) {
        console.error("[Extract API] 处理过程中发生错误:", error);

        // 发送错误事件
        const sendEvent = (event: string, data: any) => {
          const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        let errorMessage = "处理过程中发生未知错误";
        let errorCode = "INTERNAL_ERROR";

        if (error instanceof Error) {
          errorMessage = error.message;
          
          // 根据错误消息确定错误代码
          if (errorMessage.includes("PDF")) {
            errorCode = "PDF_PARSE_ERROR";
          } else if (errorMessage.includes("AI") || errorMessage.includes("提取")) {
            errorCode = "EXTRACTION_ERROR";
          } else if (errorMessage.includes("数据库") || errorMessage.includes("保存")) {
            errorCode = "DATABASE_ERROR";
          }
        }

        sendEvent("error", {
          error: errorMessage,
          code: errorCode,
        });

        controller.close();
      }
    },
  });

  // 返回 SSE 响应
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // 禁用 Nginx 缓冲
    },
  });
}
