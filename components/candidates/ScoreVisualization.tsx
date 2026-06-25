"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";
import type { MatchScore } from "@/types";

interface ScoreVisualizationProps {
  matchScore: MatchScore;
}

/**
 * 评分可视化组件
 * 使用雷达图和柱状图展示四个维度分数
 * 使用不同颜色区分分数范围（红色<60, 黄色60-80, 绿色>80）
 * 任务 11.2
 */
export function ScoreVisualization({ matchScore }: ScoreVisualizationProps) {
  // 获取分数对应的颜色
  const getScoreColor = (score: number): string => {
    if (score < 60) return "hsl(var(--destructive))"; // 红色
    if (score < 80) return "hsl(45, 93%, 47%)"; // 黄色
    return "hsl(142, 76%, 36%)"; // 绿色
  };

  // 雷达图数据
  const radarData = [
    {
      dimension: "总分",
      score: matchScore.overallScore,
      fullScore: 100,
    },
    {
      dimension: "技能匹配",
      score: matchScore.skillScore,
      fullScore: 100,
    },
    {
      dimension: "经历相关",
      score: matchScore.experienceScore,
      fullScore: 100,
    },
    {
      dimension: "教育匹配",
      score: matchScore.educationScore,
      fullScore: 100,
    },
  ];

  // 柱状图数据
  const barData = [
    {
      name: "总分",
      score: matchScore.overallScore,
      color: getScoreColor(matchScore.overallScore),
    },
    {
      name: "技能",
      score: matchScore.skillScore,
      color: getScoreColor(matchScore.skillScore),
    },
    {
      name: "经历",
      score: matchScore.experienceScore,
      color: getScoreColor(matchScore.experienceScore),
    },
    {
      name: "教育",
      score: matchScore.educationScore,
      color: getScoreColor(matchScore.educationScore),
    },
  ];

  return (
    <Card className="glass-hover border border-cyan-500/20 ring-0">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle className="text-xl text-cyan-300">匹配评分</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="space-y-6">
          {/* 总分显示 */}
          <div className="text-center p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
            <p className="text-sm text-slate-400 mb-2">综合匹配度</p>
            <p
              className="text-5xl font-bold"
              style={{ color: getScoreColor(matchScore.overallScore) }}
            >
              {matchScore.overallScore.toFixed(1)}
            </p>
            <p className="text-xs text-slate-500 mt-2">满分 100</p>
          </div>

          {/* 雷达图 */}
          <div>
            <h4 className="text-base font-medium mb-4 text-slate-200">多维度评分雷达图</h4>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(148, 163, 184, 0.2)" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: "rgb(148, 163, 184)", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: "rgb(148, 163, 184)", fontSize: 10 }}
                />
                <Radar
                  name="得分"
                  dataKey="score"
                  stroke="rgb(6, 182, 212)"
                  fill="rgb(6, 182, 212)"
                  fillOpacity={0.6}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgb(15, 23, 42)",
                    border: "1px solid rgba(6, 182, 212, 0.3)",
                    borderRadius: "8px",
                    color: "rgb(248, 250, 252)",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* 柱状图 */}
          <div>
            <h4 className="text-base font-medium mb-4 text-slate-200">各维度分数对比</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "rgb(148, 163, 184)", fontSize: 12 }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "rgb(148, 163, 184)", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgb(15, 23, 42)",
                    border: "1px solid rgba(6, 182, 212, 0.3)",
                    borderRadius: "8px",
                    color: "rgb(248, 250, 252)",
                  }}
                  formatter={(value: any) => [`${Number(value).toFixed(1)}`, "分数"]}
                />
                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 分数图例 */}
          <div className="flex items-center justify-center gap-6 text-sm pt-2">
            <div className="flex items-center gap-2">
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: "hsl(142, 76%, 36%)" }}
              />
              <span className="text-slate-400">优秀 (≥80)</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: "hsl(45, 93%, 47%)" }}
              />
              <span className="text-slate-400">良好 (60-80)</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="size-3 rounded-full"
                style={{ backgroundColor: "hsl(var(--destructive))" }}
              />
              <span className="text-slate-400">待提升 (&lt;60)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
