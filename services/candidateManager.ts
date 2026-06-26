import { db, candidates, education, experience, skills, matchScores, isLibsql } from "@/db";
import { eq, and, desc, asc, like, inArray, or, sql } from "drizzle-orm";
import { generateId } from "@/lib/utils";
import type {
  Candidate,
  Education,
  Experience,
  SkillEntry,
  MatchScore,
  ListOptions,
  PaginatedResult,
  CandidateStatus,
  MatchResult,
} from "@/types";

/**
 * 候选人管理服务
 * 负责候选人数据的 CRUD 操作
 */

/**
 * 创建候选人输入类型
 */
export interface CreateCandidateInput {
  name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  fileName: string;
  filePath: string;
  fileSize: number;
  education: Array<{
    school: string;
    major: string;
    degree: string;
    graduationTime: string;
  }>;
  experience: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    responsibilities: string;
  }>;
  skills: Array<{
    skillType: "technical" | "tool" | "language";
    skillName: string;
  }>;
}

/**
 * 创建候选人及其关联数据
 * 使用事务确保数据一致性
 */
export async function createCandidate(
  data: CreateCandidateInput
): Promise<Candidate> {
  const candidateId = generateId();
  const now = new Date().toISOString();

  try {
    // 插入候选人基本信息
    const insertCandidate = db.insert(candidates).values({
      id: candidateId,
      name: data.name,
      phone: data.phone,
      email: data.email,
      city: data.city,
      fileName: data.fileName,
      filePath: data.filePath,
      fileSize: data.fileSize,
      status: "待筛选",
      createdAt: now,
      updatedAt: now,
    });
    
    // 兼容 better-sqlite3 (同步) 和 libsql (异步)
    if (isLibsql) {
      await insertCandidate;
    } else if ((insertCandidate as any).run) {
      (insertCandidate as any).run();
    }

    // 插入教育背景
    if (data.education.length > 0) {
      const insertEducation = db.insert(education).values(
        data.education.map((edu: CreateCandidateInput['education'][0]) => ({
          id: generateId(),
          candidateId,
          school: edu.school,
          major: edu.major,
          degree: edu.degree,
          graduationTime: edu.graduationTime,
        }))
      );
      
      if (isLibsql) {
        await insertEducation;
      } else if ((insertEducation as any).run) {
        (insertEducation as any).run();
      }
    }

    // 插入工作经历
    if (data.experience.length > 0) {
      const insertExperience = db.insert(experience).values(
        data.experience.map((exp: CreateCandidateInput['experience'][0]) => ({
          id: generateId(),
          candidateId,
          company: exp.company,
          title: exp.title,
          startDate: exp.startDate,
          endDate: exp.endDate,
          responsibilities: exp.responsibilities,
        }))
      );
      
      if (isLibsql) {
        await insertExperience;
      } else if ((insertExperience as any).run) {
        (insertExperience as any).run();
      }
    }

    // 插入技能
    if (data.skills.length > 0) {
      const insertSkills = db.insert(skills).values(
        data.skills.map((skill: CreateCandidateInput['skills'][0]) => ({
          id: generateId(),
          candidateId,
          skillType: skill.skillType,
          skillName: skill.skillName,
        }))
      );
      
      if (isLibsql) {
        await insertSkills;
      } else if ((insertSkills as any).run) {
        (insertSkills as any).run();
      }
    }

    // 查询并返回完整的候选人信息
    const candidate = await getCandidateById(candidateId);
    if (!candidate) {
      throw new Error("Failed to retrieve created candidate");
    }

    return candidate;
  } catch (error) {
    console.error("Failed to create candidate:", error);
    throw new Error("Failed to create candidate");
  }
}

/**
 * 根据 ID 查询候选人完整信息
 * 包含所有关联数据（教育、经历、技能、匹配评分）
 */
