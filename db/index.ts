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

// 日志函数
const log = (message: string) => {
  const timestamp = new Date().toISOString();
  console.log(`[DB Init ${timestamp}] ${message}`);
};

// 确保数据库目录存在
try {
  if (!fs.existsSync(dbDir)) {
    log(`创建数据库目录: ${dbDir}`);
    fs.mkdirSync(dbDir, { recursive: true });
    log(`目录创建成功`);
  } else {
    log(`数据库目录已存在: ${dbDir}`);
  }
} catch (error) {
  log(`创建目录失败: ${error instanceof Error ? error.message : '未知错误'}`);
  throw error;
}

// 初始化 SQLite 数据库
log(`初始化数据库: ${dbPath}`);
let sqlite: Database.Database;

try {
  sqlite = new Database(dbPath);
  
  // 设置性能优化选项
  sqlite.pragma('journal_mode = WAL'); // 写前日志模式，提高并发性能
  sqlite.pragma('synchronous = NORMAL'); // 平衡性能和安全性
  sqlite.pragma('cache_size = -64000'); // 64MB 缓存
  sqlite.pragma('temp_store = MEMORY'); // 临时表存储在内存中
  
  log(`数据库初始化成功，启用了性能优化`);
} catch (error) {
  log(`数据库初始化失败: ${error instanceof Error ? error.message : '未知错误'}`);
  throw error;
}

// 创建 Drizzle ORM 实例
export const db = drizzle(sqlite, { schema });

// 导出数据库路径和环境信息
export const dbInfo = {
  path: dbPath,
  dir: dbDir,
  isVercel,
  exists: fs.existsSync(dbPath),
};

// 导出 schema 以供使用
export * from "./schema";
