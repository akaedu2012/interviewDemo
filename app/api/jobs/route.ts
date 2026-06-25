import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createOrUpdateJob } from "@/services/jobManager";

// Zod schema for validating job description data
const jobDescriptionSchema = z.object({
  title: z.string().min(1, "Job title cannot be empty"),
  description: z.string().min(1, "Job description cannot be empty"),
  requiredSkills: z
    .array(z.string())
    .min(1, "At least one required skill must be specified"),
  preferredSkills: z.array(z.string()).default([]),
});

/**
 * POST /api/jobs
 * 创建或更新岗位描述
 * 
 * Request body:
 * {
 *   "title": "Senior Full-Stack Developer",
 *   "description": "We are looking for an experienced full-stack developer...",
 *   "requiredSkills": ["JavaScript", "React", "Node.js", "SQL"],
 *   "preferredSkills": ["TypeScript", "Next.js", "AWS"]
 * }
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "id": "uuid-job-1",
 *     "title": "Senior Full-Stack Developer",
 *     "isActive": true,
 *     "createdAt": "2024-01-15T09:00:00Z"
 *   }
 * }
 * 
 * Response (400 - Invalid input):
 * {
 *   "success": false,
 *   "error": "Job description cannot be empty",
 *   "code": "INVALID_INPUT"
 * }
 * 
 * Response (500 - Internal error):
 * {
 *   "success": false,
 *   "error": "Failed to create or update job description",
 *   "code": "DATABASE_ERROR"
 * }
 * 
 * 需求: 7, 15
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();

    // 使用 Zod 验证请求体
    const validationResult = jobDescriptionSchema.safeParse(body);
    if (!validationResult.success) {
      // Get error message from Zod validation
      const issues = validationResult.error.issues;
      const errorMessage =
        issues && issues.length > 0 && issues[0]?.message
          ? issues[0].message
          : "Invalid input data";

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          code: "INVALID_INPUT",
        },
        { status: 400 }
      );
    }

    const { title, description, requiredSkills, preferredSkills } =
      validationResult.data;

    // 调用 Job Manager 创建或更新岗位描述
    const job = await createOrUpdateJob({
      title,
      description,
      requiredSkills,
      preferredSkills,
    });

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
    console.error("Error creating or updating job description:", error);

    // 返回服务器错误响应
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create or update job description",
        code: "DATABASE_ERROR",
      },
      { status: 500 }
    );
  }
}
