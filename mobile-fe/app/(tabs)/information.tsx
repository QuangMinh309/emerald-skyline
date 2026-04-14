import { ApartmentTab } from "@/components/information/ApartmentTab";
import { ResidentTab } from "@/components/information/ResidentTab";
import { CustomHeader } from "@/components/ui/CustomHeader";
import { useResidentProfile } from "@/hooks/useResident";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InformationScreen() {
  const [activeTab, setActiveTab] = useState<"resident" | "apartment">("resident");
  const [refreshing, setRefreshing] = useState(false);

  const { data: residentData, isLoading, isError, refetch } = useResidentProfile();

  const onRefresh = async () => {
    if (isLoading) return;
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F3F4F6]">
      <CustomHeader title="Thông tin cá nhân" showBackButton />

      <View className="flex-row justify-center my-4 px-4">
        <View className="flex-row bg-white border border-gray-200 rounded-full p-1 w-full">
          <TouchableOpacity
            onPress={() => setActiveTab("resident")}
            className={`flex-1 py-2.5 rounded-full items-center ${
              activeTab === "resident" ? "bg-main" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-base font-bold ${
                activeTab === "resident" ? "text-white" : "text-gray-400"
              }`}
            >
              Cư dân
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab("apartment")}
            className={`flex-1 py-2.5 rounded-full items-center ${
              activeTab === "apartment" ? "bg-main" : "bg-transparent"
            }`}
          >
            <Text
              className={`text-base font-bold ${
                activeTab === "apartment" ? "text-white" : "text-gray-400"
              }`}
            >
              Căn hộ
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {isLoading ? (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" />
              <Text className="text-gray-500 mt-2">Đang tải thông tin...</Text>
            </View>
          ) : isError || !residentData ? (
            <View className="py-20 items-center">
              <Text className="text-red-500 font-medium">Không thể tải dữ liệu</Text>
            </View>
          ) : (
            <>
              <View style={{ display: activeTab === "resident" ? "flex" : "none" }}>
                <ResidentTab data={residentData} />
              </View>

              <View style={{ display: activeTab === "apartment" ? "flex" : "none" }}>
                <ApartmentTab
                  data={residentData.apartments || []}
                  isFallbackProfile={residentData.isFallbackProfile}
                />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
