import BaseInput from "@/components/ui/BaseInput";
import MyButton from "@/components/ui/Button";
import DatePicker from "@/components/ui/DatePicker";
import MyDropdown from "@/components/ui/Dropdown";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { View } from "react-native";
import * as Yup from "yup";
import { InferType } from "yup";
// template form
const loginSchema = Yup.object({
  email: Yup.string().email("Email invalid").required("Email required"),
  gender: Yup.string().required("Gender required"),
  birthday: Yup.date().required("Birthday required"),
  password: Yup.string().min(6).required(),
});

type LoginForm = InferType<typeof loginSchema>;
export default function LoginScreen() {
  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      gender: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginForm> = (data) => {
    console.log("Form data: ", data);
  };

  return (
    <View style={{ padding: 20 }} className="gap-4">
      <Controller
        control={control}
        name="birthday"
        defaultValue={new Date()} // ✅ bắt buộc nếu field date
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <DatePicker
            value={value} // value luôn là Date
            onChange={onChange}
            label="Ngày sinh"
            error={error?.message}
            maximumDate={new Date()}
          />
        )}
      />

      {/* Email */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <BaseInput
            placeholder="Email"
            value={value}
            onChangeText={onChange}
            error={error?.message}
            keyboardType="email-address"
          />
        )}
      />

      {/* Gender */}
      <Controller
        control={control}
        name="gender"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <MyDropdown
            value={value}
            placeholder="Chọn giới tính"
            items={[
              { label: "Nam", value: "male" },
              { label: "Nữ", value: "female" },
              { label: "Khác", value: "other" },
            ]}
            onSelect={onChange}
            error={error?.message}
          />
        )}
      />

      {/* Password */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <BaseInput
            placeholder="Password"
            value={value}
            onChangeText={onChange}
            error={error?.message}
            isPassword
          />
        )}
      />

      <MyButton className="w-full" onPress={handleSubmit(onSubmit)}>
        Login
      </MyButton>
    </View>
  );
}
