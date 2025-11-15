# @license-guardian/licenses

> Automated license compliance checker for commercial use - Ensure your dependencies use commercially-compatible licenses

[![npm version](https://badge.fury.io/js/@license-guardian%2Flicenses.svg)](https://www.npmjs.com/package/@license-guardian/licenses)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`@license-guardian/licenses` is a zero-dependency license compliance checker that validates all production dependencies against commercially-compatible licenses. It helps prevent legal issues by blocking packages with copyleft licenses (GPL, AGPL, LGPL, etc.) that could contaminate your codebase.

## Features

- ✅ **Zero External Dependencies** - Uses only Node.js built-in modules
- ✅ **TypeScript Support** - Full type definitions included
- ✅ **Configurable License Allowlist** - Define approved licenses via configuration
- ✅ **Multiple Output Formats** - JSON and human-readable reports
- ✅ **Recursive Workspace Scanning** - Automatically finds all packages in monorepos
- ✅ **CI/CD Ready** - Designed for integration into build pipelines
- ✅ **Programmatic & CLI Usage** - Use as a library or command-line tool

## Installation

### As a CLI tool (global)

```bash
npm install -g @license-guardian/licenses
```

### As a project dependency

```bash
npm install --save-dev @license-guardian/licenses
# or
yarn add -D @license-guardian/licenses
# or
pnpm add -D @license-guardian/licenses
```

## Quick Start

### CLI Usage

```bash
# Basic check
license-guardian

# Verbose output (shows workspace details)
license-guardian --verbose

# JSON report
license-guardian --json

# Quiet mode (only shows violations)
license-guardian --quiet
```

### Programmatic Usage

```typescript
import { checkLicenses } from '@license-guardian/licenses';

// Basic check
const report = checkLicenses();

if (report.violations.length > 0) {
  console.error('License violations found!');
  process.exit(1);
}

// With options
const detailedReport = checkLicenses({
  verbose: true,
  json: false,
  quiet: false,
});

console.log(`Total packages: ${detailedReport.summary.total}`);
console.log(`Violations: ${detailedReport.summary.violations}`);
```

## API Reference

### `checkLicenses(options?: CheckOptions): LicenseReport`

Main function to check license compliance.

**Parameters:**
- `options` (optional): Configuration options
  - `json?: boolean` - Output JSON format (default: `false`)
  - `verbose?: boolean` - Show detailed workspace information (default: `false`)
  - `quiet?: boolean` - Silent mode, only show violations (default: `false`)

**Returns:** `LicenseReport` object containing:
- `summary`: Statistics (total, allowed, violations count)
- `allowedLicenses`: Array of permitted license types
- `licenses`: Object mapping package names to license info
- `violations`: Array of packages with non-compliant licenses

**Example:**

```typescript
import { checkLicenses } from '@license-guardian/licenses';

const report = checkLicenses({ verbose: true });

// Access report data
console.log(report.summary.total); // Total number of packages
console.log(report.violations); // Array of violations

// Check if there are violations
if (report.violations.length > 0) {
  report.violations.forEach(v => {
    console.log(`${v.package}: ${v.license}`);
  });
}
```

### `isLicenseAllowed(license: string, allowedLicenses: string[]): boolean`

Check if a specific license is allowed.

**Parameters:**
- `license`: License identifier (e.g., "MIT", "GPL-3.0")
- `allowedLicenses`: Array of allowed license identifiers

**Returns:** `boolean` - `true` if license is allowed, `false` otherwise

**Example:**

```typescript
import { isLicenseAllowed } from '@license-guardian/licenses';

const allowed = ['MIT', 'Apache-2.0', 'BSD-3-Clause'];

console.log(isLicenseAllowed('MIT', allowed)); // true
console.log(isLicenseAllowed('GPL-3.0', allowed)); // false
console.log(isLicenseAllowed('UNKNOWN', allowed)); // false
```

### `loadConfig(configPath?: string): string[]`

Load license configuration from a file.

**Parameters:**
- `configPath` (optional): Path to configuration file (default: `.licenserc.json` in current directory)

**Returns:** Array of allowed license identifiers

**Example:**

```typescript
import { loadConfig } from '@license-guardian/licenses';

const allowedLicenses = loadConfig('./custom-license-config.json');
console.log(allowedLicenses); // ['MIT', 'Apache-2.0', ...]
```

### `getLicenses(): Record<string, PackageInfo>`

Get all production dependencies and their license information.

**Returns:** Object mapping package names to license info

**Example:**

```typescript
import { getLicenses } from '@license-guardian/licenses';

const licenses = getLicenses();

for (const [pkg, info] of Object.entries(licenses)) {
  console.log(`${pkg}: ${info.license} (v${info.version})`);
}
```

### `getWorkspaceDirs(): string[]`

Find all workspace directories containing package.json files.

**Returns:** Array of workspace directory paths

**Example:**

```typescript
import { getWorkspaceDirs } from '@license-guardian/licenses';

const workspaces = getWorkspaceDirs();
console.log(`Found ${workspaces.length} workspaces`);
workspaces.forEach(dir => console.log(dir));
```

## TypeScript Types

### `LicenseReport`

```typescript
interface LicenseReport {
  summary: Summary;
  allowedLicenses: string[];
  licenses: Record<string, PackageInfo>;
  violations: Violation[];
}
```

### `Summary`

```typescript
interface Summary {
  total: number;
  allowed: number;
  violations: number;
}
```

### `PackageInfo`

```typescript
interface PackageInfo {
  license: string;
  version: string;
}
```

### `Violation`

```typescript
interface Violation {
  package: string;
  license: string;
  version: string;
}
```

### `CheckOptions`

```typescript
interface CheckOptions {
  json?: boolean;
  verbose?: boolean;
  quiet?: boolean;
}
```

### `LicenseConfig`

```typescript
interface LicenseConfig {
  allowedLicenses?: string[];
  excludedPackages?: string[];
  notes?: Record<string, string>;
}
```

## Configuration

### Default Allowed Licenses

By default, these licenses are approved for commercial use:

**Permissive Licenses:**
- MIT
- Apache-2.0
- BSD-2-Clause
- BSD-3-Clause
- ISC
- 0BSD

**Public Domain:**
- CC0-1.0
- Unlicense

**Other Approved:**
- Python-2.0

### Custom Configuration

Create `.licenserc.json` in your project root:

```json
{
  "allowedLicenses": [
    "MIT",
    "Apache-2.0",
    "BSD-2-Clause",
    "BSD-3-Clause",
    "ISC",
    "0BSD",
    "CC0-1.0",
    "Python-2.0",
    "Unlicense"
  ],
  "excludedPackages": [],
  "notes": {
    "commerciallyCompatible": "All allowed licenses are compatible with commercial use",
    "copyleftFree": "No copyleft licenses (GPL, LGPL, AGPL) are allowed"
  }
}
```

### Prohibited Licenses

These license patterns are **automatically blocked**:

- GPL (all versions)
- LGPL (all versions)
- AGPL (all versions)
- SSPL (Server Side Public License)
- BUSL (Business Source License)
- Any license containing "Copyleft"

## Integration Examples

### package.json Scripts

```json
{
  "scripts": {
    "licenses:check": "license-guardian",
    "licenses:verbose": "license-guardian --verbose",
    "licenses:report": "license-guardian --json > licenses-report.json",
    "postinstall": "license-guardian --quiet || true",
    "precommit": "license-guardian"
  }
}
```

### CI/CD Integration

#### GitHub Actions

```yaml
name: License Check

on: [push, pull_request]

jobs:
  license-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx @license-guardian/licenses
```

#### GitLab CI

```yaml
licenses:check:
  stage: test
  script:
    - npm install
    - npx @license-guardian/licenses
  allow_failure: false
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
```

#### CircleCI

```yaml
version: 2.1
jobs:
  license-check:
    docker:
      - image: cimg/node:18.0
    steps:
      - checkout
      - run: npm install
      - run: npx @license-guardian/licenses
```

### Node.js Script

```javascript
const { checkLicenses } = require('@license-guardian/licenses');

async function validateLicenses() {
  try {
    const report = checkLicenses({ verbose: true });

    if (report.violations.length > 0) {
      console.error('❌ License compliance check failed!');
      console.error(`Found ${report.violations.length} violations`);
      process.exit(1);
    }

    console.log('✅ All licenses are compliant!');
  } catch (error) {
    console.error('Error checking licenses:', error);
    process.exit(1);
  }
}

validateLicenses();
```

### Custom Validation Logic

```typescript
import {
  checkLicenses,
  getLicenses,
  isLicenseAllowed
} from '@license-guardian/licenses';

// Get all licenses
const licenses = getLicenses();

// Custom allowed list
const customAllowed = ['MIT', 'Apache-2.0', 'BSD-3-Clause'];

// Check each license manually
for (const [pkg, info] of Object.entries(licenses)) {
  const allowed = isLicenseAllowed(info.license, customAllowed);

  if (!allowed) {
    console.warn(`⚠️  ${pkg} has license: ${info.license}`);
  }
}

// Or use the built-in checker
const report = checkLicenses({ json: true });
console.log(JSON.stringify(report, null, 2));
```

## Output Examples

### Success Output

```
🔍 Checking dependency licenses for commercial compatibility...

✅ Allowed licenses: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, 0BSD, CC0-1.0, Python-2.0, Unlicense
📊 Total packages: 48
✓  Compatible: 48
✗  Violations: 0

✅ All dependencies have commercially compatible licenses!
```

### Failure Output

```
🔍 Checking dependency licenses for commercial compatibility...

✅ Allowed licenses: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, 0BSD, CC0-1.0, Python-2.0, Unlicense
📊 Total packages: 50
✓  Compatible: 48
✗  Violations: 2

======================================================================
❌ LICENSE COMPLIANCE CHECK FAILED
======================================================================

Found 2 package(s) with non-compliant licenses:

  ❌ copyleft-lib@1.2.3
     Version: 1.2.3
     License: GPL-3.0

  ❌ another-package@2.0.0
     Version: 2.0.0
     License: AGPL-3.0

⚠️  REASON FOR FAILURE:
   These licenses are incompatible with commercial/proprietary use.

📋 ALLOWED LICENSES:
   MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, 0BSD, CC0-1.0, Python-2.0, Unlicense

🔧 ACTIONS REQUIRED:
   1. Remove the packages with non-compliant licenses
   2. Find alternative packages with compatible licenses
   3. Or obtain legal approval before proceeding

======================================================================
BUILD FAILED - License compliance check failed
======================================================================
```

### JSON Report

```json
{
  "summary": {
    "total": 48,
    "allowed": 48,
    "violations": 0
  },
  "allowedLicenses": [
    "MIT",
    "Apache-2.0",
    "BSD-2-Clause",
    "BSD-3-Clause",
    "ISC",
    "0BSD",
    "CC0-1.0",
    "Python-2.0",
    "Unlicense"
  ],
  "licenses": {
    "express@4.18.2": {
      "license": "MIT",
      "version": "4.18.2"
    },
    "react@18.2.0": {
      "license": "MIT",
      "version": "18.2.0"
    }
  },
  "violations": []
}
```

## How It Works

1. **Workspace Discovery**: Recursively scans for `package.json` files (excludes `node_modules`, `.git`, `dist`, etc.)
2. **Dependency Collection**: Reads `dependencies` field from each workspace
3. **License Extraction**: Follows symlinks to resolve actual package information
4. **Validation**: Checks against allowed licenses and prohibited patterns
5. **Reporting**: Generates detailed reports with actionable remediation steps

## Exit Codes

| Code | Meaning | CI Behavior |
|------|---------|-------------|
| `0` | All licenses compliant | ✅ Pass |
| `1` | Violations detected | ❌ Fail |

## Troubleshooting

### "Cannot find package" Errors

**Cause:** Dependencies not installed

**Solution:**
```bash
npm install
license-guardian
```

### "UNKNOWN" License Detected

**Cause:** Package doesn't declare license in package.json

**Solutions:**
1. Check the package repository for actual license
2. Contact package maintainer
3. Find alternative package
4. Get legal review before adding to allowlist

### Workspace Not Scanned

**Cause:** Directory matches exclusion patterns

**Check:**
```bash
license-guardian --verbose
```

Excluded directories: `node_modules`, `.git`, `.turbo`, `.next`, `dist`, `coverage`, `build`

## Best Practices

1. **Run Before Committing**
   ```bash
   license-guardian
   ```

2. **Review New Dependencies**
   - Check license before installing
   - Prefer MIT/Apache-2.0 licensed packages

3. **Keep Allowlist Minimal**
   - Only add licenses after legal review
   - Document why each license is approved

4. **Regular Audits**
   - Generate monthly JSON reports
   - Archive for compliance tracking

5. **Automate in CI/CD**
   - Fail builds on violations
   - Run on every PR and merge

## FAQ

### Q: Can I use devDependencies with GPL licenses?

**A:** Yes! This tool only checks production dependencies. Development tools don't ship with your product.

### Q: What about transitive dependencies?

**A:** Only direct production dependencies are checked. If a transitive dependency has issues, it will appear in workspace node_modules and be caught.

### Q: How do I exclude specific packages?

**A:** The `excludedPackages` config option is planned for future releases. Currently, you can fork and extend the source.

### Q: Does this work with monorepos?

**A:** Yes! It automatically discovers all workspaces in your monorepo (pnpm, npm, yarn workspaces).

### Q: Can I use this with other package managers?

**A:** Yes, it works with npm, yarn, and pnpm. It reads package.json and node_modules structure.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on [GitHub](https://github.com/OmarBERRABEH/license-guardian).

## License

MIT © Omar Berrabeh

## Support

- [GitHub Issues](https://github.com/OmarBERRABEH/license-guardian/issues)
- [Documentation](https://github.com/OmarBERRABEH/license-guardian#readme)

---

**Made with ❤️ for the open source community**
