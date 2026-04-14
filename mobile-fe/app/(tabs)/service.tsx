import ServiceCard from '@/components/service/ServiceCard';
import { CustomHeader } from '@/components/ui/CustomHeader';
import { ServiceService } from '@/services/service.service';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { History, Search } from 'lucide-react-native';
import { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ServiceScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: services = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await ServiceService.get();
      return response.data;
    },
  });

  const categories = Array.from(
    new Set(services.map((s) => s.category || 'Khác'))
  );

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      searchQuery === '' ||
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <CustomHeader
        title="Dịch vụ"
        rightComponent={
          <TouchableOpacity onPress={() => router.push('/service/bookings')}>
            <History size={24} color="#244B35" />
          </TouchableOpacity>
        }
      >
        <View className="flex-row items-center gap-2">
          <View className="flex-1 bg-white rounded-full flex-row items-center px-4 py-2">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Tìm kiếm dịch vụ..."
              className="flex-1 ml-2 text-gray-800"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </CustomHeader>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {categories.map((category) => {
          const servicesInCategory = filteredServices.filter(
            (s) => s.category === category
          );

          if (servicesInCategory.length === 0) return null;

          return (
            <View key={category} className="px-5 py-4">
              <View className="flex-row items-center mb-3">
                <View className="w-1 h-5 bg-[#244B35] rounded mr-2" />
                <Text className="text-base font-bold text-gray-800">
                  {category}
                </Text>
              </View>

              <View className="flex-row flex-wrap justify-between">
                {servicesInCategory.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onPress={() =>
                      router.push({
                        pathname: '/service/[id]',
                        params: { id: service.id },
                      } as any)
                    }
                  />
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
