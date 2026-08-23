import os
import re
import json

src_dir = 'd:/LetsCode/SwasthSaarthi/frontend/src'
locales_dir = 'd:/LetsCode/SwasthSaarthi/frontend/src/locales'

pattern = re.compile(r"t\(\s*['\"]([^'\"]+)['\"]")

used_keys = set()
for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.jsx') or f.endswith('.js'):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8', errors='ignore') as file:
                matches = pattern.findall(file.read())
                for m in matches:
                    if '.' in m or '_' in m:
                        used_keys.add(m)

en_path = os.path.join(locales_dir, 'en', 'translation.json')
with open(en_path, 'r', encoding='utf-8') as f:
    en_json = json.load(f)

def flatten_dict(d, prefix=''):
    items = {}
    for k, v in d.items():
        new_key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            items.update(flatten_dict(v, new_key))
        else:
            items[new_key] = v
    return items

flat_en = flatten_dict(en_json)

missing = []
for k in sorted(used_keys):
    if k not in flat_en:
        missing.append(k)

print(f"Total t() keys used across JSX: {len(used_keys)}")
print(f"Total keys missing in en/translation.json: {len(missing)}")

print("\n--- ALL MISSING KEYS ---")
for m in missing:
    print(f"MISSING: {m}")
