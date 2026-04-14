import { useInvoiceDetail, useResidentInvoices } from "@/hooks/useInvoice";
import { usePaymentHistory } from "@/hooks/usePayment";
import { useResidentProfile } from "@/hooks/useResident";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AlertCircle,
  Building,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Droplets,
  FileText,
  Wallet,
  Zap,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TariffModal } from "@/components/payment/TariffModal";
import MyButton from "@/components/ui/Button";
import { CustomHeader } from "@/components/ui/CustomHeader";
import { GenericTable } from "@/components/ui/Table";
import tierColumns from "./columns";

const COLORS = {
  main: "#244B35",
  secondary: "#E09B6B",
  third: "#EFEAE1",
  border: "#D9D9D9",
};

const ICONS = {
  management: {
    icon: Building,
    bg: "rgba(36, 75, 53, 0.12)",
    color: "#244B35",
  },
  electricity: { icon: Zap, bg: "rgba(234, 179, 8, 0.15)", color: "#EAB308" },
  water: { icon: Droplets, bg: "rgba(59, 130, 246, 0.15)", color: "#3B82F6" },
  default: {
    icon: Building,
    bg: "rgba(156, 163, 175, 0.15)",
    color: "#9CA3AF",
  },
};

const FEE_PRIORITY: Record<string, number> = {
  management: 1,
  electricity: 2,
  water: 3,
  default: 4,
};

// format (dd/mm)
const formatShortDate = (date: Date) => {
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
};

// format (dd/mm/yyyy)
const formatFullDate = (date: Date) => {
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
};

