# Contributing to @license-guardian/licenses

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Release Process](#release-process)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git

### Setup

1. **Fork the repository**

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/license-guardian.git
   cd license-guardian
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/OmarBERRABEH/license-guardian.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Setup git hooks**
   ```bash
   npm run prepare
   ```

6. **Build the project**
   ```bash
   npm run build
   ```

7. **Run tests**
   ```bash
   npm test
   ```

## Development Workflow

### Creating a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes in the `src/` directory
2. Add tests for new functionality
3. Run tests: `npm test`
4. Run linter: `npm run lint`
5. Build the project: `npm run build`

### Running in Development Mode

```bash
npm run dev
```

This will watch for changes and recompile automatically.

## Commit Guidelines

This project uses [Conventional Commits](https://www.conventionalcommits.org/).

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system changes
- **ci**: CI configuration changes
- **chore**: Other changes (dependencies, etc.)

### Examples

```bash
git commit -m "feat(checker): add support for custom license patterns"
git commit -m "fix(cli): handle empty workspace directories"
git commit -m "docs(readme): add usage examples for monorepos"
git commit -m "test(checker): add tests for prohibited licenses"
```

### Git Hooks

Lefthook is configured to run automatically:

- **pre-commit**: Runs linting on staged files
- **commit-msg**: Validates commit message format
- **pre-push**: Runs tests and build

## Pull Request Process

### Before Submitting

1. **Update from upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run full test suite**
   ```bash
   npm test
   npm run lint
   npm run build
   ```

3. **Update documentation** if needed

4. **Add tests** for new features

### Submitting a PR

1. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request** on GitHub

3. **Fill out the PR template** with:
   - Description of changes
   - Related issue numbers
   - Testing performed
   - Screenshots (if applicable)

4. **Wait for review**
   - Address any feedback
   - Keep your PR up to date with main

### PR Title Format

PR titles should follow conventional commit format:

```
feat: add license pattern validation
fix: resolve workspace detection issue
docs: update API documentation
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Writing Tests

Tests are located in `src/*.test.ts` files using Vitest.

Example:

```typescript
import { describe, it, expect } from "vitest";
import { isLicenseAllowed } from "./checker.js";

describe("isLicenseAllowed", () => {
  it("should allow MIT license", () => {
    expect(isLicenseAllowed("MIT", ["MIT", "Apache-2.0"])).toBe(true);
  });

  it("should reject GPL license", () => {
    expect(isLicenseAllowed("GPL-3.0", ["MIT", "Apache-2.0"])).toBe(false);
  });
});
```

### Test Coverage

Aim for at least 80% code coverage for new code.

## Release Process

Releases are automated through GitHub Actions.

### Creating a Release

1. **Ensure all changes are merged to main**

2. **Run the version workflow** (maintainers only):
   - Go to Actions → "Version & Changelog"
   - Select release type (patch/minor/major)
   - Run workflow

3. **The workflow will**:
   - Bump version
   - Update CHANGELOG.md
   - Create git tag
   - Push changes

4. **Release workflow triggers automatically**:
   - Creates GitHub release
   - Publishes to NPM
   - Publishes to GitHub Packages

### Version Bumping Guide

- **patch**: Bug fixes, minor changes (1.0.0 → 1.0.1)
- **minor**: New features, non-breaking changes (1.0.0 → 1.1.0)
- **major**: Breaking changes (1.0.0 → 2.0.0)

## Project Structure

```
license-guardian/
├── .github/
│   └── workflows/          # GitHub Actions workflows
├── src/
│   ├── checker.ts          # Core license checking logic
│   ├── checker.test.ts     # Tests for checker
│   ├── cli.ts              # CLI entry point
│   ├── index.ts            # Main exports
│   └── types.ts            # TypeScript types
├── dist/                   # Compiled output (gitignored)
├── commitlint.config.js    # Commitlint config
├── lefthook.yml            # Git hooks config
├── tsconfig.json           # TypeScript config
├── vitest.config.ts        # Vitest config
└── package.json
```

## Style Guide

### TypeScript

- Use explicit types for function parameters and return values
- Prefer `interface` over `type` for object types
- Use meaningful variable names
- Add JSDoc comments for public APIs

### Code Formatting

- 2 spaces for indentation
- Single quotes for strings
- Semicolons at end of statements
- Trailing commas in multi-line objects/arrays

## Getting Help

- **Issues**: [GitHub Issues](https://github.com/OmarBERRABEH/license-guardian/issues)
- **Discussions**: [GitHub Discussions](https://github.com/OmarBERRABEH/license-guardian/discussions)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to @license-guardian/licenses! 🎉
