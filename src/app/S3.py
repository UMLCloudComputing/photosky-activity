import boto3
import logging
from botocore.exceptions import ClientError

class S3:
    def __init__(self, bucket_name):
        self.client = boto3.client('s3')
        self.bucket_name = bucket_name

    def create_presigned_post(self, object_name,
                            fields=None, conditions=None, expiration=3600):
        """Generate a presigned URL S3 POST request to upload a file

        :param bucket_name: string
        :param object_name: string
        :param fields: Dictionary of prefilled form fields
        :param conditions: List of conditions to include in the policy
        :param expiration: Time in seconds for the presigned URL to remain valid
        :return: Dictionary with the following keys:
            url: URL to post to
            fields: Dictionary of form fields and values to submit with the POST
        :return: None if error.
        """

        # Generate a presigned S3 POST URL
        try:
            response = self.client.generate_presigned_post(self.bucket_name,
                object_name,
                Fields=fields,
                Conditions=conditions,
                ExpiresIn=expiration
            )

        except ClientError as e:
            logging.error(e)
            return None

        # The response contains the presigned URL and required fields
        return response

    def create_presigned_get(self, object_name, expiration=3600):
        """Generate a presigned URL to share an S3 object

        :param bucket_name: string
        :param object_name: string
        :param expiration: Time in seconds for the presigned URL to remain valid
        :return: Presigned URL as string. If error, returns None.
        """

        try:
            response = self.client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name,
                'Key': object_name},
                ExpiresIn=expiration
            )
        except ClientError as e:
            logging.error(e)
            return None

        # The response contains the presigned URL
        return response

    # def upload(self, bucket, key, data):
    #     self.client.put_object(Bucket=bucket, Key=key, Body=data)

    # def download(self, bucket, key):
    #     return self.client.get_object(Bucket=bucket, Key=key)['Body'].read()

if __name__ == '__main__':
    s3 = S3('photoskydevelop')
    print(s3.create_presigned_post('delorean.jpg'))
    print(s3.create_presigned_get('delorean.jpg'))
    