---
sidebar_position: 2
slug: /activities/part-2-frontend-development-and-integration/2-designing-user-interface
---

# Designing the User Interface

In this section, we'll design and implement the user interface for our PhotoSky application. We'll create a responsive layout using Material-UI components and implement the main features of our app: displaying images, uploading new images, and managing the image gallery.

## Overview of the PhotoSky UI

Our PhotoSky application will have the following main components:

1. AppBar with the application title and theme toggle
2. Image Gallery to display uploaded images
3. Upload button to add new images
4. Bottom Navigation for additional actions

Let's implement these components step by step.

## Implementing the Main App Component

First, let's update our `App.js` file to create the basic structure of our application:

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

function App() {
  const [images, setImages] = useState([]);
  const [themeMode, setThemeMode] = useState('light');
  const { enqueueSnackbar } = useSnackbar();

  const theme = createTheme({
    palette: {
      mode: themeMode,
    },
  });

  const fetchImages = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/list-images`);
      setImages(response.data.images);
      enqueueSnackbar('Images loaded successfully', { variant: 'success' });
    } catch (error) {
      console.error('Error fetching images:', error);
      enqueueSnackbar('Error fetching images', { variant: 'error' });
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleToggleTheme = () => {
    setThemeMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="relative">
        <Toolbar>
          <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
            PhotoSky
          </Typography>
          <IconButton color="inherit" onClick={handleToggleTheme}>
            {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <main>
        <Container sx={{ py: 8 }} maxWidth="md">
          {/* We'll add our ImageGallery component here */}
        </Container>
      </main>
      {/* We'll add our BottomNavigation component here */}
    </ThemeProvider>
  );
}

export default App;
```

This sets up our basic app structure with an AppBar, theme toggling, and a container for our main content.

## Creating the ImageGallery Component

Now, let's create a new file called `ImageGallery.js` in the `src` folder:

```jsx
import React from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import Box from '@mui/material/Box';

function ImageGallery({ images }) {
  return (
    images.length > 0 ? (
      <ImageList sx={{ width: '100%', height: 'auto' }} cols={3} rowHeight={164}>
        {images.map((image) => (
          <ImageListItem key={image.id}>
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
          height: '200px',
          backgroundColor: 'lightgrey',
          borderRadius: '8px',
          color: 'grey',
        }}
      >
        No images found, upload images to see them here.
      </Box>
    )
  );
}

export default ImageGallery;
```

Now, let's add this component to our `App.js`:

```jsx
import ImageGallery from './ImageGallery';

// ... (previous code)

<Container sx={{ py: 8 }} maxWidth="md">
  <ImageGallery images={images} />
</Container>
```

## Implementing the Bottom Navigation

Let's create a new file called `BottomNav.js` in the `src` folder:

```jsx
import React from 'react';
import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import RefreshIcon from '@mui/icons-material/Refresh';
import UploadIcon from '@mui/icons-material/Upload';

function BottomNav({ onRefresh, onUpload }) {
  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
      <BottomNavigation showLabels>
        <BottomNavigationAction label="Refresh" icon={<RefreshIcon />} onClick={onRefresh} />
        <BottomNavigationAction label="Upload" icon={<UploadIcon />} onClick={onUpload} />
      </BottomNavigation>
    </Paper>
  );
}

export default BottomNav;
```

Now, let's add this component to our `App.js` and implement the refresh and upload functions:

```jsx
import BottomNav from './BottomNav';

// ... (previous code)

const handleUpload = async () => {
  // We'll implement this in the next section
  console.log('Upload button clicked');
};

return (
  <ThemeProvider theme={theme}>
    {/* ... (previous code) */}
    <BottomNav onRefresh={fetchImages} onUpload={handleUpload} />
  </ThemeProvider>
);
```

## Styling and Responsiveness

Material-UI components are responsive by default, but we can further improve our layout:

1. Use the `useMediaQuery` hook to adjust the layout for different screen sizes.
2. Use Material-UI's `sx` prop for custom styling.

Here's an example of how we can make our `ImageGallery` more responsive:

```jsx
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

function ImageGallery({ images }) {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <ImageList sx={{ width: '100%', height: 'auto' }} cols={isSmallScreen ? 2 : 3} rowHeight={164}>
      {/* ... */}
    </ImageList>
  );
}
```

This will display 2 columns on small screens and 3 columns on larger screens.

## Conclusion

We've now designed and implemented the basic user interface for our PhotoSky application. We have:

1. Created a responsive layout using Material-UI components
2. Implemented theme switching functionality
3. Created an image gallery to display uploaded images
4. Added a bottom navigation bar for key actions

In the next section, we'll implement state management and add functionality to our UI components, including image upload and deletion.