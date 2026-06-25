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
      <Card>
        <CardHeader>
          <CardTitle>技能标签</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">暂无技能信息</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>技能标签</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {technicalSkills.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Code2 className="size-4 text-muted-foreground" />
                <h4 className="text-sm font-medium text-muted-foreground">技术技能</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {technicalSkills.map((skill) => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.skillName}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {toolSkills.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="size-4 text-muted-foreground" />
                <h4 className="text-sm font-medium text-muted-foreground">工具框架</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {toolSkills.map((skill) => (
                  <Badge key={skill.id} variant="secondary">
                    {skill.skillName}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {languageSkills.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Languages className="size-4 text-muted-foreground" />
                <h4 className="text-sm font-medium text-muted-foreground">编程语言</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {languageSkills.map((skill) => (
                  <Badge key={skill.id} variant="secondary">
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
