import axios from "axios";
import { clearTokens, getAccessToken, setTokens } from "@/lib/auth-storage";
import { refreshToken } from "@/services/auth.service";

const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
	timeout: 50000,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});
export const refreshAxios = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
	withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
	const token = getAccessToken();

	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
});

axiosInstance.interceptors.response.use(
	(response) => response,

	async (error) => {
		const originalRequest = error.config;
		// nếu token hết hạn
		if (error.response?.status === 401 && !originalRequest._retry) {
			console.log(error.response?.status);
			originalRequest._retry = true;

			try {
				const res = await refreshToken();

				const { accessToken } = res;
				console.log("Token refreshed", accessToken);
				// lưu token mới
				setTokens(accessToken);

				// gắn token mới cho request cũ
				originalRequest.headers.Authorization = `Bearer ${accessToken}`;

				// gọi lại request ban đầu
				return axiosInstance(originalRequest);
			} catch (err) {
				clearTokens();
				window.location.href = "/login";
				return Promise.reject(err);
			}
		}

		return Promise.reject(error);
	},
);

export default axiosInstance;
