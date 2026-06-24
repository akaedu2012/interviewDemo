/**
 * AI信息提取服务
 * 使用 DeepSeek AI 模型从简历文本中提取结构化信息
 * 
 * 功能：
 * - 提取基本信息（姓名、电话、邮箱、城市）
 * - 提取教育背景
 * - 提取工作经历
 * - 提取技能标签
 * - 支持流式提取（SSE）
 */

import { callAIForJSON } from "@/lib/aiClient";
import {
  BasicInfo,
  Education,
  Experience,
  Skills,
  ExtractionProgress,
  ExtractedData,
} from "@/types";

/**
 * 任务 4.2 - 提取基本信息
 * 从简历文本中提取候选人的基本信息
 * 
 * @param resumeText - 简历文本内容
 * @returns 基本信息对象（字段缺失时返回 null）
 */
export async function extractBasicInfo(
  resumeText: string
): Promise<BasicInfo> {
  const systemPrompt = `你是一个专业的简历信息提取助手。请从简历文本中提取候选人的基本信息。
你必须返回严格符合以下 JSON 格式的数据：
{
  "name": "候选人姓名（字符串或 null）",
  "phone": "电话号码（字符串或 null）",
  "email": "邮箱地址（字符串或 null）",
  "city": "所在城市（字符串或 null）"
}

规则：
- 如果无法找到某个字段的信息，该字段值必须设置为 null
- 电话号码保留原始格式（包括区号、分隔符等）
- 邮箱地址必须是有效的邮箱格式
- 城市只需要提取市级或省级名称，不需要详细地址
- 不要添加任何额外的字段或解释`;

  const userPrompt = `请从以下简历文本中提取基本信息：

${resumeText}`;

  try {
    const result = await callAIForJSON<BasicInfo>(systemPrompt, userPrompt, {
      temperature: 0.1,
      maxTokens: 500,
    });

    // 确保返回的字段符合 BasicInfo 类型
    return {
      name: result.name || null,
      phone: result.phone || null,
      email: result.email || null,
      city: result.city || null,
    };
  } catch (error) {
    console.error("基本信息提取失败:", error);
    throw new Error("无法从简历中提取基本信息");
  }
}

/**
 * 任务 4.3 - 提取教育背景
 * 从简历文本中提取教育背景信息
 * 
 * @param resumeText - 简历文本内容
 * @returns 教育背景数组
 */
export async function extractEducation(
  resumeText: string
): Promise<Omit<Education, "id" | "candidateId">[]> {
  const systemPrompt = `你是一个专业的简历信息提取助手。请从简历文本中提取候选人的教育背景信息。
你必须返回严格符合以下 JSON 格式的数据：
{
  "education": [
    {
      "school": "学校名称",
      "major": "专业名称",
      "degree": "学位（如：本科、硕士、博士、专科等）",
      "graduationTime": "毕业时间（格式：YYYY-MM 或 YYYY）"
    }
  ]
}

规则：
- education 字段必须是一个数组，即使只有一条记录
- 如果没有找到教育背景信息，返回空数组
- 按时间倒序排列（最近的教育经历在前）
- graduationTime 尽量使用 YYYY-MM 格式，如果只有年份则使用 YYYY 格式
- 不要添加任何额外的字段或解释`;

  const userPrompt = `请从以下简历文本中提取教育背景信息：

${resumeText}`;

  try {
    const result = await callAIForJSON<{ education: Omit<Education, "id" | "candidateId">[] }>(
      systemPrompt,
      userPrompt,
      {
        temperature: 0.1,
        maxTokens: 1500,
      }
    );

    return result.education || [];
  } catch (error) {
    console.error("教育背景提取失败:", error);
    throw new Error("无法从简历中提取教育背景信息");
  }
}

/**
 * 任务 4.4 - 提取工作经历
 * 从简历文本中提取工作经历信息
 * 
 * @param resumeText - 简历文本内容
 * @returns 工作经历数组
 */
