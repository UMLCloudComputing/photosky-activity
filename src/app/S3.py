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
        '''
        try:
            original_image = self.client.get_object(Bucket=self.bucket_name, Key=object_name)
            image_data = original_image['Body'].read()
            image = Image.open(io.BytesIO(image_data))

            # Crop and resize logic remains unchanged
            width, height = image.size
            min_dimension = min(width, height)
            left = (width - min_dimension) / 2
            top = (height - min_dimension) / 2
            right = (width + min_dimension) / 2
            bottom = (height + min_dimension) / 2

            cropped = image.crop((left, top, right, bottom))
            preview_image = cropped.resize((result_width, result_height))

            # Save the preview image
            preview_image_bytes = io.BytesIO()
            preview_image.save(preview_image_bytes, format=image.format)
            preview_image_bytes.seek(0)

            preview_object_name = f"preview_{object_name}"
            self.client.put_object(Bucket=self.bucket_name, Key=preview_object_name, Body=preview_image_bytes)

            return preview_object_name

        except ClientError as e:
            logging.error(e)
            return None

    def create_presigned_post(self, object_name, fields=None, conditions=None, expiration=3600):
        '''
        Generate a presigned URL for uploading
        '''
        try:
            response = self.client.generate_presigned_post(
                Bucket=self.bucket_name,
                Key=object_name,
                Fields=fields,
                Conditions=conditions,
                ExpiresIn=expiration
            )
            return response
        except ClientError as e:
            logging.error(e)
            return None

    def create_presigned_get(self, object_name, expiration=3600):
        '''
        Generate a presigned URL to share an S3 object
        '''
        try:
            response = self.client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': object_name},
                ExpiresIn=expiration
            )
            return response
        except ClientError as e:
            logging.error(e)
            return None

    def list_images(self):
        '''
        List all images in the S3 bucket
        '''
        try:
            response = self.client.list_objects_v2(Bucket=self.bucket_name)
            images = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    images.append({'id': obj['Key'], 'url': self.create_presigned_get(obj['Key'])})
            return images
        except ClientError as e:
            logging.error(e)
            return []

    def delete_image(self, object_name):
        '''
        Delete an image from the S3 bucket
        '''
        try:
            self.client.delete_object(Bucket=self.bucket_name, Key=object_name)
        except ClientError as e:
            logging.error(e)
            return None

if __name__ == '__main__':
    s3 = S3('your_bucket_name')
    print(s3.list_images())
    # print(s3.create_presigned_post('new_image.jpg'))
    # print(s3.delete_image('image_to_delete.jpg'))
