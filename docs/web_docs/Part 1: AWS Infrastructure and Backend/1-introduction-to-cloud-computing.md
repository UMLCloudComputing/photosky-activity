---
sidebar_position: 1
slug: /activities/part-1-aws-infrastructure-and-backend/1-introduction-to-cloud-computing
---

# Introduction to Cloud Computing and AWS

Welcome to the first part of our PhotoSky tutorial! Before we dive into building our application, let's explore the fundamental concepts of cloud computing and how they apply to our project.

## What is Cloud Computing?

Cloud computing is the delivery of computing services—including servers, storage, databases, networking, software, analytics, and intelligence—over the Internet ("the cloud") to offer faster innovation, flexible resources, and economies of scale.

### Key Characteristics of Cloud Computing:

1. **On-demand self-service**: Users can provision computing capabilities as needed without requiring human interaction with each service provider.
2. **Broad network access**: Services are available over the network and accessed through standard mechanisms.
3. **Resource pooling**: The provider's computing resources are pooled to serve multiple consumers using a multi-tenant model.
4. **Rapid elasticity**: Capabilities can be elastically provisioned and released to scale rapidly outward and inward with demand.
5. **Measured service**: Cloud systems automatically control and optimize resource use by leveraging a metering capability.

## Introduction to AWS (Amazon Web Services)

AWS is a comprehensive and widely adopted cloud platform, offering over 200 fully featured services from data centers globally. It provides a wide array of cloud computing resources, including:

- Compute power
- Storage options
- Networking
- Databases
- Analytics
- Application services
- Deployment tools
- Machine learning

For our PhotoSky project, we'll be focusing on a few key AWS services:

1. **Amazon S3 (Simple Storage Service)**: Object storage service that offers industry-leading scalability, data availability, security, and performance.
2. **AWS Lambda**: Serverless compute service that lets you run code without provisioning or managing servers.
3. **Amazon API Gateway**: Fully managed service that makes it easy for developers to create, publish, maintain, monitor, and secure APIs at any scale.

## How PhotoSky Leverages Cloud Computing

Let's examine how our PhotoSky application will utilize cloud computing concepts:

1. **Serverless Architecture**: By using AWS Lambda, we eliminate the need to manage servers. Our application logic runs in stateless compute containers that are event-triggered and fully managed by AWS.

2. **Scalable Storage**: Amazon S3 will store our images, providing virtually unlimited storage capacity that scales automatically as our application grows.

3. **API-Driven Development**: Amazon API Gateway will create a RESTful API that connects our frontend to our Lambda functions, allowing seamless communication between the client and our serverless backend.

4. **Pay-per-use Model**: With AWS, we only pay for the compute time we consume and the storage we use, optimizing costs as our application scales.

5. **Global Availability**: AWS's global infrastructure allows us to deploy our application closer to end-users, reducing latency and improving user experience.

## Preview of Our AWS Infrastructure

Here's a sneak peek at the AWS infrastructure we'll be setting up for PhotoSky:

```python
# Excerpt from cdk/photosky_stack.py
class PhotoskyStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Define the Lambda function using Docker
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

        # Enable CORS for the API Gateway
        api = apigateway.LambdaRestApi(self, "api",
            handler=dockerFunc,
            proxy=True,
            default_cors_preflight_options={
                "allow_origins": ["*"],
                "allow_methods": apigateway.Cors.ALL_METHODS,
                "allow_headers": ["*"],
            }
        )

        # Create an S3 bucket
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

        # Grant the Lambda function read/write access to the S3 bucket
        bucket.grant_read_write(dockerFunc)
```

This code snippet defines our AWS infrastructure using AWS CDK (Cloud Development Kit). It sets up:

1. A Lambda function to handle our application logic
2. An API Gateway to create a RESTful API
3. An S3 bucket for storing our images

In the next sections, we'll dive deeper into each of these components and set them up step-by-step.

## Conclusion

Cloud computing, and specifically AWS, provides the robust, scalable infrastructure we need for PhotoSky. By leveraging these technologies, we can focus on building our application's unique features without worrying about the underlying infrastructure.

In the next section, we'll start setting up our AWS environment and begin building the backend for PhotoSky. Get ready to dive into the world of cloud computing!