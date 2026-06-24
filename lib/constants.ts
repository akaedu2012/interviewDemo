import { CandidateStatus } from "@/types";

// 候选人状态常量
export const CANDIDATE_STATUSES: CandidateStatus[] = [
  "待筛选",
  "初筛通过",
  "面试中",
  "已录用",
  "已淘汰",
];

// 文件上传配置
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 5,
  ALLOWED_TYPES: ["application/pdf"],
  ALLOWED_EXTENSIONS: [".pdf"],
} as const;

// 分页配置
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// API 错误代码
export const ERROR_CODES = {
  INVALID_FILE_FORMAT: "INVALID_FILE_FORMAT",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_INPUT: "INVALID_INPUT",
  INVALID_STATUS: "INVALID_STATUS",
  CANDIDATE_NOT_FOUND: "CANDIDATE_NOT_FOUND",
  JOB_NOT_FOUND: "JOB_NOT_FOUND",
  NO_ACTIVE_JOB: "NO_ACTIVE_JOB",
  PDF_PARSE_ERROR: "PDF_PARSE_ERROR",
  EXTRACTION_ERROR: "EXTRACTION_ERROR",
  MATCH_CALCULATION_ERROR: "MATCH_CALCULATION_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
} as const;

// AI 配置
export const AI_CONFIG = {
  MODEL: "deepseek-chat", // 使用 DeepSeek 大模型
  MAX_TOKENS: 4000,
  TEMPERATURE: 0.1,
  API_BASE_URL: "https://api.deepseek.com/v1",
} as const;

// 评分权重
export const SCORING_WEIGHTS = {
  SKILL: 0.4,
  EXPERIENCE: 0.4,
  EDUCATION: 0.2,
  REQUIRED_SKILLS: 0.6,
  PREFERRED_SKILLS: 0.3,
  ADDITIONAL_SKILLS: 0.1,
} as const;

// 评分范围
export const SCORE_RANGES = {
  LOW: { min: 0, max: 60, color: "red", label: "不匹配" },
  MEDIUM: { min: 60, max: 80, color: "yellow", label: "一般匹配" },
  HIGH: { min: 80, max: 100, color: "green", label: "高度匹配" },
} as const;

// 技能类型
export const SKILL_TYPES = {
  TECHNICAL: "technical",
  TOOL: "tool",
  LANGUAGE: "language",
} as const;

// 上传文件存储路径
export const UPLOAD_DIR = "public/uploads";

// 数据库路径
export const DB_PATH = "data/resume-analyzer.db";
