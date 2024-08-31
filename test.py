import requests

# Presigned URL and fields
url = 'https://photoskydevelop.s3.amazonaws.com/'
fields = {
    'key': 'ALVIN.jpeg',
    'AWSAccessKeyId': 'AKIAWFIKLGSHLRYAIB4C',
    'policy': 'eyJleHBpcmF0aW9uIjogIjIwMjQtMDgtMzFUMjI6NDQ6MDRaIiwgImNvbmRpdGlvbnMiOiBbeyJidWNrZXQiOiAicGhvdG9za3lkZXZlbG9wIn0sIHsia2V5IjogIkFMVklOLmpwZWcifV19',
    'signature': 'YBOGca6ZuKzbGYu0M/Iw4yZG0Y8='
}

# File to upload
files = {'file': ('ALVIN.jpeg', open('ALVIN.jpeg', 'rb'))}

# Make the POST request
response = requests.post(url, data=fields, files=files)

# Print the response
print(response.status_code)
print(response.text)