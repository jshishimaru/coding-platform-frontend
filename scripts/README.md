# Scripts

This directory contains utility scripts for building and running the Coding Platform in Docker.

## Build Scripts

### `build/docker-build.sh`
Builds the Docker image for the coding platform.

**Usage:**
```bash
./scripts/build/docker-build.sh
```

## Run Scripts

### `run/docker-run.sh`
Runs the Docker container in **background mode** (detached). Automatically stops and removes any existing container with the same name.

**Usage:**
```bash
./scripts/run/docker-run.sh
```

The application will be available at [http://localhost:8080](http://localhost:8080).


### `run/docker-stop.sh`
Stops the running Docker container.

**Usage:**
```bash
./scripts/run/docker-stop.sh
```

## Complete Workflow

**Option 1: Background Mode (Daemon)**
```bash
# Build the image
./scripts/build/docker-build.sh

# Run the container in background
./scripts/run/docker-run.sh

# View logs (optional)
docker logs -f coding-platform-app

# Stop the container when done
./scripts/run/docker-stop.sh
```

**Option 2: Foreground Mode (See Logs)**
```bash
# Build the image
./scripts/build/docker-build.sh

