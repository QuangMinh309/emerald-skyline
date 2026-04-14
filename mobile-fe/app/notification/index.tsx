import { showNotificationActionsSheet } from "@/components/notification/NotificationActionSheet";
import NotificationCard from "@/components/notification/NotificationCard";
import NotificationTabs from "@/components/notification/NotificationTabs";
import SummarizeModal from "@/components/notification/SummarizeModal";
import { CustomHeader } from "@/components/ui/CustomHeader";
import { NotificationService } from "@/services/notification.service";
import { Notification } from "@/types/notification";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { CheckCircle, Search, Trash2 } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationScreen() {
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSummarizeModal, setShowSummarizeModal] = useState(false);
  const [
    selectedNotificationForSummarize,
    setSelectedNotificationForSummarize,
  ] = useState<Notification | null>(null);
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const response = await NotificationService.getMine();
      return response.data;
    },
  });

  const readAllMutation = useMutation({
    mutationFn: NotificationService.readAll,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const hideAllMutation = useMutation({
    mutationFn: NotificationService.hideAll,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const toggleReadMutation = useMutation({
    mutationFn: (id: number) => NotificationService.toggleRead(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const hideMutation = useMutation({
    mutationFn: (id: number) => NotificationService.hide(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const filteredNotifications = notifications.filter((noti: Notification) => {
    const matchesTab = activeTab === "ALL" || noti.type === activeTab;

    const matchesSearch =
      searchQuery === "" ||
      noti.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      noti.content.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const sortedNotifications = [...filteredNotifications].sort((a, b) => {
    if (a.is_read === b.is_read) {
      return (
        new Date(b?.published_at || b.created_at).getTime() -
        new Date(a?.published_at || a.created_at).getTime()
      );
    }
    return a.is_read ? 1 : -1;
  });

  const handlePressNotification = (notification: Notification) => {
    router.push({
      pathname: "/notification/[id]",
      params: { id: notification.id },
    });
  };

  const handlePressMenu = (notification: Notification) => {
    showNotificationActionsSheet({
      notification,
      onToggleRead: async () =>
        await toggleReadMutation.mutateAsync(notification.id),
      onHide: async () => await hideMutation.mutateAsync(notification.id),
      onSummarize: () => {
        setSelectedNotificationForSummarize(notification);
        setShowSummarizeModal(true);
      },
    });
  };

  const handleReadAll = () => readAllMutation.mutate();
  const handleHideAll = () => hideAllMutation.mutate();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <CustomHeader
        title="Thông báo"
        backgroundColor="bg-[#244B35]"
        textColor="text-white"
        iconColor="white"
        showBorder={false}
      >
        <View className="bg-white/20 backdrop-blur-lg rounded-full flex-row items-center px-4 py-2">
          <Search size={20} color="white" />
          <TextInput
            placeholder="Tìm kiếm thông báo..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-2 text-white"
          />
        </View>
      </CustomHeader>

      <View className="pt-4">
        <NotificationTabs activeTab={activeTab} onChangeTab={setActiveTab} />
      </View>

      <View className="flex-row justify-end px-5 mb-2">
        <TouchableOpacity
          onPress={handleReadAll}
          className="flex-row items-center mr-4"
        >
          <CheckCircle size={16} color="#244B35" />
          <Text className="ml-1 text-sm text-gray-700">Đọc tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleHideAll}
          className="flex-row items-center"
        >
          <Trash2 size={16} color="#EF4444" />
          <Text className="ml-1 text-sm text-red-500">Xóa tất cả</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <View className="px-5 pb-4">
          {isLoading ? (
            <ActivityIndicator className="mt-10" color="#244B35" />
          ) : sortedNotifications.length === 0 ? (
            <View className="py-10 items-center">
              <Text className="text-gray-500">Không có thông báo nào</Text>
            </View>
          ) : (
            sortedNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onPress={() => handlePressNotification(notification)}
                onPressMenu={() => handlePressMenu(notification)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Summarize Modal */}
      <SummarizeModal
        visible={showSummarizeModal}
        initialText={selectedNotificationForSummarize?.content || ""}
        onClose={() => setShowSummarizeModal(false)}
      />
    </SafeAreaView>
  );
}
