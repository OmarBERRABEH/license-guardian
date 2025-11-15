import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	checkLicenses,
	findAllPackageJsonDirs,
	getLicensesFromPackageJson,
	isLicenseAllowed,
	loadConfig,
} from "./checker.js";

describe("isLicenseAllowed", () => {
	const allowedLicenses = [
		"MIT",
		"Apache-2.0",
		"BSD-2-Clause",
		"BSD-3-Clause",
		"ISC",
	];

	it("should allow MIT license", () => {
		expect(isLicenseAllowed("MIT", allowedLicenses)).toBe(true);
	});

	it("should allow Apache-2.0 license", () => {
		expect(isLicenseAllowed("Apache-2.0", allowedLicenses)).toBe(true);
	});

	it("should allow BSD licenses", () => {
		expect(isLicenseAllowed("BSD-2-Clause", allowedLicenses)).toBe(true);
		expect(isLicenseAllowed("BSD-3-Clause", allowedLicenses)).toBe(true);
	});

	it("should allow ISC license", () => {
		expect(isLicenseAllowed("ISC", allowedLicenses)).toBe(true);
	});

	it("should reject GPL licenses", () => {
		expect(isLicenseAllowed("GPL-3.0", allowedLicenses)).toBe(false);
		expect(isLicenseAllowed("GPL-2.0", allowedLicenses)).toBe(false);
		expect(isLicenseAllowed("LGPL-3.0", allowedLicenses)).toBe(false);
	});

	it("should reject AGPL licenses", () => {
		expect(isLicenseAllowed("AGPL-3.0", allowedLicenses)).toBe(false);
	});

	it("should reject SSPL licenses", () => {
		expect(isLicenseAllowed("SSPL-1.0", allowedLicenses)).toBe(false);
	});

	it("should reject BUSL licenses", () => {
		expect(isLicenseAllowed("BUSL-1.1", allowedLicenses)).toBe(false);
	});

	it("should reject UNKNOWN licenses", () => {
		expect(isLicenseAllowed("UNKNOWN", allowedLicenses)).toBe(false);
	});

	it("should reject empty license", () => {
		expect(isLicenseAllowed("", allowedLicenses)).toBe(false);
	});

	it("should be case insensitive", () => {
		expect(isLicenseAllowed("mit", allowedLicenses)).toBe(true);
		expect(isLicenseAllowed("apache-2.0", allowedLicenses)).toBe(true);
	});

	it("should reject licenses with copyleft keyword", () => {
		expect(isLicenseAllowed("Copyleft License", allowedLicenses)).toBe(false);
	});
});

describe("loadConfig", () => {
	it("should return default licenses when config file does not exist", () => {
		const licenses = loadConfig("/non/existent/path/.licenserc.json");
		expect(licenses).toEqual([
			"MIT",
			"Apache-2.0",
			"BSD-2-Clause",
			"BSD-3-Clause",
			"ISC",
			"0BSD",
			"CC0-1.0",
			"Python-2.0",
			"Unlicense",
		]);
	});

	it("should return default licenses when no path provided", () => {
		const licenses = loadConfig();
		expect(licenses).toBeDefined();
		expect(Array.isArray(licenses)).toBe(true);
		expect(licenses.length).toBeGreaterThan(0);
	});

	it("should load custom licenses from config file", () => {
		// Create a temporary config file
		const tempDir = join(tmpdir(), `test-${Date.now()}`);
		mkdirSync(tempDir, { recursive: true });
		const configPath = join(tempDir, ".licenserc.json");
		const customConfig = {
			allowedLicenses: ["MIT", "Apache-2.0"],
		};
		writeFileSync(configPath, JSON.stringify(customConfig));

		const licenses = loadConfig(configPath);
		expect(licenses).toEqual(["MIT", "Apache-2.0"]);

		// Cleanup
		rmSync(tempDir, { recursive: true, force: true });
	});

	it("should handle malformed config file", () => {
		const tempDir = join(tmpdir(), `test-${Date.now()}`);
		mkdirSync(tempDir, { recursive: true });
		const configPath = join(tempDir, ".licenserc.json");
		writeFileSync(configPath, "invalid json{");

		const licenses = loadConfig(configPath);
		expect(licenses).toEqual([
			"MIT",
			"Apache-2.0",
			"BSD-2-Clause",
			"BSD-3-Clause",
			"ISC",
			"0BSD",
			"CC0-1.0",
			"Python-2.0",
			"Unlicense",
		]);

		// Cleanup
		rmSync(tempDir, { recursive: true, force: true });
	});
});

