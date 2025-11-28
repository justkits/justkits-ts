# @justkits/eslint

JustKits ESLint configs, custom rules, and tooling for TypeScript, React, JSON, and Markdown. This package uses the [Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files-new) format.

## Features

- **Shareable Configs**: Pre-configured ESLint setups for common use cases
- **Custom Rules**: JustKits-specific ESLint rules (coming soon)
- **Tooling**: Development utilities for working with ESLint

## Installation

Install this package as a development dependency:

```bash
pnpm add -D @justkits/eslint
```

## Usage

### Quick Start (All-in-One)

Create an `eslint.config.js` file in your project root and use the all-inclusive configuration:

```javascript
// eslint.config.js
import { allConfig } from "@justkits/eslint";

export default [
  ...allConfig,
  // Add your project-specific rules here
  // {
  //   rules: {
  //     'no-console': 'warn',
  //   }
  // }
];
```

### Granular Configuration

Pick and choose only the configs you need:

```javascript
// eslint.config.js
import {
  baseConfig,
  reactConfig,
  jsonConfig,
  markdownConfig,
} from "@justkits/eslint";

export default [
  ...baseConfig, // Always include base config
  ...reactConfig, // For React projects
  jsonConfig, // For linting JSON files
  markdownConfig, // For linting Markdown files
];
```

## Available Configurations

### `baseConfig`

Base configuration for TypeScript and JavaScript files.

- **Files**: `**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}`
- **Rules**:
  - `@eslint/js` recommended
  - `typescript-eslint` recommended
- **Ignores**: `node_modules`, `dist`, `build`, `coverage`

### `reactConfig`

Configuration for React projects.

- **Rules**: `eslint-plugin-react` recommended
- **Additional**: CSS linting for `.css` files
- **Note**: `react/react-in-jsx-scope` is disabled (not needed in modern React)

### `jsonConfig`

Configuration for JSON files.

- **Files**: `**/*.{json,jsonc,json5}`
- **Rules**: JSON format validation

### `markdownConfig`

Configuration for Markdown files.

- **Files**: `**/*.md`
- **Rules**: Linting for code blocks in GitHub Flavored Markdown

### `allConfig`

Combines all configurations above for convenience.

## Custom Rules (Coming Soon)

This package will include custom ESLint rules specific to JustKits patterns and best practices:

- Naming conventions
- Import ordering
- Component structure
- And more...

## Development

```bash
# Build the package
pnpm build
```

Type checking and linting are handled at the repository level.

## Publishing

This package uses tag-based publishing. To publish a new version:

### 1. Update the version

```bash
cd packages/eslint
npm version patch  # or minor, major
```

This updates `package.json` and creates a git commit.

### 2. Create and push the version tag

```bash
git tag eslint-v2.0.1  # Use the version from step 1
git push origin main --tags
```

### 3. Automated publishing

The GitHub Actions workflow will automatically:

- Build the package
- Run validation
- Publish to GitHub Packages

### Version Guidelines

- **Patch** (`2.0.x`): Bug fixes, minor config tweaks
- **Minor** (`2.x.0`): New configs, non-breaking features
- **Major** (`x.0.0`): Breaking changes to existing configs

## License

SEE LICENSE IN LICENSE
