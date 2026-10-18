# Task18 validation — import lifecycle and review closure

Executed 2026-10-18 in this documentation repository. **Specification/model checks, not application implementation or formal review approval.** [ADR-012](../domain/11_IMPORT_LIFECYCLE_ADR.md), [proposed2.1 control](../contracts/artifacts/2.1.0/README.md) and [polling projection](../contracts/import-lifecycle/README.md) define the reviewable design.

## Exact commands and results

Run from the documentation repository root with Node v22.19.0 and compatible read-only Ajv8/ajv-formats tooling in the adjacent backend. The pinned validation/package.json dependencies can alternatively be installed in a clean environment. No dependencies were installed for this run.

```sh
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/import_lifecycle.test.cjs
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/artifact_contracts.test.cjs
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/ai_provider_gateway.test.cjs
python3 validation/check_documentation_links.py
python3 validation/check_documentation_contracts.py
git diff --check
python3 validation/import_lifecycle_postgres.py
```

- New import suite: **PASS AT-18-01 through AT-18-24**, each printed individually. Validates original v2 pipeline/decision fixture shapes, proposed2.1 control and projection schemas, plus negative version/closure/terminal/branching probes. Pure resolver input order is reversed to verify identical result/version. Does not invent an assertion total beyond 24 named scenarios.
- Existing Artifact v2 suite: **PASS 783 assertions**, ten Draft2020-12 schemas, 16 variants, 16 valid/12 invalid fixtures; registered stages/outcomes and all five ArtifactStatus values. Existing reference checks remain offline.
- Existing Gateway suite: **PASS AT-17-01–17**, strict schemas/examples and offline policy/adapter/lifecycle fixtures. No production provider integration.
- Documentation consistency checker: PASS enum/table/diagram, MVP Brand uniqueness/export exclusions, source relations, purge/revision presence, SQL reference, completeness weights/events and Markdown fences.
- Local Markdown link/anchor checker: **1091 destinations, 0 errors**. `git diff --check`: PASS, no output. External links and Mermaid rendering are not tested by these checks.
- Protected files: Python compared each tracked path in `contracts/artifacts/2.0.0`, `contracts/ai-provider/1.0.0` and `schema.prisma` to `git show HEAD:<path>`: **27 files byte-identical** (14 Artifact files, 12 Gateway files, Prisma). Prisma SHA256 unchanged: `a05d7b92d3a87b811f530131374fc1de3fb96cb294036dc39e70152923aa6385`. No Prisma changes/migration proposed; Prisma validation was not rerun. New2.1 is an explicit separate proposal, not an in-place change.

## PostgreSQL mechanism probes — actual execution

Installed PostgreSQL: **15.17 (Homebrew)**. `python3 validation/import_lifecycle_postgres.py` first returned nonzero during sandboxed initdb; it was rerun with approved escalation. Successful temporary cluster: `/private/tmp/ai-brand-os-task18-pg-i45stu4d`, TCP disabled, owner-only temporary directory, private Unix socket port64330. Script invokes local initdb/pg_ctl/psql, creates synthetic fixture tables/functions, runs probes and stops the cluster in finally. Actual output:

```text
PASS PG18-01 concurrent publication serialized by Brand row lock
PASS PG18-02 lost-ack replay returns original receipt after closure
PASS PG18-03 changed body under same key conflicts
PASS PG18-04 revision, required index and closure committed together
PASS PG18-05 expired worker fence rejected
PASS PG18-06 concurrent manual head invalidates expected revision
PASS PG18-07 projection failure rolls back decision, revision, head and closure
PASS PG18-08 open operation prevents proposed admission until closure
PASS: 8 isolated PostgreSQL mechanism probes; no application tables, queue library, authorization or provider integration tested.
CLUSTER_STOPPED
```

PG18-01 uses two actual psql sessions; the first publishes while holding the Brand row lock, the second serializes and observes CLOSED. PG18-06 separately checks stale expected revision. Fixture SQL has its own simplified primary keys/guards, not actual Prisma Artifact JSON uniqueness/authorization. PG18-08 tests a lock-protected active predicate; it does not prove a production Artifact admission scan or implement/approve D-IMP-02. PG18-07 raises a synthetic required-projection exception to verify rollback. No application DB, queue schema, provider, migration or existing database service was accessed. Temporary files/logs remain outside the repository; the test cluster is stopped.

## Coverage, pending branches and limits

