# Task16 — Artifact contract validation results

Recorded: **2026-10-17**. Owner: Architecture / Engineering review pending. This is local schema/conformance evidence, not approval of D-AUD-04 or application implementation. [Canonical contracts](../contracts/artifacts/README.md) contain schema inventory, reference/lifecycle rules, examples and migration/compatibility requirements.

## Delivered contract

- Ten locally registered Draft2020-12 JSON Schemas: envelope, common nested definitions and one payload schema for each of the eight existing ArtifactTypes.
- Exact Prisma enum inventory: eight ArtifactTypes, five ArtifactStatuses and six ProducingServices, compared automatically to schema.prisma.
- Registry of16 variants and every supported stage/outcome. Successful/pending/partial/failed/cancelled/timeout apply where defined; approved_snapshot/candidate_decision/manual_commit are success only, publication_attempt is non-success only.
- Full envelope metadata versus payload separation; closed nested results, typed fields, required/optional/null rules, operation/stage invocation/checkpoint identities, error codes and reference semantics.
- Manual initialization/edit/verify/restore through existing KNOWLEDGE_CANDIDATE manual_commit and APPROVED_KNOWLEDGE snapshot/revision publication, with no invented source Document or extraction job.
- Sixteen complete valid examples, twelve concrete invalid examples and a synthetic authorized-lookup catalog. Every ID/business/provider/person is fictional fixture data.

## Executed commands and results

From the docs repository:

```sh
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats \
  node validation/artifact_contracts.test.cjs
python3 validation/check_documentation_links.py
python3 validation/check_documentation_contracts.py
git diff --check
../backend/node_modules/.bin/prisma validate --schema schema.prisma
```

Environment: Node22.19.0; Ajv8.20.0; ajv-formats3.0.1; installed Prisma7.8.0. Ajv8 was resolved read-only through the explicitly selected adjacent ajv-formats package (its dependency tree includes Ajv8); the adjacent top-level Ajv6 was not used. Default/system and bundled Python lacked jsonschema, so no Python JSON Schema pass is claimed. No dependency installation, application code/config edit or remote schema fetch occurred. [validation/package.json](package.json) pins dev-only validator dependencies for standalone `npm --prefix validation test` after installing them; the executed command above instead reuses existing compatible tooling. Local conformance does not prove future dependency installs or transitive lockfile reproduction.

| Check | Actual result / limit |
| --- | --- |
| Draft2020-12 schema meta-validation and strict compilation | PASS: all10 schemas registered locally with formats; no coercion, default filling or removal of unknown properties |
| Artifact conformance suite | **PASS: 783 assertions; 16 variants; 16 valid / 12 invalid fixtures** |
| Stage/outcome and lifecycle coverage | Every registered stage and allowed operation outcome exercised; all five ArtifactStatus values tested. PENDING/PARTIAL/SUCCEEDED record validation/history is independent of captured producer outcome; INVALID consumer rejection does not require mutating a successful payload. Failure/cancel/timeout diagnostics require INVALID. Approved snapshots are success only. |
| Structural negative cases | Unknown type/variant/stage/version/property, wrong producer, wrong status/error combination, false final response validation, forged extracted approver, imported manual-only tone, missing location reason, bad UUID/time, metadata in wrong layer, pending result data and zero-based attempt counter rejected; confirm/edit/reject and INITIALIZE/MANUAL_EDIT/VERIFY/RESTORE branches exercised, including empty explicitly cleared snapshot shape with readiness still separate |
| Offline reference checks | PASS against synthetic records: foreign envelope/nested tenant, missing source, wrong Artifact reference type, mismatched source Document/chunk, duplicate/nonmember facts, deleted Conversation, mismatched prompt/context/response versions, missing pinned fact and candidate endpoint. Manual commit/snapshot work with all source Document/import records removed. |
| Compatibility/idempotency examples | PASS: explicit legacy header aliases/read-only opaque classification, unsupported versions and invalid legacy status; sorted DTO hashing, equivalent-request replay and changed-body conflict. No automatic fabricated v1→v2 payload conversion. |
| Local Markdown destinations / headings | Final count recorded below after all output links are present; remote URLs/images/fenced examples remain outside checker coverage |
| Existing structural documentation checks | PASS: MessageStatus table/diagram, MVP Brand uniqueness/export exclusion, four source relations, revision/purge presence, weights/events and fence balance |
| Exact Prisma schema validation | PASS: exact existing schema; no temporary normalization or schema change |
| Whitespace | `git diff --check` PASS |

New JSON schemas were iteratively checked with all examples and negative probes. An early working draft coupled progress checkpoints too tightly to CREATED, which would conflict with existing consumer validation/history transitions. The final matrix preserves those transitions and tests independently captured producer outcomes; no new Prisma state or change to product lifecycle is made. These are local contract design checks, not previously approved production migrations.

## What was not verified

No database/provider/object-storage/queue call, production authorization/session check, row-lock/idempotency race, atomic snapshot/head/projection transaction, ontology-policy execution, source-normalization map, purge/backup restore or end-to-end product test ran. The offline reference/compatibility helpers are conformance examples, not an implemented NestJS gateway or exhaustive semantic validator. JSON Schema cannot prove actual Owner approval, current head, complete real source evidence, legal retention or factual accuracy. Supplemental PostgreSQL tests were not rerun because Prisma/SQL are unchanged; prior SQL evidence retains its original date.

D-AUD-01/02/03/05/06/07/08, Founder import choices, D-LEARN-02 facade integration, Security/Operations policy gates and existing implementation reviews remain open. D-AUD-04’s structural specification is supplied; actual adoption/approval requires responsible Architecture/Engineering review, recorded identity/revision/date and integration evidence.

## Migration and changed-file summary

**No Prisma or SQL changes.** Existing JSON and schemaVersion fields hold v2 variants. Deploy version-routed readers before writers; inventory historical data/heads; preserve immutable payloads and approvals; backfill only demonstrable references; re-review missing provenance. Unknown versions fail closed for generation, with authorized historical opaque/quarantine handling. Do not relabel old records or rewind heads during rollback. Full migration notes are in the canonical contract.

Changed existing documents: [Artifact Model](../domain/02_ARTIFACT_MODEL.md), [API Design](../domain/05_API_DESIGN.md), [Ingestion](../services/01_INGESTION_SERVICE.md), [Processing](../services/02_DOCUMENT_PROCESSING_SERVICE.md), [Extraction](../services/03_KNOWLEDGE_EXTRACTION_SERVICE.md), [Management](../services/04_KNOWLEDGE_MANAGEMENT_SERVICE.md), [Context](../services/05_CONTEXT_ENGINE.md), [Orchestrator](../services/06_AI_ORCHESTRATOR.md), [provenance](../KNOWLEDGE_PROVENANCE.md), [learning](../KNOWLEDGE_LEARNING_LIFECYCLE.md), [Decision Register](../DECISION_REGISTER.md), [final audit](../FINAL_CONSISTENCY_AUDIT.md), [README](../README.md) and [changelog](../DOCUMENTATION_CHANGELOG.md).

New files: canonical contracts README; ten version2.0.0 schemas; registry; three example/catalog JSON files; [conformance runner](artifact_contracts.test.cjs), [offline reference checks](artifact_reference_checks.cjs), [compatibility/idempotency examples](artifact_compatibility.cjs), dev-only package manifest and node_modules ignore; this validation record. No application infrastructure or user-facing feature was added.

## Final documentation count

**962 local Markdown destinations checked; 0 errors.** Existing structural checker, contract conformance suite, exact Prisma validation and whitespace checks pass.
