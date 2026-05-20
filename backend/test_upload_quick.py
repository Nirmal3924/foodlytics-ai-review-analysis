import json
import urllib.error
import urllib.request
from pathlib import Path

import os
BASE = os.environ.get("API_BASE", "http://127.0.0.1:8000")


def call(method, path, body=None, headers=None, multipart=None):
    h = dict(headers or {})
    data = body
    if multipart:
        boundary = "----Boundary"
        parts = []
        for name, (filename, content, ctype) in multipart.items():
            parts.append(
                f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"; filename="{filename}"\r\n'
                f"Content-Type: {ctype}\r\n\r\n".encode()
                + content
                + b"\r\n"
            )
        parts.append(f"--{boundary}--\r\n".encode())
        data = b"".join(parts)
        h["Content-Type"] = f"multipart/form-data; boundary={boundary}"
    req = urllib.request.Request(f"{BASE}{path}", data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


login_body = json.dumps({"email": "admin@gmail.com", "password": "admin123"}).encode()
code, body = call("POST", "/api/auth/login", login_body, {"Content-Type": "application/json"})
print("login", code, body[:120])
token = json.loads(body)["access_token"]
auth = {"Authorization": f"Bearer {token}"}

for path in ["/api/admin/stats", "/api/admin/restaurants?page=1&per_page=10"]:
    code, body = call("GET", path, headers=auth)
    print(path, code, body[:150])

csv_path = Path(__file__).parent.parent / "data" / "Zomato Restaurant names and Metadata.csv"
content = csv_path.read_bytes()
code, body = call(
    "POST",
    "/api/admin/upload/restaurants",
    headers=auth,
    multipart={"file": ("meta.csv", content, "text/csv")},
)
print("upload", code, body[:400])
