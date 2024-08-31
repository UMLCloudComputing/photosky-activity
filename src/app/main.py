import json
from S3 import S3
import os

def handler(event, context):
    s3 = S3(os.getenv("BUCKET_NAME"))
    method = event['httpMethod']
    path = event['path']
    
    match method:
        case 'GET':
            response = s3.create_presigned_get(path.lstrip('/'))
            if response:
                return {
                    'statusCode': 200,
                    'body': json.dumps({
                        'url': response
                    })
                }
            else:
                return {
                    'statusCode': 400,
                    'body': json.dumps({
                        'message': 'Error generating presigned URL'
                    })
                }
            
    return {}