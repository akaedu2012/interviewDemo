import { NextRequest, NextResponse } from "next/server";
import { getCandidateById } from "@/services/candidateManager";
import { dbInitPromise } from "@/db";

// 标记此路由为动态路由，防止构建时预渲染
export const dynamic = 'force-dynamic';

/**
 * GET /api/candidates/[id]
 * 获取候选人详情
 * 
 * 返回完整候选人信息，包括：
 * - 基本信息（姓名、电话、邮箱、城市）
 * - 教育背景数组
 * - 工作经历数组
 * - 技能数组
 * - 匹配评分（如果有）
 * 
 * 需求: 12, 15
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 等待数据库初始化完成
    await dbInitPromise;
    
    const { id } = params;

    // 验证 ID 参数
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid candidate ID",
          code: "INVALID_INPUT",
        },
        { status: 400 }
      );
    }

    // 查询候选人信息
    const candidate = await getCandidateById(id);

    // 处理候选人不存在情况
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

    // 返回成功响应
    return NextResponse.json(
      {
        success: true,
        data: {
          id: candidate.id,
          name: candidate.name,
          phone: candidate.phone,
          email: candidate.email,
          city: candidate.city,
          fileName: candidate.fileName,
          filePath: candidate.filePath,
          fileSize: candidate.fileSize,
          status: candidate.status,
          education: candidate.education,
          experience: candidate.experience,
          skills: candidate.skills,
          matchScore: candidate.matchScore,
          createdAt: candidate.createdAt.toISOString(),
          updatedAt: candidate.updatedAt.toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching candidate details:", error);

    // 返回服务器错误响应
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        code: "DATABASE_ERROR",
      },
      { status: 500 }
    );
  }
}
