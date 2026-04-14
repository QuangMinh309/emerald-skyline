import { showNotificationActionsSheet } from "@/components/notification/NotificationActionSheet";
import SummarizeModal from "@/components/notification/SummarizeModal";
import { CustomHeader } from "@/components/ui/CustomHeader";
import { NotificationService } from "@/services/notification.service";
import { getNotiTypeColor, getNotiTypeLabel } from "@/types/notification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { router, useLocalSearchParams } from "expo-router";
import {
  AlertCircle,
  Clock,
  Download,
  MapPin,
  MoreVertical,
  Sparkles,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [showSummarizeModal, setShowSummarizeModal] = useState(false);

  const { data: notification, isLoading } = useQuery({
    queryKey: ["notification", id],
    queryFn: async () => {
      const response = await NotificationService.getById(Number(id));
      return response.data;
    },
    enabled: !!id,
  });

  const toggleReadMutation = useMutation({
    mutationFn: () => NotificationService.toggleRead(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification", id] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const hideMutation = useMutation({
    mutationFn: () => NotificationService.hide(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      if (router.canGoBack()) {
        router.back();
      }
    },
  });

  if (isLoading) return <ActivityIndicator className="flex-1" />;

  if (!notification) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text>Không tìm thấy thông báo</Text>
        </View>
      </SafeAreaView>
    );
  }

  const typeColor = getNotiTypeColor(notification.type);
  const typeLabel = getNotiTypeLabel(notification.type);

  const formattedDate = format(
    new Date(notification?.published_at || notification.created_at),
    "HH:mm, 'ngày' dd/MM/yyyy",
    { locale: vi },
  );

  const handleDownload = (url: string) => {
    Linking.openURL(url);
  };

  const handlePressMenu = () => {
    showNotificationActionsSheet({
      notification,
      onToggleRead: async () => await toggleReadMutation.mutateAsync(),
      onHide: async () => await hideMutation.mutateAsync(),
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <CustomHeader
        title="Chi tiết"
        rightComponent={
          <TouchableOpacity onPress={handlePressMenu} className="p-2">
            <MoreVertical size={24} color="#244B35" />
          </TouchableOpacity>
        }
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-4">
          <View className="flex-row items-center mb-4">
            <View
              className="px-3 py-1.5 rounded-full"
              style={{ backgroundColor: typeColor + "20" }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: typeColor }}
              >
                {typeLabel}
              </Text>
            </View>
            {notification.is_urgent && (
              <View className="flex-row items-center ml-3">
                <AlertCircle size={16} color="#EF4444" />
                <Text className="text-sm font-semibold text-red-500 ml-1">
                  Khẩn cấp
                </Text>
              </View>
            )}
          </View>

          <Text className="text-xl font-bold text-gray-900 mb-4">
            {notification.title}
          </Text>

          {/* Summarize Button */}
          <TouchableOpacity
            onPress={() => setShowSummarizeModal(true)}
            className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4 mb-4 flex-row items-center"
          >
            <Sparkles size={20} color="#4F46E5" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-semibold text-indigo-900">
                Tóm tắt thông báo
              </Text>
              <Text className="text-xs text-indigo-700 mt-0.5">
                Sử dụng AI để trích xuất thông tin quan trọng
              </Text>
            </View>
          </TouchableOpacity>

          <View className="bg-white rounded-lg p-4 mb-4">
            <View className="flex-row items-center mb-3">
              <Clock size={16} color="#6B7280" />
              <Text className="text-sm text-gray-600 ml-2">
                {formattedDate}
              </Text>
            </View>

            {notification.target_blocks.length > 0 && (
              <View className="flex-row items-start">
                <MapPin size={16} color="#6B7280" className="mt-0.5" />
                <View className="flex-1 ml-2">
                  <Text className="text-sm text-gray-600">
                    Áp dụng cho:{" "}
                    {notification.target_blocks.map((b) => b.name).join(", ")}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View className="bg-white rounded-lg p-4 mb-4">
            <Text className="text-base text-gray-800 leading-7 whitespace-pre-line">
              {notification.content}
            </Text>
          </View>

          {/* Files */}
          {notification.file_urls.length > 0 && (
            <View className="bg-white rounded-lg p-4 mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-3">
                Tài liệu đính kèm
              </Text>
              {notification.file_urls.map((url, index) => {
                const fileName =
                  url.split("/").pop()?.split("?")[0] ||
                  `Tài liệu ${index + 1}`;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleDownload(url)}
                    className="flex-row items-center border border-gray-300 rounded-lg py-3 px-4 mb-2"
                  >
                    <Download size={20} color="#374151" />
                    <Text className="text-sm text-gray-700 ml-3 flex-1 font-medium">
                      {fileName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Text className="text-xs text-blue-700">
              Thông báo đã được gửi qua: {notification.channels.join(", ")}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Summarize Modal */}
      <SummarizeModal
        visible={showSummarizeModal}
        initialText={notification.content}
        onClose={() => setShowSummarizeModal(false)}
      />
    </SafeAreaView>
  );
}
