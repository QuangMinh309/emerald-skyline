import { useSummarize } from "@/hooks/useSummarize";
import { EventDetail } from "@/types/summarize";
import { AlertCircle, Clock, MapPin, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface SummarizeModalProps {
  visible: boolean;
  initialText?: string;
  onClose: () => void;
}

export default function SummarizeModal({
  visible,
  initialText = "",
  onClose,
}: SummarizeModalProps) {
  const [text, setText] = useState(initialText);
  const [showResult, setShowResult] = useState(false);
  const { isLoading, error, result, summarize, reset } = useSummarize();

  // Cập nhật text khi initialText thay đổi
  useEffect(() => {
    if (visible) {
      setText(initialText);
      reset();
      setShowResult(false);
    }
  }, [visible, initialText, reset]);

  // Hiển thị error khi có
  useEffect(() => {
    if (error) {
      Alert.alert("Lỗi", error);
    }
  }, [error]);

  const handleSummarize = async () => {
    const trimmedText = text.trim();

    if (trimmedText.length < 10) {
      Alert.alert("Lỗi", "Vui lòng nhập ít nhất 10 ký tự để tóm tắt.");
      return;
    }

    try {
      await summarize(trimmedText);
      setShowResult(true);
    } catch (err) {
      // Error được xử lý trong hook
      console.error("Summarize error:", err);
    }
  };

  const handleReset = () => {
    setText(initialText);
    reset();
    setShowResult(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleCopyText = (content: string) => {
    // Placeholder for clipboard functionality
    // In real app, use react-native-clipboard or similar
    Alert.alert(
      "Thông báo",
      "Đã sao chép: " + content.substring(0, 30) + "...",
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 bg-white mt-12 rounded-t-3xl overflow-hidden flex flex-col">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">
              Tóm tắt thông báo
            </Text>
            <TouchableOpacity onPress={handleClose} className="p-2">
              <X size={24} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            className="flex-1 px-5 py-4"
            showsVerticalScrollIndicator={false}
          >
            {!showResult ? (
              <>
                {/* Input Section */}
                <View className="mb-6">
                  <Text className="text-base font-semibold text-gray-900 mb-2">
                    Nội dung cần tóm tắt
                  </Text>
                  <TextInput
                    multiline
                    numberOfLines={8}
                    value={text}
                    onChangeText={setText}
                    placeholder="Dán hoặc nhập văn bản thông báo dài..."
                    placeholderTextColor="#9CA3AF"
                    editable={!isLoading}
                    className="bg-gray-100 rounded-lg p-4 text-gray-900 text-base border border-gray-200"
                    style={{ minHeight: 160 }}
                  />
                  <Text className="text-xs text-gray-500 mt-2">
                    {text.length} ký tự
                  </Text>
                </View>

                {/* Instructions */}
                <View className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
                  <View className="flex-row">
                    <AlertCircle
                      size={16}
                      color="#2563EB"
                      className="mr-2 mt-0.5"
                    />
                    <Text className="flex-1 text-xs text-blue-900">
                      Công cụ AI sẽ trích xuất các sự kiện quan trọng từ văn bản
                      và tổng hợp thành danh sách dễ đọc.
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                {/* Result Section */}
                <View className="mb-4">
                  <Text className="text-xl font-semibold text-gray-900 mb-3">
                    Kết quả tóm tắt ({result?.events?.length || 0} sự kiện)
                  </Text>

                  {result?.events && result.events.length > 0 ? (
                    <View className="space-y-3">
                      {result.events.map(
                        (event: EventDetail, index: number) => (
                          <TouchableOpacity
                            key={index}
                            className="bg-white border border-gray-200 rounded-lg p-4 active:bg-gray-50"
                            onPress={() => handleCopyText(event.note)}
                          >
                            <Text className="text-xl font-semibold text-gray-900 mb-3">
                              {event.event_name}
                            </Text>

                            <View className="space-y-2 mb-2">
                              {event.time && (
                                <View className="flex-row items-start">
                                  <Clock
                                    size={14}
                                    color="#6B7280"
                                    className="mr-2 mt-0.5"
                                  />
                                  <Text className="flex-1 text-base text-gray-600 ml-2">
                                    <Text className="font-semibold">
                                      Thời gian:
                                    </Text>{" "}
                                    {event.time}
                                  </Text>
                                </View>
                              )}

                              {event.location && (
                                <View className="flex-row items-start">
                                  <MapPin
                                    size={14}
                                    color="#6B7280"
                                    className="mr-2 mt-0.5"
                                  />
                                  <Text className="flex-1 text-base text-gray-600 ml-2">
                                    <Text className="font-semibold">
                                      Địa điểm:
                                    </Text>{" "}
                                    {event.location}
                                  </Text>
                                </View>
                              )}

                              {event.note && (
                                <View className="mb-2 mt-2">
                                  <Text className="text-base font-semibold text-gray-700 mb-1">
                                    Hành động cần làm:
                                  </Text>
                                  <Text className="text-base text-gray-600 leading-4">
                                    {event.note}
                                  </Text>
                                </View>
                              )}
                            </View>
                          </TouchableOpacity>
                        ),
                      )}
                    </View>
                  ) : (
                    <View className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <Text className="text-base text-yellow-900">
                        Không tìm thấy sự kiện nào trong văn bản. Vui lòng kiểm
                        tra lại nội dung.
                      </Text>
                    </View>
                  )}

                  <View className="mt-4 bg-gray-50 rounded-lg p-3">
                    <Text className="text-base text-gray-600">
                      <Text className="font-semibold">Độ dài gốc:</Text>{" "}
                      {result?.original_length} ký tự
                    </Text>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer Actions */}
          <View className="px-5 py-4 border-t border-gray-200 bg-gray-50">
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleReset}
                disabled={isLoading}
                className="flex-1 bg-white border border-gray-300 rounded-lg py-3 items-center"
              >
                <Text className="text-sm font-semibold text-gray-700">
                  {showResult ? "Tóm tắt lại" : "Xóa"}
                </Text>
              </TouchableOpacity>

              {!showResult ? (
                <TouchableOpacity
                  onPress={handleSummarize}
                  disabled={isLoading || text.trim().length < 10}
                  className={`flex-1 rounded-lg py-3 items-center flex-row justify-center gap-2 ${
                    isLoading || text.trim().length < 10
                      ? "bg-gray-300"
                      : "bg-blue-600"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <ActivityIndicator color="white" />
                      <Text className="text-sm font-semibold text-white ml-2">
                        Đang xử lý...
                      </Text>
                    </>
                  ) : (
                    <Text className="text-sm font-semibold text-white">
                      Tóm tắt
                    </Text>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleClose}
                  className="flex-1 bg-green-600 rounded-lg py-3 items-center"
                >
                  <Text className="text-sm font-semibold text-white">Đóng</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
