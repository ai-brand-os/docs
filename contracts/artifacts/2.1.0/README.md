# Proposed Artifact 2.1.0 — import control extension

Date 2026-10-18. **Proposed — Pending Architecture/Engineering Review (D-IMP-LC-01)**. [ADR-012](../../../domain/11_IMPORT_LIFECYCLE_ADR.md) owns lifecycle semantics, ordering, authorization and transaction requirements. This is a versioned proposal with conformance fixtures, not approval of writers or a release/migration claim.

## Scope and exact gap

2.0.0 has item decisions and approved publications, but no immutable operation closure/attempt-selection/review-set record. Its publication_attempt cannot be SUCCEEDED; candidate_decision covers one item only. Neither an arbitrary newest Artifact nor queue completion proves whole-import closure. This extension uses the **existing** ArtifactType KNOWLEDGE_CANDIDATE, ProducingService KNOWLEDGE_MANAGEMENT and ArtifactStatus values; it adds JSON variant/stage `import_control`, not an ImportJob/status table or approval ledger.

[Schema](import_control.schema.json) and [registry](registry.json) define the exact proposed envelope, payload and required nullable fields. [Example](example.json) is a full CLOSED fixture; its referenced synthetic records are in [lifecycle fixtures](../../../validation/import_lifecycle.fixtures.json). Only this new variant uses schemaVersion=2.1.0. Existing result/decision/snapshot records still use their exact 2.0.0 schemas and version. A mixed-version reader dispatches by exact version then variant; this proposal does not relabel or loosen 2.0.0.

## Control record semantics

Envelope IDs/tenant/correlation are existing fields. conversationId=null; artifactType=KNOWLEDGE_CANDIDATE, producingService=KNOWLEDGE_MANAGEMENT, producingStage=import_control. Status VALID on insertion; ARCHIVED may be read historically with full authorization/reference checks. Active chains cannot be arbitrarily archived/superseded to bypass admission. Payload variant=import_control, operationStatus=SUCCEEDED, error=null means the **control append** committed, not import success. Existing invocation/attempt/checkpoint fields identify append execution; data.sequence orders the operation control chain, not stage checkpoints.

Every schema property is required; explicit null is allowed only where defined. Unknown properties/versions reject; no defaults/coercion/removal/network schema resolution. Shape validation does not establish authorization or referential integrity.

| Field in data | Exact meaning / additional server invariant |
| --- | --- |
| event | ADMITTED, CLAIMED, RETRY_AUTHORIZED, REVIEW_OPENED, CLOSED; new control discriminator, not parallel ArtifactStatus/operationStatus enums |
| sequence / previousControlArtifactId | Positive integer, contiguous starting 1; previous must match envelope parentArtifactId. ADMITTED has sequence=1, previous=null, epoch/fence=0, phase=SUBMITTED. Unique child/sequence under Brand lock; branching is an integrity error, not timestamp tie-break |
| epoch / fence | Monotonic nonnegative selected operation generation/worker fencing. CLAIMED/retry allocation checks current library lease; Owner review writes check current control head/Brand lock, not stale worker rights |
| actorUserId / servicePrincipal | Exactly one non-null; server-derived current Owner or narrowly authorized service identity. Service cannot invent approval. ADMITTED replay key scope also binds actual actor |
| operationId / idempotencyKeyHash / requestHash | Actual UUID/hash receipt for control append/submission. stable-json-v1/SHA256 per existing contracts; same scoped key/body replays original, changed body conflicts |
| phase | Existing nonterminal public phase, not a persisted authoritative status copy. It records authorized execution position; selected evidence must agree. CLOSED carries final pre-closure phase; terminal result is derived from verified closure outcome |
| stageBindings | Exact existing registry stage, invocationId, inclusive positive min/max attempt numbers; min≤max, no ambiguous overlapping bindings. Bounded transport attempts obey Gateway1.0.0 numbering. No model/prompt field added |
| retainedArtifactIds | Explicit successful source-safe prefix across retries; on CLOSED, exact selected pipeline/diagnostic Artifact IDs at closure, freezing outcome interpretation against later worker events. Failure diagnostics are referenced for reasons only, not usable successful data |
| reviewCandidateRefs / governanceArtifactIds | Frozen original candidate Artifact/item keys and terminal governance references on REVIEW_OPENED. Unique and exact eligibility coverage; empty eligible set valid only after complete successful extraction/governance. After opening review, no CLAIMED/retry/replacement manifest is legal |
| decisionArtifactIds / publicationRevisionIds | CLOSED references actual terminal item decisions and committed accepted revisions. They are not duplicate decision/value/approver records. Verify exact coverage, matching snapshot parents and real BrandBrainRevision transaction evidence; rejection has no revision |
| reasonCode / closure | Safe registered reason; CLOSED requires terminal publicStatus/outcome, all other events closure=null. COMPLETED outcomes ALL_ACCEPTED/MIXED_DECISIONS/NOTHING_ACCEPTED; zero eligible is REJECTED_NO_CANDIDATES/NOTHING_EXTRACTED; FAILED reasons cover actual failure/exhaustion/unsafe/source/revocation. Enforce pair equality/coverage at runtime. No undecided-item discard, cancellation/expiry policy or invented retention period is enabled |

