import { CustomHeader } from '@/components/ui/CustomHeader';
import { VotingService } from '@/services/voting.service';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

const CHART_COLORS = [
  '#5B8C5A', // Green
  '#8FBC94', // Light green
  '#C8E6C9', // Very light green
  '#A5D6A7', // Pale green
  '#81C784', // Medium green
];

export default function VotingResultScreen() {
  const { id } = useLocalSearchParams();

  const { data: result, isLoading } = useQuery({
    queryKey: ['result', id],
    queryFn: async () => {
      const response = await VotingService.getStatistics(Number(id));
      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading)
    return <ActivityIndicator className="flex-1 justify-center items-center" />;

  if (!result) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <Text>Không tìm thấy biểu quyết</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalVotes = result.options.reduce(
    (sum: number, opt: any) => sum + (opt.vote_count || 0),
    0
  );

  const chartData = result.options.map((option: any, index: number) => ({
    name: option.name?.toString() || '',
    population: option.total_area || 0,
    color: CHART_COLORS[index % CHART_COLORS.length],
    legendFontColor: '#374151',
    legendFontSize: 12,
  }));

  const winningOption =
    result.options.length > 0
      ? result.options.reduce((prev: any, current: any) =>
          (prev.total_area || 0) > (current.total_area || 0) ? prev : current
        )
      : null;

  const participationRate =
    result.total > 0
      ? ((result.voted_area / result.total) * 100).toFixed(2)
      : '0.00';

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <CustomHeader title="Kết quả" />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-4">
          <Text className="text-lg font-bold text-gray-800 mb-8 text-center">
            {result.title}
          </Text>

          <View className="bg-white rounded-lg p-4 mb-4 items-center">
            <Text className="text-sm text-gray-600 mb-1">
              Tổng số lượt bình chọn
            </Text>
            <Text className="text-3xl font-bold text-[#244B35]">
              {totalVotes}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">lượt bỏ phiếu</Text>
          </View>

          <View className="bg-white rounded-lg p-4 mb-4 items-center">
            <Text className="text-sm text-gray-600 mb-1">
              Tổng số m² bỏ phiếu
            </Text>
            <Text className="text-3xl font-bold text-[#244B35]">
              {result.voted_area} / {result.total}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              m² bỏ phiếu ({participationRate}% tỷ lệ tham gia)
            </Text>
          </View>

          {totalVotes > 0 && (
            <View className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-4">
              <Text className="text-sm font-semibold text-green-800 mb-1">
                🎉 Phương án dẫn đầu
              </Text>
              <Text className="text-base font-bold text-green-900">
                {winningOption.name}
              </Text>
              <Text className="text-sm text-green-700 mt-2">
                Với {winningOption.vote_count} lượt bỏ phiếu ({' '}
                {winningOption.total_area} m²,{' '}
                {result.voted_area > 0
                  ? (
                      (winningOption.total_area / result.voted_area) *
                      100
                    ).toFixed(2)
                  : '0.00'}
                %)
              </Text>
            </View>
          )}

          {totalVotes > 0 && (
            <View className="bg-white rounded-lg p-4 mb-4 items-center">
              <View className="flex-row items-center">
                <View className="flex-1 mr-4">
                  <PieChart
                    data={chartData}
                    width={Dimensions.get('window').width - 0.6 - 40}
                    height={220}
                    chartConfig={{
                      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                    hasLegend={false}
                  />
                </View>
                <View className="w-32 ">
                  {result.options.map((option: any, index: number) => {
                    const newPercentage =
                      result.voted_area > 0
                        ? (
                            (option.total_area / result.voted_area) *
                            100
                          ).toFixed(2)
                        : '0.00';

                    return (
                      <View
                        key={option.id}
                        className="flex-row items-center mb-2"
                      >
                        <View
                          className="w-4 h-4 rounded-full mr-2"
                          style={{
                            backgroundColor:
                              CHART_COLORS[index % CHART_COLORS.length],
                          }}
                        />
                        <Text className="text-sm text-gray-700 flex-1">
                          {option.name.replace('Phương án ', 'PA ')}:{' '}
                          {option.total_area || 0} m² ({newPercentage}%)
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          <View className="bg-white rounded-lg p-4 mb-4">
            {result.options.map((option: any, index: number) => {
              const percentage =
                result.voted_area > 0
                  ? ((option.total_area / result.voted_area) * 100).toFixed(2)
                  : '0.00';
              const isWinner =
                winningOption &&
                option.id === winningOption.id &&
                totalVotes > 0;
              const progressWidth =
                `${Math.min(Number(percentage), 100)}%` as const;

              return (
                <View
                  key={`option-${option.id || index}-${index}`}
                  className={`mb-4 pb-4 ${
                    index < result.options.length - 1
                      ? 'border-b border-gray-100'
                      : ''
                  }`}
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 flex-row items-center">
                      <View
                        className="w-3 h-3 rounded-full mr-2"
                        style={{
                          backgroundColor:
                            CHART_COLORS[index % CHART_COLORS.length],
                        }}
                      />
                      <Text
                        className={`flex-1 text-sm ${
                          isWinner
                            ? 'font-bold text-[#244B35]'
                            : 'text-gray-700'
                        }`}
                      >
                        {option.name}
                      </Text>
                    </View>
                    <Text
                      className={`text-sm font-bold ml-2 ${
                        isWinner ? 'text-[#244B35]' : 'text-gray-600'
                      }`}
                    >
                      {percentage}%
                    </Text>
                  </View>

                  <View className="bg-gray-100 h-2 rounded-full overflow-hidden">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: progressWidth,
                        backgroundColor:
                          CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />
                  </View>

                  <Text className="text-xs text-gray-500 mt-1">
                    {option.vote_count || 0} lượt bỏ phiếu
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    {option.total_area || 0} m² bỏ phiếu
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
