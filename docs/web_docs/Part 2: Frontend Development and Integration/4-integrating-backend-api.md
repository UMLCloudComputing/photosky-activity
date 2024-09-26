---
sidebar_position: 4
slug: /activities/part-2-frontend-development-and-integration/4-integrating-backend-api
---

# Integrating the Backend API

In this section, we'll dive into how our React frontend integrates with the backend API we built in Part 1. We'll explore the API calls for fetching, uploading, and deleting images, as well as how we handle the camera integration for capturing new images.

## Setting Up Axios and Environment Variables

We're using Axios, a popular HTTP client, to make requests to our API endpoints. The base URL for our API is stored in an environment variable:

```javascript
const API_URL = process.env.REACT_APP_API_URL;
```

To set up your environment variables:

1. In the root of your project, create a `.env` file if it doesn't exist already.
2. Add the following line, replacing the URL with your actual API Gateway URL:

   ```
   REACT_APP_API_URL=https://{YOUR_API_ID}.execute-api.{YOUR_REGION}.amazonaws.com/prod
   ```

3. Restart your development server for the changes to take effect.

## Implementing API Calls

Let's go through the main API integrations in our application:

### Fetching Images

The `fetchImages` function retrieves the list of images from our backend:

```javascript
const fetchImages = useCallback(async () => {
  // set loading state to true
  setLoading(true);
  try {
    // query api and set state with response
    const response = await axios.get(`${API_URL}/list-images`);
    setImages(response.data.images);
    enqueueSnackbar('Images loaded successfully', { variant: 'success' });
  } catch (error) {
    // handle error
    console.error('Error fetching images:', error);
    enqueueSnackbar('Error fetching images', { variant: 'error' });
  } finally {
    // will be called regardless of error
    setLoading(false);
  }
}, [API_URL, enqueueSnackbar]);
```

This function is called when the component mounts and whenever we need to refresh the image list. Note the use of `setLoading` to manage the loading state, and `enqueueSnackbar` for user notifications.

### Uploading Images

The image upload process involves two steps: getting a presigned URL from our backend, then using that URL to upload the file directly to S3:

```javascript
const uploadImage = useCallback(async (file) => {
  setLoading(true);
  try {
    // Get a presigned URL for the upload
    const presignedResponse = await axios.post(`${API_URL}/get-presigned-url`, {
      filename: file.name,
      filetype: file.type
    });

    const { url, fields } = presignedResponse.data;
    const formData = new FormData();

    // append presigned url fields and uploaded file to formData
    // the formData object is what will be submitted
    Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
    formData.append('file', file);

    // Upload the file
    await axios.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

    fetchImages();
    enqueueSnackbar('Image uploaded successfully', { variant: 'success' });
  } catch (error) {
    // handle error
    console.error('Error uploading image:', error);
    enqueueSnackbar('Error uploading image', { variant: 'error' });
  } finally {
    // set loading state once we have finished
    setLoading(false);
  }
}, [API_URL, enqueueSnackbar, fetchImages]);
```

### Deleting Images

We have two delete functions: one for deleting a single image and one for deleting all images:

```javascript
const handleDeleteImage = useCallback(async (id) => {
  // set loading state
  setLoading(true);
  try {
    // query api
    await axios.delete(`${API_URL}/delete-image/${id}`);
    fetchImages();
    enqueueSnackbar('Image deleted successfully', { variant: 'success' });
    // close dialog once the image has been deleted
    setDialogOpen(false);
  } catch (error) {
    // handle error
    console.error('Error deleting image:', error);
    enqueueSnackbar('Error deleting image', { variant: 'error' });
  } finally {
    // set loading state once we have finished
    setLoading(false);
  }
}, [API_URL, enqueueSnackbar, fetchImages]);

const handleDeleteAllImages = useCallback(async () => {
  // set loading state
  setLoading(true);
  try {
    
    const deletePromises = images.map((image) => axios.delete(`${API_URL}/delete-image/${image.id}`));
    await Promise.all(deletePromises);
    fetchImages();
    enqueueSnackbar('All images deleted successfully', { variant: 'success' });
  } catch (error) {
    console.error('Error deleting all images:', error);
    enqueueSnackbar('Error deleting all images', { variant: 'error' });
  } finally {
    setLoading(false);
  }
}, [API_URL, images, enqueueSnackbar, fetchImages]);
```

## Camera Integration

We're using the Capacitor Camera plugin to capture images on mobile devices. Here's how we integrate it with our upload process:

```javascript
const takePicture = useCallback(async () => {
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
}, [uploadImage, enqueueSnackbar]);
```

This function uses the Capacitor Camera API to capture a photo, converts the result to a File object, and then uses our `uploadImage` function to send it to the server.

## Error Handling and Notifications

We're using the `enqueueSnackbar` function from the `notistack` library to display user-friendly error messages and notifications. Each API call is wrapped in a try-catch block to handle potential errors:

```javascript
try {
  // API call
  enqueueSnackbar('Success message', { variant: 'success' });
} catch (error) {
  console.error('Error description:', error);
  enqueueSnackbar('Error message', { variant: 'error' });
}
```

To set up notistack:

1. Wrap your main App component with SnackbarProvider:

```javascript
import { SnackbarProvider } from 'notistack';

export default function App() {
  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
      <Album />
    </SnackbarProvider>
  );
}
```

2. Use the `useSnackbar` hook in your components:

```javascript
import { useSnackbar } from 'notistack';

function Album() {
  const { enqueueSnackbar } = useSnackbar();
  // ... rest of the component
}
```

## Loading State

We use a `loading` state variable to track when API calls are in progress. This is used to display a loading indicator:

```javascript
const [loading, setLoading] = useState(false);

// In your JSX:
{loading && <LinearProgress />}
```

## Conclusion

We've successfully integrated our backend API with our React frontend. Our application now can:

1. Fetch and display images from the server
2. Upload images, both from file selection and camera capture
3. Delete individual images and all images
4. Handle errors and provide user feedback using notistack
5. Show loading states during API operations

This integration creates a seamless experience for users, allowing them to interact with their cloud-stored images effortlessly. In the next section, we'll look at how to package our application for Android using Capacitor.