---
sidebar_position: 2
slug: /activities/part-1-aws-infrastructure-and-backend/2-setting-up-aws-environment
---

# 🏞️ Setting Up Your AWS Environment

In this section, we'll prepare your development environment and set up your AWS account to start building the PhotoSky application. We'll cover three methods: using GitHub Codespaces (recommended), using DevContainer locally, and manual setup. We'll also go through the process of setting up environment variables crucial for the project.

## Method 1: Using GitHub Codespaces (Recommended)

GitHub Codespaces provides a complete, configurable development environment in the cloud. It's the easiest way to get started with our project.

### Steps:

1. **Clone the Repository**:
   - Visit the PhotoSky repository: [https://github.com/UMLCloudComputing/photosky](https://github.com/UMLCloudComputing/photosky)
   - Click the "Code" button, then select "Codespaces" tab.
   - Click "Create codespace on starter-code".

2. **Open in Codespace**:
   - GitHub will create and open a new Codespace for you. This may take a few minutes.
   - Once opened, you'll have a full development environment with all necessary tools pre-installed.

3. **Verify the Environment**:
   - Open a new terminal in the Codespace.
   - Run the following commands to verify the setup:
      - ```bash
         node --version
         ```
      - ```bash
         npm --version
        ```
      - ```bash  
         aws --version
        ```
      - ```bash
         cdk --version
        ```
   - You should see version numbers for each tool, confirming they're installed correctly.

## Method 2: Using DevContainer Locally

If you prefer to work on your local machine while still benefiting from a consistent development environment, you can use DevContainer with Visual Studio Code.

### Prerequisites:

- Install [Docker](https://www.docker.com/products/docker-desktop)
- Install [Visual Studio Code](https://code.visualstudio.com/)
- Install the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension for VS Code

### Steps:

1. **Clone the Repository**:
   - ```bash
      git clone https://github.com/UMLCloudComputing/photosky.git
     ```
   - Change to the photosky the directory:
     ```bash
      cd photosky
     ```

2. **Open in VS Code**:
   ```bash
   code .
   ```

3. **Start DevContainer**:
   - VS Code will detect the DevContainer configuration and prompt you to reopen the project in a container.
   - Click **"Reopen in Container"** when prompted, or use the command palette (F1) and select **"Remote-Containers: Reopen in Container"**.

4. **Wait for Container Build**:
   - The first time you open the project, it may take several minutes to build the container.
   - Once complete, you'll have a fully configured development environment.

5. **Verify the Environment**:
   - Open a new terminal in VS Code.
   - Run the verification commands as in Method 1.

## Method 3: Manual Setup

If you prefer to set up your environment manually or can't use the above methods, follow these steps:

1. **Install Required Tools**:
   - Install Git: [https://git-scm.com/downloads](https://git-scm.com/downloads)
   - Install Node.js (v22 or later): [https://nodejs.org/](https://nodejs.org/)
   - Install AWS CLI: [https://aws.amazon.com/cli/](https://aws.amazon.com/cli/)
   - Install AWS CDK: Run `npm install -g aws-cdk` in your terminal

2. **Clone the Repository**:
   ```bash
   git clone https://github.com/UMLCloudComputing/photosky.git
   cd photosky
   ```

3. **Verify Installation**:
   Run the following commands to ensure everything is installed correctly:
   ```bash
   node --version
   npm --version
   aws --version
   cdk --version
   ```

## ☁️ Setting Up Your AWS Account

After setting up your development environment, you need to configure your AWS credentials and project settings:

1. **Create an AWS Account**:
   - If you don't have an AWS account, create one at [https://aws.amazon.com/](https://aws.amazon.com/)

2. **Create an IAM User**:
   - In the AWS Console, go to IAM (Identity and Access Management)
   - Create a new user with programmatic access
   - Attach the "AdministratorAccess" policy to this user (Note: In a production environment, you'd want to limit these permissions)
   - Save the Access Key ID and Secret Access Key

3. **Set Up Environment Variables**:
   - In the root directory of the project, create a file named `.env`
   - Add the following content to the `.env` file:

     ```
     AWS_ACCESS_KEY_ID=<YOUR_AWS_ACCESS_KEY_ID>
     AWS_SECRET_ACCESS_KEY=<YOUR_AWS_SECRET_ACCESS_KEY>
     AWS_DEFAULT_REGION=us-east-1
     APP_NAME=<YOUR_UNIQUE_APP_NAME>
     REACT_APP_API_URL=
     ```

   - Replace `<YOUR_AWS_ACCESS_KEY_ID>` and `<YOUR_AWS_SECRET_ACCESS_KEY>` with the credentials from step 2
   - For `APP_NAME`, choose a unique name to prevent collisions with other students' projects. For example, you could use your initials followed by "photosky" (e.g., "jd-photosky")
   - Leave `REACT_APP_API_URL` empty for now. We'll fill this in later after deploying the backend

4. **Configure AWS CLI**:
   - In your terminal from within `/photosky-activity` (`/workspaces/photosky-activity/` is on Github Codespaces), run:
     ```
     make aws-login
     ```
   - This command uses the credentials from your `.env` file to configure the AWS CLI

   :::info
   Utilize the `cd` command to change directories if needed
   :::

5. **Verify AWS Configuration**:
   - Within the same root directory of the project run the following command:
     ```
     aws configure list
     ```
   - If configured correctly, this command will display your AWS account information.

## 🐍 Installing required python packages for later stages
From within the root directory of your project (`photosky-activity` or `/workspaces/photosky-activity`) run the following command in the **terminal** to install the required python packages. <br/>
These packages will be used when we implement our infrastructure as code with our own stack

```bash
pip install -r requirements.txt
```

:::info
Utilize the `cd` command within the terminal to change to the root directory of your respository. <br/>
:::

:::info
Your current directory is always displayed in terminal to the left of where you can type. <br/>
IE `user@localhost:~/photosky-activity$` <br/>
The portion marked  `~/photosky-activity` is your current working directory.<br/>
:::

:::note
If you're unsure about the basics of working with a linux shell. Be sure to review resources like [this](https://ubuntu.com/tutorials/command-line-for-beginners#6-a-bit-of-plumbing)
:::


## 🔉 Environment Variables Explanation

- `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`: These are your AWS credentials used to authenticate your requests to AWS services
- `AWS_DEFAULT_REGION`: Specifies the AWS region where your resources will be created (e.g., us-east-1)
- `APP_NAME`: A unique identifier for your application, used to name AWS resources
- `REACT_APP_API_URL`: Will store the URL of your API Gateway after backend deployment

## ❗ Important Notes

- Never commit your `.env` file to version control. It's already included in `.gitignore` to prevent accidental commits
- If you accidentally expose your AWS credentials, immediately deactivate them in the AWS Console and create new ones
- The `make aws-login` command in the Makefile is a convenient way to set up AWS CLI with your credentials, but make sure you understand what it does before running it

## 🛣️  Conclusion

You now have your development environment set up and your AWS account configured for the PhotoSky project. Whether you chose to use GitHub Codespaces, DevContainer locally, or a manual setup, you're ready to start developing.

In the next section, we'll start designing our backend architecture and discuss the AWS services we'll be using in more detail.

Remember to keep your AWS credentials secure and never share them publicly. If you encounter any issues during setup, refer to the project's troubleshooting guide or seek help from the course instructors.

Happy coding!