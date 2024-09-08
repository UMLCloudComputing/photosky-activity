import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useSnackbar, SnackbarProvider } from 'notistack';  // Importing notistack

// MUI Components
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';  // Importing Box component

// MUI Icons
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import AppsIcon from '@mui/icons-material/Apps';
import RefreshIcon from '@mui/icons-material/Refresh';

function Album() {
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [navValue, setNavValue] = useState(0);
    const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', or 'system'
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [loading, setLoading] = useState(false);  // Loading state

    const { enqueueSnackbar } = useSnackbar();  // Hook from notistack

    const API_URL = process.env.REACT_APP_API_URL;  // Now it's coming from .env file

    // Ref for file input element
    const fileInputRef = useRef(null);

    // Memoize fetchImages to avoid re-creating it on every render
    const fetchImages = useCallback(async () => {
        setLoading(true);  // Start loading
        try {
            const response = await axios.get(`${API_URL}/list-images`);
            setImages(response.data.images);
            enqueueSnackbar('Images loaded successfully', { variant: 'success' });  // Success notification
        } catch (error) {
            console.error('Error fetching images:', error);
            enqueueSnackbar('Error fetching images', { variant: 'error' });  // Error notification
        } finally {
            setLoading(false);  // Stop loading
        }
    }, [API_URL, enqueueSnackbar]);  // Make sure API_URL and enqueueSnackbar are dependencies

    // Toggle between light, dark, and system modes
    const handleToggleThemeMode = () => {
        if (themeMode === 'system') {
            setThemeMode('light');
            setIsDarkMode(false);
        } else if (themeMode === 'light') {
            setThemeMode('dark');
            setIsDarkMode(true);
        } else {
            setThemeMode('system');
            checkDarkMode(); // Check system mode again
        }
    };

    // Check current dark mode setting for system mode
    const checkDarkMode = useCallback(async () => {
        const systemDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (themeMode === 'system') {
            setIsDarkMode(systemDarkMode);
        }
    }, [themeMode]);

    useEffect(() => {
        fetchImages();
        checkDarkMode();
    }, [themeMode, checkDarkMode, fetchImages]);  // Add fetchImages as a dependency

    // Function to open file picker and return the selected file
    const getFileFromUser = () => {
        return new Promise((resolve, reject) => {
            fileInputRef.current.click(); // Simulate a click on the hidden input field
            fileInputRef.current.onchange = (event) => {
                const file = event.target.files[0];  // Get the selected file
                if (file) {
                    resolve(file);
                } else {
                    reject(new Error('No file selected'));
                }
            };
        });
    };

    // Upload an image using the presigned URL from the API
    const handleAddImage = async () => {
        setLoading(true);  // Start loading
        try {
            const file = await getFileFromUser();  // Select an image file

            // Get the presigned URL for upload from the API
            const presignedResponse = await axios.post(`${API_URL}/get-presigned-url`, {
                filename: file.name,
                filetype: file.type
            });

            const { url, fields } = presignedResponse.data;

            // Upload the file using the presigned URL
            const formData = new FormData();
            Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
            formData.append('file', file);

            await axios.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

            fetchImages();  // Reload the image list
            enqueueSnackbar('Image uploaded successfully', { variant: 'success' });  // Success notification
        } catch (error) {
            console.error('Error uploading image:', error);
            enqueueSnackbar('Error uploading image', { variant: 'error' });  // Error notification
        } finally {
            setLoading(false);  // Stop loading
        }
    };

    // Delete an image from S3 via the API Gateway
    const handleDeleteImage = async (id) => {
        setLoading(true);  // Start loading
        try {
            await axios.delete(`${API_URL}/delete-image/${id}`);
            fetchImages();
            enqueueSnackbar('Image deleted successfully', { variant: 'success' });  // Success notification
            setDialogOpen(false);
        } catch (error) {
            console.error('Error deleting image:', error);
            enqueueSnackbar('Error deleting image', { variant: 'error' });  // Error notification
        } finally {
            setLoading(false);  // Stop loading
        }
    };

    // Open image in a dialog for full view
    const handleOpenDialog = (image) => {
        setSelectedImage(image);
        setDialogOpen(true);
    };

    // Close the dialog
    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    // Create MUI theme dynamically based on dark mode
    const theme = createTheme({
        palette: {
            mode: themeMode === 'system' ? (isDarkMode ? 'dark' : 'light') : themeMode,
        },
    });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {loading && <LinearProgress />} {/* Show LinearProgress when loading */}

            <AppBar position="relative">
                <Toolbar>
                    <PhotoCameraIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" color="inherit" noWrap>
                        PhotoSky Gallery App
                    </Typography>
                    <Tooltip title="Toggle Theme Mode">
                        <IconButton
                            edge="end"
                            color="inherit"
                            onClick={handleToggleThemeMode}
                            sx={{ marginLeft: 'auto' }}
                        >
                            {themeMode === 'dark' ? (
                                <DarkModeIcon />
                            ) : themeMode === 'light' ? (
                                <LightModeIcon />
                            ) : (
                                <SettingsBrightnessIcon />
                            )}
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            <main>
                <Container sx={{ py: 8 }} maxWidth="md">
                    {images.length > 0 ? (
                        <ImageList sx={{ width: '100%', height: 'auto' }} cols={3} rowHeight={164}>
                            {images.map((image) => (
                                <ImageListItem key={image.id} onClick={() => handleOpenDialog(image)}>
                                    <img
                                        src={image.url}  // Use the presigned URL from the API response
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

                {/* Dialog for full image view and delete */}
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
            </main>

            {/* Bottom Navigation Bar */}
            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
                <BottomNavigation
                    showLabels
                    value={navValue}
                    onChange={(event, newValue) => setNavValue(newValue)}
                >
                    <BottomNavigationAction label="Refresh" icon={<RefreshIcon />} onClick={fetchImages} />
                    <BottomNavigationAction label="Gallery" icon={<AppsIcon />} />
                    <BottomNavigationAction
                        label="Add Image"
                        icon={<UploadIcon />}
                        onClick={handleAddImage}
                    />
                </BottomNavigation>
            </Paper>

            {/* Hidden file input to trigger file selection */}
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
            />
        </ThemeProvider>
    );
}

// Wrapping Album component in SnackbarProvider for notistack
export default function App() {
    return (
        <SnackbarProvider
            maxSnack={3}
            autoHideDuration={4000}
            anchorOrigin={{
                vertical: 'top',    // Position on the top
                horizontal: 'left', // Position on the left
            }}
        >
            <Album />
        </SnackbarProvider>
    );
}
