/**
 * 结构化日志工具
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogContext {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

/**
 * 格式化日志消息
 */
function formatLog(logContext: LogContext): string {
  const { timestamp, level, message, context, error } = logContext;
  
  let log = `[${timestamp}] [${level}] ${message}`;
  
  if (context && Object.keys(context).length > 0) {
    log += ` | ${JSON.stringify(context)}`;
  }
  
  if (error) {
    log += `\n  Error: ${error.message}`;
    if (error.stack) {
      log += `\n  Stack: ${error.stack}`;
    }
  }
  
  return log;
}

/**
 * 日志记录器类
 */
class Logger {
  private context: Record<string, unknown> = {};
  
  /**
   * 设置全局上下文
   */
  setContext(context: Record<string, unknown>): void {
    this.context = { ...this.context, ...context };
  }
  
  /**
   * 清除全局上下文
   */
  clearContext(): void {
    this.context = {};
  }
  
  /**
   * 记录日志
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): void {
    const logContext: LogContext = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...context },
      error,
    };
    
    const formattedLog = formatLog(logContext);
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedLog);
        break;
      case LogLevel.INFO:
        console.info(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.ERROR:
        console.error(formattedLog);
        break;
    }
  }
  
  /**
   * Debug 日志
   */
  debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development') {
      this.log(LogLevel.DEBUG, message, context);
    }
  }
  
  /**
   * Info 日志
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }
  
  /**
   * Warning 日志
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }
  
  /**
   * Error 日志
   */
  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }
  
  /**
   * API 请求日志
   */
  apiRequest(method: string, path: string, context?: Record<string, unknown>): void {
    this.info(`API Request: ${method} ${path}`, context);
  }
  
  /**
   * API 响应日志
   */
  apiResponse(
    method: string,
    path: string,
    status: number,
    duration: number,
    context?: Record<string, unknown>
  ): void {
    this.info(`API Response: ${method} ${path} - ${status}`, {
      ...context,
      duration: `${duration}ms`,
    });
  }
  
  /**
   * 数据库操作日志
   */
  dbOperation(operation: string, context?: Record<string, unknown>): void {
    this.debug(`DB Operation: ${operation}`, context);
  }
  
  /**
   * 外部服务调用日志
   */
  externalService(service: string, operation: string, context?: Record<string, unknown>): void {
    this.info(`External Service: ${service} - ${operation}`, context);
  }
}

// 导出单例实例
export const logger = new Logger();

/**
 * API 请求计时器
 */
export class ApiTimer {
  private startTime: number;
  
  constructor(
    private method: string,
    private path: string
  ) {
    this.startTime = Date.now();
    logger.apiRequest(method, path);
  }
  
  /**
   * 结束计时并记录响应
   */
  end(status: number, context?: Record<string, unknown>): void {
    const duration = Date.now() - this.startTime;
    logger.apiResponse(this.method, this.path, status, duration, context);
  }
}

/**
 * 性能监控装饰器
 */
export function measurePerformance(target: string) {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: unknown[]) {
      const startTime = Date.now();
      
      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;
        
        logger.debug(`Performance: ${target}`, { duration: `${duration}ms` });
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        logger.error(
          `Performance: ${target} (failed)`,
          error instanceof Error ? error : undefined,
          { duration: `${duration}ms` }
        );
        
        throw error;
      }
    };
    
    return descriptor;
  };
}
