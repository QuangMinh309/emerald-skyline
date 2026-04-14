import MyButton from '@/components/ui/Button';
import { CustomHeader } from '@/components/ui/CustomHeader';
import { FeedbackService } from '@/services/feedback.service';
import {
  FeedbackStatus,
  getFeedbackStatusColor,
  getFeedbackStatusLabel,
  getIssueTypeLabel,
} from '@/types/feedback';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import {
  CheckCircle,
  CircleX,
  Clock,
  Info,
  MapPin,
  Paperclip,
  Star,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeedbackDetailScreen() {
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams();
  const { data: feedback, isLoading } = useQuery({
    queryKey: ['feedback', id],
    queryFn: () => FeedbackService.getById(Number(id)),
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa phản ánh này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await FeedbackService.delete(Number(id));
            router.back();
            queryClient.invalidateQueries({ queryKey: ['feedback', id] });
            queryClient.invalidateQueries({ queryKey: ['my-feedbacks'] });
          } catch (e: any) {
            Alert.alert(
              'Lỗi',
              e.data.data.message || 'Không thể xóa phản ánh đang được xử lý'
            );
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  const formatWithUTC7 = (dateString: string) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 7);

    return format(date, 'HH:mm, dd/MM/yyyy');
  };

  if (isLoading) return <ActivityIndicator />;

  if (!feedback) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text>Không tìm thấy phản ánh</Text>
      </SafeAreaView>
    );
  }

  const statusLabel = getFeedbackStatusLabel(feedback.status);
  const statusColor = getFeedbackStatusColor(feedback.status);
  const typeLabel = getIssueTypeLabel(feedback.type);

  const handleRate = () => {
    if (feedback.status === FeedbackStatus.RESOLVED && !feedback.rating) {
      router.push({
        pathname: '/feedback/rate/[id]',
        params: { id: feedback.id },
      } as any);
    }
  };

  const isProcessingOrResolved =
    feedback.status === FeedbackStatus.PROCESSING ||
    feedback.status === FeedbackStatus.RECEIVED ||
    feedback.status === FeedbackStatus.RESOLVED;

  const isResolved = feedback.status === FeedbackStatus.RESOLVED;
  const isRejected = feedback.status === FeedbackStatus.REJECTED;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <CustomHeader title="Chi tiết phản ánh" />

      <View
        className="px-3 py-1.5 px-5 py-4 m-4 rounded-full"
        style={{ backgroundColor: statusColor + '20' }}
      >
        <Text className="text-xs font-semibold" style={{ color: statusColor }}>
          {statusLabel}
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-5">
          <View className="bg-white rounded-lg p-4 mb-4">
            <Text className="text-xs text-gray-500 mb-2">
              {formatWithUTC7(feedback.createdAt)}
            </Text>
            <Text className="text-lg font-bold text-gray-900 mb-2">
              {feedback.title}
            </Text>

            <View className="bg-blue-50 px-3 py-1.5 rounded-full self-start">
              <Text className="text-blue-700 text-xs font-semibold">
                {typeLabel}
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-lg p-4 mb-4">
            <View className="flex-row items-center mb-3">
              <Info size={16} color="#6B7280" />
              <Text className="text-sm font-semibold text-gray-700 ml-2">
                Mô tả chi tiết
              </Text>
            </View>
            <Text className="text-sm text-gray-600 leading-6">
              {feedback.description}
            </Text>
          </View>

          {feedback.block && (
            <View className="bg-white rounded-lg p-4 mb-4">
              <View className="flex-row items-center mb-3">
                <MapPin size={16} color="#6B7280" />
                <Text className="text-sm font-semibold text-gray-700 ml-2">
                  Vị trí sự cố
                </Text>
              </View>

              <Text className="text-sm text-gray-600">
                {feedback.block?.name}{' '}
                {feedback.floor && <Text>· Tầng {feedback.floor}</Text>}
              </Text>

              {feedback.detailLocation && (
                <Text className="text-sm text-gray-600">
                  {feedback.detailLocation}
                </Text>
              )}
            </View>
          )}

          {feedback.fileUrls.length > 0 && (
            <View className="bg-white rounded-lg p-4 mb-4">
              <View className="flex-row items-center mb-3">
                <Paperclip size={16} color="#6B7280" />
                <Text className="text-sm font-semibold text-gray-700 ml-2">
                  Minh chứng
                </Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {feedback.fileUrls.map((file) => (
                    <Image
                      key={file}
                      source={{ uri: file }}
                      className="w-32 h-32 rounded-lg"
                      resizeMode="cover"
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          <View className="bg-white rounded-lg p-4 mb-4 relative">
            <View className="flex-row items-center mb-3">
              <Clock size={16} color="#6B7280" />
              <Text className="text-sm font-semibold text-gray-700 ml-2">
                Tiến trình xử lý
              </Text>
            </View>

            <View className="flex-row mb-4">
              <View className="w-8 items-center mr-3">
                <View className="w-2 h-2 bg-green-500 rounded-full mt-1.5" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-800 mb-1">
                  Tạo phản ánh
                </Text>
                <Text className="text-xs text-gray-500">
                  {formatWithUTC7(feedback.createdAt)}
                </Text>
              </View>
            </View>

            {isProcessingOrResolved && (
              <View className="flex-row mb-4">
                <View className="w-8 items-center mr-3">
                  <View className="w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-800 mb-1">
                    Đang xử lý
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {formatWithUTC7(feedback.updatedAt)}
                  </Text>
                </View>
              </View>
            )}

            {isResolved && (
              <View className="flex-row">
                <View className="w-8 items-center mr-3">
                  <CheckCircle size={16} color="#10B981" className="mt-1" />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-green-700 mb-1">
                    Đã hoàn tất
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {formatWithUTC7(feedback.updatedAt)}
                  </Text>
                </View>
              </View>
            )}

            {isRejected && (
              <View className="flex-row">
                <View className="w-8 items-center mr-3">
                  <CircleX size={16} color={statusColor} className="mt-1" />
                </View>
                <View className="flex-1">
                  <View>
                    <Text className="text-sm font-semibold text-red-700 mb-1">
                      Bị từ chối
                    </Text>
                    <Text className="text-sm font-semibold text-gray-700 mb-1">
                      Lý do: {feedback.rejectionReason}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-500">
                    {formatWithUTC7(feedback.updatedAt)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {feedback.rating && (
            <View className="bg-white rounded-lg p-4 mb-4">
              <View className="flex-row items-center mb-3">
                <Star size={16} color="#6B7280" />
                <Text className="text-sm font-semibold text-gray-700 ml-2">
                  Đánh giá của bạn
                </Text>
              </View>
              <View className="flex-row items-center">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={24}
                    color="#F59E0B"
                    fill={index < feedback.rating! ? '#F59E0B' : 'transparent'}
                  />
                ))}
                <Text className="text-sm text-gray-600 ml-2">
                  ({feedback.rating}/5)
                </Text>
              </View>
              <View className="flex-row items-center mt-2 ml-1">
                <Text className="text-sm text-gray-600 leading-6">
                  {feedback.feedback}
                </Text>
              </View>
            </View>
          )}

          {feedback.status === FeedbackStatus.RESOLVED && !feedback.rating && (
            <TouchableOpacity
              onPress={handleRate}
              className="bg-[#244B35] py-4 rounded-lg flex-row items-center justify-center"
            >
              <Star size={20} color="white" />
              <Text className="text-white font-bold text-base ml-2">
                Đánh giá
              </Text>
            </TouchableOpacity>
          )}

          {feedback.status === 'PENDING' && (
            <MyButton
              className=" w-full bg-red-500 py-4 rounded-lg center"
              textClassName="text-white text-center font-bold "
              onPress={handleDelete}
              isLoading={isDeleting}
            >
              Xóa phản ánh
            </MyButton>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
