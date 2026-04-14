import CategorySelector from '@/components/feedback/CategorySelector';
import MyButton from '@/components/ui/Button';
import { CustomHeader } from '@/components/ui/CustomHeader';
import { FeedbackService } from '@/services/feedback.service';
import { Block, IssueType } from '@/types/feedback';
import { useMutation } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { ChevronDown, Image as ImageIcon, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateFeedbackScreen() {
  const [selectedType, setSelectedType] = useState<IssueType | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [detailDescription, setDetailDescription] = useState('');

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showFloorModal, setShowFloorModal] = useState(false);

  useEffect(() => {
    FeedbackService.getBlocks().then(setBlocks);
  }, []);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Thông báo', 'Cần cấp quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images' as any,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((asset) => asset.uri);
      setImages([...images, ...newImages].slice(0, 5));
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const submitFeedbackMutation = useMutation({
    mutationFn: async () => {
      type FeedbackPayload = {
        type: IssueType;
        title: string;
        description: string;
        blockId?: number;
        detailLocation: string;
        floor?: number;
      };

      const payload: FeedbackPayload = {
        type: selectedType!,
        title,
        description,
        blockId: selectedBlock?.id,
        detailLocation: detailDescription,
      };

      if (selectedFloor !== null) {
        payload.floor = selectedFloor;
      }

      return FeedbackService.create(payload, images);
    },
    onSuccess: () => {
      Alert.alert('Thành công', 'Đã gửi phản ánh thành công!', [
        { text: 'OK', onPress: () => router.replace('/feedback') },
      ]);
    },

    onError: (error: any) => {
      Alert.alert(
        'Lỗi',
        error?.data?.data?.message ||
          error?.data?.message ||
          error?.message ||
          'Không thể gửi phản ánh, vui lòng thử lại'
      );
    },
  });

  const handleSubmit = () => {
    if (
      !selectedType ||
      !title.trim() ||
      !description.trim() ||
      images.length === 0
    ) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    submitFeedbackMutation.mutate();
  };

  const floors = selectedBlock
    ? Array.from({ length: selectedBlock.totalFloors }, (_, i) => i + 1)
    : [];

  const selectBlock = (block: Block) => {
    setSelectedBlock(block);
    setSelectedFloor(null);
    setShowBlockModal(false);
  };

  const selectFloor = (floor: number) => {
    setSelectedFloor(floor);
    setShowFloorModal(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <CustomHeader title="Tạo phản ánh" />

      <KeyboardAwareScrollView
        enableOnAndroid={true}
        extraScrollHeight={20}
        enableAutomaticScroll={true}
      >
        <View className="p-5">
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-3">
              Phân loại sự cố <Text className="text-red-500">*</Text>
            </Text>
            <CategorySelector
              selectedType={selectedType}
              onSelect={setSelectedType}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Tiêu đề <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              placeholder="VD: Thang máy Block B đứng đột ngột giữa chừng"
              value={title}
              onChangeText={setTitle}
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Vị trí sự cố
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setShowBlockModal(true)}
                className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 flex-row items-center justify-between"
              >
                <Text className="text-gray-800">
                  {selectedBlock ? selectedBlock.name : 'Chọn tòa'}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => selectedBlock && setShowFloorModal(true)}
                disabled={!selectedBlock}
                className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3 flex-row items-center justify-between"
              >
                <Text className="text-gray-800">
                  {selectedFloor ? `Tầng ${selectedFloor}` : 'Chọn tầng'}
                </Text>
                <ChevronDown size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Chi tiết khác (ví dụ: gần phòng 301, gần thang máy)"
              value={detailDescription}
              onChangeText={setDetailDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="mt-2 bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Mô tả chi tiết <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-800"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Ảnh đính kèm (Tối đa 5) <Text className="text-red-500">*</Text>
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {images.map((uri, index) => (
                <View key={index} className="relative w-20 h-20">
                  <Image
                    source={{ uri }}
                    className="w-full h-full rounded-lg"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full items-center justify-center"
                  >
                    <X size={14} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
              {images.length < 5 && (
                <TouchableOpacity
                  onPress={handlePickImage}
                  className="w-20 h-20 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center"
                >
                  <ImageIcon size={24} color="#9CA3AF" />
                  <Text className="text-xs text-gray-500 mt-1">Thêm ảnh</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <MyButton
            className="w-full bg-[#E09B6B] py-4 rounded-lg"
            textClassName="font-bold text-base uppercase"
            onPress={handleSubmit}
            isLoading={submitFeedbackMutation.isPending}
          >
            Gửi phản ánh
          </MyButton>
        </View>
      </KeyboardAwareScrollView>

      <Modal visible={showBlockModal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white p-4 rounded-t-xl">
            <Text className="text-lg font-bold mb-4">Chọn tòa</Text>
            <FlatList
              data={blocks}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => selectBlock(item)}
                  className="py-3 border-b border-gray-200"
                >
                  <Text className="text-gray-800">{item.name} </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setShowBlockModal(false)}
              className="mt-4"
            >
              <Text className="text-center text-red-500">Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showFloorModal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white p-4 rounded-t-xl">
            <Text className="text-lg font-bold mb-4">Chọn tầng</Text>
            <FlatList
              data={floors}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => selectFloor(item)}
                  className="py-3 border-b border-gray-200"
                >
                  <Text className="text-gray-800">Tầng {item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setShowFloorModal(false)}
              className="mt-4"
            >
              <Text className="text-center text-red-500">Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
