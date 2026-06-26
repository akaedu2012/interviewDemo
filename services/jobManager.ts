import { db, jobDescriptions } from "@/db";
import { eq, desc } from "drizzle-orm";
import { generateId } from "@/lib/utils";
import type { JobDescription } from "@/types";

/**
 * 岗位管理服务
 * 负责岗位描述的 CRUD 操作
 */

/**
 * 创建岗位描述输入类型
 */
export interface CreateJobInput {
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
}

/**
 * 创建或更新岗位描述
 * 当创建新岗位时，将所有旧岗位设为 inactive
 */
export async function createOrUpdateJob(
  data: CreateJobInput
): Promise<JobDescription> {
  const jobId = generateId();
  const now = new Date().toISOString();

  try {
    // 使用事务确保数据一致性
    db.transaction((tx: any) => {
      // 将所有现有岗位设为 inactive
      tx.update(jobDescriptions)
        .set({
          isActive: false,
          updatedAt: now,
        })
        .where(eq(jobDescriptions.isActive, true))
        .run();

      // 插入新岗位描述
      tx.insert(jobDescriptions)
        .values({
          id: jobId,
          title: data.title,
          description: data.description,
          requiredSkills: JSON.stringify(data.requiredSkills),
          preferredSkills: JSON.stringify(data.preferredSkills),
          isActive: true,
          createdAt: now,
          updatedAt: now,
        })
        .run();
    });

    // 查询并返回创建的岗位信息
    const job = await getJobById(jobId);
    if (!job) {
      throw new Error("Failed to retrieve created job");
    }

    return job;
  } catch (error) {
    console.error("Failed to create or update job:", error);
    throw new Error("Failed to create or update job");
  }
}

/**
 * 获取当前激活的岗位描述
 */
export async function getActiveJob(): Promise<JobDescription | null> {
  try {
    const activeJobs = await db
      .select()
      .from(jobDescriptions)
      .where(eq(jobDescriptions.isActive, true))
      .orderBy(desc(jobDescriptions.createdAt))
      .limit(1);

    if (activeJobs.length === 0) {
      return null;
    }

    const job = activeJobs[0];

    // 反序列化 JSON 字段
    return {
      id: job.id,
      title: job.title,
      description: job.description,
      requiredSkills: parseJsonArray(job.requiredSkills),
      preferredSkills: parseJsonArray(job.preferredSkills),
      isActive: job.isActive,
      createdAt: new Date(job.createdAt),
      updatedAt: new Date(job.updatedAt),
    };
  } catch (error) {
    console.error("Failed to get active job:", error);
    throw new Error("Failed to get active job");
  }
}

/**
 * 根据 ID 获取岗位描述
 */
export async function getJobById(id: string): Promise<JobDescription | null> {
  try {
    const jobs = await db
      .select()
      .from(jobDescriptions)
      .where(eq(jobDescriptions.id, id))
      .limit(1);

    if (jobs.length === 0) {
      return null;
    }

    const job = jobs[0];

    // 反序列化 JSON 字段
    return {
      id: job.id,
      title: job.title,
      description: job.description,
      requiredSkills: parseJsonArray(job.requiredSkills),
      preferredSkills: parseJsonArray(job.preferredSkills),
      isActive: job.isActive,
      createdAt: new Date(job.createdAt),
      updatedAt: new Date(job.updatedAt),
    };
  } catch (error) {
    console.error("Failed to get job by ID:", error);
    throw new Error("Failed to get job by ID");
  }
}

/**
 * 辅助函数：解析 JSON 字符串数组
 * 处理解析错误并返回空数组作为默认值
 */
function parseJsonArray(jsonString: string): string[] {
  try {
    const parsed = JSON.parse(jsonString);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse JSON array:", error);
    return [];
  }
}
