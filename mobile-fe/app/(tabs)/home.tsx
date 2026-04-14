import { useResidentProfile } from "@/hooks/useResident";
import { FeedbackService } from "@/services/feedback.service";
import { getResidentInvoices } from "@/services/invoice.service";
import { NotificationService } from "@/services/notification.service";
import { ServiceService } from "@/services/service.service";
import {
    getNotiTypeColor,
    getNotiTypeLabel,
    Notification,
} from "@/types/notification";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { router } from "expo-router";
import {
    Bell,
    Building,
    CreditCard,
    MessageSquare,
    Search,
    Vote,
    Wrench,
} from "lucide-react-native";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  // Fetch resident profile data
  const { data: profile } = useResidentProfile();

  const user = {
    name: profile?.fullName?.toUpperCase() || "Tài khoản",
    avatar: profile?.imageUrl || "https://i.pravatar.cc/150?img=12",
    hasUnreadNotifications: true,
  };

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["notifications-home"],
    queryFn: async () => {
      const response = await NotificationService.getMine();
      return response.data;
    },
    select: (data) => {
      return data
        .sort(
          (a, b) =>
            new Date(b?.published_at || b.created_at).getTime() -
            new Date(a?.published_at || a.created_at).getTime(),
        )
        .slice(0, 2);
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch invoices
  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices-home"],
    queryFn: async () => {
      try {
        const response = await getResidentInvoices();
        return response || [];
      } catch (error) {
        console.error("Failed to fetch invoices:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Check if current month's meter reading has been submitted
  const hasCurrentMonthMeterReading = () => {
    // Get current month's first day
    const today = new Date();
    const currentMonthStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
    );

    // Find invoice for current month
    const currentInvoice = invoices.find((inv: any) => {
      const invoicePeriod = new Date(inv.period);
      return (
        invoicePeriod.getFullYear() === currentMonthStart.getFullYear() &&
        invoicePeriod.getMonth() === currentMonthStart.getMonth()
      );
    });

    // If no invoice exists for current month, user should submit
    if (!currentInvoice) {
      return false;
    }

    // If invoice exists, check if it has meter readings submitted
    // The invoice is from client submission, so if it exists = meter reading was submitted
    return true;
  };

  const shouldShowMeterReadingPrompt = !hasCurrentMonthMeterReading();

  // Fetch feedback
  const { data: feedbacks = [] } = useQuery({
    queryKey: ["feedbacks-home"],
    queryFn: async () => {
      try {
        const response = await FeedbackService.getMine();
        return response || [];
      } catch (error) {
        console.error("Failed to fetch feedbacks:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch services
  const { data: servicesData = { data: [] } } = useQuery({
    queryKey: ["services-home"],
    queryFn: async () => {
      try {
        const response = await ServiceService.get();
        return response;
      } catch (error) {
        console.error("Failed to fetch services:", error);
        return { data: [] };
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const unreadCount = notifications.filter((noti) => !noti.is_read).length;

  // Build important items from API data
  const importantItems = [
    {
      id: 1,
      icon: CreditCard,
      title: `${invoices.length || 0} hóa đơn`,
      subtitle:
        invoices.length > 0
          ? `Hạn nộp gần nhất: ${new Date(invoices[0]?.dueDate || Date.now()).toLocaleDateString("vi-VN")}`
          : "Không có hóa đơn",
      status:
        invoices.filter((inv: any) => inv.status === "pending").length > 0
          ? "Thanh toán"
          : "Đã thanh toán",
      statusColor:
        invoices.filter((inv: any) => inv.status === "pending").length > 0
          ? "bg-green-600"
          : "bg-blue-600",
      route: "/(tabs)/payment",
    },
    {
      id: 2,
      icon: MessageSquare,
      title: `${feedbacks.length || 0} phản ánh`,
      subtitle:
        feedbacks.length > 0
          ? `Cập nhập lần cuối: ${formatDistanceToNow(new Date(feedbacks[0]?.createdAt), { addSuffix: true, locale: vi })}`
          : "Không có phản ánh",
      status:
        feedbacks.filter((fb: any) => fb.status !== "resolved").length > 0
          ? "Đang xử lý"
          : "Đã hoàn thành",
      statusColor:
        feedbacks.filter((fb: any) => fb.status !== "resolved").length > 0
          ? "bg-orange-500"
          : "bg-green-600",
      route: "/feedback",
    },
    {
      id: 3,
      icon: Wrench,
      title: `${servicesData.data.length || 0} dịch vụ`,
      subtitle:
        servicesData.data.length > 0
          ? `Tổng tiền: ${new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(
              servicesData.data.reduce(
                (sum: number, service: any) => sum + (service.price || 0),
                0,
              ),
            )}`
          : "Không có dịch vụ",
      status: "Quản lý",
      statusColor: "bg-orange-500",
      route: "/(tabs)/service",
    },
  ];

  // Shortcuts
  const shortcuts = [
    {
      id: 1,
      icon: Wrench,
      label: "Ví dịch vụ",
      route: "/service/bookings",
    },
    {
      id: 2,
      icon: MessageSquare,
      label: "Phản ánh",
      route: "/feedback",
    },
    {
      id: 3,
      icon: Building,
      label: "Thông tin của tôi",
      route: "/(tabs)/information",
    },
    {
      id: 4,
      icon: Vote,
      label: "Biểu quyết",
      route: "/voting",
    },
  ];

  const handlePressNotification = (id: number) => {
    router.push({
      pathname: "/notification/[id]",
      params: { id },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-[#244B35] pt-8 pb-8">
        <View className="px-5 flex-row items-center justify-between">
          <Text className="text-sm text-white/80">Emerald Skyline</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity>
              <Search size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/notification" as any)}
              className="relative"
            >
              <Bell size={24} color="white" />
              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View className="px-5 -mt-4 mb-6">
          <View className="bg-white rounded-2xl shadow-sm p-5">
            <View className="flex-row items-center mb-4">
              <Image
                source={{ uri: user.avatar }}
                className="w-14 h-14 rounded-full"
              />
              <View className="flex-1 ml-4">
                <Text className="text-xs text-gray-500 mb-1">
                  Welcome back!
                </Text>
                <Text className="text-lg font-bold text-gray-900">
                  {user.name}
                </Text>
              </View>
            </View>

            {shouldShowMeterReadingPrompt && (
              <>
                <Text className="text-sm text-red-600 mb-3">
                  Đã đến hạn nhập chỉ số điện, nước! Vui lòng thực hiện
                </Text>

                <TouchableOpacity
                  onPress={() => router.push("/payment/input-meter" as any)}
                  className="bg-[#F5F5DC] py-3 rounded-lg"
                >
                  <Text className="text-center text-[#244B35] font-semibold">
                    + Thêm chỉ số
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Latest Notifications Section */}
        <View className="px-5 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-bold text-[#D2691E]">Mới</Text>
            <TouchableOpacity
              onPress={() => router.push("/notification" as any)}
            >
              <Text className="text-sm text-gray-600">Xem tất cả →</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator color="#244B35" />
          ) : notifications.length === 0 ? (
            <Text className="text-gray-500">Không có thông báo mới</Text>
          ) : (
            notifications.map((noti) => {
              const timeAgo = formatDistanceToNow(
                new Date(noti?.published_at || noti.created_at),
                {
                  addSuffix: true,
                  locale: vi,
                },
              );
              const typeColor = getNotiTypeColor(noti.type);
              return (
                <TouchableOpacity
                  key={noti.id}
                  onPress={() => handlePressNotification(noti.id)}
                  className="bg-white rounded-lg p-4 mb-3 shadow-sm"
                >
                  <View className="flex-row items-start justify-between mb-2">
                    <Text className="text-base font-semibold text-gray-800 flex-1">
                      {noti.title}
                    </Text>
                    <View
                      className="px-2 py-1 rounded"
                      style={{ backgroundColor: typeColor + "20" }}
                    >
                      <Text
                        className="text-xs font-medium"
                        style={{ color: typeColor }}
                      >
                        {getNotiTypeLabel(noti.type)}
                      </Text>
                    </View>
                    {noti.is_urgent && (
                      <View className="ml-2">
                        <Text className="text-red-500 text-lg">ⓘ</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-xs text-gray-500">{timeAgo}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Important Items Section */}
        <View className="px-5 mb-6">
          <Text className="text-base font-bold text-[#D2691E] mb-3">
            Quan trọng
          </Text>

          {importantItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => router.push(item.route as any)}
              className="bg-white rounded-lg p-4 mb-3 shadow-sm flex-row items-center"
            >
              <View className="bg-gray-100 p-3 rounded-lg">
                <item.icon size={24} color="#244B35" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-base font-semibold text-gray-800 mb-1">
                  {item.title}
                </Text>
                <Text className="text-xs text-gray-600">{item.subtitle}</Text>
              </View>
              <View className={`${item.statusColor} px-3 py-1.5 rounded-lg`}>
                <Text className="text-xs text-white font-medium">
                  {item.status}
                </Text>
              </View>
              <Text className="text-gray-400 ml-2">→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Shortcuts Section */}
        <View className="px-5 pb-6">
          <Text className="text-base font-bold text-[#D2691E] mb-3">
            Shortcuts
          </Text>

          <View className="flex-row flex-wrap gap-3">
            {shortcuts.map((shortcut) => (
              <TouchableOpacity
                key={shortcut.id}
                onPress={() => router.push(shortcut.route as any)}
                className="bg-white rounded-lg p-4 items-center justify-center shadow-sm"
                style={{ width: "47%" }}
              >
                <View className="bg-gray-100 p-4 rounded-full mb-3">
                  <shortcut.icon size={28} color="#244B35" />
                </View>
                <Text className="text-sm text-gray-800 text-center">
                  {shortcut.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
