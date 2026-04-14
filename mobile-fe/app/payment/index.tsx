import { useLocalSearchParams, useRouter } from "expo-router";
import { CreditCard } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AccordionItem } from "@/components/payment/MonthInvoiceAccordion";
import MyButton from "@/components/ui/Button";
import { CustomHeader } from "@/components/ui/CustomHeader";
import { useResidentInvoices } from "@/hooks/useInvoice";

export default function PaymentDetailScreen() {
  const router = useRouter();
  const { filterIds } = useLocalSearchParams(); // nhận Ids từ trang trước

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const selectedIdsRef = useRef<number[]>([]);
  const { data: invoices, isLoading } = useResidentInvoices();

  // Update ref whenever selectedIds changes
  useEffect(() => {
    selectedIdsRef.current = selectedIds;
    console.log("📝 selectedIds updated in ref:", selectedIds);
  }, [selectedIds]);

  // Debug logging
  console.log("🔍 Payment Screen - Raw data received:", {
    count: invoices?.length,
    isLoading,
    type: typeof invoices,
    isArray: Array.isArray(invoices),
    firstItem: invoices?.[0],
    invoices: invoices?.map((i) => ({
      id: i.id,
      idType: typeof i.id,
      status: i.status,
      totalAmount: i.totalAmount,
    })),
  });

  // lọc hóa đơn cần thanh toán trong filterIds
  const unpaidInvoices = useMemo(() => {
    // Validate invoices data
    if (!Array.isArray(invoices)) {
      console.warn("⚠️  invoices is not an array:", typeof invoices);
      return [];
    }

    // Convert all invoice IDs to numbers (defensive programming for backend issues)
    const convertedInvoices = invoices.map((i) => {
      const convertedId = Number(i.id); // Convert string ID to number if needed
      return {
        ...i,
        id: convertedId,
      };
    });

    console.log("🔍 Converted invoice IDs to numbers:", {
      count: convertedInvoices.length,
      sample: convertedInvoices.slice(0, 2).map((i) => ({
        id: i.id,
        idType: typeof i.id,
        isValid: !isNaN(i.id),
      })),
    });

    // Filter by status
    let list = convertedInvoices.filter((i) => {
      const isValid =
        i &&
        !isNaN(i.id) &&
        i.id > 0 &&
        (i.status === "UNPAID" || i.status === "OVERDUE");
      if (!isValid) {
        console.warn("⚠️  Skipping invalid invoice:", i);
      }
      return isValid;
    });

    console.log("🔍 Filtered to UNPAID/OVERDUE:", {
      count: list.length,
      ids: list.map((i) => i.id),
      validIds: list.filter((i) => typeof i.id === "number").map((i) => i.id),
    });

    // Further filter by filterIds if provided
    if (filterIds) {
      try {
        const ids = JSON.parse(filterIds as string);
        if (Array.isArray(ids) && ids.length > 0) {
          list = list.filter((inv) => ids.includes(inv.id));
          console.log("🔍 After filterIds filter:", {
            count: list.length,
            ids: list.map((i) => i.id),
          });
        }
      } catch (e) {
        console.error("❌ Lỗi parse filterIds", e);
      }
    }

    console.log("✅ Final unpaidInvoices:", {
      count: list.length,
      ids: list.map((i) => i.id),
      allValid: list.every((i) => typeof i.id === "number"),
    });

    return list;
  }, [invoices, filterIds]);

  // Auto-select all unpaid invoices (use useEffect, not useMemo!)
  useEffect(() => {
    console.log("🔍 Auto-select effect triggered:", {
      unpaidCount: unpaidInvoices.length,
      selectedCount: selectedIds.length,
      unpaidIds: unpaidInvoices.map((i) => ({
        id: i.id,
        type: typeof i.id,
      })),
    });

    if (unpaidInvoices.length > 0 && selectedIds.length === 0) {
      // Validate all IDs are numbers
      const validIds = unpaidInvoices
        .filter((i) => typeof i.id === "number" && i.id > 0)
        .map((i) => i.id);

      if (validIds.length === 0) {
        console.error("❌ No valid invoice IDs found!");
        return;
      }

      console.log("✅ Auto-selecting invoices:", {
        newIds: validIds,
        count: validIds.length,
        types: validIds.map((id) => typeof id),
      });

      setSelectedIds(validIds);
      selectedIdsRef.current = validIds;
    }
  }, [unpaidInvoices]); // Only depend on unpaidInvoices, not selectedIds

  const handleToggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleGoToDetail = (invoiceId: number) => {
    router.push({
      pathname: "/payment/detail/[id]",
      params: { id: invoiceId },
    });
  };

  // tính tổng tiền hóa đơn được chọn
  const totalPay = useMemo(() => {
    return unpaidInvoices
      .filter((bill) => selectedIds.includes(bill.id))
      .reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
  }, [selectedIds, unpaidInvoices]);

  return (
    <SafeAreaView className="flex-1 bg-[#F3F4F6]">
      <CustomHeader
        title="Chi tiết thanh toán"
        showBackButton
        backgroundColor="#F3F4F6"
      />

      <View className="px-4">
        <View className="bg-main p-6 rounded-2xl items-center shadow-sm">
          <Text className="text-gray-300 text-xs mb-2">Số tiền cần thanh toán</Text>
          <Text className="text-white text-3xl font-bold">
            {Math.round(totalPay).toLocaleString("vi-VN")} đ
          </Text>
        </View>

        <View className="mt-4 mb-2">
          <MyButton
            variant="secondary"
            className="w-full h-12 shadow-md"
            disabled={selectedIds.length === 0}
            onPress={() => {
              const idsFromState = selectedIds;
              const idsFromRef = selectedIdsRef.current;

              console.log("� === BUTTON CLICK DEBUG ===");
              console.log("  State:", {
                value: idsFromState,
                length: idsFromState.length,
                types: idsFromState.map((id) => typeof id),
                allNumbers: idsFromState.every((id) => typeof id === "number"),
              });
              console.log("  Ref:", {
                value: idsFromRef,
                length: idsFromRef.length,
                types: idsFromRef.map((id) => typeof id),
                allNumbers: idsFromRef.every((id) => typeof id === "number"),
              });
              console.log("  Total:", {
                value: totalPay,
                type: typeof totalPay,
              });

              // Validate and convert IDs to ensure they are always numbers
              const validateAndConvertIds = (ids: any[]) => {
                if (!Array.isArray(ids)) {
                  console.error("❌ IDs is not array");
                  return [];
                }
                if (ids.length === 0) {
                  console.error("❌ IDs array is empty");
                  return [];
                }

                const convertedIds = ids
                  .map((id) => {
                    const numId = Number(id); // Convert string IDs to numbers
                    const isValid = !isNaN(numId) && numId > 0;
                    if (!isValid) {
                      console.warn("⚠️  Invalid ID:", {
                        original: id,
                        converted: numId,
                        type: typeof id,
                      });
                    }
                    return isValid ? numId : null;
                  })
                  .filter((id) => id !== null);

                return convertedIds;
              };

              // Use state first, fallback to ref
              let finalIds = validateAndConvertIds(idsFromState);
              if (finalIds.length === 0) {
                console.warn("⚠️  State IDs invalid, trying ref...");
                finalIds = validateAndConvertIds(idsFromRef);
              }

              if (finalIds.length === 0) {
                console.error("❌ ERROR: No valid invoice IDs found!");
                console.error("❌ Cannot navigate to payment/method");
                return;
              }

              const amount = Math.round(totalPay);
              // Ensure IDs are numbers before stringifying
              const idsAsNumbers = finalIds.map((id) => Number(id));
              const stringifiedIds = JSON.stringify(idsAsNumbers);

              console.log("✅ === VALIDATED DATA ===");
              console.log("  Final IDs:", {
                value: finalIds,
                length: finalIds.length,
                types: finalIds.map((id) => typeof id),
              });
              console.log("  Amount:", {
                value: String(amount),
                type: typeof String(amount),
              });
              console.log("  Stringified:", {
                value: stringifiedIds,
                type: typeof stringifiedIds,
                parseTest: (() => {
                  try {
                    const parsed = JSON.parse(stringifiedIds);
                    return {
                      parsed,
                      isArray: Array.isArray(parsed),
                      length: parsed.length,
                    };
                  } catch (e) {}
                })(),
              });

              console.log("✅ Navigation to payment/method with:", {
                amount: String(amount),
                invoiceIds: stringifiedIds,
                selectedIds: finalIds,
                selectedLength: finalIds.length,
                targetType: "INVOICE",
              });

              router.push({
                pathname: "/payment/method",
                params: {
                  amount: String(amount),
                  invoiceIds: stringifiedIds,
                  targetType: "INVOICE",
                },
              });
            }}
          >
            <CreditCard size={20} color="white" style={{ marginRight: 5 }} />
            <Text className="text-white font-bold text-base">
              Thanh toán ({selectedIds.length} hóa đơn)
            </Text>
          </MyButton>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 mt-2" showsVerticalScrollIndicator={false}>
        <Text className="text-lg font-bold text-main mb-4">
          Chọn hóa đơn ({unpaidInvoices.length})
        </Text>

        {isLoading ? (
          <ActivityIndicator color="#244B35" />
        ) : (
          unpaidInvoices.map((bill) => (
            <AccordionItem
              key={bill.id}
              data={bill}
              isSelected={selectedIds.includes(bill.id)}
              onToggleSelect={() => handleToggle(bill.id)}
              onPressDetail={() => handleGoToDetail(bill.id)}
            />
          ))
        )}

        {unpaidInvoices.length === 0 && !isLoading && (
          <Text className="text-center text-gray-400 mt-10">
            Không có hóa đơn nào cần thanh toán
          </Text>
        )}

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
