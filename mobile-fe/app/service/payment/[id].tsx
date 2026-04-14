import MomoIcon from "@/assets/images/momo-icon";
import VNPayIcon from "@/assets/images/vnpay-icon";
import MyButton from "@/components/ui/Button";
import { CustomHeader } from "@/components/ui/CustomHeader";
import { ServiceService } from "@/services/service.service";
import { PaymentMethod } from "@/types/service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { differenceInSeconds, format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { router, useLocalSearchParams } from "expo-router";
import { Clock, CreditCard, Info, User } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PaymentScreen() {
  const queryClient = useQueryClient();
  const { id, bookingData } = useLocalSearchParams();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );

  const { data: fetchedBooking, isLoading: isFetchingBooking } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => ServiceService.getBookingById(Number(id)),
    enabled: !!id && !bookingData,
    select: (res) => res.data,
  });

  const paymentMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMethod) throw new Error("Payment method not selected");
      const result = await ServiceService.createPaymentForBooking(
        Number(id),
        selectedMethod,
      );
      return result;
    },
    onSuccess: (response) => {
      const { paymentUrl, txnRef, amount } = response;
      if (!paymentUrl) {
        throw new Error("Payment URL not received from server");
      }

      // Navigate to processing screen with payment details
      router.replace({
        pathname: "/payment/processing",
        params: {
          txnRef,
          paymentUrl,
          amount: String(data.totalPrice),
          paymentMethod: selectedMethod?.toLowerCase() || "vnpay",
          targetType: "BOOKING",
          targetId: String(id),
          bookingCode: data.code,
          serviceName: data.service.name,
          customerName: data.resident.fullName,
        },
      } as any);
    },
    onError: (error: any) => {
      Alert.alert(
        "Lỗi thanh toán",
        error?.response?.data?.message ||
          error?.message ||
          "Không thể tạo link thanh toán",
      );
    },
  });

  const data = bookingData ? JSON.parse(bookingData as string) : fetchedBooking;
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!data?.expiresAt) return;

    const interval = setInterval(() => {
      const now = new Date();
      const expiry = parseISO(data.expiresAt);
      const diff = differenceInSeconds(expiry, now);

      if (diff <= 0) {
        clearInterval(interval);
        Alert.alert("Hết hạn", "Phiên giữ chỗ đã kết thúc.", [
          { text: "Quay lại", onPress: () => router.back() },
        ]);
      } else {
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        setTimeLeft(`${mins}:${secs.toString().padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [data?.expiresAt]);

  const handlePayment = () => {
    if (!selectedMethod) {
      Alert.alert("Thông báo", "Vui lòng chọn phương thức thanh toán");
      return;
    }

    paymentMutation.mutate();
  };

  if (isFetchingBooking) return <ActivityIndicator className="flex-1" />;
  if (!data) return null;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <CustomHeader title="Thanh toán" />

      <View className="bg-orange-50 px-6 py-3 flex-row items-center border-b border-orange-100">
        <Clock size={16} color="#c2410c" />
        <Text className="text-orange-700 text-sm font-medium ml-2">
          Slot được giữ trong{" "}
          <Text className="font-bold">{timeLeft || "--:--"}</Text> phút
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="p-4 gap-y-4">
          {/* Thông tin khách hàng */}
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <View className="flex-row items-center mb-3">
              <User size={18} color="#244B35" />
              <Text className="text-base font-bold text-gray-800 ml-2">
                Thông tin khách hàng
              </Text>
            </View>
            <View className="p-3 gap-y-3">
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">Họ tên</Text>
                <Text className="text-sm font-bold text-gray-800">
                  {data.resident.fullName}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">Điện thoại</Text>
                <Text className="text-sm font-bold text-gray-800">
                  {data.resident.phoneNumber}
                </Text>
              </View>
            </View>
          </View>

          {/* Thông tin booking */}
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <View className="flex-row items-center mb-3">
              <Info size={18} color="#244B35" />
              <Text className="text-base font-bold text-gray-800 ml-2">
                Thông tin dịch vụ
              </Text>
            </View>

            <View className="gap-y-3">
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">Mã đơn hàng</Text>
                <Text className="text-sm font-bold text-blue-600">
                  {data.code}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">Dịch vụ</Text>
                <Text className="text-sm font-bold text-[#244B35]">
                  {data.service.name}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">Ngày sử dụng</Text>
                <Text className="text-sm font-bold text-gray-800">
                  {format(parseISO(data.bookingDate), "dd/MM/yyyy", {
                    locale: vi,
                  })}
                </Text>
              </View>
              <View>
                <Text className="text-sm text-gray-500 mb-2">
                  Khung giờ đã chọn:
                </Text>
                <View className="flex-row flex-wrap gap-2 mt-1">
                  {data.timestamps.map((slot: any, index: number) => (
                    <View
                      key={index}
                      className="bg-[#244B35]/10 px-3 py-1 rounded-full border border-[#244B35]/20"
                    >
                      <Text className="text-xs font-bold text-[#244B35]">
                        {slot.startTime} - {slot.endTime}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Phương thức thanh toán */}
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <View className="flex-row items-center mb-4">
              <CreditCard size={18} color="#244B35" />
              <Text className="text-base font-bold text-gray-800 ml-2">
                Phương thức thanh toán
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setSelectedMethod(PaymentMethod.VNPAY)}
              className="bg-white p-4 rounded-xl mb-4 flex-row items-center border shadow-sm"
              style={{
                borderColor:
                  selectedMethod === PaymentMethod.VNPAY
                    ? "#E09B6B"
                    : "#F3F4F6",
              }}
            >
              <View className="w-10 h-10 mr-3 items-center justify-center">
                <VNPayIcon width={30} height={30} />
              </View>

              <View>
                <Text className="font-bold text-base text-gray-800">VNPay</Text>
                <Text className="text-sm text-gray-400">Thanh toán qua QR</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedMethod(PaymentMethod.MOMO)}
              className="bg-white p-4 rounded-xl mb-6 flex-row items-center border shadow-sm"
              style={{
                borderColor:
                  selectedMethod === PaymentMethod.MOMO ? "#E09B6B" : "#F3F4F6",
              }}
            >
              <View className="w-10 h-10 mr-3 items-center justify-center">
                <MomoIcon width={30} height={30} />
              </View>

              <View>
                <Text className="font-bold text-base text-gray-800">Momo</Text>
                <Text className="text-sm text-gray-400">Ví điện tử Momo</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View className="bg-[#244B35] rounded-2xl p-5 shadow-md flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-white/70 text-xs font-bold uppercase tracking-wider">
                Tổng thanh toán
              </Text>
              <Text className="text-white text-2xl font-black mt-1">
                {data.totalPrice.toLocaleString("vi-VN")} đ
              </Text>
            </View>
            <View className="bg-white/20 p-2 rounded-full">
              <CreditCard size={24} color="white" />
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="bg-white px-5 py-4 border-t border-gray-100 shadow-lg">
        <MyButton
          variant="secondary"
          className={`w-full py-4 rounded-xl ${selectedMethod ? "bg-[#E09B6B]" : "bg-gray-300"}`}
          textClassName="font-black text-base"
          onPress={handlePayment}
          disabled={!selectedMethod}
          isLoading={paymentMutation.isPending}
        >
          <CreditCard size={20} color="white" style={{ marginRight: 5 }} />
          <Text className="text-white font-bold text-base">
            Xác nhận thanh toán
          </Text>
        </MyButton>
      </View>
    </SafeAreaView>
  );
}
