import os
import re
import json

src_dir = 'd:/LetsCode/SwasthSaarthi/frontend/src'
locales_dir = 'd:/LetsCode/SwasthSaarthi/frontend/src/locales'

# Regex to match t('key.path', ...) or t("key.path", ...)
pattern = re.compile(r"t\(\s*['\"]([^'\"]+)['\"]")

used_keys = set()
file_key_map = {}

for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.jsx') or f.endswith('.js'):
            p = os.path.join(root, f)
            with open(p, 'r', encoding='utf-8', errors='ignore') as file:
                content = file.read()
                matches = pattern.findall(content)
                if matches:
                    rel_p = os.path.relpath(p, src_dir)
                    file_key_map[rel_p] = matches
                    for m in matches:
                        used_keys.add(m)

print(f"Total files containing t() calls: {len(file_key_map)}")
print(f"Total unique keys extracted: {len(used_keys)}")

# Flatten helper
def flatten_dict(d, prefix=''):
    items = {}
    for k, v in d.items():
        new_key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            items.update(flatten_dict(v, new_key))
        else:
            items[new_key] = v
    return items

# Load en translation.json
en_path = os.path.join(locales_dir, 'en', 'translation.json')
with open(en_path, 'r', encoding='utf-8') as f:
    en_json = json.load(f)

flat_en = flatten_dict(en_json)

missing_in_en = []
for k in sorted(used_keys):
    if k not in flat_en:
        missing_in_en.append(k)

print(f"\nKeys used in JSX but MISSING in en/translation.json: {len(missing_in_en)}")
for k in missing_in_en:
    print(f"  - MISSING: {k}")
