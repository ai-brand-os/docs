# Artifact Model — AI Brand OS

> Approval evidence audit (2026-10-13): [DECISION_REGISTER.md](../DECISION_REGISTER.md). Recorded baseline engineering decisions are preserved. Approved labels do not sign off pending import product choices D-IMP-01/02/03, later integrated PRD revisions, or proposed legal/operational retention periods. Dependency/release gates remain disclosed.

> Scope authority (2026-10-13): [MVP_SCOPE.md](../MVP_SCOPE.md). This document specifies intended behavior; design approval does not establish implementation. Historical decisions and long-term concepts do not expand MVP.

Document

02_ARTIFACT_MODEL.md

Version

1.0.0

Status

Approved

Owner

Architecture

Priority

P0

Last Updated

2026-07-02

---

# Purpose

Six services — Ingestion, Document Processing, Knowledge Extraction, Knowledge Management, Context Engine, and AI Orchestrator — each produce and consume "immutable artifacts" as their unit of work. Every one of those service specifications references this document (`02_ARTIFACT_MODEL.md`) as the authoritative contract, but until now it did not exist.

This document defines that contract: a single base structure every artifact type extends, plus a registry of the seven concrete artifact types that flow through the platform, so that lineage, versioning, and observability tooling can be built generically instead of once per service.

This document does **not** define storage technology, database schema, or infrastructure. Per the Domain Model's "Technology Independent" principle, it defines a data contract, not an implementation.

---

# Mission

Guarantee that every unit of work crossing a service boundary in AI Brand OS is immutable, versioned, traceable to a single business event, and scoped to exactly one Organization — regardless of which service produced it.

---

# Core Principle

> An artifact is a fact about what happened, not a mutable record of current state.

Business state (Brand Brain) is derived from a sequence of artifacts. Artifacts themselves are never edited — only produced, superseded, or archived.

---

# Relationship to Other Documents

```text
                    02_ARTIFACT_MODEL.md  ← this document
                              │
       ┌───────────┬──────────┼───────────┬─────────────┬──────────────┐
       ▼           ▼          ▼           ▼             ▼              ▼
01_INGESTION  02_DOCUMENT  03_KNOWLEDGE  04_KNOWLEDGE  05_CONTEXT   06_AI
_SERVICE      _PROCESSING  _EXTRACTION   _MANAGEMENT   _ENGINE      _ORCHESTRATOR
```

Every one of the above services implements one or more concrete artifact types defined in the Artifact Type Catalog below. None of them may invent artifact fields outside this contract without a corresponding update here.

---

# Artifact Flow Across the Platform

```text
Raw Intake Artifact (Ingestion)
        │  Parent Artifact ID chain begins
        ▼
Processing Artifact ×9 stages → Structured Document (Document Processing)
        │
        ▼
Knowledge Candidate Artifact (Knowledge Extraction)
        │
        ▼
Approved Knowledge Artifact (Knowledge Management)
        │
        ▼
Prompt Context Artifact (Context Engine)
        │
        ▼
Prompt Artifact (AI Orchestrator, internal)
        │
        ▼
Response Artifact (AI Orchestrator)
```

Import and generation are separate operations. An import correlationId traces its knowledge pipeline; each generation turn receives its own correlationId and explicit conversationId ownership. Generation may reference approved knowledge without inheriting ownership of its source chain. Parent Artifact ID changes at every hop and forms a lineage graph rooted at the originating Raw Intake Artifact (or a synthetic "User Input" root for manually entered Brand Brain fields, per `01_BRAND_BRAIN_PRD.md` FR-10).

---

# Design Principles

## Immutability

Once an artifact's status leaves `Created`, its payload never changes. Corrections are expressed as a new artifact, with the old one marked `Superseded`.

## Lineage Over Mutation

Every artifact (except a Raw Intake Artifact, which is the lineage root) normally carries a parentArtifactId. Physical retention cleanup may remove an eligible lineage node only after protected-reference review and approved provenance repair; null parents are not permission to infer ownership. History is reconstructed by walking the chain, never by reading a mutable audit log bolted onto a live record.

