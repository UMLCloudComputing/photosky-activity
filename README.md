<div align="center">
  <img src="photosky/public/PhotoSky.png" alt="PhotoSky" width="250" height="250">
</div>

<div align="center">

[![Contributors](https://img.shields.io/github/contributors/UMLCloudComputing/photosky.svg?style=for-the-badge)](https://github.com/UMLCloudComputing/photosky/graphs/contributors)
[![Forks](https://img.shields.io/github/forks/UMLCloudComputing/photosky.svg?style=for-the-badge)](https://github.com/UMLCloudComputing/photosky/network/members)
[![Stargazers](https://img.shields.io/github/stars/UMLCloudComputing/photosky.svg?style=for-the-badge)](https://github.com/UMLCloudComputing/photosky/stargazers)
[![Issues](https://img.shields.io/github/issues/UMLCloudComputing/photosky.svg?style=for-the-badge)](https://github.com/UMLCloudComputing/photosky/issues)
[![MIT License](https://img.shields.io/github/license/UMLCloudComputing/photosky.svg?style=for-the-badge)](https://github.com/UMLCloudComputing/photosky/blob/master/LICENSE)
</div>

## 📘 About PhotoSky

Welcome to PhotoSky! PhotoSky is a mini-project activity developed by the UML Cloud Computing Club. The purpose of this project is to demonstrate the use of AWS services to create a serverless application. PhotoSky is a simple cross-platform application that allows users to upload images to an S3 bucket and view them in a gallery. The application also allows users to download the images and view previews.

## 🚀 Quick Start

1. **Clone the repository:**

   ```bash
   git clone https://github.com/UMLCloudComputing/photosky
   cd photosky
   ```

2. **Install dependencies:**

   - Install Python dependencies:

     ```bash
     pip install -r requirements.txt
     ```
   
   - Install Node.js dependencies:

     ```bash
     cd photosky
     npm install
     ```

   - Create npm build directory:

     ```bash
     npm run build
     cd ..
     ```

3. **Running the web application:**

   - Start the backend:

     ```bash
     cdk deploy
     ```

   - Start the frontend:

     ```bash
     cd photosky
     npm start
     ```

   This will start the web app frontend on `http://localhost:3000`. 

4. **Running the mobile app:**
   
   If you want to launch the Android mobile app in Android Studio, run the npx cap commands below:

   - Sync the build output to the Android project:

     ```bash
     npx cap sync
     ```

   - Launch the Android project in Android Studio:

     ```bash
     npx cap open android
     ```

   This will open the Android project in Android Studio, where you can build and run the app on an emulator or a physical device.

## 🎥 Demo

Check out our demo video to see PhotoSky in action:

https://github.com/user-attachments/assets/70bdff9a-9bc3-4ebc-be27-02842196eef7


## 🚀 Features

- Upload images to AWS S3
- View images in a gallery
- Download images
- View image previews
- Cross-platform support (Web and Android)
- Serverless architecture using AWS Lambda and API Gateway

## 🛠️ Technologies Used

- Frontend: React, Material-UI
- Backend: AWS Lambda, API Gateway, S3
- Infrastructure as Code: AWS CDK
- Mobile: Capacitor for Android integration

## 📚 Tutorial

For a comprehensive guide on how to build and deploy PhotoSky, check out our detailed tutorial: https://umlcloudcomputing.org/docs/activities/PhotoSky/intro

The tutorial covers:
- Setting up the AWS environment
- Implementing the backend using AWS CDK
- Creating Lambda functions
- Developing the React frontend
- Integrating with Capacitor for Android support
- Testing and deployment

## 🏁 Getting Started

To get started with PhotoSky:

1. Clone the repository
2. Follow the setup instructions in the [tutorial](https://umlcloudcomputing.org/docs/activities/PhotoSky/intro)
3. Deploy the backend using AWS CDK
4. Run the frontend locally or build for production

For detailed instructions, please refer to our comprehensive tutorial linked above.

## 🤝 Contributing

Contributions to PhotoSky are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

For any questions or concerns, please open an issue on this repository.

Happy coding with PhotoSky! 📸🌤️