import { cn } from "@/utils/cn";
import { Eye, EyeOff } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, TextInputProps, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface BaseInputProps extends TextInputProps {
  value?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  isPassword?: boolean;
  multiline?: boolean; // textarea
  numberOfLines?: number; // textarea height
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onChangeText?: (text: string) => void;
  className?: string;
}

export default function BaseInput({
  value,
  placeholder,
  error,
  disabled,
  isPassword,
  multiline,
  numberOfLines,
  keyboardType = "default",
  leftIcon,
  rightIcon,
  onChangeText,
  className,
  ...props
}: BaseInputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderAnim = useSharedValue(0);

  useEffect(() => {
    borderAnim.value = focused ? 1 : 0;
  }, [focused, borderAnim]);

  const animatedBorder = useAnimatedStyle(() => ({
    borderColor: withTiming(
      error ? "#ef4444" : borderAnim.value ? "#244B35" : "#D9D9D9",
      { duration: 160 }
    ),
  }));

  return (
    <View>
      <Animated.View
        style={animatedBorder}
        className={cn(
          "relative border rounded-lg px-3",
          disabled && "opacity-50 bg-gray-100",
          className
        )}
      >
        <View
          className="flex-row items-center gap-2"
          style={{ minHeight: multiline ? 80 : 40 }}
        >
          {leftIcon}
          <TextInput
            editable={!disabled}
            value={value}
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
            secureTextEntry={isPassword && !showPassword}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChangeText={onChangeText}
            multiline={multiline}
            numberOfLines={numberOfLines}
            keyboardType={keyboardType}
            {...props}
            className={cn(
              "flex-1 text-base py-3 text-[#244B35]",
              multiline && "text-start"
            )}
          />
          {isPassword ? (
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <Eye color="#6b7280" /> : <EyeOff color="#6b7280" />}
            </Pressable>
          ) : (
            rightIcon
          )}
        </View>
      </Animated.View>

      {error && <Text className="text-red-500 mt-1 text-sm">{error}</Text>}
    </View>
  );
}
