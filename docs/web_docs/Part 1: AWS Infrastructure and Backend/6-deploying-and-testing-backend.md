---
sidebar_position: 6
slug: /activities/part-1-aws-infrastructure-and-backend/6-deploying-and-testing-backend
---

# Deploying and Testing the Backend

In this final section of Part 1, we'll deploy our PhotoSky backend to AWS and test it to ensure everything is working correctly. We'll use the AWS CDK to deploy our stack and then use tools like curl or Postman to test our API endpoints.

## Deploying the Backend

First, let's deploy our backend using AWS CDK:

1. Ensure you're in the root directory of your project:

   ```bash
   cd /workspaces/photosky
   ```

2. Deploy the stack:

   ```bash
   cdk deploy
   ```

   This command will synthesize a CloudFormation template from our CDK code and deploy it to AWS. You'll see output detailing the resources being created.

3. When prompted to confirm the changes, type 'y' and press Enter.

4. Wait for the deployment to complete. This may take a few minutes.

5. Once the deployment is finished, you'll see output containing the API Gateway URL. It will look something like this:

   ```
   Outputs:
   PhotoskyStack.apiEndpoint12345678 = https://abcdefghij.execute-api.us-east-1.amazonaws.com/prod/
   ```

   Copy this URL; you'll need it for testing and for your frontend.

6. Update your `.env` file with this URL:

   ```bash
   echo "REACT_APP_API_URL=https://abcdefghij.execute-api.us-east-1.amazonaws.com/prod" >> .env
   ```

   Replace the URL with your actual API Gateway URL.


## Testing the Backend

Now that our backend is deployed, let's test each of our API endpoints. We'll use curl for these examples, but you could also use a tool like Postman if you prefer a graphical interface. For our tests, we'll use the `delorean.jpg` image that's included in the root of the repository.

### 1. List Images

[This section remains the same]

### 2. Get Presigned URL for Upload

Test the endpoint to get a presigned URL for uploading an image:

```bash
curl -X POST \
  https://abcdefghij.execute-api.us-east-1.amazonaws.com/prod/get-presigned-url \
  -H 'Content-Type: application/json' \
  -d '{"filename":"delorean.jpg", "filetype":"image/jpeg"}'
```

You should receive a JSON response with a presigned URL and fields for uploading:

```json
{
  "url": "https://your-bucket-name.s3.amazonaws.com/",
  "fields": {
    "key": "delorean.jpg",
    "bucket": "your-bucket-name",
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    ...
  }
}
```

### 3. Upload an Image

To actually upload the `delorean.jpg` image using the presigned URL, use this command (replace the URL and fields with those from the previous response):

```bash
curl -X POST https://your-bucket-name.s3.amazonaws.com/ \
  -F key=delorean.jpg \
  -F bucket=your-bucket-name \
  -F X-Amz-Algorithm=AWS4-HMAC-SHA256 \
  ... \
  -F file=@delorean.jpg
```

Make sure you're in the root directory of the project where `delorean.jpg` is located when running this command.

### 4. Get Image URL

After uploading the image, test getting its URL:

```bash
curl https://abcdefghij.execute-api.us-east-1.amazonaws.com/prod/delorean.jpg
```

You should receive a JSON response with a presigned URL for downloading the image:

```json
{"url": "https://your-bucket-name.s3.amazonaws.com/delorean.jpg?AWSAccessKeyId=..."}
```

### 5. Get Image Preview URL

Test getting a preview URL for the image:

```bash
curl "https://abcdefghij.execute-api.us-east-1.amazonaws.com/prod/delorean.jpg?preview=true"
```

You should receive a JSON response with a presigned URL for downloading the preview image:

```json
{"url": "https://your-bucket-name.s3.amazonaws.com/preview_delorean.jpg?AWSAccessKeyId=..."}
```

### 6. Delete Image

Finally, test deleting the image:

```bash
curl -X DELETE https://abcdefghij.execute-api.us-east-1.amazonaws.com/prod/delete-image/delorean.jpg
```

You should receive a JSON response confirming the deletion:

```json
{"message": "Image deleted successfully"}
```

## Troubleshooting

If you encounter any issues during testing:

1. Check the CloudWatch Logs for your Lambda function. You can find these in the AWS Console under CloudWatch > Log groups.

2. Ensure your IAM permissions are set up correctly. The Lambda function should have permissions to access the S3 bucket.

3. Verify that your S3 bucket name in the Lambda function environment variables matches the actual bucket name.

4. If you make any changes to your Lambda function code, remember to redeploy your stack with `cdk deploy`.

## Conclusion

Congratulations! You've successfully deployed and tested your PhotoSky backend. Your AWS infrastructure is now set up with:

- An S3 bucket for storing images
- A Lambda function for handling image operations
- An API Gateway for exposing your Lambda function as a RESTful API

In the next part of this tutorial, we'll build the frontend of our application to interact with this backend.

Remember to keep your API Gateway URL handy, as you'll need it when configuring your frontend application.