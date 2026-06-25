"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TagInput } from "@/components/ui/TagInput";
import { Notification } from "@/components/ui/Notification";
import { Save, Loader2 } from "lucide-react";
import { z } from "zod";

/**
 * 岗位配置表单页面
 * 实现岗位描述配置、表单验证和提交逻辑
 * 任务 12.1, 12.2
 */

// Zod schema for form validation
const jobConfigSchema = z.object({
  title: z.string().min(1, "岗位标题不能为空"),
  description: z.string().min(1, "岗位描述不能为空"),
  requiredSkills: z.array(z.string()).min(1, "至少需要一个必备技能"),
  preferredSkills: z.array(z.string()),
});

type JobConfigFormData = z.infer<typeof jobConfigSchema>;

export default function JobConfigPage() {
  const [formData, setFormData] = useState<JobConfigFormData>({
    title: "",
    description: "",
    requiredSkills: [],
    preferredSkills: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // 页面加载时获取当前激活的岗位描述
  useEffect(() => {
    const fetchActiveJob = async () => {
      try {
        setIsFetching(true);
        const response = await fetch("/api/jobs/active");
        const data = await response.json();

        if (response.ok && data.success) {
          // 填充表单
          setFormData({
            title: data.data.title,
            description: data.data.description,
            requiredSkills: data.data.requiredSkills,
            preferredSkills: data.data.preferredSkills,
          });
        }
      } catch (error) {
        console.error("Failed to fetch active job:", error);
        // 如果没有激活的岗位，保持空表单
      } finally {
        setIsFetching(false);
      }
    };

    fetchActiveJob();
  }, []);

  // 验证表单
  const validateForm = (): boolean => {
    try {
      jobConfigSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证表单
    if (!validateForm()) {
      Notification.error("表单验证失败", "请检查并修正错误后重试");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "保存失败");
      }

      Notification.success("保存成功", "岗位配置已更新");
    } catch (error) {
      console.error("Failed to save job config:", error);
      Notification.error(
        "保存失败",
        error instanceof Error ? error.message : "请稍后重试"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">岗位配置</h1>
        <p className="text-muted-foreground mt-2">
          配置岗位描述、必备技能和加分技能，用于候选人智能匹配
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>岗位信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 岗位标题 */}
            <div className="space-y-2">
              <Label htmlFor="title">
                岗位标题 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="例如：高级全栈工程师"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
            </div>

            {/* 岗位描述 */}
            <div className="space-y-2">
              <Label htmlFor="description">
                岗位描述 <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="描述岗位职责、工作内容、任职要求等..."
                rows={8}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                aria-invalid={!!errors.description}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
              <p className="text-xs text-muted-foreground">
                详细描述岗位要求，AI 将根据此描述进行候选人匹配
              </p>
            </div>

            {/* 必备技能 */}
            <div className="space-y-2">
              <Label htmlFor="requiredSkills">
                必备技能 <span className="text-destructive">*</span>
              </Label>
              <TagInput
                id="requiredSkills"
                value={formData.requiredSkills}
                onChange={(tags) =>
                  setFormData({ ...formData, requiredSkills: tags })
                }
                placeholder="输入技能名称后按回车添加"
              />
              {errors.requiredSkills && (
                <p className="text-xs text-destructive">
                  {errors.requiredSkills}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                候选人必须具备的核心技能（至少添加 1 个）
              </p>
            </div>

            {/* 加分技能 */}
            <div className="space-y-2">
              <Label htmlFor="preferredSkills">加分技能</Label>
              <TagInput
                id="preferredSkills"
                value={formData.preferredSkills}
                onChange={(tags) =>
                  setFormData({ ...formData, preferredSkills: tags })
                }
                placeholder="输入技能名称后按回车添加"
              />
              <p className="text-xs text-muted-foreground">
                候选人具备会加分的技能（可选）
              </p>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData({
                    title: "",
                    description: "",
                    requiredSkills: [],
                    preferredSkills: [],
                  });
                  setErrors({});
                }}
                disabled={isLoading}
              >
                清空表单
              </Button>
              <Button type="submit" disabled={isLoading} className="gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    保存配置
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
