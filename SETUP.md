# Setup Instructions

This document provides step-by-step instructions to set up the development environment and CI/CD pipeline.

## Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## What's Included

### 1. Testing Framework (Vitest)

- **Framework**: Vitest with TypeScript support
- **Coverage**: v8 coverage provider
- **Location**: `src/*.test.ts`

**Commands:**
```bash
npm test              # Run tests once
npm run test:watch    # Watch mode
npm run test:coverage # Generate coverage report
```

### 2. Commit Linting (Commitlint)

- **Standard**: Conventional Commits
- **Configuration**: `commitlint.config.js`
- **Hook**: Validates commit messages via lefthook

**Commit Format:**
```
<type>(<scope>): <subject>

Examples:
- feat(api): add new validation endpoint
- fix(checker): handle undefined licenses
- docs: update README with examples
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `perf`: Performance
- `test`: Tests
- `build`: Build system
- `ci`: CI configuration
- `chore`: Maintenance

### 3. Git Hooks (Lefthook)

- **Configuration**: `lefthook.yml`
- **Installation**: Automatic via `npm install`

**Hooks:**
- **pre-commit**: Runs linting
- **commit-msg**: Validates commit message format
- **pre-push**: Runs tests and build

### 4. Changelog Generation

- **Tool**: standard-version
- **Output**: `CHANGELOG.md`

**Commands:**
```bash
npm run release        # Automatic version bump
npm run release:patch  # 1.0.0 → 1.0.1
npm run release:minor  # 1.0.0 → 1.1.0
npm run release:major  # 1.0.0 → 2.0.0
```

### 5. GitHub Actions Workflows

#### CI Workflow (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop`
- Pull requests to `main` or `develop`

**Jobs:**
- Linting (TypeScript type checking)
- Testing (Node.js 18 and 20)
- Build (Compile TypeScript)
- Coverage reporting (Codecov)

#### Release Workflow (`.github/workflows/release.yml`)

**Triggers:**
- Push tags matching `v*.*.*`

**Jobs:**
- Create GitHub release with changelog
- Publish to NPM registry
- Publish to GitHub Packages

**Requirements:**
- Set `NPM_TOKEN` secret in repository settings

#### Version Workflow (`.github/workflows/version.yml`)

**Trigger:**
- Manual workflow dispatch

**Inputs:**
- Release type: `patch`, `minor`, or `major`

**Actions:**
- Runs tests
- Bumps version
- Updates changelog
- Creates and pushes tag
- Creates PR to merge back to develop

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

This will:
- Install all devDependencies
- Setup lefthook git hooks automatically

### 2. Verify Setup

```bash
# Check TypeScript compilation
npm run lint

# Run tests
npm test

# Build project
npm run build
```

### 3. Configure GitHub Repository

#### Required Secrets

1. **NPM_TOKEN**
   - Login to [npmjs.com](https://npmjs.com)
   - Navigate to Access Tokens
   - Generate New Token (Automation type)
   - Copy token
   - Go to GitHub repository → Settings → Secrets → Actions
   - Add new secret: `NPM_TOKEN`

2. **GITHUB_TOKEN**
   - Automatically provided by GitHub Actions
   - No configuration needed

#### Enable Actions

1. Go to repository Settings
2. Navigate to Actions → General
3. Enable "Allow all actions and reusable workflows"
4. Save

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

```bash
# Edit files in src/
# Add tests in src/*.test.ts

# Run in watch mode during development
npm run dev
```

### 3. Test Your Changes

```bash
npm test
npm run lint
npm run build
```

### 4. Commit Changes

```bash
# Commit with conventional commit format
git commit -m "feat(scope): add new feature"
```

The commit hook will:
- Validate commit message format
- Run linting on changed files

### 5. Push Changes

```bash
git push origin feature/your-feature-name
```

The pre-push hook will:
- Run all tests
- Build the project

### 6. Create Pull Request

- Go to GitHub
- Create PR from your branch to `main`
- Fill out the PR template
- Wait for CI checks to pass

## Release Process

### Method 1: Using GitHub Actions (Recommended)

1. **Go to Actions tab** in GitHub repository

2. **Select "Version & Changelog"** workflow

3. **Click "Run workflow"**
   - Select branch: `main`
   - Choose release type: `patch`, `minor`, or `major`
   - Click "Run workflow"

4. **Wait for workflow to complete**
   - Version will be bumped
   - Changelog will be updated
   - Tag will be created and pushed

5. **Release workflow triggers automatically**
   - GitHub release is created
   - Package is published to NPM
   - Package is published to GitHub Packages

### Method 2: Manual Release

1. **Ensure you're on main branch**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Run tests**
   ```bash
   npm test
   ```

3. **Create version**
   ```bash
   npm run release:patch  # or minor, or major
   ```

4. **Push changes and tags**
   ```bash
   git push --follow-tags origin main
   ```

5. **Publish to NPM** (if CI is not set up)
   ```bash
   npm publish --access public
   ```

## Troubleshooting

### Lefthook not installed

```bash
npx lefthook install
```

### Tests failing

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Run tests
npm test
```

### Build failing

```bash
# Check TypeScript errors
npm run lint

# Clean build
rm -rf dist
npm run build
```

### Commit hook failing

```bash
# Bypass hooks (use sparingly)
git commit --no-verify -m "message"

# Or fix the issue and commit again
```

### NPM publish permission denied

1. Login to NPM
   ```bash
   npm login
   ```

2. Verify you have access to `@license-guardian` scope

3. Or publish under different scope in `package.json`

## File Structure

```
license-guardian/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml              # CI pipeline
│   │   ├── release.yml         # Release & publish
│   │   └── version.yml         # Version management
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── src/
│   ├── checker.ts              # Core logic
│   ├── checker.test.ts         # Tests
│   ├── cli.ts                  # CLI entry
│   ├── index.ts                # Exports
│   └── types.ts                # Types
├── dist/                       # Build output (gitignored)
├── coverage/                   # Test coverage (gitignored)
├── commitlint.config.js        # Commit lint config
├── lefthook.yml                # Git hooks config
├── tsconfig.json               # TypeScript config
├── vitest.config.ts            # Test config
├── CHANGELOG.md                # Generated changelog
├── CONTRIBUTING.md             # Contribution guide
├── package.json
└── README.md
```

## Additional Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Lefthook Documentation](https://github.com/evilmartians/lefthook)
- [Vitest Documentation](https://vitest.dev/)
- [Standard Version](https://github.com/conventional-changelog/standard-version)
- [GitHub Actions](https://docs.github.com/en/actions)

## Support

For issues or questions:
- [GitHub Issues](https://github.com/OmarBERRABEH/license-guardian/issues)
- [GitHub Discussions](https://github.com/OmarBERRABEH/license-guardian/discussions)

---

Happy coding! 🚀
