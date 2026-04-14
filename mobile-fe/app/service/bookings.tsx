import BookingCard from '@/components/service/BookingCard';
import { CustomHeader } from '@/components/ui/CustomHeader';
import { ServiceService } from '@/services/service.service';
import { BookingStatus } from '@/types/service';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TabKey = 'mine' | 'pending' | 'history';

interface Tab {
  key: TabKey;
  label: string;
  filter: (booking: any) => boolean;
}

const TABS: Tab[] = [
  {
    key: 'pending',
    label: 'Thanh toán',
    filter: (b) => b.status === BookingStatus.PENDING,
  },
  {
    key: 'mine',
    label: 'Của tôi',
    filter: (b) => b.status === BookingStatus.PAID,
  },
  {
    key: 'history',
    label: 'Lịch sử',
    filter: (b) =>
      b.status === BookingStatus.EXPIRED ||
      b.status === BookingStatus.CANCELLED,
  },
];

export default function MyBookingsScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('pending');

  const {
    data: bookings,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['bookings', 'mine'],
    queryFn: () => ServiceService.getMyBookings(),
    select: (res) => res.data,
  });

  const currentTab = TABS.find((t) => t.key === activeTab);
  const filteredBookings = (bookings || []).filter(
    currentTab?.filter || (() => true)
  );

  const handlePressBooking = (bookingId: number) => {
    router.push({
      pathname: '/service/booking/[id]',
      params: { id: bookingId },
    } as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <CustomHeader title="Ví dịch vụ" />
      <View className="px-5 py-4">
        <View className="flex-row gap-2 mb-4">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = (bookings || []).filter(tab.filter).length;

            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className={`flex-1 py-2.5 px-2 rounded-full ${
                  isActive ? 'bg-[#244B35]' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-center text-sm font-medium ${
                    isActive ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {tab.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-5"
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {filteredBookings.length === 0 ? (
          <View className="py-20 items-center">
            <Text className="text-gray-500 text-center">
              Không có booking nào trong mục này
            </Text>
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <View key={booking.id}>
              <BookingCard
                booking={booking}
                onPress={() => handlePressBooking(booking.id)}
              />
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
