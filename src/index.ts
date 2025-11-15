export {
	checkLicenses,
	findAllPackageJsonDirs,
	getLicenses,
	getLicensesFromPackageJson,
	getWorkspaceDirs,
	isLicenseAllowed,
	loadConfig,
} from "./checker.js";

export type {
	CheckOptions,
	LicenseConfig,
	LicenseReport,
	PackageInfo,
	Summary,
	Violation,
} from "./types.js";
