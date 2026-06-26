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

  console.log(`[Extract SSE] 收到请求，fileId: ${fileId}`);

  // 验证 fileId 参数
  if (!fileId) {
    console.error(`[Extract SSE] fileId 参数缺失`);
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

  // 立即返回 SSE 响应，不要等待任何异步操作
  const encoder = new TextEncoder();
  
  console.log(`[Extract SSE] 创建 SSE 流`);
  
  const stream = new ReadableStream({
    async start(controller) {
      // 辅助函数：发送 SSE 事件
      const sendEvent = (event: string, data: any) => {
        try {
          const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
          console.log(`[Extract SSE] 发送事件: ${event}`, data);
        } catch (error) {
          console.error(`[Extract SSE] 发送事件失败:`, error);
        }
      };

      try {
        console.log(`[Extract SSE] 开始处理提取流程`);
        
        // 步骤 0: 验证 API Key 是否配置
        const apiKey = process.env.DEEPSEEK_API_KEY;
        console.log(`[Extract SSE] API Key 检查: ${apiKey ? `存在 (长度: ${apiKey.length})` : '不存在'}`);
        
        if (!apiKey) {
          console.error(`[Extract SSE] DEEPSEEK_API_KEY 未配置`);
          sendEvent("error", {
            error: "AI API 密钥未配置，请联系管理员配置 DEEPSEEK_API_KEY 环境变量",
            code: "AI_API_KEY_MISSING",
            details: "Environment variable DEEPSEEK_API_KEY is not set",
          });
          controller.close();
          return;
        }
        
        // 步骤 1: 构建文件路径并验证文件存在
        const isVercel = process.env.VERCEL === '1';
        const filePath = isVercel 
          ? `/tmp/uploads/${fileId}.pdf`
          : `/uploads/${fileId}.pdf`;
        const fullPath = isVercel
          ? path.join('/tmp', 'uploads', `${fileId}.pdf`)
          : path.join(process.cwd(), "public", filePath);

        console.log(`[Extract SSE] 文件路径: ${fullPath}, Vercel环境: ${isVercel}`);

        // 检查文件是否存在
        try {
          await fs.access(fullPath);
          console.log(`[Extract SSE] 文件存在`);
        } catch (error) {
          console.error(`[Extract SSE] 文件不存在: ${fullPath}`, error);
          sendEvent("error", {
            error: "文件不存在或无法访问",
            code: "FILE_NOT_FOUND",
            details: `文件路径: ${fullPath}`,
          });
          controller.close();
          return;
        }

        // 获取文件信息
        const fileStats = await fs.stat(fullPath);
        const fileName = `${fileId}.pdf`;
        const fileSize = fileStats.size;
        console.log(`[Extract SSE] 文件大小: ${fileSize} 字节`);

        // 步骤 2: 调用 PDF Parser 提取文本
        console.log(`[Extract SSE] 开始解析 PDF`);
        const parseResult = await parseResume(fullPath);

        if (!parseResult.success || !parseResult.text) {
          console.error(`[Extract SSE] PDF 解析失败:`, parseResult.error);
          sendEvent("error", {
            error: parseResult.error || "PDF 解析失败",
            code: "PDF_PARSE_ERROR",
          });
          controller.close();
          return;
        }

        const resumeText = parseResult.text;
        console.log(`[Extract SSE] PDF 解析成功，文本长度: ${resumeText.length}`);

        // 步骤 3: 调用 AI Extractor
        console.log(`[Extract SSE] 开始 AI 提取`);
        
        let extractedData: any = null;
        let progressCount = 0;

        for await (const progress of extractAll(resumeText)) {
          progressCount++;
          
          // 发送进度事件
          sendEvent("progress", progress);
          
          // 添加适当的延迟，使前端能看到进度变化
          // 除了最后一个进度事件外，其他都稍微延迟
          if (progress.stage !== "complete" && progressCount < 5) {
            // 每个阶段延迟 300-500ms，让用户看到进度
            await new Promise(resolve => setTimeout(resolve, 400));
          }
          
          // 保存最后的完整数据
          if (progress.stage === "complete") {
            extractedData = progress.data;
          }
        }

        // 验证是否成功提取
        if (!extractedData || !extractedData.basicInfo) {
          console.error(`[Extract SSE] AI 提取失败，数据不完整`);
          sendEvent("error", {
            error: "AI 提取失败，未能获取完整数据",
            code: "EXTRACTION_ERROR",
          });
          controller.close();
          return;
        }

        console.log(`[Extract SSE] AI 提取成功`);

        // 步骤 4: 转换技能数据格式
        const skillEntries: Array<{
          skillType: "technical" | "tool" | "language";
          skillName: string;
        }> = [];

        const skills = extractedData.skills as Skills;
        
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
        console.log(`[Extract SSE] 开始保存候选人数据`);
        
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
        console.log(`[Extract SSE] 候选人保存成功，ID: ${candidate.id}`);

        // 步骤 6: 发送完成事件
        sendEvent("complete", {
          candidateId: candidate.id,
          message: "简历信息提取完成",
        });

        console.log(`[Extract SSE] 流程完成，关闭连接`);
        controller.close();
      } catch (error) {
        console.error("[Extract SSE] 处理过程中发生错误:", error);

        // 发送错误事件
        const sendEvent = (event: string, data: any) => {
          try {
            const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(message));
          } catch (e) {
            console.error("[Extract SSE] 发送错误事件失败:", e);
          }
        };

        let errorMessage = "处理过程中发生未知错误";
        let errorCode = "INTERNAL_ERROR";
        let errorDetails = undefined;

        if (error instanceof Error) {
          errorMessage = error.message;
          errorDetails = error.stack;
          
          if (errorMessage.includes("PDF")) {
            errorCode = "PDF_PARSE_ERROR";
          } else if (errorMessage.includes("AI") || errorMessage.includes("提取")) {
            errorCode = "EXTRACTION_ERROR";
          } else if (errorMessage.includes("数据库") || errorMessage.includes("保存")) {
            errorCode = "DATABASE_ERROR";
          } else if (errorMessage.includes("API") || errorMessage.includes("DEEPSEEK")) {
            errorCode = "AI_API_ERROR";
          }
        }

        sendEvent("error", {
          error: errorMessage,
          code: errorCode,
          details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
        });

        controller.close();
      }
    },
  });

  // 返回 SSE 响应，确保正确的 headers
  console.log(`[Extract SSE] 返回 SSE 响应`);
  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