export async function getCandidateById(
  id: string
): Promise<Candidate | null> {
  try {
    // 查询候选人基本信息
    const candidateData = await db
      .select()
      .from(candidates)
      .where(eq(candidates.id, id))
      .limit(1);

    if (candidateData.length === 0) {
      return null;
    }

    const candidate = candidateData[0];

    // 查询教育背景
    const educationData = await db
      .select()
      .from(education)
      .where(eq(education.candidateId, id));

    // 查询工作经历
    const experienceData = await db
      .select()
      .from(experience)
      .where(eq(experience.candidateId, id));

    // 查询技能
    const skillsData = await db
      .select()
      .from(skills)
      .where(eq(skills.candidateId, id));

    // 查询最新的匹配评分
    const matchScoreData = await db
      .select()
      .from(matchScores)
      .where(eq(matchScores.candidateId, id))
      .orderBy(desc(matchScores.createdAt))
      .limit(1);

    // 组装完整的候选人信息
    return {
      id: candidate.id,
      name: candidate.name,
      phone: candidate.phone,
      email: candidate.email,
      city: candidate.city,
      fileName: candidate.fileName,
      filePath: candidate.filePath,
      fileSize: candidate.fileSize,
      status: candidate.status as CandidateStatus,
      createdAt: new Date(candidate.createdAt),
      updatedAt: new Date(candidate.updatedAt),
      education: educationData.map((edu: typeof education.$inferSelect) => ({
        id: edu.id,
        candidateId: edu.candidateId,
        school: edu.school,
        major: edu.major,
        degree: edu.degree,
        graduationTime: edu.graduationTime,
      })),
      experience: experienceData.map((exp: typeof experience.$inferSelect) => ({
        id: exp.id,
        candidateId: exp.candidateId,
        company: exp.company,
        title: exp.title,
        startDate: exp.startDate,
        endDate: exp.endDate,
        responsibilities: exp.responsibilities,
      })),
      skills: skillsData.map((skill: typeof skills.$inferSelect) => ({
        id: skill.id,
        candidateId: skill.candidateId,
        skillType: skill.skillType as "technical" | "tool" | "language",
        skillName: skill.skillName,
      })),
      matchScore:
        matchScoreData.length > 0
          ? {
              id: matchScoreData[0].id,
              candidateId: matchScoreData[0].candidateId,
              jobId: matchScoreData[0].jobId,
              overallScore: matchScoreData[0].overallScore,
              skillScore: matchScoreData[0].skillScore,
              experienceScore: matchScoreData[0].experienceScore,
              educationScore: matchScoreData[0].educationScore,
              commentary: matchScoreData[0].commentary,
              createdAt: new Date(matchScoreData[0].createdAt),
            }
          : undefined,
    };
  } catch (error) {
    console.error("Failed to get candidate by ID:", error);
    throw new Error("Failed to get candidate");
  }
}

/**
 * 列出候选人
 * 支持分页、排序、筛选、搜索
 */
