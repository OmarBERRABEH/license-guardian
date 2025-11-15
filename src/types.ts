export interface LicenseConfig {
	allowedLicenses?: string[];
	excludedPackages?: string[];
	notes?: Record<string, string>;
}

export interface PackageInfo {
	license: string;
	version: string;
}

export interface Violation {
	package: string;
	license: string;
	version: string;
}

export interface Summary {
	total: number;
	allowed: number;
	violations: number;
}

export interface LicenseReport {
	summary: Summary;
	allowedLicenses: string[];
	licenses: Record<string, PackageInfo>;
	violations: Violation[];
}

export interface CheckOptions {
	json?: boolean;
	verbose?: boolean;
	quiet?: boolean;
}
