---
sidebar_position: 4
slug: /activities/part-2-frontend-development-and-integration/4-implementing-image-upload-and-camera
---

# Handling Image Upload and Camera Integration

We use [useRef](https://react.dev/reference/react/useRef) to create a reference to the file input element, and [useCallback](https://react.dev/reference/react/useCallback) to memoize our upload functions:

```jsx
const fileInputRef = useRef(null);

const uploadImage = useCallback(async (file) => {
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
}, [API_URL, enqueueSnackbar, fetchImages]);

const takePicture = useCallback(async () => {
  setImageDialogOpen(false);
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri
    });

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
