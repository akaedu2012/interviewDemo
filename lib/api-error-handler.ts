import { NextResponse } from "next/server";

/**
 * API 错误处理工具
 */

export class ApiError extends Error {
  code?: string;
  status: number;
  details?: unknown;

  constructor(message: string, status = 500, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * 标准化的错误响应
 */
export function errorResponse(error: unknown, defaultMessage = "请求处理失败"): NextResponse {
  console.error("[API Error]", error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.status || 500 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message || defaultMessage,
        type: error.name,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      error: defaultMessage,
      details: String(error),
    },
    { status: 500 }
  );
}

/**
 * 成功响应
 */
export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * 创建自定义 API 错误
 */
export function createApiError(
  message: string,
  status = 500,
  code?: string,
  details?: unknown
): ApiError {
  return new ApiError(message, status, code, details);
}

/**
 * 常见的错误类型
 */
export const ApiErrors = {
  BadRequest: (message: string, details?: unknown) =>
    createApiError(message, 400, "BAD_REQUEST", details),
  
  Unauthorized: (message = "未授权访问") =>
    createApiError(message, 401, "UNAUTHORIZED"),
  
  Forbidden: (message = "禁止访问") =>
    createApiError(message, 403, "FORBIDDEN"),
  
  NotFound: (message = "资源不存在") =>
    createApiError(message, 404, "NOT_FOUND"),
  
  Conflict: (message: string, details?: unknown) =>
    createApiError(message, 409, "CONFLICT", details),
  
  ValidationError: (message: string, details?: unknown) =>
    createApiError(message, 422, "VALIDATION_ERROR", details),
  
  InternalError: (message = "服务器内部错误", details?: unknown) =>
    createApiError(message, 500, "INTERNAL_ERROR", details),
  
  ServiceUnavailable: (message = "服务暂时不可用") =>
    createApiError(message, 503, "SERVICE_UNAVAILABLE"),
};

/**
 * API 路由包装器，自动处理错误
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
