import os
import re

src_dir = 'd:/LetsCode/SwasthSaarthi/frontend/src'
jsx_files = []

for root, dirs, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.jsx'):
            jsx_files.append(os.path.join(root, f))

# Regex to detect raw text inside JSX tags (e.g. >Some text< or placeholders)
jsx_text_pattern = re.compile(r'>\s*([A-Za-z0-9\s.,!?:\-\']+)\s*<')
prop_text_pattern = re.compile(r'(placeholder|label|title|alt)="([A-Za-z0-9\s.,!?:\-\']+)"')

report = {}

for filepath in sorted(jsx_files):
    rel_path = os.path.relpath(filepath, src_dir).replace('\\', '/')
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    has_use_translation = 'useTranslation' in content
    
    matches = []
    for m in jsx_text_pattern.finditer(content):
        text = m.group(1).strip()
        if not text.startswith('{') and not text.endswith('}') and not text.isdigit() and len(text) > 2:
            matches.append(text)
    
    for m in prop_text_pattern.finditer(content):
        prop_name, text = m.group(1), m.group(2).strip()
        matches.append(f'{prop_name}="{text}"')

    report[rel_path] = {
        'has_i18n': has_use_translation,
        'hardcoded_count': len(matches),
        'sample_matches': matches
    }

print('=== FILE-BY-FILE HARDCODED STRING & i18n AUDIT ===')
total_hardcoded = 0
no_i18n_files = []

for path, info in report.items():
    cnt = info['hardcoded_count']
    i18n_str = 'YES' if info['has_i18n'] else 'NO'
    total_hardcoded += cnt
    if not info['has_i18n']:
        no_i18n_files.append(path)
    print(f'{path:50s} | i18n: {i18n_str:3s} | Hardcoded Strings: {cnt:3d}')

print(f'\nTOTAL HARDCODED STRINGS FOUND ACROSS ALL JSX FILES: {total_hardcoded}')
print(f'COMPONENTS MISSING useTranslation IMPORT: {len(no_i18n_files)}')
for f in no_i18n_files:
    print(f'  - {f}')
