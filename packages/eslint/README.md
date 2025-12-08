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

## CLI

This package includes a CLI tool to help you quickly set up your ESLint configuration.

### `init`

Initialize a new `eslint.config.ts` file with your chosen preset:

```bash
# Base configuration (TypeScript + JavaScript)
pnpm exec justkits-eslint init

# With React support
pnpm exec justkits-eslint init --react

# All-in-one (Base + React + JSON + Markdown)
pnpm exec justkits-eslint init --all

# Force overwrite existing config
pnpm exec justkits-eslint init --force
```

### Options

- `--react` - Include React configuration
- `--all` - Include all configurations (Base, React, JSON, Markdown)
- `-f, --force` - Overwrite existing `eslint.config.ts` if it exists

The CLI will create a TypeScript config file wrapped with `defineConfig()` for better type safety and IntelliSense support.

## Usage

### Quick Start with CLI (Recommended)

The easiest way to get started is using the CLI:

```bash
pnpm exec justkits-eslint init --all
```

This creates an `eslint.config.ts` file ready to use.

### Manual Setup

#### All-in-One Configuration

Create an `eslint.config.ts` file in your project root with the all-inclusive configuration:

```typescript
// eslint.config.ts
import { defineConfig } from "eslint/config";
import { allConfig } from "@justkits/eslint";

export default defineConfig([
  ...allConfig,
  {
    // Add your custom rules here
  },
]);
```

#### Granular Configuration

Pick and choose only the configs you need:

```typescript
// eslint.config.ts
import { defineConfig } from "eslint/config";
import { baseConfig } from "@justkits/eslint";
import { reactConfig } from "@justkits/eslint/react";
import { jsonConfig } from "@justkits/eslint/json";
import { markdownConfig } from "@justkits/eslint/markdown";

export default defineConfig([
  ...baseConfig, // Always include base config
  ...reactConfig, // For React projects
  jsonConfig, // For linting JSON files
  markdownConfig, // For linting Markdown files
  {
    // Add your custom rules here
  },
]);
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

## License

SEE LICENSE IN LICENSE
