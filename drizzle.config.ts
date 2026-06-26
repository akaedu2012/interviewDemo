import type { Config } from "drizzle-kit";

// 检查是否使用 Turso（仅在构建时有效）
const useTurso = !!(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);

const config: Config = useTurso
  ? {
      schema: "./db/schema.ts",
      out: "./drizzle",
      dialect: "sqlite",
      dbCredentials: {
        url: process.env.TURSO_DATABASE_URL as string,
        authToken: process.env.TURSO_AUTH_TOKEN as string,
      },
    }
  : {
      schema: "./db/schema.ts",
      out: "./drizzle",
      dialect: "sqlite",
      dbCredentials: {
        url: "./data/resume-analyzer.db",
      },
    };

export default config;
