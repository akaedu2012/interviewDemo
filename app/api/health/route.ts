import { NextResponse } from "next/server";
import { checkDatabaseHealth, validateDatabaseSchema } from "@/lib/db-health";
import { validateEnvironment } from "@/lib/env-validator";
import { successResponse, errorResponse } from "@/lib/api-error-handler";
import { logger, ApiTimer } from "@/lib/logger";

export const dynamic = 'force-dynamic';

/**
 * 健康检查端点
 * 用于监控应用和数据库状态
 */
export async function GET(request: Request) {
  const timer = new ApiTimer('GET', '/api/health');
  
  try {
    const startTime = Date.now();

    // 检查数据库健康
    const dbHealth = await checkDatabaseHealth();
    const dbSchema = await validateDatabaseSchema();
    
    // 检查环境变量
    const envValidation = validateEnvironment();

    // 计算响应时间
    const responseTime = Date.now() - startTime;

    // 判断整体健康状态
    const isHealthy = dbHealth.healthy && dbSchema.valid && envValidation.valid;
    
    const healthData = {
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      database: {
        status: dbHealth.healthy ? "healthy" : "unhealthy",
        message: dbHealth.message,
        tableCount: dbHealth.tableCount,
        schema: {
          valid: dbSchema.valid,
          tables: dbSchema.tables,
          missing: dbSchema.missing,
        },
      },
      environment: {
        validation: envValidation.valid ? "passed" : "failed",
        missing: envValidation.missing,
        warnings: envValidation.warnings,
        ...envValidation.environment,
      },
      version: "1.0.0",
      region: process.env.VERCEL_REGION || "local",
    };

    logger.info("健康检查完成", {
      status: healthData.status,
      dbHealthy: dbHealth.healthy,
      envValid: envValidation.valid,
    });

    timer.end(isHealthy ? 200 : 503);
    
    return successResponse(healthData, isHealthy ? 200 : 503);
  } catch (error) {
    logger.error("健康检查失败", error instanceof Error ? error : undefined);
    timer.end(500);
    return errorResponse(error, "健康检查失败");
  }
}