describe("findAllPackageJsonDirs", () => {
	let testDir: string;

	beforeEach(() => {
		testDir = join(tmpdir(), `test-workspace-${Date.now()}`);
		mkdirSync(testDir, { recursive: true });
	});

	afterEach(() => {
		rmSync(testDir, { recursive: true, force: true });
	});

	it("should find directories with package.json", () => {
		// Create test structure
		const app1Dir = join(testDir, "apps", "app1");
		const app2Dir = join(testDir, "apps", "app2");
		mkdirSync(app1Dir, { recursive: true });
		mkdirSync(app2Dir, { recursive: true });

		writeFileSync(join(app1Dir, "package.json"), "{}");
		writeFileSync(join(app2Dir, "package.json"), "{}");

		const results = findAllPackageJsonDirs(testDir);
		expect(results).toContain(app1Dir);
		expect(results).toContain(app2Dir);
	});

	it("should skip node_modules directories", () => {
		const nodeModulesDir = join(testDir, "node_modules", "some-package");
		mkdirSync(nodeModulesDir, { recursive: true });
		writeFileSync(join(nodeModulesDir, "package.json"), "{}");

		const results = findAllPackageJsonDirs(testDir);
		expect(results).not.toContain(nodeModulesDir);
	});

	it("should skip dist directories", () => {
		const distDir = join(testDir, "dist");
		mkdirSync(distDir, { recursive: true });
		writeFileSync(join(distDir, "package.json"), "{}");

		const results = findAllPackageJsonDirs(testDir);
		expect(results).not.toContain(distDir);
	});

	it("should skip .git directories", () => {
		const gitDir = join(testDir, ".git");
		mkdirSync(gitDir, { recursive: true });
		writeFileSync(join(gitDir, "package.json"), "{}");

		const results = findAllPackageJsonDirs(testDir);
		expect(results).not.toContain(gitDir);
	});

	it("should handle empty directory", () => {
		const results = findAllPackageJsonDirs(testDir);
		expect(results).toEqual([]);
	});

	it("should handle permission errors gracefully", () => {
		// This test would need OS-specific permission handling
		// For now, just verify it returns an array
		const results = findAllPackageJsonDirs("/root/nonexistent");
		expect(Array.isArray(results)).toBe(true);
	});
});

describe("getLicensesFromPackageJson", () => {
	let testDir: string;

	beforeEach(() => {
		testDir = join(tmpdir(), `test-pkg-${Date.now()}`);
		mkdirSync(testDir, { recursive: true });
	});

	afterEach(() => {
		rmSync(testDir, { recursive: true, force: true });
	});

	it("should extract licenses from dependencies", () => {
		// Create package.json with dependencies
		const packageJson = {
			dependencies: {
				"test-pkg": "^1.0.0",
			},
		};
		writeFileSync(join(testDir, "package.json"), JSON.stringify(packageJson));

		// Create node_modules with package
		const pkgDir = join(testDir, "node_modules", "test-pkg");
		mkdirSync(pkgDir, { recursive: true });
		const depPackageJson = {
			name: "test-pkg",
			version: "1.0.0",
			license: "MIT",
		};
		writeFileSync(join(pkgDir, "package.json"), JSON.stringify(depPackageJson));

		const licenses = getLicensesFromPackageJson(testDir);
		expect(licenses["test-pkg@1.0.0"]).toEqual({
			license: "MIT",
			version: "1.0.0",
		});
	});

	it("should handle missing license field", () => {
		const packageJson = {
			dependencies: {
				"test-pkg": "^1.0.0",
			},
		};
		writeFileSync(join(testDir, "package.json"), JSON.stringify(packageJson));

		const pkgDir = join(testDir, "node_modules", "test-pkg");
		mkdirSync(pkgDir, { recursive: true });
		const depPackageJson = {
			name: "test-pkg",
			version: "1.0.0",
		};
		writeFileSync(join(pkgDir, "package.json"), JSON.stringify(depPackageJson));

		const licenses = getLicensesFromPackageJson(testDir);
		expect(licenses["test-pkg@1.0.0"]).toEqual({
			license: "UNKNOWN",
			version: "1.0.0",
		});
	});

	it("should return empty object when no dependencies", () => {
		const packageJson = {
			name: "test",
			version: "1.0.0",
		};
		writeFileSync(join(testDir, "package.json"), JSON.stringify(packageJson));

		const licenses = getLicensesFromPackageJson(testDir);
		expect(licenses).toEqual({});
	});

	it("should handle missing package.json", () => {
		const licenses = getLicensesFromPackageJson(testDir);
		expect(licenses).toEqual({});
	});
});

