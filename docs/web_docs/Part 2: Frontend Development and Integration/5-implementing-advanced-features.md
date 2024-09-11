---
sidebar_position: 5
slug: /activities/part-2-frontend-development-and-integration/5-implementing-advanced-features
---

# Implementing Advanced Features

In this section, we'll enhance our PhotoSky application by implementing several advanced features. These improvements will make our app more user-friendly, functional, and polished.

## 1. Image Preview and Full-Screen View

Let's add the ability to preview images and view them in full screen.

First, create a new component called `ImagePreview.js`:

```jsx
import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

function ImagePreview({ open, handleClose, imageUrl }) {
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogContent>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <img src={imageUrl} alt="Preview" style={{ width: '100%', height: 'auto' }} />
      </DialogContent>
    </Dialog>
  );
}

export default ImagePreview;
```

Now, update the `ImageGallery` component to use this preview:

```jsx
import React, { useState } from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImagePreview from './ImagePreview';

function ImageGallery({ images }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const handlePreviewOpen = (imageUrl) => {
    setPreviewImage(imageUrl);
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
  };

  return (
    <>
      <ImageList sx={{ width: '100%', height: 'auto' }} cols={3} rowHeight={164}>
        {images.map((image) => (
          <ImageListItem key={image.id} onClick={() => handlePreviewOpen(image.url)}>
            <img
              src={image.url}
              alt={`${image.id}`}
              loading="lazy"
              style={{ cursor: 'pointer', width: '100%', height: 'auto' }}
            />
          </ImageListItem>
        ))}
      </ImageList>
      <ImagePreview open={previewOpen} handleClose={handlePreviewClose} imageUrl={previewImage} />
    </>
  );
}

export default ImageGallery;
```

## 2. Drag and Drop Upload

Let's implement drag and drop functionality for uploading images. We'll use the `react-dropzone` library for this.

First, install the library:

```bash
npm install react-dropzone
```

Now, create a new component called `DropzoneArea.js`:

```jsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function DropzoneArea({ onFilesAdded }) {
  const onDrop = useCallback((acceptedFiles) => {
    onFilesAdded(acceptedFiles);
  }, [onFilesAdded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Box
      {...getRootProps()}
      sx={{
        border: '2px dashed grey',
        borderRadius: 2,
        p: 2,
        textAlign: 'center',
        cursor: 'pointer',
        bgcolor: isDragActive ? 'action.hover' : 'background.paper',
      }}
    >
      <input {...getInputProps()} />
      <Typography>
        {isDragActive
          ? "Drop the files here ..."
          : "Drag 'n' drop some files here, or click to select files"}
      </Typography>
    </Box>
  );
}

export default DropzoneArea;
```

Update the `App.js` to use this new component:

```jsx
import DropzoneArea from './DropzoneArea';

// ... other imports and code

const handleFilesAdded = useCallback((files) => {
  setUploadingFile(files[0]);
  handleUpload();
}, [handleUpload]);

// In your JSX:
<DropzoneArea onFilesAdded={handleFilesAdded} />
```

## 3. Image Lazy Loading and Infinite Scroll

To improve performance with large numbers of images, let's implement lazy loading and infinite scroll. We'll use the `react-window` library for this.

First, install the library:

```bash
npm install react-window
```

Now, update the `ImageGallery` component:

```jsx
import React, { useState } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import ImagePreview from './ImagePreview';

function ImageGallery({ images }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const handlePreviewOpen = (imageUrl) => {
    setPreviewImage(imageUrl);
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
  };

  const Cell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * 3 + columnIndex;
    if (index >= images.length) return null;
    const image = images[index];

    return (
      <div style={style}>
        <img
          src={image.url}
          alt={`${image.id}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
          onClick={() => handlePreviewOpen(image.url)}
        />
      </div>
    );
  };

  return (
    <>
      <Grid
        columnCount={3}
        columnWidth={150}
        height={600}
        rowCount={Math.ceil(images.length / 3)}
        rowHeight={150}
        width={450}
      >
        {Cell}
      </Grid>
      <ImagePreview open={previewOpen} handleClose={handlePreviewClose} imageUrl={previewImage} />
    </>
  );
}

export default ImageGallery;
```

## 4. Offline Support with Service Workers

To add offline support, we can use service workers. Create React App already sets up a service worker for us, we just need to opt-in to using it.

Update `src/index.js`:

```jsx
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
```

## 5. Progressive Image Loading

To improve perceived performance, let's implement progressive image loading. We'll show a low-resolution placeholder while the full image loads.

Create a new component called `ProgressiveImage.js`:

```jsx
import React, { useState, useEffect } from 'react';

function ProgressiveImage({ src, placeholderSrc, alt }) {
  const [imgSrc, setImgSrc] = useState(placeholderSrc || src);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImgSrc(src);
    };
  }, [src]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'filter 0.3s ease-out',
        filter: imgSrc === placeholderSrc ? 'blur(10px)' : 'none',
      }}
    />
  );
}

export default ProgressiveImage;
```

Update the `ImageGallery` component to use `ProgressiveImage`:

```jsx
import ProgressiveImage from './ProgressiveImage';

// ... other code

const Cell = ({ columnIndex, rowIndex, style }) => {
  const index = rowIndex * 3 + columnIndex;
  if (index >= images.length) return null;
  const image = images[index];

  return (
    <div style={style}>
      <ProgressiveImage
        src={image.url}
        placeholderSrc={`${image.url}?preview=true`}
        alt={`${image.id}`}
        style={{ cursor: 'pointer' }}
        onClick={() => handlePreviewOpen(image.url)}
      />
    </div>
  );
};
```

## Conclusion

We've implemented several advanced features to enhance our PhotoSky application:

1. Image preview and full-screen view
2. Drag and drop upload
3. Image lazy loading and infinite scroll
4. Offline support with service workers
5. Progressive image loading

These features significantly improve the user experience and performance of our application. They demonstrate how to take a basic application and elevate it to a more professional level.

In the next section, we'll focus on error handling and providing user feedback to further polish our application.