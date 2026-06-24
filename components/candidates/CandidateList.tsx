"use client";

import * as React from "react";
import { CandidateTable, CandidateTableItem } from "./CandidateTable";
import { CandidateCard, CandidateCardItem } from "./CandidateCard";
import { CandidateFilters } from "./CandidateFilters";
import { CandidateSorter } from "./CandidateSorter";
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
            <p className="text-sm text-muted-foreground">
              共 <span className="font-medium text-foreground">{total}</span> 位候选人
              {total > 0 && (
                <>
                  ，显示 <span className="font-medium text-foreground">{startIndex}</span> -{" "}
                  <span className="font-medium text-foreground">{endIndex}</span>
                </>
              )}
            </p>
          </div>

          {/* 视图切换 */}
          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0",
                viewMode === "table" && "bg-muted"
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
                "h-8 w-8 p-0",
                viewMode === "card" && "bg-muted"
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
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            上一页
          </Button>
          
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

              return (
                <Button
                  key={pageNumber}
                  variant={page === pageNumber ? "default" : "outline"}
                  size="sm"
                  className="w-9"
                  onClick={() => onPageChange(pageNumber)}
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
          >
            下一页
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
