import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

@Injectable()
export class DifyApiService {
  async runWorkflow(
    apiUrl: string,
    apiToken: string,
    inputs: Record<string, any>,
    userId: string,
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${apiUrl}/workflows/run`,
        {
          inputs,
          response_mode: 'blocking',
          user: `user-${userId}`,
        },
        {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const result = response.data;
      if (result.status !== 'succeeded') {
        throw new Error(`工作流执行失败: ${result.error || '未知错误'}`);
      }
      return result.outputs;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const message =
          (axiosError.response?.data as any)?.message || axiosError.message;
        console.error('Dify API request failed:', message);
        throw new InternalServerErrorException(`Dify API 请求失败: ${message}`);
      } else {
        console.error('An unexpected error occurred:', error);
      }
      throw new InternalServerErrorException('与 Dify 服务通信失败');
    }
  }
}
