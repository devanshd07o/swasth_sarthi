with open('frontend/src/pages/AyurSaarthiCaseForm.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

stack = []
in_str = None
escaped = False

lines = text.split('\n')
for i, line in enumerate(lines, 1):
    for j, c in enumerate(line, 1):
        if escaped:
            escaped = False
            continue
        if c == '\\':
            escaped = True
            continue
        if in_str:
            if c == in_str:
                in_str = None
        else:
            if c in ('"', "'", '`'):
                in_str = c
            elif c in ('{', '('):
                stack.append((c, i, j, line.strip()))
            elif c in ('}', ')'):
                matching_c = '{' if c == '}' else '('
                if not stack:
                    print(f"Extra closing {c} at {i}:{j}")
                else:
                    top_c, top_i, top_j, top_line = stack[-1]
                    if top_c == matching_c:
                        stack.pop()
                    else:
                        print(f"Mismatch at {i}:{j}: found '{c}' but expected match for '{top_c}' from line {top_i}:{top_j}")

print(f"Remaining stack size: {len(stack)}")
for item in stack:
    print(f"  Unclosed '{item[0]}' from {item[1]}:{item[2]} -> {item[3][:60]}")
