import * as Yup from "yup";

export const GENDER_OPTIONS = [
  { label: "Nam", value: "MALE" },
  { label: "Nữ", value: "FEMALE" },
  { label: "Khác", value: "OTHER" },
];

export const checkIsVietnam = (nat: string | null | undefined) => {
  if (!nat) return false;
  const n = nat.toLowerCase().trim();
  return n === "vietnamese" || n === "vietnam" || n === "việt nam" || n === "viet nam";
};

export const displayValue = (val: string | number | null | undefined) => {
  if (val === null || val === undefined || val === "" || val === "Unknown") {
    return "Chưa cập nhật";
  }
  if (val === "MALE") return "Nam";
  if (val === "FEMALE") return "Nữ";
  if (val === "OTHER") return "Khác";
  return val.toString();
};

export const parseDateString = (dateStr: string | null | undefined) => {
  const fallback = new Date();
  if (!dateStr) return fallback;

  try {
    // Accept both YYYY-MM-DD and ISO strings from backend
    const dateOnly = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
    const parts = dateOnly.split("-");

    if (parts.length === 3) {
      const y = Number(parts[0]);
      const m = Number(parts[1]);
      const d = Number(parts[2]);
      const parsed = new Date(y, m - 1, d);
      return Number.isNaN(parsed.getTime()) ? fallback : parsed;
    }

    const parsed = new Date(dateStr);
    return Number.isNaN(parsed.getTime()) ? fallback : parsed;
  } catch (e) {
    return fallback;
  }
};

export const formatDateForAPI = (date: Date) => {
  try {
    const d = new Date(date);
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split("T")[0];
  } catch (e) {
    return "";
  }
};

export const formatDateDisplay = (dateStr: string | null | undefined) => {
  if (!dateStr) return "Chưa cập nhật";

  const dateOnly = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const parts = dateOnly.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;

  return dateStr;
};

export const formatPhoneNumber = (text: string | null | undefined) => {
  if (!text) return "";
  const cleaned = text.replace(/\D/g, "");
  if (cleaned.length > 7)
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 10)}`;
  if (cleaned.length > 4) return `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`;
  return cleaned;
};

export const residentSchema = Yup.object({
  fullName: Yup.string().required("Họ tên là bắt buộc"),
  phone: Yup.string()
    .required("Số điện thoại là bắt buộc")
    .min(10, "Số điện thoại phải đủ 10 số"),
  dob: Yup.date().typeError("Ngày sinh không hợp lệ").required("Ngày sinh là bắt buộc"),
  gender: Yup.string().required("Giới tính là bắt buộc"),
  nationality: Yup.string().nullable(),
  province: Yup.string().when("nationality", {
    is: (val: string) => checkIsVietnam(val),
    then: (schema) => schema.required("Vui lòng chọn Tỉnh/Thành phố"),
    otherwise: (schema) => schema.nullable(),
  }),
  ward: Yup.string().when("nationality", {
    is: (val: string) => checkIsVietnam(val),
    then: (schema) => schema.required("Vui lòng chọn Xã/Phường"),
    otherwise: (schema) => schema.nullable(),
  }),
  detailAddress: Yup.string().nullable(),
});
