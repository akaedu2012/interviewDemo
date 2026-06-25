import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Layout } from "@/components/layout/Layout";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "AI 简历分析平台",
  description: "智能简历分析和候选人匹配系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={cn("font-sans", inter.variable)}>
      <body className="antialiased">
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
