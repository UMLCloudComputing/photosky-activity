from aws_cdk import (
    Duration,
    Stack,
    aws_lambda as _lambda,
    # aws_sqs as sqs,
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
            },            
            code=_lambda.DockerImageCode.from_image_asset(
                directory="."
            ),
            timeout=Duration.seconds(300)
        )
        api = apigateway.LambdaRestApi(self, "myapi",
    handler=backend,
    proxy=False
)