import aws_cdk as core
import aws_cdk.assertions as assertions

from photosky.photosky_stack import PhotoskyStack

# example tests. To run these tests, uncomment this file along with the example
# resource in photosky/photosky_stack.py
def test_sqs_queue_created():
    app = core.App()
    stack = PhotoskyStack(app, "photosky")
    template = assertions.Template.from_stack(stack)

#     template.has_resource_properties("AWS::SQS::Queue", {
#         "VisibilityTimeout": 300
#     })
