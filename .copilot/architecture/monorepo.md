# Monorepo Architecture

## Overview

This project uses an Nx monorepo structure to manage multiple applications and shared libraries. This approach provides:

- Consistent tooling
- Code sharing
- Dependency management
- Build optimization

## Repository Structure

```
root/
├── apps/                   # Application projects
│   ├── service/            # PHP backend
│   │   ├── src/            # Source code
│   │   ├── tests/          # Tests
│   │   └── composer.json   # PHP dependencies
│   ├── ui/                 # React frontend
│   │   ├── src/            # Source code
│   │   ├── public/         # Static assets
│   │   └── package.json    # Node dependencies
│   └── ui-e2e/             # E2E tests
├── libs/                   # Shared libraries
│   ├── shared-types/       # Shared TypeScript types
│   ├── ui-components/      # Shared React components
│   └── utils/              # Shared utilities
├── tools/                  # Development tools
│   ├── generators/         # Custom generators
│   └── scripts/            # Build scripts
└── workspace.json          # Nx workspace config
```

## Configuration

### Nx Workspace Configuration

```json
{
  "version": 2,
  "projects": {
    "ui": {
      "root": "apps/ui",
      "sourceRoot": "apps/ui/src",
      "projectType": "application",
      "targets": {
        "build": {
          "executor": "@nrwl/web:build",
          "options": {
            "outputPath": "dist/apps/ui",
            "index": "apps/ui/src/index.html",
            "main": "apps/ui/src/main.tsx",
            "polyfills": "apps/ui/src/polyfills.ts",
            "tsConfig": "apps/ui/tsconfig.app.json"
          }
        },
        "serve": {
          "executor": "@nrwl/web:dev-server",
          "options": {
            "buildTarget": "ui:build"
          }
        },
        "test": {
          "executor": "@nrwl/jest:jest",
          "options": {
            "jestConfig": "apps/ui/jest.config.js"
          }
        }
      }
    }
  }
}
```

## Dependency Management

### Shared Dependencies

```json
{
  "dependencies": {
    "@project/shared-types": "workspace:*",
    "@project/ui-components": "workspace:*",
    "@project/utils": "workspace:*"
  }
}
```

### Package Management

```json
{
  "private": true,
  "workspaces": ["apps/*", "libs/*"],
  "scripts": {
    "build": "nx run-many --target=build --all",
    "test": "nx run-many --target=test --all",
    "lint": "nx run-many --target=lint --all"
  }
}
```

## Build System

### Build Configuration

```typescript
// workspace.json
{
  "cli": {
    "defaultCollection": "@nrwl/workspace"
  },
  "defaultProject": "ui",
  "generators": {
    "@nrwl/react": {
      "application": {
        "style": "scss",
        "linter": "eslint",
        "babel": true
      },
      "component": {
        "style": "scss"
      },
      "library": {
        "style": "scss",
        "linter": "eslint"
      }
    }
  }
}
```

## Code Generation

### Custom Generators

```typescript
// tools/generators/feature/index.ts
import { Tree, formatFiles, installPackagesTask } from "@nrwl/devkit";
import { libraryGenerator } from "@nrwl/workspace/generators";

export default async function (tree: Tree, schema: any) {
  await libraryGenerator(tree, {
    name: `feature-${schema.name}`,
    directory: "libs/features",
    tags: `type:feature,scope:${schema.scope}`,
  });
  await formatFiles(tree);
  return () => {
    installPackagesTask(tree);
  };
}
```

## Development Workflow

### Commands

#### Build Commands

```bash
# Build all projects
nx run-many --target=build --all

# Build specific project
nx build ui

# Build affected projects
nx affected:build
```

#### Test Commands

```bash
# Test all projects
nx run-many --target=test --all

# Test specific project
nx test ui

# Test affected projects
nx affected:test
```

#### Development Commands

```bash
# Start development servers
nx serve ui    # Frontend
nx serve api   # Backend

# Generate new lib
nx g @nrwl/react:lib my-lib

# Generate new component
nx g @nrwl/react:component my-component --project=ui
```

## Best Practices

### Project Organization

1. Keep related code together
2. Share code through libraries
3. Use consistent naming
4. Maintain clear boundaries

### Dependency Management

1. Use workspace dependencies
2. Keep shared dependencies in root
3. Version lock important packages
4. Regular dependency updates

### Build Performance

1. Use Nx caching
2. Optimize build order
3. Share build artifacts
4. Regular cache cleanup

### Code Sharing

1. Create focused libraries
2. Use proper abstractions
3. Maintain clear interfaces
4. Document shared code

## Version Control

### Git Configuration

```gitignore
# .gitignore
node_modules/
dist/
tmp/
.env
.nx/
```

### Branch Strategy

1. main - Production code
2. develop - Development code
3. feature/\* - Feature branches
4. release/\* - Release branches
5. hotfix/\* - Hotfix branches

## CI/CD Integration

### Nx Cloud Setup

```json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "@nrwl/nx-cloud",
      "options": {
        "accessToken": "your-token",
        "cacheableOperations": ["build", "test", "lint"]
      }
    }
  }
}
```

### GitHub Actions

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: nx affected:build
      - name: Test
        run: nx affected:test
```