| Cases | Actual fixture coverage |
| --- | --- |
| AT-18-01/02/03/04/05 | All accepted, mixed, undecided blocking, zero eligible, all rejected; exact distinct outcome/count/closure behavior |
| AT-18-06/18/19/23/24 | Partial + failed stage, authorized retry/recovery, exhaustion + absorbing closure, old/superseded attempts and Gateway failure without approval |
| AT-18-07/08/09/10 | Duplicate/conflicting decisions, order invariance/ETag, replay after lost acknowledgment/closure, concurrent manual-head conflict |
| AT-18-11/12/13/14/15 | Lease loss, stale fence, UI exit no-op, cross-tenant/unauthorized refusal, Brand/source lifecycle invalidation and safe closure |
| AT-18-16/17 | Proposed one-active interval simulation includes READY_FOR_REVIEW and releases only on terminal closure; default returns POLICY_REVIEW_REQUIRED, not invented Founder approval |
| AT-18-20/21/22 | Explicit confirmation needed to replace manual value, pending-discard branch blocked, optional index delay allowed while missing required projections blocks completion |

The resolver uses validated synthetic Artifact records and trusted publication/claim projections; its fixture authorization flags are not authentication. Original source truth/parent/ontology/actor/transaction evidence requires real shared reference validation. In-memory ReviewFixture receipts do not prove multi-replica uniqueness or race freedom. PostgreSQL probes verify mechanisms only, not the runtime handler or real queue/outbox. Actual queue claims, heartbeats, atomic enqueue, worker crashes, provider late responses, concurrent manual/import writers, historical migration, retention, tenant policy, production polling/caches and safe UI mapping require integration tests. No production SLA, review expiry period, privacy/legal compliance or customer result is claimed.

## Open approvals and acceptance assessment

D-AUD-07: **Specified — Pending Product/Architecture Review**, not Approved. Specification Delivery acceptance is met as a reviewable state/resolver/closure/admission/polling/version/recovery design with 24 executed offline cases and eight isolated SQL mechanism probes. Runtime acceptance and adoption are **not** established.

Formal gates: D-IMP-LC-01 Architecture/Engineering reviews proposed2.1 and legacy rollout; D-IMP-LC-02 Product/Founder/Operations and Legal/privacy for optional discard/expiry/cancel/partial policies; D-IMP-01/02/03 Founder choices remain pending; D-LEARN-02/D-AUD-08 facade/public transport, D-POL-01 retention, D-ARCH-01 atomic queue and R22 operational deadlines/budgets remain open. D-AUD-04 and D-AUD-02/provider-security reviews are unaffected. No approving identity/date is fabricated.

Before implementation sign-off: register mixed readers before writers, inventory legacy unresolved operations, implement actual Brand/control/ref/tenant guards and atomic publication/closure, select/review queue atomicity and budgets, then execute real concurrency/crash/revocation/deletion/polling tests. Do not enable conditional policies merely because fixtures pass.

## Changed files

Exact changed-file inventory (35 files):

```text
DATA_LIFECYCLE.md
DECISION_REGISTER.md
DOCUMENTATION_CHANGELOG.md
FINAL_CONSISTENCY_AUDIT.md
KNOWLEDGE_LEARNING_LIFECYCLE.md
KNOWLEDGE_PROVENANCE.md
README.md
SECURITY_THREAT_MODEL.md
contracts/artifacts/2.1.0/README.md
contracts/artifacts/2.1.0/example.json
contracts/artifacts/2.1.0/import_control.schema.json
contracts/artifacts/2.1.0/registry.json
contracts/artifacts/README.md
contracts/import-lifecycle/1.0.0/example.json
contracts/import-lifecycle/1.0.0/status.schema.json
contracts/import-lifecycle/README.md
domain/01_DOMAIN_MODEL.md
domain/02_ARTIFACT_MODEL.md
domain/04_DATABASE_DESIGN.md
domain/05_API_DESIGN.md
domain/09_LEAN_MVP_ARCHITECTURE_ADR.md
domain/10_AI_PROVIDER_GATEWAY_ADR.md
domain/11_IMPORT_LIFECYCLE_ADR.md
prd/01_BRAND_BRAIN_PRD.md
prd/03_KNOWLEDGE_IMPORT_PRD.md
services/01_INGESTION_SERVICE.md
services/02_DOCUMENT_PROCESSING_SERVICE.md
services/03_KNOWLEDGE_EXTRACTION_SERVICE.md
services/04_KNOWLEDGE_MANAGEMENT_SERVICE.md
validation/TASK18_RESULTS.md
validation/import_lifecycle.cjs
validation/import_lifecycle.fixtures.json
validation/import_lifecycle.test.cjs
validation/import_lifecycle_postgres.py
validation/package.json
```
