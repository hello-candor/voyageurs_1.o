import urllib.request
import urllib.parse
import json
import csv
import os

API_KEY = "AIzaSyAC5sjtZnu9ccHXLVeoiawnjq0w_dwNeq8"
PROJECT_ID = "voyageurs-834eb"
EVENT_ID = "voyageurs_2026"

def get_anon_token():
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={API_KEY}"
    data = json.dumps({"returnSecureToken": True}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode('utf-8'))
            return res.get('idToken')
    except Exception as e:
        print("Error getting token:", e)
        return None

def fetch_guests(token):
    url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/events/{EVENT_ID}/guests?pageSize=1000"
    guests = []
    
    while url:
        req = urllib.request.Request(url)
        if token:
            req.add_header('Authorization', f'Bearer {token}')
        try:
            with urllib.request.urlopen(req) as response:
                res = json.loads(response.read().decode('utf-8'))
                docs = res.get('documents', [])
                for d in docs:
                    doc_id = d['name'].split('/')[-1]
                    fields = d.get('fields', {})
                    
                    guest = {'id': doc_id}
                    def parse_value(v):
                        if 'stringValue' in v: return v['stringValue']
                        if 'integerValue' in v: return int(v['integerValue'])
                        if 'doubleValue' in v: return float(v['doubleValue'])
                        if 'booleanValue' in v: return v['booleanValue']
                        if 'nullValue' in v: return None
                        if 'mapValue' in v:
                            return {k: parse_value(v2) for k, v2 in v['mapValue'].get('fields', {}).items()}
                        if 'arrayValue' in v:
                            return [parse_value(v2) for v2 in v['arrayValue'].get('values', [])]
                        return str(v)
                    
                    for k, v in fields.items():
                        guest[k] = parse_value(v)
                    guests.append(guest)
                
                next_page = res.get('nextPageToken')
                if next_page:
                    url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/events/{EVENT_ID}/guests?pageSize=1000&pageToken={urllib.parse.quote(next_page)}"
                else:
                    url = None
        except urllib.error.HTTPError as e:
            print("HTTP Error:", e.code, e.read().decode('utf-8'))
            break
        except Exception as e:
            print("Error fetching guests:", e)
            break
            
    return guests

def main():
    print("Authenticating...")
    token = get_anon_token()
    print("Fetching guests...")
    guests = fetch_guests(token)
    
    if not guests:
        print("No guests found or error occurred.")
        return
        
    header_set = set()
    for g in guests:
        header_set.update(g.keys())
    
    # Priority headers to show first
    first_headers = ['id', 'name', 'status', 'email', 'guestsCount', 'invitationCode']
    headers = []
    for h in first_headers:
        if h in header_set:
            headers.append(h)
            header_set.remove(h)
            
    headers.extend(sorted(list(header_set)))
    
    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'firestore_guests_export.csv')
    
    with open(out_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        for g in guests:
            row = []
            for h in headers:
                val = g.get(h, '')
                if isinstance(val, (dict, list)):
                    val = json.dumps(val)
                row.append(val)
            writer.writerow(row)
            
    print(f"✅ Exported {len(guests)} guests to {out_path}")

if __name__ == '__main__':
    main()
