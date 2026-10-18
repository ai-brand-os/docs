# Artifact Model — AI Brand OS

Version: 2.0.0 working contract. Updated: 2026-10-17. Owner: Architecture / Engineering and six service owners. Status: **Specified — Pending Architecture/Engineering Review (D-AUD-04)**; historical baseline decisions retained. Approval identity/date not recorded. No product scope expansion, implementation or migration is claimed.

[Canonical versioned contracts](../contracts/artifacts/README.md) define exact serialization, state matrix, stage/variant registry, nested JSON Schemas, examples, reference rules and migration. They replace the incomplete v1 field inventories. [MVP scope](../MVP_SCOPE.md), [provenance](../KNOWLEDGE_PROVENANCE.md), [learning lifecycle](../KNOWLEDGE_LEARNING_LIFECYCLE.md) and [data lifecycle](../DATA_LIFECYCLE.md) remain the product/persistence authorities.

# Purpose

All six core services exchange immutable, versioned, tenant-scoped Artifact records. This document explains their domain meaning; the schemas are the single machine-readable structural definition. There are eight existing Prisma ArtifactType values, grouped historically into seven catalog families. Display names and class names are not wire enums. No new source, job, error or memory model is introduced.

# Mission

Make every supported MVP stage result, human decision and approved publication traceable without requiring a service to invent its own payload or error shape.

# Core Principle

An Artifact records what happened. Persisted/emitted payloads never mutate; new checkpoints/results get new artifact IDs. Lifecycle selection metadata may change only through the existing allowed transitions and authorized retention rules.

# Relationship to Other Documents

- [Contracts and compatibility](../contracts/artifacts/README.md): normative v2 envelope/payload/variant rules and review gates.
- [Prisma](../schema.prisma): exact models/enums; validates persistence structure, not JSON evidence or authorization.
- [API Design](05_API_DESIGN.md): thin application adapters; core modules remain DI-only.
- [Ontology](03_BUSINESS_ONTOLOGY.md): semantic field eligibility and relationship constraints.
- [Security](../SECURITY_THREAT_MODEL.md): imported/retrieved content remains data; approval is server-authorized.

# Artifact Flow Across the Platform

```text
Import: RAW_INTAKE → PROCESSING_INTERMEDIATE checkpoints → STRUCTURED_DOCUMENT
        → KNOWLEDGE_CANDIDATE extraction/governance checkpoints
        → Owner candidate_decision → APPROVED_KNOWLEDGE snapshot

Manual: draft Organization/Brand (no Artifact needed)
        → explicit Owner save → KNOWLEDGE_CANDIDATE manual_commit (root)
        → APPROVED_KNOWLEDGE snapshot + BrandBrainRevision (one transaction)

Generation: PROMPT planning checkpoints → PROMPT_CONTEXT assembly checkpoints/final
            → PROMPT final → RESPONSE provider/validation checkpoints/final
```

Import, manual mutation and assistant generation are separate operations. Generation references approved knowledge but never owns its imported/manual source history. The first planning stage may be a generation root; no synthetic User Input ArtifactType, source Document or intake/extraction job is created for manual data or chat. Failure/cancellation/timeout stays within an existing type and registered variant, with INVALID ArtifactStatus; no ERROR type exists.

# Design Principles

## Immutability

Once persisted/emitted, payload never changes, including while CREATED. Stage progress, retries and corrections append records. Retention erasure is independently authorized under the lifecycle policy; immutability does not mean forever retention.

## Lineage Over Mutation

parentArtifactId traces actual preceding work. Intake has null parent. Initial manual_commit has null parent; later edits/verify/restore reference the previous approved snapshot. An approved snapshot points to its successful terminal commit/decision. First generation planning may have null parent; later generation stages trace actual work, never fabricate a missing source. Retention repair requires protected-reference review.

## Correlation Continuity

correlationId is stable across one import/manual mutation/assistant generation and its internal worker/provider retries. Individual import item decisions retain the import correlation and have separate operationId/idempotency identity. A manual mutation gets a new correlation and may reference a previous head with an older correlation. Generation Context may reference an approved snapshot with another correlation. An explicit user retry after terminal Message failure creates a new assistant Message/correlationId. Neither parent nor correlation authorizes deletion or access.

