import axiosInstance from "@/lib/axios";
import type { Asset, AssetDetail, AssetType } from "@/types/asset";
// nao chi can sua service là xong
export const getAssets = async () => {
	const response = await axiosInstance.get("/assets");
	return response.data.data as Asset[];
};
export const createAsset = async (assetData: {
	name: string;
	typeId: number;
	blockId: number;
	floor: number;
	locationDetail: string;
	status: string;
	installationDate: string;
	warrantyYears: number;
	note?: string;
	maintenanceIntervalMonths: number;
}) => {
	const response = await axiosInstance.post("/assets", assetData);
	console.log("Created asset response:", assetData);
	return response.data.data as Asset;
};
export const updateAsset = async ({
	id,
	data,
}: {
	id: number;
	data: {
		name: string;
		typeId: number;
		blockId: number;
		floor: number;
		locationDetail: string;
		status: string;
		installationDate: string;
		warrantyYears: number;
		note?: string;
		maintenanceIntervalMonths: number;
	};
}) => {
	console.log("Update asset called with id:", id, "and data:", data);
	const response = await axiosInstance.patch(`/assets/${id}`, data);
	return response.data.data as Asset;
};
export const deleteAsset = async (assetId: number) => {
	const response = await axiosInstance.delete(`/assets/${assetId}`);
	return response.data;
};

export const deleteManyAssets = async (ids: number[]) => {
	const response = await axiosInstance.post(`/assets/delete-many`, { ids });
	return response.data;
};

export const getAssetById = async (id: number) => {
	const response = await axiosInstance.get(`/assets/${id}`);
	return response.data.data as AssetDetail;
};

// AssetType Services
export const getAssetTypes = async (): Promise<AssetType[]> => {
	const response = await axiosInstance.get("/asset-types");
	return response.data.data as AssetType[];
};

export const getAssetTypeById = async (id: number): Promise<AssetType> => {
	const response = await axiosInstance.get(`/asset-types/${id}`);
	return response.data.data as AssetType;
};

export const createAssetType = async (assetTypeData: {
	name: string;
	description?: string;
}): Promise<AssetType> => {
	const response = await axiosInstance.post("/asset-types", assetTypeData);
	return response.data.data as AssetType;
};

export const updateAssetType = async ({
	id,
	data,
}: {
	id: number;
	data: {
		name: string;
		description?: string;
	};
}): Promise<AssetType> => {
	const response = await axiosInstance.patch(`/asset-types/${id}`, data);
	return response.data.data as AssetType;
};

export const deleteAssetType = async (assetTypeId: number) => {
	const response = await axiosInstance.delete(`/asset-types/${assetTypeId}`);
	return response.data;
};

export const deleteManyAssetTypes = async (ids: number[]) => {
	const response = await axiosInstance.post(`/asset-types/delete-many`, {
		ids,
	});
	return response.data;
};
