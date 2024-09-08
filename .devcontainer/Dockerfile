FROM mcr.microsoft.com/vscode/devcontainers/universal:2-linux

# Install Fluxbox and other necessary packages for desktop-lite
RUN apt-get update && apt-get install -y fluxbox x11vnc xvfb bridge-utils cpu-checker libvirt-clients libvirt-daemon qemu qemu-kvm

# Set environment variables to prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive
ENV ANDROID_HOME=/usr/lib/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

# Install necessary packages
RUN apt-get update && apt-get install -y \
    wget \
    unzip \
    apt-transport-https \
    ca-certificates \
    sudo \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Check Java installation
RUN java -version

# Add the PPA repository for Android Studio
RUN add-apt-repository ppa:maarten-fonville/android-studio && \
    apt-get update

# Install Android Studio
RUN apt-get install -y android-studio

# Install Android SDK command-line tools
RUN mkdir -p $ANDROID_HOME/cmdline-tools && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O /tmp/cmdline-tools.zip && \
    unzip /tmp/cmdline-tools.zip -d $ANDROID_HOME/cmdline-tools && \
    mv $ANDROID_HOME/cmdline-tools/cmdline-tools $ANDROID_HOME/cmdline-tools/latest && \
    rm /tmp/cmdline-tools.zip

# Accept the Android SDK licenses
RUN yes | sdkmanager --licenses

# Install SDK tools and platforms
RUN sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.2"

# Clean up
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Switch back to non-root
USER codespace

# Install Node.js v22
RUN . /usr/local/share/nvm/nvm.sh && nvm install v22

# Install AWS CLI v2
COPY --from=amazon/aws-cli:latest /usr/local/aws-cli/ /usr/local/aws-cli/
RUN sudo ln -s /usr/local/aws-cli/v2/current/bin/aws /usr/local/bin/aws && \
    sudo ln -s /usr/local/aws-cli/v2/current/bin/aws_completer /usr/local/bin/aws_completer

# Install AWS CDK globally
RUN npm install -g aws-cdk
