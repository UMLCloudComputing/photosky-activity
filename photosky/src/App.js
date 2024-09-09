import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useSnackbar, SnackbarProvider } from 'notistack';
import { Camera, CameraResultType } from '@capacitor/camera';

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
import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';

// MUI Icons
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import AppsIcon from '@mui/icons-material/Apps';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';

function Album() {
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [navValue, setNavValue] = useState(0);
    const [themeMode, setThemeMode] = useState('system');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null); // For MoreVertIcon menu

    const { enqueueSnackbar } = useSnackbar();

    const API_URL = process.env.REACT_APP_API_URL;

    const fileInputRef = useRef(null);

    const fetchImages = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/list-images`);
            setImages(response.data.images);
            enqueueSnackbar('Images loaded successfully', { variant: 'success' });
        } catch (error) {
            console.error('Error fetching images:', error);
            enqueueSnackbar('Error fetching images', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [API_URL, enqueueSnackbar]);

    const handleToggleThemeMode = () => {
        if (themeMode === 'system') {
            setThemeMode('light');
            setIsDarkMode(false);
        } else if (themeMode === 'light') {
            setThemeMode('dark');
            setIsDarkMode(true);
        } else {
            setThemeMode('system');
            checkDarkMode();
        }
    };

    const checkDarkMode = useCallback(() => {
        const systemDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (themeMode === 'system') {
            setIsDarkMode(systemDarkMode);
        }
    }, [themeMode]);

    useEffect(() => {
        fetchImages();
        checkDarkMode();
    }, [themeMode, checkDarkMode, fetchImages]);

    const getFileFromUser = () => {
        return new Promise((resolve, reject) => {
            fileInputRef.current.click();
            fileInputRef.current.onchange = (event) => {
                const file = event.target.files[0];
                if (file) {
                    resolve(file);
                } else {
                    reject(new Error('No file selected'));
                }
            };
        });
    };

    const uploadImage = async (file) => {
        setLoading(true);
        try {
            const presignedResponse = await axios.post(`${API_URL}/get-presigned-url`, {
                filename: file.name,
                filetype: file.type
            });

            const { url, fields } = presignedResponse.data;
            const formData = new FormData();
            Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
            formData.append('file', file);

            await axios.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

            fetchImages();
            enqueueSnackbar('Image uploaded successfully', { variant: 'success' });
        } catch (error) {
            console.error('Error uploading image:', error);
            enqueueSnackbar('Error uploading image', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddImage = async () => {
        try {
            setImageDialogOpen(false);  
            const file = await getFileFromUser();
            await uploadImage(file);  
        } catch (error) {
            console.error('Error selecting image:', error);
        }
    };

    const handleDeleteImage = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${API_URL}/delete-image/${id}`);
            fetchImages();
            enqueueSnackbar('Image deleted successfully', { variant: 'success' });
            setDialogOpen(false);
        } catch (error) {
            console.error('Error deleting image:', error);
            enqueueSnackbar('Error deleting image', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAllImages = async () => {
        setLoading(true);
        try {
            // Iterate over each image and delete them individually
            const deletePromises = images.map((image) => axios.delete(`${API_URL}/delete-image/${image.id}`));
            await Promise.all(deletePromises); // Wait for all delete requests to complete
            fetchImages(); // Refresh the image list after deletion
            enqueueSnackbar('All images deleted successfully', { variant: 'success' });
        } catch (error) {
            console.error('Error deleting all images:', error);
            enqueueSnackbar('Error deleting all images', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };    

    const handleOpenDialog = (image) => {
        setSelectedImage(image);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
    };

    const handleOpenCameraDialog = () => {
        setImageDialogOpen(true);
    };

    // Capacitor Camera Integration
    const takePicture = async () => {
        setImageDialogOpen(false);
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

    const theme = createTheme({
        palette: {
            mode: themeMode === 'system' ? (isDarkMode ? 'dark' : 'light') : themeMode,
        },
    });

    const handleMenuOpen = (event) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {loading && <LinearProgress />}

            <AppBar position="relative">
                <Toolbar>
                    
                    {/* App Logo Image */}
                    <Box sx={{ display: 'flex', alignItems: 'center', }}>
                        <img src="/PhotoSky.png" alt="PhotoSky Logo" style={{ width: 40, height: 40, marginRight: '16px' }} />
                    </Box>

                    {/* App Text */}
                    <Typography variant="h6" color="inherit" noWrap>
                        PhotoSky
                    </Typography>
                    
                    <Tooltip title="Toggle Theme Mode">
                        <IconButton edge="end" color="inherit" onClick={handleToggleThemeMode} sx={{ marginLeft: 'auto', mr: 1 }}>
                            {themeMode === 'dark' ? (
                                <DarkModeIcon />
                            ) : themeMode === 'light' ? (
                                <LightModeIcon />
                            ) : (
                                <SettingsBrightnessIcon />
                            )}
                        </IconButton>
                    </Tooltip>

                    {/* MoreVertIcon button for the options menu */}
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

            <main>
                <Container sx={{ py: 8 }} maxWidth="md">
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

            {/* Dialog to choose image or camera */}
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

            <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={5}>
                <BottomNavigation value={navValue} onChange={(event, newValue) => setNavValue(newValue)}>
                    <BottomNavigationAction showLabel label="Refresh" icon={<RefreshIcon />} onClick={fetchImages} />
                    <BottomNavigationAction showLabel label="Gallery" icon={<AppsIcon />} />
                    <BottomNavigationAction showLabel label="Add Image" icon={<UploadIcon />} onClick={handleOpenCameraDialog} />
                </BottomNavigation>
            </Paper>

            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" />
        </ThemeProvider>
    );
}

export default function App() {
    return (
        <SnackbarProvider
            maxSnack={3}
            autoHideDuration={4000}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
        >
            <Album />
        </SnackbarProvider>
    );
}
