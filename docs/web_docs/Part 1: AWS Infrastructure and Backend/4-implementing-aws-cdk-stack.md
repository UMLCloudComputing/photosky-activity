---
sidebar_position: 4
slug: /activities/part-1-aws-infrastructure-and-backend/4-implementing-aws-cdk-stack
---

# Implementing AWS CDK Stack

In this section, we'll implement the backend infrastructure we designed using AWS CDK (Cloud Development Kit). We'll go through the process step-by-step, explaining each part of the code and how it relates to our architecture.

## Understanding AWS CDK

AWS CDK allows us to define cloud infrastructure using familiar programming languages. In our case, we're using Python. CDK synthesizes our Python code into a CloudFormation template, which is then used to provision the actual AWS resources.

## Setting Up the CDK Project

1. First, make sure you're in the project root directory:

   ```bash
   cd photosky
   ```

2. Our CDK code will live in the `cdk` directory. Let's navigate there:

   ```bash
   cd cdk
   ```

3. Open `photosky_stack.py` in your preferred text editor. This is where we'll define our stack.

## Initializing the AWS CDK

Before we can use the CDK, we must initialize it. You can see that we import `PhotoskyStack`. We will create this later.

```python
#!/usr/bin/env python3
import os
from dotenv import load_dotenv
import aws_cdk as cdk
from photosky_stack import PhotoskyStack

load_dotenv()

app = cdk.App()
PhotoskyStack(app, os.getenv("APP_NAME"),)
app.synth()
```

## Implementing the PhotoSky Stack

Let's break down the `PhotoskyStack` class and implement it step by step:

1. First, let's import the necessary modules:

   ```python
   from aws_cdk import (
       Duration,
       Stack,
       RemovalPolicy,
       aws_lambda as _lambda,
       aws_s3 as s3,
       aws_apigateway as apigateway,
   )
   from constructs import Construct
   ```

2. Now, let's define our stack class:

   ```python
   class PhotoskyStack(Stack):
       def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
           super().__init__(scope, construct_id, **kwargs)

           # We'll add our resources here
   ```

3. Let's add our Lambda function:

   ```python
   dockerFunc = _lambda.DockerImageFunction(
       scope=self,
       id=f"ID{construct_id}",
       function_name=construct_id,
       environment= {
           "BUCKET_NAME": f"{construct_id.lower()}"
       },            
       code=_lambda.DockerImageCode.from_image_asset(
           directory="../src"
       ),
       timeout=Duration.seconds(300)
   )
   ```

   This creates a Lambda function from a Docker image. The Docker image will be built from the `Dockerfile` in the `src` directory.

4. Next, let's create our API Gateway:

   ```python
   api = apigateway.LambdaRestApi(self, "api",
       handler=dockerFunc,
       proxy=True,
       default_cors_preflight_options={
           "allow_origins": ["*"],
           "allow_methods": apigateway.Cors.ALL_METHODS,
           "allow_headers": ["*"],
       }
   )
   ```

   This creates an API Gateway that proxies all requests to our Lambda function. It also sets up CORS to allow requests from any origin.

5. Now, let's create our S3 bucket:

   ```python
   bucket = s3.Bucket(
       self, 
       id=f"id{construct_id.lower()}", 
       bucket_name=f"{construct_id.lower()}",
       cors=[s3.CorsRule(
           allowed_methods=[s3.HttpMethods.GET, s3.HttpMethods.POST, s3.HttpMethods.PUT, s3.HttpMethods.DELETE],
           allowed_origins=["*"],
           allowed_headers=["*"],
           exposed_headers=["ETag"],
           max_age=3000
       )],
       removal_policy=RemovalPolicy.DESTROY,
       auto_delete_objects=True
   )
   ```

   This creates an S3 bucket with CORS configured to allow all methods from any origin. The `removal_policy` and `auto_delete_objects` parameters ensure the bucket will be deleted when we destroy our stack.

6. Finally, let's grant our Lambda function read/write access to the S3 bucket:

   ```python
   bucket.grant_read_write(dockerFunc)
   ```

Here's the complete `PhotoskyStack` class:

```python
class PhotoskyStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        dockerFunc = _lambda.DockerImageFunction(
            scope=self,
            id=f"ID{construct_id}",
            function_name=construct_id,
            environment= {
                "BUCKET_NAME": f"{construct_id.lower()}"
            },            
            code=_lambda.DockerImageCode.from_image_asset(
                directory="../src"
            ),
            timeout=Duration.seconds(300)
        )

        api = apigateway.LambdaRestApi(self, "api",
            handler=dockerFunc,
            proxy=True,
            default_cors_preflight_options={
                "allow_origins": ["*"],
                "allow_methods": apigateway.Cors.ALL_METHODS,
                "allow_headers": ["*"],
            }
        )

        bucket = s3.Bucket(
            self, 
            id=f"id{construct_id.lower()}", 
            bucket_name=f"{construct_id.lower()}",
            cors=[s3.CorsRule(
                allowed_methods=[s3.HttpMethods.GET, s3.HttpMethods.POST, s3.HttpMethods.PUT, s3.HttpMethods.DELETE],
                allowed_origins=["*"],
                allowed_headers=["*"],
                exposed_headers=["ETag"],
                max_age=3000
            )],
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True
        )

        bucket.grant_read_write(dockerFunc)
```