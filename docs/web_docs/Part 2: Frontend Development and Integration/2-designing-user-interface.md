---
sidebar_position: 2
slug: /activities/part-2-frontend-development-and-integration/2-designing-user-interface
---

# Designing the User Interface

In this section, we'll design and implement the user interface for our PhotoSky application. We'll create a responsive layout using Material-UI components and implement the main features of our app: displaying images, uploading new images, and managing the image gallery. We'll also integrate a notification system using the notistack library.

## Overview of the PhotoSky UI

Our PhotoSky application will have the following main components:

1. AppBar with the application logo, title, theme toggle, and options menu
2. Image Gallery to display uploaded images
3. Bottom Navigation for key actions
4. Dialogs for image upload, camera capture, and image viewing
5. Notification system for user feedback

Let's implement these components step by step.

## Setting Up Dependencies

First, ensure you have all the necessary dependencies installed. Your `package.json` should include:

```json
"dependencies": {
  "@emotion/react": "^11.13.3",
  "@emotion/styled": "^11.13.0",
  "@mui/icons-material": "^6.0.1",
  "@mui/material": "^6.0.1",
  "notistack": "^3.0.1",
  // ... other dependencies
}
```

If any of these are missing, install them using npm:

```bash
npm install @emotion/react @emotion/styled @mui/material @mui/icons-material notistack
```

## Implementing the Main App Component

Let's update our `App.js` file to create the basic structure of our application:

```jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useSnackbar, SnackbarProvider } from 'notistack';
import { Camera, CameraResultType } from '@capacitor/camera';

// Import necessary Material-UI components and icons
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import MoreVertIcon from '@mui/icons-material/MoreVert';

function Album() {
  // State variables will be defined here
  
  // Theme setup
  const theme = createTheme({
    palette: {
      mode: themeMode === 'system' ? (isDarkMode ? 'dark' : 'light') : themeMode,
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* AppBar component will go here */}
      <main>
        {/* Main content will go here */}
      </main>
      {/* Bottom Navigation will go here */}
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={4000} anchorOrigin={{ vertical: 'top', horizontal: 'left' }}>
      <Album />
    </SnackbarProvider>
  );
}
```

This sets up our basic app structure with Material-UI's `ThemeProvider` and `SnackbarProvider` for notifications.

## Implementing the AppBar

Now, let's create the AppBar with the logo, title, theme toggle, and options menu:

```jsx
<AppBar position="relative">
  <Toolbar>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <img src="/PhotoSky.png" alt="PhotoSky Logo" style={{ width: 40, height: 40, marginRight: '16px' }} />
    </Box>
    <Typography variant="h6" color="inherit" noWrap>
      PhotoSky
    </Typography>
    <Tooltip title="Toggle Theme Mode">
      <IconButton edge="end" color="inherit" onClick={handleToggleThemeMode} sx={{ marginLeft: 'auto', mr: 1 }}>
        {themeMode === 'dark' ? <DarkModeIcon /> : themeMode === 'light' ? <LightModeIcon /> : <SettingsBrightnessIcon />}
      </IconButton>
    </Tooltip>
    <IconButton color="inherit" onClick={handleMenuOpen}>
      <MoreVertIcon />
    </IconButton>
    <Menu
      anchorEl={menuAnchorEl}
      open={Boolean(menuAnchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => { handleDeleteAllImages(); handleMenuClose(); }}>
        Delete All Images
      </MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); setThemeMode('light'); setIsDarkMode(false); }}>
        Switch to Light Theme
      </MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); setThemeMode('dark'); setIsDarkMode(true); }}>
        Switch to Dark Theme
      </MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); setThemeMode('system'); }}>
        Switch to System Theme
      </MenuItem>
    </Menu>
  </Toolbar>
</AppBar>
```

## Creating the Image Gallery

Now, let's implement the Image Gallery component:

