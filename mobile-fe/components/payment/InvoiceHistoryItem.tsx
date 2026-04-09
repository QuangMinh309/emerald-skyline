import { InvoiceResponse } from "@/types/invoice";
import { ChevronRight } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

const STATUS_CONFIG = {
  PAID: { text: "Đã thanh toán", bg: "bg-green-100", color: "text-green-600" },
  UNPAID: { text: "Chưa thanh toán", bg: "bg-orange-100", color: "text-orange-500" },
  OVERDUE: { text: "Quá hạn", bg: "bg-red-100", color: "text-red-500" },
  CANCELLED: { text: "Đã hủy", bg: "bg-gray-100", color: "text-gray-500" },
};

interface InvoiceHistoryItemProps {
  item: InvoiceResponse;
  onPress?: () => void;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const InvoiceHistoryItem = ({ item, onPress }: InvoiceHistoryItemProps) => {
  const config =
    STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.UNPAID;

  const periodDate = new Date(item.period);
  const monthStr = `Tháng ${periodDate.getMonth() + 1}/${periodDate.getFullYear()}`;
  const apartmentName = item.apartment?.name || "Chưa cập nhật";
  const dueDateStr = formatDate(item.dueDate);

  return (
    <TouchableOpacity
      className="bg-white p-4 rounded-xl mb-3 flex-row justify-between shadow-sm border border-gray-100"
      onPress={onPress}
    >
      <View className="flex-1 mr-2 justify-center">
        <Text className="text-xs text-gray-400 mb-1">{item.invoiceCode}</Text>
        <Text className="text-xs font-bold text-main mb-1">Căn hộ: {apartmentName}</Text>
        <Text className="font-bold text-base text-gray-800 mb-1">HĐ: {monthStr}</Text>
        {dueDateStr ? (
          <Text className="text-xs text-red-500 font-medium">Hạn: {dueDateStr}</Text>
        ) : (
          <Text className="text-sm text-gray-400">Kỳ: {item.period}</Text>
        )}
      </View>

      <View className="items-end justify-between">
        <Text className="font-bold text-lg text-main mb-2">
          {Math.round(Number(item.totalAmount)).toLocaleString("vi-VN")} đ
        </Text>

        <View className="items-end">
          <View className={`${config.bg} px-2 py-1 rounded-md mb-1`}>
            <Text className={`${config.color} text-[11px]`}>{config.text}</Text>
          </View>
          <ChevronRight size={15} color="#9CA3AF" />
        </View>
      </View>
    </TouchableOpacity>
  );
};
