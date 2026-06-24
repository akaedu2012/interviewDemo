/**
 * 岗位匹配评分服务
 * 负责计算候选人与岗位的匹配度
 */

import { callAI, callAIForJSON } from "@/lib/aiClient";
import { SCORING_WEIGHTS } from "@/lib/constants";
import type {
  Candidate,
  JobDescription,
  MatchResult,
  Skills,
  Experience,
  Education,
} from "@/types";

/**
 * 任务 5.1 - 计算技能匹配评分
 * 
 * 评分规则：
 * - 必备技能匹配: 60%权重
 * - 加分技能匹配: 30%权重
 * - 额外相关技能: 10%权重
 */
export function calculateSkillScore(
  candidateSkills: Skills,
  requiredSkills: string[],
  preferredSkills: string[]
): number {
  // 将候选人所有技能合并到一个数组（统一小写以便比较）
  const allCandidateSkills = [
    ...candidateSkills.technical,
    ...candidateSkills.tools,
    ...candidateSkills.languages,
  ].map((s) => s.toLowerCase());

  // 计算必备技能匹配度
  const requiredMatch = requiredSkills.filter((skill) =>
    allCandidateSkills.some((cs) => cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs))
  );
  const requiredScore =
    requiredSkills.length > 0
      ? (requiredMatch.length / requiredSkills.length) * 100
      : 100; // 如果没有必备技能要求，给满分

  // 计算加分技能匹配度
  const preferredMatch = preferredSkills.filter((skill) =>
    allCandidateSkills.some((cs) => cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs))
  );
  const preferredScore =
    preferredSkills.length > 0
      ? (preferredMatch.length / preferredSkills.length) * 100
      : 100; // 如果没有加分技能，给满分

  // 计算额外技能加分（候选人有但岗位未提的技能）
  const additionalSkills = allCandidateSkills.filter(
    (cs) =>
      !requiredSkills.some((rs) => cs.includes(rs.toLowerCase()) || rs.toLowerCase().includes(cs)) &&
      !preferredSkills.some((ps) => cs.includes(ps.toLowerCase()) || ps.toLowerCase().includes(cs))
  );
  const additionalScore = Math.min(additionalSkills.length * 5, 100); // 每个额外技能5分，最高100

  // 加权计算最终技能分数
  const finalScore =
    requiredScore * SCORING_WEIGHTS.REQUIRED_SKILLS +
    preferredScore * SCORING_WEIGHTS.PREFERRED_SKILLS +
    additionalScore * SCORING_WEIGHTS.ADDITIONAL_SKILLS;

  return Math.round(Math.min(finalScore, 100)); // 确保不超过100分
}

/**
 * 任务 5.2 - 使用AI计算工作经历匹配评分
 */
export async function calculateExperienceScore(
  experience: Experience[],
  jobDescription: string
): Promise<number> {
  if (experience.length === 0) {
    return 0;
  }

  const systemPrompt = `你是一个专业的HR评估助手。你需要评估候选人的工作经历与目标岗位的相关性和匹配度。

评估标准：
- 工作年限是否充足
- 行业/领域相关性
- 技术栈匹配度
- 职位级别匹配度
- 工作职责的相关性

你必须返回严格的JSON格式：
{
  "score": 85,  // 0-100的整数评分
  "reason": "候选人有3年相关经验，技术栈匹配度高..."  // 简短理由(不超过100字)
}`;

  const experienceText = experience
    .map(
      (exp) =>
        `${exp.company} | ${exp.title} | ${exp.startDate} - ${exp.endDate}\n${exp.responsibilities}`
    )
    .join("\n\n");

  const userPrompt = `岗位要求：
${jobDescription}

候选人工作经历：
${experienceText}

请评估匹配度并返回0-100的评分。`;

  try {
    const result = await callAIForJSON<{ score: number; reason: string }>(
      systemPrompt,
      userPrompt,
      {
        temperature: 0.2,
        maxTokens: 500,
      }
    );

    return Math.round(Math.max(0, Math.min(100, result.score || 0)));
  } catch (error) {
    console.error("工作经历评分失败:", error);
    return 50; // 默认中等分数
  }
}

/**
 * 任务 5.2 - 使用AI计算教育背景匹配评分
 */
export async function calculateEducationScore(
  education: Education[],
  jobDescription: string
): Promise<number> {
  if (education.length === 0) {
    return 50; // 无教育背景给中等分
  }

  const systemPrompt = `你是一个专业的HR评估助手。你需要评估候选人的教育背景与目标岗位的匹配度。

评估标准：
- 学历层次（本科/硕士/博士）
- 专业相关性
- 学校知名度
- 毕业时间（是否过于久远）

你必须返回严格的JSON格式：
{
  "score": 80,  // 0-100的整数评分
  "reason": "硕士学历，计算机专业，学校较好..."  // 简短理由(不超过100字)
}`;

  const educationText = education
    .map((edu) => `${edu.school} | ${edu.major} | ${edu.degree} | ${edu.graduationTime}`)
    .join("\n");

  const userPrompt = `岗位要求：
${jobDescription}

候选人教育背景：
${educationText}

请评估匹配度并返回0-100的评分。`;

  try {
    const result = await callAIForJSON<{ score: number; reason: string }>(
      systemPrompt,
      userPrompt,
      {
        temperature: 0.2,
        maxTokens: 500,
      }
    );

    return Math.round(Math.max(0, Math.min(100, result.score || 0)));
  } catch (error) {
    console.error("教育背景评分失败:", error);
    return 50; // 默认中等分数
  }
}

