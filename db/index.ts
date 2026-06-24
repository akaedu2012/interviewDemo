import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";

// 创建数据库文件路径
const dbPath = path.join(process.cwd(), "data", "resume-analyzer.db");

// 初始化 SQLite 数据库
const sqlite = new Database(dbPath);

// 创建 Drizzle ORM 实例
export const db = drizzle(sqlite, { schema });

// 导出 schema 以供使用
export * from "./schema";
