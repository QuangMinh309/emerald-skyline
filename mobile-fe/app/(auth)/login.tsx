import BaseInput from "@/components/ui/BaseInput";
import { CustomHeader } from "@/components/ui/CustomHeader";
import { useAuth } from "@/contexts/AuthContext";
import { clearAuthStorage } from "@/utils/auth-storage";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Errors = { email?: string; password?: string };

export default function LoginScreen() {
  const { login, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const next: Errors = {};
    const e = email.trim();

    if (!e) next.email = "Vui lòng nhập email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
      next.email = "Email không hợp lệ.";

    if (!password) next.password = "Vui lòng nhập mật khẩu.";
    else if (password.length < 6) next.password = "Mật khẩu tối thiểu 6 ký tự.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async () => {
    setSubmitted(true);
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const profile = await login(email, password);
      if (profile.role !== "RESIDENT") {
        Alert.alert("Đăng nhập thất bại", "Không đúng tài khoản.");
        await clearAuthStorage();
        await logout();
        return;
      }
      router.replace("/(tabs)/home");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Đăng nhập thất bại";
      Alert.alert("Đăng nhập thất bại", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <CustomHeader
        title="Đăng nhập"
        showBackButton={false}
        showRefresh={false}
      />

      <View className="px-5 py-4 gap-4">
        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Email
          </Text>
          <BaseInput
            value={email}
            placeholder="Nhập email"
            keyboardType="email-address"
            onChangeText={(t) => {
              setEmail(t);
              if (submitted) {
                const e = t.trim();
                setErrors((prev) => ({
                  ...prev,
                  email: !e
                    ? "Vui lòng nhập email."
                    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
                      ? "Email không hợp lệ."
                      : undefined,
                }));
              }
            }}
            error={submitted ? errors.email : undefined}
            className="rounded-xl"
          />
        </View>

        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-2">
            Nhập mật khẩu
          </Text>
          <BaseInput
            value={password}
            placeholder="Enter password"
            isPassword
            onChangeText={(t) => {
              setPassword(t);
              if (submitted) {
                setErrors((prev) => ({
                  ...prev,
                  password: !t
                    ? "Vui lòng nhập mật khẩu."
                    : t.length < 6
                      ? "Mật khẩu tối thiểu 6 ký tự."
                      : undefined,
                }));
              }
            }}
            error={submitted ? errors.password : undefined}
            className="rounded-xl"
          />
        </View>

        <View className="items-center mt-6">
          <TouchableOpacity
            onPress={onSubmit}
            activeOpacity={0.9}
            disabled={isSubmitting}
            className="bg-[#244B35] px-10 py-3 rounded-xl disabled:opacity-60"
          >
            <Text className="text-white font-semibold">
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
