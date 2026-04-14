import MyButton from '@/components/ui/Button';
import { CustomHeader } from '@/components/ui/CustomHeader';
import DatePicker from '@/components/ui/DatePicker';
import { ServiceService } from '@/services/service.service';
import { getDisplayDate } from '@/utils/displayDate';
import { formatDuration } from '@/utils/formatDuration';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import { Calendar } from 'lucide-react-native';
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

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const { data: service, isLoading: isServiceLoading } = useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      const response = await ServiceService.getById(Number(id));
      return response.data;
    },
    enabled: !!id,
  });

  const [selectedDate, setSelectedDate] = useState(new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const { data: slots, isLoading: isSlotsLoading } = useQuery({
    queryKey: ['slots', id, dateString],
    queryFn: async () => {
      const response = await ServiceService.getSlots(Number(id), dateString);
      return response.data;
    },
    enabled: !!id,
  });

  const reserveMutation = useMutation({
    mutationFn: (body: {
      bookingDate: string;
      slots: { startTime: string; endTime: string }[];
    }) => ServiceService.reserve(Number(id), body),
    onSuccess: (response) => {
      Alert.alert('Thành công', 'Đã giữ chỗ thành công, vui lòng thanh toán.');

      router.push({
        pathname: '/service/payment/[id]',
        params: {
          bookingData: JSON.stringify(response.data),
          id: response.data.id,
        },
      } as any);

      queryClient.invalidateQueries({ queryKey: ['slots', id, dateString] });
    },
    onError: (error: any) => {
      const errorMsg =
        error?.data?.data?.message ||
        error?.data?.message ||
        error?.message ||
        'Có lỗi xảy ra khi đặt chỗ, vui lòng thử lại sau ít phút';
      Alert.alert('Lỗi', errorMsg);
    },
  });

  if (isServiceLoading) return <ActivityIndicator className="flex-1" />;

  if (!service) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text>Không tìm thấy dịch vụ</Text>
      </SafeAreaView>
    );
  }

  const handleSelectSlot = (startTime: string, endTime: string) => {
    const slotKey = `${startTime}-${endTime}`;
    if (selectedSlots.includes(slotKey)) {
      setSelectedSlots(selectedSlots.filter((s) => s !== slotKey));
    } else {
      setSelectedSlots([...selectedSlots, slotKey]);
    }
  };

  const handleBooking = () => {
    if (selectedSlots.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một khung giờ');
      return;
    }

    if (!isToday && selectedDate.getTime() < Date.now()) {
      Alert.alert('Thông báo', 'Không thể đặt cho thời điểm trong quá khứ');
      return;
    }

    const formattedSlots = selectedSlots.map((slot) => {
      const [start, end] = slot.split('-');
      return { startTime: start, endTime: end };
    });

    reserveMutation.mutate({
      bookingDate: dateString,
      slots: formattedSlots,
    });
  };

  const total = service.unit_price * selectedSlots.length;
  const isFree = service.unit_price === 0;
  const isToday =
    selectedDate.getDate() === new Date().getDate() &&
    selectedDate.getMonth() === new Date().getMonth() &&
    selectedDate.getFullYear() === new Date().getFullYear();
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <CustomHeader title={service.name} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: service.url }}
          className="w-full h-64"
          resizeMode="cover"
        />

        <View className="py-4 pl-4 mb-4">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-[#E09B6B] text-sm mb-1 font-medium">
                {service.open_hour} - {service.close_hour} hàng ngày
              </Text>
              <Text className="text-gray-800 text-base pr-4">
                {service.description}
              </Text>
            </View>
            <View className="bg-[#244B35] px-4 py-2 flex-row items-baseline">
              {isFree ? (
                <Text className="text-[#FFA11D] text-[30px] font-bold uppercase italic">
                  Free
                </Text>
              ) : (
                <>
                  <Text className="text-[#FFA11D] font-bold text-[30px]">
                    {service.unit_price / 1000}K
                  </Text>
                  <Text className="text-white text-base ml-1">
                    /{formatDuration(service.unit)}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>

        <View className="mx-4 mb-4">
          <DatePicker
            value={selectedDate}
            onChange={(newDate) => {
              setSelectedDate(newDate);
              setSelectedSlots([]);
            }}
            minimumDate={today}
            className="bg-[#E09B6B] border-0"
          >
            <View className="flex-1 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Calendar size={20} color="white" />
                <Text className="text-white font-semibold ml-2 text-base">
                  {getDisplayDate(selectedDate)}
                </Text>
              </View>

              <Text className="text-white text-base">
                {format(selectedDate, 'dd/MM/yyyy')}
              </Text>
            </View>
          </DatePicker>
        </View>

        <Text className="mb-1 text-[14px] font-semibold text-[#244B35] mb-3 mx-4">
          Chọn khung giờ
        </Text>

        {isSlotsLoading ? (
          <ActivityIndicator className="flex-1" />
        ) : (
          <View className="flex-row flex-wrap gap-3 px-4">
            {slots?.map((slot) => {
              const slotKey = `${slot.start_time}-${slot.end_time}`;
              const isSelected = selectedSlots.includes(slotKey);
              const isFull = slot.remaining_slot === 0;

              const now = new Date();

              const [endHour, endMinute] = slot.end_time.split(':').map(Number);

              const slotEndTime = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                endHour,
                endMinute,
                0
              ).getTime();

              const notValid = isToday && slotEndTime < Date.now();

              let containerStyle = '';
              let textStyle = '';

              if (isFull || notValid) {
                containerStyle = 'bg-white border border-gray-400';
                textStyle = 'text-gray-500';
              } else if (isSelected) {
                containerStyle = 'bg-[#244B35]';
                textStyle = 'text-white';
              } else {
                containerStyle = 'bg-white border border-[#3EAA6D]';
                textStyle = 'text-[#3EAA6D]';
              }

              return (
                <TouchableOpacity
                  key={slot.id}
                  onPress={() =>
                    !isFull && handleSelectSlot(slot.start_time, slot.end_time)
                  }
                  disabled={isFull || notValid}
                  className={`px-4 py-3 rounded-md flex-1 basis-[30%] ${containerStyle}`}
                >
                  <Text
                    className={`text-center text-sm font-medium ${textStyle}`}
                  >
                    {slot.start_time} - {slot.end_time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View className="bg-white px-5 py-4 border-t border-gray-100">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-sm text-gray-600">Tổng cộng:</Text>
          <Text className="text-xl font-bold text-[#244B35]">
            {total.toLocaleString('vi-VN')} đ
          </Text>
        </View>
        <MyButton
          className="w-full bg-[#E09B6B] py-4 rounded-lg"
          textClassName="font-bold text-base uppercase"
          onPress={handleBooking}
          isLoading={reserveMutation.isPending}
        >
          ĐẶT NGAY
        </MyButton>
      </View>
    </SafeAreaView>
  );
}
