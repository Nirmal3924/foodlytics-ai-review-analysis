import urllib.request
import urllib.parse
import json

url = "http://localhost:8000/api/admin/upload/restaurants"

# We can just send a GET to a health check to see if the server is running first
try:
    req = urllib.request.Request("http://localhost:8000/")
    with urllib.request.urlopen(req) as response:
        print("Root Status:", response.status)
        print("Root Body:", response.read().decode())
except Exception as e:
    print("Error checking root:", e)
