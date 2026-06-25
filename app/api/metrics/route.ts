import { NextResponse } from "next/server";
import { db } from "@/db";
import { candidates, jobs, resumes } from "@/db/schema";
import { sql } from "drizzle-orm";
import { successResponse, errorResponse } from "@/lib/api-error-handler";
import { logger } from "@/lib/logger";

export const dynamic = 'force-dynamic';

/**
 * 应用指标和统计信息端点
 */
export async function GET() {
  try {
    logger.info("获取应用指标");

    // 获取候选人统计
    const candidateCount = db.all(sql`SELECT COUNT(*) as count FROM ${candidates}`) as { count: number }[];
    
    // 获取岗位统计
    const jobCount = db.all(sql`SELECT COUNT(*) as count FROM ${jobs}`) as { count: number }[];
    const activeJobCount = db.all(sql`
      SELECT COUNT(*) as count FROM ${jobs} WHERE isActive = 1
    `) as { count: number }[];
    
    // 获取简历统计
    const resumeCount = db.all(sql`SELECT COUNT(*) as count FROM ${resumes}`) as { count: number }[];
    
    // 获取候选人状态分布
    const statusDistribution = db.all(sql`
      SELECT status, COUNT(*) as count 
      FROM ${candidates} 
      GROUP BY status
    `) as { status: string; count: number }[];

    // 获取数据库大小（如果可能）
    let dbSize = 0;
    try {
      const pageCount = db.all(sql`PRAGMA page_count`) as { page_count: number }[];
      const pageSize = db.all(sql`PRAGMA page_size`) as { page_size: number }[];
      dbSize = (pageCount[0]?.page_count || 0) * (pageSize[0]?.page_size || 0);
    } catch {
      // 忽略错误
    }

    // 系统指标
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: {
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
          external: process.memoryUsage().external,
          rss: process.memoryUsage().rss,
        },
        nodeVersion: process.version,
        platform: process.platform,
        isVercel: process.env.VERCEL === '1',
      },
      database: {
        size: dbSize,
        sizeFormatted: formatBytes(dbSize),
        candidates: {
          total: candidateCount[0]?.count || 0,
          byStatus: statusDistribution.reduce((acc, item) => {
            acc[item.status] = item.count;
            return acc;
          }, {} as Record<string, number>),
        },
        jobs: {
          total: jobCount[0]?.count || 0,
          active: activeJobCount[0]?.count || 0,
        },
        resumes: {
          total: resumeCount[0]?.count || 0,
        },
      },
    };

    logger.info("应用指标获取成功", {
      candidateCount: metrics.database.candidates.total,
      jobCount: metrics.database.jobs.total,
    });

    return successResponse(metrics);
  } catch (error) {
    logger.error("获取应用指标失败", error instanceof Error ? error : undefined);
    return errorResponse(error, "获取应用指标失败");
  }
}

/**
 * 格式化字节大小
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