## Correlation Continuity

correlationId is assigned once per import or generation operation and copied to its retries/stages. It is tracing metadata, not a deletion selector. conversationId records exclusive generation ownership and must be checked separately.

## Tenant Isolation

Every artifact carries `organizationId`. No artifact may reference or be joined against an artifact from a different `organizationId`, per the Engineering Bible's Multi-Tenancy rules and the Domain Model's Aggregate Boundaries.

## Composable Stages

Each processing stage (within Document Processing, Knowledge Extraction, etc.) consumes exactly one artifact and produces exactly one new artifact. Stage isolation is only enforceable if every stage speaks the same base contract.

## Explainability

Every artifact must be traceable to its origin and to the logic version that produced it (`schemaVersion`, and where relevant `ontologyVersion` — see `03_BUSINESS_ONTOLOGY.md`).

## Storage-Agnostic

This contract says nothing about whether an artifact is stored in PostgreSQL, Qdrant, R2, or elsewhere. That decision belongs to the Engineering Bible / implementation layer per artifact type.

---

# Base Artifact Contract

Every concrete artifact type extends this base structure. The conversationId ownership addition requires a versioned contract rollout and reviewed historical backfill alongside the planned Prisma migration; consumers must not guess ownership for older artifacts.

| Field              | Type                                                                                                                | Required    | Description                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------- |
| `artifactId`       | UUID                                                                                                                | Yes         | Unique identifier for this artifact instance.                                                      |
| `artifactType`     | enum                                                                                                                | Yes         | One of the types in the Artifact Type Catalog below.                                               |
| `parentArtifactId` | UUID, nullable                                                                                                      | Conditional | The artifact this one was derived from. Normally absent for lineage roots; retention repair requires reviewed provenance semantics, not silent deletion.                        |
| `conversationId` | UUID, nullable | Conditional | Required for generation/error/retry artifacts; null for independently owned import/knowledge artifacts. Tenant and ownership validation required. |
| `correlationId`    | UUID                                                                                                                | Yes         | Stable per import or generation operation; assigned at its entry point; not a purge boundary.                   |
| `organizationId`   | UUID                                                                                                                | Yes         | Tenant scope. Enforced on every artifact without exception.                                        |
| `producingService` | enum: `Ingestion / DocumentProcessing / KnowledgeExtraction / KnowledgeManagement / ContextEngine / AIOrchestrator` | Yes         | The service that created this artifact.                                                            |
| `producingStage`   | string                                                                                                              | Yes         | The pipeline stage name within the producing service (e.g. `ChunkGenerator`, `ConflictDetection`). |
| `schemaVersion`    | semver                                                                                                              | Yes         | Version of this artifact type's payload structure.                                                 |
| `status`           | enum: `Created / Valid / Invalid / Superseded / Archived`                                                           | Yes         | Lifecycle state. See Lifecycle States below.                                                       |
| `createdAt`        | timestamp                                                                                                           | Yes         | Immutable creation time.                                                                           |
| `payload`          | object                                                                                                              | Yes         | Type-specific content. Structure defined per artifact type below.                                  |

---

# Lifecycle States

ArtifactStatus is the lifecycle of an immutable artifact record. It is not MessageStatus, a provider execution state, or a Conversation lifecycle. Approved snapshot supersession changes artifact/history selection, never makes the Workspace container terminal.

```text
Created → Valid → (Superseded | Archived)
Created → Invalid
```

- **Created** — just produced, not yet validated by its consuming stage.
- **Valid** — passed the consuming stage's validation and is eligible for downstream use.
- **Invalid** — failed validation. Terminal state; a corrected version is a new artifact, not a status change on this one.
- **Superseded** — a newer artifact instance (same lineage, same logical record) replaces this one. Applies to versioned artifacts such as Approved Knowledge Artifact.
- **Archived** — retained per policy but no longer active for retrieval (see Storage & Retention Policy).

