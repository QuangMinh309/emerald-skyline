import { useRouter } from "expo-router";
import { BarChart3, Plus } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { InvoiceHistoryItem } from "@/components/payment/InvoiceHistoryItem";
import MyButton from "@/components/ui/Button";
import { CustomHeader } from "@/components/ui/CustomHeader";
import { useResidentInvoices } from "@/hooks/useInvoice";

export default function PaymentScreen() {
  const router = useRouter();
  const { data: invoices, isLoading, refetch } = useResidentInvoices();

  const [selectedApartment, setSelectedApartment] = useState<string>("all");

  // check ngày nhập chỉ số
  const today = new Date();
  const currentDay = today.getDate();
  // const isInputPeriod = currentDay >= 20 && currentDay <= 25;
  const isInputPeriod = true;

  // tạo danh sách căn hộ để lọc
  const apartmentList = useMemo(() => {
    if (!invoices) return [];
    const names = invoices
      .map((inv) => inv.apartment?.name)
      .filter((name): name is string => !!name);
    return Array.from(new Set(names));
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    if (!invoices) return [];
    if (selectedApartment === "all") return invoices;
    return invoices.filter((inv) => inv.apartment?.name === selectedApartment);
  }, [invoices, selectedApartment]);

  // tính tổng nợ, hạn theo danh sách đã lọc
  const { totalDebt, invoiceCount, nearestDueDate, activeInvoiceIds } =
    useMemo(() => {
      const activeInvoices = filteredInvoices.filter(
        (item) => item.status === "UNPAID" || item.status === "OVERDUE",
      );

      const total = activeInvoices.reduce(
        (sum, item) => sum + Number(item.totalAmount),
        0,
      );

      // tìm hạn gần nhất
      let nearest: string | null = null;
      if (activeInvoices.length > 0) {
        // lấy item có due date hợp lệ
        const validDateInvoices = activeInvoices.filter((item) => item.dueDate);

        if (validDateInvoices.length > 0) {
          const sortedByDate = [...validDateInvoices].sort(
            (a, b) =>
              new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime(),
          );
          const d = new Date(sortedByDate[0].dueDate!);
          const day = String(d.getDate()).padStart(2, "0");
          const month = String(d.getMonth() + 1).padStart(2, "0");
          nearest = `${day}/${month}/${d.getFullYear()}`;
        }
      }

      return {
        totalDebt: Math.round(total),
        invoiceCount: activeInvoices.length,
        nearestDueDate: nearest,
        activeInvoiceIds: activeInvoices.map((inv) => inv.id),
      };
    }, [filteredInvoices]);

  return (
    <SafeAreaView className="flex-1 bg-[#F3F4F6]">
      <CustomHeader title="Thanh toán" backgroundColor="#F3F4F6" />

      <View className="h-[1px] bg-gray-200" />

      <ScrollView
        className="flex-1 px-4 pt-2"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        {/* lọc căn hộ */}
        {apartmentList.length > 0 && (
          <View className="mb-4">
            <Text className="text-xs text-gray-500 mb-2 ml-1">
              Lọc theo căn hộ:
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                onPress={() => setSelectedApartment("all")}
                className={`px-4 py-2 rounded-full mr-2 border ${
                  selectedApartment === "all"
                    ? "bg-[#244B35] border-[#244B35]"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    selectedApartment === "all" ? "text-white" : "text-gray-600"
                  }`}
                >
                  Tất cả
                </Text>
              </TouchableOpacity>

              {apartmentList.map((aptName) => (
                <TouchableOpacity
                  key={aptName}
                  onPress={() => setSelectedApartment(aptName)}
                  className={`px-4 py-2 rounded-full mr-2 border ${
                    selectedApartment === aptName
                      ? "bg-[#244B35] border-[#244B35]"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-[11px] font-bold ${
                      selectedApartment === aptName
                        ? "text-white"
                        : "text-gray-600"
                    }`}
                  >
                    {aptName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View className="bg-main rounded-2xl p-5 mb-5 shadow-sm">
          <Text className="text-gray-300 text-[12px] mb-1">
            Tổng nợ hiện tại
          </Text>
          <Text className="text-white text-3xl font-bold mb-1">
            {totalDebt.toLocaleString("vi-VN")} đ
          </Text>

          <Text className="text-gray-300 text-[11px] mb-4">
            {nearestDueDate
              ? `Hạn thanh toán gần nhất: ${nearestDueDate}`
              : "Bạn không có khoản nợ nào"}
          </Text>

          <MyButton
            variant="secondary"
            className="w-full h-12"
            textClassName="font-bold text-base"
            onPress={() => {
              router.push({
                pathname: "/payment",
                params: {
                  filterIds: JSON.stringify(activeInvoiceIds),
                },
              });
            }}
            disabled={invoiceCount === 0}
          >
            {invoiceCount > 0
              ? `Thanh toán ngay (${invoiceCount} hóa đơn)`
              : "Không có hóa đơn cần thanh toán"}
          </MyButton>
        </View>

        <View className="flex-row gap-4 mb-2">
          <TouchableOpacity
            disabled={!isInputPeriod}
            onPress={() => router.push("/payment/input-meter")}
            className={`flex-1 p-3 rounded-xl border flex-row items-center justify-center ${
              isInputPeriod
                ? "bg-transparent border-gray-400"
                : "bg-gray-100 border-gray-200 opacity-50"
            }`}
          >
            <Plus size={20} color={isInputPeriod ? "#244B35" : "#9CA3AF"} />
            <Text
              className={`ml-2 font-semibold ${
                isInputPeriod ? "text-gray-800" : "text-gray-400"
              }`}
            >
              Nhập chỉ số
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 bg-transparent p-3 rounded-xl border border-gray-400 flex-row items-center justify-center"
            onPress={() => router.push("/payment/statistics")}
          >
            <BarChart3 size={20} color="#E09B6B" />
            <Text className="ml-2 font-semibold text-gray-800">Thống kê</Text>
          </TouchableOpacity>
        </View>

        {isInputPeriod && <View className="mb-3" />}

        {/* lịch sử */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-main">Lịch sử hóa đơn</Text>
        </View>

        <View className="pb-10">
          {filteredInvoices?.map((item) => (
            <InvoiceHistoryItem
              key={item.id}
              item={item}
              onPress={() =>
                router.push({
                  pathname: "/payment/detail/[id]",
                  params: { id: item.id },
                })
              }
            />
          ))}

          {filteredInvoices?.length === 0 && (
            <Text className="text-center text-gray-400 mt-4">
              Không tìm thấy hóa đơn nào
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
