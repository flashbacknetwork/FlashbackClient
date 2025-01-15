import axios, { AxiosInstance } from 'axios';
import { DeleteParams, DeleteResponse, ErrorResponse } from './types';

export async function deleteFile(
  client: AxiosInstance,
  params: DeleteParams
): Promise<DeleteResponse> {
  try {
    const { data } = await client.delete<DeleteResponse>('/file/', {
      params,
      data: params,
    });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data) {
      const errorData = error.response.data as ErrorResponse;
      throw new Error(`Delete failed: ${errorData.message}`);
    }
    throw error;
  }
}
