import { useFeeDetail } from "@/hooks/useFeeDetail";
import { AlertCircle, Droplet, X, Zap } from "lucide-react-native";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  main: "#244B35",
  elec: "#FACC15",
  water: "#3B82F6",
  third: "#EFEAE1",
  border: "#D9D9D9",
};

interface TariffModalProps {
  visible: boolean;
  onClose: () => void;
  type: "ELEC" | "WATER" | null;
}

export const TariffModal = ({ visible, onClose, type }: TariffModalProps) => {
  const feeId = type === "ELEC" ? 1 : type === "WATER" ? 2 : null;

  const { data, isLoading, isError, error } = useFeeDetail(visible ? feeId : null);

  if (!type) return null;

  const isElec = type === "ELEC";
  const themeColor = isElec ? COLORS.elec : COLORS.water;
  const bgIcon = isElec ? "bg-yellow-50" : "bg-blue-50";
  const IconComponent = isElec ? Zap : Droplet;

  const formatRange = (from: number, to: number | null) => {
    if (to === null) return `Trên ${from}`;
    return `${from} - ${to}`;
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 justify-end">
        <TouchableOpacity className="flex-1" onPress={onClose} />

        <View className="bg-white rounded-t-3xl pb-8 max-h-[80%] shadow-xl overflow-hidden">
          {/* header */}
          <View className="flex-row items-center justify-between p-5 border-b border-gray-300 bg-white">
            <View className="flex-row items-center gap-3">
              <View className={`p-2.5 rounded-full ${bgIcon}`}>
                <IconComponent size={22} color={themeColor} fill={themeColor} />
              </View>
              <View>
                <Text className="text-lg font-bold text-gray-800">
                  {isLoading ? "Đang tải..." : data?.name || "Biểu giá chi tiết"}
                </Text>
                {data?.unit && (
                  <Text className="text-sm text-gray-500 font-medium">
                    Đơn vị: {data.unit}
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2 bg-gray-150 rounded-full">
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* body */}
          <ScrollView className="px-5 pt-4" showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <View className="py-10">
                <ActivityIndicator size="large" color={COLORS.main} />
              </View>
            ) : isError ? (
              <View className="py-10 items-center">
                <Text className="text-red-500 font-medium">Không thể tải biểu giá.</Text>
                <Text className="text-gray-400 text-xs mt-1">
                  {(error as any)?.message || "Lỗi kết nối"}
                </Text>
              </View>
            ) : (
              <>
                <View className="border border-[#D9D9D9] rounded-xl overflow-hidden mb-4">
                  <View className="flex-row bg-[#EFEAE1] p-3 border-b border-[#D9D9D9]">
                    <Text className="flex-1 text-sm font-semibold text-main text-center">
                      Bậc thang
                    </Text>
                    <Text className="flex-1 text-sm font-semibold text-main text-center">
                      Định mức
                    </Text>
                    <Text className="flex-1 text-sm font-semibold text-main text-center">
                      Đơn giá
                    </Text>
                  </View>

                  {data?.tiers.map((item, index) => (
                    <View
                      key={item.id}
                      className={`flex-row p-3.5 border-b border-[#D9D9D9] items-center ${
                        index === data.tiers.length - 1 ? "border-b-0" : ""
                      } ${index % 2 !== 0 ? "bg-[#EFEAE1]/30" : "bg-white"}`}
                    >
                      <Text className="flex-1 text-[12px] font-semibold text-black text-center">
                        {item.name}
                      </Text>
                      <Text className="flex-1 text-[12px] text-black font-medium text-center">
                        {formatRange(item.fromValue, item.toValue)}
                      </Text>
                      <Text className="flex-1 text-[12px] font-semibold text-center text-main">
                        {item.unitPrice.toLocaleString("vi-VN")} đ
                      </Text>
                    </View>
                  ))}
                </View>

                {data?.description && (
                  <View className="mb-8 bg-[#EFEAE1]/40 p-3 rounded-xl border border-[#D9D9D9] flex-row gap-2 items-center">
                    <AlertCircle size={16} color="#6B7280" />
                    <Text className="flex-1 text-sm text-gray-700">
                      {data.description} (Đơn giá chưa bao gồm VAT).
                    </Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
