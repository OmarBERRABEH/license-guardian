import { readdirSync, readFileSync, realpathSync } from "node:fs";
import { join } from "node:path";
import type {
	CheckOptions,
	LicenseConfig,
	LicenseReport,
	PackageInfo,
	Summary,
	Violation,
} from "./types.js";

const DEFAULT_ALLOWED_LICENSES = [
	"MIT",
	"Apache-2.0",
	"BSD-2-Clause",
	"BSD-3-Clause",
	"ISC",
	"0BSD",
	"CC0-1.0",
	"Python-2.0",
	"Unlicense",
];

const PROHIBITED_PATTERNS = [
	/GPL/i,
	/LGPL/i,
	/AGPL/i,
	/SSPL/i,
	/BUSL/i,
	/Copyleft/i,
];

const SEPARATOR_WIDTH = 70;

export function loadConfig(configPath?: string): string[] {
	try {
		const path = configPath || join(process.cwd(), ".licenserc.json");
		const config: LicenseConfig = JSON.parse(readFileSync(path, "utf-8"));
		return config.allowedLicenses || DEFAULT_ALLOWED_LICENSES;
	} catch {
		return DEFAULT_ALLOWED_LICENSES;
	}
}

export function findAllPackageJsonDirs(
	dir: string,
	results: string[] = [],
): string[] {
	try {
		const entries = readdirSync(dir, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = join(dir, entry.name);

			// Skip node_modules, .git, and other common directories to ignore
			if (
				entry.name === "node_modules" ||
				entry.name === ".git" ||
				entry.name === ".turbo" ||
				entry.name === ".next" ||
				entry.name === "dist" ||
				entry.name === "coverage" ||
				entry.name === "build"
			) {
				continue;
			}

			if (entry.isDirectory()) {
				// Recursively search subdirectories
				findAllPackageJsonDirs(fullPath, results);
			} else if (entry.name === "package.json") {
				// Found a package.json, add its directory
				results.push(dir);
			}
		}
	} catch {
		// Ignore permission errors or inaccessible directories
	}

	return results;
}

export function getWorkspaceDirs(): string[] {
	const rootDir = process.cwd();
	const allDirs = findAllPackageJsonDirs(rootDir);

	// Exclude the root directory itself to avoid duplicates
	return allDirs.filter((dir) => dir !== rootDir);
}

export function getLicensesFromPackageJson(
	dir: string,
): Record<string, PackageInfo> {
	try {
		const packageJsonPath = join(dir, "package.json");
		const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
		const licenses: Record<string, PackageInfo> = {};

		// Only get production dependencies
		const deps = packageJson.dependencies || {};

		for (const [name] of Object.entries(deps)) {
			try {
				// pnpm workspaces store dependencies in each workspace's node_modules
				const depPath = join(dir, "node_modules", name, "package.json");
				// Use realpathSync to follow symlinks
				const realDepPath = realpathSync(depPath);
				const depPackageJson = JSON.parse(readFileSync(realDepPath, "utf-8"));

				const license = depPackageJson.license || "UNKNOWN";
				const version = depPackageJson.version || "UNKNOWN";

				licenses[`${name}@${version}`] = {
					license,
					version,
				};
			} catch {
				// If we can't read the package, skip it
				// This might happen for optional dependencies or platform-specific packages
			}
		}

		return licenses;
	} catch {
		return {};
	}
}

export function getLicenses(): Record<string, PackageInfo> {
	const workspaceDirs = getWorkspaceDirs();
	const allLicenses: Record<string, PackageInfo> = {};

	for (const dir of workspaceDirs) {
		const licenses = getLicensesFromPackageJson(dir);
		Object.assign(allLicenses, licenses);
	}

	return allLicenses;
}

export function isLicenseAllowed(
	license: string,
	allowedLicenses: string[],
): boolean {
	if (!license || license === "UNKNOWN") {
		return false;
	}

	for (const pattern of PROHIBITED_PATTERNS) {
		if (pattern.test(license)) {
			return false;
		}
	}

	const normalizedLicense = license.toUpperCase();
	return allowedLicenses.some((allowed) =>
		normalizedLicense.includes(allowed.toUpperCase()),
	);
}

export function checkLicenses(options: CheckOptions = {}): LicenseReport {
	const allowedLicenses = loadConfig();
	const { json = false, verbose = false, quiet = false } = options;

	if (verbose && !json && !quiet) {
		const workspaceDirs = getWorkspaceDirs();
		const cwd = process.cwd();
		console.log(`\n📁 Found ${workspaceDirs.length} workspace(s):\n`);
		for (const dir of workspaceDirs) {
			console.log(`  • ${dir.replace(`${cwd}/`, "")}`);
		}
		console.log();
	}

	const licenses = getLicenses();

	const violations: Violation[] = [];
	const summary: Summary = {
		total: Object.keys(licenses).length,
		allowed: 0,
		violations: 0,
	};

	for (const [packageName, info] of Object.entries(licenses)) {
		const license = info.license;
		const allowed = isLicenseAllowed(license, allowedLicenses);

		if (allowed) {
			summary.allowed++;
		} else {
			summary.violations++;
			violations.push({
				package: packageName,
				license: license || "UNKNOWN",
				version: info.version,
			});
		}
	}

	const report: LicenseReport = {
		summary,
		allowedLicenses,
		licenses,
		violations,
	};

	if (json) {
		console.log(JSON.stringify(report, null, 2));
		return report;
	}

	// In quiet mode, only show output if there are violations
	if (quiet && violations.length === 0) {
		return report;
	}

	if (!quiet) {
		console.log(
			"🔍 Checking dependency licenses for commercial compatibility...\n",
		);
		console.log(`✅ Allowed licenses: ${allowedLicenses.join(", ")}`);
		console.log(`📊 Total packages: ${summary.total}`);
		console.log(`✓  Compatible: ${summary.allowed}`);
		console.log(`✗  Violations: ${summary.violations}\n`);
	}

	if (violations.length > 0) {
		const separator = "=".repeat(SEPARATOR_WIDTH);
		console.error(`\n${separator}`);
		console.error("❌ LICENSE COMPLIANCE CHECK FAILED");
		console.error(separator);
		console.error(
			`\nFound ${violations.length} package(s) with non-compliant licenses:\n`,
		);

		for (const v of violations) {
			console.error(`  ❌ ${v.package}`);
			console.error(`     Version: ${v.version}`);
			console.error(`     License: ${v.license}`);
			console.error();
		}

		console.error("⚠️  REASON FOR FAILURE:");
		console.error(
			"   These licenses are incompatible with commercial/proprietary use.\n",
		);

		console.error("📋 ALLOWED LICENSES:");
		console.error(`   ${allowedLicenses.join(", ")}\n`);

		console.error("🔧 ACTIONS REQUIRED:");
		console.error("   1. Remove the packages with non-compliant licenses");
		console.error("   2. Find alternative packages with compatible licenses");
		console.error("   3. Or obtain legal approval before proceeding\n");

		console.error(separator);
		console.error("BUILD FAILED - License compliance check failed");
		console.error(`${separator}\n`);
	} else if (!quiet) {
		console.log("✅ All dependencies have commercially compatible licenses!\n");
	}

	return report;
}