```jsx
<Container sx={{ py: 8 }} maxWidth="md">
  {loading && <LinearProgress />}
  {images.length > 0 ? (
    <ImageList sx={{ width: '100%', height: 'auto' }} cols={3} rowHeight={164}>
      {images.map((image) => (
        <ImageListItem key={image.id} onClick={() => handleOpenDialog(image)}>
          <img
            src={image.url}
            alt={`${image.id}`}
            loading="lazy"
            style={{ cursor: 'pointer', width: '100%', height: 'auto' }}
          />
        </ImageListItem>
      ))}
    </ImageList>
  ) : (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'lightgrey',
        height: '200px',
        borderRadius: '8px',
        color: 'grey',
      }}
    >
      No images found, upload images to see them here.
    </Box>
  )}
</Container>
```

## Implementing the Bottom Navigation

Add the Bottom Navigation component:

```jsx
<Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={5}>
  <BottomNavigation value={navValue} onChange={(event, newValue) => setNavValue(newValue)}>
    <BottomNavigationAction showLabel label="Refresh" icon={<RefreshIcon />} onClick={fetchImages} />
    <BottomNavigationAction showLabel label="Gallery" icon={<AppsIcon />} />
    <BottomNavigationAction showLabel label="Add Image" icon={<UploadIcon />} onClick={handleOpenCameraDialog} />
  </BottomNavigation>
</Paper>
```

## Adding Dialogs for Image Actions

Let's add dialogs for image viewing, deletion, and upload:

```jsx
{/* Image Viewer Dialog */}
<Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth>
  <DialogTitle>Image Viewer</DialogTitle>
  <DialogContent>
    {selectedImage && (
      <img src={selectedImage.url} alt="Selected" style={{ width: '100%' }} />
    )}
    <DialogContentText>Do you want to delete this image?</DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => handleDeleteImage(selectedImage.id)} color="error">
      <DeleteIcon /> Delete
    </Button>
    <Button onClick={handleCloseDialog}>Close</Button>
  </DialogActions>
</Dialog>

{/* Image Upload Dialog */}
<Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} fullWidth>
  <DialogTitle>Select Image or Take Picture</DialogTitle>
  <DialogActions>
    <Stack direction="column" spacing={2} width="100%">
      <Button onClick={handleAddImage} color="primary" width="100%">
        Select Image
      </Button>
      <Button onClick={takePicture} color="primary" width="100%">
        Take Picture
      </Button>
      <Button onClick={() => setImageDialogOpen(false)} color="error" width="100%">
        Cancel
      </Button>
    </Stack>
  </DialogActions>
</Dialog>
```

## Implementing the Notification System

We're using the `notistack` library for our notification system. It's already set up in our main `App` component with `SnackbarProvider`. To use it in our `Album` component, we use the `useSnackbar` hook:

```jsx
const { enqueueSnackbar } = useSnackbar();

// Example usage in a function:
const handleSomeAction = () => {
  try {
    // Perform some action
    enqueueSnackbar('Action performed successfully', { variant: 'success' });
  } catch (error) {
    enqueueSnackbar('Error performing action', { variant: 'error' });
  }
};
```

This allows us to show notifications for various actions throughout our application, providing feedback to the user.

## Handling Loading States

To handle loading states, we've added a `LinearProgress` component that appears when the `loading` state is true:

```jsx
{loading && <LinearProgress />}
```

Place this line at the top of your main content area to show a loading bar when operations are in progress.

## Conclusion

We've now designed and implemented the basic user interface for our PhotoSky application. We have:

1. Created a responsive layout using Material-UI components
2. Implemented an AppBar with logo, title, theme toggle, and options menu
3. Created an image gallery to display uploaded images
4. Added a bottom navigation bar for key actions
5. Implemented dialogs for image viewing, deletion, and upload
6. Set up a notification system for user feedback
7. Added loading indicators for better user experience

This UI provides a solid foundation for our application, offering a clean and intuitive interface for users to interact with their images. In the next section, we'll dive into state management to make our UI interactive and functional.