export async function extractExperience(
  resumeText: string
): Promise<Omit<Experience, "id" | "candidateId">[]> {
  const systemPrompt = `你是一个专业的简历信息提取助手。请从简历文本中提取候选人的工作经历信息。
你必须返回严格符合以下 JSON 格式的数据：
{
  "experience": [
    {
      "company": "公司名称",
      "title": "职位名称",
      "startDate": "开始日期（格式：YYYY-MM）",
      "endDate": "结束日期（格式：YYYY-MM 或 '至今'）",
      "responsibilities": "工作职责和成就的简要描述"
    }
  ]
}

规则：
- experience 字段必须是一个数组，即使只有一条记录
- 如果没有找到工作经历信息，返回空数组
- 按时间倒序排列（最近的工作经历在前）
- startDate 和 endDate 尽量使用 YYYY-MM 格式
- 如果候选人目前仍在职，endDate 使用 "至今"
- responsibilities 应该是对工作内容的简要总结，不超过200字
- 不要添加任何额外的字段或解释`;

  const userPrompt = `请从以下简历文本中提取工作经历信息：

${resumeText}`;

  try {
    const result = await callAIForJSON<{ experience: Omit<Experience, "id" | "candidateId">[] }>(
      systemPrompt,
      userPrompt,
      {
        temperature: 0.1,
        maxTokens: 2500,
      }
    );

    return result.experience || [];
  } catch (error) {
    console.error("工作经历提取失败:", error);
    throw new Error("无法从简历中提取工作经历信息");
  }
}

/**
 * 技能标准化映射表
 * 将各种不同的技能名称统一为标准格式
 */
const SKILL_NORMALIZATION_MAP: Record<string, string> = {
  // 编程语言
  javascript: "JavaScript",
  js: "JavaScript",
  typescript: "TypeScript",
  ts: "TypeScript",
  python: "Python",
  java: "Java",
  csharp: "C#",
  "c#": "C#",
  cpp: "C++",
  "c++": "C++",
  go: "Go",
  golang: "Go",
  rust: "Rust",
  php: "PHP",
  ruby: "Ruby",
  swift: "Swift",
  kotlin: "Kotlin",
  
  // 前端框架
  react: "React",
  reactjs: "React",
  vue: "Vue.js",
  vuejs: "Vue.js",
  angular: "Angular",
  angularjs: "Angular",
  svelte: "Svelte",
  nextjs: "Next.js",
  "next.js": "Next.js",
  nuxtjs: "Nuxt.js",
  "nuxt.js": "Nuxt.js",
  
  // 后端框架
  nodejs: "Node.js",
  "node.js": "Node.js",
  express: "Express",
  expressjs: "Express",
  nestjs: "NestJS",
  koa: "Koa",
  django: "Django",
  flask: "Flask",
  fastapi: "FastAPI",
  springboot: "Spring Boot",
  "spring boot": "Spring Boot",
  
  // 数据库
  mysql: "MySQL",
  postgresql: "PostgreSQL",
  postgres: "PostgreSQL",
  mongodb: "MongoDB",
  mongo: "MongoDB",
  redis: "Redis",
  sqlite: "SQLite",
  oracle: "Oracle",
  sqlserver: "SQL Server",
  "sql server": "SQL Server",
  
  // 云服务
  aws: "AWS",
  azure: "Azure",
  gcp: "Google Cloud",
  "google cloud": "Google Cloud",
  aliyun: "阿里云",
  "阿里云": "阿里云",
  tencent: "腾讯云",
  "腾讯云": "腾讯云",
  
  // 工具
  git: "Git",
  github: "GitHub",
  gitlab: "GitLab",
  docker: "Docker",
  kubernetes: "Kubernetes",
  k8s: "Kubernetes",
  jenkins: "Jenkins",
  webpack: "Webpack",
  vite: "Vite",
  
  // 其他
  html: "HTML",
  css: "CSS",
  sass: "Sass",
  scss: "Sass",
  less: "Less",
  tailwind: "Tailwind CSS",
  "tailwind css": "Tailwind CSS",
  bootstrap: "Bootstrap",
  graphql: "GraphQL",
  restful: "RESTful API",
  "rest api": "RESTful API",
};

/**
 * 标准化技能名称
 * 将技能名称转换为统一的标准格式
 * 
 * @param skill - 原始技能名称
 * @returns 标准化后的技能名称
 */
