import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/**
 * GET /api/files/[fileId]
 * 
 * 从 /tmp 目录提供文件服务
 * 这是必需的，因为 Vercel 无法直接访问 /tmp 目录
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;

    // 验证 fileId（防止路径遍历攻击）
    if (!fileId || fileId.includes('..') || fileId.includes('/')) {
      return NextResponse.json(
        { error: "无效的文件ID" },
        { status: 400 }
      );
    }

    // 根据环境确定文件位置
    const isVercel = process.env.VERCEL === '1';
    const filePath = isVercel
      ? path.join('/tmp', 'uploads', fileId)
      : path.join(process.cwd(), 'public', 'uploads', fileId);

    // 检查文件是否存在
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: "文件不存在" },
        { status: 404 }
      );
    }

    // 读取文件
    const fileBuffer = await fs.readFile(filePath);

    // 根据文件扩展名设置 Content-Type
    const ext = path.extname(fileId).toLowerCase();
    let contentType = 'application/octet-stream';
    
    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (ext === '.doc') {
      contentType = 'application/msword';
    } else if (ext === '.docx') {
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }

    // 返回文件
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${fileId}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error("File serving error:", error);
    return NextResponse.json(
      { error: "文件读取失败" },
      { status: 500 }
    );
  }
}
