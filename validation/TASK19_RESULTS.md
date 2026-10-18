# Task19 validation — source evidence and location mapping

Executed 2026-10-18 in this documentation repository with Node v22.19.0, Python3 and compatible read-only adjacent Ajv8/ajv-formats tooling. **Synthetic contract/model tests, not a deployed parser, source-storage gateway, security assessment or production integration.** [ADR-013](../domain/12_SOURCE_EVIDENCE_MAPPING_ADR.md) and [contracts](../contracts/source-evidence/README.md) are the canonical design.

## Exact commands and actual results

From the repository root:

```sh
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/source_evidence.test.cjs
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/artifact_contracts.test.cjs
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/ai_provider_gateway.test.cjs
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/import_lifecycle.test.cjs
python3 validation/check_documentation_links.py
python3 validation/check_documentation_contracts.py
git diff --check
git diff HEAD -- schema.prisma contracts/artifacts/2.0.0 contracts/artifacts/2.1.0 contracts/ai-provider/1.0.0 contracts/import-lifecycle
```

- Source evidence: **PASS AT-19-01 through AT-19-26**, individually printed. Three new source-evidence schemas plus two proposed Artifact2.2 wrappers compile locally with strict Draft2020-12/formats; valid manifest/binding/PDF/HTML/six-location examples and three negative shape examples. Additional composition, cycle, unknown availability, CRLF and invalid-surrogate probes pass. No fabricated assertion count beyond 26 named cases.
- Existing Artifact2.0: **PASS 783 assertions**, ten schemas, 16 variants, 16 valid/12 invalid fixtures, every registered stage/outcome and all five ArtifactStatus values. Reference tests remain offline.
- Existing Gateway1.0: **PASS 17 named scenarios** and schema/fixture probes; no actual provider.
- Existing import lifecycle: **PASS 24 named scenarios** plus proposed2.1 control/polling and negative contract checks. New attachments are not injected as pipeline/control inputs; evidence is a governance/reference prerequisite before frozen review.
- Documentation consistency: PASS enum/table/diagram, MVP Brand uniqueness/exports, source relations, purge/revision/SQL references, completeness weights/events and Markdown fences.
- Documentation links: **1168 local destinations checked, 0 errors**. `git diff --check`: PASS, no output. External URLs and Mermaid rendering are outside these checks.
- Protected-file diff: empty. A Python byte comparison to `git show HEAD:<path>` also passed for **34 tracked files**: Artifact2.0 (14), proposed2.1 (4), Gateway1.0 (12), import-lifecycle package (3), Prisma (1). Prisma SHA256 unchanged: `a05d7b92d3a87b811f530131374fc1de3fb96cb294036dc39e70152923aa6385`. No Prisma change/migration proposed; Prisma validation not rerun. Proposed Artifact2.2 is explicitly separate and review-gated.

The initial Unicode test expected eight code points for `€ ایران 😀`; execution correctly found **nine**, including two spaces. The fixture assertion was corrected to nine and the complete suite rerun successfully. Byte/code-point/UTF16 mismatch tests retain distinct expected units. No parser failure is concealed by that fixture correction.

## AT-19 coverage and evidence limits

| Scenarios | Executed fixture behavior |
| --- | --- |
| 01–05 | Exact plain-text round trip; actual Buffer/SHA256/strict UTF8 decoding; multibyte text; NFC cluster mapping; logical Persian/Arabic order; emoji UTF16 versus code-point mismatch and lone-surrogate rejection |
| 06–08 | Actual whitespace/NFC formatting with declared complete-unit maps; removed text excluded without bounding-range fabrication; merged chunk returns two disjoint original spans |
| 09–11 | Synthetic PDF page/parser/text-unit anchor membership; mismatched page rejected, ambiguous order explicitly unavailable, fake scanned source NO_TEXT_LAYER/no OCR |
| 12–14 | Synthetic HTML entity/text-unit map with captured DOM anchor; scripts absent from manually declared extraction; old capture digest stable despite different hypothetical live bytes; requested/final redirect URL identity retained and wrong display URL rejected |
| 15–16 | `$149` stays literal with currency=null, unsupported USD interpretation requires correction; ambiguous localized date retains literal/isoDate=null, no locale guess |
| 17–19 | Negative/out-of-bounds ranges, tampered retained bytes/digest and unauthorized/cross-tenant contexts reject |
| 20–22 | Normalized-only genuine text can warn rather than be rejected solely for imprecise original coordinates; deleted source blocks new imported publication; historical validation receipt stays immutable while live original availability becomes DELETED/UNAVAILABLE |
| 23–26 | Wrong parser version rejected; retry uses fresh parsed/candidate identity; stale/frozen/CLOSED results refused; mapping success remains PENDING_REVIEW; proposed2.2 wrappers require separate version reader while existing v2 candidate shape and import completion fixtures remain valid |

The fixture helper replays a narrow declared set of NFC/ASCII-space/CRLF/entity transformations and traces exact/whole-unit maps, including a two-edge composition. It does not validate arbitrary parser algorithms or reproduce actual PDF layout/DOM extraction. PDF fixture bytes explicitly say NOT-A-REAL-PDF; HTML/PDF anchors are manually supplied synthetic catalogs. These tests therefore do not establish real page extraction, HTML visibility, bbox rendering, DOCX parsing or original-byte↔glyph correctness. A digest only proves equality with captured fixture bytes, not publisher honesty or factual truth.

