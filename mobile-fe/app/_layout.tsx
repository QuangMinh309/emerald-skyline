import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, router, useSegments } from "expo-router";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "../global.css";

const queryClient = new QueryClient();

const AuthGate = ({ children }: { children: ReactNode }) => {
  const { user, isLoading, logout } = useAuth();
  const segments = useSegments();
  const inAuthGroup = segments[0] === "(auth)";

  useEffect(() => {
    if (isLoading) return;

    if (user?.role && user.role !== "RESIDENT") {
      Alert.alert("Đăng nhập thất bại", "Sai tài khoản hoặc mật khẩu.");
      void logout();
      router.replace("/(auth)/login");
      return;
    }
    if (user && inAuthGroup) {
      router.replace("/(tabs)/home");
    }
    if (!user && !inAuthGroup) {
      router.replace("/(auth)/login");
      return;
    }
  }, [user, inAuthGroup, isLoading, logout]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
};

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SafeAreaProvider>
          <AuthGate>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </AuthGate>
        </SafeAreaProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
