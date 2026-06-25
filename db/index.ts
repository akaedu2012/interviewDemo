import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";
import { sql } from "drizzle-orm";

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

// 检查数据库文件是否存在
const dbExists = fs.existsSync(dbPath);
const needsInit = !dbExists;

// 初始化 SQLite 数据库
log(`初始化数据库: ${dbPath} (需要初始化: ${needsInit})`);
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

// 如果是新数据库，创建表结构
if (needsInit) {
  log(`检测到新数据库，开始创建表结构...`);
  
  try {
    // 创建候选人表
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS candidates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        city TEXT,
        status TEXT DEFAULT 'pending',
        file_name TEXT,
        file_path TEXT,
        file_size INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 创建教育背景表
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS education (
        id TEXT PRIMARY KEY,
        candidate_id TEXT NOT NULL,
        school TEXT NOT NULL,
        degree TEXT,
        major TEXT,
        start_date TEXT,
        end_date TEXT,
        description TEXT,
        FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
      )
    `);
    
    // 创建工作经历表
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS experience (
        id TEXT PRIMARY KEY,
        candidate_id TEXT NOT NULL,
        company TEXT NOT NULL,
        position TEXT NOT NULL,
        start_date TEXT,
        end_date TEXT,
        description TEXT,
        FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
      )
    `);
    
    // 创建技能表
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS skills (
        id TEXT PRIMARY KEY,
        candidate_id TEXT NOT NULL,
        skill_type TEXT NOT NULL,
        skill_name TEXT NOT NULL,
        FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
      )
    `);
    
    // 创建岗位描述表
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS job_descriptions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        required_skills TEXT,
        preferred_skills TEXT,
        min_education TEXT,
        min_experience INTEGER,
        job_description TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 创建匹配分数表
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS match_scores (
        id TEXT PRIMARY KEY,
        candidate_id TEXT NOT NULL,
        job_id TEXT NOT NULL,
        overall_score INTEGER NOT NULL,
        skills_score INTEGER,
        experience_score INTEGER,
        education_score INTEGER,
        ai_commentary TEXT,
        matched_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
        FOREIGN KEY (job_id) REFERENCES job_descriptions(id) ON DELETE CASCADE
      )
    `);
    
    // 创建索引
    sqlite.exec(`
      CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
      CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_education_candidate_id ON education(candidate_id);
      CREATE INDEX IF NOT EXISTS idx_experience_candidate_id ON experience(candidate_id);
      CREATE INDEX IF NOT EXISTS idx_skills_candidate_id ON skills(candidate_id);
      CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(skill_name);
      CREATE INDEX IF NOT EXISTS idx_job_active ON job_descriptions(is_active);
      CREATE INDEX IF NOT EXISTS idx_match_scores_candidate_id ON match_scores(candidate_id);
      CREATE INDEX IF NOT EXISTS idx_match_scores_overall_score ON match_scores(overall_score DESC);
    `);
    
    log(`表结构和索引创建成功`);
  } catch (error) {
    log(`表结构创建失败: ${error instanceof Error ? error.message : '未知错误'}`);
    throw error;
  }
}

// 导出数据库路径和环境信息
export const dbInfo = {
  path: dbPath,
  dir: dbDir,
  isVercel,
  exists: fs.existsSync(dbPath),
  initialized: !needsInit,
};

// 导出 schema 以供使用
export * from "./schema";
