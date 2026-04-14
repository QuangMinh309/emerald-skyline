export enum FeedbackStatus {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  PROCESSING = 'PROCESSING',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
}

export enum IssueType {
  TECHNICAL = 'TECHNICAL', // Kỹ thuật
  CLEANING = 'CLEANING', // Vệ sinh
  NOISE = 'NOISE', // Tiếng ồn
  SECURITY = 'SECURITY', // An ninh
  FIRE = 'FIRE', // Phòng cháy
  OTHERS = 'OTHERS', // Khác
}

export interface FeedbackImage {
  id: number;
  feedback_id: number;
  url: string;
  uploaded_at: string;
}

export interface Feedback {
  id: number;
  type: IssueType;
  typeLabel?: string;
  title: string;
  description: string;
  block?: Block;
  floor?: number;
  detailLocation?: string;
  fileUrls?: string[];
  status?: FeedbackStatus;
  statusLabel?: string;
  isUrgent?: boolean;
  rating?: number | null;
  feedback?: string | null;
  reporter?: { id: number; fullName: string; phoneNumber: string } | null;
  createdAt?: string;
  updatedAt?: string;
  rejectionReason?: string;
  estimatedCompletionDate?: string;
  code?: string;
  resident_id?: number;
  resident_name?: string;
  apartment?: string;
  location?: {
    building?: string;
    floor?: number;
    room?: string;
  };
  images?: FeedbackImage[];
  response?: string;
  is_urgent?: boolean;
  created_at?: string;
  updated_at?: string;
  resolved_at?: string;
  estimated_completion_date?: string;
}

export interface Block {
  id: number;
  name: string;
  totalFloors: number;
}

export interface FeedbackCategory {
  type: IssueType;
  label: string;
  icon: string; // Icon name from lucide-react-native
  color: string;
}

export const FEEDBACK_CATEGORIES: FeedbackCategory[] = [
  {
    type: IssueType.TECHNICAL,
    label: 'Kỹ thuật',
    icon: 'Wrench',
    color: '#3B82F6',
  },
  {
    type: IssueType.CLEANING,
    label: 'Vệ sinh',
    icon: 'Building',
    color: '#10B981',
  },
  {
    type: IssueType.NOISE,
    label: 'Tiếng ồn',
    icon: 'Volume2',
    color: '#F59E0B',
  },
  {
    type: IssueType.SECURITY,
    label: 'An ninh',
    icon: 'Shield',
    color: '#EF4444',
  },
  {
    type: IssueType.FIRE,
    label: 'Phòng cháy',
    icon: 'Flame',
    color: '#DC2626',
  },
  {
    type: IssueType.OTHERS,
    label: 'Khác',
    icon: 'MoreHorizontal',
    color: '#6B7280',
  },
];

export function getFeedbackStatusLabel(status: FeedbackStatus): string {
  const labels: Record<FeedbackStatus, string> = {
    [FeedbackStatus.PENDING]: 'Chờ xử lý',
    [FeedbackStatus.RECEIVED]: 'Đã tiếp nhận',
    [FeedbackStatus.IN_PROGRESS]: 'Đang xử lý',
    [FeedbackStatus.PROCESSING]: 'Đang xử lý',
    [FeedbackStatus.RESOLVED]: 'Hoàn tất',
    [FeedbackStatus.REJECTED]: 'Từ chối',
  };
  return labels[status];
}

export function getFeedbackStatusColor(status: FeedbackStatus): string {
  const colors: Record<FeedbackStatus, string> = {
    [FeedbackStatus.PENDING]: '#F59E0B', // Orange
    [FeedbackStatus.RECEIVED]: '#6366F1', // Indigo
    [FeedbackStatus.IN_PROGRESS]: '#3B82F6', // Blue
    [FeedbackStatus.PROCESSING]: '#3B82F6', // Blue
    [FeedbackStatus.RESOLVED]: '#10B981', // Green
    [FeedbackStatus.REJECTED]: '#EF4444', // Red
  };
  return colors[status];
}

export function getIssueTypeLabel(type: IssueType): string {
  const category = FEEDBACK_CATEGORIES.find((c) => c.type === type);
  return category?.label || 'Khác';
}
