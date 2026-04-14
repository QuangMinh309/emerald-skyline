import {
  Booking,
  BookingStatus,
  getBookingStatusColor,
  getBookingStatusLabel,
} from '@/types/service';
import { differenceInSeconds, format, parseISO } from 'date-fns';
import { router } from 'expo-router';
import { Clock, CreditCard } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface BookingCardProps {
  booking: Booking;
  onPress?: () => void;
}

export default function BookingCard({ booking, onPress }: BookingCardProps) {
  const statusLabel = getBookingStatusLabel(booking.status);
  const statusColor = getBookingStatusColor(booking.status);
  const isPending = booking.status === BookingStatus.PENDING;
  const [timeLeft, setTimeLeft] = useState('');

  const formattedDate = format(parseISO(booking.date), 'dd/MM/yyyy');
  const formattedCreatedAt = format(
    parseISO(booking.created_at),
    'HH:mm, dd/MM/yyyy'
  );

  useEffect(() => {
    if (!isPending || !booking?.expiresAt) return;

    const calculateTime = () => {
      const now = new Date();
      const expiry = parseISO(booking.expiresAt!);
      const diff = differenceInSeconds(expiry, now);

      if (diff <= 0) {
        setTimeLeft('Hết hạn');
        return;
      }

      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setTimeLeft(`${m}:${s < 10 ? '0' : ''}${s}`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [booking.expiresAt, isPending]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white rounded-lg p-4 mb-3 border border-gray-200"
    >
      <View className="flex-row justify-between items-start mb-3">
        <View
          className="px-2 py-1 rounded"
          style={{ backgroundColor: statusColor + '20' }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: statusColor }}
          >
            {statusLabel}
          </Text>
        </View>
        {isPending && (
          <View className="flex-row items-center bg-orange-50 px-2 py-1 rounded-md">
            <Clock size={10} color="#f97316" />
            <Text className="text-[10px] text-orange-600 font-mono font-bold ml-1">
              {timeLeft}
            </Text>
          </View>
        )}
        <Text className="text-xs text-gray-500">{formattedCreatedAt}</Text>
      </View>

      <Text className="text-sm font-bold text-gray-800 mb-1">
        {booking.code}
      </Text>
      <Text className="text-sm text-gray-700 mb-1">
        Khách hàng: {booking.customer_name}
      </Text>
      <Text className="text-sm text-gray-700 mb-1">
        Dịch vụ: {booking.service_name}
      </Text>
      <Text className="text-sm text-gray-700 mb-1">
        Ngày:{' '}
        <Text className="font-semibold text-gray-800">{formattedDate}</Text>
      </Text>

      <View className="flex-row flex-wrap gap-1.5 mt-1">
        {booking.timestamps.map((slot, index) => (
            <View key={index} className="bg-gray-100 px-2 py-0.5 rounded">
              <Text className="text-[10px] font-medium text-gray-700">
                {slot.startTime ?? slot.start} - {slot.endTime ?? slot.end}
              </Text>
            </View>
          ))}
      </View>

      <View className="border-t border-gray-50 mt-1 pt-3 flex-row justify-between items-center">
        <View>
          <Text className="text-[10px] text-gray-400 uppercase font-bold">
            Tổng thanh toán
          </Text>
          <Text className="text-base font-black text-[#244B35]">
            {booking.total.toLocaleString('vi-VN')} đ
          </Text>
        </View>

        {isPending && (
          <TouchableOpacity
            className="bg-[#C89F6C] px-4 py-2 rounded-xl flex-row items-center shadow-sm"
            onPress={(e) => {
              e.stopPropagation();
              router.push({
                pathname: '/service/payment/[id]',
                params: {
                  id: booking.id,
                },
              } as any);
            }}
          >
            <CreditCard size={14} color="white" />
            <Text className="text-white text-xs font-bold ml-1.5">
              Thanh toán
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}
