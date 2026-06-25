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
  // 使用本地状态管理输入框的值，避免每次输入都触发重新渲染
  const [localSearchValue, setLocalSearchValue] = React.useState(searchKeyword);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  // 当外部 searchKeyword 变化时（例如清除筛选），同步更新本地状态
  React.useEffect(() => {
    setLocalSearchValue(searchKeyword);
  }, [searchKeyword]);

  // 处理输入变化，使用防抖
  const handleInputChange = (value: string) => {
    setLocalSearchValue(value); // 立即更新输入框显示

    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 设置新的防抖定时器（500ms）
    timeoutRef.current = setTimeout(() => {
      onSearchChange(value); // 延迟触发实际的搜索
    }, 500);
  };

  // 清除输入
  const handleClear = () => {
    setLocalSearchValue("");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onSearchChange("");
  };

  // 清理定时器
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const hasFilters = searchKeyword.length > 0 || selectedSkills.length > 0;

  return (
    <div className="space-y-4">
      {/* 搜索输入框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-400" />
        <Input
          placeholder="搜索姓名、技能、学校..."
          value={localSearchValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className="pl-9 pr-9 border-cyan-500/30 hover:border-cyan-500/50 focus:border-cyan-500/50 bg-slate-800/50 text-slate-200 placeholder:text-slate-500"
        />
        {localSearchValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 transition-colors"
            aria-label="清除搜索"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 技能标签筛选 */}
      {availableSkills.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-cyan-300">技能筛选</p>
            {hasFilters && (
              <button
                onClick={onClearFilters}
                className="text-xs text-slate-400 hover:text-cyan-300 underline transition-colors"
              >
                清除筛选
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {availableSkills.slice(0, 30).map((skill) => {
              const isSelected = selectedSkills.includes(skill);
              return (
                <Badge
                  key={skill}
                  variant={isSelected ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer transition-all",
                    isSelected
                      ? "bg-cyan-600 text-white hover:bg-cyan-700 border-cyan-500/50"
                      : "border-cyan-500/20 text-slate-300 hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:text-cyan-300"
                  )}
                  onClick={() => onSkillToggle(skill)}
                >
                  {skill}
                  {isSelected && <X className="ml-1 h-3 w-3" />}
                </Badge>
              );
            })}
            {availableSkills.length > 30 && (
              <span className="text-xs text-slate-500 self-center">
                等 {availableSkills.length} 个技能
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

