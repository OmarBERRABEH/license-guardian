import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		pool: "forks",
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html", "lcov"],
			exclude: [
				"node_modules/",
				"dist/",
				"**/*.test.ts",
				"**/*.spec.ts",
				"**/*.config.ts",
				"**/*.config.js",
				"vitest.config.ts",
				"commitlint.config.js",
				"**/index.ts",
			],
		},
	},
});
