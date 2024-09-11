---
sidebar_position: 3
slug: /activities/part-2-frontend-development-and-integration/3-state-management-in-react
---

# State Management in React

In this section, we'll dive into state management for our PhotoSky application using React hooks. We'll cover how to manage local component state, share state between components, and handle side effects in our application.

## Understanding State in React

State in React represents the data that can change over time in your application. When state changes, React re-renders the components that depend on that state, updating the UI to reflect the new data.

## React Hooks for State Management

React Hooks are functions that let you "hook into" React state and lifecycle features from function components. We'll be using several hooks in our PhotoSky application:

1. `useState`: For managing local component state
2. `useEffect`: For performing side effects in function components
3. `useCallback`: For memoizing functions to optimize performance
4. `useContext`: For sharing state across components without prop drilling (though we won't use this in our current implementation)

Let's see how we're using these hooks in our PhotoSky application.

## Managing Images State

In our `App.js` component, we're using the `useState` hook to manage our images state:

```jsx
const [images, setImages] = useState([]);
```

This creates a state variable `images` and a function `setImages` to update it. We initialize it with an empty array.

## Fetching Images

We use the `useCallback` hook to memoize our `fetchImages` function, and the `useEffect` hook to call it when the component mounts:

```jsx
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
```

The `useCallback` hook ensures that the `fetchImages` function is only recreated if `enqueueSnackbar` changes, which helps to optimize performance.

The `useEffect` hook runs after every render, but because we pass `[fetchImages]` as the second argument, it only runs when `fetchImages` changes (which, due to `useCallback`, is only when `enqueueSnackbar` changes).

## Managing Theme State

We're also using `useState` to manage our theme state:

```jsx
const [themeMode, setThemeMode] = useState('light');
```

And we have a function to toggle the theme:

```jsx
const handleToggleTheme = () => {
  setThemeMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
};
```

This function uses the functional update form of `setThemeMode`, which is recommended when the new state depends on the previous state.

## Implementing Image Upload

Let's implement the image upload functionality. We'll add a new state for the file being uploaded:

```jsx
const [uploadingFile, setUploadingFile] = useState(null);
```

And here's how we can implement the upload function:

```jsx
const handleUpload = useCallback(async () => {
  if (!uploadingFile) return;

  try {
    // Get a presigned URL for the upload
    const presignedResponse = await axios.post(`${process.env.REACT_APP_API_URL}/get-presigned-url`, {
      filename: uploadingFile.name,
      filetype: uploadingFile.type
    });

    const { url, fields } = presignedResponse.data;

    // Prepare the form data for upload
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
    formData.append('file', uploadingFile);

    // Upload the file
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

This function uses the `uploadingFile` state to get the file to upload, sends a request to get a presigned URL, then uses that URL to upload the file to S3.

## Implementing Image Deletion

For image deletion, we'll add a new function:

```jsx
const handleDeleteImage = useCallback(async (imageId) => {
  try {
    await axios.delete(`${process.env.REACT_APP_API_URL}/delete-image/${imageId}`);
    enqueueSnackbar('Image deleted successfully', { variant: 'success' });
    fetchImages(); // Refresh the image list
  } catch (error) {
    console.error('Error deleting image:', error);
    enqueueSnackbar('Error deleting image', { variant: 'error' });
  }
}, [enqueueSnackbar, fetchImages]);
```

This function takes an `imageId`, sends a delete request to our API, and then refreshes the image list.

## Passing State and Functions to Child Components

We can now pass our state and functions to child components:

```jsx
return (
  <ThemeProvider theme={theme}>
    {/* ... other components ... */}
    <ImageGallery 
      images={images} 
      onDeleteImage={handleDeleteImage}
    />
    <BottomNav 
      onRefresh={fetchImages} 
      onUpload={() => document.getElementById('fileInput').click()} 
    />
    <input
      type="file"
      id="fileInput"
      style={{ display: 'none' }}
      onChange={(e) => {
        setUploadingFile(e.target.files[0]);
        handleUpload();
      }}
    />
  </ThemeProvider>
);
```

## Conclusion

We've implemented state management in our PhotoSky application using React hooks. We're using:

- `useState` for managing local state (images, theme, uploading file)
- `useEffect` for side effects (fetching images on component mount)
- `useCallback` for memoizing functions (fetch images, upload, delete)

This approach allows us to manage our application's state efficiently, ensuring that our UI stays in sync with our data and that we're not unnecessarily re-rendering components.

In the next section, we'll focus on integrating our frontend with the backend API, implementing the full functionality of our PhotoSky application.