export default function BillDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const numericId = Number(id);

  const { data: invoiceData, isLoading } = useInvoiceDetail(numericId);
  const { data: residentProfile } = useResidentProfile();
  const { data: paymentHistory } = usePaymentHistory(numericId);
  const { data: allInvoices } = useResidentInvoices();

  const [sections, setSections] = useState<Record<string, boolean>>({
    general: true,
    summary: true,
    electricity: true,
    water: true,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [tariffType, setTariffType] = useState<"ELEC" | "WATER" | null>(null);

  const toggleSection = (key: string) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleShowTariff = (type: string) => {
    if (type === "electricity") {
      setTariffType("ELEC");
      setModalVisible(true);
    } else if (type === "water") {
      setTariffType("WATER");
      setModalVisible(true);
    }
  };

  const navigationData = useMemo(() => {
    if (!allInvoices || !invoiceData) return { prevId: null, nextId: null };

    // lọc ra hóa đơn cùng căn hộ để next, prev
    const sameApartmentInvoices = allInvoices.filter(
      (inv) => inv.apartmentId === invoiceData.apartmentId,
    );

    // sắp xếp thời gian (cũ -> mới)
    const sortedInvoices = sameApartmentInvoices.sort(
      (a, b) => new Date(a.period).getTime() - new Date(b.period).getTime(),
    );

    const currentIndex = sortedInvoices.findIndex(
      (inv) => inv.id === numericId,
    );

    if (currentIndex === -1) return { prevId: null, nextId: null };
    const prevId =
      currentIndex > 0 ? sortedInvoices[currentIndex - 1].id : null;
    const nextId =
      currentIndex < sortedInvoices.length - 1
        ? sortedInvoices[currentIndex + 1].id
        : null;

    return { prevId, nextId };
  }, [allInvoices, invoiceData, numericId]);

  const handleNavigate = (targetId: number | null) => {
    if (targetId) {
      router.setParams({ id: targetId.toString() });
    }
  };

  const processedData = useMemo(() => {
    if (!invoiceData) return null;

    const periodDate = new Date(invoiceData.period);
    // format (mm/yyyy)
    const monthStr = `${String(periodDate.getMonth() + 1).padStart(2, "0")}/${periodDate.getFullYear()}`;

    const d = invoiceData.dueDate ? new Date(invoiceData.dueDate) : new Date();
    const dueDateStr = formatFullDate(d);

    let apartmentInfo = { name: "...", block: "..." };
    if (residentProfile && invoiceData.apartmentId) {
      const found = residentProfile.apartments.find(
        (a) => a.apartment.id === invoiceData.apartmentId,
      );
      if (found) {
        apartmentInfo = {
          name: found.apartment.name,
          block: found.apartment.block.name,
        };
      }
    }

    const successPayment = paymentHistory?.find((p) => p.status === "SUCCESS");
    let paymentInfo: { amount: number; method: string; date: string } | null =
      null;
    if (successPayment) {
      const payDate = successPayment.payDate
        ? new Date(successPayment.payDate)
        : new Date();
      const formattedPayDate = `${formatFullDate(payDate)} ${String(payDate.getHours()).padStart(2, "0")}:${String(payDate.getMinutes()).padStart(2, "0")}`;

      paymentInfo = {
        amount: Number(successPayment.amount),
        method: successPayment.paymentMethod,
        date: formattedPayDate,
      };
    }

    let fees = (invoiceData.invoiceDetails || []).map((detail) => {
      const nameLower = detail.feeTypeName.toLowerCase();
      let type = "default";
      if (nameLower.includes("điện")) type = "electricity";
      else if (nameLower.includes("nước")) type = "water";
      else if (nameLower.includes("quản lý")) type = "management";

      const reading = invoiceData.meterReadings?.find(
        (r) => r.feeTypeId === detail.feeTypeId,
      );

      let details: {
        old: number;
        new: number;
        usage: number;
        tiers: { name: string; usage: number; price: string; total: string }[];
        oldDateLabel: string;
        newDateLabel: string;
      } | null = null;
      let periodDisplay = monthStr; // hiển thị tháng (cho phí quản lý)

      if (reading) {
        let oldDate: Date;
        if (reading.oldIndexReadingDate) {
          oldDate = new Date(reading.oldIndexReadingDate);
        } else {
          const currentMonth = new Date(invoiceData.period);
          oldDate = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() - 1,
            20,
          );
        }

        const newDate = reading.readingDate
          ? new Date(reading.readingDate)
          : new Date();
        const oldDateLabel = formatShortDate(oldDate);
        const newDateLabel = formatShortDate(newDate);

        periodDisplay = `${oldDateLabel} - ${newDateLabel}`;

        const tiers: {
          name: string;
          usage: number;
          price: string;
          total: string;
        }[] = [];
        if (detail.calculationBreakdown) {
          for (const [key, value] of Object.entries(
            detail.calculationBreakdown,
          )) {
            if (value && typeof value === "string") {
              const parts = value.split("*");
              if (parts.length === 2) {
                const [usage, price] = parts;
                const total = Number(usage) * Number(price);
                tiers.push({
                  name: key,
                  usage: Number(usage),
                  price: Number(price).toLocaleString("vi-VN"),
                  total: total.toLocaleString("vi-VN"),
                });
              }
            }
          }
        }

        details = {
          old: Number(reading.oldIndex),
          new: Number(reading.newIndex),
          usage: Number(reading.usageAmount),
          tiers: tiers,
          oldDateLabel,
          newDateLabel,
        };
      }

      return {
        type,
        name: detail.feeTypeName,
        period: periodDisplay,
        amount: Number(detail.totalWithVat),
        preTax: Number(detail.totalPrice),
        vat: Number(detail.vatAmount),
        details,
        raw: detail,
      };
    });

    fees = fees.sort(
      (a, b) => (FEE_PRIORITY[a.type] || 4) - (FEE_PRIORITY[b.type] || 4),
    );

    return {
      ...invoiceData,
      month: monthStr,
      formattedDueDate: dueDateStr,
      apartmentInfo,
      paymentInfo,
      fees,
    };
  }, [invoiceData, residentProfile, paymentHistory]);

  if (isLoading || !processedData) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-[#F3F4F6]">
        <ActivityIndicator size="large" color={COLORS.main} />
      </SafeAreaView>
    );
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PAID":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          icon: CheckCircle,
          label: "Đã thanh toán",
        };
      case "OVERDUE":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          icon: AlertCircle,
          label: "Quá hạn",
        };
      default:
        return {
          bg: "bg-orange-100",
          text: "text-orange-700",
          icon: Clock,
          label: "Chưa thanh toán",
        };
    }
  };

  const statusInfo = getStatusStyle(processedData.status);
  const StatusIcon = statusInfo.icon;

  return (
    <SafeAreaView
      className="flex-1 bg-[#F3F4F6]"
      edges={["top", "left", "right"]}
    >
      <CustomHeader
        title="Chi tiết hóa đơn"
        backgroundColor="#F3F4F6"
        showBorder={false}
      >
        <View className="flex-row items-center justify-between px-3 pb-2 mt-2">
          <TouchableOpacity
            className="flex-row items-center"
            onPress={() => handleNavigate(navigationData.prevId)}
            disabled={!navigationData.prevId}
            style={{ opacity: navigationData.prevId ? 1 : 0.3 }}
          >
            <ChevronLeft size={18} color="black" />
            <Text className="text-xs ml-1 font-medium text-black">Trước</Text>
          </TouchableOpacity>

          <Text className="font-bold text-lg text-gray-800">
            Tháng {processedData.month}
          </Text>

          <TouchableOpacity
            className="flex-row items-center p-2"
            onPress={() => handleNavigate(navigationData.nextId)}
            disabled={!navigationData.nextId}
            style={{ opacity: navigationData.nextId ? 1 : 0.3 }}
          >
            <Text className="text-xs mr-1 font-medium text-black">Sau</Text>
            <ChevronRight size={18} color="black" />
          </TouchableOpacity>
        </View>
      </CustomHeader>

      <View className="h-[1px] bg-gray-200" />

      <ScrollView
        className="flex-1 px-4 py-2"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        <View className={`rounded-2xl p-4 mb-4 ${statusInfo.bg}`}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className={`text-xs ${statusInfo.text} mb-1 opacity-90`}>
                #{processedData.invoiceCode}
              </Text>

              <View className="flex-row items-center gap-2 mb-2">
                <StatusIcon
                  size={20}
                  className={statusInfo.text}
                  color="currentColor"
                />
                <Text className={`font-bold text-base ${statusInfo.text}`}>
                  {statusInfo.label}
                </Text>
              </View>

              <Text className={`text-[12px] ${statusInfo.text} opacity-80`}>
                Hạn: {processedData.formattedDueDate}
              </Text>
            </View>

            <Text className={`text-xl font-bold ${statusInfo.text}`}>
              {Math.round(Number(processedData.totalAmount)).toLocaleString(
                "vi-VN",
              )}{" "}
              đ
            </Text>
          </View>

          {processedData.paymentInfo && (
            <View className="mt-3 pt-3 border-t border-gray-400/20">
              <Text className={`text-sm ${statusInfo.text} mb-1`}>
                Số tiền:{" "}
                <Text className="font-bold">
                  {Math.round(
                    Number(processedData.paymentInfo.amount),
                  ).toLocaleString("vi-VN")}{" "}
                  VNĐ
                </Text>
              </Text>
              <Text className={`text-sm ${statusInfo.text} mb-1`}>
                Thời gian:{" "}
                <Text className="font-bold">
                  {processedData.paymentInfo.date}
                </Text>
              </Text>
              <Text className={`text-sm ${statusInfo.text}`}>
                Phương thức:{" "}
                <Text className="font-bold">
                  {processedData.paymentInfo.method}
                </Text>
              </Text>
            </View>
          )}
        </View>

        <SectionCard
          title="Thông tin chung"
          isOpen={sections.general}
          onToggle={() => toggleSection("general")}
        >
          <InfoRow label="Chủ hộ" value={residentProfile?.fullName || "..."} />
          <InfoRow label="Căn hộ" value={processedData.apartmentInfo.name} />
          <InfoRow label="Tòa" value={processedData.apartmentInfo.block} />
          <InfoRow label="Mã hóa đơn" value={processedData.invoiceCode} />
        </SectionCard>

        <SectionCard
          title="Tóm tắt chi phí"
          isOpen={sections.summary}
          onToggle={() => toggleSection("summary")}
        >
          {processedData.fees.map((item, idx) => {
            const IconData =
              ICONS[item.type as keyof typeof ICONS] || ICONS.default;
            return (
              <View key={idx} className="flex-row items-center py-3">
                <View
                  style={{ backgroundColor: IconData.bg }}
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                >
                  <IconData.icon size={20} color={IconData.color} />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-gray-800">{item.name}</Text>
                  <Text className="text-[11px] text-gray-500">
                    {item.period}
                  </Text>
                </View>
                <Text className="font-bold text-gray-700">
                  {/* hiển thị totalWithVat */}
                  {Math.round(item.amount).toLocaleString("vi-VN")} đ
                </Text>
              </View>
            );
          })}
          <View className="flex-row justify-between items-center pt-4 mt-2 border-t border-[#D9D9D9]">
            <Text
              className="font-bold text-base"
              style={{ color: COLORS.main }}
            >
              Tổng cộng
            </Text>
            <Text
              className="font-extrabold text-xl"
              style={{ color: COLORS.main }}
            >
              {Math.round(Number(processedData.totalAmount)).toLocaleString(
                "vi-VN",
              )}{" "}
              đ
            </Text>
          </View>
        </SectionCard>

        {/* chi tiết từng mục */}
        {processedData.fees.map((fee) => {
          if (!fee.details) return null;

          const preTaxAmount = fee.preTax;
          const vatAmount = fee.vat;
          const totalAmount = fee.amount;
          const hasVat = vatAmount > 0;

          const isElectricity = fee.type === "electricity";
          const isWater = fee.type === "water";

          const preTaxLabel = hasVat
            ? isElectricity
              ? "Tiền điện (chưa VAT):"
              : isWater
                ? "Tiền nước (chưa VAT):"
                : "Thành tiền (chưa VAT):"
            : "Thành tiền:";

          let vatLabel = "Thuế VAT:";
          if (isElectricity) vatLabel = "Thuế VAT (8%):";
          else if (isWater) vatLabel = "Thuế VAT (5%):";

          const ExtraHeader = (
            <TouchableOpacity
              onPress={() => handleShowTariff(fee.type)}
              className="flex-row items-center bg-[#EFEAE1]/35 px-3 py-1.5 rounded-full border border-[#E09B6B]/70 mr-2"
            >
              <FileText size={12} color="#E09B6B" />
              <Text className="text-[10.5px] font-bold text-[#E09B6B] ml-1">
                Biểu giá
              </Text>
            </TouchableOpacity>
          );

          return (
            <SectionCard
              key={fee.type}
              title={`Tiêu thụ ${fee.name.toLowerCase()}`}
              isOpen={sections[fee.type]}
              onToggle={() => toggleSection(fee.type)}
              extraComponent={ExtraHeader}
            >
              <View className="flex-row gap-3 mt-2 mb-5">
                <MetricBox
                  label={`Chỉ số cũ (${fee.details.oldDateLabel})`}
                  value={fee.details.old}
                />
                <MetricBox
                  label={`Chỉ số mới (${fee.details.newDateLabel})`}
                  value={fee.details.new}
                />
                <MetricBox
                  label="Tiêu thụ"
                  value={`${fee.details.usage} ${isElectricity ? "kWh" : "m³"}`}
                  isHighlight
                />
              </View>

              <GenericTable
                data={fee.details.tiers}
                columns={tierColumns}
                footerComponent={
                  <View className="gap-2">
                    {/* chưa VAT */}
                    <View className="flex-row justify-between">
                      <Text className="text-sm text-black">{preTaxLabel}</Text>
                      <Text className="text-sm font-bold">
                        {Math.round(preTaxAmount).toLocaleString("vi-VN")} đ
                      </Text>
                    </View>

                    {hasVat && (
                      <View className="flex-row justify-between">
                        <Text className="text-sm text-black">{vatLabel}</Text>
                        <Text className="text-sm font-bold">
                          {Math.round(vatAmount).toLocaleString("vi-VN")} đ
                        </Text>
                      </View>
                    )}

                    <View className="h-[1px] bg-[#D9D9D9] my-1" />

                    {/* tổng cộng đã tính vat */}
                    <View className="flex-row justify-between">
                      <Text className="font-bold text-main">Tổng cộng:</Text>
                      <Text className="font-bold text-base text-main">
                        {Math.round(totalAmount).toLocaleString("vi-VN")} đ
                      </Text>
                    </View>
                  </View>
                }
              />
            </SectionCard>
          );
        })}
      </ScrollView>

      {/* footer button */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white/95 border-t border-[#D9D9D9] px-5 pt-4 pb-8"
        style={{
          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: -5 },
        }}
      >
        <View className="flex-row gap-3">
          {processedData.status === "UNPAID" ||
          processedData.status === "OVERDUE" ? (
            <>
              <View className="flex-1">
                <MyButton
                  variant="secondary"
                  className="h-12 w-full"
                  onPress={() => {
                    const invoiceId = numericId;
                    const amount = Number(processedData.totalAmount);
                    const invoiceIds = JSON.stringify([invoiceId]);

                    // console.log("🔍 [DetailScreen] Navigating to payment/method:", {
                    //   invoiceId,
                    //   amount,
                    //   invoiceIds,
                    //   stringified: invoiceIds,
                    // });

                    router.push({
                      pathname: "/payment/method",
                      params: {
                        amount: String(amount),
                        invoiceIds: invoiceIds,
                        targetType: "INVOICE",
                      },
                    });
                  }}
                >
                  <Wallet size={18} color="white" style={{ marginRight: 8 }} />
                  <Text className="text-white font-bold text-base">
                    Thanh toán
                  </Text>
                </MyButton>
              </View>
            </>
          ) : null}
        </View>
      </View>

      <TariffModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        type={tariffType}
      />
    </SafeAreaView>
  );
}

