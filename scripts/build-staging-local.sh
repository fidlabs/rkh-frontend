#!/bin/bash

# Build and push staging container locally using Docker Buildx
# This script matches the GitHub Action build process

set -e  # Exit on any error

# Configuration
GITHUB_USERNAME="fidlabs"  # CHANGE THIS to your GitHub username
REGISTRY="ghcr.io"
IMAGE_NAME="allocator-rkh-frontend"
TAG="staging-local"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Building staging container locally with Docker Buildx${NC}"
echo ""

# Safety check 1: Ensure Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running or not accessible${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi
echo -e "${GREEN}✅ Docker is running${NC}"

# Safety check 2: Check if logged into GitHub Container Registry
echo -e "${YELLOW}🔐 Checking GitHub Container Registry login...${NC}"
if ! cat ~/.docker/config.json | jq -e '.auths."ghcr.io"' > /dev/null 2>&1; then
    echo -e "${RED}❌ Not logged into GitHub Container Registry${NC}"
    echo "Please login to GitHub Container Registry first:"
    echo "  echo \$GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin"
    echo ""
    echo "You'll need a GitHub Personal Access Token with 'write:packages' permission"
    exit 1
fi

# Check if we can access ghcr.io (even if the specific image doesn't exist)
echo -e "${GREEN}✅ Logged into GitHub Container Registry${NC}"

# Safety check 3: Ensure we're in the right directory
if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}❌ Dockerfile not found in current directory${NC}"
    echo "Please run this script from the rkh-frontend directory"
    exit 1
fi
echo -e "${GREEN}✅ In correct directory (rkh-frontend)${NC}"

# Safety check 4: Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found${NC}"
    echo "This doesn't look like a Node.js project directory"
    exit 1
fi
echo -e "${GREEN}✅ Node.js project detected${NC}"

echo ""
echo -e "${BLUE}🔧 Setting up Docker Buildx...${NC}"

# Create and use a new builder instance
BUILDER_NAME="local-staging-builder"
if docker buildx inspect $BUILDER_NAME > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Builder '$BUILDER_NAME' already exists, using it${NC}"
    docker buildx use $BUILDER_NAME
else
    echo -e "${BLUE}📦 Creating new builder instance: $BUILDER_NAME${NC}"
    docker buildx create --name $BUILDER_NAME --use
fi

echo -e "${GREEN}✅ Buildx builder ready${NC}"
echo ""

# Build the staging image
echo -e "${BLUE}🏗️  Building staging container...${NC}"
echo "Build arguments:"
echo "  - NEXT_PUBLIC_APP_ENVIRONMENT=staging"
echo "  - BUILD_CONTEXT=application"
echo ""

docker buildx build \
  --build-arg NEXT_PUBLIC_APP_ENVIRONMENT=staging \
  --build-arg BUILD_CONTEXT=application \
  --platform linux/amd64 \
  --load \
  -t $REGISTRY/$GITHUB_USERNAME/$IMAGE_NAME:$TAG .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build completed successfully!${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🧪 Testing the built image...${NC}"

# Test that the image runs
echo "Starting container for testing..."
docker run --rm -d -p 3000:3000 --name test-staging-$TAG $REGISTRY/$GITHUB_USERNAME/$IMAGE_NAME:$TAG

# Wait for container to start
echo "Waiting for container to start..."
sleep 10

# Check if it's running
if docker ps | grep -q "test-staging-$TAG"; then
    echo -e "${GREEN}✅ Container is running successfully!${NC}"
    echo -e "${BLUE}🌐 Test it at: http://localhost:3000${NC}"
    
    # Check environment variable
    ENV_VALUE=$(docker exec test-staging-$TAG env | grep NEXT_PUBLIC_APP_ENVIRONMENT || echo "Not found")
    echo -e "${BLUE}🔍 Environment: $ENV_VALUE${NC}"
    
    echo ""
    echo -e "${YELLOW}🛑 Stopping test container...${NC}"
    docker stop test-staging-$TAG
    
    echo ""
    echo -e "${GREEN}🎉 Ready to push to registry!${NC}"
    echo ""
    echo "To push to GitHub Container Registry:"
    echo "  docker push $REGISTRY/$GITHUB_USERNAME/$IMAGE_NAME:$TAG"
    echo ""
    echo "To deploy on Digital Ocean, use this image:"
    echo "  $REGISTRY/$GITHUB_USERNAME/$IMAGE_NAME:$TAG"
    
else
    echo -e "${RED}❌ Container failed to start${NC}"
    echo "Container logs:"
    docker logs test-staging-$TAG
    docker stop test-staging-$TAG 2>/dev/null || true
    exit 1
fi

echo ""
echo -e "${GREEN}✨ Script completed successfully!${NC}"
