#!/usr/bin/env python3
"""Cross-document structural checks; never evidence of application behavior."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
errors = []

def require(condition, message):
    if not condition:
        errors.append(message)

schema = (ROOT / 'schema.prisma').read_text()
workspace = (ROOT / 'prd/02_AI_WORKSPACE_PRD.md').read_text()
match = re.search(r'enum MessageStatus\s*\{([^}]+)\}', schema)
require(match is not None, 'MessageStatus enum missing')
if match:
    states = re.findall(r'^\s*([A-Z_]+)\s*(?://.*)?$', match[1], re.M)
    expected = ['DRAFT', 'SUBMITTING', 'QUEUED', 'PREPARING_CONTEXT', 'GENERATING',
                'COMPLETED', 'FAILED', 'CANCELLED', 'TIMEOUT']
    require(states == expected, 'MessageStatus differs from reviewed nine-state contract')
    table = workspace.split('## Message (generation) states', 1)[1].split('```mermaid', 1)[0]
    require(re.findall(r'^\| ([A-Z_]+) \|', table, re.M) == states,
            'Workspace state table differs from schema')
    diagram = workspace.split('## Message (generation) states', 1)[1].split('```mermaid', 1)[1].split('```', 1)[0]
    require(all(re.search(r'\b' + state + r'\b', diagram) for state in states),
            'Generation diagram omits a schema state')

require(not re.search(r'\b(?:model ExportJob|enum ExportJobStatus|exportJobs)\b', schema),
        'Future export persistence has returned to MVP schema')
brand = re.search(r'model Brand\s*\{(.*?)\n\}', schema, re.S).group(1)
require(bool(re.search(r'organizationId\s+String\s+@unique', brand)),
        'Brand.organizationId must remain unique in MVP')
for model, field in [('Product', 'sourceArtifact'), ('Service', 'sourceArtifact'),
                     ('Audience', 'sourceArtifact'), ('Competitor', 'sourceArtifact')]:
    block = re.search(r'model ' + model + r'\s*\{(.*?)\n\}', schema, re.S).group(1)
    require(bool(re.search(r'\b' + field + r'\s+Artifact\?\s+@relation', block)),
            model + ' sourceArtifactId lacks actual Artifact relation')
require('model ConversationPurge {' in schema, 'Durable independent purge receipt missing')
require('model BrandBrainRevision {' in schema, 'Approved revision metadata missing')
require('array_length(tone_attributes, 1)' not in (ROOT / 'sql/MVP_CONSTRAINTS.sql').read_text(),
        'Unsafe tone array_length cardinality check returned')

metrics = re.sub(r'[ \t]+', ' ', (ROOT / 'PRODUCT_METRICS.md').read_text())
weight_table = metrics.split('## Completeness — calculation version 2', 1)[1].split('Mandatory weights total', 1)[0]
weights = [int(x) for x in re.findall(r'^\| [^|]+ \| (\d+) \|', weight_table, re.M)]
require(len(weights) == 16 and sum(weights[:14]) == 80 and sum(weights[14:]) == 20,
        'Completeness table does not contain 14 mandatory/2 optional slots totaling 80/20')
for name in ['OnboardingStarted', 'OutputPresented', 'QualifiedFirstValue', 'OnboardingWindowClosed']:
    require(bool(re.search(r'^\| ' + name + r' \|', metrics, re.M)), 'Missing metric event: ' + name)
for p in ROOT.rglob('*.md'):
    fence = None
    for n, line in enumerate(p.read_text().splitlines(), 1):
        m = re.match(r'^\s*(`{3,}|~{3,})', line)
        if m:
            if fence is None:
                fence = (m[1][0], len(m[1]), n)
            elif m[1][0] == fence[0] and len(m[1]) >= fence[1]:
                fence = None
    require(fence is None, f'{p.relative_to(ROOT)}: unclosed fence at {fence}')
if errors:
    print('\n'.join(errors))
    raise SystemExit(1)
print('PASS: enum/table/diagram, MVP uniqueness/exports, four source relations, purge/revisions, '
      'tone SQL reference, completeness weights, key events and Markdown fence balance')
