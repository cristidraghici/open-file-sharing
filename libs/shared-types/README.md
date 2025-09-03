# Shared Types

This package contains the shared type definitions and DTOs used across the Open File Sharing application. The types are generated from the OpenAPI specification (`openapi.yaml`).

## Structure

- `openapi.yaml` - OpenAPI 3.0 specification (source of truth)
- `generated/ts/` - Generated TypeScript types for React frontend
- `generated/php/` - Generated PHP DTOs for Slim backend

## Generation Commands

From the project root:

```bash
# Generate both TypeScript and PHP types
nx run shared-types:generate

# Generate only TypeScript types
nx run shared-types:generate:ts

# Generate only PHP types
nx run shared-types:generate:php
```

## Initial Setup

1. Install Node dependencies:

   ```bash
   npm install
   ```

2. Install PHP dependencies:
   ```bash
   composer install
   ```

## Usage

### TypeScript (React)

The TypeScript types are available as a package and can be imported in the React application:

```typescript
import type { SomeType } from "@open-file-sharing/shared-types";
```

### PHP (Slim)

The PHP DTOs are available through composer autoloading:

```php
use OpenFileSharing\Dto\SomeDto;
```