## Tenant Isolation

Every Artifact requires organizationId, and payload.brandId is validated against it. Generation types require conversationId; independent source/candidate/approved knowledge require null. Every reference is revalidated for tenant/type/Brand/lifecycle and source identity; a UUID format or FK is insufficient.

## Composable Stages

Executed stages consume an actual input and emit immutable typed checkpoints/results. PENDING/PARTIAL and failures are operational records, not downstream final success. The exact stage registry and type mappings are in the canonical contract; stages cannot invent discriminators. Quality Validator emits final STRUCTURED_DOCUMENT, not an extra undocumented processing type.

## Explainability

Pin schemaVersion and relevant pipeline/ontology/prompt versions. Distinguish source attribution, extraction confidence, human approval, verification and factual truth. Only explicit Owner publication advances approved business knowledge.

## Storage-Agnostic

The contract uses existing Artifact JSON and metadata. It does not require microservices, a graph database, vector database, new queue table or a second knowledge source of truth.

# Base Artifact Contract

[artifact.schema.json](../contracts/artifacts/2.0.0/artifact.schema.json) is the full validation entry point. [Common definitions](../contracts/artifacts/2.0.0/common.schema.json) hold nested types. All referenced schemas must be locally registered; remote fetching is disabled.

| Required envelope field | Meaning |
| --- | --- |
| artifactId | Actual Artifact.id UUID; not candidate item/revision ID |
| artifactType | RAW_INTAKE / PROCESSING_INTERMEDIATE / STRUCTURED_DOCUMENT / KNOWLEDGE_CANDIDATE / APPROVED_KNOWLEDGE / PROMPT_CONTEXT / PROMPT / RESPONSE |
| parentArtifactId | UUID or explicit null per lineage rules |
| conversationId | UUID for generation, explicit null for independent knowledge/imports |
| correlationId / organizationId | Actual operation tracing / tenant UUIDs |
| producingService | INGESTION / DOCUMENT_PROCESSING / KNOWLEDGE_EXTRACTION / KNOWLEDGE_MANAGEMENT / CONTEXT_ENGINE / AI_ORCHESTRATOR |
| producingStage | Exact registry stage; no arbitrary class label |
| schemaVersion | Exact registered bundle version; new contract is 2.0.0 |
| status | CREATED / VALID / INVALID / SUPERSEDED / ARCHIVED |
| createdAt | Server timestamp, immutable |
| payload | Closed variant with variant/operationStatus/brandId/data/error and applicable source identity |

The canonical contract documents every required/optional/nullable property. Result fields sit in payload.data, not in a competing envelope or duplicated service definition. Approval/order/completeness are in BrandBrainRevision; payload.data.revisionId/ontologyVersion are validated manifest references/copies, not another writable approval store.

# Lifecycle States

ArtifactStatus describes record validation/history, never a Conversation or Message generation. Its exact existing transitions are:

```text
CREATED → VALID → SUPERSEDED or ARCHIVED
CREATED → INVALID
```

