"use client";

import * as React from "react";
import { CandidateTable, CandidateTableItem } from "./CandidateTable";
import { CandidateCard, CandidateCardItem } from "./CandidateCard";
import { CandidateFilters } from "./CandidateFilters";
import { CandidateSorter } from "./CandidateSorter";
import { PageSizeSelector } from "./PageSizeSelector";
import { Button } from "@/components/ui/button";
import { LayoutGrid, List, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "table" | "card";

export interface CandidateListProps {
  candidates: CandidateTableItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  viewMode: ViewMode;
  sortBy: "score" | "uploadTime";
  sortOrder: "asc" | "desc";
  searchKeyword: string;
  selectedSkills: string[];
  availableSkills: string[];
  onViewModeChange: (mode: ViewMode) => void;
  onSortChange: (sortBy: "score" | "uploadTime", sortOrder: "asc" | "desc") => void;
  onSearchChange: (keyword: string) => void;
  onSkillToggle: (skill: string) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

/**
 * CandidateList - 候选人列表容器组件
 * 
 * 管理表格/卡片视图切换、筛选、排序和分页
 */
export function CandidateList({
  candidates,
  total,
  page,
  pageSize,
  totalPages,
  viewMode,
  sortBy,
  sortOrder,
  searchKeyword,
  selectedSkills,
  availableSkills,
  onViewModeChange,
  onSortChange,
  onSearchChange,
  onSkillToggle,
  onClearFilters,
  onPageChange,
  onPageSizeChange,
}: CandidateListProps) {
  const handleSortByColumn = (field: "score" | "uploadTime") => {
    // 如果点击当前排序字段，切换排序顺序
    if (sortBy === field) {
      onSortChange(field, sortOrder === "asc" ? "desc" : "asc");
    } else {
      // 如果点击新字段，默认降序
      onSortChange(field, "desc");
    }
  };

  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, total);

  return (
    <div className="space-y-6">
      {/* 筛选和排序控件 */}
      <div className="space-y-4">
        <CandidateFilters
          searchKeyword={searchKeyword}
          selectedSkills={selectedSkills}
          availableSkills={availableSkills}
          onSearchChange={onSearchChange}
          onSkillToggle={onSkillToggle}
          onClearFilters={onClearFilters}
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CandidateSorter
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
            />
            <PageSizeSelector
              pageSize={pageSize}
              onPageSizeChange={onPageSizeChange}
            />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <span className="text-sm text-slate-400">共</span>
              <span className="text-lg font-bold text-cyan-400">{total}</span>
              <span className="text-sm text-slate-400">位候选人</span>
              {total > 0 && (
                <>
                  <span className="text-slate-600 mx-1">|</span>
                  <span className="text-sm text-slate-400">显示</span>
                  <span className="text-sm font-medium text-cyan-300">{startIndex}-{endIndex}</span>
                </>
              )}
            </div>
          </div>

          {/* 视图切换 */}
          <div className="flex items-center gap-1 border border-cyan-500/20 rounded-lg p-1 bg-slate-800/30">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 transition-all",
                viewMode === "table" 
                  ? "bg-cyan-600 text-white hover:bg-cyan-700" 
                  : "text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10"
              )}
              onClick={() => onViewModeChange("table")}
              aria-label="表格视图"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 transition-all",
                viewMode === "card" 
                  ? "bg-cyan-600 text-white hover:bg-cyan-700" 
                  : "text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10"
              )}
              onClick={() => onViewModeChange("card")}
              aria-label="卡片视图"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* 候选人列表 */}
      {viewMode === "table" ? (
        <CandidateTable
          candidates={candidates}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSortByColumn}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              暂无候选人数据
            </div>
          ) : (
            candidates.map((candidate) => (
              <CandidateCard key={candidate.id} candidate={candidate} />
            ))
          )}
        </div>
      )}

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="glass-hover rounded-xl p-4 border border-cyan-500/20">
          <div className="flex items-center justify-between">
            {/* 页码信息 */}
            <div className="text-sm text-slate-400">
              第 <span className="text-cyan-300 font-medium">{page}</span> / <span className="text-slate-300 font-medium">{totalPages}</span> 页
              <span className="mx-2">·</span>
              共 <span className="text-cyan-300 font-medium">{total}</span> 条记录
            </div>

            {/* 分页按钮组 */}
            <div className="flex items-center gap-2">
              {/* 上一页按钮 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500/50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                上一页
              </Button>
              
              {/* 页码按钮 */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNumber: number;
                  
                  if (totalPages <= 7) {
                    pageNumber = i + 1;
                  } else if (page <= 4) {
                    pageNumber = i + 1;
                  } else if (page >= totalPages - 3) {
                    pageNumber = totalPages - 6 + i;
                  } else {
                    pageNumber = page - 3 + i;
                  }

                  const isCurrentPage = page === pageNumber;

                  return (
                    <Button
                      key={pageNumber}
                      variant={isCurrentPage ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "min-w-[36px] h-9",
                        isCurrentPage
                          ? "bg-cyan-600 text-white border-cyan-500/50 hover:bg-cyan-700 font-medium shadow-lg shadow-cyan-500/30"
                          : "border-cyan-500/20 text-slate-300 hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:text-cyan-300"
                      )}
                      onClick={() => onPageChange(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>

              {/* 下一页按钮 */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className="border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500/50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                下一页
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* 快速跳转（可选） */}
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>跳转至</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                placeholder={String(page)}
                className="w-16 h-8 px-2 rounded-md border border-cyan-500/30 bg-slate-800/50 text-slate-200 text-center focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const target = e.target as HTMLInputElement;
                    const newPage = parseInt(target.value, 10);
                    if (newPage >= 1 && newPage <= totalPages) {
                      onPageChange(newPage);
                      target.value = "";
                    }
                  }
                }}
              />
              <span>页</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
