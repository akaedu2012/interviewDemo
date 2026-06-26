import type { Config } from "drizzle-kit";

// 检查是否使用 Turso（仅在构建时有效）
const useTurso = process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN;

const config: Config = {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: useTurso
    ? {
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }
    : {
        url: "./data/resume-analyzer.db",
      },
};

export default config;
