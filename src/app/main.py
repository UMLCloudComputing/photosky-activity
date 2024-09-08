import json
import os
from S3 import S3

def handler(event, context):
    s3 = S3(os.getenv("BUCKET_NAME"))
    method = event['httpMethod']
    path = event['path']

    # CORS headers
    headers = {
        'Access-Control-Allow-Origin': '*',  # or restrict to 'http://localhost:3000'
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true'  # Optional, depending on your use case
    }

    # Handle CORS preflight (OPTIONS) requests
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'CORS preflight successful'})
        }

    # Handle GET /list-images (new)
    if method == 'GET' and path == '/list-images':
        images = s3.list_images()
        return {
            'statusCode': 200,
            'headers': headers,  # Include CORS headers in the response
            'body': json.dumps({'images': images})
        }

    # Handle POST /get-presigned-url (new)
    elif method == 'POST' and path == '/get-presigned-url':
        body = json.loads(event['body'])
        filename = body.get('filename')
        filetype = body.get('filetype')

        if not filename or not filetype:
            return {
                'statusCode': 400,
                'headers': headers,  # Include CORS headers in the response
                'body': json.dumps({'message': 'Filename and filetype required'})
            }

        presigned_url = s3.create_presigned_post(filename, conditions=None)
        if presigned_url:
            return {
                'statusCode': 200,
                'headers': headers,  # Include CORS headers in the response
                'body': json.dumps(presigned_url)
            }
        else:
            return {
                'statusCode': 500,
                'headers': headers,  # Include CORS headers in the response
                'body': json.dumps({'message': 'Error generating presigned URL'})
            }

    # Handle DELETE /delete-image/{filename} (new)
    elif method == 'DELETE' and path.startswith('/delete-image/'):
        filename = path.split('/')[-1]

        if not s3.object_exists(filename):
            return {
                'statusCode': 404,
                'headers': headers,  # Include CORS headers in the response
                'body': json.dumps({'message': 'File not found'})
            }

        s3.delete_image(filename)
        return {
            'statusCode': 200,
            'headers': headers,  # Include CORS headers in the response
            'body': json.dumps({'message': 'Image deleted successfully'})
        }

    # Handle GET /{filename} for downloading images and creating previews (existing logic)
    elif method == 'GET':
        query = event['queryStringParameters']
        filename = path.lstrip('/')

        if query and query.get('preview'):
            if s3.object_exists(filename):
                if not s3.object_exists("preview_" + filename):
                    print("Cache Miss")
                    s3.create_preview_image(filename)
                filename = "preview_" + filename
            else:
                return {
                    'statusCode': 404,
                    'headers': headers,  # Include CORS headers in the response
                    'body': json.dumps({'message': 'File not found'})
                }

        presigned_url = s3.create_presigned_get(filename)
        if presigned_url:
            return {
                'statusCode': 200,
                'headers': headers,  # Include CORS headers in the response
                'body': json.dumps({'url': presigned_url})
            }
        else:
            return {
                'statusCode': 400,
                'headers': headers,  # Include CORS headers in the response
                'body': json.dumps({'message': 'Error generating presigned URL'})
            }

    # Fallback for unsupported paths/methods
    return {
        'statusCode': 404,
        'headers': headers,  # Include CORS headers in the response
        'body': json.dumps({'message': 'Not found'})
    }
