---
sidebar_position: 5
slug: /activities/part-2-frontend-development-and-integration/5-capacitor-android-integration
---

# Capacitor Android Integration

In this section, we'll dive deep into the process of using Capacitor to create an Android app from our PhotoSky web application. We'll cover setting up Capacitor, adding the Android platform, implementing native features like camera access, building the Android app, and running it in Android Studio.

## Prerequisites

Before we begin, ensure you have the following installed:
- Node.js and npm (v14 or later)
- Android Studio (latest version)
- Java Development Kit (JDK) 11 or later
- Android SDK with the following components:
  - Android SDK Platform 29 (or the latest stable version)
  - Android SDK Build-Tools
  - Android SDK Platform-Tools
  - Android Emulator

Make sure you have Android Studio properly set up with the Android SDK and at least one Android Virtual Device (AVD) for testing.

## Step 1: Install Capacitor

First, let's install Capacitor in our project. In your project root directory, run:

```bash
npm install @capacitor/core @capacitor/cli
```

## Step 2: Initialize Capacitor

Initialize Capacitor in your project:

```bash
npx cap init
```

You'll be prompted to enter your app's name and package ID. Use:
- App name: PhotoSky
- Package ID: org.umlcloudcomputing.photosky

## Step 3: Add Android Platform

Now, let's add the Android platform to our project:

```bash
npm install @capacitor/android
npx cap add android
```

This command creates an Android project in the `android` directory.

## Step 4: Configure Capacitor

Update the `capacitor.config.ts` file in your project root to ensure it's correctly configured:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.umlcloudcomputing.photosky',
  appName: 'PhotoSky',
  webDir: 'build',
  bundledWebRuntime: false
};

export default config;
```

Make sure the `webDir` points to your build output directory ('build' for Create React App projects).

## Step 5: Install Capacitor Camera Plugin

For camera functionality, we need to install the Capacitor Camera plugin:

```bash
npm install @capacitor/camera
npx cap sync
```

## Step 6: Implement Camera Functionality

Update your `App.js` to include the camera functionality. Here's an example of how to implement it:

```javascript
import { Camera, CameraResultType } from '@capacitor/camera';

// ... other imports

const takePicture = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri
    });

    // Generate a random unique ID for the file name
    const randomFileName = `captured-image-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpg`;

    const file = await fetch(image.webPath)
      .then(res => res.blob())
      .then(blob => new File([blob], randomFileName, { type: 'image/jpeg' }));
    
    await uploadImage(file);
  } catch (error) {
    console.error('Error capturing image:', error);
    enqueueSnackbar('Error capturing image', { variant: 'error' });
  }
};

// Use this function in your UI, for example:
// <Button onClick={takePicture}>Take Picture</Button>
```

## Step 7: Build Your Web App

Before we can create the Android app, we need to build our React application:

```bash
npm run build
```

## Step 8: Copy Web Assets

After building your web app, copy the web assets to the Android project:

```bash
npx cap sync
```

This command copies your built web assets to the Android project and updates the native configuration.

## Step 9: Open in Android Studio

Now, let's open the project in Android Studio:

```bash
npx cap open android
```

This command will open Android Studio with your Capacitor Android project.

## Step 10: Android-Specific Configurations

1. Update `android/app/src/main/AndroidManifest.xml` to include necessary permissions:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="org.umlcloudcomputing.photosky">

    <!-- Internet Permission -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- Camera Permission -->
    <uses-permission android:name="android.permission.CAMERA" />
    
    <!-- ... rest of the manifest -->
</manifest>
```

2. If you encounter any issues with the camera on Android 10+, you may need to add this to your `android/app/src/main/AndroidManifest.xml` file inside the `<application>` tag:

```xml
<application
    ...>
    android:requestLegacyExternalStorage="true"
    ...
</application>
```

## Step 11: Run the App

In Android Studio:

1. Wait for the project to index and sync.
2. Select an emulator or a connected device from the target device drop-down menu.
3. Click the "Run" button (green triangle) or press Shift + F10 to build and run the app.

You should now see your PhotoSky app running on the Android emulator or device!

## Step 12: Testing Native Features

Test the camera functionality on your Android device or emulator. Make sure you can take pictures and that they're successfully uploaded to your backend.

## Troubleshooting

If you encounter any issues:

1. Ensure all dependencies are correctly installed.
2. Check that your `capacitor.config.ts` file is correctly configured.
3. Make sure your Android SDK is up to date in Android Studio.
4. If you're having camera issues, check the permissions in the AndroidManifest.xml file.
5. For any Capacitor-related issues, the official Capacitor documentation is a great resource.

## Conclusion

You've successfully created an Android app version of your PhotoSky application using Capacitor! This allows your web app to run as a native Android application, taking advantage of native features like the camera.

Remember, Capacitor provides a bridge between web technologies and native platforms. While your core application logic remains in JavaScript/React, you now have the ability to access native Android APIs when needed.

In the next section, we'll look at how to test and deploy your Android application.