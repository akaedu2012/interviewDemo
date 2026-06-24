import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateCandidateStatus, getCandidateById } from "@/services/candidateManager";
import type { CandidateStatus } from "@/types";

// Zod schema for validating candidate status
const candidateStatusSchema = z.object({
  status: z.enum(["待筛选", "初筛通过", "面试中", "已录用", "已淘汰"], {
    errorMap: () => ({ message: "Invalid status value. Must be one of: 待筛选, 初筛通过, 面试中, 已录用, 已淘汰" }),
  }),
});

/**
 * PATCH /api/candidates/[id]/status
 * 更新候选人状态
 * 
 * Request body:
 * {
 *   "status": "初筛通过" | "待筛选" | "面试中" | "已录用" | "已淘汰"
 * }
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "id": "candidate-id",
 *     "status": "初筛通过",
 *     "updatedAt": "2024-01-15T11:00:00Z"
 *   }
 * }
 * 
 * Response (400 - Invalid status):
 * {
 *   "success": false,
 *   "error": "Invalid status value",
 *   "code": "INVALID_STATUS"
 * }
 * 
 * Response (404 - Candidate not found):
 * {
 *   "success": false,
 *   "error": "Candidate not found",
 *   "code": "CANDIDATE_NOT_FOUND"
 * }
 * 
 * Response (500 - Internal error):
 * {
 *   "success": false,
 *   "error": "Failed to update candidate status",
 *   "code": "DATABASE_ERROR"
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const candidateId = params.id;

    // 验证候选人是否存在
    const existingCandidate = await getCandidateById(candidateId);
    if (!existingCandidate) {
      return NextResponse.json(
        {
          success: false,
          error: "Candidate not found",
          code: "CANDIDATE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // 解析请求体
    const body = await request.json();

    // 使用 Zod 验证请求体
    const validationResult = candidateStatusSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0]?.message || "Invalid input";
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          code: "INVALID_STATUS",
        },
        { status: 400 }
      );
    }

    const { status } = validationResult.data;

    // 更新候选人状态
    await updateCandidateStatus(candidateId, status as CandidateStatus);

    // 获取更新后的候选人信息
    const updatedCandidate = await getCandidateById(candidateId);

    if (!updatedCandidate) {
      throw new Error("Failed to retrieve updated candidate");
    }

    // 返回成功响应
    return NextResponse.json(
      {
        success: true,
        data: {
          id: updatedCandidate.id,
          status: updatedCandidate.status,
          updatedAt: updatedCandidate.updatedAt.toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating candidate status:", error);

    // 如果是候选人不存在的错误
    if (error instanceof Error && error.message === "Candidate not found") {
      return NextResponse.json(
        {
          success: false,
          error: "Candidate not found",
          code: "CANDIDATE_NOT_FOUND",
        },
        { status: 404 }
      );
    }

    // 其他数据库错误
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update candidate status",
        code: "DATABASE_ERROR",
      },
      { status: 500 }
    );
  }
}
