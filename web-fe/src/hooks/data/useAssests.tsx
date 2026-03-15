import {
	createAsset,
	createAssetType,
	deleteAsset,
	deleteManyAssets,
	deleteAssetType,
	deleteManyAssetTypes,
	getAssetById,
	getAssets,
	getAssetTypeById,
	getAssetTypes,
	updateAsset,
	updateAssetType,
} from "@/services/assests.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Asset Hooks
export const useAssets = () => {
	return useQuery({
		queryKey: ["assets"],
		queryFn: getAssets,
	});
};

export const useGetAssetById = (id: number) => {
	return useQuery({
		queryKey: ["asset", id],
		queryFn: () => getAssetById(id),
		enabled: !!id,
	});
};

export const useCreateAsset = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createAsset,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["assets"] });
		},
	});
};

export const useUpdateAsset = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateAsset,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["assets"] });
			queryClient.invalidateQueries({ queryKey: ["asset"] });
		},
	});
};

export const useDeleteAsset = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteAsset,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["assets"] });
		},
	});
};

export const useDeleteManyAssets = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (ids: number[]) => deleteManyAssets(ids),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["assets"] });
		},
	});
};

// AssetType Hooks
export const useAssetTypes = () => {
	return useQuery({
		queryKey: ["assetTypes"],
		queryFn: getAssetTypes,
	});
};

export const useGetAssetTypeById = (id: number) => {
	return useQuery({
		queryKey: ["assetType", id],
		queryFn: () => getAssetTypeById(id),
		enabled: !!id,
	});
};

export const useCreateAssetType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: createAssetType,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["assetTypes"] });
		},
	});
};

export const useUpdateAssetType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: updateAssetType,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["assetTypes"] });
			queryClient.invalidateQueries({ queryKey: ["assetType"] });
		},
	});
};

export const useDeleteAssetType = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteAssetType,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["assetTypes"] });
		},
	});
};

export const useDeleteManyAssetTypes = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (ids: number[]) => deleteManyAssetTypes(ids),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["assetTypes"] });
		},
	});
};
