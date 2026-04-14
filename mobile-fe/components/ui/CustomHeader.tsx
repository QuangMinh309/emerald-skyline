import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ChevronLeft, RefreshCw } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface CustomHeaderProps {
  title: string;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
  children?: React.ReactNode;
  onBackPress?: () => void;
  backgroundColor?: string;
  textColor?: string;
  iconColor?: string;
  showBorder?: boolean;
  showRefresh?: boolean;
}

export const CustomHeader = ({
  title,
  showBackButton = true,
  rightComponent,
  children,
  onBackPress,
  backgroundColor = "white",
  textColor = "#1F2937",
  iconColor = "#1F2937",
  showBorder = true,
  showRefresh = true,
}: CustomHeaderProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isFetching = useIsFetching() > 0;

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.push("/(tabs)/home");
    }
  };

  const handleRefresh = async () => {
    if (isFetching) return;
    await queryClient.refetchQueries();
  };

  const isHexColor = backgroundColor.startsWith("#");
  const isTextHex = textColor.startsWith("#");

  return (
    <View
      style={isHexColor ? { backgroundColor } : {}}
      className={`px-5 py-4 ${!isHexColor ? backgroundColor : ""} ${
        showBorder ? "border-b border-gray-100" : ""
      }`}
    >
      <View className="flex-row items-center justify-between min-h-[40px]">
        <View className="w-10">
          {showBackButton && (
            <TouchableOpacity onPress={handleBack} className="py-1">
              <ChevronLeft size={28} color={iconColor} />
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-1 items-center px-2">
          <Text
            numberOfLines={1}
            style={isTextHex ? { color: textColor } : {}}
            className={`text-[24px] font-normal text-center ${
              !isTextHex ? textColor : ""
            }`}
          >
            {title}
          </Text>
        </View>

        <View className="w-10 items-end">
          {rightComponent ? (
            rightComponent
          ) : showRefresh ? (
            <TouchableOpacity
              onPress={handleRefresh}
              disabled={isFetching}
              className="p-1"
            >
              <RefreshCw
                size={20}
                color={iconColor}
                style={{
                  opacity: isFetching ? 0.5 : 1,
                  transform: [{ rotate: isFetching ? "360deg" : "0deg" }],
                }}
              />
            </TouchableOpacity>
          ) : (
            <View className="w-6 h-6" />
          )}
        </View>
      </View>

      {children && <View className="mt-2.5">{children}</View>}
    </View>
  );
};
