#!/bin/bash

# Stop Docker container for coding platform
CONTAINER_NAME="coding-platform-app"

echo "🛑 Stopping Docker container"
echo "================================================"

# Check if container is running
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "Stopping container: $CONTAINER_NAME"
    docker stop $CONTAINER_NAME
    
    if [ $? -eq 0 ]; then
        echo "✅ Container stopped successfully!"
        echo ""
        echo "To remove the container:"
        echo "  docker rm $CONTAINER_NAME"
    else
        echo "❌ Failed to stop container!"
        exit 1
    fi
else
    echo "⚠️  Container '$CONTAINER_NAME' is not running"
fi
