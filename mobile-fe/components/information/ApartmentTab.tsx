import { ApartmentTypeMap, RelationshipMap } from "@/constants/apartmentMapStatus";
import { ResidentApartment } from "@/types/resident";
import { Building2, MapPin } from "lucide-react-native";
import { Text, View } from "react-native";

interface ApartmentTabProps {
  data: ResidentApartment[];
}

export const ApartmentTab = ({ data }: ApartmentTabProps) => {
  if (!data || data.length === 0) {
    return (
      <View className="mt-10 items-center justify-center">
        <Building2 size={48} color="#D1D5DB" />
        <Text className="text-gray-400 mt-2 text-base">Chưa có thông tin căn hộ</Text>
      </View>
    );
  }

  return (
    <View className="mt-2">
      <Text className="text-secondary text-lg mb-4 font-bold">Thông tin căn hộ</Text>

      {data.map((item, index) => {
        const apt = item.apartment;

        const displayType = ApartmentTypeMap[apt.type] || apt.type;
        const displayRel = RelationshipMap[item.relationship] || item.relationship;

        return (
          <View
            key={apt.id || index}
            className="bg-white rounded-2xl p-5 shadow-sm mb-6 border border-third"
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl text-main font-bold flex-1 mr-2" numberOfLines={1}>
                Phòng {apt.name}
              </Text>

              <View className="bg-green-100 px-3 py-1.5 rounded-full items-center justify-center self-start">
                <Text className="text-main text-sm font-bold text-center">
                  {displayRel}
                </Text>
              </View>
            </View>

            {/* thông số chi tiết */}
            <View className="flex-row flex-wrap justify-between">
              <StatBox label="Diện tích" value={`${apt.area} m²`} color="bg-third" />
              <StatBox label="Tòa" value={apt.block?.name} color="bg-[#E0E7E4]" />
              <StatBox label="Tầng" value={apt.floor.toString()} color="bg-third" />
              <StatBox label="Loại" value={displayType} color="bg-[#E0E7E4]" />
            </View>

            <View className="flex-row items-start mt-2 pt-4 border-t border-gray-200">
              <MapPin size={20} color="#244B35" style={{ marginTop: 2 }} />
              <View className="ml-3 flex-1">
                <Text className="text-gray-500 text-sm">Vị trí chi tiết</Text>
                <Text className="text-foreground text-base mt-1 font-bold leading-5">
                  Phòng {apt.name}, Tầng {apt.floor}, Tòa {apt.block?.name}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const StatBox = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) => (
  <View className={`w-[48%] ${color} rounded-xl p-4 mb-4 items-center justify-center`}>
    <Text className="text-gray-600 text-sm mb-1">{label}</Text>
    <Text className="text-main text-lg font-bold text-center">{value}</Text>
  </View>
);
