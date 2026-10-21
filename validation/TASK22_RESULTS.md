# Task22 validation — bounded conversation context

Specification started2026-10-20; validation executed **2026-10-21**. **Not formal approval or deployed Workspace/provider correctness.** [ADR-016](../domain/15_CONVERSATION_CONTEXT_AND_HISTORY_ADR.md) contains the audit, ownership, before/after design, ordering/eligibility/retry/pinning/token/privacy rules and decision gates. [history1.0](../contracts/conversation-context/README.md) is canonical; [proposed2.5](../contracts/artifacts/2.5.0/README.md) and [ordering SQL prototype](../sql/CONVERSATION_HISTORY_ORDER_PROPOSAL.sql) are separate adoption proposals. Prisma unchanged.

## Validation commands and results

Final command results are recorded below. All test numeric budgets/tokenizer/review flags are synthetic fixtures, not production defaults or approving evidence.

From repository root, using existing compatible read-only adjacent Ajv8/ajv-formats tooling and Node v22.19.0:

```sh
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/conversation_context.test.cjs
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/artifact_contracts.test.cjs
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/ai_provider_gateway.test.cjs
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/import_lifecycle.test.cjs
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/source_evidence.test.cjs
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/ontology_relations.test.cjs
ARTIFACT_VALIDATOR_PACKAGE_ROOT=../backend/node_modules/ajv-formats node validation/knowledge_quality.test.cjs
python3 validation/check_documentation_links.py
python3 validation/check_documentation_contracts.py
git diff --check
```

| Check | Actual result / limit |
| --- | --- |
| History contract/mock application flow | **PASS AT-22-01–36**, individually printed; five new Draft2020-12 schemas compile locally, request/selection/policy and proposed wrapper fixtures validate, four malformed fixtures reject. Additional final2.0 wire/hash chain, source/catalog tamper, null quality, sequence exhaustion, regeneration pin/correlation, invalid meter, active/stale retry prevention, bounded capture rollback and trusted template checks pass |
| Artifact2.0 | **PASS783 assertions**, ten schemas,16 variants,16 valid/12 invalid examples and all registered outcomes/statuses |
| Gateway | **PASS17 named offline scenarios**, no provider calls |
| Import | **PASS24 named offline scenarios**, existing polling/control schemas unchanged |
| Source Evidence | **PASS26 named synthetic mapping/locator cases**, no real parser/store |
| Ontology Relationships | **PASS30 named offline cases** and existing additional restore/truncation/ref probes |
| Knowledge Quality | **PASS30 named offline cases** and existing additional disabled/replay/tamper probes; formulas remain disabled |
| Documentation links | **PASS1387 local destinations,0 errors**; no external-link/diagram-render check |
| Documentation consistency | **PASS** nine-state enum/table/diagram, one-Brand/exports, source FKs, purge/revisions, SQL references, completeness weights/events and Markdown fences |
| Whitespace | **PASS**, no git diff --check output |
| Existing immutable bundles/Prisma/SQL | **77 tracked files compared byte-for-byte with HEAD;0 changes**. Prisma SHA256 unchanged: a05d7b92d3a87b811f530131374fc1de3fb96cb294036dc39e70152923aa6385 |

Protected comparison command:

```sh
python3 - <<'PY'
import subprocess, pathlib, hashlib
roots = ['schema.prisma', 'sql/MVP_CONSTRAINTS.sql',
         'contracts/artifacts/2.0.0', 'contracts/artifacts/2.1.0',
         'contracts/artifacts/2.2.0', 'contracts/artifacts/2.3.0',
         'contracts/artifacts/2.4.0', 'contracts/ai-provider/1.0.0',
         'contracts/source-evidence/1.0.0', 'contracts/ontology-relations/1.0.0',
         'contracts/knowledge-quality/1.0.0', 'contracts/import-lifecycle']
files = subprocess.check_output(['git', 'ls-files', '--', *roots], text=True).splitlines()
changed = [p for p in files if pathlib.Path(p).read_bytes() !=
           subprocess.check_output(['git', 'show', 'HEAD:' + p])]
print(len(files), changed)
assert not changed
print(hashlib.sha256(pathlib.Path('schema.prisma').read_bytes()).hexdigest())
PY
```

