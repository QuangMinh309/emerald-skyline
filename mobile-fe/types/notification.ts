export enum NotiType {
  MAINTENANCE = 'MAINTENANCE', // Bảo trì
  POLICY = 'POLICY', // Chính sách
  GENERAL = 'GENERAL', // Thông báo chung
  WARNING = 'WARNING', // Cảnh báo
  OTHER = 'OTHER',
}

export interface TargetBlock {
  id: number;
  name: string;
}

export interface Notification {
  id: number;
  title: string;
  content: string;
  type: NotiType;
  is_urgent: boolean;
  created_at: string;
  published_at?: string;
  updated_at: string;
  file_urls: string[];
  target_blocks: TargetBlock[];
  channels: string[];
  is_read?: boolean;
}

export interface NotiTab {
  key: NotiType | 'ALL';
  label: string;
}

export const NOTI_TABS: NotiTab[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: NotiType.MAINTENANCE, label: 'Bảo trì' },
  { key: NotiType.POLICY, label: 'Chính sách' },
  { key: NotiType.GENERAL, label: 'Thông báo chung' },
  { key: NotiType.WARNING, label: 'Cảnh báo' },
  { key: NotiType.OTHER, label: 'Khác' },
];

export function getNotiTypeLabel(type: NotiType): string {
  const labels: Record<NotiType, string> = {
    [NotiType.MAINTENANCE]: 'Bảo trì',
    [NotiType.POLICY]: 'Chính sách',
    [NotiType.GENERAL]: 'Thông báo chung',
    [NotiType.WARNING]: 'Cảnh báo',
    [NotiType.OTHER]: 'Khác',
  };
  return labels[type];
}

export function getNotiTypeColor(type: NotiType): string {
  const colors: Record<NotiType, string> = {
    [NotiType.MAINTENANCE]: '#F59E0B', // Amber
    [NotiType.POLICY]: '#3B82F6', // Blue
    [NotiType.GENERAL]: '#10B981', // Green
    [NotiType.WARNING]: '#EF4444', // Red
    [NotiType.OTHER]: '#6B7280', // Gray
  };
  return colors[type];
}