No other transitions are permitted. In particular, `Valid → Invalid` is forbidden — if an approved artifact turns out to be wrong, the correct action is a new artifact plus a `Superseded` status on the old one, preserving history (this is what "immutable" means operationally, and it is the same guarantee every one of the six service specs already promises individually).

---

# Artifact Type Catalog

## 1. Raw Intake Artifact

Producing Service: Ingestion Service

| Payload Field           | Type                                              |
| ----------------------- | ------------------------------------------------- |
| `sourceId`              | UUID                                              |
| `sourceType`            | enum: `file / url`                                |
| `originalFilenameOrUrl` | text                                              |
| `rawContentReference`   | storage reference (not inline bytes)              |
| `validationResult`      | object: `{ passed: bool, failedRules: string[] }` |
| `intakeStatus`          | enum                                              |

This is the lineage root. `parentArtifactId` is always null. All downstream artifacts in a chain trace back to exactly one Raw Intake Artifact, or to a synthetic User Input root for manual entries.

## 2. Processing Artifact (intermediate) / Structured Document (final)

Producing Service: Document Processing Service

Each of the 9 pipeline stages (Reader, Cleaner, Normalizer, Language Detector, Metadata Extractor, Structure Analyzer, Chunk Generator, Chunk Optimizer, Quality Validator) produces an intermediate Processing Artifact chained via `parentArtifactId`. Only the final stage's output is forwarded downstream, as a **Structured Document**:

| Payload Field        | Type                                                        |
| -------------------- | ----------------------------------------------------------- |
| `cleanText`          | text                                                        |
| `documentStructure`  | object: sections, headings, tables, lists, links            |
| `metadata`           | object: title, author, publicationDate, sourceUrl, mimeType |
| `chunks`             | Chunk[] (see below)                                         |
| `processingMetadata` | object: pipeline version, stage timings                     |
| `processingStatus`   | enum                                                        |

### Chunk (nested value object, not an independent artifact)

| Field                 | Type                                      |
| --------------------- | ----------------------------------------- |
| `chunkId`             | UUID                                      |
| `parentDocumentId`    | UUID (references the Structured Document) |
| `parentSectionId`     | UUID, nullable                            |
| `sequenceNumber`      | integer                                   |
| `language`            | string                                    |
| `estimatedTokenCount` | integer                                   |
| `characterCount`      | integer                                   |
| `sourceOffset`        | integer                                   |

## 3. Knowledge Candidate Artifact

Producing Service: Knowledge Extraction Service

| Payload Field            | Type                                                                |
| ------------------------ | ------------------------------------------------------------------- |
| `candidateEntities`      | Entity[] (typed per `03_BUSINESS_ONTOLOGY.md` Entity Type Registry) |
| `candidateRelationships` | Relationship[] (typed per Ontology Relationship Type Registry)      |
| `provenance`             | Provenance object (see below)                                       |
| `extractionConfidence`   | number 0–100                                                        |
| `extractionStatus`       | enum                                                                |
| `ontologyVersion`        | semver, referencing `03_BUSINESS_ONTOLOGY.md`                       |

Candidate decisions use the versioned KNOWLEDGE_CANDIDATE payload variant with producingStage=candidate_decision, original candidateId, action, operation identity/hash, actor/time and optional resulting revision. This is an immutable review/idempotency record, not approved business knowledge.

## 4. Approved Knowledge Artifact

Producing Service: Knowledge Management Service. Canonical field contract: [KNOWLEDGE_PROVENANCE.md](../KNOWLEDGE_PROVENANCE.md).

The payload is a full approved Brand Brain snapshot, including brandId, ontologyVersion, active members and unique typed fact keys with value, MANUAL/IMPORTED/DERIVED origin, evidence/source locations/derivation inputs, APPROVED status, valueRevisionId, supersedesValueRevisionId and verifiedInRevisionId. BrandBrainRevision owns approval/order/completeness metadata; field actor/timestamps resolve from these revision IDs. Payload/header ontologyVersion must agree with revision metadata in the approval transaction. There is no independently mutable version/approval value inside a competing version store.

