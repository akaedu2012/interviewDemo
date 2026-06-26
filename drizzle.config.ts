import type { Config } from "drizzle-kit";

// 对于 Turso，我们只在运行时使用，构建时使用本地 SQLite
// 因为 drizzle-kit 的类型定义不支持 authToken 字段
const config: Config = {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./data/resume-analyzer.db",
  },
};

export default config;