## Isolated PostgreSQL ordering/concurrency checks

```sh
python3 validation/conversation_context_postgres.py
```

First sandbox attempt failed during initdb with `could not create shared memory segment: Operation not permitted` (`shmget`). This was not counted as a successful check. The same command was rerun with tool approval outside the sandbox and passed. It creates its own owner-only temporary cluster with PostgreSQL15 binaries, no TCP listener, private Unix socket/port64332, and applies the actual new SQL proposal to **minimal synthetic tables**, not the application's Prisma schema/database. Uses two real psql sessions/row locks for acceptance and deletion races. The fixture receipts table models atomicity/uniqueness only; it is not a proposed production history store.

Successful run: `/private/tmp/ai-brand-os-task22-pg-wv6ppgdh`; output ended **TEMP_CLUSTER_STOPPED**. No existing PostgreSQL service was restarted or modified. Reproduction creates a new temporary directory; do not target an application database. Source current Prisma was not changed, so no Task22 Prisma validation/generated-client migration is claimed.

| Probe | Observed PostgreSQL result |
| --- | --- |
| PG22-01 | Concurrent accepted turns serialized to slots1/2 then3/4 |
| PG22-02 | Counter5, four rows, second cutoff2 and receipts committed consistently |
| PG22-03 | Later completion did not mutate second request's captured QUEUED catalog |
| PG22-04 | Lost-ack key replay returned original slot1 without duplicate USER |
| PG22-05 | Same key/different body returned conflict |
| PG22-06 | Duplicate assistant insert rolled back earlier USER insert/counter/receipt |
| PG22-07 | Actual proposed unique Conversation/sequence rejected collision |
| PG22-08 | Actual proposed composite reply FK rejected cross-Conversation link |
| PG22-09 | Captured revision stayed old after head changed |
| PG22-10 | Null legacy order counter blocked acceptance rather than inventing order |
| PG22-11 | Deletion held Conversation lock; late completion waited then returned DELETED without completing row |
| PG22-12 | BIGINT counter exhaustion rejected with no overflow receipt |

**PASS12 isolated PostgreSQL mechanism probes.** They do not test real auth/session revocation, full MessageStatus schema, production JSON receipt queries/uniqueness, shared Brand/reference lock ordering, provider calls, queues, end-to-end SSE or purge/backup behavior. The status catalog fixture tests status/sequence snapshot semantics, not production source content-hash capture.

## Before/after flow and canonical contract

| Before | Proposed after / approval gates |
| --- | --- |
| Messages persisted by timestamp, reply/order/history input unclear; mandatory Memory Service wording | Workspace authorizes → locks Brand/Conversation → allocates monotonic slots/reply → freezes bounded catalog/current USER/assistant/ready revision/policy → commits acceptance receipt |
| Context named Knowledge/Working while raw Conversation Memory deferred | Workspace HistoryReader → Context whole-turn suffix + approved revision facts/relationships → Orchestrator exact trusted SYSTEM/untrusted USER-data composition → Gateway execution only |
| No reproducible cutoff/window/token partitions or selected-message audit | history1.0 request/catalog/selection/policy, private hashes/reasons/budget usage, proposed Artifact2.5. No raw transcript in receipt/context metadata |
| Retry/revision/partial streams/history relation underspecified | Original pin/catalog on receipt/terminal retry; new assistant/correlation after latest terminal failure only; explicit latest-completed regeneration is separate new current pin; no active/stale retry or older branching |
| Persistent Conversation could be mistaken for generation terminal or long-term memory | Existing nine-state assistant Message lifecycle/SSE unchanged; Conversation remains active. No summaries/preferences/automatic learning/independent Memory Service |

Ordering is proposed per-Conversation BIGINT acceptance slots and same-Conversation reply association; decimal JSON prevents precision loss. Same-time Messages sort by sequence, not timestamp/UUID. Accepted catalog freezes status/hash so a later completed answer never enters an already accepted request. Captured USER may remain unanswered after assistant failure; failed/cancelled/timeout/partial text never masquerades as successful answer. Largest successful attempt slot at capture wins; previous successes/failed attempts remain audit history.

