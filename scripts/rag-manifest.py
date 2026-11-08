#!/usr/bin/env python3
"""Create a deterministic local, heading-based Markdown inventory; no embeddings."""
import fnmatch, hashlib, json, os, re
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
os.chdir(ROOT)
patterns = [x.strip() for x in Path('.ragignore').read_text().splitlines() if x.strip() and not x.lstrip().startswith('#')]
def ignored(path):
    s = path.as_posix()
    for pattern in patterns:
        pattern = pattern.lstrip('/')
        if pattern.endswith('/'):
            if any(fnmatch.fnmatch(part, pattern[:-1]) for part in path.parts[:-1]): return True
        elif fnmatch.fnmatch(s, pattern) or fnmatch.fnmatch(path.name, pattern): return True
    return False
def metadata(text):
    if not text.startswith('---\n'): return {}
    end = text.find('\n---', 4)
    if end < 0: return {}
    block = text[4:end]
    try: return json.loads(block)
    except (ValueError, TypeError):
        return dict(re.findall(r'^([\w-]+):\s*["\']?([^\n"\']+)', block, re.M))
records = []
for p in sorted(ROOT.rglob('*.md')):
    p = p.relative_to(ROOT)
    if ignored(p) or p.is_symlink(): continue
    try: text = p.read_text(encoding='utf-8')
    except (UnicodeError, OSError): continue
    meta = metadata(text)
    sensitivity = str(meta.get('sensitivity','unknown')).strip()
    if sensitivity.lower() == 'secret': continue
    digest = hashlib.sha256(p.read_bytes()).hexdigest()[:8]
    lines = text.splitlines(); headings=[]; fenced=False; front=False
    for n, line in enumerate(lines,1):
        if n == 1 and line == '---': front=True; continue
        if front:
            if line == '---': front=False
            continue
        if re.match(r'^\s*(```|~~~)',line): fenced=not fenced; continue
        if not fenced:
            m=re.match(r'^#{1,6}\s+(.+?)\s*#*\s*$',line)
            if m: headings.append((n,m.group(1)))
    if not headings: headings=[(1,'(document)')]
    tags=meta.get('tags',[])
    if not isinstance(tags,list): tags=[str(tags).strip()] if str(tags).strip() else []
    for n, heading in headings:
        records.append(dict(id=f'{p.as_posix()}#L{n}',path=p.as_posix(),heading=heading,sha8=digest,tags=tags,lang=str(meta.get('lang','unknown')).strip(),sensitivity=sensitivity))
out=Path('docs/_meta/rag-manifest.jsonl'); out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(''.join(json.dumps(x,ensure_ascii=False,sort_keys=True)+'\n' for x in records),encoding='utf-8')
print(f'{len(records)} chunks')
