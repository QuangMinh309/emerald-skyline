import { Notification } from "@/types/notification";
import { ActionSheetIOS, Alert, Platform } from "react-native";

interface NotificationActionsSheetProps {
  notification?: Notification;
  onToggleRead: () => Promise<void>;
  onHide: () => Promise<void>;
  onSummarize?: () => void;
  onClose?: () => void;
}

export function showNotificationActionsSheet({
  notification,
  onToggleRead,
  onHide,
  onSummarize,
  onClose,
}: NotificationActionsSheetProps) {
  const isRead = notification?.is_read ?? false;
  const toggleLabel = isRead ? "Đánh dấu chưa đọc" : "Đánh dấu đã đọc";

  const options = ["Tóm tắt thông báo", toggleLabel, "Xóa", "Hủy"];

  const handleAction = async (index: number) => {
    if (index === 0) {
      onSummarize?.();
    } else if (index === 1) {
      await onToggleRead();
    } else if (index === 2) {
      Alert.alert("Xác nhận", "Bạn có chắc muốn xóa?", [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => await onHide(),
        },
      ]);
    }
    if (onClose) onClose();
  };

  if (Platform.OS === "ios") {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        destructiveButtonIndex: 2,
        cancelButtonIndex: 3,
      },
      handleAction,
    );
  } else {
    Alert.alert(
      "Tùy chọn",
      "",
      [
        { text: "Tóm tắt thông báo", onPress: () => handleAction(0) },
        { text: toggleLabel, onPress: () => handleAction(1) },
        { text: "Xóa", style: "destructive", onPress: () => handleAction(2) },
        { text: "Hủy", style: "cancel", onPress: () => onClose?.() },
      ],
      {
        cancelable: true,
        onDismiss: () => onClose?.(),
      },
    );
  }
}
