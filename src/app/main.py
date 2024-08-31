import json

def handler(event, context):
    httpMethod = event['httpMethod']
    path = event['path']

    return {
        'statusCode': 200,
        'body': json.dumps({
            'httpMethod': httpMethod,
            'path': path
        })
    }