import { useLocalSearchParams } from "expo-router";
import { AlertCircle, CheckCircle, Clock, Copy, RefreshCw } from "lucide-react-native";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CustomHeader } from "@/components/ui/CustomHeader";
import { usePaymentHistory } from "@/hooks/usePayment";
import { PaymentTransaction } from "@/types/payment";

const getStatusColor = (status: string) => {
  switch (status) {
    case "SUCCESS":
      return "text-green-600";
    case "FAILED":
      return "text-red-600";
    case "PENDING":
      return "text-yellow-600";
    default:
      return "text-gray-600";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "SUCCESS":
      return <CheckCircle size={20} color="#10B981" />;
    case "FAILED":
      return <AlertCircle size={20} color="#EF4444" />;
    case "PENDING":
      return <Clock size={20} color="#F59E0B" />;
    default:
      return <Clock size={20} color="#6B7280" />;
  }
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "SUCCESS":
      return "bg-green-100";
    case "FAILED":
      return "bg-red-100";
    case "PENDING":
      return "bg-yellow-100";
    default:
      return "bg-gray-100";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "SUCCESS":
      return "Thành công";
    case "FAILED":
      return "Thất bại";
    case "PENDING":
      return "Đang chờ";
    default:
      return "Không xác định";
  }
};

const PaymentHistoryCard = ({
  payment,
  onRetry,
}: {
  payment: PaymentTransaction;
  onRetry: (payment: PaymentTransaction) => void;
}) => {
  const handleCopyTxnRef = async () => {
    await Clipboard.setString(payment.txnRef);
    Alert.alert("Thông báo", "Đã sao chép mã giao dịch");
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View className="mr-2">{getStatusIcon(payment.status)}</View>
          <View className="flex-1">
            <Text className="font-bold text-gray-800">
              {payment.paymentMethod === "MOMO" ? "Momo" : "VNPay"}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              {new Date(payment.createdAt).toLocaleString("vi-VN")}
            </Text>
          </View>
        </View>

        <View className={`${getStatusBadgeColor(payment.status)} rounded-full px-3 py-1`}>
          <Text className={`text-xs font-semibold ${getStatusColor(payment.status)}`}>
            {getStatusText(payment.status)}
          </Text>
        </View>
      </View>

      {/* Amount */}
      <View className="bg-gray-50 rounded-lg p-3 mb-3">
        <Text className="text-xs text-gray-500 mb-1">Số tiền</Text>
        <Text className="text-lg font-bold text-gray-800">
          {Number(payment.amount).toLocaleString("vi-VN")} đ
        </Text>
      </View>

      {/* Transaction Details */}
      <View className="space-y-2 mb-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-gray-600">Mã giao dịch:</Text>
          <View className="flex-row items-center">
            <Text className="text-xs font-mono text-gray-800 mr-2">{payment.txnRef}</Text>
            <TouchableOpacity onPress={handleCopyTxnRef}>
              <Copy size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-xs text-gray-600">Phương thức:</Text>
          <Text className="text-xs text-gray-800">{payment.paymentMethod}</Text>
        </View>

        <View className="flex-row justify-between">
          <Text className="text-xs text-gray-600">Mô tả:</Text>
          <Text className="text-xs text-gray-800 flex-1 text-right">
            {payment.description}
          </Text>
        </View>

        {payment.payDate && (
          <View className="flex-row justify-between">
            <Text className="text-xs text-gray-600">Ngày thanh toán:</Text>
            <Text className="text-xs text-gray-800">
              {new Date(payment.payDate).toLocaleString("vi-VN")}
            </Text>
          </View>
        )}
      </View>

      {/* Retry Button for Failed */}
      {payment.status === "FAILED" && (
        <TouchableOpacity
          onPress={() => onRetry(payment)}
          className="bg-red-50 p-2 rounded-lg items-center"
        >
          <Text className="text-xs font-semibold text-red-600">Thử thanh toán lại</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default function PaymentHistoryScreen() {
  const params = useLocalSearchParams();

  const invoiceId = params.invoiceId ? Number(params.invoiceId as string) : null;
  const { data: payments, isLoading, refetch } = usePaymentHistory(invoiceId || 0);

  const handleRetry = (payment: PaymentTransaction) => {
    Alert.alert("Thông báo", "Chức năng thanh toán lại sẽ sớm được cập nhật");
  };

  const handleRefresh = async () => {
    await refetch();
    Alert.alert("Thông báo", "Đã cập nhật danh sách giao dịch");
  };

  if (!invoiceId) {
    return (
      <SafeAreaView className="flex-1 bg-[#F3F4F6]">
        <CustomHeader
          title="Lịch sử thanh toán"
          showBackButton
          backgroundColor="#F3F4F6"
        />
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-gray-600">Không tìm thấy thông tin hóa đơn</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F3F4F6]">
      <CustomHeader title="Lịch sử thanh toán" showBackButton backgroundColor="#F3F4F6" />

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {/* Refresh Button */}
        <View className="flex-row justify-end mb-4">
          <TouchableOpacity
            onPress={handleRefresh}
            disabled={isLoading}
            className="flex-row items-center bg-white rounded-lg px-3 py-2 shadow-sm"
          >
            <RefreshCw
              size={16}
              color={isLoading ? "#D1D5DB" : "#E09B6B"}
              style={{ marginRight: 4 }}
            />
            <Text className="text-sm font-semibold text-main">Làm mới</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {isLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator color="#E09B6B" size="large" />
            <Text className="text-gray-500 mt-3">Đang tải...</Text>
          </View>
        ) : payments && payments.length > 0 ? (
          <View>
            <Text className="text-sm font-semibold text-gray-600 mb-3">
              {payments.length} giao dịch
            </Text>
            {payments.map((payment) => (
              <PaymentHistoryCard
                key={payment.id}
                payment={payment}
                onRetry={handleRetry}
              />
            ))}
          </View>
        ) : (
          <View className="py-8 items-center">
            <AlertCircle size={40} color="#D1D5DB" />
            <Text className="text-gray-500 mt-3">Chưa có giao dịch nào</Text>
          </View>
        )}

        {/* Info Box */}
        <View className="bg-blue-50 rounded-lg p-4 mt-6 mb-8">
          <Text className="text-xs font-semibold text-blue-900 mb-2">ℹ️ HƯỚNG DẪN</Text>
          <Text className="text-xs text-blue-800 leading-5">
            • Xem lịch sử tất cả giao dịch thanh toán{"\n"}• Nhấn sao chép để lưu mã giao
            dịch{"\n"}• Hỗ trợ: Liên hệ với bộ phận chăm sóc khách hàng
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
