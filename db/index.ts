import * as schema from "./schema";
import path from "path";
import fs from "fs";

// 日志函数
const log = (message: string) => {
  const timestamp = new Date().toISOString();
  console.log(`[DB Init ${timestamp}] ${message}`);
};

// 检查环境：Vercel 环境且配置了 Turso 凭证则使用 Turso
const isVercel = process.env.VERCEL === '1';
const useTurso = process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN;

// 数据库实例（延迟初始化）
let dbInstance: any = null;
let isLibsql = false; // 标记是否使用 libsql（Turso）

// 初始化数据库（异步）
async function initializeDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  let needsInit = false;

  if (useTurso) {
    // ========== Turso 云数据库 ==========
    log(`使用 Turso 云数据库: ${process.env.TURSO_DATABASE_URL}`);
    
    const { drizzle: drizzleLibsql } = await import("drizzle-orm/libsql");
    const { createClient } = await import("@libsql/client");
    
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });
    
    dbInstance = drizzleLibsql(client, { schema });
    isLibsql = true; // 标记为 libsql
    log(`Turso 连接成功`);
    
    // Turso 云数据库不需要初始化表结构（通过 drizzle-kit push 完成）
    needsInit = false;
    
  } else {
    // ========== 本地 SQLite 数据库 ==========
    log(`使用本地 SQLite 数据库`);
    
    const { drizzle: drizzleBetterSqlite } = await import("drizzle-orm/better-sqlite3");
    const Database = (await import("better-sqlite3")).default;
    
    // 在 Vercel 环境中使用 /tmp 目录，本地开发使用 data 目录
    const dbDir = isVercel ? '/tmp' : path.join(process.cwd(), "data");
    const dbPath = path.join(dbDir, "resume-analyzer.db");
    
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
    needsInit = !dbExists;
    
    // 初始化 SQLite 数据库
    log(`初始化数据库: ${dbPath} (需要初始化: ${needsInit})`);
    let sqlite: any;
    
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
    dbInstance = drizzleBetterSqlite(sqlite, { schema });

    // 如果是新数据库，创建表结构
    if (needsInit) {
      log(`检测到新数据库，开始创建表结构...`);
      
      try {
        // 创建候选人表
        sqlite.exec(`
          CREATE TABLE IF NOT EXISTS candidates (
            id TEXT PRIMARY KEY,
            name TEXT,
            phone TEXT,
            email TEXT,
            city TEXT,
            file_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT '待筛选',
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
            major TEXT NOT NULL,
            degree TEXT NOT NULL,
            graduation_time TEXT NOT NULL,
            FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
          )
        `);
        
        // 创建工作经历表
        sqlite.exec(`
          CREATE TABLE IF NOT EXISTS experience (
            id TEXT PRIMARY KEY,
            candidate_id TEXT NOT NULL,
            company TEXT NOT NULL,
            title TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            responsibilities TEXT NOT NULL,
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
            description TEXT NOT NULL,
            required_skills TEXT NOT NULL,
            preferred_skills TEXT NOT NULL,
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
            overall_score REAL NOT NULL,
            skill_score REAL NOT NULL,
            experience_score REAL NOT NULL,
            education_score REAL NOT NULL,
            commentary TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
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
        
        // 插入默认岗位描述（如果是新数据库）
        try {
          const defaultJobId = 'default-job-' + Date.now();
          log(`开始插入默认岗位描述，ID: ${defaultJobId}`);
          
          // 使用 Drizzle ORM 插入
          // better-sqlite3 需要同步 API，libsql 需要异步 API
          const insertQuery = dbInstance.insert(schema.jobDescriptions).values({
            id: defaultJobId,
            title: '全栈开发工程师',
            description: '我们正在寻找一位经验丰富的全栈开发工程师，负责开发和维护公司的核心产品。',
            requiredSkills: JSON.stringify(["JavaScript", "React", "Node.js", "TypeScript", "数据库设计"]),
            preferredSkills: JSON.stringify(["Next.js", "Docker", "AWS", "CI/CD", "微服务架构"]),
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          
          // better-sqlite3 使用同步 .run()
          if (insertQuery.run) {
            insertQuery.run();
          }
          
          log(`默认岗位描述创建成功`);
        } catch (jobError) {
          log(`默认岗位描述创建失败: ${jobError instanceof Error ? jobError.message : '未知错误'}`);
          // 不要抛出错误，继续运行
          console.error('Failed to insert default job, but continuing...', jobError);
        }
      } catch (error) {
        log(`表结构创建失败: ${error instanceof Error ? error.message : '未知错误'}`);
        throw error;
      }
    }
  }

  return dbInstance;
}

// 创建一个代理对象来延迟初始化
const db = new Proxy({} as any, {
  get(target, prop) {
    // 如果还没有初始化，立即初始化（同步返回 Promise）
    if (!dbInstance) {
      throw new Error('数据库尚未初始化，请先调用 initializeDatabase()');
    }
    return dbInstance[prop];
  }
});

// 立即初始化（在 Next.js 中这会在模块加载时执行）
const dbInitPromise = initializeDatabase();

// 导出数据库实例和初始化函数
export { db, initializeDatabase, dbInitPromise, isLibsql };

// 导出 schema 以供使用
export * from "./schema";
