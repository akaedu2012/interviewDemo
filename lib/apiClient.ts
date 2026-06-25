/**
 * API 客户端
 * 封装所有 API 请求逻辑，提供统一的错误处理和重试机制
 * 任务 14.1: 实现全局错误处理
 */

import { Notification } from "@/components/ui/Notification";

/**
 * API 错误类
 */
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * API 错误代码到用户友好消息的映射
 */
const ERROR_MESSAGES: Record<string, string> = {
  INVALID_FILE_FORMAT: "文件格式不支持，请上传 PDF 文件",
  FILE_TOO_LARGE: "文件大小超过限制",
  INVALID_INPUT: "输入数据无效，请检查表单",
  INVALID_STATUS: "无效的候选人状态",
  CANDIDATE_NOT_FOUND: "候选人不存在",
  JOB_NOT_FOUND: "岗位配置不存在",
  NO_ACTIVE_JOB: "未配置激活的岗位",
  PDF_PARSE_ERROR: "PDF 解析失败",
  EXTRACTION_ERROR: "AI 提取失败",
  MATCH_CALCULATION_ERROR: "匹配评分计算失败",
  DATABASE_ERROR: "数据库操作失败",
  NETWORK_ERROR: "网络连接失败，请检查网络",
  TIMEOUT_ERROR: "请求超时，请重试",
  UNKNOWN_ERROR: "发生未知错误",
};

/**
 * 获取用户友好的错误消息
 */
function getUserFriendlyMessage(code: string, defaultMessage?: string): string {
  return ERROR_MESSAGES[code] || defaultMessage || ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * API 请求配置
 */
interface ApiRequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  showErrorToast?: boolean;
}

/**
 * 延迟函数（用于重试）
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 带超时的 fetch
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("TIMEOUT_ERROR", "请求超时");
    }
    throw error;
  }
}

/**
 * 统一的 API 请求函数
 */
export async function apiRequest<T = any>(
  url: string,
  config: ApiRequestConfig = {}
): Promise<T> {
  const {
    timeout = 30000,
    retries = 1,
    retryDelay = 1000,
    showErrorToast = true,
    ...fetchOptions
  } = config;

  let lastError: Error | null = null;

  // 重试逻辑
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, fetchOptions, timeout);

      // 解析 JSON 响应
      let data: any;
      try {
        data = await response.json();
      } catch (error) {
        // 如果响应不是 JSON，创建错误对象
        throw new ApiError(
          "INVALID_RESPONSE",
          "服务器返回了无效的响应",
          response.status
        );
      }

      // 检查 HTTP 状态码
      if (!response.ok) {
        const errorCode = data.code || `HTTP_${response.status}`;
        const errorMessage = data.error || data.message || "请求失败";
        throw new ApiError(errorCode, errorMessage, response.status);
      }

      // 检查业务逻辑成功标志
      if (data.success === false) {
        const errorCode = data.code || "API_ERROR";
        const errorMessage = data.error || data.message || "操作失败";
        throw new ApiError(errorCode, errorMessage);
      }

      // 返回数据
      return data as T;
    } catch (error) {
      lastError = error as Error;

      // 判断是否应该重试
      const shouldRetry =
        attempt < retries &&
        (error instanceof TypeError || // 网络错误
          (error instanceof ApiError &&
            (error.code === "TIMEOUT_ERROR" ||
              (error.status && error.status >= 500)))); // 超时或服务器错误

      if (shouldRetry) {
        console.warn(
          `API request failed (attempt ${attempt + 1}/${retries + 1}), retrying...`,
          error
        );
        await delay(retryDelay * Math.pow(2, attempt)); // 指数退避
        continue;
      }

      // 不重试，抛出错误
      break;
    }
  }

  // 所有重试都失败了，处理错误
  const apiError =
    lastError instanceof ApiError
      ? lastError
      : lastError instanceof TypeError
      ? new ApiError("NETWORK_ERROR", "网络连接失败")
      : new ApiError("UNKNOWN_ERROR", lastError?.message || "未知错误");

  // 记录错误到控制台
  console.error("API request failed:", {
    url,
    error: apiError,
    code: apiError.code,
    status: apiError.status,
  });

  // 显示错误提示
  if (showErrorToast) {
    const userMessage = getUserFriendlyMessage(apiError.code, apiError.message);
    Notification.error("操作失败", userMessage);
  }

  throw apiError;
}

/**
 * GET 请求
 */
export async function apiGet<T = any>(
  url: string,
  config?: ApiRequestConfig
): Promise<T> {
  return apiRequest<T>(url, {
    ...config,
    method: "GET",
  });
}

/**
 * POST 请求
 */
export async function apiPost<T = any>(
  url: string,
  body?: any,
  config?: ApiRequestConfig
): Promise<T> {
  return apiRequest<T>(url, {
    ...config,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...config?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT 请求
 */
export async function apiPut<T = any>(
  url: string,
  body?: any,
  config?: ApiRequestConfig
): Promise<T> {
  return apiRequest<T>(url, {
    ...config,
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...config?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PATCH 请求
 */
export async function apiPatch<T = any>(
  url: string,
  body?: any,
  config?: ApiRequestConfig
): Promise<T> {
  return apiRequest<T>(url, {
    ...config,
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...config?.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE 请求
 */
export async function apiDelete<T = any>(
  url: string,
  config?: ApiRequestConfig
): Promise<T> {
  return apiRequest<T>(url, {
    ...config,
    method: "DELETE",
  });
}

/**
 * 文件上传请求（multipart/form-data）
 */
export async function apiUpload<T = any>(
  url: string,
  formData: FormData,
  config?: ApiRequestConfig
): Promise<T> {
  return apiRequest<T>(url, {
    ...config,
    method: "POST",
    body: formData,
    // 不设置 Content-Type，让浏览器自动设置 multipart/form-data 边界
  });
}