No PostgreSQL, queue, browser/PDF renderer, OCR, object store or provider was contacted for Task19. Task18's SQL mechanism results remain historical evidence, not rerun/source-mapping proof. No dependency installation, production migration, actual source deletion/backup restoration or customer experiment occurred. Actual authentication/reference ownership, selected-attempt loading, storage immutability, manifest/binding uniqueness, introducing-decision history lookup, retention races and hostile-parser limits require runtime tests. Parsed-object Ajv checks do not test raw duplicate-key rejection, transport byte limits or production egress controls.

## Before/after and version rationale

Before: normalized chunk offsets/loose location fields could not establish representation units/digests/maps or distinguish historical validation from live evidence availability. Normalizer wording allowed semantic date/currency changes.

After: immutable capture → pinned representations and transformation map → typed location/literal support → unique original-candidate evidence binding → independent governance/human publication, with current authorized availability over historical identity. Multi-span and lossy paths retain honest precision; no invented original page/offset/quote/meaning.

The exact closed-v2 gap is representation/map/locator/validation metadata and an immutable candidate-to-manifest binding. Proposed2.2 uses existing PROCESSING_INTERMEDIATE and KNOWLEDGE_CANDIDATE producers/types/table, not a second evidence authority or approval ledger. Approved fact data and original v2 evidence tuples are unchanged; historical lookup follows actual introducing decision/restore lineage. Readers precede writers; unresolved legacy mapping remains unavailable, corruption quarantines new publication, rollback keeps all mixed readers/history. Detailed migration/rollback/consumer rules are in the canonical contract.

## Approval gates and Specification Delivery assessment

**D-AUD-05: Specified — Pending Architecture/Product/Security Review; not Approved.** Specification Delivery acceptance is met as a typed, reviewable source/coordinate/map/policy/version/retention design with 26 executed synthetic scenarios. Runtime product readiness and actual format capability remain unverified.

- D-EVID-01: Architecture/Engineering + Processing/KM/source owners review the Artifact2.2 amendment, immutable uniqueness/history reference mechanism and reader/legacy/rollback rollout.
- D-EVID-02: Product/Architecture/Security reviews evidence warning/correction policy and format capabilities; Operations/Legal approve actual content handling/retention through D-POL-01.
- D-SEC-01, D-POL-01, D-AUD-03/06/07, D-IMP-LC-01 and D-AUD-08 remain open with existing named owners. Confidence/ontology/relationship/closure/API decisions are not settled by an evidence locator schema. Founder import/scope decisions are unchanged.

Implement next: reviewed parser/capture adapters and actual format corpus, immutable storage/digest lookup, bounded source/map validation, unique binding/governance transactions and historical fact lookup, safe authorized review read adapters, shared reference/retention synchronization, then real stale/tenant/deletion/crash tests. No repaired evidence may silently replace frozen candidates, reopen CLOSED imports or approve knowledge.

## Changed files

Exact changed-file inventory (43 files):

```text
DATA_LIFECYCLE.md
DECISION_REGISTER.md
DOCUMENTATION_CHANGELOG.md
FINAL_CONSISTENCY_AUDIT.md
KNOWLEDGE_PROVENANCE.md
README.md
SECURITY_THREAT_MODEL.md
contracts/artifacts/2.2.0/README.md
contracts/artifacts/2.2.0/evidence_binding.example.json
contracts/artifacts/2.2.0/evidence_binding.schema.json
contracts/artifacts/2.2.0/registry.json
contracts/artifacts/2.2.0/representation_manifest.example.json
contracts/artifacts/2.2.0/representation_manifest.schema.json
contracts/artifacts/README.md
contracts/source-evidence/1.0.0/binding.schema.json
contracts/source-evidence/1.0.0/examples/binding.json
contracts/source-evidence/1.0.0/examples/html-location.json
contracts/source-evidence/1.0.0/examples/invalid.json
contracts/source-evidence/1.0.0/examples/locations.json
contracts/source-evidence/1.0.0/examples/manifest.json
contracts/source-evidence/1.0.0/examples/pdf-location.json
contracts/source-evidence/1.0.0/location.schema.json
contracts/source-evidence/1.0.0/manifest.schema.json
contracts/source-evidence/1.0.0/registry.json
contracts/source-evidence/README.md
domain/01_DOMAIN_MODEL.md
domain/02_ARTIFACT_MODEL.md
domain/04_DATABASE_DESIGN.md
domain/05_API_DESIGN.md
domain/11_IMPORT_LIFECYCLE_ADR.md
domain/12_SOURCE_EVIDENCE_MAPPING_ADR.md
prd/01_BRAND_BRAIN_PRD.md
prd/03_KNOWLEDGE_IMPORT_PRD.md
services/01_INGESTION_SERVICE.md
services/02_DOCUMENT_PROCESSING_SERVICE.md
services/03_KNOWLEDGE_EXTRACTION_SERVICE.md
services/04_KNOWLEDGE_MANAGEMENT_SERVICE.md
validation/TASK19_RESULTS.md
validation/package.json
validation/source_evidence.cjs
validation/source_evidence.fixtures.json
validation/source_evidence.test.cjs
validation/source_evidence_fixture.cjs
```
