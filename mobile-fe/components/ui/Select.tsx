import { cn } from "@/utils/cn";
import { Check, ChevronDown, Search, X } from "lucide-react-native";
import { useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface SelectItem {
  label: string;
  value: string | number;
}

interface SelectProps {
  value?: string | number;
  placeholder?: string;
  items: SelectItem[];
  error?: string;
  disabled?: boolean;
  onSelect?: (value: string | number) => void;
  className?: string;
  searchable?: boolean;
}

export default function MySelect({
  value,
  placeholder = "Chọn...",
  items,
  error,
  disabled,
  onSelect,
  className,
  searchable = true,
}: SelectProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");

  const selectedItem = items.find((x) => x.value === value);
  const selectedLabel = selectedItem ? selectedItem.label : placeholder;

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpen = () => {
    if (disabled) return;
    setVisible(true);
  };

  const handleSelect = (val: string | number) => {
    onSelect && onSelect(val);
    setVisible(false);
    setSearch("");
  };

  return (
    <>
      {/* giao diện chưa bấm */}
      <View className={className}>
        <Pressable
          onPress={handleOpen}
          className={cn(
            "flex-row items-center justify-between border rounded-lg px-3 py-3 bg-white",
            error ? "border-red-500" : "border-[#D9D9D9]",
            disabled && "opacity-50 bg-gray-100",
          )}
        >
          <Text
            className={cn(
              "text-base flex-1 mr-2",
              selectedItem ? "text-[#244B35] font-medium" : "text-gray-400",
            )}
            numberOfLines={1}
          >
            {selectedLabel}
          </Text>
          <ChevronDown size={20} color="#6B7280" />
        </Pressable>
        {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
      </View>

      {/* hiển thị khi bấm vào */}
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-black/50 justify-end">
          {/* vùng tối bấm vào để tắt */}
          <Pressable className="flex-1" onPress={() => setVisible(false)} />

          <View className="bg-white rounded-t-3xl max-h-[80%] w-full shadow-xl">
            {/* header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <Text className="text-lg font-bold text-main">{placeholder}</Text>
              <TouchableOpacity onPress={() => setVisible(false)} className="p-2">
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* tìm kiếm */}
            {searchable && (
              <View className="px-4 py-2">
                <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2.5">
                  <Search size={18} color="#9CA3AF" />
                  <TextInput
                    className="flex-1 ml-2 text-base text-gray-800"
                    placeholder="Tìm kiếm..."
                    value={search}
                    onChangeText={setSearch}
                    autoFocus={false}
                  />
                </View>
              </View>
            )}

            {/* danh sách item */}
            <FlatList
              data={filteredItems}
              keyExtractor={(item) => item.value.toString()}
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    onPress={() => handleSelect(item.value)}
                    className={`flex-row justify-between items-center p-4 mb-2 rounded-xl ${
                      isSelected
                        ? "bg-green-50 border border-green-200"
                        : "bg-gray-50 border border-transparent"
                    }`}
                  >
                    <Text
                      className={`text-base ${
                        isSelected ? "text-[#244B35] font-bold" : "text-gray-700"
                      }`}
                    >
                      {item.label}
                    </Text>
                    {isSelected && <Check size={18} color="#244B35" />}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View className="py-10 items-center">
                  <Text className="text-gray-400">Không tìm thấy dữ liệu</Text>
                </View>
              }
            />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}
