import { VotingStatus } from "@/types/voting";
import { Text, TouchableOpacity, View } from "react-native";

interface StatusTabsProps {
  activeStatus: VotingStatus;
  onChangeStatus: (status: VotingStatus) => void;
  counts?: {
    ONGOING: number;
    UPCOMING: number;
    ENDED: number;
  };
}

const TABS = [
  { key: "ONGOING" as VotingStatus, label: "Đang diễn ra" },
  { key: "UPCOMING" as VotingStatus, label: "Sắp diễn ra" },
  { key: "ENDED" as VotingStatus, label: "Đã kết thúc" },
];

export default function StatusTabs({
  activeStatus,
  onChangeStatus,
  counts,
}: StatusTabsProps) {
  return (
    <View className="flex-row gap-2 mb-4">
      {TABS.map((tab) => {
        const isActive = activeStatus === tab.key;
        const count = counts?.[tab.key] || 0;

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChangeStatus(tab.key)}
            className={`flex-1 py-2.5 px-2 rounded-full ${
              isActive ? "bg-[#244B35]" : "bg-gray-100"
            }`}
          >
            <Text
              className={`text-center text-sm font-medium ${
                isActive ? "text-white" : "text-gray-600"
              }`}
            >
              {tab.label} ({count})
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
