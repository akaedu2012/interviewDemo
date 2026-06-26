import { NextRequest, NextResponse } from "next/server";
import { getActiveJob } from "@/services/jobManager";
import { dbInitPromise } from "@/db";

// 标记此路由为动态路由，防止构建时预渲染
export const dynamic = 'force-dynamic';

/**
 * GET /api/jobs/active
 * 获取当前激活的岗位描述
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "id": "uuid-job-1",
 *     "title": "Senior Full-Stack Developer",
 *     "description": "...",
 *     "requiredSkills": ["JavaScript", "React", "Node.js"],
 *     "preferredSkills": ["TypeScript", "Next.js"]
 *   }
 * }
 * 
 * Response (404 - No active job):
 * {
 *   "success": false,
 *   "error": "No active job description found",
 *   "code": "NO_ACTIVE_JOB"
 * }
 * 
 * Response (500 - Internal error):
 * {
 *   "success": false,
 *   "error": "Failed to retrieve active job description",
 *   "code": "DATABASE_ERROR"
 * }
 * 
 * 需求: 7, 15
 */
export async function GET(request: NextRequest) {
  try {
    // 等待数据库初始化完成
    await dbInitPromise;
    
    // 调用 Job Manager 获取激活的岗位描述
    const job = await getActiveJob();

    // 处理无激活岗位情况
    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: "No active job description found",
          code: "NO_ACTIVE_JOB",
        },
        { status: 404 }
      );
    }

    // 返回成功响应
    return NextResponse.json(
      {
        success: true,
        data: {
          id: job.id,
          title: job.title,
          description: job.description,
          requiredSkills: job.requiredSkills,
          preferredSkills: job.preferredSkills,
          isActive: job.isActive,
          createdAt: job.createdAt.toISOString(),
          updatedAt: job.updatedAt.toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving active job description:", error);

    // 返回服务器错误响应
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve active job description",
        code: "DATABASE_ERROR",
      },
      { status: 500 }
    );
  }
}
