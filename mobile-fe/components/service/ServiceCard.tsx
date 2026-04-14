import { Service } from '@/types/service';
import { formatDuration } from '@/utils/formatDuration';
import { Image, Text, TouchableOpacity, View } from 'react-native';

interface ServiceCardProps {
  service: Service;
  onPress: () => void;
}

export default function ServiceCard({ service, onPress }: ServiceCardProps) {
  const isFree = service.unit_price === 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-[48%] mb-4 bg-white rounded-xl shadow-sm overflow-hidden"
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: service.url }}
        className="w-full h-32"
        resizeMode="cover"
      />

      <View className="p-3">
        <Text
          className="text-[15px] font-bold text-gray-800 mb-2"
          numberOfLines={1}
        >
          {service.name}
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-baseline">
            {isFree ? (
              <Text className="text-[#3EAA6D] text-lg font-bold uppercase italic">
                Free
              </Text>
            ) : (
              <>
                <Text className="text-[#E09B6B] text-lg font-bold">
                  {service.unit_price / 1000}K
                </Text>
                <Text className="text-[#244B35] text-[10px] font-semibold ml-0.5">
                  /{formatDuration(service.unit)}
                </Text>
              </>
            )}
          </View>

          <View className="bg-[#244B35] px-2.5 py-1.5 rounded-lg">
            <Text className="text-white text-[10px] font-bold uppercase">
              Xem
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
