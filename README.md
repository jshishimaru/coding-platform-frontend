# Coding Platform

A modern, full-stack collaborative coding platform built for performance and scalability.

## 🐳 Docker

### Quick Start with Scripts

```bash
# Build the Docker image
./scripts/build/docker-build.sh

# Run the container 
./scripts/run/docker-run.sh

# Stop the container
./scripts/run/docker-stop.sh
```

The application will be available at [http://localhost:8080](http://localhost:8080).


## 📝 Configuration

Environment variables can be configured in `.env` files (during development) or passed as build args/runtime vars if configured.
See `src/config/env.ts` for available configuration options.

