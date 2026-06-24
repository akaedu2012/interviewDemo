import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// 候选人表
export const candidates = sqliteTable("candidates", {
  id: text("id").primaryKey(),
  name: text("name"),
  phone: text("phone"),
  email: text("email"),
  city: text("city"),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  status: text("status").notNull().default("待筛选"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// 教育背景表
export const education = sqliteTable("education", {
  id: text("id").primaryKey(),
  candidateId: text("candidate_id")
    .notNull()
    .references(() => candidates.id, { onDelete: "cascade" }),
  school: text("school").notNull(),
  major: text("major").notNull(),
  degree: text("degree").notNull(),
  graduationTime: text("graduation_time").notNull(),
});

// 工作经历表
export const experience = sqliteTable("experience", {
  id: text("id").primaryKey(),
  candidateId: text("candidate_id")
    .notNull()
    .references(() => candidates.id, { onDelete: "cascade" }),
  company: text("company").notNull(),
  title: text("title").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  responsibilities: text("responsibilities").notNull(),
});

// 技能表
export const skills = sqliteTable("skills", {
  id: text("id").primaryKey(),
  candidateId: text("candidate_id")
    .notNull()
    .references(() => candidates.id, { onDelete: "cascade" }),
  skillType: text("skill_type").notNull(), // 'technical' | 'tool' | 'language'
  skillName: text("skill_name").notNull(),
});

// 岗位描述表
export const jobDescriptions = sqliteTable("job_descriptions", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requiredSkills: text("required_skills").notNull(), // JSON array
  preferredSkills: text("preferred_skills").notNull(), // JSON array
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// 匹配评分表
export const matchScores = sqliteTable("match_scores", {
  id: text("id").primaryKey(),
  candidateId: text("candidate_id")
    .notNull()
    .references(() => candidates.id, { onDelete: "cascade" }),
  jobId: text("job_id")
    .notNull()
    .references(() => jobDescriptions.id, { onDelete: "cascade" }),
  overallScore: real("overall_score").notNull(),
  skillScore: real("skill_score").notNull(),
  experienceScore: real("experience_score").notNull(),
  educationScore: real("education_score").notNull(),
  commentary: text("commentary").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
