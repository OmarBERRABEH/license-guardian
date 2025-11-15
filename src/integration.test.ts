import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkLicenses } from "./checker.js";

describe("Integration Tests", () => {
	let testDir: string;
	let originalCwd: string;

	beforeEach(() => {
		originalCwd = process.cwd();
		testDir = join(tmpdir(), `test-integration-${Date.now()}`);
		mkdirSync(testDir, { recursive: true });
		process.chdir(testDir);
	});

	afterEach(() => {
		process.chdir(originalCwd);
		rmSync(testDir, { recursive: true, force: true });
	});

	it("should handle monorepo with multiple workspaces", () => {
		// Create multiple workspaces
		const app1Dir = join(testDir, "apps", "app1");
		const app2Dir = join(testDir, "apps", "app2");
		const pkg1Dir = join(testDir, "packages", "pkg1");

		mkdirSync(app1Dir, { recursive: true });
		mkdirSync(app2Dir, { recursive: true });
		mkdirSync(pkg1Dir, { recursive: true });

		// App1 with MIT dependency
		writeFileSync(
			join(app1Dir, "package.json"),
			JSON.stringify({
				dependencies: { "mit-pkg": "^1.0.0" },
			}),
		);
		mkdirSync(join(app1Dir, "node_modules", "mit-pkg"), { recursive: true });
		writeFileSync(
			join(app1Dir, "node_modules", "mit-pkg", "package.json"),
			JSON.stringify({ name: "mit-pkg", version: "1.0.0", license: "MIT" }),
		);

		// App2 with Apache dependency
		writeFileSync(
			join(app2Dir, "package.json"),
			JSON.stringify({
				dependencies: { "apache-pkg": "^2.0.0" },
			}),
		);
		mkdirSync(join(app2Dir, "node_modules", "apache-pkg"), { recursive: true });
		writeFileSync(
			join(app2Dir, "node_modules", "apache-pkg", "package.json"),
			JSON.stringify({
				name: "apache-pkg",
				version: "2.0.0",
				license: "Apache-2.0",
			}),
		);

		// Package with ISC dependency
		writeFileSync(
			join(pkg1Dir, "package.json"),
			JSON.stringify({
				dependencies: { "isc-pkg": "^1.0.0" },
			}),
		);
		mkdirSync(join(pkg1Dir, "node_modules", "isc-pkg"), { recursive: true });
		writeFileSync(
			join(pkg1Dir, "node_modules", "isc-pkg", "package.json"),
			JSON.stringify({ name: "isc-pkg", version: "1.0.0", license: "ISC" }),
		);

		const report = checkLicenses();
		expect(report.violations).toHaveLength(0);
		expect(report.summary.total).toBe(3);
		expect(report.summary.allowed).toBe(3);
	});

	it("should detect mixed violations across workspaces", () => {
		const app1Dir = join(testDir, "apps", "app1");
		const app2Dir = join(testDir, "apps", "app2");

		mkdirSync(app1Dir, { recursive: true });
		mkdirSync(app2Dir, { recursive: true });

		// App1 with MIT (allowed)
		writeFileSync(
			join(app1Dir, "package.json"),
			JSON.stringify({
				dependencies: { "mit-pkg": "^1.0.0" },
			}),
		);
		mkdirSync(join(app1Dir, "node_modules", "mit-pkg"), { recursive: true });
		writeFileSync(
			join(app1Dir, "node_modules", "mit-pkg", "package.json"),
			JSON.stringify({ name: "mit-pkg", version: "1.0.0", license: "MIT" }),
		);

		// App2 with GPL (violation)
		writeFileSync(
			join(app2Dir, "package.json"),
			JSON.stringify({
				dependencies: { "gpl-pkg": "^1.0.0" },
			}),
		);
		mkdirSync(join(app2Dir, "node_modules", "gpl-pkg"), { recursive: true });
		writeFileSync(
			join(app2Dir, "node_modules", "gpl-pkg", "package.json"),
			JSON.stringify({ name: "gpl-pkg", version: "1.0.0", license: "GPL-3.0" }),
		);

		const report = checkLicenses();
		expect(report.violations).toHaveLength(1);
		expect(report.violations[0].license).toBe("GPL-3.0");
		expect(report.summary.total).toBe(2);
		expect(report.summary.allowed).toBe(1);
		expect(report.summary.violations).toBe(1);
	});

	it("should use custom configuration file", () => {
		// Create custom config allowing only MIT
		const configPath = join(testDir, ".licenserc.json");
		writeFileSync(
			configPath,
			JSON.stringify({
				allowedLicenses: ["MIT"],
			}),
		);

		const appDir = join(testDir, "apps", "app1");
		mkdirSync(appDir, { recursive: true });

		// Add Apache package (should be violation with custom config)
		writeFileSync(
			join(appDir, "package.json"),
			JSON.stringify({
				dependencies: { "apache-pkg": "^1.0.0" },
			}),
		);
		mkdirSync(join(appDir, "node_modules", "apache-pkg"), { recursive: true });
		writeFileSync(
			join(appDir, "node_modules", "apache-pkg", "package.json"),
			JSON.stringify({
				name: "apache-pkg",
				version: "1.0.0",
				license: "Apache-2.0",
			}),
		);

		const report = checkLicenses();
		expect(report.violations).toHaveLength(1);
		expect(report.allowedLicenses).toEqual(["MIT"]);
	});

	it("should handle packages with UNKNOWN license", () => {
		const appDir = join(testDir, "apps", "app1");
		mkdirSync(appDir, { recursive: true });

		writeFileSync(
			join(appDir, "package.json"),
			JSON.stringify({
				dependencies: { "unknown-pkg": "^1.0.0" },
			}),
		);
		mkdirSync(join(appDir, "node_modules", "unknown-pkg"), { recursive: true });
		writeFileSync(
			join(appDir, "node_modules", "unknown-pkg", "package.json"),
			JSON.stringify({
				name: "unknown-pkg",
				version: "1.0.0",
				// No license field
			}),
		);

		const report = checkLicenses();
		expect(report.violations).toHaveLength(1);
		expect(report.violations[0].license).toBe("UNKNOWN");
	});

	it("should handle copyleft licenses", () => {
		const appDir = join(testDir, "apps", "app1");
		mkdirSync(appDir, { recursive: true });

		const copyleftLicenses = [
			{ name: "gpl-pkg", license: "GPL-3.0" },
			{ name: "lgpl-pkg", license: "LGPL-2.1" },
			{ name: "agpl-pkg", license: "AGPL-3.0" },
			{ name: "sspl-pkg", license: "SSPL-1.0" },
		];

		const dependencies: Record<string, string> = {};
		copyleftLicenses.forEach((pkg) => {
			dependencies[pkg.name] = "^1.0.0";
			const pkgDir = join(appDir, "node_modules", pkg.name);
			mkdirSync(pkgDir, { recursive: true });
			writeFileSync(
				join(pkgDir, "package.json"),
				JSON.stringify({
					name: pkg.name,
					version: "1.0.0",
					license: pkg.license,
				}),
			);
		});

		writeFileSync(
			join(appDir, "package.json"),
			JSON.stringify({ dependencies }),
		);

		const report = checkLicenses();
		expect(report.violations.length).toBe(4);
		expect(report.violations.map((v) => v.license)).toContain("GPL-3.0");
		expect(report.violations.map((v) => v.license)).toContain("LGPL-2.1");
		expect(report.violations.map((v) => v.license)).toContain("AGPL-3.0");
		expect(report.violations.map((v) => v.license)).toContain("SSPL-1.0");
	});

	it("should handle workspace with no dependencies", () => {
		const appDir = join(testDir, "apps", "app1");
		mkdirSync(appDir, { recursive: true });

		writeFileSync(
			join(appDir, "package.json"),
			JSON.stringify({
				name: "empty-app",
				version: "1.0.0",
			}),
		);

		const report = checkLicenses();
		expect(report.violations).toHaveLength(0);
		expect(report.summary.total).toBe(0);
	});

	it("should skip excluded directories", () => {
		// Create directories that should be skipped
		const skipDirs = [
			"node_modules",
			".git",
			".turbo",
			".next",
			"dist",
			"coverage",
			"build",
		];

		skipDirs.forEach((dirName) => {
			const dir = join(testDir, dirName);
			mkdirSync(dir, { recursive: true });
			writeFileSync(
				join(dir, "package.json"),
				JSON.stringify({
					dependencies: { "should-skip": "^1.0.0" },
				}),
			);
		});

		// Create a valid workspace
		const appDir = join(testDir, "apps", "app1");
		mkdirSync(appDir, { recursive: true });
		writeFileSync(
			join(appDir, "package.json"),
			JSON.stringify({
				name: "valid-app",
				version: "1.0.0",
			}),
		);

		const report = checkLicenses();
		// Should only check the valid app, not the excluded directories
		expect(report.summary.total).toBe(0);
	});

	it("should handle multiple packages with same license", () => {
		const appDir = join(testDir, "apps", "app1");
		mkdirSync(appDir, { recursive: true });

		const mitPackages = ["pkg1", "pkg2", "pkg3"];
		const dependencies: Record<string, string> = {};

		mitPackages.forEach((pkgName) => {
			dependencies[pkgName] = "^1.0.0";
			const pkgDir = join(appDir, "node_modules", pkgName);
			mkdirSync(pkgDir, { recursive: true });
			writeFileSync(
				join(pkgDir, "package.json"),
				JSON.stringify({
					name: pkgName,
					version: "1.0.0",
					license: "MIT",
				}),
			);
		});

		writeFileSync(
			join(appDir, "package.json"),
			JSON.stringify({ dependencies }),
		);

		const report = checkLicenses();
		expect(report.violations).toHaveLength(0);
		expect(report.summary.total).toBe(3);
		expect(report.summary.allowed).toBe(3);
	});
});
