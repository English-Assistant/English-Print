import { useSettingsStore } from '@/stores/settings';
import type {
  ApiBatchNewPaperResponse,
  ErrorResponse,
} from '@/data/types/generation';
import axios from 'axios';

interface DifyWorkflowParams {
  inputs: Inputs;
  response_mode: 'blocking';
  user: string;
}

interface Inputs {
  words: string;
  unit: string;
}

/**
 * 运行 Dify 工作流并获取阻塞响应的结果。
 * @param inputs - 发送到工作流的输入数据。
 * @returns - 返回一个 Promise，该 Promise 解析为符合 GeneratedPaperData 接口的单个试卷数据。
 * @throws - 如果 API 未配置、请求失败或工作流执行失败，则抛出错误。
 */
export const runDifyWorkflow = async (inputs: Inputs) => {
  const { apiUrl, apiToken } = useSettingsStore.getState();

  if (!apiUrl || !apiToken) {
    throw new Error('请先在"接口设置"页面配置 Dify API URL 和 Token');
  }

  const body: DifyWorkflowParams = {
    inputs,
    response_mode: 'blocking',
    user: 'English-Print',
  };

  try {
    const response = await axios.post<ApiBatchNewPaperResponse | ErrorResponse>(
      `/workflows/run`,
      body,
      {
        baseURL: apiUrl,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiToken}`,
        },
        // timeout: 180000, // 180s timeout
      },
    );

    if ('message' in response.data) {
      throw new Error(response.data.message);
    }
    const result = response.data;

    if (result.data.status !== 'succeeded') {
      throw new Error(`工作流执行失败: ${result.data.error || '未知错误'}`);
    }

    return result.data.outputs.output;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      const message = errorData?.message || error.message || '请求发生未知错误';
      throw new Error(`API 请求失败: ${message}`);
    }
    throw error;
  }
};
