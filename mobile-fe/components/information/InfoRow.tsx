import { LucideIcon } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";

interface InfoRowProps {
  icon: LucideIcon;
  label: string;
  value?: string;
  isEditing?: boolean;
  children?: React.ReactNode;
}

export const InfoRow = ({
  icon: Icon,
  label,
  value,
  isEditing = false,
  children,
}: InfoRowProps) => (
  <View className="flex-row items-start">
    {/* icon */}
    <View className="w-9 pt-0.5">
      <View className={isEditing ? "mt-3" : "mt-0.5"}>
        <Icon size={20} color="#4B5563" />
      </View>
    </View>

    <View className="flex-1 ml-1">
      <Text className="text-gray-500 text-sm mb-1">{label}</Text>
      {isEditing ? (
        children
      ) : (
        <Text className="text-black text-base font-semibold">{value}</Text>
      )}
    </View>
  </View>
);
