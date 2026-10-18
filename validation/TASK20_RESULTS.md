# Task20 validation — ontology relationships and lifecycle reconstruction

Executed 2026-10-19 in this documentation repository. **Offline contract/reference-model checks, not runtime implementation or Architecture/Product approval.** [ADR-014](../domain/13_ONTOLOGY_RELATIONSHIP_PERSISTENCE_ADR.md) contains the complete 28-row ontology-to-storage matrix; [contracts](../contracts/ontology-relations/README.md) are the canonical versioned representation.

## Commands and results

The executed commands/results are recorded below. No Prisma/DDL changes are proposed, so no Task20 Prisma migration or PostgreSQL constraint run is required or claimed. Earlier SQL results remain historical evidence. The package root supplies existing compatible read-only Ajv tooling; no dependency installation.

From repository root (Node v22.19.0):

```sh
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/ontology_relations.test.cjs
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/artifact_contracts.test.cjs
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/ai_provider_gateway.test.cjs
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/import_lifecycle.test.cjs
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/source_evidence.test.cjs
python3 validation/check_documentation_links.py
python3 validation/check_documentation_contracts.py
git diff --check
```

- **Ontology: PASS AT-20-01–30**, individually printed. Seven new Draft2020-12 schemas compile locally under strict Ajv/formats; three successful Artifact2.3 variant fixtures and five negative semantic patches validate/reject as intended. An imported-edge fixture uses an existing Product.description field with synthetic literal source/binding and actual Source Evidence mapping validation; it does not invent a relationship field. Additional probes cover restore-new-revision metadata/approval backlinks, 32-node truncation, selected-context revision matching, stale support, Brand archival, malformed origins/unknown fields/uppercase UUIDs and foreign-scope idempotent receipt replay.
- **Artifact2.0: PASS 783 assertions**, ten schemas, 16 variants, 16 valid/12 invalid fixtures, every registered stage/outcome and all five ArtifactStatus values.
- **Gateway: PASS 17 named offline scenarios.** No provider calls.
- **Import lifecycle: PASS 24 named offline scenarios** and original/proposed control/polling fixtures. Existing closure remains COMPLETED in the relationship compatibility test.
- **Source evidence: PASS 26 named synthetic scenarios**, existing schema/map/parser-anchor fixtures. No real parsers/storage.
- **Documentation consistency: PASS** enum/table/diagram, MVP Brand uniqueness/exports, four source relations, purge/revisions, tone SQL reference, completeness weights/events and fence balance.
- **Links: PASS — 1233 local destinations checked, zero errors.** External URLs and Mermaid rendering are outside this checker.
- **Whitespace: PASS**, no `git diff --check` output.
- **Protected contracts/Prisma: 50 tracked files compared byte-for-byte with HEAD; zero differences.** Includes Artifact2.0/2.1/2.2, Gateway1.0, Source Evidence1.0, import-lifecycle and schema.prisma. Prisma SHA256 remains `a05d7b92d3a87b811f530131374fc1de3fb96cb294036dc39e70152923aa6385`.

Protected comparison command (also verifies Prisma digest):

```sh
python3 - <<'PY'
import subprocess, pathlib, hashlib
roots = ['schema.prisma', 'contracts/artifacts/2.0.0',
         'contracts/artifacts/2.1.0', 'contracts/artifacts/2.2.0',
         'contracts/ai-provider/1.0.0', 'contracts/source-evidence/1.0.0',
         'contracts/import-lifecycle']
files = subprocess.check_output(['git', 'ls-files', '--', *roots], text=True).splitlines()
changed = [f for f in files if pathlib.Path(f).read_bytes() !=
           subprocess.check_output(['git', 'show', 'HEAD:' + f])]
print(len(files), changed)
assert not changed
print(hashlib.sha256(pathlib.Path('schema.prisma').read_bytes()).hexdigest())
PY
```

## Acceptance coverage and limits

| Cases | Executed offline checks |
| --- | --- |
| 01–05 | Existing scoped Org/Brand/Voice ownership, Product and Service TARGETS snapshot persistence/restore representation, USES default-off/reviewed-rule branch |
| 06–11 | Tuple identity/duplicates, inverse registry/view non-storage, cross-tenant/Brand, dangling endpoint and Reserved-pair rejection |
| 12–16 | Incomplete draft is valid, ready global active member cardinalities, human authority, model self-approval rejection, stale head rejection |
| 17–22 | Exact historical graph preview, separate new revision restore metadata/backlinks, canonical fallback despite delayed/orphan cache, archived endpoint filtering, rename stability and fresh recreation identity |
| 23–26 | Task19 real fixture-byte mapping validator, legacy NOT_RECORDED/version gate, manual no Document, imported predicate actual approved-field reference/evidence-binding lookup and negative support/tenant scenarios |
| 27–30 | Unapproved proposal exclusion, mixed revision rejection, late/duplicate publication receipt replay without extra commit, unchanged old schemas and closed import fixture |

