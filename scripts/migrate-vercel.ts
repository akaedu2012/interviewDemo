#!/usr/bin/env node
/**
 * Vercel 部署时的数据库迁移脚本
 * 在构建时运行，确保数据库 schema 已创建
 */

import { db } from "../db";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";

async function runMigrations() {
  try {
    console.log("开始运行数据库迁移...");
    
    // 运行迁移
    migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
    
    console.log("✓ 数据库迁移完成");
    process.exit(0);
  } catch (error) {
    console.error("✗ 数据库迁移失败:", error);
    process.exit(1);
  }
}

runMigrations();