INVALID is terminal; VALID→INVALID is not allowed. PENDING/PARTIAL/SUCCEEDED capture producer outcome independently from record validation/history: they may be CREATED/VALID/INVALID/SUPERSEDED/ARCHIVED. Consumer rejection may move a CREATED result to INVALID without changing its payload. FAILED/CANCELLED/TIMEOUT require INVALID; approved_snapshot is inserted VALID (or read historically SUPERSEDED/ARCHIVED). Progress/outcome changes append artifacts. Validity alone never makes a candidate approved or a rejection retrievable as business context. [Canonical lifecycle matrix](../contracts/artifacts/README.md#lifecycle-matrix-and-consumption) defines consumption gates.

# Artifact Type Catalog

## 1. Raw Intake Artifact

Exact type RAW_INTAKE; producer INGESTION. [Payload schema](../contracts/artifacts/2.0.0/raw_intake.schema.json) defines intake checkpoints with file/url source identity, object reference and safe technical validation. Source ID is not a synthetic manual Document. Successful intake requires stored bytes/reference and passed validation; unsafe or incomplete data is not forwarded.

## 2. Processing Artifact (intermediate) / Structured Document (final)

Exact types PROCESSING_INTERMEDIATE and STRUCTURED_DOCUMENT; producer DOCUMENT_PROCESSING. [Intermediate schema](../contracts/artifacts/2.0.0/processing_intermediate.schema.json) types the first eight stage checkpoints; [final document schema](../contracts/artifacts/2.0.0/structured_document.schema.json) types Quality Validator success and unsuccessful variants. Final success requires clean text, structure, metadata, chunks, language availability and processing metrics. Partial processing cannot masquerade as final usable extraction input.

### Chunk (nested value object, not an independent artifact)

Common Chunk contains text, UUID identity, actual parent Document/section, sequence, language availability, token/character counts, normalized sourceOffset and location/unavailable reason. sourceOffset does not prove an original PDF/HTML location. [ADR-013](12_SOURCE_EVIDENCE_MAPPING_ADR.md) specifies D-AUD-05 mapping with review pending; null original precision with an explicit reason remains supported.

## 3. Knowledge Candidate Artifact

Exact type KNOWLEDGE_CANDIDATE. [Payload schema](../contracts/artifacts/2.0.0/knowledge_candidate.schema.json) includes extraction_stage/extraction (KNOWLEDGE_EXTRACTION) and governance_stage/candidate_decision/manual_commit/publication_attempt (KNOWLEDGE_MANAGEMENT). These are JSON variants, not new Prisma types.

Extraction has stable item/fact identity, typed proposed values, actual evidence, confidence basis/unknowns and no approving user/timestamp. Governance returns eligible/ineligible item references and review flags without mutating extraction. candidate_decision records CONFIRM/EDIT_AND_CONFIRM/REJECT, original item identity, actor/time, concurrency/idempotency and resulting revision when approved. manual_commit supports direct initialization/edit/verify/restore with no fabricated candidate/source. publication_attempt records uncommitted work/failures; it cannot stand in for a successful approval. [ADR-012](11_IMPORT_LIFECYCLE_ADR.md) specifies aggregate import completion; its proposed 2.1.0 control extension requires D-IMP-LC-01 review and does not change this 2.0.0 payload schema.

## 4. Approved Knowledge Artifact

Exact type APPROVED_KNOWLEDGE; producer KNOWLEDGE_MANAGEMENT. [Payload schema](../contracts/artifacts/2.0.0/approved_knowledge.schema.json) allows only approved_snapshot/SUCCEEDED, with full members/facts and introducing/superseded/verification lineage, revision/ontology manifest, selected completeness representatives and explicit removals. Only APPROVED facts are legal. Retained facts preserve introducing/verification revisions. Review clears/removals are absent values in the new snapshot plus change metadata, not approved null facts.

Publication inserts matching terminal decision/commit, full snapshot, BrandBrainRevision and head/projections atomically under existing provenance rules. A partial but explicitly approved Brain is valid with readiness=false; no completeness threshold bypass. Approval metadata and persisted score are not copied into the JSON snapshot. Restore appends a new approved revision. Failed/cancelled/timed-out publication uses publication_attempt, never a pending/failed APPROVED_KNOWLEDGE artifact.

## 5. Prompt Context Artifact

Exact type PROMPT_CONTEXT; producer CONTEXT_ENGINE. [Payload schema](../contracts/artifacts/2.0.0/prompt_context.schema.json) defines context_stage and final context. Canonical result fields include assemblyVersion, retrievalStrategy, contextProfile, selectedKnowledge fact refs, businessRules, brandVoice refs, permitted memory, evidence, provenance and contextScore indicator. Only approved pinned revision references enter final context. KNOWLEDGE and WORKING are the only MVP memory kinds. D-AUD-01 still owns multi-turn history; no hidden preference memory is added.

## 6. Prompt Artifact

Exact type PROMPT; producer AI_ORCHESTRATOR. [Payload schema](../contracts/artifacts/2.0.0/prompt.schema.json) defines prompt_stage and final prompt, including actual messages, context/prompt/template/capability versions, pinned revision and modelConfiguration. Tools remain empty in MVP. The schema supplies no new external action, provider selection, prompt policy or public API.

## 7. Response Artifact

Exact type RESPONSE; producer AI_ORCHESTRATOR. [Payload schema](../contracts/artifacts/2.0.0/response.schema.json) defines response_stage and final response. Canonical result uses generatedResponse, promptArtifactId/promptVersion, approvedRevisionId, modelProvider/modelName, tokenUsage, latency, estimatedCost and validationResult. Final successful response requires passed validation and nonempty text; failure/partial data cannot complete a Message. Decimal-string cost plus currency may be null when unknown; unknown token counts are null, not fabricated zero.

# Provenance Object

[Provenance](../KNOWLEDGE_PROVENANCE.md#field-and-proposal-contracts) owns approval/evidence semantics. [Common JSON definitions](../contracts/artifacts/2.0.0/common.schema.json) define MANUAL/IMPORTED/DERIVED field/item origins, evidence/location, derivation inputs and revision references. Old rule/pattern/ontology/llm/user_input extraction labels are explicitly normalized by reviewed readers; they never substitute for Owner approval or verification.

# Storage & Retention Policy

[DATA_LIFECYCLE.md](../DATA_LIFECYCLE.md) governs ownership, immediate conversation access denial, active purge and separate backups. Durations remain proposed pending legal/operational approval. Source bytes/intermediates may have bounded proposed retention, but referenced Artifact/Document identities cannot be removed without coordinated historical/current reference checks and approved repair. Conversation purge removes generation-owned context/prompt/response/errors/memory, preserves independently approved knowledge and never follows a shared parent/correlation as ownership authority. No universal forever retention or immediate backup erasure is claimed.

# Error Artifact

There is no ERROR ArtifactType. The [canonical error/outcome contract](../contracts/artifacts/README.md#idempotency-and-errors) defines closed safe errors in existing payload variants: FAILED/CANCELLED/TIMEOUT plus INVALID status and typed fragment or null data. Invalid wire data itself is never persisted as arbitrary partial JSON. Return safe API errors without an Artifact where authorized scope is unavailable. Publication failures are KNOWLEDGE_CANDIDATE/publication_attempt; approved snapshots are success only. Root envelope and payload are validated together.

# Security & Multi-Tenancy

Format/schema validation does not prove tenant authorization, evidence existence, matching pinned versions, actual Owner approval or atomicity. The [canonical reference checklist](../contracts/artifacts/README.md#references-authorization-and-non-schema-invariants) and provenance gateway remain mandatory at every boundary. [Offline tests](../validation/artifact_contracts.test.cjs) verify schema and synthetic reference behavior, not production transactions, row locks, session checks or protected erasure.

# Observability

Emit content-minimized operation IDs, type/stage/outcome, timings and safe diagnostic codes. Never log payload, source text, prompts, provider bodies or secrets. Operation state, ArtifactStatus and MessageStatus are distinct metrics; success does not establish QualifiedFirstValue.

# Architectural Decisions

## ADR-001

Preserve one polymorphic Artifact store and shared base contract; exact v2 serialization is specified in the canonical schema bundle, pending Architecture/Engineering review. No new storage model is required.

## ADR-002

Preserve separate correlation/parent/conversation meanings. Operation/idempotency identity controls retry handling; tracing IDs never authorize access, approval or deletion.

## ADR-003

Preserve immutable ordinary payloads and independently authorized lifecycle erasure. Conversation deletion cannot erase shared approved knowledge through blanket lineage cascade.

## ADR-004

Preserve storage-independent artifact contracts. Versioned JSON schema rollout is a reader/writer data-contract migration, not a claim of a deployed Prisma migration or formal new approval.

# MVP Scope

All eight existing ArtifactType values and applicable stage/result/review/error variants support the existing seven MVP features. Manual Owner save and scoped import candidate review both publish only through Knowledge Management. No new product screen, source mode, inference capability, provider, team/brand entitlement or autonomous approval is introduced.

# Deferred

Workflow/agent/scheduled request artifacts, preference/conversation-memory stores and automatic interaction-derived candidates remain outside MVP. Their future introduction requires approved scope/contracts; the v2 bundle does not pre-authorize unknown types or fields.

# Definition of Done

Exact types/states/producer stages and all 16 payload variants have locally registered JSON Schemas and examples, plus strict shape/lifecycle tests. D-AUD-04 is **specified with conformance evidence, pending Architecture/Engineering review**, not Approved. Production reference gateways, historical inventory/reader rollout, atomic publication and release acceptance remain implementation/review work. Other audit decisions remain separately owned.

# Related Documents

[Canonical contracts](../contracts/artifacts/README.md), [API](05_API_DESIGN.md), [ontology](03_BUSINESS_ONTOLOGY.md), [provenance](../KNOWLEDGE_PROVENANCE.md), [learning](../KNOWLEDGE_LEARNING_LIFECYCLE.md), [Task16 validation](../validation/TASK16_RESULTS.md).

# Version History

## Version 2.0.0 — Task16 working contract

Replaces ambiguous field inventories and synthetic manual roots with exact enum/stage/variant definitions, canonical JSON Schemas, safe unsuccessful checkpoints, explicit manual publication, typed nested values and compatibility rules. No Prisma change. Specification and local conformance are not approval or runtime delivery.

## Version 1.0.0 — historical baseline

Established shared artifact/lineage/tenant/storage boundaries; nested JSON/status inventories were incomplete. Preserve immutable old records and recorded baseline decisions; do not relabel them v2 without reviewed migration.

# END OF DOCUMENT


## Task17 — Gateway DTOs are not artifacts

[ADR-011](10_AI_PROVIDER_GATEWAY_ADR.md#artifact-compatibility-and-migration) maps the [internal Gateway DTO](../contracts/ai-provider/README.md) to existing fields. Gateway is not an Artifact producer; no ArtifactType/ProducingService/ArtifactStatus is added. Extraction emits KNOWLEDGE_CANDIDATE only, never fake Workspace context/prompt/response. Missing extraction provider/template metadata stays in reviewed content-free telemetry linked by invocation/correlation; do not add fields or overload pipelineVersion. Orchestrator still owns PROMPT/RESPONSE, actual model/usage/cost and final Message validation. v2.0.0 remains unchanged; any later persisted execution attestation requires a separately versioned reviewed amendment.


## Task19 — Proposed typed evidence attachments

[ADR-013](12_SOURCE_EVIDENCE_MAPPING_ADR.md) and [source-evidence1.0](../contracts/source-evidence/README.md) specify the exact fields missing from closed v2 (representation digest/unit/maps/typed locator/availability receipt). [Proposed Artifact2.2](../contracts/artifacts/2.2.0/README.md) adds only representation_manifest (PROCESSING_INTERMEDIATE/DOCUMENT_PROCESSING) and evidence_binding (KNOWLEDGE_CANDIDATE/KNOWLEDGE_MANAGEMENT), not enum/model/approval changes. Existing v2 results/decisions/snapshots and proposed2.1 controls remain immutable; attachments are validated reference dependencies, not ADR-012 state events. Historical bindings resolve through original introducing decision/candidate and unique evidence hash coverage. D-EVID-01 review/reader rollout and runtime reference/transaction tests remain required.


## Task20 — Relationship persistence and lifecycle

**Specified — Pending Architecture/Product Review (D-AUD-06).** [ADR-014](../domain/13_ONTOLOGY_RELATIONSHIP_PERSISTENCE_ADR.md) and [canonical registry/contracts](../contracts/ontology-relations/README.md) define the versioned mapping.

Artifact2.0 cannot serialize approved relationship edges/dispositions or selected context relationship refs. Separately proposed Artifact2.3 adds exactly approved_snapshot.relationships, relationship_commit and final context.selectedRelationships/relationshipSelection. Earlier closed bundles remain unchanged and version-routed. Canonical authority stays the immutable approved Artifact + BrandBrainRevision, not candidateRelationships or another graph store. Status/producer/type enums and operational error/checkpoint variants remain unchanged. Historical missing edges mean NOT_RECORDED; unknown versions fail safely. D-REL-01 gates rollout.