const SectionCard = ({
  title,
  isOpen,
  onToggle,
  children,
  extraComponent,
}: any) => (
  <View className="bg-white rounded-2xl mb-4 shadow-sm border border-[#D9D9D9] overflow-hidden">
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      className="flex-row justify-between items-center p-4 bg-white"
    >
      <Text className="font-bold text-lg text-[#244B35]">{title}</Text>
      <View className="flex-row items-center">
        {extraComponent}
        {isOpen ? (
          <ChevronUp size={20} color="#9CA3AF" />
        ) : (
          <ChevronDown size={20} color="#9CA3AF" />
        )}
      </View>
    </TouchableOpacity>
    {isOpen && (
      <View className="px-5 pb-5 border-t border-[#D9D9D9]/50 pt-2">
        {children}
      </View>
    )}
  </View>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View className="flex-row justify-between py-2.5">
    <Text className="text-black text-sm">{label}</Text>
    <Text className="font-semibold text-black text-sm">{value}</Text>
  </View>
);

const MetricBox = ({ label, value, isHighlight }: any) => (
  <View
    className={`flex-1 rounded-xl p-3 items-center justify-center border border-[#D9D9D9] bg-white`}
  >
    <Text className="text-[10px] text-black mb-1 font-semibold text-center">
      {label}
    </Text>
    <Text
      className={`font-bold text-sm ${isHighlight ? "text-[#E09B6B]" : "text-main"}`}
    >
      {value}
    </Text>
  </View>
);