export async function listCandidates(
  options: ListOptions
): Promise<PaginatedResult<Candidate>> {
  try {
    const {
      page = 1,
      pageSize = 20,
      sortBy = "uploadTime",
      sortOrder = "desc",
      skillFilters = [],
      searchKeyword = "",
    } = options;

    // 计算分页偏移量
    const offset = (page - 1) * pageSize;

    // 构建查询条件
    const conditions = [];

    // 技能筛选：查找包含指定技能的候选人
    if (skillFilters.length > 0) {
      const candidateIdsWithSkills = await db
        .select({ candidateId: skills.candidateId })
        .from(skills)
        .where(
          inArray(
            skills.skillName,
            skillFilters.map((s: string) => s.toLowerCase())
          )
        );

      const candidateIds: string[] = [
        ...new Set<string>(candidateIdsWithSkills.map((s: typeof skills.$inferSelect) => s.candidateId)),
      ];

      if (candidateIds.length > 0) {
        conditions.push(inArray(candidates.id, candidateIds));
      } else {
        // 如果没有找到匹配的技能，返回空结果
        return {
          items: [],
          total: 0,
          page,
          pageSize,
          totalPages: 0,
        };
      }
    }

    // 关键词搜索：搜索姓名、技能、学校
    if (searchKeyword) {
      const keyword = `%${searchKeyword}%`;

      // 搜索姓名
      const nameCondition = like(candidates.name, keyword);

      // 搜索技能
      const candidateIdsWithKeywordInSkills = await db
        .select({ candidateId: skills.candidateId })
        .from(skills)
        .where(like(skills.skillName, keyword));

      // 搜索学校
      const candidateIdsWithKeywordInEducation = await db
        .select({ candidateId: education.candidateId })
        .from(education)
        .where(like(education.school, keyword));

      const candidateIdsFromSkills = candidateIdsWithKeywordInSkills.map(
        (s: typeof skills.$inferSelect) => s.candidateId
      );
      const candidateIdsFromEducation = candidateIdsWithKeywordInEducation.map(
        (e: typeof education.$inferSelect) => e.candidateId
      );

      const allCandidateIds = [
        ...new Set([...candidateIdsFromSkills, ...candidateIdsFromEducation]),
      ];

      // 组合条件：姓名匹配 OR ID 在技能/学校搜索结果中
      if (allCandidateIds.length > 0) {
        conditions.push(
          or(nameCondition, inArray(candidates.id, allCandidateIds))!
        );
      } else {
        conditions.push(nameCondition);
      }
    }

    // 构建 WHERE 条件
    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    // 如果按评分排序，需要关联 match_scores 表
    if (sortBy === "score") {
      // 获取所有候选人及其最新评分
      const candidatesWithScores = await db
        .select({
          candidate: candidates,
          score: matchScores.overallScore,
          scoreCreatedAt: matchScores.createdAt,
        })
        .from(candidates)
        .leftJoin(
          matchScores,
          eq(candidates.id, matchScores.candidateId)
        )
        .where(whereCondition);

      // 按候选人分组，获取每个候选人的最新评分
      const candidateScoreMap = new Map<
        string,
        { candidate: typeof candidates.$inferSelect; score: number | null }
      >();

      for (const row of candidatesWithScores) {
        const existing = candidateScoreMap.get(row.candidate.id);
        if (!existing) {
          candidateScoreMap.set(row.candidate.id, {
            candidate: row.candidate,
            score: row.score,
          });
        } else if (
          row.scoreCreatedAt &&
          existing.score !== null &&
          row.scoreCreatedAt > (existing as any).scoreCreatedAt
        ) {
          candidateScoreMap.set(row.candidate.id, {
            candidate: row.candidate,
            score: row.score,
          });
        }
      }

      // 转换为数组并排序
      let sortedCandidates = Array.from(candidateScoreMap.values());
      sortedCandidates.sort((a, b) => {
        const scoreA = a.score ?? -1;
        const scoreB = b.score ?? -1;
        return sortOrder === "asc" ? scoreA - scoreB : scoreB - scoreA;
      });

      // 分页
      const total = sortedCandidates.length;
      const paginatedCandidates = sortedCandidates.slice(
        offset,
        offset + pageSize
      );

      // 获取完整的候选人信息
      const candidateIds = paginatedCandidates.map((c: { candidate: typeof candidates.$inferSelect; score: number | null }) => c.candidate.id);
      const fullCandidates = await Promise.all(
        candidateIds.map((id: string) => getCandidateById(id))
      );

      return {
        items: fullCandidates.filter((c) => c !== null) as Candidate[],
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } else {
      // 按上传时间排序
      const orderByClause =
        sortOrder === "asc"
          ? asc(candidates.createdAt)
          : desc(candidates.createdAt);

      // 查询总数
      const countQuery = await db
        .select({ count: sql<number>`count(*)` })
        .from(candidates)
        .where(whereCondition);

      const total = Number(countQuery[0].count);

      // 查询分页数据
      const candidatesData = await db
        .select()
        .from(candidates)
        .where(whereCondition)
        .orderBy(orderByClause)
        .limit(pageSize)
        .offset(offset);

      // 获取完整的候选人信息
      const fullCandidates = await Promise.all(
        candidatesData.map((c: typeof candidates.$inferSelect) => getCandidateById(c.id))
      );

      return {
        items: fullCandidates.filter((c) => c !== null) as Candidate[],
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }
  } catch (error) {
    console.error("Failed to list candidates:", error);
    throw new Error("Failed to list candidates");
  }
}

/**
 * 更新候选人状态
 */
export async function updateCandidateStatus(
  id: string,
  status: CandidateStatus
): Promise<void> {
  try {
    const now = new Date().toISOString();

    const result = await db
      .update(candidates)
      .set({
        status,
        updatedAt: now,
      })
      .where(eq(candidates.id, id));

    // 检查是否更新成功
    if (!result) {
      throw new Error("Candidate not found");
    }
  } catch (error) {
    console.error("Failed to update candidate status:", error);
    throw new Error("Failed to update candidate status");
  }
}

/**
 * 保存匹配评分结果
 */
export async function saveMatchScore(
  candidateId: string,
  jobId: string,
  matchResult: MatchResult
): Promise<void> {
  try {
    const matchScoreId = generateId();
    const now = new Date().toISOString();

    await db.insert(matchScores).values({
      id: matchScoreId,
      candidateId,
      jobId,
      overallScore: matchResult.overallScore,
      skillScore: matchResult.skillScore,
      experienceScore: matchResult.experienceScore,
      educationScore: matchResult.educationScore,
      commentary: matchResult.commentary,
      createdAt: now,
    });
  } catch (error) {
    console.error("Failed to save match score:", error);
    throw new Error("Failed to save match score");
  }
}
