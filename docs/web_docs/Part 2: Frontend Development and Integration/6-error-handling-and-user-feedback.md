---
sidebar_position: 6
slug: /activities/part-2-frontend-development-and-integration/6-error-handling-and-user-feedback
---

# Error Handling and User Feedback

In this final section of Part 2, we'll focus on implementing comprehensive error handling and providing clear feedback to users. These elements are crucial for creating a robust, user-friendly application.

## 1. Centralized Error Handling

First, let's create a centralized error handling utility. Create a new file `src/utils/errorHandler.js`:

```javascript
import { getErrorMessage } from '../api';

export const handleError = (error, enqueueSnackbar) => {
  const message = getErrorMessage(error);
  console.error(message, error);
  enqueueSnackbar(message, { variant: 'error' });
};
```

Now, we can use this in our `App.js` and other components:

```javascript
import { handleError } from './utils/errorHandler';

// In your fetchImages function:
try {
  // ... existing code
} catch (error) {
  handleError(error, enqueueSnackbar);
}

// Similarly for handleUpload and handleDeleteImage
```

## 2. Input Validation

Let's add input validation for our file uploads. Update the `handleUpload` function in `App.js`:

```javascript
const handleUpload = useCallback(async () => {
  if (!uploadingFile) {
    enqueueSnackbar('Please select a file to upload', { variant: 'warning' });
    return;
  }

  if (!['image/jpeg', 'image/png', 'image/gif'].includes(uploadingFile.type)) {
    enqueueSnackbar('Only JPEG, PNG, and GIF files are allowed', { variant: 'error' });
    return;
  }

  if (uploadingFile.size > 5 * 1024 * 1024) {
    enqueueSnackbar('File size should not exceed 5MB', { variant: 'error' });
    return;
  }

  // ... rest of the upload logic
}, [uploadingFile, enqueueSnackbar]);
```

## 3. Loading States and Progress Indicators

We've already added a loading indicator, but let's enhance it with more granular feedback. Add these state variables to `App.js`:

```javascript
const [isUploading, setIsUploading] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);
```

Update the `handleUpload` function to use these:

```javascript
const handleUpload = useCallback(async () => {
  // ... input validation

  setIsUploading(true);
  setUploadProgress(0);

  try {
    // ... get presigned URL

    // Upload the file
    await axios.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      }
    });

    enqueueSnackbar('Image uploaded successfully', { variant: 'success' });
    setUploadingFile(null);
    fetchImages();
  } catch (error) {
    handleError(error, enqueueSnackbar);
  } finally {
    setIsUploading(false);
    setUploadProgress(0);
  }
}, [uploadingFile, enqueueSnackbar, fetchImages]);
```

Now, add a progress bar to your JSX:

```jsx
import LinearProgress from '@mui/material/LinearProgress';

// In your JSX:
{isUploading && (
  <Box sx={{ width: '100%', my: 2 }}>
    <LinearProgress variant="determinate" value={uploadProgress} />
  </Box>
)}
```

## 4. Confirmation Dialogs

For destructive actions like deleting an image, let's add a confirmation dialog. Create a new component `ConfirmDialog.js`:

```jsx
import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

function ConfirmDialog({ open, title, content, onConfirm, onCancel }) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm} color="primary" autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;
```

Now, use this in your `ImageGallery` component:

```jsx
import ConfirmDialog from './ConfirmDialog';

function ImageGallery({ images, onDeleteImage }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);

  const handleDeleteClick = (image) => {
    setImageToDelete(image);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    onDeleteImage(imageToDelete.id);
    setConfirmOpen(false);
  };

  // ... other code

  return (
    <>
      {/* ... existing JSX */}
      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Delete"
        content="Are you sure you want to delete this image?"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
```

## 5. Offline Detection and Notification

Let's add a feature to detect when the user goes offline and notify them. Add this to your `App.js`:

```javascript
import { Snackbar, Alert } from '@mui/material';

function App() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ... rest of your component

  return (
    <ThemeProvider theme={theme}>
      {/* ... other JSX */}
      <Snackbar open={isOffline} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="warning">
          You are currently offline. Some features may be unavailable.
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
```

## 6. Error Boundaries

Finally, let's add an error boundary to catch any unhandled errors in our React components. Create a new component `ErrorBoundary.js`:

```jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please refresh the page.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

Wrap your main App component with this ErrorBoundary in `index.js`:

```jsx
import ErrorBoundary from './ErrorBoundary';

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root')
);
```

## Conclusion

We've now implemented comprehensive error handling and user feedback in our PhotoSky application:

1. Centralized error handling
2. Input validation for file uploads
3. Loading states and progress indicators
4. Confirmation dialogs for destructive actions
5. Offline detection and notification
6. Error boundaries for unhandled exceptions

These features significantly improve the robustness and user-friendliness of our application. They provide clear feedback to users about what's happening, handle edge cases gracefully, and make the application more resilient to errors.

With this, we conclude Part 2 of our tutorial. You now have a fully functional, user-friendly frontend for your PhotoSky application, integrated with the AWS backend we built in Part 1. In Part 3, we'll focus on mobile development and deploying our application to the cloud.