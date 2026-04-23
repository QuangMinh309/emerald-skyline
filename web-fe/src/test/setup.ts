import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, vi } from "vitest";

beforeEach(() => {
	localStorage.clear();
});

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
});