All selected business refs share acceptance-pinned authorized BrandBrainRevision; older assistant claims stay untrusted prose. Head change alone does not silently repin, while live access/archive/readiness/deletion may deny use. Old prompt/context absence of history fields is HISTORY_NOT_RECORDED, not empty history. Final PROMPT/RESPONSE2.0 and Gateway1 remain structurally sufficient for actual wire/result; proposed2.5 adds only acceptance/context metadata, no new type/status/role. Actual sequence columns/Prisma/client migration and legacy cutover are **not performed**.

## Budget, truncation and privacy behavior

Policy has no production defaults. Reviewed provider/model/tokenizer/template/version/digests and W/I/T/U/K/H/O/S/R are required; component caps and whole serialized wire are independently checked. Source turn/message/byte bounds prevent unbounded capture. Test meter is a synthetic UTF8-byte-token model, not actual LLM tokenization. Unknown model/meter/template or invalid count fails. Trusted instructions/current request/mandatory approved facts cannot be shortened. Oversized current/mandatory context fails safely. Inside loader limits, large prior content is removed as whole turns; beyond loader bounds capture fails before body loading/hashing in the required production reader. Newest chronological suffix stops at first nonfitting turn; no hidden summary, partial answer or older-turn skip. No history fitting an actual prior-turn window requires explicit reviewed current-only fallback/limitation metadata, otherwise fail; true first turn needs none.

Reauthorize current tenant/Brand/Conversation/selected revision/message refs before materialization/egress/stream and locked final commit. Tombstone denial overrides reproducible replay. Purge owns receipt/catalog/context/prompt/response/error/retry/buffers and optional operational copies; raw logs/transcripts or deleted-prompt rehydration are forbidden. Independent approved knowledge is preserved. Exact provider training/retention/deletion and backup expiration remain separate pending disclosures; no invented TTL or recall/remote erasure. Metadata hashes/counts are private business audit data, not anonymous/public telemetry or quality scores.

## Acceptance coverage and limits

| Cases | Offline/model checks |
| --- | --- |
| 01–06 | Empty first turn, two/five-turn context, same-time order, sequential mock concurrent acceptance/frozen pending response, current USER once |
| 07–14 | Failed/cancelled/timeout/partial exclusion, unanswered prior USER, terminal retry original catalog/no duplicate USER, explicit regeneration IDs, cutoff excludes later arrivals |
| 15–21 | Cross-tenant/Brand/Conversation rejection, deleted source denial, guarded deletion race, pinned old revision/current revocation, old assistant claim stays untrusted alongside current approved facts |
| 22–30 | Fixture token caps, oldest whole-turn removal, oversized history/current/mandatory data, JSON injection cannot change actual roles/server head, missing source ref failure, deterministic selection replay, no automatic knowledge publication |
| 31–36 | Old final2.0/new context compatibility, policy/tokenizer boundaries, quality disabled, no Memory Service registry, mocked disconnect without lifecycle termination, retention-owned private metadata/no raw history copy |

Synthetic data/flags model trusted current repository/auth/policy records; code does not implement authentication or validate vendor behavior. The in-memory accept function models atomic success only; PostgreSQL probes separately test mechanics, not this model as a deployed handler. Actual max-bytes preflight must happen before raw body fetch, whereas fixture strings are already in memory. Callback/guard tests do not execute a real SSE transport or distributed queue. Prompt injection test proves escaped data/role/server-state separation, **not model obedience or factual accuracy**. Contradiction example does not implement a fact checker, semantic comparison, claim-review UI or real follow-up benchmark. Quality formulas remain disabled and history inclusion is not coverage/accuracy.

