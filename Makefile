.PHONY: build push aws-login fix-android-sdk-permissions pip-install

# Load environment variables from the .env file
include .env
export $(shell sed 's/=.*//' .env)

build:
	@echo "Building the Docker image..."
	docker build -t ghcr.io/umlcloudcomputing/photosky-devcontainer:latest -f .devcontainer/Dockerfile .

push:
	@echo "Pushing the Docker image..."
	docker push ghcr.io/umlcloudcomputing/photosky-devcontainer:latest

aws-login:
	@echo "Configuring AWS credentials from .env file..."
	aws configure set aws_access_key_id $(AWS_ACCESS_KEY_ID)
	aws configure set aws_secret_access_key $(AWS_SECRET_ACCESS_KEY)
	aws configure set default.region $(AWS_DEFAULT_REGION)
	@echo "AWS login successful."

fix-android-sdk-permissions:
	@echo "Fixing Android SDK permissions..."
	@sudo chown ${USER} /dev/kvm
	@sudo chown ${USER}:${USER} ${ANDROID_HOME} -R

pip-install:
	@echo "Installing Python dependencies..."
	@pip3 install -r requirements.txt
	@echo "Python dependencies installed."
