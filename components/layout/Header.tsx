"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText, Home, Upload, Briefcase } from "lucide-react";

export function Header() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: "首页",
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="mr-8 flex items-center space-x-2">
          <FileText className="h-6 w-6 text-primary" />
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl whitespace-nowrap">AI 简历分析平台</span>
          </Link>
        </div>
        <nav className="flex items-center space-x-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "flex items-center space-x-2",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
