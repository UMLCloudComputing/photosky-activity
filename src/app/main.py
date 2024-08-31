import json
import S3

def handler(event, context):
    httpMethod = event['httpMethod']
    path = event['path']


    
    if httpMethod == 'GET' and path == '/':
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Hello, world!'
            })
        }

    

    return {
        'statusCode': 400,
        'body': json.dumps({
            'httpMethod': httpMethod,
            'path': path
        })
    }