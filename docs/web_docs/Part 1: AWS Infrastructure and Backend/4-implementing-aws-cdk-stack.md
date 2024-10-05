---
sidebar_position: 4
slug: /activities/part-1-aws-infrastructure-and-backend/4-implementing-aws-cdk-stack
---

# 🕋 Implementing AWS CDK Stack

In this section, we'll implement the backend infrastructure we designed using AWS CDK (Cloud Development Kit). We'll go through the process step-by-step, explaining each part of the code and how it relates to our architecture.

:::note
A *Stack* is a term used within this context to describe a collective definition for cloud resources specific to the application. 
:::

## 🧐 Understanding AWS CDK

AWS CDK allows us to define cloud infrastructure using familiar programming languages. In our case, we're using Python. CDK synthesizes our Python code into a CloudFormation template, which is then used to provision the actual AWS resources. 

## ⌨️ Setting Up the CDK Project

1. First, make sure you're in the project root directory. <br/> If you're not already in the root folder for the repository (`photosky-activity`) to do so with the following command

   ```bash
   cd photosky-activity
   ```

2. Our CDK code will live in the `cdk` directory. Let's navigate there with the following command:

   ```bash
   cd cdk
   ```

3. Open `photosky_stack.py` in your preferred text editor. This is where we'll define our stack.

:::note
If you're Github Codespaces or VSCode, the file can be opened by simply clicking on `cdk` and then `photosky_stack.py`. This should open the file to edit. 
:::

## 📝 Initializing the AWS CDK

Before we can use the CDK, we must initialize it. Initializing the CDK must be done within `app.py` still within the `cdk` directory. 
<br/>
:::note
For Github Codespace or VS Code users, double click the file to open it for editing.
:::
<br/>
Looking more closely at the code we can see that we import `PhotoskyStack` within our python code. We will be creating this very stack later. First we must initialize it! 
<br/> <br/>

To do so, place the provided code within the specified file (`app.py`).<br/>
Before we do that, let's take a closer look at it!<br/>
We utilize the python native `os` import properly obtain enviornment variable data we previously initialized within our `.env` file. The `dotenv` import enables us to assign enviornment variables with our `.env` file without having to modify them directly. <br/>
Most importantly, we also import `cdk` to properly intialize initialize our Photosky app's stack (`PhotoskyStack`). The function call the `synth()` is what will enable use to sythesize our infrastructure and to build a template of it's specifications and structure.  

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

## 🔨 Implementing the PhotoSky Stack

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

   Importing these modules enables us to interact with the AWS CDK. 
   `aws_lambda`, `aws_s3`, & `aws_apigateway` are the three primary cloud interfaces we would be using. Hence, their imports here enable us to write infrastructure as code. <br/>
   <br/>
   The inclusion of RemovalPolicy allows us to specify the action that should be taken if a resource stops being managed by Cloud formation. More info from the docs can be found [here](https://docs.aws.amazon.com/cdk/api/v2/python/aws_cdk/RemovalPolicy.html)
   <br/>
   The import of the `Stack` class allows us to create our own stack, which inherits from the base `Stack` class. 


2. Now, let's define our stack class:

   ```python
   class PhotoskyStack(Stack):
       def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
           super().__init__(scope, construct_id, **kwargs)

           # We'll add our resources here
   ```
    <br/>
    The code above enables to define the class in a preliminary phase. <br/> 
    Notice that is has the parameters of `scope` and `construct_id`. 
    - `scope` - Represents the construct's parent or owner. Our `PhotoskyStack` is a cloudformation stack. Constructs are the building blocks of the CDK. Each construct represents one or more AWS resources and their config
    - `id` - Represents a unique identifier within our scope. This identifier is used as a namespace for everything within the construct. This identifier is later used to create information such as resource names and CloudFormation logical IDs. 
    - More info from the [official docs](https://docs.aws.amazon.com/cdk/v2/guide/constructs.html)


3. Let's add our Lambda function within our `PhotoskyStack` class:

   ```python
   dockerFunc = _lambda.DockerImageFunction(
       scope=self,
       id=f"ID{construct_id}",
       function_name=construct_id,
       environment= {
           "BUCKET_NAME": f"{construct_id.lower()}"
       },            
       code=_lambda.DockerImageCode.from_image_asset(
           directory="src"
       ),
       timeout=Duration.seconds(300)
   )
   ```

   This creates a Lambda function from a Docker image. The Docker image will be built from the `Dockerfile` in the `src` directory. <br/>
   Notice how we utilize the `id` parameter within this code to specify resource names within the `function_name`, `id`, and `envronment` parameters of our `lambda.DockerImageFunction` instance. 

   :::warning
   If you're copying the content section by section, be sure to correct indentation!
   Python is indentation sensitive. <br/>
   Within VS Code this can be done using `Ctrl + Shift + i` or by `Ctrl + Shift + p` and then typing & clicking `Format Document`. <br/>
   :::

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

   This creates an API Gateway that proxies all requests to our Lambda function. It also sets up CORS to allow requests from any origin.<br/>
   CORS stands for Cross-Origin Resource Sharing. It enables our backend to accept uploads of pictures from our client and process downloads from the cloud itself. 

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

6. Finally, let's grant our Lambda function read/write access to the S3 bucket by adding the following line of code to the very end of our `PhotoskyStack` class:

   ```python
   bucket.grant_read_write(dockerFunc)
   ```

Here's what the complete `PhotoskyStack` class should look like:

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
This code defines our entire backend infrastructure:
- It creates a Lambda function, packaged as a Docker image.
- It sets up an API Gateway that proxies all requests to our Lambda function.
- It creates an S3 bucket for storing our images, with CORS configured.
- It grants the Lambda function read and write access to the S3 bucket. 

## 🛣️ Conclusion
We successfully just implement our CDK stack for PhotoSky! <br/>
We can now spool resources on the cloud from the cloud as specified within our stack. <br/> 
These resources will be used to handle and process our requests to the backend of PhotoSky!
