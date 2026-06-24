import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "resume-analyzer.db");
const sqlite = new Database(dbPath);

// 创建索引
const indexes = [
  "CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status)",
  "CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_education_candidate_id ON education(candidate_id)",
  "CREATE INDEX IF NOT EXISTS idx_experience_candidate_id ON experience(candidate_id)",
  "CREATE INDEX IF NOT EXISTS idx_skills_candidate_id ON skills(candidate_id)",
  "CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(skill_name)",
  "CREATE INDEX IF NOT EXISTS idx_job_active ON job_descriptions(is_active)",
  "CREATE INDEX IF NOT EXISTS idx_match_scores_candidate_id ON match_scores(candidate_id)",
  "CREATE INDEX IF NOT EXISTS idx_match_scores_overall_score ON match_scores(overall_score DESC)",
];

console.log("开始创建数据库索引...");

indexes.forEach((indexSql, i) => {
  try {
    sqlite.exec(indexSql);
    console.log(`✓ 索引 ${i + 1}/${indexes.length} 创建成功`);
  } catch (error) {
    console.error(`✗ 索引 ${i + 1}/${indexes.length} 创建失败:`, error);
  }
});

console.log("数据库索引创建完成！");
sqlite.close();
