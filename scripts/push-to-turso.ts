/**
 * 推送数据库 schema 到 Turso
 * 
 * 因为 drizzle-kit 的 Config 类型不支持 authToken 字段，
 * 我们需要直接使用命令行参数来推送到 Turso。
 */

import { execSync } from 'child_process';

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoToken) {
  console.log('⚠️  TURSO_DATABASE_URL 或 TURSO_AUTH_TOKEN 未设置');
  console.log('跳过推送到 Turso，使用本地 SQLite');
  process.exit(0);
}

console.log('🚀 开始推送 schema 到 Turso...');
console.log('📍 Turso URL:', tursoUrl);

try {
  // 使用环境变量直接传递给 drizzle-kit
  execSync(
    `npx drizzle-kit push --config=drizzle.config.ts`,
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: tursoUrl,
        DATABASE_AUTH_TOKEN: tursoToken,
      }
    }
  );
  
  console.log('✅ Schema 推送成功！');
} catch (error) {
  console.error('❌ 推送失败:', error);
  process.exit(1);
}
