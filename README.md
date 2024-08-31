# API Instructions

Executing
```curl -X GET https://apigatewaydomain/prod/{FILE_NAME}```

Will return a presigned S3 url. This URL will be valid for 10 minutes and allows you to download the file, either via a browser or through a `GET` request.

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

