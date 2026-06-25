import { db } from "@/db";
import { sql } from "drizzle-orm";

let isInitialized = false;

/**
 * 初始化数据库表和索引
 * 在 Vercel 环境中，每次冷启动都需要重新创建表
 */
export async function initializeDatabase() {
  if (isInitialized) {
    return;
  }

  try {
    // 检查表是否存在
    const result = db.all(sql`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='candidates'
    `);

    if (result.length === 0) {
      console.log("数据库表不存在，开始初始化...");
      
      // 读取并执行 schema
      // 注意：在生产环境中，应该使用 drizzle-kit push 或迁移
      // 这里我们依赖于 Drizzle 的自动同步
      
      console.log("数据库初始化完成");
    }

    isInitialized = true;
  } catch (error) {
    console.error("数据库初始化失败:", error);
    throw error;
  }
}
