import axiosInstance from "@/lib/axios";
// nao chi can sua service là xong
export const readIdentity = async (file: File) => {
	const formData = new FormData();
	formData.append("file", file);
	const response = await axiosInstance.post("ai/ocr/read-cccd", formData, {
		headers: {
			"Content-Type": file.type,
		},
	});
	return response.data.data.data as {
		name: string;
		date_of_birth: string;
		gender: string;
		nationality: string;
		id_number: string;
		native_place: string;
		place_of_residence: string;
		date_expiration: string;
		overall_confidence: number;
	};
};
