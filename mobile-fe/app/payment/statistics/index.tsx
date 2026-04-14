import MyButton from "@/components/ui/Button";
import { CustomHeader } from "@/components/ui/CustomHeader";
import { GenericTable } from "@/components/ui/Table";
import { useMonthlyReports } from "@/hooks/useMonthlyReport";
import { Droplets, Wallet, Zap } from "lucide-react-native";
import { useMemo } from "react";
import { ActivityIndicator, Dimensions, ScrollView, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";
import statisticsColumns from "./columns";

const screenWidth = Dimensions.get("window").width;

const COLORS = {
  elec: "#FACC15",
  water: "#3B82F6",
  total: "#244B35",
  service: "#F97316",
  grid: "#D1D5DB",
  text: "#6B7280",
};

// format số tiền
const formatCurrencyShort = (value: number) => {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1).replace(".0", "") + " tỷ";
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace(".0", "") + " tr";
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(0) + "K";
  }
  return value.toString();
};

// format tiền cho bảng
const formatCurrencyFull = (value: number) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// chuyển "2025-01" -> "T1"
const formatMonthLabel = (dateStr: string) => {
  const [_year, month] = dateStr.split("-");
  return `T${parseInt(month, 10)}`;
};

// chuyển "2025-01" -> "T01/2025"
const formatMonthFull = (dateStr: string) => {
  const [year, month] = dateStr.split("-");
  return `T${month}/${year}`;
};

