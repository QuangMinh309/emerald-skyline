import { Notification, NotiType, TargetBlock } from '@/types/notification';
import { api } from './api';

const URI = '/notifications';

export const NotificationService = {
  getMine: async (): Promise<{ data: Notification[] }> => {
    const response = await api.get(`${URI}/mine`);
    return response.data;
  },

  getById: async (id: number): Promise<{ data: Notification }> => {
    const response = await api.get(`${URI}/${id}`);
    return {
      data: mapNotificationResponse(response.data.data),
    };
  },

  toggleRead: async (id: number): Promise<void> => {
    await api.patch(`${URI}/${id}/toggle-read`);
  },

  readAll: async (): Promise<void> => {
    await api.post(`${URI}/read-all`);
  },

  hide: async (id: number): Promise<void> => {
    await api.delete(`${URI}/${id}/hide`);
  },

  hideAll: async (): Promise<void> => {
    await api.post(`${URI}/hide-all`);
  },
};

const mapNotificationResponse = (raw: any): Notification => {
  return {
    id: raw.id,
    title: raw.title,
    content: raw.content,
    type: raw.type as NotiType,
    is_urgent: raw.isUrgent,
    created_at: raw.createdAt,
    published_at: raw.publishedAt,
    updated_at: raw.updatedAt,
    file_urls: raw.fileUrls || [],
    channels: raw.channels || [],
    is_read: raw.isRead ?? false,

    target_blocks: (raw.targetBlocks || []).map(
      (tb: any): TargetBlock => ({
        id: tb.block?.id || tb.id,
        name: tb.block?.name || 'N/A',
      })
    ),
  };
};
