
build:
	@echo "Building the Docker image..."
	docker build -t ghcr.io/umlcloudcomputing/photosky-devcontainer:latest -f .devcontainer/Dockerfile .

