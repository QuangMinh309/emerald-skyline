import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@pages": path.resolve(__dirname, "./src/pages"),
			"@components": path.resolve(__dirname, "./src/components"),
			"@hooks": path.resolve(__dirname, "./src/hooks"),
			"@assets": path.resolve(__dirname, "./src/assets"),
			"@utils": path.resolve(__dirname, "./src/utils"),
			"@services": path.resolve(__dirname, "./src/services"),
			"@store": path.resolve(__dirname, "./src/store"),
			"@types": path.resolve(__dirname, "./src/types"),
			"@styles": path.resolve(__dirname, "./src/styles"),
		},
	},
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./src/test/setup.ts"],
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json-summary", "html"],
			thresholds: {
				lines: 35,
				functions: 35,
				branches: 35,
				statements: 35,
			},
		},
	},
});
