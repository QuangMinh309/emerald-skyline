import axiosInstance from "@/lib/axios";
import type {
	Resident,
	ResidentDetail,
	ResidentResidences,
} from "@/types/resident";
// nao chi can sua service là xong
export const getResidents = async () => {
	const response = await axiosInstance.get("/residents");
	return response.data.data as Resident[];
};
export const createResident = async (residentData: {
	email: string;
	fullName: string;
	citizenId: string;
	dob: string;
	gender: string;
	phoneNumber: string;
	nationality: string;
	ward: string;
	district: string;
	province: string;
	detailAddress?: string;
	image?: File;
}) => {
	const formData = new FormData();
	formData.append("email", residentData.email);
	formData.append("fullName", residentData.fullName);
	formData.append("citizenId", residentData.citizenId);
	formData.append("dob", residentData.dob);
	formData.append("gender", residentData.gender);
	formData.append("phoneNumber", residentData.phoneNumber);
	formData.append("nationality", residentData.nationality);
	formData.append("ward", residentData.ward);
	formData.append("district", residentData.district);
	formData.append("province", residentData.province);
	if (residentData.detailAddress) {
		formData.append("detailAddress", residentData.detailAddress);
	}
	if (residentData.image) {
		console.log("Appending image to form data", residentData.image);
		formData.append("image", residentData.image);
	}
	console.log("Form Data:", formData.getAll("image"));
	const response = await axiosInstance.post("/residents", formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
	console.log("Created resident response:", response.data);
	return response.data.data as Resident;
};
export const updateResident = async ({
	id,
	residentData,
}: {
	id: number;
	residentData: {
		fullName: string;
		citizenId: string;
		dob: string;
		gender: string;
		phoneNumber: string;
		nationality: string;
		ward: string;
		district: string;
		province: string;
		detailAddress?: string;
		image?: File;
	};
}) => {
	const formData = new FormData();
	formData.append("fullName", residentData.fullName);
	formData.append("citizenId", residentData.citizenId);
	formData.append("dob", residentData.dob);
	formData.append("gender", residentData.gender);
	formData.append("phoneNumber", residentData.phoneNumber);
	formData.append("nationality", residentData.nationality);
	formData.append("ward", residentData.ward);
	formData.append("district", residentData.district);
	formData.append("province", residentData.province);
	if (residentData.detailAddress) {
		formData.append("detailAddress", residentData.detailAddress);
	}
	if (residentData.image) {
		formData.append("image", residentData.image);
	}
	const response = await axiosInstance.patch(`/residents/${id}`, formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
	return response.data.data as Resident;
};
export const deleteResident = async (residentId: number) => {
	const response = await axiosInstance.delete(`/residents/${residentId}`);
	return response.data;
};

export const deleteManyResidents = async (ids: number[]) => {
	const response = await axiosInstance.post(`/residents/delete-many`, { ids });
	return response.data;
};

export const getResidentById = async (id: number) => {
	const response = await axiosInstance.get(`/residents/${id}`);
	return response.data.data as ResidentDetail;
};
export const getInvoicesAndPaymentsByResidentId = async (id: number) => {
	const response = await axiosInstance.get(`/residents/${id}/invoices`);
	return response.data as {
		invoices: {
			id: number;
			invoiceCode: string;
			apartmentId: number;
			period: string;
			subtotalAmount: number;
			vatAmount: number;
			totalAmount: number;
			status: string;
			dueDate: string;
			createdAt: string;
			updatedAt: string;
		}[];
		payments: {
			id: number;
			txnRef: string;
			targetType: string;
			targetId: number;
			amount: number;
			currency: string;
			paymentMethod: string;
			status: string;
			description: string;
			paymentUrl: string;
			expiresAt: string;
			createdAt: string;
			updatedAt: string;
			payDate: string;
		}[];
	};
};

export const getAdminInvoicesAndPaymentsByResidentId = async (id: number) => {
	const response = await axiosInstance.get(`/admin/residents/${id}/invoices`);
	return response.data as {
		invoices: {
			id: number;
			invoiceCode: string;
			apartmentId: number;
			period: string;
			subtotalAmount: number;
			vatAmount: number;
			totalAmount: number;
			status: string;
			dueDate: string;
			createdAt: string;
			updatedAt: string;
		}[];
		payments: {
			id: number;
			txnRef: string;
			targetType: string;
			targetId: number;
			amount: number;
			currency: string;
			paymentMethod: string;
			status: string;
			description: string;
			paymentUrl: string;
			expiresAt: string;
			createdAt: string;
			updatedAt: string;
			payDate: string;
		}[];
	};
};

export const getResidentResidences = async (id: number) => {
	const response = await axiosInstance.get(`/residents/${id}/apartments`);
	return response.data.data as ResidentResidences;
};
