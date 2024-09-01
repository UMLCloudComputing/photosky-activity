import json
from S3 import S3
import os


def handler(event, context):
    s3 = S3(os.getenv("BUCKET_NAME"))
    method = event['httpMethod']
    path = event['path']
    filename = path.lstrip('/')

    # Query Strings
    query = event['queryStringParameters']
    
    match method:
        case 'GET':
            if query and query.get('preview'):
                if s3.object_exists(path.lstrip('/')):
                    response = s3.create_preview_image(path.lstrip('/'))
                    filename = "preview_" + filename
                else:
                    return {
                        'statusCode': 404,
                        'body': json.dumps({
                            'message': 'File not found'
                        })
                    }
    
            response = s3.create_presigned_get(filename)
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