import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";
import type { Education } from "@/types";

interface EducationSectionProps {
  education: Education[];
}

/**
 * 教育背景展示组件
 * 展示候选人的教育背景列表
 * 任务 11.1
 */
export function EducationSection({ education }: EducationSectionProps) {
  if (education.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>教育背景</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">暂无教育背景信息</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>教育背景</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {education.map((edu) => (
            <div key={edu.id} className="flex gap-3 pb-4 border-b last:border-b-0 last:pb-0">
              <div className="flex-shrink-0 mt-0.5">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
                  <GraduationCap className="size-4 text-primary" />
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-semibold text-sm">{edu.school}</h4>
                <p className="text-sm text-muted-foreground">
                  {edu.degree} · {edu.major}
                </p>
                <p className="text-xs text-muted-foreground">{edu.graduationTime}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
