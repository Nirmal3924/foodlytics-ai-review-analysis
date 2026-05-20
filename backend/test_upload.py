import requests

url = "http://localhost:8000/api/admin/upload/restaurants"
files = {'file': ('Zomato Restaurant names and Metadata.csv', open('../data/Zomato Restaurant names and Metadata.csv', 'rb'), 'text/csv')}

try:
    response = requests.post(url, files=files)
    print("Status:", response.status_code)
    print("Body:", response.text)
except Exception as e:
    print("Error:", e)
