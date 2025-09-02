# Infrastructure (Docker/Podman)

## Goals

- Provide isolated environments for **ui** (React) and **service** (SlimPHP)
- Support both **development mode** (hot reloading, mounted volumes) and **production mode** (optimized images)
- Ensure reproducible builds and consistent environments across developers and deployment targets

## Structure

- Each application (`ui`, `service`) includes its own `Dockerfile` under `apps/`
- Orchestration is handled via `docker-compose` (or Podman Compose equivalent), with separate configurations for development and production
- Shared Docker configuration files are placed under `tools/docker/`

## Development Setup

- ui (React):

  - Runs on Node.js in development mode with hot reloading enabled (`npm run dev`)
  - Application code is mounted as a volume for immediate feedback during changes
  - Exposed on port `3000`

- service (SlimPHP):

  - Runs on Apache with PHP 8.1+ and SlimPHP 4
  - Code is mounted as a volume to allow live changes
  - Exposed on port `8080`

## Production Setup

- ui (React):

  - Built as static assets using a multi-stage Docker build
  - Served from an Nginx container optimized for static content delivery
  - Exposed on port `80`

- service (SlimPHP):

  - Runs in an Apache/PHP container with production dependencies only
  - Exposed on port `8080`

## Best Practices

- Use **multi-stage builds** to minimize image size and separate build dependencies from runtime
- Maintain separate `docker-compose` files for development (`docker-compose.dev.yml`) and production (`docker-compose.prod.yml`)
- Store sensitive values (e.g., JWT secret) in `.env` files, not in the Docker configuration itself
- Use `.dockerignore` to exclude unnecessary files from images (e.g., `node_modules`, build caches)

## Deployment Options

- Local development: run `docker compose -f docker-compose.dev.yml up` to start all services
- Production deployment: build optimized images and run with `docker compose -f docker-compose.prod.yml up`
- Optional: integrate with Nx targets to run `docker-build` and `docker-deploy` commands consistently
