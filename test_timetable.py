#!/usr/bin/env python3
import urllib.request
import json

# Test the timetable generation endpoint
url = 'http://localhost:8000/api/generated-schedules/generate/'
data = {
    'name': 'Test Generated Timetable',
    'department': 2,  # Computer Science
    'academic_session': 5  # Spring 2024 Evening Session
}

headers = {
    'Content-Type': 'application/json'
}

try:
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        print(f'Status Code: {response.getcode()}')
        print(f'Response: {json.dumps(result, indent=2)}')
except urllib.error.HTTPError as e:
    print(f'HTTP Error {e.code}: {e.reason}')
    try:
        error_content = e.read().decode('utf-8')
        print(f'Error details: {error_content}')
    except:
        print('Could not read error details')
except Exception as e:
    print(f'Error: {e}')