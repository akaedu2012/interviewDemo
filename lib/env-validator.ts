/**
 * 环境变量验证工具
 */

export interface EnvValidationResult {
  valid: boolean;
  missing: string[];
  warnings: string[];
  environment: {
    nodeEnv: string;
    isVercel: boolean;
    isProduction: boolean;
    isDevelopment: boolean;
  };
}

/**
 * 必需的环境变量
 */
const REQUIRED_ENV_VARS = [
  'DEEPSEEK_API_KEY',
] as const;

/**
 * 可选但推荐的环境变量
 */
const OPTIONAL_ENV_VARS = [
  'DEEPSEEK_API_BASE_URL',
  'DATABASE_URL',
] as const;

/**
 * 验证环境变量
 */
export function validateEnvironment(): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  // 检查必需的环境变量
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  // 检查可选的环境变量
  for (const envVar of OPTIONAL_ENV_VARS) {
    if (!process.env[envVar]) {
      warnings.push(`推荐设置环境变量: ${envVar}`);
    }
  }

  // 验证 API Key 格式
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (apiKey && !apiKey.startsWith('sk-')) {
    warnings.push('DEEPSEEK_API_KEY 格式可能不正确（应以 sk- 开头）');
  }

  // 检查 API URL
  const apiUrl = process.env.DEEPSEEK_API_BASE_URL;
  if (apiUrl && !apiUrl.startsWith('http')) {
    warnings.push('DEEPSEEK_API_BASE_URL 格式可能不正确（应以 http/https 开头）');
  }

  const environment = {
    nodeEnv: process.env.NODE_ENV || 'development',
    isVercel: process.env.VERCEL === '1',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
  };

  return {
    valid: missing.length === 0,
    missing,
    warnings,
    environment,
  };
}

/**
 * 获取环境变量，如果不存在则抛出错误
 */
export function getRequiredEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  
  if (!value) {
    throw new Error(`缺少必需的环境变量: ${key}`);
  }
  
  return value;
}

/**
 * 获取可选环境变量
 */
export function getOptionalEnv(key: string, defaultValue = ''): string {
  return process.env[key] || defaultValue;
}

/**
 * 打印环境变量验证结果
 */
export function logEnvironmentStatus(): void {
  const result = validateEnvironment();
  
  console.log('=== 环境变量检查 ===');
  console.log('环境:', result.environment.nodeEnv);
  console.log('Vercel:', result.environment.isVercel ? '是' : '否');
  
  if (result.valid) {
    console.log('✓ 所有必需的环境变量已设置');
  } else {
    console.error('✗ 缺少环境变量:', result.missing.join(', '));
  }
  
  if (result.warnings.length > 0) {
    console.warn('⚠ 警告:');
    result.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  console.log('==================');
}

/**
 * 在应用启动时验证环境变量
 */
export function ensureValidEnvironment(): void {
  const result = validateEnvironment();
  
  if (!result.valid) {
    console.error('环境变量验证失败!');
    console.error('缺少以下必需的环境变量:');
    result.missing.forEach(key => console.error(`  - ${key}`));
    
    if (result.environment.isProduction) {
      throw new Error('生产环境缺少必需的环境变量');
    } else {
      console.warn('⚠ 开发环境缺少环境变量，部分功能可能无法使用');
    }
  }
}
