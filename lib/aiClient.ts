import OpenAI from "openai";
import { AI_CONFIG } from "@/lib/constants";

/**
 * DeepSeek AI 客户端配置
 * 使用 OpenAI SDK 连接 DeepSeek API
 */

// 验证 API Key
const apiKey = process.env.DEEPSEEK_API_KEY;

if (!apiKey) {
  console.warn(
    "Warning: DEEPSEEK_API_KEY not found in environment variables. AI features will not work."
  );
}

// 创建 OpenAI 客户端实例，配置为使用 DeepSeek API
export const aiClient = new OpenAI({
  apiKey: apiKey || "dummy-key", // 如果没有 key，使用占位符避免初始化错误
  baseURL: AI_CONFIG.API_BASE_URL, // https://api.deepseek.com/v1
});

/**
 * 调用 DeepSeek AI 模型进行文本生成
 * 封装通用的 AI 调用逻辑
 */
export async function callAI(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
    responseFormat?: { type: "json_object" } | { type: "text" };
  }
): Promise<string> {
  try {
    const response = await aiClient.chat.completions.create({
      model: AI_CONFIG.MODEL, // "deepseek-chat"
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: options?.temperature ?? AI_CONFIG.TEMPERATURE,
      max_tokens: options?.maxTokens ?? AI_CONFIG.MAX_TOKENS,
      response_format: options?.responseFormat,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("AI 返回的内容为空");
    }

    return content;
  } catch (error) {
    console.error("AI API 调用失败:", error);

    // 提供更具体的错误信息
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error("AI API 密钥无效或未配置");
      } else if (error.message.includes("rate limit")) {
        throw new Error("AI API 请求频率超限，请稍后重试");
      } else if (error.message.includes("timeout")) {
        throw new Error("AI API 请求超时");
      }
      throw error;
    }

    throw new Error("AI 服务调用失败");
  }
}

/**
 * 调用 AI 并解析 JSON 响应
 * 专门用于结构化数据提取
 */
export async function callAIForJSON<T>(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<T> {
  try {
    // 在 system prompt 中强调返回 JSON 格式
    const enhancedSystemPrompt = `${systemPrompt}\n\n你必须返回有效的 JSON 格式数据，不要包含任何其他文本或解释。`;

    const response = await callAI(enhancedSystemPrompt, userPrompt, {
      ...options,
      responseFormat: { type: "json_object" },
    });

    // 解析 JSON
    try {
      return JSON.parse(response) as T;
    } catch (parseError) {
      console.error("JSON 解析失败:", response);
      throw new Error("AI 返回的数据不是有效的 JSON 格式");
    }
  } catch (error) {
    console.error("AI JSON 调用失败:", error);
    throw error;
  }
}

/**
 * 测试 AI 连接
 * 用于验证 API Key 和配置是否正确
 */
export async function testAIConnection(): Promise<boolean> {
  try {
    await callAI(
      "You are a helpful assistant.",
      "Say 'Hello' in one word.",
      {
        temperature: 0,
        maxTokens: 10,
      }
    );
    return true;
  } catch (error) {
    console.error("AI 连接测试失败:", error);
    return false;
  }
}

// 导出配置常量供其他模块使用
export { AI_CONFIG };
