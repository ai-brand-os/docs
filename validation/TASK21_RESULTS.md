# Task21 validation — taxonomies and knowledge quality

Date: 2026-10-19. **Offline contract/reference-model verification, not runtime implementation, empirical calibration or formal approval.** [ADR-015](../domain/14_KNOWLEDGE_QUALITY_AND_TAXONOMY_ADR.md) contains the field/indicator audit, company-size option matrix, formulas/missing-data/persistence/migration rules and review owners. [Canonical contracts](../contracts/knowledge-quality/README.md) contain registries, schemas, reference algorithms and positive/negative fixtures.

## Commands and observed results

Actual executed results are recorded below. No Prisma or SQL changes are proposed; Task21 therefore does not run a migration/constraint test or claim deployed schema change. Current required KnowledgeIndex integer and company-size enum limitations are explicit D-KQ-01/03 adoption gates. No sentinel or historical relabeling is permitted.

Executed from repository root with Node v22.19.0 and existing read-only adjacent Ajv8/ajv-formats tooling:

```sh
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/knowledge_quality.test.cjs
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/artifact_contracts.test.cjs
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/ai_provider_gateway.test.cjs
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/import_lifecycle.test.cjs
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/source_evidence.test.cjs
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/ontology_relations.test.cjs
python3 validation/check_documentation_links.py
python3 validation/check_documentation_contracts.py
git diff --check
```

| Check | Actual result / scope |
| --- | --- |
| Knowledge quality | **PASS AT-21-01–30**, individually printed; four new Draft2020-12 schemas compile locally. Three valid assessment fixtures, one Artifact2.4 wrapper and five invalid score patches; explicit non-finite/range/fraction/rounding/custom-weight/no-input/NA/unreviewed/null-versus-absent/tampered-explanation probes. Additional disabled rank fallback, reviewed branch, attachment producer/tenant/publication operation/authorization binding, taxonomy-gated hash/replay and unchanged closed-import projection probes pass |
| Artifact2.0 | **PASS783 assertions**, ten schemas,16 variants,16 valid/12 invalid fixtures, all five ArtifactStatus values and registered outcomes |
| Gateway | **PASS17 named offline scenarios**, no real provider |
| Import | **PASS24 named offline scenarios** and existing proposed control/polling fixtures |
| Source Evidence | **PASS26 named synthetic mapping/locator/availability scenarios**, no real parser/storage |
| Ontology Relationships | **PASS30 named offline scenarios** plus restore/truncation/canonical fallback/reference probes |
| Documentation consistency | **PASS** enum/table/diagram, one-Brand/exports, source relations, purge/revisions, SQL references, completeness weights/events, balanced fences |
| Documentation links | **PASS1308 local destinations,0 errors**; external URLs and Mermaid rendering are outside this script |
| Whitespace | **PASS**, git diff --check has no output |
| Protected versions/schema | **64 tracked files compared byte-for-byte with HEAD,0 changes**, including Artifact2.0–2.3, Gateway1, Source Evidence1, Ontology Relationships1, import-lifecycle, Prisma and existing SQL supplement |

Protected comparison command:

```sh
python3 - <<'PY'
import subprocess, pathlib, hashlib
roots = ['schema.prisma', 'sql/MVP_CONSTRAINTS.sql',
         'contracts/artifacts/2.0.0', 'contracts/artifacts/2.1.0',
         'contracts/artifacts/2.2.0', 'contracts/artifacts/2.3.0',
         'contracts/ai-provider/1.0.0', 'contracts/source-evidence/1.0.0',
         'contracts/ontology-relations/1.0.0', 'contracts/import-lifecycle']
files = subprocess.check_output(['git', 'ls-files', '--', *roots], text=True).splitlines()
changed = [p for p in files if pathlib.Path(p).read_bytes() !=
           subprocess.check_output(['git', 'show', 'HEAD:' + p])]
print(len(files), changed)
assert not changed
print(hashlib.sha256(pathlib.Path('schema.prisma').read_bytes()).hexdigest())
PY
```

Prisma SHA256 remains `a05d7b92d3a87b811f530131374fc1de3fb96cb294036dc39e70152923aa6385`. No dependency install, application change, SQL migration or infrastructure deployment occurred.

## Taxonomy before/after and formulas

