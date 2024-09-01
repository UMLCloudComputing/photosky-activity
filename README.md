# API Deployment Instrctions

Create an `.env` file, and add the following environment variables:
```
APP_NAME=your-app-name
```

Run the following commands from the root directory:
```
cdk bootstrap
cdk deploy
```

One of the outputs will be the API Gateway URL. You can use this URL to access the API.

# API Instructions

Executing
```curl -X GET https://{RANDOM_STRING}.execute-api.us-east-1.amazonaws.com/prod/{FILE_NAME}```

Will return a presigned S3 url. This URL will be valid for 10 minutes and allows you to download the file, either via a browser or through a `GET` request.

You may also want to get an image preview of the file. To do this, you can execute the following command:
```curl -X GET https://{RANDOM_STRING}.execute-api.us-east-1.amazonaws.com/prod/{FILE_NAME}?preview=true```

This will return a presigned S3 url for the image preview. This URL will be valid for 10 minutes and allows you to download the file, either via a browser or through a `GET` request.



