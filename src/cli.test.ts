import { spawn } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("CLI", () => {
	let testDir: string;
	let originalCwd: string;

	beforeEach(() => {
		originalCwd = process.cwd();
		testDir = join(tmpdir(), `test-cli-${Date.now()}`);
		mkdirSync(testDir, { recursive: true });
	});

	afterEach(() => {
		process.chdir(originalCwd);
		rmSync(testDir, { recursive: true, force: true });
	});

	const runCLI = (
		args: string[] = [],
	): Promise<{
		code: number;
		stdout: string;
		stderr: string;
	}> => {
		return new Promise((resolve) => {
			const cliPath = join(process.cwd(), "dist", "cli.js");
			const child = spawn("node", [cliPath, ...args], {
				cwd: testDir,
			});

			let stdout = "";
			let stderr = "";

			child.stdout?.on("data", (data) => {
				stdout += data.toString();
			});

			child.stderr?.on("data", (data) => {
				stderr += data.toString();
			});

			child.on("close", (code) => {
				resolve({ code: code || 0, stdout, stderr });
			});
		});
	};

	it("should exit with code 0 when no violations", async () => {
		// Create workspace with MIT licensed package
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

		const result = await runCLI();
		expect(result.code).toBe(0);
		expect(result.stdout).toContain("commercially compatible licenses");
	});

	it("should exit with code 1 when violations found", async () => {
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

		const result = await runCLI();
		expect(result.code).toBe(1);
		expect(result.stderr).toContain("LICENSE COMPLIANCE CHECK FAILED");
	});

	it("should support --verbose flag", async () => {
		const appDir = join(testDir, "apps", "app1");
		mkdirSync(appDir, { recursive: true });
		writeFileSync(join(appDir, "package.json"), JSON.stringify({}));

		const result = await runCLI(["--verbose"]);
		expect(result.stdout).toContain("workspace");
	});

	it("should support --json flag", async () => {
		const appDir = join(testDir, "apps", "app1");
		mkdirSync(appDir, { recursive: true });
		writeFileSync(join(appDir, "package.json"), JSON.stringify({}));

		const result = await runCLI(["--json"]);
		expect(result.stdout).toContain('"summary"');
		expect(result.stdout).toContain('"allowedLicenses"');
	});

	it("should support --quiet flag", async () => {
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

		const result = await runCLI(["--quiet"]);
		expect(result.code).toBe(0);
		// Quiet mode should not output anything on success
		expect(result.stdout).toBe("");
	});

	it("should handle multiple flags", async () => {
		const appDir = join(testDir, "apps", "app1");
		mkdirSync(appDir, { recursive: true });
		writeFileSync(join(appDir, "package.json"), JSON.stringify({}));

		const result = await runCLI(["--verbose", "--json"]);
		expect(result.stdout).toContain('"summary"');
	});
});