| Item | Historical/current | Proposed contract / adoption gate |
| --- | --- | --- |
| Company Size | 1–5,6–20,21–50,50+; boundary50 overlaps | Recommend1–5,6–20,21–49,50+; A/B/C compared in ADR. D-KQ-01 pending, old labels/values remain unchanged; new SIZE_21_49 cannot be projected into old Prisma enum |
| Industry / Tone / Primary Goal | Locked16/12/5 exact Prisma keys and labels | Unchanged; registry keys compared directly with Prisma in tests |
| Primary Region | Unspecified enum in PRD/ontology; String in Prisma | Proposed constrained market prose, not a fixed list/country/address/locale; D-KQ-02 |
| Primary Language | Unspecified enum/String | Proposed one confirmed canonical registered BCP47 tag with reviewed output profile; no multilingual-management feature; D-KQ-02 |
| Country / formatting locale / detected source language | No independent country/locale business fields; document/chunk language string/null | Country uses ISOalpha2 only where country is actually meant; locale only formatting; source detection not output preference. Offline profile is deliberately representative, not complete ISO/IANA data or deployed supported-language list |
| Missing confidence | Required index integer; old Artifact confidence null/null possible but unspecified | Six states with null for non-KNOWN; proposed2.4 records exact method/input/policy/reasons. Conditional no-score index omission/direct snapshot lookup requires D-KQ-03; no sentinel/nullability change now |

Explicit candidate formulas (all disabled pending D-KQ-04/05):

- Extraction=`roundHalfUp(100×passed/applicable)` for literal preservation, classification validity, parsing ambiguity and binding resolution.
- Knowledge=`roundHalfUp(100×passed/applicable)` for resolved support/interpretation, current explicit verification and independent source-policy acceptability. Known entity projection=min of applicable field scores only when all are known.
- Context=`roundHalfUp(100×distinct eligible selected∩required refs/distinct required refs)` for a real server-produced request manifest. Coverage proxy only.
- Evidence fidelity and Source Trust remain categorical; no numeric mapping to accuracy, static trust percentages, recursive confidence dependency or arbitrary ML coefficients.
- Completeness retains calculation2 80/20 weights; readiness, human approval, runtime request gates and activation remain separate. No new quality/activation threshold.

Known0 is distinct from UNKNOWN/NOT_EVALUATED/UNAVAILABLE/NOT_APPLICABLE/INVALID, which require null and reasons. Missing required JSON fields reject. Null company size remains incomplete draft, not an invented enum. Half-up is exact rational integer arithmetic (2/3→67,1/8→13); no floating probability interpretation. Full signal derivation table is in the canonical contract. Rank/1.0 uses required manifest/requested entity/literal-token matches then UTF8 typed identity only after review; default fallback is identity order. No semantic, trust or compression-quality score is fabricated.

## Acceptance coverage and honest limits

| Cases | Executed offline coverage |
| --- | --- |
| 01–06 | Headcount20/21/49/50/51 proposed bucket boundaries; original21–50 preserved; explicit unknown and invalid0/negative/fraction/nonfinite/unsafe input |
| 07–14 | Representative country/tag canonicalization, invalid/unsupported/alias input, market≠locale, exact locked enum preservation and unsupported controlled value rejection |
| 15–20 | Distinct extraction/support meanings and formulas, no approval/truth inference, unknown no-zero/index omission, unavailable/missing input behavior, deterministic replay/hash/rounding |
| 21–24 | Unknown future formula fails while old result remains unchanged; exact offset absence warns without numeric falsehood; actual Source Evidence synthetic currency ambiguity requires correction; no recursive Source Trust |
| 25–30 | High completeness/support cannot bypass missing mandatory/approval; deterministic rank ties; tenant/Brand and revision/formula guards; old Artifact/example schemas and separate full regression suites remain compatible |

These are deliberately narrow conformance models. PASS is not proof the service correctly derives literal/support/verification/policy checks from a real source, nor that a source or approved fact is true. Scope, policy-decision, approved fact and subject metadata are trusted synthetic lookup fixtures. Human approval independence is checked through separate gate/data contracts, not a deployed workflow. Completeness/readiness tests exercise gate separation and existing weight definitions; they are not a new full metrics implementation. Source Evidence tests use manually declared fixture bytes/maps, not real PDF/HTML parsers. Imported/persistent/provider/queue integration is not exercised.

BCP47/country tests use a small pinned test profile and explicit lookup/alias rules. They do not demonstrate complete IANA/ISO handling or provider support for every listed language. Actual authoritative registry snapshot/digest, complete validation/canonicalization/deprecation implementation, Unicode/ICU/runtime pin, supported output profile and approved historical conversion require D-KQ-02. No fixed Region list or new country/locale form was introduced.

Runtime gaps: trusted signal derivation, real source-policy/approval lookup, tenant-safe compound assessment uniqueness, atomic publication/assessment/conditional-index/head/receipt operations, actual entity fallback query latency, deletion/retention races, transport byte/duplicate-key checks, legacy inventory/reader rollout/rollback and future enum/nullable migrations if selected. Required Organization enums still cannot persist unknown draft fields; no default or fabricated value is introduced. No real PostgreSQL, auth server, queue, provider, object store or new persistence service was tested.

