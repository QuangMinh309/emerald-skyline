import React from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { oldPassword: string; newPassword: string }) => Promise<void>;
};

type PasswordFieldProps = {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  error?: string | null;
  shown: boolean;
  onToggle: () => void;
};

function PasswordField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  shown,
  onToggle,
}: PasswordFieldProps) {
  const ref = React.useRef<TextInput>(null);

  return (
    <View>
      <Text className="text-sm font-semibold text-gray-800 mb-2">{label}</Text>

      <View className="relative">
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={!shown}
          autoCapitalize="none"
          autoCorrect={false}
          // iOS autofill
          textContentType="password"
          // Android autofill (tuỳ phiên bản RN, nếu TS báo đỏ thì xoá 2 dòng này)
          autoComplete="off"
          importantForAutofill="no"
          className="h-11 pl-4 pr-12 rounded-xl border border-gray-200 bg-white"
          blurOnSubmit={false}
        />

        <TouchableOpacity
          onPress={() => {
            const wasFocused = !!ref.current?.isFocused?.();
            if (wasFocused) ref.current?.blur();

            onToggle();

            if (wasFocused) {
              setTimeout(() => ref.current?.focus(), 30);
            }
          }}
          activeOpacity={0.7}
          className="absolute right-3 top-0 h-11 justify-center"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={shown ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {shown ? <Eye size={20} color="#6B7280" /> : <EyeOff size={20} color="#6B7280" />}
        </TouchableOpacity>

      </View>

      {!!error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
    </View>
  );
}

export function ChangePasswordModal({ open, onClose, onSubmit }: Props) {
  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const [errOld, setErrOld] = React.useState<string | null>(null);
  const [errNew, setErrNew] = React.useState<string | null>(null);
  const [errConfirm, setErrConfirm] = React.useState<string | null>(null);

  // shown=true => hiện mật khẩu
  const [showOld, setShowOld] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const reset = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrOld(null);
    setErrNew(null);
    setErrConfirm(null);
    setSubmitting(false);
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  React.useEffect(() => {
    if (!open) reset();
  }, [open]);

  const validate = () => {
    let ok = true;
    setErrOld(null);
    setErrNew(null);
    setErrConfirm(null);

    if (!oldPassword.trim()) {
      setErrOld("Vui lòng nhập mật khẩu hiện tại");
      ok = false;
    }

    if (!newPassword.trim()) {
      setErrNew("Vui lòng nhập mật khẩu mới");
      ok = false;
    } else if (newPassword.length < 6) {
      setErrNew("Mật khẩu mới tối thiểu 6 ký tự");
      ok = false;
    } else if (newPassword === oldPassword) {
      setErrNew("Mật khẩu mới phải khác mật khẩu hiện tại");
      ok = false;
    }

    if (!confirmPassword.trim()) {
      setErrConfirm("Vui lòng nhập xác nhận mật khẩu");
      ok = false;
    } else if (confirmPassword !== newPassword) {
      setErrConfirm("Xác nhận mật khẩu không khớp");
      ok = false;
    }

    return ok;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    if (!validate()) return;

    try {
      setSubmitting(true);
      await onSubmit({ oldPassword, newPassword });
      onClose();
    } catch (error) {
      // Error đã được xử lý và hiển thị ở parent component
      // Không làm gì thêm, chỉ giữ modal mở để user có thể thử lại
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/45 justify-center px-4">
        <Pressable
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={Keyboard.dismiss}
        />

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
          {/* PointerEvents để đảm bảo tap trong card không rơi xuống overlay */}
          <View pointerEvents="box-none">
            <View
              pointerEvents="auto"
              className="rounded-2xl bg-white overflow-hidden border border-gray-200"
            >
              {/* Header */}
              <View className="px-5 pt-5 pb-3">
                <Text className="text-2xl font-bold text-gray-900 mb-2">Đổi mật khẩu</Text>
              </View>

              {/* Body */}
              <View className="px-5 pb-4 space-y-3">
                <PasswordField
                  label="Mật khẩu hiện tại"
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  placeholder="Nhập mật khẩu hiện tại"
                  error={errOld}
                  shown={showOld}
                  onToggle={() => setShowOld((v) => !v)}
                />

                <View className="mt-4">
                  <PasswordField
                    label="Mật khẩu mới"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Nhập mật khẩu mới"
                    error={errNew}
                    shown={showNew}
                    onToggle={() => setShowNew((v) => !v)}
                  />
                </View>

                <View className="mt-4">
                  <PasswordField
                    label="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Nhập lại mật khẩu mới"
                    error={errConfirm}
                    shown={showConfirm}
                    onToggle={() => setShowConfirm((v) => !v)}
                  />
                </View>
              </View>

              {/* Actions */}
              <View className="flex-row gap-3 px-5 pb-5">
                <TouchableOpacity
                  disabled={submitting}
                  onPress={onClose}
                  className="flex-1 h-11 rounded-xl border border-gray-200 items-center justify-center"
                  activeOpacity={0.8}
                >
                  <Text className="font-semibold text-gray-700">Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  disabled={submitting}
                  onPress={handleSubmit}
                  className={`flex-1 h-11 rounded-xl items-center justify-center ${submitting ? "bg-main/70" : "bg-main"
                    }`}
                  activeOpacity={0.85}
                >
                  {submitting ? (
                    <View className="flex-row items-center gap-2">
                      <ActivityIndicator color="#fff" />
                      <Text className="font-semibold text-white">Đang đổi...</Text>
                    </View>
                  ) : (
                    <Text className="font-semibold text-white">Đổi mật khẩu</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