The executable helper is a reference model, not a production repository/service. Ownership, approval decisions, candidate-to-fact linkage and reviewed policy are trusted synthetic lookup fixtures. The imported description and its audience are fictional; human predicate confirmation is simulated, not model-established truth. Schema checks and cross-record checks are separate layers. Restore preview/new revision construction are tested without executing a SQL transaction. Ready tests cover structural cardinality only; the separate existing metrics contract still owns all mandatory fact validity/readiness conditions. Optional cache is deliberately bypassed for canonical fallback; this proves the safety rule, not an optimized projection implementation. Inverse non-storage is checked through the registry/explicit-edge rejection, not a deployed provenance endpoint. Synthetic human/policy flags are not acceptable server authorization inputs.

No PostgreSQL foreign-key/transaction/locking, real authorization, queue/outbox/crash recovery, object store, provider, legal erasure, parser or production concurrency test was performed. Real constraints include approval history and source binding lookup, stable retained identity ownership, scope-safe receipt uniqueness, atomic projections/head/receipt/restore, lifecycle authorization/deletion races, transport duplicate-key/byte limits and measured traversal budgets. No runtime implementation, infrastructure migration, approved policy or customer-facing relationship feature is claimed.

## Decisions, compatibility and delivery assessment

**D-AUD-06: Specified — Pending Architecture/Product Review.** Specification Delivery acceptance is met as a reviewable contract/mapping/lifecycle/reconstruction design with executable offline cases. Formal adoption and runtime MVP readiness are not established.

- **D-REL-01 — Architecture/Engineering + KM/Context:** Artifact2.3 necessity, exact reader/writer dispatch, historical unknown graph handling, trusted cross-record integrity, inventory/migration and rollback. No Prisma/SQL migration; deploy readers before gated writers, never fabricate old edges or downgrade by stripping graph data.
- **D-REL-02 — Product/Architecture; Founder for scope/UI:** TARGETS optional cardinality, explicit predicate review/transport, COMPETES targets, optional USES derivation and bounded retrieval. Default disabled; no scope approval invented.
- **D-REL-03 — Product/Architecture/Operations; Legal for erasure:** archive/reactivate versus existing removal and lawful retained identity behavior. Archive controls remain disabled.
- D-AUD-03/05/07/08, D-EVID-01/02, D-IMP-LC-01, D-POL-01, D-ARCH-01 and all Founder decisions retain their prior status/owners.

Canonical changes: ownership uses existing FKs; approved explicit edges use the one immutable snapshot; evidence/typed fact views are computed; USES is gated derivation; Reserved is rejected. Restore uses recorded tuples with stable IDs in a new approved revision, never guesses. Historical graph absence blocks automatic reset. Context pins one approved revision, filters current visibility/stale support, bounds expansion and falls back to authority. No graph database or independent graph authority.

Recommended implementation order: review semantics/contracts; inventory retained identities and historical readers; implement trusted reference/approval/source validation; implement atomic publication/restore/idempotency; integrate pinned retrieval and canonical fallback; run real SQL/security/queue/retention/crash tests; enable reviewed writers gradually. Risks/debt: JSON referential integrity, source/identity erasure versus lawful history, legacy unknown graphs, pending transport/UI semantics, unmeasured bounds and cache costs.

## Changed files

Inventory follows; paths are repository-relative. Earlier version bundles and Prisma are absent because unchanged.

Exact inventory: **38 files**.

```text
DATA_LIFECYCLE.md
DECISION_REGISTER.md
DOCUMENTATION_CHANGELOG.md
FINAL_CONSISTENCY_AUDIT.md
KNOWLEDGE_LEARNING_LIFECYCLE.md
KNOWLEDGE_PROVENANCE.md
README.md
SECURITY_THREAT_MODEL.md
contracts/artifacts/2.3.0/README.md
contracts/artifacts/2.3.0/approved_snapshot.schema.json
contracts/artifacts/2.3.0/context.schema.json
contracts/artifacts/2.3.0/examples/valid.json
contracts/artifacts/2.3.0/registry.json
contracts/artifacts/2.3.0/relationship_commit.schema.json
contracts/artifacts/README.md
contracts/ontology-relations/1.0.0/commit.schema.json
contracts/ontology-relations/1.0.0/context-reference.schema.json
contracts/ontology-relations/1.0.0/edge.schema.json
contracts/ontology-relations/1.0.0/examples/approved-graph.json
contracts/ontology-relations/1.0.0/examples/invalid.json
contracts/ontology-relations/1.0.0/graph.schema.json
contracts/ontology-relations/1.0.0/registry.json
contracts/ontology-relations/README.md
domain/01_DOMAIN_MODEL.md
domain/02_ARTIFACT_MODEL.md
domain/03_BUSINESS_ONTOLOGY.md
domain/04_DATABASE_DESIGN.md
domain/05_API_DESIGN.md
domain/13_ONTOLOGY_RELATIONSHIP_PERSISTENCE_ADR.md
prd/01_BRAND_BRAIN_PRD.md
services/03_KNOWLEDGE_EXTRACTION_SERVICE.md
services/04_KNOWLEDGE_MANAGEMENT_SERVICE.md
services/05_CONTEXT_ENGINE.md
validation/TASK20_RESULTS.md
validation/ontology_relations.cjs
validation/ontology_relations.fixtures.cjs
validation/ontology_relations.test.cjs
validation/package.json
```
