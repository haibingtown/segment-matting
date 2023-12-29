#!/usr/bin/env bash
set -e

GIT_TAG=$1
IMAGE_DESC="Manual Matting tool powered by Segment Model"
GIT_REPO="https://github.com/haibingtown/segment-matting"

echo "Building cpu docker image..."

docker buildx build \
--file ./docker/CPUDockerfile \
--label org.opencontainers.image.title=lama-cleaner \
--label org.opencontainers.image.description="$IMAGE_DESC" \
--label org.opencontainers.image.url=$GIT_REPO \
--label org.opencontainers.image.source=$GIT_REPO \
--label org.opencontainers.image.version=$GIT_TAG \
--build-arg version=$GIT_TAG \
--tag cwq1913/lama-cleaner:cpu-$GIT_TAG .


echo "Building NVIDIA GPU docker image..."

docker buildx build \
--file ./docker/GPUDockerfile \
--label org.opencontainers.image.title=lama-cleaner \
--label org.opencontainers.image.description="$IMAGE_DESC" \
--label org.opencontainers.image.url=$GIT_REPO \
--label org.opencontainers.image.source=$GIT_REPO \
--label org.opencontainers.image.version=$GIT_TAG \
--build-arg version=$GIT_TAG \
--tag cwq1913/lama-cleaner:gpu-$GIT_TAG .
