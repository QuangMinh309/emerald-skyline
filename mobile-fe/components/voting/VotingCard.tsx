import { Voting } from "@/types/voting";
import { differenceInDays, format } from "date-fns";
import { Text, TouchableOpacity, View } from "react-native";

interface VotingCardProps {
  voting: Voting;
  onPressVote: (voting: Voting) => void;
  onPressResult: (voting: Voting) => void;
}

export default function VotingCard({
  voting,
  onPressVote,
  onPressResult,
}: VotingCardProps) {
  const safeFormat = (dateStr: string | undefined, formatStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? "N/A" : format(date, formatStr);
  };

  const startDate = safeFormat(voting.start_time, "dd/MM/yyyy - HH:mm");
  const endDate = safeFormat(voting.end_time, "dd/MM/yyyy - HH:mm");

  const getRemainingDays = () => {
    const diff = differenceInDays(new Date(voting.end_time), new Date());
    return diff > 0 ? `Còn ${diff} ngày` : "Hết hạn hôm nay";
  };

  const getStatusBadge = () => {
    const statusConfig = {
      ONGOING: { text: getRemainingDays(), bg: "bg-orange-500" },
      UPCOMING: { text: "Sắp diễn ra", bg: "bg-amber-400" },
      ENDED: { text: "Đã kết thúc", bg: "bg-red-500" },
    };

    const config = statusConfig[voting.status || "ONGOING"];

    return (
      <View className={`${config.bg} px-3 py-1 rounded-md`}>
        <Text className="text-white text-xs font-medium">{config.text}</Text>
      </View>
    );
  };

  const renderActionButton = () => {
    const status = voting.status;

    if (status === "ENDED") {
      return (
        <TouchableOpacity
          className="bg-[#244B35] px-6 py-2 rounded-lg"
          onPress={() => onPressResult(voting)}
        >
          <Text className="text-white font-semibold text-sm">Xem kết quả</Text>
        </TouchableOpacity>
      );
    }

    const isUpcoming = status === "UPCOMING";

    // For ONGOING: show both "Biểu quyết" and "Xem kết quả" buttons
    if (status === "ONGOING") {
      return (
        <View className="flex-row gap-2">
          <TouchableOpacity
            className="px-4 py-2 rounded-lg bg-[#244B35]"
            onPress={() => onPressVote(voting)}
          >
            <Text className="text-white font-semibold text-sm">Biểu quyết</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="px-4 py-2 rounded-lg border border-[#244B35]"
            onPress={() => onPressResult(voting)}
          >
            <Text className="text-[#244B35] font-semibold text-sm">
              Xem kết quả
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity
        className={`px-6 py-2 rounded-lg ${isUpcoming ? "bg-gray-300" : "bg-[#244B35]"}`}
        disabled={isUpcoming}
        onPress={() => onPressVote(voting)}
      >
        <Text className="text-white font-semibold text-sm">Biểu quyết</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center mb-2 flex-wrap gap-2">
          <Text className="text-gray-500 text-xs">
            {safeFormat(voting?.created_at, "dd/MM/yyyy")}
          </Text>
          {voting.is_required && (
            <View className="flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1" />
              <Text className="text-xs font-bold text-red-500"> BẮT BUỘC</Text>
            </View>
          )}
        </View>

        {getStatusBadge()}
      </View>

      <Text className="text-base font-bold text-gray-800 mb-2">
        {voting.title}
      </Text>

      <Text className="text-sm text-gray-600 mb-3">{voting.content}</Text>

      {voting.voted_option && (
        <Text className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg mb-2">
          Bạn đã chọn:{" "}
          <Text className="font-medium text-green-800">
            {voting.voted_option.name}
          </Text>
        </Text>
      )}

      <View className="bg-gray-50 p-3 rounded-md mb-3">
        <Text className="text-xs font-semibold text-gray-700 mb-1">
          Thời gian:
        </Text>
        <Text className="text-xs text-gray-600">• Bắt đầu: {startDate}</Text>
        <Text className="text-xs text-gray-600">• Kết thúc: {endDate}</Text>
      </View>

      <View className="flex-row justify-end items-center mt-1">
        {renderActionButton()}
      </View>
    </View>
  );
}
