import * as ImagePicker from "expo-image-picker";
import { Camera, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";

interface BigImageUploadProps {
  value?: string | null;
  onChange?: (image: string | null) => void;
  height?: number;
  label?: string;
  error?: string;
}

export default function BigImageUpload({
  value,
  onChange,
  height = 200,
  label = "Chụp hoặc tải ảnh minh chứng lên",
  error,
}: BigImageUploadProps) {
  // state lưu tỷ lệ ảnh
  const [aspectRatio, setAspectRatio] = useState(4 / 3);

  // tính tỷ lệ ảnh mỗi khi thay đổi
  useEffect(() => {
    if (value) {
      Image.getSize(
        value,
        (width, height) => {
          setAspectRatio(width / height);
        },
        (error) => {
          console.error("Lỗi lấy kích thước ảnh:", error);
        }
      );
    }
  }, [value]);

  const handlePress = () => {
    Alert.alert("Tải ảnh lên", "Bạn muốn chọn ảnh từ đâu?", [
      { text: "Chụp ảnh mới", onPress: openCamera },
      { text: "Chọn từ thư viện", onPress: openLibrary },
      { text: "Hủy", style: "cancel" },
    ]);
  };

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Lỗi quyền", "Vui lòng cấp quyền truy cập Camera.");
      return;
    }
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: false, // Tắt crop để lấy full ảnh
      quality: 0.8,
    });
    if (!result.canceled) onChange?.(result.assets[0].uri);
  };

  const openLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Lỗi quyền", "Vui lòng cấp quyền Thư viện ảnh.");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled) onChange?.(result.assets[0].uri);
  };

  if (value) {
    return (
      <View className="w-full relative rounded-xl overflow-hidden border border-gray-200 bg-black/5">
        <Image
          source={{ uri: value }}
          style={{ width: "100%", aspectRatio: aspectRatio }}
          resizeMode="contain"
        />

        {/* xóa ảnh */}
        <TouchableOpacity
          onPress={() => onChange?.(null)}
          className="absolute top-2 right-2 bg-black/70 p-1.5 rounded-full z-10 shadow-sm"
        >
          <X size={16} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  // chưa có ảnh -> giữ chiều cao cố định
  return (
    <View className="w-full">
      <TouchableOpacity
        onPress={handlePress}
        className="w-full bg-white border border-gray-200 rounded-xl items-center justify-center"
        style={{ height }}
      >
        <View className="w-14 h-14 bg-third rounded-full overflow-hidden items-center justify-center mb-3">
          <Camera size={24} color="#E09B6B" />
        </View>
        <Text className="text-gray-400 text-sm font-medium">{label}</Text>
      </TouchableOpacity>
      {error && <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>}
    </View>
  );
}
