import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { listCandidates } from "@/services/candidateManager";
import type { ApiResponse, PaginatedResult, Candidate } from "@/types";

/**
 * 查询参数验证 Schema
 */
const queryParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(["score", "uploadTime"]).optional().default("uploadTime"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  skills: z.string().optional(), // 逗号分隔的技能列表
  search: z.string().optional(), // 搜索关键词
});

/**
 * GET /api/candidates
 * 获取候选人列表，支持分页、排序、筛选和搜索
 * 
 * 查询参数:
 * - page: 页码（默认 1）
 * - pageSize: 每页大小（默认 20，最大 100）
 * - sortBy: 排序字段 ('score' | 'uploadTime'，默认 'uploadTime')
 * - sortOrder: 排序顺序 ('asc' | 'desc'，默认 'desc')
 * - skills: 技能筛选（逗号分隔，例如 "JavaScript,React"）
 * - search: 搜索关键词（搜索姓名、技能、学校）
 * 
 * 响应:
 * - 200: 成功返回分页结果
 * - 400: 查询参数验证失败
 * - 500: 服务器内部错误
 */
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    
    // 将 searchParams 转换为对象
    const queryParamsObject: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParamsObject[key] = value;
    });

    // 验证查询参数
    const validationResult = queryParamsSchema.safeParse(queryParamsObject);
    
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Invalid query parameters: ${errorMessages}`,
          code: "INVALID_INPUT",
        },
        { status: 400 }
      );
    }

    const { page, pageSize, sortBy, sortOrder, skills, search } = validationResult.data;

    // 处理技能筛选（将逗号分隔的字符串转换为数组）
    const skillFilters = skills
      ? skills.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
      : [];

    // 调用服务层获取候选人列表
    const result = await listCandidates({
      page,
      pageSize,
      sortBy,
      sortOrder,
      skillFilters,
      searchKeyword: search || "",
    });

    // 将 Candidate 对象转换为可序列化的格式（Date -> ISO string）
    const serializedItems = result.items.map((candidate) => ({
      ...candidate,
      createdAt: candidate.createdAt.toISOString(),
      updatedAt: candidate.updatedAt.toISOString(),
      matchScore: candidate.matchScore
        ? {
            ...candidate.matchScore,
            createdAt: candidate.matchScore.createdAt.toISOString(),
          }
        : undefined,
    }));

    return NextResponse.json<ApiResponse<PaginatedResult<any>>>(
      {
        success: true,
        data: {
          items: serializedItems,
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: result.totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to list candidates:", error);
    
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to retrieve candidate list",
        code: "DATABASE_ERROR",
      },
      { status: 500 }
    );
  }
}
