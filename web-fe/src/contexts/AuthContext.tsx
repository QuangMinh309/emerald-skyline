import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AuthUser } from "@/types/auth";
import {
	getProfile,
	login as loginRequest,
	logout as logoutRequest,
} from "@/services/auth.service";
import {
	clearAuthStorage,
	getAccessToken,
	getStoredUser,
	setStoredUser,
	setTokens,
} from "@/lib/auth-storage";

type AuthContextValue = {
	user: AuthUser | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (accessToken: string, profile: AuthUser) => Promise<AuthUser>;
	logout: () => Promise<void>;
	refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
	const [isLoading, setIsLoading] = useState(true);
	useEffect(() => {}, [user]);
	useEffect(() => {
		const boot = async () => {
			const token = getAccessToken();
			// ✅ KHÔNG có token → không gọi API
			if (!token) {
				console.log("No access token found");
				setIsLoading(false);
				return;
			}

			try {
				const profile = await getProfile();
				setStoredUser(profile);
				setUser(profile);
			} catch (err) {
				clearAuthStorage();
				setUser(null);
			} finally {
				setIsLoading(false);
			}
		};

		void boot();
	}, []);

	const login = async (accessToken: string, profile: AuthUser) => {
		setTokens(accessToken);
		setStoredUser(profile);
		setUser(profile);

		return profile;
	};

	const logout = async () => {
		try {
			await logoutRequest();
		} catch {
		} finally {
			clearAuthStorage();
			setUser(null);
		}
	};

	const refreshProfile = async () => {
		const profile = await getProfile();
		setStoredUser(profile);
		setUser(profile);
	};

	const value = useMemo(
		() => ({
			user,
			isAuthenticated: Boolean(user),
			isLoading,
			login,
			logout,
			refreshProfile,
		}),
		[user, isLoading],
	);
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return ctx;
};
