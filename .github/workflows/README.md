# GitHub Actions Workflows

This directory contains automated workflows for CI/CD, releases, and version management.

## Workflows

### 1. CI Workflow (`ci.yml`)

**Trigger:** Push or PR to `main` or `develop` branches

**Jobs:**
- **Lint**: TypeScript type checking
- **Test**: Run unit tests on Node.js 18 and 20
- **Build**: Compile TypeScript to JavaScript

**Features:**
- Matrix testing across multiple Node.js versions
- Code coverage reporting with Codecov
- Build artifact uploads

### 2. Release & Publish Workflow (`release.yml`)

**Trigger:** Push tags matching `v*.*.*` (e.g., `v1.0.0`)

**Jobs:**
- **Release**: Create GitHub release with auto-generated changelog
- **Publish to NPM**: Publish package to npm registry
- **Publish to GPR**: Publish package to GitHub Packages

**Requirements:**
- `NPM_TOKEN` secret must be set in repository settings
- Tag must follow semantic versioning format

### 3. Version & Changelog Workflow (`version.yml`)

**Trigger:** Manual workflow dispatch

**Inputs:**
- `release-type`: Choose from `patch`, `minor`, or `major`

**Jobs:**
- Run tests to ensure code quality
- Bump version using standard-version
- Generate changelog from conventional commits
- Create and push new version tag
- Create PR to merge release back to develop

## How to Use

### Creating a New Release

1. **Commit your changes using conventional commits:**
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug"
   ```

2. **Run the version workflow:**
   - Go to Actions tab in GitHub
   - Select "Version & Changelog"
   - Click "Run workflow"
   - Select release type (patch/minor/major)
   - Click "Run workflow"

3. **The workflow will:**
   - Run tests
   - Bump version in package.json
   - Update CHANGELOG.md
   - Create a git tag
   - Push changes

4. **Pushing the tag triggers the release workflow:**
   - Creates GitHub release
   - Publishes to NPM
   - Publishes to GitHub Packages

### Conventional Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test changes
- `build`: Build system changes
- `ci`: CI configuration changes
- `chore`: Other changes

**Examples:**
```bash
git commit -m "feat(api): add license validation endpoint"
git commit -m "fix(checker): handle unknown license types"
git commit -m "docs: update API reference"
```

## Required Secrets

### NPM_TOKEN
1. Login to npmjs.com
2. Go to Access Tokens
3. Generate New Token (Automation)
4. Copy token
5. Add to GitHub repository secrets as `NPM_TOKEN`

### GITHUB_TOKEN
Automatically provided by GitHub Actions.

## Branch Strategy

- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: Feature branches
- `release/*`: Release branches (auto-created)

## Troubleshooting

### Release fails to publish to NPM
- Verify `NPM_TOKEN` is set correctly
- Check if version already exists on NPM
- Verify package name is available

### Tests fail in CI
- Run tests locally: `npm test`
- Check Node.js version compatibility
- Review test logs in Actions tab

### Version workflow doesn't create tag
- Verify tests pass
- Check git credentials configuration
- Review workflow logs for errors
