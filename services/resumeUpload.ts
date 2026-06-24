import { promises as fs } from "fs";
import path from "path";
import { generateId } from "@/lib/utils";
import { FILE_UPLOAD, ERROR_CODES } from "@/lib/constants";
import type { UploadResult, ValidationResult } from "@/types";

/**
 * 简历上传服务
 * 负责文件验证、存储和元数据管理
 */

/**
 * 验证上传的文件
 * 检查文件格式（仅 PDF）和大小限制
 */
export function validateFile(file: File): ValidationResult {
  const errors: string[] = [];

  // 验证文件类型
  if (!FILE_UPLOAD.ALLOWED_TYPES.includes(file.type)) {
    errors.push(
      `文件格式不支持。仅支持 PDF 格式（当前格式：${file.type}）`
    );
  }

  // 验证文件扩展名
  const fileName = file.name.toLowerCase();
  const hasValidExtension = FILE_UPLOAD.ALLOWED_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    errors.push(`文件扩展名不支持。仅支持 ${FILE_UPLOAD.ALLOWED_EXTENSIONS.join(", ")} 格式`);
  }

  // 验证文件大小
  if (file.size > FILE_UPLOAD.MAX_FILE_SIZE) {
    const maxSizeMB = FILE_UPLOAD.MAX_FILE_SIZE / (1024 * 1024);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    errors.push(
      `文件大小超出限制。最大允许 ${maxSizeMB}MB（当前大小：${fileSizeMB}MB）`
    );
  }

  // 验证文件大小不为零
  if (file.size === 0) {
    errors.push("文件为空，请选择有效的文件");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 存储文件到文件系统
 * 保存到 public/uploads 目录并返回文件路径
 */
export async function storeFile(
  file: File,
  fileId: string
): Promise<string> {
  try {
    // 确保上传目录存在
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    try {
      await fs.access(uploadDir);
    } catch {
      // 目录不存在，创建目录
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // 获取文件扩展名
    const fileExtension = path.extname(file.name);
    
    // 生成唯一文件名：fileId + 原始扩展名
    const fileName = `${fileId}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // 将文件转换为 Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 写入文件到磁盘
    await fs.writeFile(filePath, buffer);

    // 返回相对路径（用于数据库存储和访问）
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error("Failed to store file:", error);
    throw new Error("文件存储失败");
  }
}

/**
 * 上传简历文件
 * 验证文件并存储，返回文件元数据
 */
export async function uploadResume(file: File): Promise<UploadResult> {
  // 验证文件
  const validationResult = validateFile(file);
  
  if (!validationResult.isValid) {
    throw new Error(validationResult.errors.join("; "));
  }

  // 生成唯一文件标识符
  const fileId = generateId();

  try {
    // 存储文件
    const filePath = await storeFile(file, fileId);

    // 返回文件元数据
    return {
      fileId,
      fileName: file.name,
      filePath,
      fileSize: file.size,
      uploadedAt: new Date(),
    };
  } catch (error) {
    console.error("Failed to upload resume:", error);
    throw new Error("简历上传失败");
  }
}

/**
 * 批量上传简历文件
 * 处理多个文件上传，返回每个文件的上传结果
 */
export async function uploadResumes(
  files: File[]
): Promise<Array<{ success: boolean; data?: UploadResult; error?: string; fileName: string }>> {
  // 验证文件数量
  if (files.length > FILE_UPLOAD.MAX_FILES) {
    throw new Error(
      `上传文件数量超出限制。最多允许 ${FILE_UPLOAD.MAX_FILES} 个文件`
    );
  }

  // 并行处理所有文件
  const results = await Promise.allSettled(
    files.map((file) => uploadResume(file))
  );

  // 转换结果格式
  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return {
        success: true,
        data: result.value,
        fileName: files[index].name,
      };
    } else {
      return {
        success: false,
        error: result.reason?.message || "上传失败",
        fileName: files[index].name,
      };
    }
  });
}

/**
 * 删除上传的文件
 * 从文件系统中删除指定的文件
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    const fullPath = path.join(process.cwd(), "public", filePath);
    await fs.unlink(fullPath);
  } catch (error) {
    console.error("Failed to delete file:", error);
    // 不抛出错误，因为文件可能已经不存在
  }
}
