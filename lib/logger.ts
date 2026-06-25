/**
 * 统一日志工具
 * 提供结构化日志记录，支持不同日志级别和环境配置
 * 任务 15.3: 添加日志和监控
 */

/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * 日志配置
 */
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
}

/**
 * 默认配置
 */
const defaultConfig: LoggerConfig = {
  level: process.env.NODE_ENV === "production" ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsole: true,
  enableRemote: false,
};

/**
 * 当前配置
 */
let config: LoggerConfig = { ...defaultConfig };

/**
 * 配置日志器
 */
export function configureLogger(newConfig: Partial<LoggerConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * 日志元数据
 */
interface LogMetadata {
  [key: string]: any;
}

/**
 * 格式化时间戳
 */
function formatTimestamp(): string {
  return new Date().toISOString();
}

/**
 * 格式化日志消息
 */
function formatLogMessage(
  level: string,
  message: string,
  metadata?: LogMetadata
): string {
  const timestamp = formatTimestamp();
  const metaStr = metadata ? ` ${JSON.stringify(metadata)}` : "";
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
}

/**
 * 发送日志到远程服务器（可选）
 */
async function sendToRemote(
  level: string,
  message: string,
  metadata?: LogMetadata
): Promise<void> {
  if (!config.enableRemote || !config.remoteEndpoint) {
    return;
  }

  try {
    await fetch(config.remoteEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timestamp: formatTimestamp(),
        level,
        message,
        metadata,
      }),
    });
  } catch (error) {
    // 静默失败，不影响主流程
    console.error("Failed to send log to remote:", error);
  }
}

/**
 * 通用日志函数
 */
function log(
  level: LogLevel,
  levelName: string,
  message: string,
  metadata?: LogMetadata
): void {
  // 检查日志级别
  if (level < config.level) {
    return;
  }

  // 控制台输出
  if (config.enableConsole) {
    const formattedMessage = formatLogMessage(levelName, message, metadata);
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
    }
  }

  // 远程日志（异步，不阻塞）
  if (config.enableRemote) {
    sendToRemote(levelName, message, metadata).catch(() => {
      // 忽略错误
    });
  }
}

/**
 * Logger 类
 */
export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  /**
   * DEBUG 级别日志
   */
  debug(message: string, metadata?: LogMetadata): void {
    log(LogLevel.DEBUG, "DEBUG", `[${this.context}] ${message}`, metadata);
  }

  /**
   * INFO 级别日志
   */
  info(message: string, metadata?: LogMetadata): void {
    log(LogLevel.INFO, "INFO", `[${this.context}] ${message}`, metadata);
  }

  /**
   * WARN 级别日志
   */
  warn(message: string, metadata?: LogMetadata): void {
    log(LogLevel.WARN, "WARN", `[${this.context}] ${message}`, metadata);
  }

  /**
   * ERROR 级别日志
   */
  error(message: string, error?: Error | any, metadata?: LogMetadata): void {
    const errorMetadata: LogMetadata = {
      ...metadata,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    };

    log(LogLevel.ERROR, "ERROR", `[${this.context}] ${message}`, errorMetadata);
  }

  /**
   * 记录 API 请求
   */
  logApiRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    metadata?: LogMetadata
  ): void {
    const requestMetadata: LogMetadata = {
      method,
      path,
      statusCode,
      duration: `${duration}ms`,
      ...metadata,
    };

    if (statusCode >= 500) {
      this.error(`API Request Failed: ${method} ${path}`, null, requestMetadata);
    } else if (statusCode >= 400) {
      this.warn(`API Request Error: ${method} ${path}`, requestMetadata);
    } else {
      this.info(`API Request: ${method} ${path}`, requestMetadata);
    }
  }

  /**
   * 记录性能指标
   */
  logPerformance(operation: string, duration: number, metadata?: LogMetadata): void {
    this.info(`Performance: ${operation}`, {
      duration: `${duration}ms`,
      ...metadata,
    });
  }
}

/**
 * 创建 Logger 实例
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

/**
 * 默认 Logger 实例
 */
export const logger = new Logger("App");
