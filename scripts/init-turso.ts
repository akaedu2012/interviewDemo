import { initializeDatabase, jobDescriptions } from "../db";

async function initDefaultJob() {
  try {
    console.log('开始连接到 Turso 数据库...');
    
    // 初始化数据库连接
    const db = await initializeDatabase();
    
    console.log('数据库连接成功');
    
    const defaultJobId = 'default-job-' + Date.now();
    
    console.log('开始插入默认岗位到 Turso 数据库...');
    console.log('岗位 ID:', defaultJobId);
    
    await db.insert(jobDescriptions).values({
      id: defaultJobId,
      title: '全栈开发工程师',
      description: '我们正在寻找一位经验丰富的全栈开发工程师，负责开发和维护公司的核心产品。',
      requiredSkills: JSON.stringify(["JavaScript", "React", "Node.js", "TypeScript", "数据库设计"]),
      preferredSkills: JSON.stringify(["Next.js", "Docker", "AWS", "CI/CD", "微服务架构"]),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    console.log('✅ 默认岗位创建成功！');
    console.log('可以在 Vercel 部署后查询此岗位');
  } catch (error) {
    console.error('❌ 创建默认岗位失败:', error);
    throw error;
  }
}

initDefaultJob()
  .then(() => {
    console.log('\n✅ 初始化完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 初始化失败:', error);
    process.exit(1);
  });
