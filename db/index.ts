import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

// 创建数据库文件路径
// 在 Vercel 环境中使用 /tmp 目录，本地开发使用 data 目录
const isVercel = process.env.VERCEL === '1';
const dbDir = isVercel ? '/tmp' : path.join(process.cwd(), "data");
const dbPath = path.join(dbDir, "resume-analyzer.db");

// 确保数据库目录存在
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// 初始化 SQLite 数据库
const sqlite = new Database(dbPath);

// 创建 Drizzle ORM 实例
export const db = drizzle(sqlite, { schema });

// 导出 schema 以供使用
export * from "./schema";
