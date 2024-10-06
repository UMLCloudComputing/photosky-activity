---
sidebar_position: 5
slug: /activities/part-1-aws-infrastructure-and-backend/5-creating-lambda-function
---

# Creating the Lambda Function

In this section, we'll implement the Lambda function that will handle our application logic for PhotoSky. This function will manage image uploads, retrievals, and deletions, interfacing with our S3 bucket and responding to API Gateway requests.

## Understanding the Role of Our Lambda Function

Our Lambda function will serve as the backend for PhotoSky, handling several key operations:

1. Generating presigned URLs for S3 uploads and downloads
2. Listing images in the S3 bucket
3. Creating preview images
4. Deleting images from the S3 bucket

## Setting Up the Lambda Function

Our Lambda function is defined in two main files: `main.py` and `S3.py`. These files are both located in `src/app/`. <br/>
Let's implement these files step by step.

### Implementing S3.py

First, let's modify our `S3.py` file, which will contain our S3 utility class:

1. Navigate to the `src/app` directory from the proejct's root directory using the terminal:

   ```bash
   cd src/app
   ```

2. Create (if it's not already there) and open `S3.py` in your text editor.
:::info
Within Github Codespaces and VS Code, the file can be created by graphically navigating to `src/app/` and then right clicking and choosing to create a new file.
:::

3. Add the following code to `S3.py`:

   ```python
   import boto3
   import logging
   from PIL import Image
   import io
   from botocore.exceptions import ClientError
   ```
   The code above specifies our imports. 
   - We'll use the Pillow library (`PIL`) to process Image data. 
   - The `boto3` library will be used to create a S3 client. `boto3` is the AWS Python SDK which can be used to create, configure, and manage AWS services. Read more @ the [docs](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html). 
   - The `io` library will be used in conjunction with Pillow to process images.
   - `logging` and `botocore.exceptions` are used for logging and `boto3` exception handling. <br/>

   ```python
   class S3:
       def __init__(self, bucket_name):
           self.client = boto3.client('s3')
           self.bucket_name = bucket_name
   ```
   We start by defining our S3 class. This class will encapsulate all S3 operations, acting as a wrapper for boto3 client operations for S3. <br/>
   ```python      
       def object_exists(self, object_name):
           try:
               self.client.head_object(Bucket=self.bucket_name, Key=object_name)
               return True
           except ClientError:
               return False
    ```
    The `object_exists` function checks whether the specified bucket exists by analyzing it's metadata (`self.client.head_object`). This is useful to shortcircuit and verify other operations.<br/>

    ```python {4-7, 9-19, 21-30} showLineNumbers
       def create_preview_image(self, object_name, result_width=100, result_height=100):
           try:
               original_image = self.client.get_object(Bucket=self.bucket_name, Key=object_name)
               image_data = original_image['Body'].read()
               image = Image.open(io.BytesIO(image_data))

               # Crop and resize logic
               width, height = image.size
               min_dimension = min(width, height)
               left = (width - min_dimension) / 2
               top = (height - min_dimension) / 2
               right = (width + min_dimension) / 2
               bottom = (height + min_dimension) / 2

               cropped = image.crop((left, top, right, bottom))
               preview_image = cropped.resize((result_width, result_height))

               # Save the preview image
               preview_image_bytes = io.BytesIO()
               preview_image.save(preview_image_bytes, format=image.format)
               preview_image_bytes.seek(0)

               preview_object_name = f"preview_{object_name}"
               self.client.put_object(Bucket=self.bucket_name, Key=preview_object_name, Body=preview_image_bytes)

               return preview_object_name

           except ClientError as e:
               logging.error(f"Error creating preview image: {e}")
               return None
    ```
    The `create_preview_image` function handles the process of creating a preview image for an image within an the S3 bucket. This is used by the front-end when it attempts to display previews of images stored in your library. <br/><br/>
    Notice the use of Pillow. It's critical to perform the image resizes and build a thumbnail preview. 
    The process can be described as follows:
    - Obtain the image and read it into an object using `Image`
    - Resize the image to a specified size (`result_width` & `result_height`). 
    - Place the preview image back into our S3 bucket with a specific key name to indicate that it's a preview for a particular object.
    - If the client fails to obtain an image, log the error and return `None`.
    <br/>

    ```python               
       def create_presigned_post(self, object_name, fields=None, conditions=None, expiration=3600):
           try:
               response = self.client.generate_presigned_post(
                   Bucket=self.bucket_name,
                   Key=object_name,
                   Fields=fields,
                   Conditions=conditions,
                   ExpiresIn=expiration
               )
               return response
           except ClientError as e:
               logging.error(f"Error creating presigned POST URL: {e}")
               return None

       def create_presigned_get(self, object_name, expiration=3600):
           try:
               response = self.client.generate_presigned_url(
                   'get_object',
                   Params={'Bucket': self.bucket_name, 'Key': object_name},
                   ExpiresIn=expiration
               )
               return response
           except ClientError as e:
               logging.error(f"Error creating presigned GET URL: {e}")
               return None
    ```
    `create_presigned_post` & `create_presigned_get` are intended to handle `POST` and `GET` requests with a presigned URL. This presigned URL allows for an image to be temporarily visible for individuals without access permissions for our AWS resources. As functions, these are quite simple, they only make the appropriate calls using the `boto3` library to obtain presigned URLs for the respective requests. They also implement exception handling & logging. They do not do any additional processing with the obtained response and simply pass it forwards using the return statement. <br/>


    ```python
       def list_images(self):
           try:
               response = self.client.list_objects_v2(Bucket=self.bucket_name)
               images = []
               if 'Contents' in response:
                   for obj in response['Contents']:
                       images.append({'id': obj['Key'], 'url': self.create_presigned_get(obj['Key'])})
               return images
           except ClientError as e:
               logging.error(f"Error listing images: {e}")
               return []
    ```
    The `list_images` function is used to get a list of the images within our S3 bucket. Again, this utilizes the `boto3` library obtain the results. The list of images are accumulated with each image being a dictionary of it's `id` and it's `url` (presigned url) using our recently created function `create_presigned_get`. As is true with all the functions above, exception handling and logging is implemented.

    ```python
       def delete_image(self, object_name):
           try:
               self.client.delete_object(Bucket=self.bucket_name, Key=object_name)
               return True
           except ClientError as e:
               logging.error(f"Error deleting image: {e}")
               return False
   ```
   The `delete_image` function processes image deletion by acting as a wrapper function over `boto3`'s `delete_object` function for the S3 client. Again, exception handling and logging is implemented.

This `S3` class provides methods for interacting with our S3 bucket, including creating preview images, generating presigned URLs, listing images, and deleting images. Note the enhanced exception handling and logging throughout the class.

### Implementing main.py

Now, let's implement `main.py` within `src/app/`, which will handle our API requests:

1. Create (if it doesn't already exist) and open `main.py` in your text editor.

2. Add the following code to `main.py`:

   ```python
   import json
   import os
   import logging
   from S3 import S3
   ```

   The imports above define the kinds of operations we'll be using.

   ```python  
   # Configure logging
   logging.basicConfig(level=logging.INFO)
   logger = logging.getLogger(__name__)
   ```

   As a best practice, we configure logging to keep track of how our stack is working.

   ```python
   def handler(event, context):
       s3 = S3(os.getenv("BUCKET_NAME"))
       method = event['httpMethod']
       path = event['path']
    ```
    Here we define our `handler` function to process incoming API requests. These requests will follow the REST format of HTTP requests.
    
    <br/>

    ```python
       # CORS headers
       headers = {
           'Access-Control-Allow-Origin': '*',
           'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
           'Access-Control-Allow-Headers': 'Content-Type',
           'Access-Control-Allow-Credentials': 'true'
       }
    ```
    We utilize these CORS headers to specify access control on our S3 Bucket. <br/>
    - `Access-Control-Allow-Origin` specifies whether the response can be shared with requesting code from the speciefied origin. 
    - `Access-Control-Allow-Methods` specifies which RESTful methods can be used on the S3 Bucket.
    - `Access-Control-Allow-Headers` specifies which HTTP headers can be used during the actual request. 
    - `Access-Control-Allow-Credentials` notifies the browser whether the server allows cross-origin HTTP requests to include credentials.
    - For more info check out [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers).
    <br/>

    ```python
       # Handle CORS preflight requests
       if method == 'OPTIONS':
           return {
               'statusCode': 200,
               'headers': headers,
               'body': json.dumps({'message': 'CORS preflight successful'})
           }
    ```
    The code above enables our lamdba function to handle the `OPTIONS` method. This request handles all CORS preflight requests.<br/>
    ```python
       try:
           # Handle GET /list-images
           if method == 'GET' and path == '/list-images':
               images = s3.list_images()
               return {
                   'statusCode': 200,
                   'headers': headers,
                   'body': json.dumps({'images': images})
               }
    ```
    The code above handles the `GET` method requests specifically to list images. <br/>
    ```python
           # Handle POST /get-presigned-url
           elif method == 'POST' and path == '/get-presigned-url':
               body = json.loads(event['body'])
               filename = body.get('filename')
               filetype = body.get('filetype')

               if not filename or not filetype:
                   return {
                       'statusCode': 400,
                       'headers': headers,
                       'body': json.dumps({'message': 'Filename and filetype required'})
                   }

               presigned_url = s3.create_presigned_post(filename, conditions=None)
               if presigned_url:
                   return {
                       'statusCode': 200,
                       'headers': headers,
                       'body': json.dumps(presigned_url)
                   }
               else:
                   raise Exception('Error generating presigned URL')
    ```
    The code above handles the `POST` method requests with the functionality to create presigned URLs. <br/>
    ```python
           # Handle DELETE /delete-image/{filename}
           elif method == 'DELETE' and path.startswith('/delete-image/'):
               filename = path.split('/')[-1]

               if not s3.object_exists(filename):
                   return {
                       'statusCode': 404,
                       'headers': headers,
                       'body': json.dumps({'message': 'File not found'})
                   }

               if s3.delete_image(filename):
                   return {
                       'statusCode': 200,
                       'headers': headers,
                       'body': json.dumps({'message': 'Image deleted successfully'})
                   }
               else:
                   raise Exception('Error deleting image')
    ```
    The code above handles the `DELETE` method requests. It's used to perform deletions of images on our S3 bucket. <br/>
    ```python
           # Handle GET /{filename} for downloading images and creating previews
           elif method == 'GET':
               query = event['queryStringParameters']
               filename = path.lstrip('/')

               if query and query.get('preview'):
                   if s3.object_exists(filename):
                       if not s3.object_exists("preview_" + filename):
                           logger.info("Creating preview image")
                           preview_filename = s3.create_preview_image(filename)
                           if not preview_filename:
                               raise Exception('Error creating preview image')
                       filename = "preview_" + filename
                   else:
                       return {
                           'statusCode': 404,
                           'headers': headers,
                           'body': json.dumps({'message': 'File not found'})
                       }

               presigned_url = s3.create_presigned_get(filename)
               if presigned_url:
                   return {
                       'statusCode': 200,
                       'headers': headers,
                       'body': json.dumps({'url': presigned_url})
                   }
               else:
                   raise Exception('Error generating presigned URL')
    ```
    The code above handles the `GET` method requests specifically to get image previews as well as create presigned URLs. <br/>
    ```python
           # Fallback for unsupported paths/methods
           else:
               return {
                   'statusCode': 404,
                   'headers': headers,
                   'body': json.dumps({'message': 'Not found'})
               }
    ```
    The code above handles the any other unrecognized method requests. <br/>
    ```python
       except Exception as e:
           logger.error(f"Error processing request: {str(e)}")
           return {
               'statusCode': 500,
               'headers': headers,
               'body': json.dumps({'message': 'Internal server error'})
           }
   ```
   The code above implements exception handling with error logging. <br/>

To recap: <br/>
This `handler` function processes incoming API requests, interacts with the S3 bucket using our `S3` class, and returns appropriate responses. Recall the added exception handling and logging throughout the function.<br/><br/>
All the shown just above is for part of the same `handler` function within `main.py`.

## Understanding the Lambda Function in more detail

Let's break down the main components of our Lambda function:

1. **Environment Variables**: We use `os.getenv("BUCKET_NAME")` to get the S3 bucket name from environment variables. This allows us to keep our configuration separate from our code and easily change it for different environments.

2. **CORS Handling**: We set up CORS headers to allow cross-origin requests, which is necessary for our frontend to communicate with the API.

3. **Exception Handling**: We've implemented a try-except block to catch and log any exceptions that occur during request processing. This helps with debugging and ensures we always return a valid response to the client.

4. **Logging**: We use Python's built-in `logging` module to log important events and errors. This is crucial for monitoring and debugging our Lambda function in production.

5. **API Endpoints**:
   - `GET /list-images`: Retrieves a list of all images in the S3 bucket.
   - `POST /get-presigned-url`: Generates a presigned URL for uploading an image to S3.
   - `DELETE /delete-image/{filename}`: Deletes a specific image from the S3 bucket.
   - `GET /{filename}`: Retrieves a presigned URL for downloading an image. If the `preview` query parameter is set, it creates and returns a preview image.

6. **S3 Interactions**: All S3 operations are encapsulated in the `S3` class, which provides methods for creating preview images, generating presigned URLs, listing images, and deleting images.

## Conclusion

We've now implemented a robust Lambda function that will serve as the backend for our PhotoSky application. This function handles all the necessary operations for managing images in our S3 bucket and provides the API that our frontend will interact with.

Key points to remember:
- Always use environment variables for configuration that might change between environments.
- Implement proper exception handling and logging to make debugging easier.
- Use CORS headers to allow your frontend to communicate with your API.
- Encapsulate complex operations (like S3 interactions) in separate classes for better organization and reusability.

In the next section, we'll deploy and test our backend to ensure everything is working correctly.