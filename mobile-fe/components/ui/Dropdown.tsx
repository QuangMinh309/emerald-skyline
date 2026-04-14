import { cn } from "@/utils/cn";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface DropdownItem {
  label: string;
  value: string | number;
}

interface DropdownProps {
  value?: string | number;
  placeholder?: string;
  items: DropdownItem[];
  error?: string;
  disabled?: boolean;
  onSelect?: (value: string | number) => void;
  className?: string;
  width?: number;
}

export default function MyDropdown({
  value,
  placeholder = "Chọn...",
  items,
  error,
  disabled,
  onSelect,
  className,
  width,
}: DropdownProps) {
  const [open, setOpen] = useState(false);

  const height = useSharedValue(0);
  const focus = useSharedValue(0);

  const animatedContainer = useAnimatedStyle(() => {
    const borderColor = error
      ? "#EF4444"
      : interpolateColor(focus.value, [0, 1], ["#D9D9D9", "#244B35"]);

    return { borderColor };
  });

  const itemHeight = 48;
  const maxHeight = 200;

  const animatedHeight = useAnimatedStyle(() => {
    const targetHeight = open ? Math.min(items.length * itemHeight, maxHeight) : 0;

    return {
      height: withTiming(targetHeight, { duration: 180 }),
      opacity: withTiming(open ? 1 : 0, { duration: 160 }),
    };
  });

  const selectedLabel = items.find((x) => x.value === value)?.label || placeholder;

  const toggleDropdown = () => {
    if (disabled) return;
    const next = !open;
    setOpen(next);
    focus.value = withTiming(next ? 1 : 0, { duration: 180 });
    height.value = next ? 1 : 0;
  };

  const handleSelect = (v: DropdownItem) => {
    setOpen(false);
    focus.value = withTiming(0, { duration: 180 });
    onSelect && onSelect(v.value);
  };

  const closeDropdown = () => {
    setOpen(false);
    focus.value = withTiming(0, { duration: 180 });
  };

  return (
    <View className={cn("relative z-50", className)}>
      {/* Header */}
      <Animated.View
        style={[animatedContainer]}
        className={cn(`rounded-lg border bg-white`, width ? `w-[${width}px]` : "w-full")}
      >
        <Pressable
          onPress={toggleDropdown}
          className={cn(
            "px-3 py-3 flex-row justify-between items-center",
            disabled && "opacity-50 bg-gray-100",
          )}
        >
          <Text
            className={cn(
              "text-base flex-1 mr-2",
              value ? "text-[#244B35]" : "text-gray-400",
            )}
            numberOfLines={1}
          >
            {selectedLabel}
          </Text>

          {open ? (
            <ChevronUp color="#6b7280" size={20} />
          ) : (
            <ChevronDown color="#6b7280" size={20} />
          )}
        </Pressable>
      </Animated.View>

      {/* OUTSIDE CLICK OVERLAY */}
      {open && (
        <Pressable
          onPress={closeDropdown}
          className="absolute top-[-1000px] left-[-1000px] right-[-1000px] bottom-[-1000px]"
          style={{ zIndex: -1 }}
        >
          <View />
        </Pressable>
      )}

      {/* Dropdown list */}
      <Animated.View
        style={animatedHeight}
        className={cn(
          "overflow-hidden border border-[#D9D9D9] rounded-lg bg-white absolute left-0 right-0 z-50 mt-[50px]",
          width ? `w-[${width}px]` : "w-full",
        )}
      >
        <ScrollView nestedScrollEnabled={true} showsVerticalScrollIndicator={true}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={{ height: itemHeight }}
              onPress={() => handleSelect(item)}
              className="px-3 py-3 border-b border-gray-100 flex-row items-center"
            >
              <Text
                className={`text-base ${
                  value === item.value ? "text-[#244B35] font-bold" : "text-gray-700"
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {error && <Text className="text-red-500 mt-1 text-sm">{error}</Text>}
    </View>
  );
}
