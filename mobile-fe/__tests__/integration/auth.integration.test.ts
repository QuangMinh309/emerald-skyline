import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockedApi } = vi.hoisted(() => ({
  mockedApi: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("@/services/api", () => ({
  api: mockedApi,
}));

import {
  changePassword,
  getProfile,
  login,
  logout,
} from "@/services/auth";

describe("auth service integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("posts login payload and returns auth response", async () => {
    const payload = {
      accessToken: "access-token",
      refreshToken: "refresh-token",
      user: { id: "u1", email: "resident@example.com" },
    };
    mockedApi.post.mockResolvedValueOnce({ data: { data: payload } });

    const result = await login("resident@example.com", "secret");

    expect(mockedApi.post).toHaveBeenCalledWith("/auth/login", {
      email: "resident@example.com",
      password: "secret",
    });
    expect(result).toEqual(payload);
  });

  it("fetches profile from /auth/profile", async () => {
    const profile = {
      id: "u1",
      email: "resident@example.com",
      fullName: "Resident One",
    };
    mockedApi.get.mockResolvedValueOnce({ data: { data: profile } });

    const result = await getProfile();

    expect(mockedApi.get).toHaveBeenCalledWith("/auth/profile");
    expect(result).toEqual(profile);
  });

  it("posts change password payload", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: { data: { ok: true } } });

    const result = await changePassword({
      oldPassword: "old-pass",
      newPassword: "new-pass",
    });

    expect(mockedApi.post).toHaveBeenCalledWith("/auth/change-password", {
      oldPassword: "old-pass",
      newPassword: "new-pass",
    });
    expect(result).toEqual({ ok: true });
  });

  it("calls logout endpoint", async () => {
    mockedApi.post.mockResolvedValueOnce({ data: {} });

    await logout();

    expect(mockedApi.post).toHaveBeenCalledWith("/auth/logout");
  });
});
