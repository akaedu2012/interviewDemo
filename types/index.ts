// 候选人状态类型
export type CandidateStatus = "待筛选" | "初筛通过" | "面试中" | "已录用" | "已淘汰";

// 技能类型
export type SkillType = "technical" | "tool" | "language";

// 基本信息
export interface BasicInfo {
  name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
}

// 教育背景
export interface Education {
  id: string;
  candidateId: string;
  school: string;
  major: string;
  degree: string;
  graduationTime: string;
}

// 工作经历
export interface Experience {
  id: string;
  candidateId: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

// 技能条目
export interface SkillEntry {
  id: string;
  candidateId: string;
  skillType: SkillType;
  skillName: string;
}

// 技能集合
export interface Skills {
  technical: string[];
  tools: string[];
  languages: string[];
}

// 候选人
export interface Candidate {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  fileName: string;
  filePath: string;
  fileSize: number;
  status: CandidateStatus;
  createdAt: Date;
  updatedAt: Date;
  education: Education[];
  experience: Experience[];
  skills: SkillEntry[];
  matchScore?: MatchScore;
}

// 岗位描述
export interface JobDescription {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 匹配评分
export interface MatchScore {
  id: string;
  candidateId: string;
  jobId: string;
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  commentary: string;
  createdAt: Date;
}

// 匹配结果
export interface MatchResult {
  overallScore: number; // 0-100
  skillScore: number; // 0-100
  experienceScore: number; // 0-100
  educationScore: number; // 0-100
  commentary: string;
}

// 文件上传结果
export interface UploadResult {
  fileId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  uploadedAt: Date;
}

// 文件验证结果
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// PDF 解析结果
export interface ParseResult {
  success: boolean;
  text?: string;
  error?: string;
  pageCount?: number;
}

// AI 提取进度
export type ExtractionStage = "basic" | "education" | "experience" | "skills" | "complete";

export interface ExtractionProgress {
  stage: ExtractionStage;
  data: Partial<ExtractedData>;
}

// 提取的完整数据
export interface ExtractedData {
  basicInfo: BasicInfo;
  education: Education[];
  experience: Experience[];
  skills: Skills;
}

// 列表查询选项
export interface ListOptions {
  page: number;
  pageSize: number;
  sortBy?: "score" | "uploadTime";
  sortOrder?: "asc" | "desc";
  skillFilters?: string[];
  searchKeyword?: string;
}

// 分页结果
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API 响应
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}
