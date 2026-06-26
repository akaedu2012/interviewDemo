import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCandidateById, saveMatchScore } from "@/services/candidateManager";
import { getJobById } from "@/services/jobManager";
import { calculateMatch } from "@/services/jobMatcher";
import { dbInitPromise } from "@/db";

// 标记此路由为动态路由，防止构建时预渲染
export const dynamic = 'force-dynamic';

/**
 * 任务 6.6 - 实现匹配评分计算触发 API
 * POST /api/candidates/[id]/match
 * 
 * 功能：
 * - 接收 jobId 参数
 * - 获取候选人信息和岗位描述
 * - 调用 Job Matcher Service 计算匹配分数
 * - 保存匹配结果到数据库
 * - 返回 MatchResult
 * 
 * 满足需求: 8, 15
 */

// 请求体验证 schema
const matchRequestSchema = z.object({
  jobId: z.string().min(1, "jobId is required"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 等待数据库初始化完成
    await dbInitPromise;
    
    const candidateId = params.id;

    // 1. 解析和验证请求体
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON in request body",
          code: "INVALID_INPUT",
        },
        { status: 400 }
      );
    }

    const validation = matchRequestSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: firstError?.message || "Invalid input",
          code: "INVALID_INPUT",
        },
        { status: 400 }
      );
    }

    const { jobId } = validation.data;

    // 2. 获取候选人信息
    console.log(`获取候选人信息: ${candidateId}`);
    const candidate = await getCandidateById(candidateId);

    if (!candidate) {
      return NextResponse.json(
        {
          success: false,
          error: "Candidate not found",
          code: "CANDIDATE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // 3. 获取岗位描述
    console.log(`获取岗位描述: ${jobId}`);
    const job = await getJobById(jobId);

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: "Job description not found",
          code: "JOB_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // 4. 调用 Job Matcher Service 计算匹配分数
    console.log(`开始计算匹配分数: 候选人=${candidate.name}, 岗位=${job.title}`);
    const matchResult = await calculateMatch(candidate, job);

    // 5. 保存匹配分数到数据库
    console.log(`保存匹配分数到数据库...`);
    await saveMatchScore(candidateId, jobId, matchResult);

    // 6. 返回 MatchResult
    return NextResponse.json(
      {
        success: true,
        matchScore: {
          overallScore: matchResult.overallScore,
          skillScore: matchResult.skillScore,
          experienceScore: matchResult.experienceScore,
          educationScore: matchResult.educationScore,
          commentary: matchResult.commentary,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("匹配评分计算失败:", error);

    // 判断是否是匹配计算错误
    if (error instanceof Error && error.message === "无法计算匹配评分") {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to calculate match score",
          code: "MATCH_CALCULATION_ERROR",
        },
        { status: 500 }
      );
    }

    // 其他内部错误
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