describe("checkLicenses", () => {
	let originalCwd: string;
	let testDir: string;
	let consoleLogSpy: any;
	let consoleErrorSpy: any;

	beforeEach(() => {
		originalCwd = process.cwd();
		testDir = join(tmpdir(), `test-check-${Date.now()}`);
		mkdirSync(testDir, { recursive: true });
		process.chdir(testDir);

		// Spy on console methods
		consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		process.chdir(originalCwd);
		rmSync(testDir, { recursive: true, force: true });
		consoleLogSpy.mockRestore();
		consoleErrorSpy.mockRestore();
	});

	it("should pass when all licenses are allowed", () => {
		// Create workspace structure
		const appDir = join(testDir, "apps", "app1");
		mkdirSync(appDir, { recursive: true });

		const packageJson = {
			dependencies: {
				"mit-pkg": "^1.0.0",
			},
		};
		writeFileSync(join(appDir, "package.json"), JSON.stringify(packageJson));

		const pkgDir = join(appDir, "node_modules", "mit-pkg");
		mkdirSync(pkgDir, { recursive: true });
		writeFileSync(
			join(pkgDir, "package.json"),
			JSON.stringify({
				name: "mit-pkg",
				version: "1.0.0",
				license: "MIT",
			}),
		);

		const report = checkLicenses();
		expect(report.violations).toHaveLength(0);
		expect(report.summary.violations).toBe(0);
	});

	it("should detect violations", () => {
		const appDir = join(testDir, "apps", "app1");
		mkdirSync(appDir, { recursive: true });

		const packageJson = {
			dependencies: {
				"gpl-pkg": "^1.0.0",
			},
		};
		writeFileSync(join(appDir, "package.json"), JSON.stringify(packageJson));

		const pkgDir = join(appDir, "node_modules", "gpl-pkg");
		mkdirSync(pkgDir, { recursive: true });
		writeFileSync(
			join(pkgDir, "package.json"),
			JSON.stringify({
				name: "gpl-pkg",
				version: "1.0.0",
				license: "GPL-3.0",
			}),
		);

		const report = checkLicenses();
		expect(report.violations).toHaveLength(1);
		expect(report.violations[0].license).toBe("GPL-3.0");
		expect(report.summary.violations).toBe(1);
	});

	it("should support verbose mode", () => {
		const appDir = join(testDir, "apps", "app1");
		mkdirSync(appDir, { recursive: true });
		writeFileSync(join(appDir, "package.json"), JSON.stringify({}));

		checkLicenses({ verbose: true });
		expect(consoleLogSpy).toHaveBeenCalled();
	});

	it("should support quiet mode with no violations", () => {
		const appDir = join(testDir, "apps", "app1");
		mkdirSync(appDir, { recursive: true });

		const packageJson = {
			dependencies: {
				"mit-pkg": "^1.0.0",
			},
		};
		writeFileSync(join(appDir, "package.json"), JSON.stringify(packageJson));

		const pkgDir = join(appDir, "node_modules", "mit-pkg");
		mkdirSync(pkgDir, { recursive: true });
		writeFileSync(
			join(pkgDir, "package.json"),
			JSON.stringify({
				name: "mit-pkg",
				version: "1.0.0",
				license: "MIT",
			}),
		);

		checkLicenses({ quiet: true });
		expect(consoleLogSpy).not.toHaveBeenCalled();
	});

	it("should support JSON output mode", () => {
		const appDir = join(testDir, "apps", "app1");
		mkdirSync(appDir, { recursive: true });
		writeFileSync(join(appDir, "package.json"), JSON.stringify({}));

		checkLicenses({ json: true });
		expect(consoleLogSpy).toHaveBeenCalledWith(
			expect.stringContaining('"summary"'),
		);
	});
});
