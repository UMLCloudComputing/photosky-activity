from aws_cdk import (
    Duration,
    Stack,
    aws_lambda as _lambda,
    aws_s3 as s3,
    aws_apigateway as apigateway,
)
from constructs import Construct

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
                directory="src"
            ),
            timeout=Duration.seconds(300)
        )

        api = apigateway.LambdaRestApi(self, "api",
            handler=dockerFunc,
            proxy=True
        )

        bucket = s3.Bucket(
            self, 
            id=f"id{construct_id.lower()}", 
            bucket_name=f"{construct_id.lower()}" # Provide a bucket name here
        )

        bucket.grant_read_write(dockerFunc)
