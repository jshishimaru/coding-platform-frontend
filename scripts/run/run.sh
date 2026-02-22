#!/bin/bash

# Run Docker container for coding platform
IMAGE_NAME="coding-platform"
CONTAINER_NAME="coding-platform-app"
HOST_PORT=8080
CONTAINER_PORT=80

echo "🚀 Running Docker container"
echo "================================================"

# Check if container is already running
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "⚠️  Container '$CONTAINER_NAME' is already running"
    echo "Stopping existing container..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Check if container exists but is stopped
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "🗑️  Removing stopped container..."
    docker rm $CONTAINER_NAME
fi

# Run the container
echo "Starting container..."
docker run -p $HOST_PORT:$CONTAINER_PORT --name $CONTAINER_NAME $IMAGE_NAME:latest

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Container started successfully!"
    echo "🌐 Application: http://localhost:$HOST_PORT"
    echo "📦 Container: $CONTAINER_NAME"
    echo ""
    echo "To view logs:"
    echo "  docker logs -f $CONTAINER_NAME"
    echo ""
    echo "To stop the container:"
    echo "  docker stop $CONTAINER_NAME"
else
    echo ""
    echo "❌ Failed to start container!"
    exit 1
fi
