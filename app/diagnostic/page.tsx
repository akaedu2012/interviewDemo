'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

interface DiagnosticResult {
  success: boolean;
  diagnostics: {
    timestamp: string;
    environment: string;
    isVercel: boolean;
    checks: {
      deepseekApiKey: {
        exists: boolean;
        length: number;
        prefix: string;
      };
      deepseekBaseUrl: {
        exists: boolean;
        value: string;
      };
    };
  };
}

/**
 * 诊断页面 - 检查 Vercel 环境配置
 * /diagnostic
 */
export default function DiagnosticPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostic = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/debug/env');
      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError('诊断请求失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '未知错误');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (exists: boolean) => {
    if (exists) {
      return <CheckCircle2 className="w-6 h-6 text-green-600" />;
    }
    return <XCircle className="w-6 h-6 text-red-600" />;
  };

  const getStatusColor = (exists: boolean) => {
    return exists ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        {/* 标题 */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Vercel 部署诊断</h1>
          <p className="text-muted-foreground">
            检查环境变量和配置是否正确，定位部署问题
          </p>
        </div>

        {/* 运行诊断按钮 */}
        <Card>
          <CardHeader>
            <CardTitle>环境检查</CardTitle>
            <CardDescription>
              点击下方按钮检查 DEEPSEEK_API_KEY 等环境变量是否配置正确
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={runDiagnostic} disabled={loading} size="lg" className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  检查中...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  运行诊断
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 错误信息 */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-900">诊断失败</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 诊断结果 */}
        {result && (
          <div className="space-y-4">
            {/* 环境信息 */}
            <Card>
              <CardHeader>
                <CardTitle>环境信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">环境类型</span>
                  <span className="text-sm text-muted-foreground">
                    {result.diagnostics.environment}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Vercel 环境</span>
                  <span className="text-sm text-muted-foreground">
                    {result.diagnostics.isVercel ? '是' : '否'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">检查时间</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(result.diagnostics.timestamp).toLocaleString('zh-CN')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* DeepSeek API Key 检查 */}
            <Card
              className={
                result.diagnostics.checks.deepseekApiKey.exists
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.diagnostics.checks.deepseekApiKey.exists)}
                  <div>
                    <CardTitle
                      className={getStatusColor(
                        result.diagnostics.checks.deepseekApiKey.exists
                      )}
                    >
                      DEEPSEEK_API_KEY
                    </CardTitle>
                    <CardDescription>
                      {result.diagnostics.checks.deepseekApiKey.exists
                        ? '✓ 环境变量已配置'
                        : '✗ 环境变量未配置或未生效'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">是否存在</span>
                  <span
                    className={`text-sm font-semibold ${getStatusColor(
                      result.diagnostics.checks.deepseekApiKey.exists
                    )}`}
                  >
                    {result.diagnostics.checks.deepseekApiKey.exists ? '是' : '否'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">密钥长度</span>
                  <span className="text-sm text-muted-foreground">
                    {result.diagnostics.checks.deepseekApiKey.length} 字符
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">密钥前缀</span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {result.diagnostics.checks.deepseekApiKey.prefix}
                  </span>
                </div>

                {!result.diagnostics.checks.deepseekApiKey.exists && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-red-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm space-y-2">
                        <p className="font-semibold text-red-900">修复步骤：</p>
                        <ol className="list-decimal list-inside space-y-1 text-red-700">
                          <li>访问 Vercel Dashboard → 项目设置</li>
                          <li>找到 Environment Variables</li>
                          <li>
                            添加变量：
                            <code className="ml-1 px-1 bg-red-100 rounded">
                              DEEPSEEK_API_KEY
                            </code>
                          </li>
                          <li>确保勾选 Production 和 Preview 环境</li>
                          <li>
                            <strong>重新部署项目</strong>（关键步骤！）
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* DeepSeek Base URL 检查 */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.diagnostics.checks.deepseekBaseUrl.exists)}
                  <div>
                    <CardTitle>DEEPSEEK_API_BASE_URL</CardTitle>
                    <CardDescription>API 基础地址（可选配置）</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">配置值</span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {result.diagnostics.checks.deepseekBaseUrl.value}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* 诊断总结 */}
            {result.diagnostics.checks.deepseekApiKey.exists ? (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-900">配置正常</p>
                      <p className="text-sm text-green-700">
                        环境变量配置正确，可以正常使用简历上传和 AI 提取功能
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-yellow-900">配置异常</p>
                      <p className="text-sm text-yellow-700">
                        检测到配置问题，请按照上方修复步骤操作，然后重新运行诊断
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <Button onClick={runDiagnostic} variant="outline" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                重新检查
              </Button>
              {result.diagnostics.checks.deepseekApiKey.exists && (
                <Button asChild className="flex-1">
                  <a href="/upload">前往上传简历</a>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* 帮助信息 */}
        {!result && !loading && (
          <Card>
            <CardHeader>
              <CardTitle>使用说明</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>此诊断工具用于检查 Vercel 部署环境的配置是否正确。</p>
              <p className="font-medium text-foreground">常见问题：</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>环境变量在 Vercel Dashboard 配置但未生效</li>
                <li>简历上传后 AI 提取失败</li>
                <li>SSE 连接返回 HTML 错误页面</li>
              </ul>
              <p className="mt-4 text-xs text-muted-foreground">
                注意：环境变量的任何修改都需要重新部署才能生效
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
