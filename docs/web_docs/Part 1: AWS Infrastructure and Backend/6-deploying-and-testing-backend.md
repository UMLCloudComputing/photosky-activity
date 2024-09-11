---
sidebar_position: 6
slug: /activities/part-1-aws-infrastructure-and-backend/6-deploying-and-testing-backend
---

# Deploying and Testing the Backend

In this final section of Part 1, we'll deploy our PhotoSky backend to AWS and thoroughly test it to ensure everything is working correctly. We'll use the AWS CDK to deploy our stack and then use various tools to test our API endpoints.

## Deploying the Backend

### Prerequisites
- Ensure you have the AWS CLI configured with the correct credentials
- Make sure you have the latest version of the AWS CDK installed
- Verify that you're in the root directory of your project

### Deployment Steps

1. Synthesize the CloudFormation template:
   ```bash
   cdk synth
   ```
   This command will generate a CloudFormation template based on our CDK code. Review the output to ensure it looks correct.

2. Deploy the stack:
   ```bash
   cdk deploy
   ```
   This command will deploy our stack to AWS. You'll be prompted to confirm the changes before they're applied.

3. During the deployment, you'll see output detailing the resources being created. Pay attention to any warnings or errors.

4. Once the deployment is complete, you'll see output containing the API Gateway URL. It will look something like this:
   ```
   Outputs:
   PhotoskyStack.apiEndpoint12345678 = https://abcdefghij.execute-api.us-east-1.amazonaws.com/prod/
   ```
   Copy this URL; you'll need it for testing and for your frontend.

5. Update your `.env` file with this URL:
   ```bash
   echo "REACT_APP_API_URL=https://abcdefghij.execute-api.us-east-1.amazonaws.com/prod" >> .env
   ```
   Replace the URL with your actual API Gateway URL.

## Testing the Backend

Now that our backend is deployed, let's thoroughly test each of our API endpoints. We'll use curl for these examples, but you could also use tools like Postman or a custom Python script for more advanced testing.

### 1. List Images

Test the endpoint to list all images:

```bash
curl https://abcdefghij.execute-api.us-east-1.amazonaws.com/prod/list-images
```

Expected response:
```json
{
  "images": [
    {
      "id": "image1.jpg",
      "url": "https://your-bucket-name.s3.amazonaws.com/image1.jpg?AWSAccessKeyId=..."
    },
    ...
  ]
}
```

### 2. Get Presigned URL for Upload

Test the endpoint to get a presigned URL for uploading an image:

```bash
curl -X POST \
  https://abcdefghij.execute-api.us-east-1.amazonaws.com/prod/get-presigned-url \
  -H 'Content-Type: application/json' \
  -d '{"filename":"test-image.jpg", "filetype":"image/jpeg"}'
```

Expected response:
```json
{
  "url": "https://your-bucket-name.s3.amazonaws.com/",
  "fields": {
    "key": "test-image.jpg",
    "bucket": "your-bucket-name",
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    ...
  }
}
```

### 3. Upload an Image

To actually upload an image using the presigned URL:

```bash
curl -X POST https://your-bucket-name.s3.amazonaws.com/ \
  -F key=test-image.jpg \
  -F bucket=your-bucket-name \
  -F X-Amz-Algorithm=AWS4-HMAC-SHA256 \
  ... \
  -F file=@/path/to/your/image.jpg
```

Replace the fields with those from the previous response.

### 4. Get Image URL

Test getting a URL for a specific image:

```bash
curl https://abcdefghij.execute-api.us-east-1.amazonaws.com/prod/test-image.jpg
```

Expected response:
```json
{"url": "https://your-bucket-name.s3.amazonaws.com/test-image.jpg?AWSAccessKeyId=..."}
```

### 5. Get Image Preview URL

Test getting a preview URL for an image:

```bash
curl "https://abcdefghij.execute-api.us-east-1.amazonaws.com/prod/test-image.jpg?preview=true"
```

