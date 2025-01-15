import axios, { AxiosInstance } from 'axios';
import { GetUrlParams, ErrorResponse } from './types';

export async function getUrl(client: AxiosInstance, params: GetUrlParams): Promise<string> {
  try {
    const { data } = await client.get<string>('/file/', { params });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorData = error.response.data as ErrorResponse;
      throw new Error(`Get URL failed: ${errorData.message}`);
    }
    throw error;
  }
}
