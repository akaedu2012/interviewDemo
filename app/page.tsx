"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CandidateList, ViewMode } from "@/components/candidates";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import type { ApiResponse, PaginatedResult } from "@/types";
import type { CandidateTableItem } from "@/components/candidates/CandidateTable";

/**
 * 主页 - 候选人列表页面
 */
export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 从 URL 参数获取状态
  const [candidates, setCandidates] = React.useState<CandidateTableItem[]>([]);
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [availableSkills, setAvailableSkills] = React.useState<string[]>([]);

  // URL 参数状态
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const sortBy = (searchParams.get("sortBy") || "uploadTime") as "score" | "uploadTime";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";
  const searchKeyword = searchParams.get("search") || "";
  const selectedSkillsString = searchParams.get("skills") || "";
  const selectedSkills = React.useMemo(
    () => selectedSkillsString ? selectedSkillsString.split(",").filter(Boolean) : [],
    [selectedSkillsString]
  );
  const viewMode = (searchParams.get("view") || "table") as ViewMode;

  // 更新 URL 参数
  const updateSearchParams = React.useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      router.push(`/?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // 获取候选人列表
  const fetchCandidates = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sortBy,
        sortOrder,
      });

      if (searchKeyword) {
        params.set("search", searchKeyword);
      }

      if (selectedSkillsString) {
        params.set("skills", selectedSkillsString);
      }

      const response = await fetch(`/api/candidates?${params.toString()}`);
      const data: ApiResponse<PaginatedResult<any>> = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch candidates");
      }

      if (data.data) {
        setCandidates(
          data.data.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            overallScore: item.matchScore?.overallScore,
            status: item.status,
            createdAt: item.createdAt,
          }))
        );
        setTotal(data.data.total);

        // 提取所有技能用于筛选
        const allSkills = new Set<string>();
        data.data.items.forEach((item: any) => {
          item.skills?.forEach((skill: any) => {
            allSkills.add(skill.skillName);
          });
        });
        setAvailableSkills(Array.from(allSkills).sort());
      }
    } catch (err) {
      console.error("Failed to fetch candidates:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, sortBy, sortOrder, searchKeyword, selectedSkillsString]);

  // 初始加载和参数变化时重新获取数据
  React.useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // 处理视图模式切换
  const handleViewModeChange = (mode: ViewMode) => {
    updateSearchParams({ view: mode });
  };

  // 处理排序变化
  const handleSortChange = (newSortBy: "score" | "uploadTime", newSortOrder: "asc" | "desc") => {
    updateSearchParams({ sortBy: newSortBy, sortOrder: newSortOrder, page: 1 });
  };

  // 处理搜索变化（使用防抖）
  const handleSearchChange = React.useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (keyword: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        updateSearchParams({ search: keyword, page: 1 });
      }, 300);
    };
  }, [updateSearchParams]);

  // 处理技能筛选切换
  const handleSkillToggle = (skill: string) => {
    const newSkills = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill];
    
    updateSearchParams({
      skills: newSkills.length > 0 ? newSkills.join(",") : undefined,
      page: 1,
    });
  };

  // 清除筛选
  const handleClearFilters = () => {
    updateSearchParams({ search: undefined, skills: undefined, page: 1 });
  };

  // 处理分页变化
  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: newPage });
  };

  // 跳转到上传页面
  const handleUploadClick = () => {
    router.push("/upload");
  };

  const totalPages = Math.ceil(total / pageSize);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] space-y-6 animate-in">
        <div className="glass-hover rounded-2xl p-8 border border-red-500/30 text-center max-w-md">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-red-500/20 blur-2xl" />
            <div className="relative h-20 w-20 mx-auto rounded-full border-2 border-red-500/50 flex items-center justify-center">
              <span className="text-4xl">⚠️</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-red-400 mb-3">加载失败</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <Button 
            onClick={fetchCandidates}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
          >
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {/* 页面标题和操作按钮 */}
      <div className="glass-hover rounded-2xl p-6 border border-cyan-500/20">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-1 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                候选人管理
              </h1>
            </div>
            <p className="text-slate-400 ml-4 flex items-center space-x-2">
              <span>查看和管理所有候选人</span>
              <span className="text-cyan-400">·</span>
              <span className="text-cyan-400 font-medium">共 {total} 人</span>
            </p>
          </div>
          <Button 
            onClick={handleUploadClick} 
            size="lg"
            className="btn-glow bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all duration-300"
          >
            <Upload className="h-5 w-5 mr-2" />
            上传简历
          </Button>
        </div>
      </div>

      {/* 加载状态 */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-2xl animate-pulse" />
            <LoadingSpinner size="lg" text="加载候选人列表..." />
          </div>
        </div>
      ) : (
        <CandidateList
          candidates={candidates}
          total={total}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          viewMode={viewMode}
          sortBy={sortBy}
          sortOrder={sortOrder}
          searchKeyword={searchKeyword}
          selectedSkills={selectedSkills}
          availableSkills={availableSkills}
          onViewModeChange={handleViewModeChange}
          onSortChange={handleSortChange}
          onSearchChange={handleSearchChange}
          onSkillToggle={handleSkillToggle}
          onClearFilters={handleClearFilters}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
