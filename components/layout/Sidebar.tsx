"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, Upload, Briefcase, Users, BarChart } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "候选人列表",
      icon: Home,
    },
    {
      href: "/upload",
      label: "上传简历",
      icon: Upload,
    },
    {
      href: "/job-config",
      label: "岗位配置",
      icon: Briefcase,
    },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r bg-background">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">导航菜单</h2>
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start space-x-3",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-6 border-t">
        <div className="text-sm text-muted-foreground">
          <p className="font-medium">AI 简历分析平台</p>
          <p className="mt-1">智能简历筛选系统</p>
        </div>
      </div>
    </aside>
  );
}
