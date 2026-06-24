import { promises as fs } from "fs";
import path from "path";
import type { ParseResult } from "@/types";
import { ERROR_CODES } from "@/lib/constants";

/**
 * PDF 解析服务
 * 负责从 PDF 文件提取文本内容并进行清理
 */

/**
 * 清理提取的文本
 * 移除多余的空白、特殊字符，并标准化格式
 */
export function cleanText(rawText: string): string {
  if (!rawText) {
    return "";
  }

  let cleaned = rawText;

  // 1. 标准化换行符（将 \r\n 和 \r 转换为 \n）
  cleaned = cleaned.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 2. 移除连续的空白行（保留最多一个空行）
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  // 3. 移除每行开头和结尾的空白字符
  cleaned = cleaned
    .split("\n")
    .map((line) => line.trim())
    .join("\n");

  // 4. 移除特殊的 Unicode 字符（如零宽空格、控制字符）
  // 保留常见的标点符号和中文字符
  cleaned = cleaned.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, "");
  cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, ""); // 零宽字符

  // 5. 标准化连续空格（将多个空格替换为单个空格）
  cleaned = cleaned.replace(/ {2,}/g, " ");

  // 6. 移除页眉页脚常见模式（如 "Page 1 of 5"）
  cleaned = cleaned.replace(/Page \d+ of \d+/gi, "");
  cleaned = cleaned.replace(/第\s*\d+\s*页/g, "");

  // 7. 移除文件开头和结尾的空白
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * 从 PDF 文件解析文本内容
 * 处理多页 PDF 文档并提取所有文本
 */
export async function parseResume(filePath: string): Promise<ParseResult> {
  try {
    // 验证文件路径
    if (!filePath) {
      return {
        success: false,
        error: "文件路径为空",
      };
    }

    // 构建完整的文件路径
    // 如果是相对路径（如 /uploads/xxx.pdf），则添加 public 前缀
    let fullPath: string;
    if (filePath.startsWith("/uploads/")) {
      fullPath = path.join(process.cwd(), "public", filePath);
    } else if (path.isAbsolute(filePath)) {
      fullPath = filePath;
    } else {
      fullPath = path.join(process.cwd(), filePath);
    }

    // 检查文件是否存在
    try {
      await fs.access(fullPath);
    } catch {
      return {
        success: false,
        error: "文件不存在或无法访问",
      };
    }

    // 检查文件扩展名
    const fileExtension = path.extname(fullPath).toLowerCase();
    if (fileExtension !== ".pdf") {
      return {
        success: false,
        error: "文件格式不正确，仅支持 PDF 格式",
      };
    }

    // 读取文件内容
    const dataBuffer = await fs.readFile(fullPath);

    // 检查文件大小（避免解析空文件）
    if (dataBuffer.length === 0) {
      return {
        success: false,
        error: "PDF 文件为空",
      };
    }

    // Convert Buffer to Uint8Array (pdf-parse requires Uint8Array)
    const uint8Array = new Uint8Array(dataBuffer);

    // 解析 PDF 文件 using pdf-parse API
    let pdfData: {
      numpages: number;
      text: string;
    };

    try {
      // Dynamically require pdf-parse to avoid webpack bundling issues
      const { PDFParse } = require("pdf-parse");
      
      // Create parser instance and extract text
      const parser = new PDFParse(uint8Array);
      await parser.load(); // Load the PDF first
      const result = await parser.getText();
      
      pdfData = {
        numpages: result.total || 0,
        text: result.text || "",
      };
      
      // Clean up
      await parser.destroy();
    } catch (parseError) {
      console.error("PDF parsing failed:", parseError);
      
      // 提供更具体的错误信息
      let errorMessage = "PDF 解析失败";
      if (parseError instanceof Error) {
        if (parseError.message.includes("encrypted") || parseError.message.includes("password")) {
          errorMessage = "PDF 文件已加密或需要密码";
        } else if (parseError.message.includes("Invalid PDF") || parseError.message.includes("Invalid")) {
          errorMessage = "PDF 文件损坏或格式无效";
        } else {
          errorMessage = `PDF 解析错误: ${parseError.message}`;
        }
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    // 提取文本内容
    const rawText = pdfData.text || "";

    // 检查是否成功提取到文本
    if (!rawText.trim()) {
      return {
        success: false,
        error: "PDF 文件中未提取到文本内容（可能是扫描版 PDF 或图片格式）",
      };
    }

    // 清理文本
    const cleanedText = cleanText(rawText);

    // 返回解析结果
    return {
      success: true,
      text: cleanedText,
      pageCount: pdfData.numpages,
    };
  } catch (error) {
    console.error("Unexpected error in parseResume:", error);

    // 处理意外错误
    let errorMessage = "PDF 解析服务出现未知错误";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 批量解析多个 PDF 文件
 * 返回每个文件的解析结果
 */
export async function parseMultipleResumes(
  filePaths: string[]
): Promise<Array<{ filePath: string; result: ParseResult }>> {
  if (!filePaths || filePaths.length === 0) {
    return [];
  }

  // 并行解析所有文件
  const results = await Promise.all(
    filePaths.map(async (filePath) => ({
      filePath,
      result: await parseResume(filePath),
    }))
  );

  return results;
}

/**
 * 获取 PDF 文件的元数据（页数、大小等）
 * 不提取完整文本，仅获取文件信息
 */
export async function getPDFMetadata(filePath: string): Promise<{
  success: boolean;
  pageCount?: number;
  error?: string;
}> {
  try {
    // 构建完整的文件路径
    let fullPath: string;
    if (filePath.startsWith("/uploads/")) {
      fullPath = path.join(process.cwd(), "public", filePath);
    } else if (path.isAbsolute(filePath)) {
      fullPath = filePath;
    } else {
      fullPath = path.join(process.cwd(), filePath);
    }

    // 检查文件是否存在
    try {
      await fs.access(fullPath);
    } catch {
      return {
        success: false,
        error: "文件不存在或无法访问",
      };
    }

    // 读取文件内容
    const dataBuffer = await fs.readFile(fullPath);

    // Convert Buffer to Uint8Array
    const uint8Array = new Uint8Array(dataBuffer);

    // 解析 PDF（只获取元数据）
    const { PDFParse } = require("pdf-parse");
    const parser = new PDFParse(uint8Array);
    await parser.load();
    const result = await parser.getText();
    await parser.destroy();

    return {
      success: true,
      pageCount: result.total || 0,
    };
  } catch (error) {
    console.error("Failed to get PDF metadata:", error);
    return {
      success: false,
      error: "获取 PDF 元数据失败",
    };
  }
}