Empirical gaps: procedural pass rate/coverage is not calibrated probability, objective factual accuracy, semantic relevance or measured compression quality. Evaluate real representative tasks with independently adjudicated extraction/support/response errors, counterexamples and source truth checks; compare editing time and error types separately from these proxies. Any future statistical calibration/weights/thresholds need held-out evaluation, provenance of the dataset and new reviewed formula versions. No participants, sample sizes, accuracy uplift or business benefit are invented. D-LEARN-01/D-ARCH-02 retain evaluation and performance ownership.

## Decisions, compatibility and delivery assessment

**D-AUD-03: Specified — Pending Product/Architecture Review; not Approved.** Specification Delivery acceptance is met as a versioned reviewable taxonomy/scoring/missing-state/persistence proposal with reproducible offline tests. Adoption and runtime/empirical readiness are not established.

- **D-KQ-01 — Product/Architecture:** company boundary A/B/C, labels and explicit historical confirmation; recommend A, disabled new writes until actual enum migration review.
- **D-KQ-02 — Product/Architecture:** market/language/profile/country/locale semantics, actual standards inventory/aliases/output support and historical conversion; no multilingual feature.
- **D-KQ-03 — Architecture/Engineering + KM/Context/Operations:** proposed2.4 metadata/reference/uniqueness/publication and conditional index/snapshot fallback instead of sentinel; unknown draft limitation; inventory/rollback, potential future nullable/enum migration separately.
- **D-KQ-04 — Product/Architecture/Security:** procedural check formulas, applicability/source policy and review messaging; disabled, no auto-approval or accuracy claim.
- **D-KQ-05 — Product/Architecture/Context owner:** registered request manifests, deterministic ranking/coverage proxy and explainability; disabled, no activation/quality gate.

All Founder decisions, D-REL-01/02/03, D-EVID-01/02, D-IMP-LC-01/02, D-POL-01, D-LEARN-01/02, D-ARCH-01/02, D-AUD-01/08, D-GW-01 and D-SEC-01/02/03 retain prior status/owners. Task20 status was already synchronized in all three requested locations.

Migration: read/inventory historical values without reinterpretation; deploy exact-version readers and trusted source/policy/subject lookup; obtain Product/Architecture approvals; adopt gated field/storage writers; append new confirmed revisions and assessments. Do not backfill fabricated scores/inputs/approval dates, rewrite old snapshots or recalculate old scores in place. Existing Artifact confidence maps non-KNOWN to null/null, known to actual assessment ref; full new states require2.4. Rollback disables writers, retains mixed readers or denies affected paths safely; no stripping metadata, size-key relabeling, pointer rewind or invented index default. Existing range SQL/required columns remain unchanged.

## Changed files

Exact inventory: **43 files**. Paths below are relative to this repository.

```text
BIBLE/02_PRODUCT_BIBLE.md
BIBLE/03_ENGINEERING_BIBLE.md
DATA_LIFECYCLE.md
DECISION_REGISTER.md
DOCUMENTATION_CHANGELOG.md
FINAL_CONSISTENCY_AUDIT.md
KNOWLEDGE_LEARNING_LIFECYCLE.md
KNOWLEDGE_PROVENANCE.md
MVP_SCOPE.md
PRODUCT_METRICS.md
README.md
SECURITY_THREAT_MODEL.md
contracts/artifacts/2.4.0/README.md
contracts/artifacts/2.4.0/quality_assessment.example.json
contracts/artifacts/2.4.0/quality_assessment.schema.json
contracts/artifacts/2.4.0/registry.json
contracts/artifacts/README.md
contracts/knowledge-quality/1.0.0/assessment.schema.json
contracts/knowledge-quality/1.0.0/examples/invalid.json
contracts/knowledge-quality/1.0.0/examples/valid.json
contracts/knowledge-quality/1.0.0/field-value.schema.json
contracts/knowledge-quality/1.0.0/reference.cjs
contracts/knowledge-quality/1.0.0/score.schema.json
contracts/knowledge-quality/1.0.0/scores.json
contracts/knowledge-quality/1.0.0/standards-fixture.json
contracts/knowledge-quality/1.0.0/taxonomies.json
contracts/knowledge-quality/README.md
domain/01_DOMAIN_MODEL.md
domain/02_ARTIFACT_MODEL.md
domain/03_BUSINESS_ONTOLOGY.md
domain/04_DATABASE_DESIGN.md
domain/05_API_DESIGN.md
domain/14_KNOWLEDGE_QUALITY_AND_TAXONOMY_ADR.md
prd/01_BRAND_BRAIN_PRD.md
prd/03_KNOWLEDGE_IMPORT_PRD.md
services/02_DOCUMENT_PROCESSING_SERVICE.md
services/03_KNOWLEDGE_EXTRACTION_SERVICE.md
services/04_KNOWLEDGE_MANAGEMENT_SERVICE.md
services/05_CONTEXT_ENGINE.md
validation/TASK21_RESULTS.md
validation/knowledge_quality.fixtures.cjs
validation/knowledge_quality.test.cjs
validation/package.json
```
