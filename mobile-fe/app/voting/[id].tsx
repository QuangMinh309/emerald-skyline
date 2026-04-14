import MyButton from '@/components/ui/Button';
import { CustomHeader } from '@/components/ui/CustomHeader';
import { VotingService } from '@/services/voting.service';
import { Option } from '@/types/voting';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VotingDetailScreen() {
  const queryClient = useQueryClient();
  const { id } = useLocalSearchParams();
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

  const { data: voting, isLoading } = useQuery({
    queryKey: ['voting', id],
    queryFn: async () => {
      const response = await VotingService.getById(Number(id));
      return response.data;
    },
    enabled: !!id,
  });

  const voteMutation = useMutation({
    mutationFn: (optionId: number) => VotingService.vote(Number(id), optionId),
    onSuccess: () => {
      Alert.alert('Thành công', 'Bạn đã biểu quyết thành công!', [
        {
          text: 'Xem kết quả',
          onPress: () => {
            router.replace({
              pathname: '/voting/result/[id]',
              params: { id: Number(id) },
            });
          },
        },
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);

      queryClient.invalidateQueries({ queryKey: ['votings'] });
    },
    onError: (error: any) => {
      const errorMsg =
        error?.data?.data?.message ||
        error?.data?.message ||
        error?.message ||
        'Có lỗi xảy ra khi biểu quyết, vui lòng thử lại sau ít phút';
      Alert.alert('Lỗi', errorMsg);
    },
  });

  if (isLoading) return <ActivityIndicator className="flex-1" />;

  if (!voting) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text>Không tìm thấy biểu quyết</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmitVote = () => {
    if (!selectedOptionId) {
      Alert.alert('Thông báo', 'Vui lòng chọn một phương án');
      return;
    }

    voteMutation.mutate(Number(selectedOptionId));
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <CustomHeader title="Biểu quyết" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-4">
          <Text className="text-lg font-bold text-gray-800 mb-8 text-center">
            {voting.title}
          </Text>

          {voting.options.map((option) => (
            <OptionCard
              key={option.id}
              option={option}
              isSelected={selectedOptionId === option.id}
              onSelect={() => setSelectedOptionId(option.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View className="bg-white px-5 py-4 border-t border-gray-100">
        <MyButton
          className="w-full bg-[#E09B6B] py-4 rounded-lg"
          textClassName="font-bold text-base uppercase"
          onPress={handleSubmitVote}
          isLoading={voteMutation.isPending}
        >
          XÁC NHẬN
        </MyButton>
      </View>
    </SafeAreaView>
  );
}

function OptionCard({
  option,
  isSelected,
  onSelect,
}: {
  option: Option;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      className={`bg-white rounded-lg p-4 mb-3 border-2 ${
        isSelected ? 'border-[#244B35]' : 'border-gray-200'
      }`}
    >
      <View className="flex-row items-start">
        <View
          className={`w-5 h-5 rounded-full border-2 mr-3 mt-0.5 ${
            isSelected
              ? 'border-[#244B35] bg-[#244B35]'
              : 'border-gray-300 bg-white'
          }`}
        >
          {isSelected && (
            <View className="w-2 h-2 rounded-full bg-white m-auto" />
          )}
        </View>

        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800 mb-2">
            {option.name}
          </Text>
          {option.description && (
            <Text className="text-sm text-gray-600 leading-5 whitespace-pre-line">
              {option.description}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