/**
 * 任务 5.3 - 综合匹配评分和评论生成
 * 协调所有子评分计算，生成最终匹配结果
 */
export async function calculateMatch(
  candidate: Candidate,
  job: JobDescription
): Promise<MatchResult> {
  try {
    // 合并候选人技能
    const candidateSkills: Skills = {
      technical: [],
      tools: [],
      languages: [],
    };

    candidate.skills.forEach((skill) => {
      if (skill.skillType === "technical") {
        candidateSkills.technical.push(skill.skillName);
      } else if (skill.skillType === "tool") {
        candidateSkills.tools.push(skill.skillName);
      } else if (skill.skillType === "language") {
        candidateSkills.languages.push(skill.skillName);
      }
    });

    // 1. 计算技能评分
    console.log("计算技能评分...");
    const skillScore = calculateSkillScore(
      candidateSkills,
      job.requiredSkills,
      job.preferredSkills
    );

    // 2. 计算经历评分
    console.log("计算经历评分...");
    const experienceScore = await calculateExperienceScore(
      candidate.experience,
      job.description
    );

    // 3. 计算教育评分
    console.log("计算教育评分...");
    const educationScore = await calculateEducationScore(
      candidate.education,
      job.description
    );

    // 4. 计算总分
    const overallScore = Math.round(
      skillScore * SCORING_WEIGHTS.SKILL +
        experienceScore * SCORING_WEIGHTS.EXPERIENCE +
        educationScore * SCORING_WEIGHTS.EDUCATION
    );

    // 5. 生成AI评论
    console.log("生成AI评论...");
    const commentary = await generateCommentary(
      candidate,
      job,
      { skillScore, experienceScore, educationScore, overallScore }
    );

    return {
      overallScore,
      skillScore,
      experienceScore,
      educationScore,
      commentary,
    };
  } catch (error) {
    console.error("匹配评分计算失败:", error);
    throw new Error("无法计算匹配评分");
  }
}

/**
 * 生成AI评论
 * 描述候选人的优势和不足
 */
async function generateCommentary(
  candidate: Candidate,
  job: JobDescription,
  scores: {
    skillScore: number;
    experienceScore: number;
    educationScore: number;
    overallScore: number;
  }
): Promise<string> {
  const systemPrompt = `你是一个专业的HR分析师。根据候选人信息和评分结果，生成一份简洁的匹配度分析评论。

评论要求：
- 客观描述候选人的优势（技能、经验、教育等方面）
- 指出可能的不足或需要改进的地方
- 总体评价是否推荐面试
- 控制在200字以内
- 语气专业、客观、友好`;

  const candidateInfo = `候选人：${candidate.name || "未知"}
教育背景：${candidate.education.map((e) => `${e.school} ${e.degree}`).join("; ")}
工作经历：${candidate.experience.length}段，最近在${candidate.experience[0]?.company || "未知"}担任${candidate.experience[0]?.title || "未知"}
技能：${candidate.skills.map((s) => s.skillName).join(", ")}`;

  const jobInfo = `岗位：${job.title}
要求：${job.description.substring(0, 200)}...
必备技能：${job.requiredSkills.join(", ")}
加分技能：${job.preferredSkills.join(", ")}`;

  const scoreInfo = `评分结果：
- 总分：${scores.overallScore}/100
- 技能匹配：${scores.skillScore}/100
- 经历匹配：${scores.experienceScore}/100
- 教育匹配：${scores.educationScore}/100`;

  const userPrompt = `${candidateInfo}

${jobInfo}

${scoreInfo}

请生成简洁的匹配度分析评论。`;

  try {
    const commentary = await callAI(systemPrompt, userPrompt, {
      temperature: 0.3,
      maxTokens: 500,
    });

    return commentary.trim();
  } catch (error) {
    console.error("生成评论失败:", error);
    
    // 返回默认评论
    if (scores.overallScore >= 80) {
      return `候选人综合匹配度为${scores.overallScore}分，表现优秀。技能匹配度${scores.skillScore}分，工作经历${scores.experienceScore}分，教育背景${scores.educationScore}分。整体来看，候选人具备较强的专业能力和相关经验，推荐安排面试。`;
    } else if (scores.overallScore >= 60) {
      return `候选人综合匹配度为${scores.overallScore}分，基本符合要求。技能匹配度${scores.skillScore}分，工作经历${scores.experienceScore}分，教育背景${scores.educationScore}分。候选人在某些方面表现不错，但仍有提升空间，可以考虑面试。`;
    } else {
      return `候选人综合匹配度为${scores.overallScore}分，与岗位要求存在一定差距。技能匹配度${scores.skillScore}分，工作经历${scores.experienceScore}分，教育背景${scores.educationScore}分。建议重点关注技能和经验的匹配度。`;
    }
  }
}
