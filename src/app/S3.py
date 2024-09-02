import boto3
import logging
from PIL import Image
import io
from botocore.exceptions import ClientError

class S3:
    def __init__(self, bucket_name):
        self.client = boto3.client('s3')
        self.bucket_name = bucket_name
    
    def object_exists(self, object_name):
        try:
            self.client.head_object(Bucket=self.bucket_name, Key=object_name)
            return True
        except ClientError:
            return False

    def create_preview_image(self, object_name, result_width=100, result_height=100):
        '''
        Create a preview image from the original image
        This image will be displayed in the gallery.
        '''
        try:
            # Download the original image from S3
            original_image = self.client.get_object(Bucket=self.bucket_name, Key=object_name)
            image_data = original_image['Body'].read()

            # Open the image using Pillow
            image = Image.open(io.BytesIO(image_data))

            # Calculate the cropping box to make the image square
            width, height = image.size
            min_dimension = min(width, height)
            left = (width - min_dimension) / 2
            top = (height - min_dimension) / 2
            right = (width + min_dimension) / 2
            bottom = (height + min_dimension) / 2

            # Crop the image to a square
            cropped = image.crop((left, top, right, bottom))

            # Create a low-resolution preview (e.g., 100x100 pixels)
            preview_image = cropped.resize((result_width, result_height))

            # Save the preview image to a BytesIO object
            preview_image_bytes = io.BytesIO()
            preview_image.save(preview_image_bytes, format=image.format)
            preview_image_bytes.seek(0)

            # Define the preview image object name
            preview_object_name = f"preview_{object_name}"

            # Upload the preview image back to S3
            self.client.put_object(Bucket=self.bucket_name, Key=preview_object_name, Body=preview_image_bytes)

            return preview_object_name

        except ClientError as e:
            logging.error(e)
            return None

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

    def create_presigned_list(self, object_name, expiration=3600):
        """Generate a presigned URL to share an S3 object

        :param bucket_name: string
        :param object_name: string
        :param expiration: Time in seconds for the presigned URL to remain valid
        :return: Presigned URL as string. If error, returns None.
        """

        try:
            response = self.client.generate_presigned_url(
                'list_objects',
                Params={'Bucket': self.bucket_name},
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
    # print(s3.create_presigned_post('delorean.jpg'))
    # print(s3.create_presigned_get('delorean.jpg'))
    # print(s3.object_exists('delorean.jpg'))
    print(s3.create_preview_image('delorean.jpg', 200, 200))
    # print(s3.create_presigned_list("delorean.jpg"))
    