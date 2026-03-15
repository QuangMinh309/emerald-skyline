import axiosInstance from "@/lib/axios";

type CloudinaryUploadResponse = {
	secure_url?: string;
	url?: string;
};

export const uploadImage = async (file: File): Promise<string> => {
	const formData = new FormData();
	formData.append("file", file);

	const res = await axiosInstance.post("/upload", formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});

	const payload = (res.data?.data ?? res.data) as CloudinaryUploadResponse;
	const url = payload?.secure_url || payload?.url;

	if (!url) {
		throw new Error("Không nhận được URL ảnh");
	}

	return url;
};
