import { CustomHeader } from '@/components/ui/CustomHeader';
import { ServiceService } from '@/services/service.service';
import {
  BookingStatus,
  getBookingStatusColor,
  getBookingStatusLabel,
} from '@/types/service';
import { useQuery } from '@tanstack/react-query';
import { differenceInSeconds, format, parseISO } from 'date-fns';
import * as Print from 'expo-print';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import {
  Calendar,
  Clock,
  CreditCard,
  Download,
  Info,
  Share2,
  User,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams();
  const [timeLeft, setTimeLeft] = useState<string>('');

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => ServiceService.getBookingById(Number(id)),
    select: (res) => res.data,
    enabled: !!id,
  });

  useEffect(() => {
    if (booking?.status !== BookingStatus.PENDING || !booking?.expiresAt)
      return;

    const calculateTime = () => {
      const now = new Date();
      const expiry = parseISO(booking?.expiresAt);
      const diff = differenceInSeconds(expiry, now);

      if (diff <= 0) {
        setTimeLeft('Hết hạn');
        return;
      }

      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setTimeLeft(`${m}:${s < 10 ? '0' : ''}${s}`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [booking]);

  if (isLoading) return <ActivityIndicator className="flex-1" />;
  if (!booking) return null;

  const statusLabel = getBookingStatusLabel(booking.status);
  const statusColor = getBookingStatusColor(booking.status);

  const formattedDate = format(parseISO(booking.bookingDate), 'dd/MM/yyyy');
  const formattedCreatedAt = format(
    parseISO(booking.createdAt),
    'HH:mm, dd/MM/yyyy'
  );

  const handleDownloadPDF = async () => {
    const timeSlotsHtml = booking.timestamps
      .map(
        (slot: { startTime: string; endTime: string }) => `
      <div class="time-chip">
        <span class="clock-icon">🕒</span>
        ${slot.startTime} - ${slot.endTime}
      </div>
    `
      )
      .join('');

    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; line-height: 1.6; }
          .container { border: 1px solid #eee; padding: 30px; border-radius: 20px; max-width: 600px; margin: auto; }
          
          .header { text-align: center; margin-bottom: 30px; }
          .brand-name { color: #244B35; font-size: 28px; font-weight: bold; margin-bottom: 5px; }
          .title { font-size: 18px; color: #E09B6B; text-transform: uppercase; letter-spacing: 1px; }
          
          hr { border: 0; border-top: 1px dashed #ccc; margin: 20px 0; }

          .row { display: flex; justify-content: space-between; margin-bottom: 15px; align-items: flex-start; }
          .label { color: #666; font-size: 14px; }
          .value { font-weight: 600; color: #1a1a1a; text-align: right; flex: 1; margin-left: 20px; }
          
          .status-paid { color: #244B35; font-weight: bold; }

          .time-container { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; max-width: 70%; }
          .time-chip { 
            background-color: #244B35; 
            color: white; 
            padding: 6px 12px; 
            border-radius: 8px; 
            font-size: 12px; 
            font-weight: bold;
            display: flex;
            align-items: center;
          }
          .clock-icon { margin-right: 5px; font-size: 10px; }

          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand-name">EMERALD TOWER</div>
            <div class="title">Thông Tin Đặt Chỗ</div>
          </div>

          <div class="row">
            <span class="label">Mã đơn hàng</span>
            <span class="value">#${booking.code}</span>
          </div>

          <div class="row">
            <span class="label">Trạng thái</span>
            <span class="value status-paid">Đã thanh toán</span>
          </div>

          <div class="row">
            <span class="label">Dịch vụ</span>
            <span class="value">#${booking.service.name}</span>
          </div>

          <div class="row">
            <span class="label">Ngày</span>
            <span class="value">#${formattedDate}</span>
          </div>

          <hr />

          <div class="row">
            <span class="label">Thời gian</span>
            <div class="time-container">
              ${timeSlotsHtml}
            </div>
          </div>

          <div class="footer">
            <p>Vui lòng xuất trình phiếu này khi sử dụng dịch vụ.</p>
            <p>Cảm ơn bạn đã tin tưởng chúng tôi!</p>
          </div>
        </div>
      </body>
    </html>
  `;

    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
        });
      } else {
        Alert.alert(
          'Thông báo',
          'Tính năng chia sẻ không khả dụng trên thiết bị này'
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể tạo file PDF');
    }
  };

  const handleShare = async () => {
    try {
      const timeSlots = booking?.timestamps
        .map(
          (t: { startTime: string; endTime: string }) =>
            `${t.startTime}-${t.endTime}`
        )
        .join(', ');
      await Share.share({
        message: `Booking #${booking?.code}\nDịch vụ: ${booking?.service?.name}\nNgày: ${formattedDate}\nGiờ: ${timeSlots}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  // const handleCancel = () => {
  //   Alert.alert(
  //     'Hủy booking',
  //     'Bạn có chắc muốn hủy booking này? Hành động này không thể hoàn tác.',
  //     [
  //       { text: 'Không', style: 'cancel' },
  //       {
  //         text: 'Hủy booking',
  //         style: 'destructive',
  //         onPress: () => {
  //           Alert.alert('Thành công', 'Đã hủy booking');
  //           router.back();
  //         },
  //       },
  //     ]
  //   );
  // };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <CustomHeader title="Chi tiết lịch đặt" />

      {booking.status === BookingStatus.PENDING && booking.expiresAt && (
        <View className="bg-orange-50 px-6 py-3 flex-row items-center border border-orange-100 rounded-xl">
          <Clock size={16} color="#c2410c" />
          <Text className="text-orange-700 text-sm font-medium ml-2">
            Thanh toán trong <Text className="font-bold">{timeLeft}</Text> để
            giữ chỗ
          </Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="p-4 gap-y-4">
          <View
            className="bg-white rounded-2xl p-5 shadow-sm items-center border-b-4"
            style={{ borderBottomColor: statusColor }}
          >
            <View
              className="px-4 py-1.5 rounded-full mb-3"
              style={{ backgroundColor: statusColor + '15' }}
            >
              <Text
                className="text-xs font-black uppercase tracking-widest"
                style={{ color: statusColor }}
              >
                {statusLabel}
              </Text>
            </View>
            <Text className="text-2xl font-black text-gray-900">
              {booking.code}
            </Text>
            <Text className="text-xs text-gray-400 mt-1 font-medium italic">
              Đặt lúc: {formattedCreatedAt}
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="bg-[#244B35]/10 p-2 rounded-lg mr-3">
                <User size={18} color="#244B35" />
              </View>
              <Text className="text-base font-bold text-gray-800">
                Thông tin khách hàng
              </Text>
            </View>

            <View className="bg-gray-50 rounded-xl p-3 gap-y-3">
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">Họ tên</Text>
                <Text className="text-sm font-bold text-gray-800">
                  {booking.resident.fullName}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">Điện thoại</Text>
                <Text className="text-sm font-bold text-gray-800">
                  {booking.resident.phoneNumber}
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <View className="flex-row items-center mb-4">
              <View className="bg-[#244B35]/10 p-2 rounded-lg mr-3">
                <Info size={18} color="#244B35" />
              </View>
              <Text className="text-base font-bold text-gray-800">
                Chi tiết dịch vụ
              </Text>
            </View>

            <View className="gap-y-4">
              <View className="flex-row justify-between items-start">
                <Text className="text-sm text-gray-500">Dịch vụ</Text>
                <Text className="text-sm font-bold text-[#244B35] text-right flex-1 ml-4">
                  {booking.service.name}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">Ngày sử dụng</Text>
                <View className="flex-row items-center">
                  <Calendar size={14} color="#6B7280" />
                  <Text className="text-sm font-bold text-gray-800 ml-1">
                    {formattedDate}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-sm text-gray-500">Thời gian</Text>
                <View className="flex-1 flex-row flex-wrap gap-2 justify-end">
                  {booking.timestamps.map(
                    (
                      slot: { startTime: string; endTime: string },
                      index: number
                    ) => (
                      <View
                        key={index}
                        className="bg-[#244B35] px-3 py-1.5 rounded-lg flex-row items-center"
                      >
                        <Clock size={12} color="white" />
                        <Text className="text-xs font-bold text-white ml-1">
                          {slot.startTime} - {slot.endTime}
                        </Text>
                      </View>
                    )
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* {booking.status === BookingStatus.PAID && (
            <View className="bg-white rounded-2xl p-4 shadow-sm">
              <View className="flex-row items-center mb-4">
                <View className="bg-[#244B35]/10 p-2 rounded-lg mr-3">
                  <CreditCard size={18} color="#244B35" />
                </View>
                <Text className="text-base font-bold text-gray-800">
                  Thanh toán
                </Text>
              </View>

              <View className="gap-y-3">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-500">Phương thức</Text>
                  <Text className="text-sm font-bold text-gray-800">
                    {getPaymentMethodLabel(payment.method)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-gray-500">Lúc</Text>
                  <Text className="text-sm font-medium text-gray-600">
                    {payment.paid_at &&
                      format(new Date(payment.paid_at), 'HH:mm, dd/MM/yyyy')}
                  </Text>
                </View>
              </View>
            </View>
          )} */}

          <View className="bg-[#244B35] rounded-2xl p-5 shadow-md flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-white/70 text-xs font-bold uppercase tracking-wider">
                Tổng thanh toán
              </Text>
              <Text className="text-white text-2xl font-black mt-1">
                {booking.totalPrice.toLocaleString('vi-VN')} đ
              </Text>
            </View>
            <View className="bg-white/20 p-2 rounded-full">
              <CreditCard size={24} color="white" />
            </View>
          </View>

          <View className="gap-y-3 mb-10">
            {booking.status === BookingStatus.PAID && (
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
            )}

            {booking.status === BookingStatus.PENDING && (
              <View className="gap-y-3">
                <TouchableOpacity
                  className="bg-[#E09B6B] py-4 rounded-xl shadow-sm flex-row items-center justify-center"
                  onPress={() =>
                    router.push({
                      pathname: '/service/payment/[id]',
                      params: {
                        id: booking.id,
                        bookingData: JSON.stringify(booking),
                      },
                    } as any)
                  }
                >
                  <CreditCard size={20} color="white" />
                  <Text className="text-white font-black text-base ml-2">
                    Thanh toán ngay
                  </Text>
                </TouchableOpacity>

                {/* <TouchableOpacity
                  onPress={handleCancel}
                  className="bg-red-50 border border-red-100 py-4 rounded-xl flex-row items-center justify-center"
                >
                  <Trash2 size={18} color="#dc2626" />
                  <Text className="text-red-600 font-bold ml-2">
                    Hủy booking này
                  </Text>
                </TouchableOpacity> */}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