Runtime gaps: authenticated source/reply/final Response/approval reference loading, server-only receipt/policy/version integrity, actual compound JSON uniqueness, Brand→Conversation→reference lock order/revocation/deletion races, exact adapter tokenizer/wire framing, private prompt persistence/egress checks, workload/scan limits, real latest-turn retry concurrency and state guards, full migration/legacy inventory/client upgrade, SSE presentation/reconnect, provider invocation/injection tests, operational cleanup and backups. Concurrent acceptance can yield unanswered prior user text; Product must review that tradeoff versus one in-flight generation. Current-only disclosure and regeneration availability are still UX/API decisions. No application code, production migration, provider/queue/security end-to-end result, calibrated accuracy or formal approval is claimed.

## Open decisions and delivery assessment

**D-AUD-01: Specified — Pending Product/Architecture/Security Review.** Specification Delivery acceptance is met as a versioned, reviewable history/order/retry/token/privacy proposal with36 executable offline cases and12 isolated PostgreSQL probes. Runtime coherence/security/performance and production readiness remain unverified.

- **D-HIST-01 — Architecture/Engineering + Product:** ordering/reply/counter constraints, authentic legacy/cutover and actual Prisma/client/migration.
- **D-HIST-02 — Product/Architecture/Security + Operations/Gateway:** window/unanswered-user/whole-turn policy, real template/model/tokenizer/budgets and disclosed current-only behavior. No production caps approved.
- **D-HIST-03 — Product/Architecture + Workspace/Frontend:** concurrent acceptance versus one in-flight; latest-terminal retry/original pin and conditional latest-completed regeneration/new pin; no new UI/API/SSE guarantee.
- **D-HIST-04 — Architecture/Engineering/Security + Operations/Legal:** Artifact2.5 atomicity/reference/receipt/prompt ownership, shared lock order, retention/reader rollout/rollback.

D-AUD-08, D-REV-02, D-GW-01, D-KQ-01–05, D-POL-01, D-SEC-01/02/03, D-ARCH-01/02, D-GTM-02 and all Founder decisions keep prior status/owners. Migration/rollout order: inventory authentic historical order/refs → approve decisions → compatible receipt/order readers and real constraints/client migration → atomic acceptance/guarded completion/deletion → source reader/exact template/meter/selection → runtime provider/SSE/auth/retention tests → gated deployment. Rollback disables new writers and retains metadata/order readers; no history resequencing, hidden summary, stripping or fabricated empty window.

## Exact changed files

**44 changed files** (repository-relative):

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
contracts/artifacts/2.5.0/README.md
contracts/artifacts/2.5.0/context.schema.json
contracts/artifacts/2.5.0/examples/final-2.0.json
contracts/artifacts/2.5.0/examples/valid.json
contracts/artifacts/2.5.0/history_request.schema.json
contracts/artifacts/2.5.0/registry.json
contracts/artifacts/README.md
contracts/conversation-context/1.0.0/examples/invalid.json
contracts/conversation-context/1.0.0/examples/valid.json
contracts/conversation-context/1.0.0/policy.schema.json
contracts/conversation-context/1.0.0/reference.cjs
contracts/conversation-context/1.0.0/registry.json
contracts/conversation-context/1.0.0/request.schema.json
contracts/conversation-context/1.0.0/selection.schema.json
contracts/conversation-context/README.md
domain/01_DOMAIN_MODEL.md
domain/02_ARTIFACT_MODEL.md
domain/04_DATABASE_DESIGN.md
domain/05_API_DESIGN.md
domain/10_AI_PROVIDER_GATEWAY_ADR.md
domain/14_KNOWLEDGE_QUALITY_AND_TAXONOMY_ADR.md
domain/15_CONVERSATION_CONTEXT_AND_HISTORY_ADR.md
prd/02_AI_WORKSPACE_PRD.md
services/04_KNOWLEDGE_MANAGEMENT_SERVICE.md
services/05_CONTEXT_ENGINE.md
services/06_AI_ORCHESTRATOR.md
sql/CONVERSATION_HISTORY_ORDER_PROPOSAL.sql
validation/TASK22_RESULTS.md
validation/conversation_context.fixtures.cjs
validation/conversation_context.test.cjs
validation/conversation_context_postgres.py
validation/package.json
```
