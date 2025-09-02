# Workspace Configuration

## Quick Links

- [Development Workflow](./02-workflow.md)
- [Backend Architecture](./architecture/backend.md)
- [Frontend Architecture](./architecture/frontend.md)
- [Testing Guidelines](./guidelines/testing.md)

## Editor Settings

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[php]": {
    "editor.defaultFormatter": "bmewburn.vscode-intelephense-client"
  }
}
```

## Extensions

### Required

- ESLint
- Prettier
- PHP Intelephense
- GitLens
- Docker
- Nx Console
- PHP Debug

### Recommended

- GitHub Copilot
- Code Spell Checker
- TODO Highlight
- Error Lens

## Git Configuration

### Hooks

- pre-commit: lint and format
- pre-push: run tests
- commit-msg: enforce conventional commits

### Branch Naming

- feature/\*: new features
- fix/\*: bug fixes
- chore/\*: maintenance tasks
- docs/\*: documentation updates

## Build Tools

### NPM Scripts

- `npm run dev`: development mode
- `npm run build`: production build
- `npm run test`: run tests
- `npm run lint`: lint code
- `npm run format`: format code

### Composer Scripts

- `composer install`: install dependencies
- `composer test`: run PHP tests
- `composer cs-fix`: fix code style
- `composer analyze`: static analysis

## CI/CD Pipeline

### GitHub Actions

- Build and test
- Code quality checks
- Security scanning
- Docker image building
- Automated deployment

### Quality Gates

- Test coverage > 80%
- No security vulnerabilities
- All tests passing
- Code style compliance
- Type checking passing
