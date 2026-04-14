import { useRouter } from "expo-router";
import { Droplet, Home, Zap } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BaseInput from "@/components/ui/BaseInput";
import BigImageUpload from "@/components/ui/BigImageUpload";
import MyButton from "@/components/ui/Button";
import { CustomHeader } from "@/components/ui/CustomHeader";
import MyDropdown from "@/components/ui/Dropdown";

import { useScanMeter } from "@/hooks/useAI";
import { useSubmitMeterReading } from "@/hooks/useInvoice";
import { useResidentProfile } from "@/hooks/useResident";

export default function InputMeterScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const scrollViewRef = useRef<ScrollView>(null);
  const elecManualEditedAtRef = useRef<number>(0);
  const waterManualEditedAtRef = useRef<number>(0);

  const [selectedApartmentId, setSelectedApartmentId] = useState<number | null>(null);
  const [elecIndex, setElecIndex] = useState("");
  const [waterIndex, setWaterIndex] = useState("");
  const [elecImage, setElecImage] = useState<string | null>(null);
  const [waterImage, setWaterImage] = useState<string | null>(null);

  const mutation = useSubmitMeterReading();
  const { data: profile, isLoading: isLoadingProfile } = useResidentProfile();
  const scanMutation = useScanMeter();

  const apartmentOptions = useMemo(() => {
    if (!profile?.apartments) return [];
    return profile.apartments.map((item) => ({
      label: `${item.apartment.name} - ${item.apartment.block.name}`,
      value: item.apartment.id,
    }));
  }, [profile]);

  useEffect(() => {
    if (apartmentOptions.length > 0 && !selectedApartmentId) {
      setSelectedApartmentId(Number(apartmentOptions[0].value));
    }
  }, [apartmentOptions]);

  const isInvalidNumber = (text: string) => {
    if (text.length === 0) return false;
    return !/^\d+$/.test(text);
  };

  const isElecError = isInvalidNumber(elecIndex);
  const isWaterError = isInvalidNumber(waterIndex);

  const isElec = step === 1;
  const iconColor = isElec ? "#FACC15" : "#3B82F6";
  const StepIcon = isElec ? Zap : Droplet;
  const currentError = isElec ? isElecError : isWaterError;

  const isValidStep1 =
    selectedApartmentId !== null &&
    elecIndex.length > 0 &&
    !isElecError;

  const isValidStep2 = waterIndex.length > 0 && !isWaterError;

  const handleNext = () => {
    if (step === 1) setStep(2);
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else router.back();
  };

  const handleSubmit = () => {
    if (profile?.isFallbackProfile) {
      Alert.alert(
        "Chưa có hồ sơ cư dân",
        "Không thể gửi chỉ số vì tài khoản chưa được liên kết hồ sơ cư dân. Vui lòng liên hệ quản trị hệ thống.",
      );
      return;
    }

    if (!isValidStep1 || !isValidStep2 || !selectedApartmentId) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ chỉ số và chọn căn hộ.");
      return;
    }

    mutation.mutate({
      apartmentId: selectedApartmentId,
      electricityIndex: Number(elecIndex),
      waterIndex: Number(waterIndex),
      electricityImage: elecImage || undefined,
      waterImage: waterImage || undefined,
    });
  };

  const handleImageChange = (uri: string | null) => {
    if (isElec) {
      setElecImage(uri);
      if (uri) triggerScan(uri, setElecIndex, "electric");
    } else {
      setWaterImage(uri);
      if (uri) triggerScan(uri, setWaterIndex, "water");
    }
  };

  const handleElecIndexChange = (value: string) => {
    elecManualEditedAtRef.current = Date.now();
    setElecIndex(value);
  };

  const handleWaterIndexChange = (value: string) => {
    waterManualEditedAtRef.current = Date.now();
    setWaterIndex(value);
  };

  const triggerScan = (
    uri: string,
    setIndex: (val: string) => void,
    meterType: "electric" | "water",
  ) => {
    const scanStartedAt = Date.now();

    scanMutation.mutate(uri, {
      onSuccess: (reading) => {
        const normalized = String(reading || "").trim();
        const isValidNumeric = /^\d+(\.\d+)?$/.test(normalized);

        if (!isValidNumeric) {
          Alert.alert("Thông báo", "Không nhận diện được số rõ ràng. Vui lòng nhập tay.");
          return;
        }

        const editedAtRef =
          meterType === "electric" ? elecManualEditedAtRef : waterManualEditedAtRef;
        const isUserEditedAfterScan = editedAtRef.current > scanStartedAt;

        if (isUserEditedAfterScan) {
          return;
        }

        const normalizedInteger = String(Math.trunc(Number(normalized)));
        setIndex(normalizedInteger);
      },
      onError: () => {},
    });
  };

  const scrollToInput = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  if (isLoadingProfile) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-[#F3F4F6]">
        <ActivityIndicator size="large" color="#244B35" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F3F4F6]" edges={["top", "left", "right"]}>
      <CustomHeader title="Nhập chỉ số đồng hồ" onBackPress={handleBack}>
        <View className="items-center">
          <Text className="text-xs text-gray-500">Bước {step}/2</Text>
        </View>
      </CustomHeader>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-5 pt-2"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="flex-row gap-2 mb-6">
            <View
              className={`h-1.5 flex-1 rounded-full ${step >= 1 ? "bg-[#1a4c30]" : "bg-gray-200"}`}
            />
            <View
              className={`h-1.5 flex-1 rounded-full ${step >= 2 ? "bg-[#1a4c30]" : "bg-gray-200"}`}
            />
          </View>

          {step === 1 && (
            <View className="mb-6">
              <View className="flex-row items-center gap-2 mb-2">
                <Home size={20} color="#244B35" />
                <Text className="text-base font-extrabold text-main">
                  Chọn căn hộ <Text className="text-red-500">*</Text>
                </Text>
              </View>
              <MyDropdown
                placeholder="Chọn căn hộ..."
                items={apartmentOptions}
                value={selectedApartmentId || undefined}
                onSelect={(val) => setSelectedApartmentId(Number(val))}
                disabled={mutation.isPending || !!profile?.isFallbackProfile}
                className="mt-1.5"
              />
              {apartmentOptions.length === 0 && (
                <Text className="text-red-500 text-xs mt-1.5">
                  {profile?.isFallbackProfile
                    ? "Tài khoản chưa có hồ sơ cư dân nên chưa có căn hộ để nhập chỉ số."
                    : "Không tìm thấy căn hộ nào."}
                </Text>
              )}
            </View>
          )}

          <View className="flex-row items-center gap-2 mb-7">
            <StepIcon size={24} color={iconColor} fill={iconColor} />
            <Text className="text-xl font-extrabold text-main">
              {isElec ? "Chỉ số điện" : "Chỉ số nước"}
            </Text>
          </View>

          <View className="mb-6">
            <Text className="font-semibold text-gray-800 mb-2">
              Chụp ảnh minh chứng (khuyến khích)
            </Text>
            <BigImageUpload
              value={isElec ? elecImage : waterImage}
              onChange={handleImageChange}
              height={200}
            />

            {scanMutation.isPending && (
              <View className="flex-row items-center justify-center mt-3 bg-gray-100 py-2 rounded-lg">
                <ActivityIndicator size="small" color={iconColor} />
                <Text className="ml-2 text-xs text-gray-600 font-medium">
                  Đang đọc chỉ số từ ảnh...
                </Text>
              </View>
            )}
          </View>

          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-semibold text-gray-800">
                Nhập chỉ số {isElec ? "điện (kWh)" : "nước (m³)"}{" "}
                <Text className="text-red-500">*</Text>
              </Text>
            </View>

            <BaseInput
              value={isElec ? elecIndex : waterIndex}
              onChangeText={isElec ? handleElecIndexChange : handleWaterIndexChange}
              placeholder={isElec ? "Ví dụ: 1593" : "Ví dụ: 159"}
              keyboardType="numeric"
              error={currentError ? "Vui lòng chỉ nhập số nguyên" : undefined}
              style={{
                fontSize: 18,
                fontWeight: "bold",
                textAlign: "center",
              }}
              className="bg-white py-2"
              disabled={mutation.isPending}
              onFocus={scrollToInput}
            />

            {!currentError && (
              <Text className="text-xs text-gray-400 mt-2 text-center">
                {scanMutation.isPending
                  ? "Hệ thống đang tự động điền..."
                  : "Kết quả OCR chỉ để tham khảo. Bạn có thể sửa tay trước khi gửi."}
              </Text>
            )}
          </View>
        </ScrollView>

        <View className="p-5 border-t border-gray-100 bg-white">
          {step === 1 ? (
            <MyButton
              variant="primary"
              className="!bg-[#E09B6B] !w-full h-14"
              onPress={handleNext}
              disabled={!isValidStep1}
            >
              Tiếp tục
            </MyButton>
          ) : (
            <View className="flex-row gap-3">
              <View className="flex-1">
                <MyButton
                  variant="outline"
                  className="!w-full h-14 border-gray-400"
                  textClassName="text-gray-700 font-semibold"
                  onPress={handleBack}
                  disabled={mutation.isPending}
                >
                  Quay lại
                </MyButton>
              </View>

              <View className="flex-1">
                <MyButton
                  variant="primary"
                  className="!bg-[#E09B6B] !w-full h-14"
                  textClassName="font-bold"
                  onPress={handleSubmit}
                  disabled={!isValidStep2 || mutation.isPending}
                >
                  {mutation.isPending ? <ActivityIndicator color="white" /> : "Xác nhận"}
                </MyButton>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