Pending/Rejected proposals remain candidate/decision artifacts. Explicit Owner confirmation/manual save creates this snapshot and revision atomically with projections and currentRevisionId. A subsequent approval supersedes the whole snapshot, but unchanged facts keep their introducing/verification links. Restore appends a new approved revision; conversation purge cannot erase approved knowledge history.

## 5. Prompt Context Artifact

Producing Service: Context Engine

| Payload Field           | Type                                                 |
| ----------------------- | ---------------------------------------------------- |
| `assemblyVersion`       | semver                                               |
| `retrievalStrategy`     | enum: `Vector / Graph / Keyword / Metadata / Hybrid` |
| `contextProfile`        | string, e.g. `Marketing`                             |
| `selectedKnowledge`     | Knowledge reference[]                                |
| `businessRules`         | Rule[]                                               |
| `brandVoice`            | BrandVoice snapshot                                  |
| `memory`                | Memory[] (Knowledge Memory, Working Memory in MVP)   |
| `evidence`              | Evidence[]                                           |
| `provenance`            | Provenance object                                    |
| `contextScore`          | number                                               |
| `contextAssemblyStatus` | enum                                                 |

**Still open — Context payload naming:** `05_CONTEXT_ENGINE.md` lists this artifact's fields three times (Output section, Prompt Context Artifact section, Artifact Contract section) with minor differences between each listing. The field list above is the canonical, reconciled version. The source spec duplicates remain; this task does not mark them fixed. Engineering owns alignment to this canonical contract, tracked in DOCUMENTATION_CHANGELOG.md.

## 6. Prompt Artifact

Producing Service: AI Orchestrator (internal, between Prompt Builder and Model Selection stages)

| Payload Field        | Type                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| `promptVersion`      | semver                                                                |
| `templateVersion`    | semver                                                                |
| `contextVersion`     | reference to the consumed Prompt Context Artifact's `assemblyVersion` |
| `capabilityVersion`  | semver                                                                |
| `modelConfiguration` | object                                                                |

## 7. Response Artifact

Producing Service: AI Orchestrator

| Payload Field       | Type                                      |
| ------------------- | ----------------------------------------- |
| `generatedResponse` | text                                      |
| `promptVersion`     | semver, reference to the Prompt Artifact  |
| `modelProvider`     | enum: `OpenAI / Anthropic / Google / ...` |
| `modelName`         | string                                    |
| `tokenUsage`        | object: `{ input, output }`               |
| `latency`           | milliseconds                              |
| `estimatedCost`     | decimal                                   |
| `validationResult`  | object                                    |
| `executionStatus`   | enum                                      |

**Still open — Response payload naming:** `06_AI_ORCHESTRATOR.md` lists this artifact's fields twice with inconsistent naming — `Model Version` vs. `Model Provider` + `Model Name`, `Latency` vs. `Execution Time`, `Cost` vs. `Estimated Cost`. The field list above is the canonical, reconciled version (`modelProvider` + `modelName` instead of a single `modelVersion`; `latency` in milliseconds; `estimatedCost`). The source duplicates remain; Engineering owns alignment, tracked in DOCUMENTATION_CHANGELOG.md. Canonicalizing this table alone did not fix the service spec.

---

# Provenance Object

