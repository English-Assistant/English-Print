import { useSettingsStore } from '@/stores/settings';
import type { ApiBatchNewPaperResponse } from '@/data/types/generation';

interface DifyWorkflowParams {
  inputs: Record<string, unknown>;
  response_mode: 'streaming' | 'blocking';
  user: string;
}

interface DifyBlockingResponse {
  data: {
    status: 'succeeded' | 'failed' | 'stopped';
    outputs: Record<string, string>;
    error?: string;
  };
}

/**
 * 运行 Dify 工作流并获取阻塞响应的结果。
 * @param inputs - 发送到工作流的输入数据。
 * @returns - 返回一个 Promise，该 Promise 解析为符合 ApiBatchNewPaperResponse 接口的完整数据。
 * @throws - 如果 API 未配置、请求失败或工作流执行失败，则抛出错误。
 */
export const runDifyWorkflow = async (
  inputs: Record<string, unknown>,
): Promise<ApiBatchNewPaperResponse> => {
  const { apiUrl, apiToken } = useSettingsStore.getState();

  if (!apiUrl || !apiToken) {
    throw new Error('请先在"接口设置"页面配置 Dify API URL 和 Token');
  }

  const body: DifyWorkflowParams = {
    inputs,
    response_mode: 'blocking',
    user: `english-print-user-${crypto.randomUUID()}`,
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `API 请求失败，状态码: ${response.status}, 响应: ${errorBody}`,
    );
  }

  const result: DifyBlockingResponse = await response.json();

  if (result.data.status !== 'succeeded') {
    throw new Error(`工作流执行失败: ${result.data.error || '未知错误'}`);
  }

  const outputKey = Object.keys(result.data.outputs)[0];
  if (!outputKey) {
    throw new Error('工作流成功，但没有返回任何输出。');
  }

  const resultJson = result.data.outputs[outputKey];
  return JSON.parse(resultJson);
};
