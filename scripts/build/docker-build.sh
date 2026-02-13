#!/bin/bash

# Build Docker image for coding platform
IMAGE_NAME="coding-platform"
IMAGE_TAG="latest"

echo "🔨 Building Docker image: $IMAGE_NAME:$IMAGE_TAG"
echo "================================================"

# Build the image
docker build -t $IMAGE_NAME:$IMAGE_TAG .

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Docker image built successfully!"
    echo "📦 Image: $IMAGE_NAME:$IMAGE_TAG"
    echo ""
    echo "To run the container, use:"
    echo "  ./scripts/run/docker-run.sh"
else
    echo ""
    echo "❌ Docker build failed!"
    exit 1
fi
