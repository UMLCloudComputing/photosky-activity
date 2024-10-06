---
sidebar_position: 3
slug: /activities/part-1-aws-infrastructure-and-backend/3-designing-backend-architecture
---

# ✍ Designing Backend Architecture

In this section, we'll dive into the backend architecture of our PhotoSky application. We'll explore the AWS services we're using, why we chose them, and how they work together to create a scalable, serverless backend.

## Overview of PhotoSky's Backend Architecture

PhotoSky uses a serverless architecture built on AWS. Here's a high-level overview of our backend components:

1. **Amazon S3 (Simple Storage Service)**: For storing images
2. **AWS Lambda**: For running our backend logic
3. **Amazon API Gateway**: For creating a RESTful API
4. **AWS CDK (Cloud Development Kit)**: For defining and provisioning our AWS infrastructure

Let's explore each of these components in detail.

## 🪣 Amazon S3 (Simple Storage Service)

Amazon S3 is an object storage service that offers industry-leading scalability, data availability, security, and performance.

**Why S3 for PhotoSky?**
- Scalable storage: S3 can store virtually unlimited amounts of data.
- High durability and availability: S3 is designed for 99.999999999% (11 9's) of durability.
- Security: S3 offers strong encryption and access control mechanisms.
- Cost-effective: You only pay for what you use.

In our application, S3 will store all the images uploaded by users.

## AWS Lambda

AWS Lambda is a serverless compute service that lets you run code without provisioning or managing servers.

**Why Lambda for PhotoSky?**
- Serverless: No need to manage servers.
- Auto-scaling: Lambda automatically scales your application by running code in response to each trigger.
- Pay-per-use: You're only charged for the compute time you consume.
- Supports multiple programming languages: We're using Python for our Lambda functions.

In PhotoSky, Lambda functions will handle operations like generating presigned URLs for S3, creating image previews, and managing image metadata.

## 🌁 Amazon API Gateway

Amazon API Gateway is a fully managed service that makes it easy for developers to create, publish, maintain, monitor, and secure APIs at any scale.

**Why API Gateway for PhotoSky?**
- RESTful API creation: Easily create a RESTful API that our frontend can interact with.
- Integration with Lambda: Seamlessly connect our API endpoints to our Lambda functions.
- Security: Provides features like AWS IAM integration, CORS support, and more.
- Scalability: Can handle any number of API calls.

API Gateway will serve as the entry point for our frontend, routing requests to the appropriate Lambda functions.

## 🧰 AWS CDK (Cloud Development Kit)

While not a part of the runtime architecture, AWS CDK is crucial for defining and provisioning our infrastructure.

**Why CDK for PhotoSky?**
- Infrastructure as Code: Define cloud infrastructure using familiar programming languages (we're using Python).
- Reusable components: Create and share reusable infrastructure components.
- AWS best practices: CDK encapsulates AWS best practices.
- Easy updates: Simplifies the process of updating and versioning our infrastructure.

## Putting It All Together

Here's how these components work together in PhotoSky:

1. The frontend sends requests to API Gateway endpoints.
2. API Gateway routes these requests to the appropriate Lambda function.
3. Lambda functions perform operations, which may include:
   - Generating presigned URLs for S3 uploads/downloads
   - Creating image previews
   - Managing image metadata
4. S3 stores the actual image files.

Here's a diagram of this architecture:

```
+----------+     +---------------+     +-----------------+
| Frontend | --> | API Gateway   | --> | Lambda Function |
+----------+     +---------------+     +-----------------+
                                               |
                                               v
                                        +-------------+
                                        | Amazon S3   |
                                        +-------------+
```
<!-- 
## Code Preview

Let's take a look at how we define this architecture using AWS CDK:

```python
# Excerpt from cdk/photosky_stack.py
class PhotoskyStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # Define the Lambda function
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

        # Create API Gateway
        api = apigateway.LambdaRestApi(self, "api",
            handler=dockerFunc,
            proxy=True,
            default_cors_preflight_options={
                "allow_origins": ["*"],
                "allow_methods": apigateway.Cors.ALL_METHODS,
                "allow_headers": ["*"],
            }
        )

        # Create S3 bucket
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

        # Grant Lambda function access to S3 bucket
        bucket.grant_read_write(dockerFunc)
```

This code defines our entire backend infrastructure:
- It creates a Lambda function, packaged as a Docker image.
- It sets up an API Gateway that proxies all requests to our Lambda function.
- It creates an S3 bucket for storing our images, with CORS configured.
- It grants the Lambda function read and write access to the S3 bucket. -->

## Conclusion

This serverless architecture provides a scalable, maintainable, and cost-effective backend for PhotoSky. By leveraging these AWS services, we can focus on building application features without worrying about infrastructure management.

In the next section, we'll dive deeper into implementing this architecture using AWS CDK. We'll go through the CDK code in detail and deploy our backend to AWS.