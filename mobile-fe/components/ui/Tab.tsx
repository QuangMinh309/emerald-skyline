import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  UIManager,
  View,
} from "react-native";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

export type SegmentedItem<T extends string> = {
  key: T;
  label: string;
  quantity?: number;
  content: React.ReactNode;
};

type Props<T extends string> = {
  items: readonly SegmentedItem<T>[];
  defaultValue?: T;
  className?: string;
};

export default function Tab<T extends string>({
  items,
  defaultValue,
  className = "",
}: Props<T>) {
  const [value, setValue] = useState<T>(() => {
    if (defaultValue) return defaultValue;
    return items[0]?.key;
  });

  const handlePress = (key: T) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setValue(key);
  };

  const activeItem = items.find((i) => i.key === value);

  return (
    <View>
      {/* Tabs */}
      <View
        className={`flex-row rounded-full bg-[#F1F3F5] p-1 shadow-sm ${className}`}
      >
        {items.map((item) => {
          const active = item.key === value;

          return (
            <Pressable key={item.key} onPress={() => handlePress(item.key)}>
              <View
                className={`flex-row items-center gap-1.5 px-4 py-1.5 rounded-full ${
                  active ? "bg-[#1F4D3A] shadow" : "bg-transparent"
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    active ? "text-white" : "text-gray-600"
                  }`}
                >
                  {item.label}
                </Text>

                {typeof item.quantity === "number" && (
                  <View
                    className={`min-w-[18px] h-[18px] px-1 rounded-full items-center justify-center ${
                      active ? "bg-white/20" : "bg-gray-300"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        active ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {item.quantity}
                    </Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      <View className="mt-4">{activeItem?.content}</View>
    </View>
  );
}
