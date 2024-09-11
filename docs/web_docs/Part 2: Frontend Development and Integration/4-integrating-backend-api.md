---
sidebar_position: 4
slug: /activities/part-2-frontend-development-and-integration/4-integrating-backend-api
---

# Integrating the Backend API

In this section, we'll integrate our React frontend with the backend API we built in Part 1. We'll use Axios, a popular HTTP client, to make requests to our API endpoints.

## Setting Up Axios

We've already installed Axios in our project. Let's create a configured instance of Axios to use throughout our application. Create a new file called `api.js` in the `src` folder:

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

export default api;
```

This creates an Axios instance with the base URL set to our API endpoint.

## Implementing API Calls

Now, let's implement the API calls for our main operations: fetching images, uploading images, and deleting images.

### Fetching Images

Update the `fetchImages` function in `App.js`:

```javascript
import api from './api';

// ...

const fetchImages = useCallback(async () => {
  try {
    const response = await api.get('/list-images');
    setImages(response.data.images);
    enqueueSnackbar('Images loaded successfully', { variant: 'success' });
  } catch (error) {
    console.error('Error fetching images:', error);
    enqueueSnackbar('Error fetching images', { variant: 'error' });
  }
}, [enqueueSnackbar]);
```

### Uploading Images

Update the `handleUpload` function:

```javascript
const handleUpload = useCallback(async () => {
  if (!uploadingFile) return;

  try {
    // Get a presigned URL for the upload
    const presignedResponse = await api.post('/get-presigned-url', {
      filename: uploadingFile.name,
      filetype: uploadingFile.type
    });

    const { url, fields } = presignedResponse.data;

    // Prepare the form data for upload
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
    formData.append('file', uploadingFile);

    // Upload the file directly to S3
    await axios.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    enqueueSnackbar('Image uploaded successfully', { variant: 'success' });
    setUploadingFile(null);
    fetchImages(); // Refresh the image list
  } catch (error) {
    console.error('Error uploading image:', error);
    enqueueSnackbar('Error uploading image', { variant: 'error' });
  }
}, [uploadingFile, enqueueSnackbar, fetchImages]);
```

Note that we're using our `api` instance for getting the presigned URL, but we're using the standard `axios` for the actual upload to S3, as it goes to a different URL.

### Deleting Images

Update the `handleDeleteImage` function:

```javascript
const handleDeleteImage = useCallback(async (imageId) => {
  try {
    await api.delete(`/delete-image/${imageId}`);
    enqueueSnackbar('Image deleted successfully', { variant: 'success' });
    fetchImages(); // Refresh the image list
  } catch (error) {
    console.error('Error deleting image:', error);
    enqueueSnackbar('Error deleting image', { variant: 'error' });
  }
}, [enqueueSnackbar, fetchImages]);
```

## Handling API Errors

To improve error handling, let's create a utility function to extract error messages from API responses. Add this to your `api.js` file:

```javascript
export const getErrorMessage = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return error.response.data.message || 'An error occurred';
  } else if (error.request) {
    // The request was made but no response was received
    return 'No response received from server';
  } else {
    // Something happened in setting up the request that triggered an Error
    return error.message || 'An unexpected error occurred';
  }
};
```

Now, update your error handling in the API calls:

```javascript
import api, { getErrorMessage } from './api';

// In fetchImages:
catch (error) {
  console.error('Error fetching images:', error);
  enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
}

// Similarly for handleUpload and handleDeleteImage
```

## Adding Loading States

To improve user experience, let's add loading states for our API calls. First, add a new state variable:

```javascript
const [isLoading, setIsLoading] = useState(false);
```

Then, update our API calls to use this loading state:

```javascript
const fetchImages = useCallback(async () => {
  setIsLoading(true);
  try {
    const response = await api.get('/list-images');
    setImages(response.data.images);
    enqueueSnackbar('Images loaded successfully', { variant: 'success' });
  } catch (error) {
    console.error('Error fetching images:', error);
    enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
  } finally {
    setIsLoading(false);
  }
}, [enqueueSnackbar]);

// Similar updates for handleUpload and handleDeleteImage
```

## Displaying Loading State

To display the loading state, we can use Material-UI's `LinearProgress` component. Add it to your `App.js`:

```jsx
import LinearProgress from '@mui/material/LinearProgress';

// In your JSX:
<ThemeProvider theme={theme}>
  <CssBaseline />
  {isLoading && <LinearProgress />}
  {/* Rest of your components */}
</ThemeProvider>
```

## Conclusion

We've now successfully integrated our backend API with our React frontend. We've implemented:

1. A configured Axios instance for making API calls
2. Functions for fetching, uploading, and deleting images
3. Error handling for API calls
4. Loading states to improve user experience

These integrations allow our frontend to communicate effectively with our backend, creating a fully functional cloud-based image management system.

In the next section, we'll implement some advanced features to enhance our application's functionality and user experience.