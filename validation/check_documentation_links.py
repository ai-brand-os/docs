#!/usr/bin/env python3
"""Check repository Markdown file destinations and GitHub-style heading fragments."""
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


def prose(text):
    return re.sub(r'^(`{3,}|~{3,})[^\n]*\n.*?^\1[^\n]*$', '', text,
                  flags=re.M | re.S)


def anchors(text):
    result, counts = set(), {}
    for heading in re.findall(r'^ {0,3}#{1,6}\s+(.+?)\s*#*\s*$', prose(text), re.M):
        heading = re.sub(r'\[([^]]+)\]\([^)]*\)', r'\1', heading)
        key = re.sub(r'[^\w\- ]', '', heading.lower()).replace(' ', '-')
        n = counts.get(key, 0)
        counts[key] = n + 1
        result.add(f'{key}-{n}' if n else key)
    result.update(re.findall(r'<a\s+(?:id|name)=[\"\x27]([^\"\x27]+)', text))
    return result


def check():
    errors, checked = [], 0
    for source in sorted(ROOT.rglob('*.md')):
        if '.git' in source.parts:
            continue
        text = prose(source.read_text())
        refs = {k.strip().lower(): v for k, v in re.findall(
            r'^ {0,3}\[([^]]+)\]:\s*<?([^\s>]+)>?', text, re.M)}
        urls = re.findall(r'(?<!!)\[[^]\n]*\]\(<?([^\s)>]+)>?(?:\s+[\"\x27].*?[\"\x27])?\)', text)
        for label, ref in re.findall(r'(?<!!)\[([^]\n]+)\]\[([^]\n]*)\]', text):
            key = (ref or label).strip().lower()
            if key not in refs:
                errors.append(f'{source.relative_to(ROOT)}: undefined reference [{key}]')
            else:
                urls.append(refs[key])
        urls.extend(refs.values())
        for url in urls:
            parts = urlsplit(url)
            if parts.scheme or parts.netloc:
                continue
            checked += 1
            target = (source.parent / unquote(parts.path)).resolve() if parts.path else source
            if not target.is_file():
                errors.append(f'{source.relative_to(ROOT)}: missing file {url}')
            elif parts.fragment and target.suffix == '.md' and unquote(parts.fragment) not in anchors(target.read_text()):
                errors.append(f'{source.relative_to(ROOT)}: missing heading {url}')
    for error in errors:
        print(error)
    print(f'{checked} local destinations checked; {len(errors)} errors')
    return bool(errors)


if __name__ == '__main__':
    sys.exit(check())
