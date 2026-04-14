import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Plus, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, FlatList, Image, Pressable, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface Props {
  value?: string[];
  onChange?: (images: string[]) => void;
  max?: number;
  error?: string;
}

export default function MyMultiImageUpload({
  value = [],
  onChange,
  max = 5,
  error,
}: Props) {
  const [images, setImages] = useState<string[]>(value);

  // Scale animation for Add button
  const addScale = useSharedValue(1);
  const addStyle = useAnimatedStyle(() => ({
    transform: [{ scale: addScale.value }],
  }));

  const animateAddPress = () => {
    addScale.value = withTiming(0.92, { duration: 90 }, () => {
      addScale.value = withTiming(1, { duration: 90 });
    });
  };

  const cropImage = async (uri: string, width: number, height: number) => {
    const cropped = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          crop: {
            originX: 0,
            originY: 0,
            width,
            height,
          },
        },
      ],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

    return cropped.uri;
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: max - images.length,
    });

    if (result.canceled) return;

    let processed: string[] = [];

    for (const item of result.assets) {
      const cropped = await cropImage(item.uri, item.width, item.height);
      processed.push(cropped);
    }

    const updated = [...images, ...processed];

    setImages(updated);
    onChange?.(updated);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();

    if (perm.status !== "granted") {
      Alert.alert("Không có quyền", "Ứng dụng cần quyền camera để chụp ảnh.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (result.canceled) return;

    const img = result.assets[0];
    const cropped = await cropImage(img.uri, img.width, img.height);

    const updated = [...images, cropped];
    setImages(updated);
    onChange?.(updated);
  };

  const chooseSource = () => {
    Alert.alert("Thêm ảnh", "Chọn nguồn ảnh", [
      { text: "Chụp ảnh", onPress: takePhoto },
      { text: "Chọn từ thư viện", onPress: pickFromGallery },
      { text: "Hủy", style: "cancel" },
    ]);
  };

  const removeImage = (uri: string) => {
    const updated = images.filter((img) => img !== uri);
    setImages(updated);
    onChange?.(updated);
  };

  return (
    <View className="w-full">
      <FlatList
        horizontal
        data={[...images, "add"]}
        keyExtractor={(item) => item}
        renderItem={({ item }) =>
          item === "add" ? (
            images.length < max ? (
              <Animated.View style={[addStyle]}>
                <Pressable
                  onPress={() => {
                    animateAddPress();
                    chooseSource();
                  }}
                  className="w-24 h-24  rounded-xl justify-center items-center "
                  style={{
                    borderStyle: "dashed",
                    borderWidth: 1,
                    borderColor: "#244B35",
                  }}
                >
                  <Plus size={28} color="#244B35" />
                </Pressable>
              </Animated.View>
            ) : null
          ) : (
            <Animated.View
              entering={FadeIn.duration(180)}
              exiting={FadeOut.duration(150)}
              className="relative mr-3"
            >
              <Image
                source={{ uri: item }}
                className="w-24 h-24 rounded-xl"
                resizeMode="cover"
              />

              <Pressable
                onPress={() => removeImage(item)}
                className="absolute top-1 right-1 bg-black/60 p-1 rounded-full"
              >
                <Trash2 size={14} color="white" />
              </Pressable>
            </Animated.View>
          )
        }
        showsHorizontalScrollIndicator={false}
      />
      {error && <Text className="text-red-500 mt-1 text-sm">{error}</Text>}
    </View>
  );
}
