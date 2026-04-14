import { Block, Feedback } from '@/types/feedback';
import { api } from './api';

const URI = '/issues';

export const FeedbackService = {
  getMine: async (): Promise<Feedback[]> => {
    try {
      const response = await api.get(`${URI}/mine`);
      return response.data.data || [];
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  getById: async (id: number): Promise<Feedback> => {
    const response = await api.get(`${URI}/${id}`);
    return response.data.data;
  },

  getBlocks: async (): Promise<Block[]> => {
    const response = await api.get('/blocks');
    return response.data.data.map(mapBlock);
  },

  create: async (data: any, images: string[]): Promise<Feedback> => {
    const formData = new FormData();

    // Thêm các trường text
    formData.append('type', data.type);
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    if (data.blockId) formData.append('blockId', data.blockId.toString());
    if (data.floor !== undefined)
      formData.append('floor', data.floor.toString());
    formData.append('detailLocation', data.detailLocation || '');

    // Thêm các file ảnh
    images.forEach((uri, index) => {
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image`;

      formData.append('files', {
        uri,
        name: filename,
        type,
      } as any);
    });

    const response = await api.post(URI, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`${URI}/${id}`);
  },

  rate: async (
    id: number,
    rating: number,
    feedback?: string
  ): Promise<void> => {
    await api.post(`${URI}/${id}/rate`, {
      rating,
      feedback,
    });
  },
};

const mapBlock = (raw: any): Block => {
  return {
    id: raw.id,
    name: raw.buildingName,
    totalFloors: raw.totalFloors,
  };
};
