import { NextRequest, NextResponse } from "next/server";
import { uploadResumes } from "@/services/resumeUpload";
import { FILE_UPLOAD, ERROR_CODES } from "@/lib/constants";
import type { ApiResponse, UploadResult } from "@/types";

/**
 * POST /api/resumes/upload
 * 
 * 处理简历文件上传
 * - 支持多文件上传（最多 5 个文件）
 * - 验证文件格式（仅 PDF）和大小
 * - 存储文件到文件系统
 * - 返回上传结果数组
 * 
 * 需求: 1, 15
 */
export async function POST(request: NextRequest) {
  try {
    // 解析 FormData
    const formData = await request.formData();
    
    // 获取所有上传的文件
    const files: File[] = [];
    
    // FormData 中可能有多个 'files' 字段或者单个 'files[]' 字段
    for (const [key, value] of formData.entries()) {
      if ((key === "files" || key === "files[]") && value instanceof File) {
        files.push(value);
      }
    }

    // 验证是否有文件上传
    if (files.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "未找到上传的文件。请选择至少一个 PDF 文件",
          code: ERROR_CODES.INVALID_INPUT,
        },
        { status: 400 }
      );
    }

    // 验证文件数量
    if (files.length > FILE_UPLOAD.MAX_FILES) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `上传文件数量超出限制。最多允许 ${FILE_UPLOAD.MAX_FILES} 个文件（当前：${files.length} 个）`,
          code: ERROR_CODES.INVALID_INPUT,
        },
        { status: 400 }
      );
    }

    // 批量上传文件
    const uploadResults = await uploadResumes(files);

    // 检查是否有失败的上传
    const failedUploads = uploadResults.filter((result) => !result.success);
    const successfulUploads = uploadResults.filter((result) => result.success);

    // 如果所有上传都失败
    if (successfulUploads.length === 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "所有文件上传失败",
          code: ERROR_CODES.INVALID_INPUT,
          data: {
            uploads: uploadResults.map((result) => ({
              fileName: result.fileName,
              status: "failed",
              error: result.error,
            })),
          },
        },
        { status: 400 }
      );
    }

    // 构建响应数据
    const uploads = uploadResults.map((result) => {
      if (result.success && result.data) {
        return {
          fileId: result.data.fileId,
          fileName: result.data.fileName,
          status: "uploaded" as const,
          filePath: result.data.filePath,
          fileSize: result.data.fileSize,
        };
      } else {
        return {
          fileName: result.fileName,
          status: "failed" as const,
          error: result.error || "未知错误",
        };
      }
    });

    // 如果部分上传成功，返回 207 Multi-Status
    if (failedUploads.length > 0) {
      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: {
            uploads,
            summary: {
              total: files.length,
              successful: successfulUploads.length,
              failed: failedUploads.length,
            },
          },
        },
        { status: 207 }
      );
    }

    // 所有上传成功，返回 200 OK
    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          uploads,
          summary: {
            total: files.length,
            successful: successfulUploads.length,
            failed: 0,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Upload API error:", error);

    // 处理已知错误
    if (error instanceof Error) {
      // 检查是否是文件数量超限错误
      if (error.message.includes("上传文件数量超出限制")) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: error.message,
            code: ERROR_CODES.INVALID_INPUT,
          },
          { status: 400 }
        );
      }

      // 其他验证错误
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.message || "文件上传失败",
          code: ERROR_CODES.INVALID_INPUT,
        },
        { status: 400 }
      );
    }

    // 未知错误
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "服务器内部错误，请稍后重试",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
