import { getResidentProfile, updateResidentProfile } from "@/services/resident.service";
import { UpdateResidentPayload } from "@/types/resident";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useResidentProfile = () => {
  return useQuery({
    queryKey: ["resident-me"],
    queryFn: getResidentProfile,
  });
};

export const useUpdateResident = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateResidentPayload }) =>
      updateResidentProfile(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resident-me"] });
    },
  });
};
