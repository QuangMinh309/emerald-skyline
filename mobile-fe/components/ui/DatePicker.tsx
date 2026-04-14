import { cn } from '@/utils/cn';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  error?: string;
  disabled?: boolean;
  className?: string;
  hideText?: boolean;
  children?: React.ReactNode;
};

export default function DatePicker({
  value,
  onChange,
  label = 'Chọn ngày',
  minimumDate,
  maximumDate,
  error,
  disabled,
  className,
  hideText = false,
  children,
}: Props) {
  const [show, setShow] = useState(false);
  const [focused, setFocused] = useState(false);

  const getSafeDate = (date?: Date) => {
    if (!(date instanceof Date)) return null;
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const safeMinDate = getSafeDate(minimumDate);
  const safeMaxDate = getSafeDate(maximumDate);
  const inputDate = getSafeDate(value) || today;

  let effectiveDate = inputDate;
  if (safeMinDate && effectiveDate < safeMinDate) effectiveDate = safeMinDate;
  if (safeMaxDate && effectiveDate > safeMaxDate) effectiveDate = safeMaxDate;

  const borderAnim = useSharedValue(0);

  useEffect(() => {
    borderAnim.value = focused ? 1 : 0;
  }, [focused]);

  const animatedBorder = useAnimatedStyle(() => ({
    borderColor: withTiming(
      error ? '#ef4444' : borderAnim.value ? '#244B35' : '#D9D9D9',
      { duration: 160 }
    ),
  }));

  return (
    <View>
      {label && (
        <Text className="mb-3 text-[14px] font-semibold text-[#244B35]">
          {label}
        </Text>
      )}

      <Animated.View
        style={animatedBorder}
        className={cn(
          'relative border rounded-lg px-3 overflow-hidden',
          disabled && 'opacity-50 bg-gray-100',
          className
        )}
      >
        <Pressable
          disabled={disabled}
          onPress={() => {
            setFocused(true);
            setShow(true);
          }}
          className="flex-row items-center min-h-[48px]"
        >
          {children ? (
            children
          ) : (
            <Text
              className={cn(
                'flex-1 text-base py-3 text-[#244B35]',
                hideText && 'opacity-0'
              )}
            >
              {effectiveDate.toLocaleDateString('vi-VN') || 'Chọn ngày'}
            </Text>
          )}
        </Pressable>
      </Animated.View>

      {error && <Text className="text-red-500 mt-1 text-sm">{error}</Text>}

      {show && (
        <DateTimePicker
          value={effectiveDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={safeMinDate || undefined}
          maximumDate={safeMaxDate || undefined}
          onChange={(_, selectedDate) => {
            setShow(false);
            setFocused(false);
            if (selectedDate) onChange(selectedDate);
          }}
          accentColor="#244B35"
        />
      )}
    </View>
  );
}
