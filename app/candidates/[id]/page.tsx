/**
 * 候选人详情页面（占位符）
 * 
 * 此页面将在任务 11.5 中完整实现
 */
export default function CandidateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">候选人详情</h1>
        <p className="text-muted-foreground">候选人 ID: {params.id}</p>
        <p className="text-sm text-muted-foreground">
          此页面将在后续任务中实现
        </p>
      </div>
    </div>
  );
}
