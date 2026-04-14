import { CustomHeader } from '@/components/ui/CustomHeader';
import { getPaymentMethodLabel, PaymentMethod } from '@/types/service';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { CheckCircle, Download, Share2 } from 'lucide-react-native';
import {
  Alert,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentSuccessScreen() {
  const { bookingCode, serviceName, date, slots, total, method, customerName } =
    useLocalSearchParams();

  const formattedDate = date
    ? format(parseISO(date as string), 'dd/MM/yyyy', { locale: vi })
    : '---';

  const parsedSlots = slots ? JSON.parse(slots as string) : [];

  const totalAmount = Number(total);
  const paidAt = format(new Date(), 'HH:mm, dd/MM/yyyy', { locale: vi });

  const handleDownloadPDF = () => {
    Alert.alert('Thông báo', 'Tính năng tải PDF đang được phát triển');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Booking thành công!\nMã: ${bookingCode}\nKhách hàng: ${customerName}\nDịch vụ: ${serviceName}\nNgày: ${formattedDate}\nTổng tiền: ${totalAmount.toLocaleString('vi-VN')} đ`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleBackToHome = () => {
    router.replace('/(tabs)/home' as Href);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <CustomHeader title="Kết quả" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="p-5">
          <View className="bg-white rounded-2xl p-6 mb-4 items-center">
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
              <CheckCircle size={48} color="#10B981" strokeWidth={2} />
            </View>
            <Text className="text-2xl font-bold text-gray-900 mb-2">
              Thanh toán thành công
            </Text>
            <Text className="text-sm text-gray-600 text-center">
              Thanh toán lúc: {paidAt}
            </Text>
            <View className="bg-green-50 px-4 py-2 rounded-full mt-3">
              <Text className="text-green-700 font-bold text-xl">
                {totalAmount.toLocaleString('vi-VN')} đ
              </Text>
            </View>
          </View>

          <View className="bg-white rounded-lg p-4 mb-4">
            <Text className="text-base font-bold text-gray-800 mb-3">
              Thông tin booking
            </Text>

            <View className="space-y-2">
              <View className="py-2 border-b border-gray-100">
                <Text className="text-xs text-gray-500 mb-1">Mã booking</Text>
                <Text className="text-sm font-bold text-gray-900">
                  {bookingCode}
                </Text>
              </View>

              <View className="py-2 border-b border-gray-100">
                <Text className="text-xs text-gray-500 mb-1">Khách hàng</Text>
                <Text className="text-sm font-semibold text-gray-800">
                  {customerName}
                </Text>
              </View>

              <View className="py-2 border-b border-gray-100">
                <Text className="text-xs text-gray-500 mb-1">Dịch vụ</Text>
                <Text className="text-sm font-semibold text-gray-800">
                  {serviceName}
                </Text>
              </View>

              <View className="py-2 border-b border-gray-100">
                <Text className="text-xs text-gray-500 mb-1">Ngày</Text>
                <Text className="text-sm font-semibold text-gray-800">
                  {formattedDate}
                </Text>
              </View>

              <View className="py-2 border-b border-gray-100">
                <Text className="text-xs text-gray-500 mb-1">Thời gian</Text>
                {parsedSlots.map((slot: any, index: number) => (
                  <Text
                    key={index}
                    className="text-sm font-semibold text-gray-800"
                  >
                    {slot.startTime} - {slot.endTime}
                  </Text>
                ))}
              </View>

              <View className="py-2">
                <Text className="text-xs text-gray-500 mb-1">
                  Phương thức thanh toán
                </Text>
                <Text className="text-sm font-semibold text-gray-800">
                  {getPaymentMethodLabel(method as PaymentMethod)}
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <Text className="text-sm text-blue-800">
              📌 Lưu ý: Vui lòng xuất trình vé điện tử/vé giấy/cung cấp sđt cho
              bảo vệ/tiếp tân để sử dụng dịch vụ.
            </Text>
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleShare}
              className="flex-1 bg-[#E09B6B] py-4 rounded-xl flex-row items-center justify-center shadow-sm"
            >
              <Share2 size={18} color="white" className="mr-2" />
              <Text className="text-white font-bold ml-2">Chia sẻ</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDownloadPDF}
              className="flex-1 bg-white border-2 border-[#244B35] py-4 rounded-xl flex-row items-center justify-center"
            >
              <Download size={18} color="#244B35" className="mr-2" />
              <Text className="text-[#244B35] font-bold ml-2">Tải PDF</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleBackToHome}
            className="bg-[#244B35] py-4 rounded-lg mt-4"
          >
            <Text className="text-white text-center font-bold text-base">
              Về trang chủ
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
