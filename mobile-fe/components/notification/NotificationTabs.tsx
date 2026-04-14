import { NOTI_TABS } from '@/types/notification';
import { ScrollView, Text, TouchableOpacity } from 'react-native';

interface NotificationTabsProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
}

export default function NotificationTabs({
  activeTab,
  onChangeTab,
}: NotificationTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-4"
      contentContainerClassName="gap-2 px-5"
    >
      {NOTI_TABS.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChangeTab(tab.key)}
            className={`px-4 py-2.5 rounded-full ${
              isActive ? 'bg-[#244B35]' : 'bg-white border border-gray-200'
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                isActive ? 'text-white' : 'text-gray-700'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