export default function StatisticsScreen() {
  const { data: reportData, isLoading, isError, refetch } = useMonthlyReports();

  const { chartData, tableData, summaryStats } = useMemo(() => {
    if (!reportData || !reportData.data || reportData.data.length === 0) {
      return {
        chartData: null,
        tableData: [],
        summaryStats: { avgElec: "0", avgWater: "0", avgTotal: "0" },
      };
    }

    const rawList = reportData.data;

    const chartLabels = rawList.map((item) => formatMonthLabel(item.month));
    const dataTotal = rawList.map((item) => item.totalRevenue);
    const dataElec = rawList.map((item) => item.electricityRevenue);
    const dataWater = rawList.map((item) => item.waterRevenue);
    const dataService = rawList.map((item) => item.managementFeeRevenue);

    const chartDataObj = {
      labels: chartLabels,
      datasets: [
        {
          data: dataTotal,
          color: () => `rgba(36, 75, 53, 1)`,
          strokeWidth: 2.5,
        },
        {
          data: dataElec,
          color: () => `rgba(250, 204, 21, 1)`,
          strokeWidth: 2.5,
        },
        {
          data: dataWater,
          color: () => `rgba(59, 130, 246, 1)`,
          strokeWidth: 2.5,
        },
        {
          data: dataService,
          color: () => `rgba(249, 115, 22, 1)`,
          strokeWidth: 2.5,
        },
      ],
    };

    // đưa tháng mới nhất lên trước
    const reversedList = [...rawList].reverse();
    const tableDataObj = reversedList.map((item) => ({
      month: formatMonthFull(item.month),
      elec: formatCurrencyFull(item.electricityRevenue),
      water: formatCurrencyFull(item.waterRevenue),
      service: formatCurrencyFull(item.managementFeeRevenue),
      total: formatCurrencyFull(item.totalRevenue),
    }));

    const count = rawList.length;
    const totalElecSum = rawList.reduce((sum, item) => sum + item.electricityRevenue, 0);
    const totalWaterSum = rawList.reduce((sum, item) => sum + item.waterRevenue, 0);
    const avgTotalVal = reportData.averageMonthlyRevenue || 0;

    const summaryStatsObj = {
      avgElec: formatCurrencyShort(count > 0 ? Math.round(totalElecSum / count) : 0),
      avgWater: formatCurrencyShort(count > 0 ? Math.round(totalWaterSum / count) : 0),
      avgTotal: formatCurrencyShort(avgTotalVal),
    };

    return {
      chartData: chartDataObj,
      tableData: tableDataObj,
      summaryStats: summaryStatsObj,
    };
  }, [reportData]);

  // cấu hình chart
  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(36, 75, 53, ${opacity})`,
    decimalPlaces: 0,
    // dùng hàm format rút gọn cho trục Y
    formatYLabel: (val: string) => formatCurrencyShort(Number(val)),
    propsForDots: {
      r: "5",
      strokeWidth: "2.5",
      stroke: "#fff",
    },
    propsForBackgroundLines: {
      strokeDasharray: "",
      stroke: COLORS.grid,
      strokeWidth: 0.8,
      opacity: 0.3,
    },
    propsForLabels: {
      fontSize: 12,
      fontWeight: "500",
    },
    labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
    fillShadowGradientFrom: "#ffffff",
    fillShadowGradientTo: "#ffffff",
    fillShadowGradientFromOpacity: 0,
    fillShadowGradientToOpacity: 0,
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F3F4F6]">
      <CustomHeader title="Thống kê" showBorder={false} backgroundColor="#F3F4F6" />

      <ScrollView className="flex-1 px-4 pt-1" showsVerticalScrollIndicator={false}>
        <Text className="text-center text-gray-500 text-sm mb-5 font-medium">
          So sánh chi phí 6 tháng gần nhất
        </Text>

        {isLoading ? (
          <View className="h-60 justify-center items-center">
            <ActivityIndicator size="large" color={COLORS.total} />
            <Text className="text-gray-400 mt-2">Đang tải dữ liệu...</Text>
          </View>
        ) : isError ? (
          <View className="h-60 justify-center items-center">
            <Text className="text-red-500 mb-2 font-medium">Không thể tải báo cáo</Text>
            <MyButton onPress={() => refetch()} className="px-6">
              Thử lại
            </MyButton>
          </View>
        ) : !chartData ? (
          <View className="h-60 justify-center items-center">
            <Text className="text-gray-400">Chưa có dữ liệu thống kê</Text>
          </View>
        ) : (
          <>
            <View className="flex-row justify-between gap-3 mb-6">
              <SummaryCard
                icon={Zap}
                color="#FACC15"
                label="Điện TB"
                value={summaryStats.avgElec}
              />
              <SummaryCard
                icon={Droplets}
                color="#3B82F6"
                label="Nước TB"
                value={summaryStats.avgWater}
              />
              <SummaryCard
                icon={Wallet}
                color="#244B35"
                label="Tổng TB"
                value={summaryStats.avgTotal}
              />
            </View>

            <Text className="font-bold text-lg text-main mb-3">Biểu đồ biến động</Text>
            <View className="bg-white rounded-2xl p-4 shadow-sm mb-6">
              {/* chú thích */}
              <View className="flex-row flex-wrap justify-center gap-x-4 gap-y-2 mb-4 px-2 mt-3">
                <LegendItem color={COLORS.total} label="Tổng tiền" />
                <LegendItem color={COLORS.elec} label="Điện" />
                <LegendItem color={COLORS.water} label="Nước" />
                <LegendItem color={COLORS.service} label="Phí QL" />
              </View>

              <View className="items-center overflow-hidden">
                <LineChart
                  data={chartData}
                  width={screenWidth - 35}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  withDots={true}
                  withInnerLines={true}
                  withOuterLines={false}
                  withVerticalLines={false}
                  withHorizontalLabels={true}
                  withShadow={false}
                  fromZero
                  segments={4}
                  yAxisInterval={1}
                  formatYLabel={(val) => formatCurrencyShort(Number(val))}
                />
              </View>
            </View>

            <View className="mb-10">
              <GenericTable
                title="Bảng chi tiết"
                data={tableData}
                columns={statisticsColumns}
              />
              <View className="mt-2.5">
                <Text className="text-[11px] text-gray-500 text-center">
                  Đơn vị tính: VNĐ
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const SummaryCard = ({ icon: Icon, color, label, value }: any) => (
  <View className="bg-white flex-1 p-3 rounded-2xl shadow-sm items-center justify-center border border-gray-100">
    <View className="p-2 rounded-full mb-2" style={{ backgroundColor: `${color}15` }}>
      <Icon size={18} color={color} />
    </View>
    <Text className="text-[11px] text-gray-500 text-center mb-1 font-medium">
      {label}
    </Text>
    <Text className="text-sm font-bold text-gray-800 text-center">{value}</Text>
  </View>
);

const LegendItem = ({ color, label }: any) => (
  <View className="flex-row items-center">
    <View className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: color }} />
    <Text className="text-[11.5px] text-gray-500 font-medium">{label}</Text>
  </View>
);
