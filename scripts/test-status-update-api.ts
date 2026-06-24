/**
 * 测试候选人状态更新 API
 * 测试 PATCH /api/candidates/[id]/status
 */

// 测试配置
const BASE_URL = 'http://localhost:3000';

// 候选人状态列表
const VALID_STATUSES = ['待筛选', '初筛通过', '面试中', '已录用', '已淘汰'] as const;

interface StatusUpdateResponse {
  success: boolean;
  data?: {
    id: string;
    status: string;
    updatedAt: string;
  };
  error?: string;
  code?: string;
}

/**
 * 测试状态更新 API
 */
async function testStatusUpdateAPI(candidateId: string, status: string): Promise<void> {
  console.log(`\n=== 测试更新候选人状态: ${status} ===`);
  
  try {
    const response = await fetch(`${BASE_URL}/api/candidates/${candidateId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    const result: StatusUpdateResponse = await response.json();

    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(result, null, 2));

    if (!response.ok) {
      console.error(`❌ API 调用失败: ${result.error || 'Unknown error'}`);
      return;
    }

    if (result.success && result.data) {
      console.log('✅ 状态更新成功');
      console.log('候选人ID:', result.data.id);
      console.log('新状态:', result.data.status);
      console.log('更新时间:', result.data.updatedAt);
    } else {
      console.error('❌ 响应格式不正确');
    }
  } catch (error) {
    console.error('❌ 请求失败:', error);
  }
}

/**
 * 测试无效状态值
 */
async function testInvalidStatus(candidateId: string): Promise<void> {
  console.log('\n=== 测试无效状态值 ===');
  
  const invalidStatus = '无效状态';
  
  try {
    const response = await fetch(`${BASE_URL}/api/candidates/${candidateId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: invalidStatus }),
    });

    const result: StatusUpdateResponse = await response.json();

    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(result, null, 2));

    if (response.status === 400 && result.code === 'INVALID_STATUS') {
      console.log('✅ 正确拒绝了无效状态值');
    } else {
      console.error('❌ 未正确处理无效状态');
    }
  } catch (error) {
    console.error('❌ 请求失败:', error);
  }
}

/**
 * 测试不存在的候选人
 */
async function testNonExistentCandidate(): Promise<void> {
  console.log('\n=== 测试不存在的候选人 ===');
  
  const nonExistentId = 'non-existent-id-123';
  
  try {
    const response = await fetch(`${BASE_URL}/api/candidates/${nonExistentId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: '待筛选' }),
    });

    const result: StatusUpdateResponse = await response.json();

    console.log('响应状态:', response.status);
    console.log('响应数据:', JSON.stringify(result, null, 2));

    if (response.status === 404 && result.code === 'CANDIDATE_NOT_FOUND') {
      console.log('✅ 正确返回了 404 错误');
    } else {
      console.error('❌ 未正确处理不存在的候选人');
    }
  } catch (error) {
    console.error('❌ 请求失败:', error);
  }
}

/**
 * 获取第一个候选人ID用于测试
 */
async function getFirstCandidateId(): Promise<string | null> {
  try {
    const response = await fetch(`${BASE_URL}/api/candidates?page=1&pageSize=1`);
    const result = await response.json();

    if (result.success && result.data?.items?.length > 0) {
      return result.data.items[0].id;
    }
    return null;
  } catch (error) {
    console.error('❌ 获取候选人列表失败:', error);
    return null;
  }
}

/**
 * 主测试函数
 */
async function main() {
  console.log('开始测试候选人状态更新 API');
  console.log('测试地址:', BASE_URL);

  // 获取一个真实的候选人ID
  const candidateId = await getFirstCandidateId();

  if (!candidateId) {
    console.error('\n❌ 没有找到候选人数据，请先上传简历创建候选人');
    console.log('\n提示: 运行 npm run dev 启动服务器，然后访问 http://localhost:3000/upload 上传简历');
    return;
  }

  console.log('\n找到候选人ID:', candidateId);

  // 测试所有有效状态
  for (const status of VALID_STATUSES) {
    await testStatusUpdateAPI(candidateId, status);
    // 等待一小段时间，避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 测试无效状态值
  await testInvalidStatus(candidateId);

  // 测试不存在的候选人
  await testNonExistentCandidate();

  console.log('\n=== 测试完成 ===');
}

// 运行测试
main().catch(console.error);