The table below describes legacy extraction-location metadata. The normative material-field evidence/origin/approval/verification contract is [KNOWLEDGE_PROVENANCE.md](../KNOWLEDGE_PROVENANCE.md#field-and-proposal-contracts); extractionMethod and timestamp never substitute for approval or last verification. Approved snapshots carry that contract per fact; Prompt Context pins the selected approved revision.

| Field              | Type                                                 |
| ------------------ | ---------------------------------------------------- |
| `sourceDocumentId` | UUID, nullable (null for `user_input` provenance)    |
| `chunkId`          | UUID, nullable                                       |
| `characterOffset`  | integer, nullable                                    |
| `extractionMethod` | enum: `rule / pattern / ontology / llm / user_input` |
| `pipelineVersion`  | semver                                               |
| `timestamp`        | timestamp                                            |

---

# Storage & Retention Policy

[DATA_LIFECYCLE.md](../DATA_LIFECYCLE.md) governs conversation-owned data, overrides generic artifact permanence language, and separates backups from active-system removal. All durations below are design proposals pending legal/operational approval, not implementation claims.

| Artifact Type                      | Default Retention                                              | Rationale                                                                                                                                                               |
| ---------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Raw Intake Artifact                | 30–90 days (configurable)                                      | No standalone business meaning once processed; retained short-term for reprocessing/debugging only. Cost-driven.                                                        |
| Processing Artifact (intermediate) | 7–30 days                                                      | Debugging/reprocessing aid only; superseded by Structured Document.                                                                                                     |
| Structured Document                | Same as source Document lifecycle                              | Input to Knowledge Extraction; may be reprocessed if extraction logic improves.                                                                                         |
| Knowledge Candidate Artifact       | Retained until governance decision + configurable audit window | Provisional; retained briefly past decision for audit traceability.                                                                                                     |
| Approved Knowledge Artifact        | Independent knowledge retention/erasure policy (approval pending)                                          | Core product asset per `02_PRODUCT_BIBLE.md` — "Knowledge compounds; generated content does not." Not removed by conversation deletion; independently governed retention/erasure may apply.                                       |
| Prompt Context Artifact            | Retained per Conversation lifecycle (AI Workspace)             | Supports Conversation History (`02_AI_WORKSPACE_PRD.md` FR-005) without duplicating storage in the Workspace domain.                                                    |
| Prompt Artifact                    | Conversation-owned; proposed active purge within 30 days of deletion                   | Internal; not user-facing.                                                                                                                                              |
| Response Artifact                  | Retained per Conversation lifecycle                            | User-facing history; deletion follows Conversation deletion (`02_AI_WORKSPACE_PRD.md` FR-007), but underlying Knowledge is explicitly unaffected per that PRD's BR-007. |

Payload content is never included in observability telemetry for any artifact type, matching the Observability section of every one of the six service specs.

---

# Error Artifact

Every service already defines a per-stage error format independently. This is the shared envelope they should conform to, extending the Engineering Bible's standard error format:

```json
{
  "success": false,
  "error": {
    "code": "",
    "message": ""
  },
  "artifact": {
    "correlationId": "",
    "producingService": "",
    "producingStage": "",
    "status": "Invalid"
  }
}
```

An error is represented as a base Artifact with `status: Invalid` and an empty or partial `payload`, not as a separate, unrelated structure — this keeps error tracing on the same lineage graph as successful artifacts.

---

# Security & Multi-Tenancy

- `organizationId` is mandatory on every artifact, with no exceptions.
- Cross-tenant artifact linkage (a `parentArtifactId` pointing to an artifact with a different `organizationId`) is invalid and must be rejected at write time.
- The Artifact Model itself performs no authorization — access control is enforced by each producing/consuming service at its boundary. This document defines the shape of the data, not who may read or write it.
- Payload encryption at rest is an Engineering Bible / infrastructure concern, applied uniformly regardless of artifact type.

---

# Observability

Every artifact creation should be independently emittable as a lightweight telemetry event:

- Artifact Created (type, producing service/stage, duration since parent, size)
- Artifact Invalid (type, producing service/stage, failure reason)

Telemetry must never include `payload` contents, per every service spec's existing Observability requirements. This document adds nothing new here beyond formalizing that the rule applies uniformly across all seven artifact types, not per-service.

---

# Architectural Decisions

## ADR-001

All pipeline artifacts share one base contract (`artifactId`, `parentArtifactId`, `correlationId`, `organizationId`, `producingService`, `producingStage`, `schemaVersion`, `status`, `createdAt`, `payload`).

Reason: Enables generic lineage-tracing and observability tooling to be built once, instead of six times (once per service). Prevents silent drift where one service's "immutable artifact" guarantee means something structurally different from another's.

## ADR-002

correlationId is stable within an import or generation operation; parentArtifactId traces transformations and conversationId explicitly owns generation artifacts. Neither correlation nor lineage authorizes deletion of source knowledge.

Reason: These answer two different questions. `correlationId` answers "which business event is this part of." `parentArtifactId` answers "which specific transformation produced this artifact." Conflating them would make it impossible to distinguish a retry of the same stage from progression to the next stage.

## ADR-003

Immutable means no silent content overwrites during ordinary processing; it does not prohibit authorized retention erasure. Conversation-owned generation artifacts (Prompt Context, Prompt, Response, errors and retries) follow DATA_LIFECYCLE.md’s proposed active-system purge target. Source/imported/candidate/approved knowledge is preserved by conversation purge and follows its independent retention/erasure policy; no universal never-erased guarantee is made. Restrict lineage links and protected-reference checks prevent deleting shared history through a blanket cascade.

Reason: `02_PRODUCT_BIBLE.md` explicitly states knowledge is the durable strategic asset, while raw uploaded bytes are not themselves knowledge. Retention policy should reflect that asymmetry rather than treating all artifacts identically.

## ADR-004

This document defines a data contract only. It does not specify database technology, index strategy, or storage engine per artifact type.

Reason: Matches the Domain Model's "Technology Independent" principle and the Engineering Bible's ownership of infrastructure decisions. Coupling this document to a storage choice would make it fragile to infrastructure changes that have no bearing on business meaning.

---

# MVP Scope

Included:

- Base Artifact Contract
- All 7 concrete artifact types listed in the Catalog
- Provenance Object
- Error Artifact envelope
- Storage & Retention Policy (policy definition; enforcement is an Engineering task)

---

# Deferred

Post-MVP, per the "Future" inputs already flagged in `06_AI_ORCHESTRATOR.md` and `05_CONTEXT_ENGINE.md`:

- Workflow Request Artifact
- Agent Request Artifact
- Conversation Memory Artifact
- Organizational Memory Artifact
- Scheduled Execution Artifact

These will extend the Base Artifact Contract without requiring changes to it, per ADR-001's intent.

---

# Definition of Done

The Artifact Model is complete when:

- Every artifact type referenced by the six service specifications has a defined payload schema in this document.
- The Base Artifact Contract is sufficient to express lineage from Raw Intake Artifact to Response Artifact without gaps.
- Field-naming inconsistencies found in `05_CONTEXT_ENGINE.md` and `06_AI_ORCHESTRATOR.md` are reconciled here and flagged for correction at the source.
- Retention policy is defined for every artifact type with an explicit rationale.
- Documentation is synchronized with `03_BUSINESS_ONTOLOGY.md` for typed Entity/Relationship references inside Knowledge artifacts.

---

# Related Documents

`01_DOMAIN_MODEL.md`

`03_BUSINESS_ONTOLOGY.md`

`01_INGESTION_SERVICE.md`

`02_DOCUMENT_PROCESSING_SERVICE.md`

`03_KNOWLEDGE_EXTRACTION_SERVICE.md`

`04_KNOWLEDGE_MANAGEMENT_SERVICE.md`

`05_CONTEXT_ENGINE.md`

`06_AI_ORCHESTRATOR.md`

`03_ENGINEERING_BIBLE.md`

---

# Version History

## Version 1.0.0

Initial production-ready Artifact Model.

Defines:

- Base Artifact Contract shared by all six services
- Lifecycle state machine
- Full Artifact Type Catalog (7 concrete types)
- Provenance Object
- Storage & Retention Policy per artifact type
- Error Artifact envelope
- Reconciliation of field-naming inconsistencies found in existing Context Engine and AI Orchestrator specs

---

# END OF DOCUMENT
