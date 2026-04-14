import { CustomHeader } from "@/components/ui/CustomHeader";
import { VotingService } from "@/services/voting.service";
import { Voting, VotingStatus } from "@/types/voting";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import VotingCard from "../../components/voting/VotingCard";
import StatusTabs from "../../components/voting/VotingStatusTabs";

export default function VotingScreen() {
  const [activeStatus, setActiveStatus] = useState<VotingStatus>("ONGOING");

  const {
    data: votings = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["votings"],
    queryFn: async () => {
      const response = await VotingService.getMine();
      return response.data;
    },
  });

  const filteredVotings = votings.filter((v) => v.status === activeStatus);

  const counts = {
    ONGOING: votings.filter((v) => v.status === "ONGOING").length,
    UPCOMING: votings.filter((v) => v.status === "UPCOMING").length,
    ENDED: votings.filter((v) => v.status === "ENDED").length,
  };

  const handlePressVote = (voting: Voting) => {
    router.push({
      pathname: "/voting/[id]",
      params: { id: voting.id },
    });
  };

  const handlePressResult = (voting: Voting) => {
    router.push({
      pathname: "/voting/result/[id]",
      params: { id: voting.id },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <CustomHeader title="E-Voting" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} />
        }
      >
        <View className="px-5 py-4">
          <StatusTabs
            activeStatus={activeStatus}
            onChangeStatus={setActiveStatus}
            counts={counts}
          />

          {filteredVotings.length === 0 ? (
            <View className="py-10 items-center">
              <Text className="text-gray-500">
                Không có biểu quyết nào trong mục này
              </Text>
            </View>
          ) : (
            filteredVotings.map((voting) => (
              <VotingCard
                key={voting.id}
                voting={voting}
                onPressVote={handlePressVote}
                onPressResult={handlePressResult}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
