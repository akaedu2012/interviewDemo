"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CandidateFiltersProps {
  searchKeyword: string;
  selectedSkills: string[];
  availableSkills: string[];
  onSearchChange: (keyword: string) => void;
  onSkillToggle: (skill: string) => void;
  onClearFilters: () => void;
}

/**
 * CandidateFilters - 候选人筛选组件
 * 
 * 提供关键词搜索和技能标签筛选功能
 */
export function CandidateFilters({
  searchKeyword,
  selectedSkills,
  availableSkills,
  onSearchChange,
  onSkillToggle,
  onClearFilters,
}: CandidateFiltersProps) {
  const hasFilters = searchKeyword.length > 0 || selectedSkills.length > 0;

  return (
    <div className="space-y-4">
      {/* 搜索输入框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索姓名、技能、学校..."
          value={searchKeyword}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-9"
        />
        {searchKeyword && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="清除搜索"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 技能标签筛选 */}
      {availableSkills.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">技能筛选</p>
            {hasFilters && (
              <button
                onClick={onClearFilters}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                清除筛选
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {availableSkills.map((skill) => {
              const isSelected = selectedSkills.includes(skill);
              return (
                <Badge
                  key={skill}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "hover:bg-muted"
                  )}
                  onClick={() => onSkillToggle(skill)}
                >
                  {skill}
                  {isSelected && <X className="ml-1 h-3 w-3" />}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
