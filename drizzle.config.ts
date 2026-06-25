import type { Config } from "drizzle-kit";

// 根据环境选择数据库路径
const isVercel = process.env.VERCEL === '1';
const dbPath = isVercel ? '/tmp/resume-analyzer.db' : './data/resume-analyzer.db';

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: dbPath,
  },
} satisfies Config;
