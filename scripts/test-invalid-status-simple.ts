/**
 * 简单测试 - 只测试无效状态
 */

const BASE_URL = 'http://localhost:3000';

async function testInvalidStatus() {
  console.log('测试无效状态值...\n');
  
  // 先获取一个候选人ID
  const listResponse = await fetch(`${BASE_URL}/api/candidates?page=1&pageSize=1`);
  const listResult = await listResponse.json();
  
  if (!listResult.success || !listResult.data?.items?.length) {
    console.error('无法获取候选人');
    return;
  }
  
  const candidateId = listResult.data.items[0].id;
  console.log('候选人ID:', candidateId);
  console.log('');
  
  // 测试无效状态
  const invalidStatus = '无效状态';
  console.log('发送请求:', {
    url: `${BASE_URL}/api/candidates/${candidateId}/status`,
    method: 'PATCH',
    body: { status: invalidStatus }
  });
  console.log('');
  
  const response = await fetch(`${BASE_URL}/api/candidates/${candidateId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: invalidStatus }),
  });

  const result = await response.json();

  console.log('响应状态码:', response.status);
  console.log('响应:', JSON.stringify(result, null, 2));
  console.log('');
  
  if (response.status === 400 && result.code === 'INVALID_STATUS') {
    console.log('✅ 测试通过: 正确返回 400 错误');
  } else {
    console.log('❌ 测试失败: 期望返回 400 INVALID_STATUS');
  }
}

testInvalidStatus().catch(console.error);
