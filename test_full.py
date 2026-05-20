import urllib.request
import urllib.parse
import json

# 1. Login
login_data = json.dumps({
    "email": "admin@gmail.com",
    "password": "admin123",
    "role": "admin"
}).encode('utf-8')

req = urllib.request.Request(
    "http://localhost:8000/api/auth/login",
    data=login_data,
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as res:
        body = json.loads(res.read().decode())
        token = body['access_token']
        print("Logged in successfully. Token:", token[:20], "...")
except Exception as e:
    print("Login failed:", e)
    if hasattr(e, 'read'):
        print("Body:", e.read().decode())
    exit(1)

# 2. Upload restaurants CSV
import uuid

boundary = uuid.uuid4().hex
file_path = "data/Zomato Restaurant names and Metadata.csv"

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': f'multipart/form-data; boundary={boundary}'
}

# Construct multipart body
data = []
data.append(f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="metadata.csv"\r\nContent-Type: text/csv\r\n\r\n'.encode('utf-8'))
with open(file_path, 'rb') as f:
    data.append(f.read())
data.append(f'\r\n--{boundary}--\r\n'.encode('utf-8'))

body = b''.join(data)

req_upload = urllib.request.Request(
    "http://localhost:8000/api/admin/upload/restaurants",
    data=body,
    headers=headers
)

try:
    with urllib.request.urlopen(req_upload) as res:
        print("Upload Status:", res.status)
        print("Upload Response:", res.read().decode())
except Exception as e:
    print("Upload failed:", e)
    if hasattr(e, 'read'):
        print("Upload Error Body:", e.read().decode())
