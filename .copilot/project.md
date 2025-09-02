# Project Overview

> We are building a secure picture and video sharing platform with password protection.

## Architecture

This project is structured as a full-stack application within an Nx monorepo, facilitating code sharing and organized development between the frontend and backend services.

### Core Technology Stack

- `Frontend`: React 18+ with TypeScript and TailwindCSS
- `Backend`: SlimPHP 4 with PHP 8.1+
- `Structure`: Nx Monorepo for efficient code organization
- `Storage`: File system-based storage with secure access control
- `Security`: JWT-based authentication and password protection
- `Infrastructure`: Docker/Podman with compose files for consistent environments
- `API Definition`: OpenAPI/Swagger for type-safe API contracts

## Features

### Contracts

- Create a clear contract between what we implement in frontend and backend
- The contract will be defined with openapi
- Create scripts to generate the the PHP DTOs and Typescript types

### Authentication

- Use file based storage for the users who can access the project
- Create a password protected mechanism for certain routes of the app, both frontend and backend

### Files

- File upload, download, and delete in a password protected area
- The frontend should show a progress bar for the uploads
- Drag and drop should be possible
- Photos and videos will be uploaded

## Directory Structure

The monorepo should follow a standard Nx layout:

```
apps/                   # Contains the main applications
|-- service             # The SlimPHP application
|-- ui                  # The React application
|-- ui-e2e              # End to end testing application
libs/                   # Shared libraries and utilities
|-- contracts           # Shared contracts package
| |-- openapi.yaml      # API spec (source of truth)
| |-- package.json      # so React can import TS types
| |-- composer.json     # so PHP can load schema/contracts
| |-- generated/
| | |-- php/            # generated DTOs for Slim
| | |-- ts/             # generated types for React
| |-- README.md         # instructions and information about the contracts
|-- utils/              # Utils shared between apps
|-- testing/            # Common test utilities
| ...
tools/                  # Shared tools for managing the project
|-- scripts/            # Build and deployment scripts
|-- docker/             # Docker configurations
|-- generators/         # Custom NX generators
|-- ...
...

```

## Code Quality

When generating code, always consider the context of the entire project and maintain consistency with the existing codebase. The AI agent should prioritize code generation that aligns with the specified technology stack and adheres to best practices for monorepo development. Focus on creating modular, testable code for both the React and SlimPHP applications.

- Write clean, readable, and maintainable code
- Add comments where necessary to explain complex logic
- Follow best practices for both React and PHP development
- Use security linters
- Regular dependency updates
- Security-focused code reviews
- Keep secrets in .env files
- Use environment variables
- Regular security audits

### Goals for AI Code Generation

- Ensure consistent integration between React frontend and SlimPHP backend
- Use Nx generators and proper workspace configuration for both frontend and backend apps
- Maintain modularity and reusability of code
- Always prefer clarity and readability over brevity
- Use TypeScript types and PHP strict types
- Follow RESTful API conventions
- Keep security in mind (validate inputs, escape outputs)
- Ensure all code snippets are production-ready
- When in doubt, default to modular and scalable solutions

### Security Standards

- Validate all inputs
- Sanitize all outputs
- Use prepared statements for DB queries
- Implement proper CORS policies
- Follow OWASP security guidelines
- Use environment variables for secrets
- Implement rate limiting
- Log security-related events

### Testing Guidelines

- Maintain minimum 80% code coverage
- Critical paths should have 100% coverage
- Write tests for bug fixes to prevent regressions
- Write tests before fixing bugs (TDD for bug fixes)
- Keep tests focused and atomic
- Use meaningful test descriptions
- Follow AAA pattern (Arrange-Act-Assert)
- Mock external dependencies and APIs

### Error Categories

#### Validation Errors

- Invalid input data
- Missing required fields
- Wrong data types
- Business rule violations

#### Authentication Errors

- Invalid credentials
- Expired tokens
- Missing tokens
- Invalid permissions

#### File Operation Errors

- Upload failures
- Storage errors
- File size limits
- Invalid file types

#### Network Errors

- API timeouts
- Connection failures
- Rate limiting
- CORS issues