function normalizeSkill(skill: string): string {
  const trimmed = skill.trim();
  const lowercase = trimmed.toLowerCase();
  
  // 如果在映射表中找到，返回标准名称
  if (SKILL_NORMALIZATION_MAP[lowercase]) {
    return SKILL_NORMALIZATION_MAP[lowercase];
  }
  
  // 否则返回首字母大写的原始名称
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * 任务 4.5 - 提取技能标签
 * 从简历文本中提取技能信息，并进行标准化处理
 * 
 * @param resumeText - 简历文本内容
 * @returns 技能对象（包含技术技能、工具、编程语言）
 */
export async function extractSkills(resumeText: string): Promise<Skills> {
  const systemPrompt = `你是一个专业的简历信息提取助手。请从简历文本中提取候选人的技能信息。
你必须返回严格符合以下 JSON 格式的数据：
{
  "technical": ["技术技能1", "技术技能2"],
  "tools": ["工具/框架1", "工具/框架2"],
  "languages": ["编程语言1", "编程语言2"]
}

分类规则：
- technical: 技术能力、方法论、架构模式等（如：微服务、RESTful API、敏捷开发、测试驱动开发）
- tools: 具体的工具、框架、库（如：React、Vue、Docker、Kubernetes、Git）
- languages: 编程语言（如：JavaScript、Python、Java、Go）

提取规则：
- 每个数组中的技能应该是去重的
- 不要包含过于泛泛的技能（如"编程"、"开发"）
- 如果某个类别没有找到技能，返回空数组
- 不要添加任何额外的字段或解释`;

  const userPrompt = `请从以下简历文本中提取技能信息：

${resumeText}`;

  try {
    const result = await callAIForJSON<Skills>(systemPrompt, userPrompt, {
      temperature: 0.1,
      maxTokens: 1500,
    });

    // 标准化技能名称
    const normalizedSkills: Skills = {
      technical: (result.technical || [])
        .map(normalizeSkill)
        .filter((skill, index, array) => array.indexOf(skill) === index), // 去重
      tools: (result.tools || [])
        .map(normalizeSkill)
        .filter((skill, index, array) => array.indexOf(skill) === index), // 去重
      languages: (result.languages || [])
        .map(normalizeSkill)
        .filter((skill, index, array) => array.indexOf(skill) === index), // 去重
    };

    return normalizedSkills;
  } catch (error) {
    console.error("技能标签提取失败:", error);
    throw new Error("无法从简历中提取技能信息");
  }
}

/**
 * 任务 4.6 - 流式提取所有信息
 * 按阶段依次提取简历的所有信息，支持 SSE 流式传输
 * 
 * @param resumeText - 简历文本内容
 * @yields 每个提取阶段的进度信息
 */
export async function* extractAll(
  resumeText: string
): AsyncGenerator<ExtractionProgress> {
  try {
    // 阶段 1: 提取基本信息
    console.log("开始提取基本信息...");
    const basicInfo = await extractBasicInfo(resumeText);
    yield {
      stage: "basic",
      data: { basicInfo },
    };

    // 阶段 2: 提取教育背景
    console.log("开始提取教育背景...");
    const education = await extractEducation(resumeText);
    yield {
      stage: "education",
      data: { basicInfo, education: education as Education[] },
    };

    // 阶段 3: 提取工作经历
    console.log("开始提取工作经历...");
    const experience = await extractExperience(resumeText);
    yield {
      stage: "experience",
      data: {
        basicInfo,
        education: education as Education[],
        experience: experience as Experience[],
      },
    };

    // 阶段 4: 提取技能标签
    console.log("开始提取技能标签...");
    const skills = await extractSkills(resumeText);
    yield {
      stage: "skills",
      data: {
        basicInfo,
        education: education as Education[],
        experience: experience as Experience[],
        skills,
      },
    };

    // 阶段 5: 提取完成
    console.log("所有信息提取完成");
    yield {
      stage: "complete",
      data: {
        basicInfo,
        education: education as Education[],
        experience: experience as Experience[],
        skills,
      },
    };
  } catch (error) {
    console.error("流式提取过程中发生错误:", error);
    throw error;
  }
}

/**
 * 一次性提取所有信息（非流式）
 * 适用于不需要实时进度反馈的场景
 * 
 * @param resumeText - 简历文本内容
 * @returns 提取的完整数据
 */
export async function extractAllSync(
  resumeText: string
): Promise<ExtractedData> {
  console.log("开始同步提取所有信息...");

  try {
    // 并行提取所有信息以提高效率
    const [basicInfo, education, experience, skills] = await Promise.all([
      extractBasicInfo(resumeText),
      extractEducation(resumeText),
      extractExperience(resumeText),
      extractSkills(resumeText),
    ]);

    console.log("同步提取完成");

    return {
      basicInfo,
      education: education as Education[],
      experience: experience as Experience[],
      skills,
    };
  } catch (error) {
    console.error("同步提取失败:", error);
    throw error;
  }
}