Expected response:
```json
{"url": "https://your-bucket-name.s3.amazonaws.com/preview_test-image.jpg?AWSAccessKeyId=..."}
```

### 6. Delete Image

Test deleting an image:

```bash
curl -X DELETE https://abcdefghij.execute-api.us-east-1.amazonaws.com/prod/delete-image/test-image.jpg
```

Expected response:
```json
{"message": "Image deleted successfully"}
```

## Automated Testing Script

For more comprehensive testing, you can create a Python script that automates these tests. Here's an example:

```python
import requests
import json
import os

API_URL = "https://abcdefghij.execute-api.us-east-1.amazonaws.com/prod"

def test_list_images():
    response = requests.get(f"{API_URL}/list-images")
    assert response.status_code == 200
    data = response.json()
    assert "images" in data
    print("List images test passed")

def test_upload_image():
    # Get presigned URL
    response = requests.post(f"{API_URL}/get-presigned-url", json={"filename": "test-image.jpg", "filetype": "image/jpeg"})
    assert response.status_code == 200
    presigned_data = response.json()
    
    # Upload image
    with open("test-image.jpg", "rb") as f:
        files = {"file": f}
        response = requests.post(presigned_data["url"], data=presigned_data["fields"], files=files)
    assert response.status_code == 204
    print("Upload image test passed")

def test_get_image_url():
    response = requests.get(f"{API_URL}/test-image.jpg")
    assert response.status_code == 200
    data = response.json()
    assert "url" in data
    print("Get image URL test passed")

def test_get_preview_url():
    response = requests.get(f"{API_URL}/test-image.jpg?preview=true")
    assert response.status_code == 200
    data = response.json()
    assert "url" in data
    print("Get preview URL test passed")

def test_delete_image():
    response = requests.delete(f"{API_URL}/delete-image/test-image.jpg")
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Image deleted successfully"
    print("Delete image test passed")

if __name__ == "__main__":
    test_list_images()
    test_upload_image()
    test_get_image_url()
    test_get_preview_url()
    test_delete_image()
    print("All tests passed successfully!")
```

To run this script:
1. Save it as `test_backend.py`
2. Install the requests library if you haven't already: `pip install requests`
3. Run the script: `python test_backend.py`

## Troubleshooting

If you encounter any issues during testing:

1. Check the CloudWatch Logs for your Lambda function. You can find these in the AWS Console under CloudWatch > Log groups.

2. Ensure your IAM permissions are set up correctly. The Lambda function should have permissions to access the S3 bucket.

3. Verify that your S3 bucket name in the Lambda function environment variables matches the actual bucket name.

4. If you make any changes to your Lambda function code, remember to redeploy your stack with `cdk deploy`.

5. Check your API Gateway settings in the AWS Console to ensure CORS is properly configured.

6. If you're having issues with the presigned URLs, make sure your system time is synchronized correctly.

## Monitoring and Maintenance

To ensure the ongoing health of your backend:

1. Set up CloudWatch Alarms for important metrics like Lambda function errors and API Gateway 4xx/5xx errors.

2. Regularly review your CloudWatch Logs for any recurring issues or patterns.

3. Keep your dependencies up-to-date, including the AWS SDK and any other libraries used in your Lambda function.

4. Periodically review and update your IAM policies to adhere to the principle of least privilege.

## Conclusion

Congratulations! You've successfully deployed and thoroughly tested your PhotoSky backend. Your AWS infrastructure is now set up with:

- An S3 bucket for storing images
- A Lambda function for handling image operations
- An API Gateway for exposing your Lambda function as a RESTful API

By following this comprehensive testing procedure, you can be confident that your backend is functioning correctly and ready for integration with your frontend application.

Remember to keep your API Gateway URL handy, as you'll need it when configuring your frontend application in the next part of this tutorial. In Part 2, we'll build the frontend of our application to interact with this robust backend we've just created and tested.