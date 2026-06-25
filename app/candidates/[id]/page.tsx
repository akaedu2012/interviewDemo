"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Notification } from "@/components/ui/Notification";
import { BasicInfoSection } from "@/components/candidates/BasicInfoSection";
import { EducationSection } from "@/components/candidates/EducationSection";
import { ExperienceSection } from "@/components/candidates/ExperienceSection";
import { SkillsSection } from "@/components/candidates/SkillsSection";
import { ScoreVisualization } from "@/components/candidates/ScoreVisualization";
import { AICommentary } from "@/components/candidates/AICommentary";
import { StatusSelector } from "@/components/candidates/StatusSelector";
import { PDFViewer } from "@/components/candidates/PDFViewer";
import type { Candidate } from "@/types";

/**
 * 候选人详情页面
 * 集成所有候选人详情展示组件
 * 实现数据获取、状态更新、匹配评分触发逻辑
 * 任务 11.5
 */
export default function CandidateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 获取候选人数据
  const fetchCandidate = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/candidates/${params.id}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 404) {
          setError("候选人不存在");
        } else {
          throw new Error(data.error || "获取候选人信息失败");
        }
        return;
      }

      setCandidate(data.data);
    } catch (error) {
      console.error("Failed to fetch candidate:", error);
      setError(error instanceof Error ? error.message : "获取数据失败");
      Notification.error("加载失败", "无法获取候选人信息");
    } finally {
      setIsLoading(false);
    }
  };

  // 触发匹配评分
  const triggerMatch = async () => {
    if (!candidate) return;

    setIsMatching(true);

    try {
      // 首先获取激活的岗位
      const jobResponse = await fetch("/api/jobs/active");
      const jobData = await jobResponse.json();

      if (!jobResponse.ok || !jobData.success) {
        throw new Error("请先配置岗位描述");
      }

      // 触发匹配计算
      const matchResponse = await fetch(`/api/candidates/${params.id}/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId: jobData.data.id }),
      });

      const matchData = await matchResponse.json();

      if (!matchResponse.ok || !matchData.success) {
        throw new Error(matchData.error || "匹配评分失败");
      }

      Notification.success("匹配成功", "评分计算完成");

      // 重新获取候选人数据以显示新的评分
      await fetchCandidate();
    } catch (error) {
      console.error("Failed to trigger match:", error);
      Notification.error(
        "匹配失败",
        error instanceof Error ? error.message : "请稍后重试"
      );
    } finally {
      setIsMatching(false);
    }
  };

  useEffect(() => {
    fetchCandidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // 加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-cyan-500 mx-auto" />
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
          </div>
          <p className="text-sm text-slate-400">加载候选人信息...</p>
        </div>
      </div>
    );
  }

  // 错误状态（404）
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <Card className="glass-hover border border-red-500/30 ring-0 max-w-md">
          <CardContent className="px-8 py-8 text-center space-y-4">
            <h1 className="text-2xl font-bold text-red-400">候选人不存在</h1>
            <p className="text-slate-400">{error}</p>
            <Button 
              onClick={() => router.push("/")} 
              className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              <ArrowLeft className="size-4" />
              返回列表
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 候选人不存在
  if (!candidate) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="gap-2 hover:bg-cyan-500/10 hover:text-cyan-300"
          >
            <ArrowLeft className="size-4" />
            返回列表
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {candidate.name || "候选人详情"}
            </h1>
            <p className="text-sm text-slate-400">
              上传于 {new Date(candidate.createdAt).toLocaleString("zh-CN")}
            </p>
          </div>
        </div>
        <Button
          onClick={triggerMatch}
          disabled={isMatching}
          className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/20"
        >
          <RefreshCw className={`size-4 ${isMatching ? "animate-spin" : ""}`} />
          {isMatching ? "评分中..." : "重新评分"}
        </Button>
      </div>

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧列：基本信息和状态 */}
        <div className="lg:col-span-1 space-y-6">
          <BasicInfoSection candidate={candidate} />
          
          <Card className="glass-hover border border-cyan-500/20 ring-0">
            <CardContent className="px-6 py-6">
              <StatusSelector
                candidateId={candidate.id}
                currentStatus={candidate.status}
                onStatusChange={() => fetchCandidate()}
              />
            </CardContent>
          </Card>

          <SkillsSection skills={candidate.skills} />
        </div>

        {/* 中间列：教育和经历 */}
        <div className="lg:col-span-1 space-y-6">
          <EducationSection education={candidate.education} />
          <ExperienceSection experience={candidate.experience} />
        </div>

        {/* 右侧列：评分和AI评论 */}
        <div className="lg:col-span-1 space-y-6">
          {candidate.matchScore ? (
            <>
              <ScoreVisualization matchScore={candidate.matchScore} />
              <AICommentary commentary={candidate.matchScore.commentary} />
            </>
          ) : (
            <Card className="glass-hover border border-cyan-500/20 ring-0">
              <CardContent className="px-6 py-8 text-center space-y-4">
                <p className="text-sm text-slate-400">
                  暂无匹配评分
                </p>
                <Button
                  onClick={triggerMatch}
                  disabled={isMatching}
                  className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/20"
                >
                  <RefreshCw className={`size-4 ${isMatching ? "animate-spin" : ""}`} />
                  开始评分
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* PDF 预览 */}
      <PDFViewer filePath={candidate.filePath} fileName={candidate.fileName} />
    </div>
  );
}
