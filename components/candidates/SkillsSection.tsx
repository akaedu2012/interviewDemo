import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code2, Wrench, Languages } from "lucide-react";
import type { SkillEntry } from "@/types";

interface SkillsSectionProps {
  skills: SkillEntry[];
}

/**
 * 技能标签展示组件
 * 展示候选人的技能标签，按类型分组显示
 * 任务 11.1
 */
export function SkillsSection({ skills }: SkillsSectionProps) {
  // 按类型分组技能
  const technicalSkills = skills.filter((s) => s.skillType === "technical");
  const toolSkills = skills.filter((s) => s.skillType === "tool");
  const languageSkills = skills.filter((s) => s.skillType === "language");

  if (skills.length === 0) {
    return (
      <Card className="glass-hover border border-cyan-500/20 ring-0">
        <CardHeader className="px-6 pt-6 pb-4">
          <CardTitle className="text-xl text-cyan-300">技能标签</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <p className="text-sm text-slate-400">暂无技能信息</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-hover border border-cyan-500/20 ring-0">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle className="text-xl text-cyan-300">技能标签</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="space-y-6">
          {technicalSkills.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Code2 className="size-5 text-cyan-400" />
                <h4 className="text-base font-medium text-slate-200">技术技能</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {technicalSkills.map((skill) => (
                  <Badge 
                    key={skill.id} 
                    className="bg-cyan-600 text-white border-cyan-500 font-medium px-3 py-1.5 text-sm hover:bg-cyan-700 transition-colors"
                  >
                    {skill.skillName}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {toolSkills.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Wrench className="size-5 text-blue-400" />
                <h4 className="text-base font-medium text-slate-200">工具框架</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {toolSkills.map((skill) => (
                  <Badge 
                    key={skill.id} 
                    className="bg-blue-600 text-white border-blue-500 font-medium px-3 py-1.5 text-sm hover:bg-blue-700 transition-colors"
                  >
                    {skill.skillName}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {languageSkills.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Languages className="size-5 text-purple-400" />
                <h4 className="text-base font-medium text-slate-200">编程语言</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {languageSkills.map((skill) => (
                  <Badge 
                    key={skill.id} 
                    className="bg-purple-600 text-white border-purple-500 font-medium px-3 py-1.5 text-sm hover:bg-purple-700 transition-colors"
                  >
                    {skill.skillName}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
