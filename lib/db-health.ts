import { db } from "@/db";
import { sql } from "drizzle-orm";

/**
 * 数据库健康检查工具
 */

let lastHealthCheck: Date | null = null;
let isHealthy = false;

/**
 * 检查数据库连接是否健康
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean;
  message: string;
  tableCount?: number;
  lastCheck?: Date;
}> {
  try {
    // 执行简单查询测试连接
    const result = db.all(sql`
      SELECT COUNT(*) as count 
      FROM sqlite_master 
      WHERE type='table'
    `) as { count: number }[];

    const tableCount = result[0]?.count || 0;
    
    lastHealthCheck = new Date();
    isHealthy = tableCount > 0;

    return {
      healthy: isHealthy,
      message: isHealthy ? "数据库连接正常" : "数据库表未初始化",
      tableCount,
      lastCheck: lastHealthCheck,
    };
  } catch (error) {
    lastHealthCheck = new Date();
    isHealthy = false;

    return {
      healthy: false,
      message: error instanceof Error ? error.message : "数据库连接失败",
      lastCheck: lastHealthCheck,
    };
  }
}

/**
 * 获取最后一次健康检查结果
 */
export function getLastHealthCheck() {
  return {
    healthy: isHealthy,
    lastCheck: lastHealthCheck,
  };
}

/**
 * 验证数据库表是否存在
 */
export async function validateDatabaseSchema(): Promise<{
  valid: boolean;
  tables: string[];
  missing: string[];
}> {
  // 实际数据库中的核心表
  const requiredTables = ['candidates', 'education', 'experience', 'skills', 'job_descriptions'];
  
  try {
    const result = db.all(sql`
      SELECT name 
      FROM sqlite_master 
      WHERE type='table'
    `) as { name: string }[];

    const existingTables = result.map(r => r.name);
    const missing = requiredTables.filter(t => !existingTables.includes(t));

    return {
      valid: missing.length === 0,
      tables: existingTables,
      missing,
    };
  } catch (error) {
    console.error("[DB Schema Validation]", error);
    return {
      valid: false,
      tables: [],
      missing: requiredTables,
    };
  }
}

/**
 * 数据库连接重试包装器
 */
export async function withRetry<T>(
  operation: () => T,
  maxRetries = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`[DB Retry] 尝试 ${attempt}/${maxRetries} 失败:`, lastError.message);

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError || new Error("数据库操作失败");
}
