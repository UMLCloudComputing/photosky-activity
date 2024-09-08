from aws_cdk import (
    Duration,
    Stack,
    RemovalPolicy,
    aws_lambda as _lambda,
    aws_s3 as s3,
    aws_apigateway as apigateway,
)
from constructs import Construct

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
                "allow_origins": ["*"],  # Allow all origins or specify 'http://localhost:3000'
                "allow_methods": apigateway.Cors.ALL_METHODS,  # Allow all HTTP methods
                "allow_headers": ["*"],  # Allow all headers
            }
        )

        # Create an S3 bucket with auto deletion and grant permissions to the Lambda function
        bucket = s3.Bucket(
            self, 
            id=f"id{construct_id.lower()}", 
            bucket_name=f"{construct_id.lower()}",
            cors=[s3.CorsRule(
                allowed_methods=[s3.HttpMethods.GET, s3.HttpMethods.POST, s3.HttpMethods.PUT, s3.HttpMethods.DELETE],
                allowed_origins=["*"],  # Allow your frontend's origin
                allowed_headers=["*"],  # Allow all headers
                exposed_headers=["ETag"],  # Optionally expose any headers you need (like ETag)
                max_age=3000  # Cache the preflight request for 3000 seconds
            )],
            removal_policy=RemovalPolicy.DESTROY,  # Automatically delete the bucket on destroy
            auto_delete_objects=True  # Automatically delete objects in the bucket on destroy
        )

        # Grant the Lambda function read/write access to the S3 bucket
        bucket.grant_read_write(dockerFunc)
