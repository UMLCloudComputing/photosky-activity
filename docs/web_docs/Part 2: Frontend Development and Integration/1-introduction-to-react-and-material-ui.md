---
sidebar_position: 1
slug: /activities/part-2-frontend-development-and-integration/1-introduction-to-react-and-material-ui
---

<!-- :::info
This tutorial only covers creating the web app, but you can make PhotoSky into a mobile app by following [Part 3](/activities/part-3-mobile-app-integration) -->

# Introduction to React, Material-UI, and Additional Libraries

Welcome to Part 2 of the PhotoSky tutorial! In this section, we'll dive into the frontend development of our application using [React](https://react.dev), [Material-UI](https://mui.com/material-ui), and several other powerful libraries. These tools will help us create a responsive, user-friendly interface for our cloud-based image management system.

## What is React?

React is a popular JavaScript library for building user interfaces. Developed and maintained by Facebook, React allows developers to create reusable UI components that efficiently update and render as data changes.

Key features of React include:

1. **Component-Based Architecture**: Build encapsulated components that manage their own state.
2. **Virtual DOM**: Optimizes rendering performance by minimizing direct manipulation of the DOM.
3. **JSX**: A syntax extension that allows you to write HTML-like code in your JavaScript.
4. **Unidirectional Data Flow**: Makes code more predictable and easier to debug.

## What is Material-UI?

Material-UI is a popular React UI framework that implements Google's Material Design. It provides a set of pre-built React components that you can use to build a consistent, attractive, and responsive user interface quickly.

Key features of Material-UI include:

1. **Ready-to-use Components**: A wide range of pre-styled components like buttons, cards, and navigation bars.
2. **Customization**: Easily override default styles to match your brand.
3. **Responsive Design**: Built-in responsiveness for various screen sizes.
4. **Theming**: Comprehensive theming support for creating coherent designs.

## Additional Libraries

In addition to React and Material-UI, our PhotoSky application uses several other libraries to enhance its functionality:

### [Axios](https://axios-http.com/)

Axios is a popular, promise-based HTTP client for the browser and Node.js. We use it to make API calls to our backend services.

### [Notistack](https://notistack.com/)

Notistack is a notification library for React applications. It provides an easy way to display snackbars (brief messages) in our app, which we use for user feedback on actions like image uploads or deletions.

### [@capacitor/camera](https://capacitorjs.com/docs/apis/camera)

This library, part of the Capacitor framework, allows us to access the device's camera functionality. We use it to enable users to take photos directly within our app.


### @emotion/react and @emotion/styled

These libraries provide efficient CSS-in-JS solutions, allowing us to write CSS directly in our JavaScript files. They work seamlessly with Material-UI for advanced styling capabilities.

## Why These Technologies for PhotoSky?

For our PhotoSky application, this combination of technologies offers several advantages:

1. **Efficient Updates**: React's efficient rendering system is perfect for our image gallery, which will need to update as images are added or removed.
2. **Component Reusability**: We can create reusable components for image cards, upload buttons, etc.
3. **Responsive Design**: Material-UI's responsive components ensure our app looks great on both desktop and mobile devices.
4. **Consistent Styling**: Material-UI provides a cohesive look and feel across our application with minimal custom CSS.
5. **Enhanced User Experience**: Libraries like Notistack allow us to provide immediate feedback to users, improving the overall user experience.
6. **Cross-Platform Compatibility**: Capacitor enables us to use native device features like the camera while maintaining a single codebase.
7. **Efficient API Communication**: Axios simplifies our API calls and error handling.

## Setting Up Our React Project

Our PhotoSky project is already set up with Create React App, which provides a solid foundation for React development. Let's take a look at the key files in our project:

```
photosky/
├── package.json
├── public/
│   └── index.html
└── src/
    ├── App.js
    └── index.js
```

- `package.json`: Lists our project dependencies and scripts.
- `public/index.html`: The HTML template for our app.
- `src/App.js`: The main React component of our application.
- `src/index.js`: The entry point of our React app.

## Project Dependencies

You can see the main dependencies in the `package.json` file:

```json
"dependencies": {
  "@capacitor/android": "^6.1.2",
  "@capacitor/camera": "^6.0.2",
  "@capacitor/core": "^6.1.2",
  "@emotion/react": "^11.13.3",
  "@emotion/styled": "^11.13.0",
  "@mui/icons-material": "^6.0.1",
  "@mui/material": "^6.0.1",
  "axios": "^1.7.7",
  "notistack": "^3.0.1",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  // ... other dependencies
}
```

These packages provide the core functionality, UI components, and additional features we'll be using in our application.

## A Simple React and Material-UI Example

Let's look at a basic example of how we'll use React and Material-UI in our PhotoSky app. This is a simplified version of what we'll be building:

```jsx
import React from 'react';
import { AppBar, Toolbar, Typography, Button, ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { SnackbarProvider, useSnackbar } from 'notistack';

const theme = createTheme({
  // Theme configuration
});

function App() {
  const { enqueueSnackbar } = useSnackbar();

  const handleUpload = () => {
    // Upload logic here
    enqueueSnackbar('Image uploaded successfully!', { variant: 'success' });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            PhotoSky
          </Typography>
          <Button color="inherit" startIcon={<CloudUploadIcon />} onClick={handleUpload}>
            Upload
          </Button>
        </Toolbar>
      </AppBar>
      {/* More components will go here */}
    </ThemeProvider>
  );
}

export default function AppWrapper() {
  return (
    <SnackbarProvider maxSnack={3}>
      <App />
    </SnackbarProvider>
  );
}
```

In this example, we're using Material-UI's [AppBar](https://mui.com/material-ui/react-app-bar/), [Toolbar](https://mui.com/material-ui/api/toolbar/), [Typography](https://mui.com/material-ui/react-typography/), and [Button](https://mui.com/material-ui/react-button) components to create a simple header for our application. We're also using the [ThemeProvider](https://mui.com/material-ui/customization/theming/#theme-provider) for consistent theming, [CssBaseline](https://mui.com/material-ui/react-css-baseline/) for baseline styles, and [SnackbarProvider](https://notistack.com/api-reference) from notistack for notifications.

## Conclusion

React, Material-UI, and our additional libraries provide a powerful combination for building the frontend of our PhotoSky application. React's component-based architecture will help us create a dynamic and efficient user interface, while Material-UI will ensure our app looks great and follows modern design principles. Libraries like Axios, Notistack, and Capacitor's camera module will enable us to create a fully-featured, responsive, and user-friendly image management system.

In the next sections, we'll dive deeper into building specific components of our PhotoSky application, including the image gallery, upload functionality, and more. We'll see how all these technologies come together to create a robust cloud-based image management system.