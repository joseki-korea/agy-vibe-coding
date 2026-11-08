#!/usr/bin/env python3
"""Validate wiki structure, citations, file hashes and local links (stdlib only)."""
import hashlib,json,re,sys
from pathlib import Path
from urllib.parse import unquote, urlsplit
ROOT=Path(__file__).resolve().parent.parent
W=ROOT/'docs/wiki'; pages=sorted((W/'pages').rglob('*.md')); errors=[]
required={'id','title','summary','domain','tags','owner','status','created','updated','source','lang','sensitivity','related'}
index=W/'index.md'
def fail(p,msg): errors.append(f'{p.relative_to(ROOT)}: {msg}')
def parse(p):
    s=p.read_text(encoding='utf-8'); m=re.match(r'\A---\n(.*?)\n---\n',s,re.S)
    if not m: fail(p,'missing front matter'); return {},s
    try: meta=json.loads(m.group(1))
    except ValueError: fail(p,'front matter must be JSON-compatible YAML'); return {},s[m.end():]
    missing=required-meta.keys()
    if missing: fail(p,'missing metadata: '+', '.join(sorted(missing)))
    if str(meta.get('sensitivity','')).lower()=='secret': fail(p,'secret page forbidden')
    return meta,s[m.end():]
if not pages: errors.append('no pages')
if not index.exists(): errors.append('missing index')
idx=index.read_text(encoding='utf-8') if index.exists() else ''
for p in pages:
    meta,body=parse(p)
    rel=p.relative_to(W).as_posix()
    if not re.search(r'\]\((?:\./)?'+re.escape(rel)+r'(?:#[^)]*)?\)',idx): fail(p,'not linked from index')
    for line in body.splitlines():
        t=line.strip()
        if not t or t.startswith('#') or t.startswith('<!--'): continue
        if not re.search(r'\[source: [^\]]+#L\d+ @[0-9a-f]{8}\]',t): fail(p,'uncited content: '+t[:100])
    for path,num,sha in re.findall(r'\[source: (.+?)#L(\d+) @([0-9a-f]{8})\]',body):
        src=(ROOT/path).resolve()
        if not src.is_relative_to(ROOT) or not src.is_file(): fail(p,'missing source '+path); continue
        raw=src.read_bytes()
        if hashlib.sha256(raw).hexdigest()[:8]!=sha: fail(p,'stale source '+path)
        if not 1<=int(num)<=len(raw.splitlines()): fail(p,'invalid source line '+path)
for p in [index,W/'SCHEMA.md',W/'log.md',*pages]:
    if not p.exists(): errors.append('missing '+str(p.relative_to(ROOT))); continue
    if p not in pages: parse(p)
    text=p.read_text(encoding='utf-8')
    for target in re.findall(r'(?<!!)\[[^\]]+\]\(([^)]+)\)',text):
        u=urlsplit(target)
        if u.scheme or u.netloc or target.startswith('#'): continue
        dest=(p.parent/unquote(u.path)).resolve()
        if not dest.is_relative_to(ROOT) or not dest.exists(): fail(p,'broken link '+target)
        elif u.fragment and dest.is_file() and dest.suffix=='.md':
            headings=re.findall(r'^#{1,6}\s+(.+?)\s*#*\s*$',dest.read_text(encoding='utf8'),re.M)
            slugs=[re.sub(r'[^\w -]','',h.lower()).replace(' ','-') for h in headings]
            if unquote(u.fragment) not in slugs: fail(p,'broken anchor '+target)
if errors:
    print('\n'.join(errors)); print(f'FAIL ({len(errors)})'); sys.exit(1)
print(f'PASS ({len(pages)} pages)')