Empty arrays mean known empty; do not use them to omit evidence needed by the event. ADMITTED/CLAIMED/retry must have no decision/publication/closure evidence and no frozen review manifest. REVIEW_OPENED must reference selected full extraction and governance; CLOSED links the exact frozen REVIEW_OPENED set through its verified control ancestor chain; its own reviewCandidateRefs/governanceArtifactIds stay empty to avoid duplicating that manifest. It references all terminal decisions/publications where required. Every reference is same organization/Brand/correlation and actual type/variant, except approved revisions may later be historical heads. Parent/source identity retention follows existing provenance/data-lifecycle rules. Closures contain no business fact values.

## Consumer impacts and rollout

| Consumer | Required change |
| --- | --- |
| Artifact version dispatcher | Register 2.1.0 import_control explicitly alongside unchanged 2.0.0, reject unregistered combinations; no generic unknown-property acceptance |
| KnowledgeImportModule/KM | Brand-locked control appends, authoritative stage selection, frozen review manifest, exact coverage and transactionally committed closure |
| Workers | Current claim/fence and selected invocation/attempt checks; append stage records under existing 2.0.0, no authority to publish knowledge |
| Polling/review adapters | [Projection1.0.0](../../import-lifecycle/README.md), truthful reasons/counts, terminal flag tied to closure; no new screen/endpoint |
| Retention/reference/repair | Protect control chain, candidate and decision/snapshot refs; never delete an active claim/closure as a shortcut to release admission |
| SQL/Prisma | Existing artifacts JSON storage supports the variant. No Prisma changes required; reviewed queue-library/outbox/index migrations are separate infrastructure work |

1. Architecture/Engineering review this exact proposal and D-AUD-07 Product/Architecture semantics; Founder D-IMP-02 interval approval stays separate. Review security/reference/retention impacts.
2. Inventory actual historical import records and readers. Deploy exact 2.0 + proposed2.1 readers/validators first; rehearse controls, references, crash/replay and rollback on disposable data.
3. Legacy imports without controls return RECOVERY_REQUIRED, terminal=false, nextAction=RECONCILE; they cannot be guessed complete or free a proposed active slot. Reconciliation may append new control records only after verifying original admission/source/candidate/decision/publication evidence under Brand lock and explicit authorized repair. If original admission identity cannot be reconstructed, keep legacy read-only/unresolved; do not fabricate old ADMITTED/closure/approval times. D-IMP-LC-01 reviewer must approve actual backfill/repair procedure before cutover.
4. Enable new controls only for reviewed writers, maintaining exact pipeline v2.0 and Gateway v1 readers. Atomic admission/enqueue and final publication/closure must be tested with the selected queue integration. No backfill or production migration is executed here.
5. Rollback disables new admissions/mutations and drains or pauses claimed work, retaining both readers and all existing controls/decisions/revisions. Old readers must not receive new 2.1 records. Do not delete closure, rewind approved head, rewrite versions or reopen terminal imports to recover compatibility. Resume only after reconciled claims and references.

Additional fields/events or new forced-discard/expiry behavior need a new registered bundle version and review; never edit adopted 2.1 semantics in place. This directory is a proposed immutable candidate, not an assertion of approval. [Task18 results](../../../validation/TASK18_RESULTS.md) records tests and remaining runtime evidence.
