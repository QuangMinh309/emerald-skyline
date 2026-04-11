import { useInvoiceDetail } from "@/hooks/useInvoice";
import { InvoiceResponse } from "@/types/invoice";
import {
  Building,
  Check,
  ChevronDown,
  ChevronUp,
  Droplets,
  Square,
  Zap,
} from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface AccordionItemProps {
  data: InvoiceResponse;
  isSelected: boolean;
  onToggleSelect: () => void;
  onPressDetail?: () => void;
}

const ICONS: Record<string, { icon: any; bg: string; color: string }> = {
  "Tiền điện": { icon: Zap, bg: "rgba(234, 179, 8, 0.15)", color: "#EAB308" },
  "Tiền nước": { icon: Droplets, bg: "rgba(59, 130, 246, 0.15)", color: "#3B82F6" },
  "Phí quản lý": { icon: Building, bg: "rgba(36, 75, 53, 0.12)", color: "#244B35" },
  default: { icon: Building, bg: "rgba(156, 163, 175, 0.15)", color: "#9CA3AF" },
};

// hiển thị theo thứ tự
const FEE_PRIORITY: Record<string, number> = {
  "Phí quản lý": 1,
  "Tiền điện": 2,
  "Tiền nước": 3,
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export const AccordionItem = ({
  data,
  isSelected,
  onToggleSelect,
  onPressDetail,
}: AccordionItemProps) => {
  const [expanded, setExpanded] = useState(false);

  const { data: detailData, isLoading, refetch } = useInvoiceDetail(data.id);

  const toggleExpand = () => {
    if (!expanded) {
      if (!detailData && !data.invoiceDetails) {
        refetch();
      }
    }
    setExpanded(!expanded);
  };

  const currentDetails = detailData?.invoiceDetails || data.invoiceDetails || [];

  // sắp xếp phí
  const sortedDetails = [...currentDetails].sort((a, b) => {
    const pA = FEE_PRIORITY[a.feeTypeName] || 99;
    const pB = FEE_PRIORITY[b.feeTypeName] || 99;
    return pA - pB;
  });

  const periodDate = new Date(data.period);
  const monthTitle = `Tháng ${periodDate.getMonth() + 1}/${periodDate.getFullYear()}`;
  const dueDateDisplay = data.dueDate ? formatDate(data.dueDate) : "";
  const apartmentLabel = data.apartment ? `${data.apartment?.name}` : "Chưa cập nhật";

  return (
    <View
      className={`bg-white rounded-xl mb-4 border ${
        isSelected ? "border-secondary" : "border-0"
      } shadow-sm overflow-hidden`}
    >
      <View className="p-4 flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          {/* checkbox */}
          <TouchableOpacity onPress={onToggleSelect} className="mr-3">
            {isSelected ? (
              <View className="w-6 h-6 bg-main rounded items-center justify-center">
                <Check size={16} color="white" />
              </View>
            ) : (
              <Square size={24} color="#D1D5DB" />
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onPressDetail} className="flex-1 mr-2">
            <View>
              <Text className="text-xs text-gray-400 mb-1">{data.invoiceCode}</Text>
              <Text className="text-xs font-bold text-main mb-1">
                Căn hộ: {apartmentLabel}
              </Text>
              <Text className="font-bold text-base text-gray-800 mb-1">
                HĐ: {monthTitle}
              </Text>
              {dueDateDisplay ? (
                <Text className="text-xs text-red-500">Hạn: {dueDateDisplay}</Text>
              ) : (
                <Text className="text-xs text-gray-400">Kỳ: {data.period}</Text>
              )}

              <Text className="text-xs text-blue-500 font-semibold mt-1">
                Xem chi tiết &gt;
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* tổng tiền & nút expand */}
        <View className="items-end">
          <Text className="font-bold text-base text-gray-800 mr-2">
            {Math.round(Number(data.totalAmount)).toLocaleString("vi-VN")} đ
          </Text>

          <TouchableOpacity onPress={toggleExpand} className="p-1">
            {expanded ? (
              <ChevronUp size={20} color="#6B7280" />
            ) : (
              <ChevronDown size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View className="h-[1px] bg-gray-300 w-full" />

      {/* chi tiết phí */}
      {expanded && (
        <View className="px-4 pb-4">
          {isLoading && !detailData ? (
            <ActivityIndicator size="small" color="#244B35" className="py-4" />
          ) : (
            <>
              {sortedDetails.length > 0 ? (
                sortedDetails.map((item) => {
                  let iconKey = "default";
                  const nameLower = (item.feeTypeName || "").toLowerCase();
                  if (nameLower.includes("điện")) iconKey = "Tiền điện";
                  else if (nameLower.includes("nước")) iconKey = "Tiền nước";
                  else if (nameLower.includes("quản lý")) iconKey = "Phí quản lý";

                  const IconData = ICONS[iconKey] || ICONS["default"];
                  const displayAmount = item.totalWithVat;

                  return (
                    <View
                      key={item.id}
                      className="flex-row justify-between items-center py-4 last:pb-1"
                    >
                      <View className="flex-row items-center">
                        <View
                          style={{ backgroundColor: IconData.bg }}
                          className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        >
                          <IconData.icon size={20} color={IconData.color} />
                        </View>
                        <View>
                          <Text className="text-sm text-gray-700 font-semibold">
                            {item.feeTypeName}
                          </Text>
                        </View>
                      </View>

                      <Text className="font-bold text-sm text-gray-700">
                        {Math.round(Number(displayAmount)).toLocaleString("vi-VN")} đ
                      </Text>
                    </View>
                  );
                })
              ) : (
                <Text className="text-center text-gray-400 py-4 text-xs">
                  Không tìm thấy chi tiết dịch vụ
                </Text>
              )}

              <View className="h-[1px] bg-gray-200 w-full my-4" />

              <View className="flex-row justify-between items-center">
                <Text className="font-bold text-main text-base">Tổng cộng</Text>
                <Text className="font-bold text-lg text-main">
                  {Math.round(Number(data.totalAmount)).toLocaleString("vi-VN")} đ
                </Text>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
};
