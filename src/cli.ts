#!/usr/bin/env node

import { checkLicenses } from "./checker.js";

function main() {
	const isJsonMode = process.argv.includes("--json");
	const isVerbose = process.argv.includes("--verbose");
	const isQuiet = process.argv.includes("--quiet");

	const report = checkLicenses({
		json: isJsonMode,
		verbose: isVerbose,
		quiet: isQuiet,
	});

	process.exit(report.violations.length > 0 ? 1 : 0);
}

main();
