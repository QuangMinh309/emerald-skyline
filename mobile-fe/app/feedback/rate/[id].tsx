import MyButton from '@/components/ui/Button';
import { CustomHeader } from '@/components/ui/CustomHeader';
import { FeedbackService } from '@/services/feedback.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Star } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RatingScreen() {
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  const { data: feedback, isLoading } = useQuery({
    queryKey: ['feedback', id],
    queryFn: () => FeedbackService.getById(Number(id)),
  });

  const rateMutation = useMutation({
    mutationFn: () => FeedbackService.rate(Number(id), rating, feedbackText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback', id] });
      queryClient.invalidateQueries({ queryKey: ['my-feedbacks'] });

      Alert.alert('Cảm ơn!', 'Đánh giá của bạn đã được ghi nhận', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (error: any) => {
      const msg =
        error?.data?.data?.message ||
        error?.data?.message ||
        error?.message ||
        'Không thể gửi đánh giá';
      Alert.alert('Lỗi', Array.isArray(msg) ? msg[0] : msg);
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center">
        <ActivityIndicator color="#244B35" />
      </SafeAreaView>
    );
  }

  if (!feedback) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text>Không tìm thấy phản ánh</Text>
      </SafeAreaView>
    );
  }

  const handleSubmitRating = () => {
    if (rating === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn số sao đánh giá');
      return;
    }
    rateMutation.mutate();
  };

  const ratingLabels = [
    '',
    'Rất không hài lòng',
    'Không hài lòng',
    'Bình thường',
    'Hài lòng',
    'Rất hài lòng',
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <CustomHeader title="Chi tiết phản ánh" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="p-5">
          <View className="bg-white rounded-lg p-4 mb-6">
            <Text className="text-base font-bold text-gray-900">
              {feedback.title}
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-6 items-center mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-2">
              Mức độ hài lòng <Text className="text-red-500">*</Text>
            </Text>
            <Text className="text-sm text-gray-600 p-6 mb-6 text-center">
              Bạn đánh giá thế nào về quá trình xử lý phản ánh này?
            </Text>

            <View className="mb-6 mt-2">
              <Text className="text-8xl">
                {rating === 0
                  ? '😐'
                  : rating <= 2
                    ? '😢'
                    : rating === 3
                      ? '😐'
                      : rating === 4
                        ? '😊'
                        : '🤩'}
              </Text>
            </View>

            <View className="flex-row items-center mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  onPressIn={() => setHoveredRating(star)}
                  onPressOut={() => setHoveredRating(0)}
                  className="mx-2"
                >
                  <Star
                    size={48}
                    color="#F59E0B"
                    fill={
                      star <= (hoveredRating || rating)
                        ? '#F59E0B'
                        : 'transparent'
                    }
                  />
                </TouchableOpacity>
              ))}
            </View>

            {rating > 0 && (
              <Text className="text-base font-semibold text-gray-700 mt-2">
                {ratingLabels[rating]}
              </Text>
            )}
          </View>

          <View className="bg-white rounded-lg p-4 mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-3">
              Ý kiến phản hồi (tùy chọn)
            </Text>
            <TextInput
              placeholder="Chia sẻ cảm nhận của bạn về quá trình xử lý..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={feedbackText}
              onChangeText={setFeedbackText}
              className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm"
            />
          </View>

          <MyButton
            className={`w-full py-4 rounded-lg center ${
              rating > 0 ? 'bg-[#244B35]' : 'bg-gray-300'
            }`}
            disabled={rating === 0}
            textClassName="font-bold text-base text-white text-center"
            onPress={handleSubmitRating}
            isLoading={rateMutation.isPending}
          >
            Gửi đánh giá
          </MyButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
