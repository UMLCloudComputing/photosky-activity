---
sidebar_position: 2
slug: /activities/part-1-aws-infrastructure-and-backend/2-setting-up-aws-environment
---

# Setting Up Your AWS Environment

In this section, we'll prepare your development environment and set up your AWS account to start building the PhotoSky application. We'll cover two methods: using GitHub Codespaces (recommended) and manual setup.

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
     ```bash
     node --version
     npm --version
     aws --version
     cdk --version
     ```
   - You should see version numbers for each tool, confirming they're installed correctly.

4. **Configure AWS Credentials**:
   - In the Codespace terminal, run:
     ```bash
     aws configure
     ```
   - Enter your AWS Access Key ID, Secret Access Key, and default region (e.g., us-east-1).

That's it! Your development environment is now set up and ready to go.

## Method 2: Manual Setup

If you prefer to work on your local machine or can't use GitHub Codespaces, ensure you have the following installed on your machine:
- Git
- Node.js (v22 or later)
- npm (usually comes with Node.js)
- AWS CLI
- AWS CDK

**Verify Installation**:
Run the following commands to ensure everything is installed correctly:
```bash
node --version
npm --version
aws --version
cdk --version
```

## Setting Up Your AWS Account

After setting up your development environment, you need to configure your AWS credentials and project settings:

1. **Create a .env file**:
   - In the root directory of the project, you'll find a `.env.example` file. Make a copy of this file and name it `.env`.
   - Open the `.env` file in your text editor.

2. **Fill in your AWS credentials and APP_NAME**:
   - Replace the placeholders in your `.env` file with your actual AWS credentials and a custom APP_NAME:

     ```
     AWS_ACCESS_KEY_ID=<YOUR_AWS_ACCESS_KEY_ID>
     AWS_SECRET_ACCESS_KEY=<YOUR_AWS_SECRET_ACCESS_KEY>
     AWS_DEFAULT_REGION=us-east-1
     APP_NAME=<YOUR_UNIQUE_APP_NAME>
     REACT_APP_API_URL=
     ```

   - For `APP_NAME`, choose a unique name to prevent collisions with other students' projects. For example, you could use your initials followed by "photosky" (e.g., "jd-photosky").
   - Leave `REACT_APP_API_URL` empty for now. We'll fill this in later.

3. **Configure AWS CLI**:
   - In your terminal, run the following command:
     ```
     make aws-login
     ```
   - This command uses the credentials from your `.env` file to configure the AWS CLI.

4. **Verify AWS Configuration**:
   - To ensure your AWS credentials are correctly set up, run:
     ```
     aws configure list
     ```
   - If configured correctly, this command will return your AWS account ID and IAM user information.

Remember, always be cautious with your AWS credentials and never share them publicly. The `.env` file is included in `.gitignore` to prevent accidental commits of your sensitive information. If you accidentally expose your credentials, immediately deactivate them in the AWS Console and create new ones.

## Conclusion

You now have your development environment set up and your AWS account ready for the PhotoSky project. In the next section, we'll start designing our backend architecture and discuss the AWS services we'll be using in more detail.

Remember, always be cautious with your AWS credentials and never share them publicly. If you accidentally expose your credentials, immediately deactivate them in the AWS Console and create new ones.

Happy coding!