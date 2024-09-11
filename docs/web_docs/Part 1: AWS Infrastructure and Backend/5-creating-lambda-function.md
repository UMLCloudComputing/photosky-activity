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

Our Lambda function is defined in two main files: `main.py` and `S3.py`. Let's implement these files step by step.

### Implementing S3.py

First, let's create the `S3.py` file, which will contain our S3 utility class:

1. Navigate to the `src/app` directory:

   ```bash
   cd src/app
   ```

2. Create and open `S3.py` in your text editor.

3. Add the following code to `S3.py`:

   ```python
   import boto3
   import logging
   from PIL import Image
   import io
   from botocore.exceptions import ClientError

   class S3:
       def __init__(self, bucket_name):
           self.client = boto3.client('s3')
           self.bucket_name = bucket_name
       
       def object_exists(self, object_name):
           try:
               self.client.head_object(Bucket=self.bucket_name, Key=object_name)
               return True
           except ClientError:
               return False

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
               logging.error(e)
               return None

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
               logging.error(e)
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
               logging.error(e)
               return None

       def list_images(self):
           try:
               response = self.client.list_objects_v2(Bucket=self.bucket_name)
               images = []
               if 'Contents' in response:
                   for obj in response['Contents']:
                       images.append({'id': obj['Key'], 'url': self.create_presigned_get(obj['Key'])})
               return images
           except ClientError as e:
               logging.error(e)
               return []

       def delete_image(self, object_name):
           try:
               self.client.delete_object(Bucket=self.bucket_name, Key=object_name)
           except ClientError as e:
               logging.error(e)
               return None
   ```

This `S3` class provides methods for interacting with our S3 bucket, including creating preview images, generating presigned URLs, listing images, and deleting images.

### Implementing main.py

Now, let's implement `main.py`, which will handle our API requests:

1. Create and open `main.py` in your text editor.

2. Add the following code to `main.py`:

   ```python
   import json
   import os
   from S3 import S3

   def handler(event, context):
       s3 = S3(os.getenv("BUCKET_NAME"))
       method = event['httpMethod']
       path = event['path']

       # CORS headers
       headers = {
           'Access-Control-Allow-Origin': '*',
           'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
           'Access-Control-Allow-Headers': 'Content-Type',
           'Access-Control-Allow-Credentials': 'true'
       }

       # Handle CORS preflight requests
       if method == 'OPTIONS':
           return {
               'statusCode': 200,
               'headers': headers,
               'body': json.dumps({'message': 'CORS preflight successful'})
           }

       # Handle GET /list-images
       if method == 'GET' and path == '/list-images':
           images = s3.list_images()
           return {
               'statusCode': 200,
               'headers': headers,
               'body': json.dumps({'images': images})
           }

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
               return {
                   'statusCode': 500,
                   'headers': headers,
                   'body': json.dumps({'message': 'Error generating presigned URL'})
               }

       # Handle DELETE /delete-image/{filename}
       elif method == 'DELETE' and path.startswith('/delete-image/'):
           filename = path.split('/')[-1]

           if not s3.object_exists(filename):
               return {
                   'statusCode': 404,
                   'headers': headers,
                   'body': json.dumps({'message': 'File not found'})
               }

           s3.delete_image(filename)
           return {
               'statusCode': 200,
               'headers': headers,
               'body': json.dumps({'message': 'Image deleted successfully'})
           }

       # Handle GET /{filename} for downloading images and creating previews
       elif method == 'GET':
           query = event['queryStringParameters']
           filename = path.lstrip('/')

           if query and query.get('preview'):
               if s3.object_exists(filename):
                   if not s3.object_exists("preview_" + filename):
                       print("Cache Miss")
                       s3.create_preview_image(filename)
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
               return {
                   'statusCode': 400,
                   'headers': headers,
                   'body': json.dumps({'message': 'Error generating presigned URL'})
               }

       # Fallback for unsupported paths/methods
       return {
           'statusCode': 404,
           'headers': headers,
           'body': json.dumps({'message': 'Not found'})
       }
   ```

This `handler` function processes incoming API requests, interacts with the S3 bucket using our `S3` class, and returns appropriate responses.

## Understanding the Lambda Function

Let's break down the main components of our Lambda function:

1. **CORS Handling**: We set up CORS headers to allow cross-origin requests, which is necessary for our frontend to communicate with the API.

2. **List Images**: The `/list-images` endpoint retrieves a list of all images in the S3 bucket.

3. **Get Presigned URL**: The `/get-presigned-url` endpoint generates a presigned URL for uploading an image to S3.

4. **Delete Image**: The `/delete-image/{filename}` endpoint deletes a specific image from the S3 bucket.

5. **Get Image/Preview**: The `GET /{filename}` endpoint retrieves a presigned URL for downloading an image. If the `preview` query parameter is set, it creates and returns a preview image.

## Conclusion

We've now implemented the Lambda function that will serve as the backend for our PhotoSky application. This function handles all the necessary operations for managing images in our S3 bucket and provides the API that our frontend will interact with.

In the next section, we'll deploy and test our backend to ensure everything is working correctly.