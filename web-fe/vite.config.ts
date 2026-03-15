import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vite.dev/config/
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
});
