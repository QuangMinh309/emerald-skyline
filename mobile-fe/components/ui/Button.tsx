import { cn } from "@/utils/cn";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type Variant = "primary" | "secondary" | "outline";

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  textClassName?: string;
  onPress?: () => void;
}

const variantStyles: Record<Variant, string> = {
  primary: "bg-main",
  secondary: "bg-secondary",
  outline: "border border-gray-500",
};

const textVariantStyles: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-white",
  outline: "text-gray-800",
};

export default function MyButton({
  children,
  variant = "primary",
  isLoading,
  disabled,
  className,
  textClassName,
  onPress,
}: Props) {
  const pressed = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(pressed.value, { duration: 120 }) }],
  }));

  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      disabled={isDisabled}
      onPressIn={() => {
        pressed.value = 0.96;
      }}
      onPressOut={() => {
        pressed.value = 1;
      }}
      onPress={onPress}
    >
      <Animated.View
        style={animatedStyle}
        className={cn(
          "rounded-lg flex-row items-center justify-center inline-flex self-start px-[26px] py-[8px]",
          variantStyles[variant],
          textVariantStyles[variant],
          isDisabled && "opacity-80",
          className
        )}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View className="flex-row items-center gap-2">
            {typeof children === "string" ? (
              <Text
                className={cn(
                  textVariantStyles[variant],
                  textClassName
                )}
              >
                {children}
              </Text>
            ) : (
              children
            )}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}
