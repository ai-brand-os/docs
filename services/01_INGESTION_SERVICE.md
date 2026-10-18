# Service Specification — Ingestion Service

> Task16 (2026-10-17): [canonical Artifact v2 contracts](../contracts/artifacts/README.md) and the [registered schemas](../contracts/artifacts/2.0.0/artifact.schema.json) define exact envelope/payload/stage/status/error structure. This service emits RAW_INTAKE, variants intake. D-AUD-04 is specified with conformance evidence, **pending Architecture/Engineering review**, not Approved. Existing product/provider/history/policy decisions remain open.

> Final audit (2026-10-16): “Intake/Processing/Extraction/Knowledge Management/Context Assembly/AI Execution Job” means a logical correlated operation/status view, not an additional Prisma domain table. Queue transport state is infrastructure-owned under [ADR-010](../domain/09_LEAN_MVP_ARCHITECTURE_ADR.md). Current working text requires integrated review; historical approval footers are not current sign-off.

> Approval evidence audit (2026-10-13): [DECISION_REGISTER.md](../DECISION_REGISTER.md). Recorded baseline engineering decisions are preserved. Approved labels do not sign off pending import product choices D-IMP-01/02/03, later integrated PRD revisions, or proposed legal/operational retention periods. Dependency/release gates remain disclosed.

> Scope authority (2026-10-13): [MVP_SCOPE.md](../MVP_SCOPE.md). This document specifies intended behavior; design approval does not establish implementation. Historical decisions and long-term concepts do not expand MVP.

Document

[01_INGESTION_SERVICE.md](01_INGESTION_SERVICE.md)

Version

2.0.0

Status

Draft

Owner

Architecture

Priority

P0

---

# Revision Notice

This document supersedes version 1.0.0.

Version 1.0.0 incorrectly defined a full knowledge pipeline (parsing, entity extraction, relationship extraction, validation, persistence) that duplicated responsibilities already owned by:

- `02_DOCUMENT_PROCESSING_SERVICE.md` — parsing, normalization, chunking
- `03_KNOWLEDGE_EXTRACTION_SERVICE.md` — entity/relationship extraction, classification
- `04_KNOWLEDGE_MANAGEMENT_SERVICE.md` — validation, deduplication, conflict detection, persistence

Version 2.0.0 reduces the Ingestion Service to its correct, minimal responsibility: **accepting and validating raw input before handing it to the Document Processing Service.** No business interpretation or authoritative knowledge persistence belongs here; storing technical intake artifacts/quarantine references is required.

---

# Purpose

The Ingestion Service is the single entry point for raw business information entering AI Brand OS.

It is a **gatekeeper**, not a processor. Its only job is to accept input, confirm it is technically valid, and forward it downstream. It has no knowledge of business meaning.

---

# Mission

Safely and reliably accept raw content from any supported source and hand it to the Document Processing Service as an unprocessed artifact.

---

# Responsibilities

The Ingestion Service is responsible for:

- Accepting uploads (file-based sources)
- Accepting a single website page URL per import job
- Basic input validation (format, size, encoding, emptiness)
- Duplicate upload detection (same file/URL submitted twice)
- Malware scanning (required before parsing file imports)
- Assigning a Source ID and correlation ID
- Forwarding validated input to the Document Processing Service
- Reporting ingestion status back to the caller
- Creating a correlated Raw Intake Artifact and logical intake operation (not a separate job table)

---

# Non-Responsibilities

The Ingestion Service must never:

- Parse document content
- Extract business entities or relationships
- Interpret semantics
- Classify information
- Validate business rules
- Deduplicate knowledge (as opposed to deduplicating raw uploads)
- Detect knowledge conflicts
- Persist Brand Brain or Knowledge Domain data
- Call LLM providers
- Retrieve context
- Generate AI responses

All of the above belong to Document Processing, Knowledge Extraction, or Knowledge Management.

---

# Input

Supported sources (MVP):

- File upload: PDF, DOCX, Markdown, Plain Text
- Website URL (single page only; recursive/shallow crawling deferred to Phase 4)

Future:

- Audio
- Video
- Images (OCR)
- Email
- API integrations
- CRM integrations

Every input remains untrusted data after validation. Validation permits bounded processing, never instruction authority or knowledge approval.

---

# Output

Emit RAW_INTAKE using [canonical Artifact v2 contracts](../contracts/artifacts/README.md) and the [typed payload schema](../contracts/artifacts/2.0.0/raw_intake.schema.json). Result fields live in payload.data; IDs/correlation/producer/stage/schemaVersion/ArtifactStatus live in the envelope. Registered variants: intake. Every checkpoint has exact operationStatus PENDING/PARTIAL/SUCCEEDED/FAILED/CANCELLED/TIMEOUT where allowed by its schema; terminal commits and approved snapshots are SUCCEEDED only. Final downstream use requires VALID + SUCCEEDED and the appropriate final variant, never a partial/error record or eligibility-only knowledge approval. No service-specific payload/error enum may be invented.

---

# Core Principle

Ingestion answers one question only: **"Is this safe and valid to process?"**

It never answers: "What does this mean for the business?" — that question belongs entirely downstream.

---

# Intake Pipeline

```
Raw Input (file or URL)
        │
        ▼
Format & Size Validation
        │
        ▼
Encoding Check
        │
        ▼
Duplicate Detection
        │
        ▼
Malware Scan (file-import launch gate)
        │
        ▼
Raw Intake Artifact
        │
        ▼
Forward to Document Processing Service
```

Each stage is a simple pass/fail gate. There is no branching business logic.

---

# Validation Rules

- Supported format (per MVP Scope below)
- Maximum file size (configurable, Engineering-owned limit)
- Non-empty content
- Valid, reachable URL (for website sources)
- Not a duplicate of a Source ID already ingested for this Organization within a configurable time window
- Organization ownership validation

Failure at any stage terminates the intake request and returns a structured error. No partial forwarding occurs.

---

# Design Principles

## Minimal

The service does the least possible work needed to safely accept input.

---

## Stateless Where Possible

Beyond the Raw Intake Artifact record, the service holds no long-lived business state.

---

## Fast Fail

Invalid input is rejected immediately, before any downstream service is invoked.

---

## Traceable

Every intake request receives a Correlation ID that follows the artifact through Document Processing, Knowledge Extraction, and Knowledge Management.

---

# Success Criteria

The Ingestion Service succeeds when:

- Invalid input never reaches the Document Processing Service.
- Every accepted input is traceable via Correlation ID end-to-end.
- Duplicate submissions are caught before reprocessing wastes compute.
- The service adds negligible latency to the overall import flow.
- Every accepted request creates exactly one Intake Job.

---

# Service Interfaces

Primary operations:

- Submit File
- Submit URL
- Get Intake Job Status

The service exposes no internal validation stages.

---

# Upstream Dependencies

The service accepts requests only from:

- Brand Brain onboarding flow (Website Import step, per `01_BRAND_BRAIN_PRD.md`)
- Future: Batch Import, Scheduled Import

Direct unauthenticated access is prohibited.

---

# Downstream Integrations

The Ingestion Service forwards successfully validated artifacts to:

- Document Processing Service

The service must never communicate directly with:

- Knowledge Extraction Service
- Knowledge Management Service
- Brand Brain
- Context Engine
- LLM Providers

---

# Security Requirements

- Signed upload URLs
- File type verification (not just extension — content sniffing)
- Size limits enforced before storage write
- Malware scanning (required before parsing file imports)
- Encrypted storage of raw artifacts
- Organization-scoped access only (no cross-tenant intake)

---

# Observability

Operational metrics:

- Intake requests per source type
- Validation failure rate
- Duplicate detection rate
- Average intake latency
- Forwarding success rate to Document Processing
- Failed intake requests
- Intake retry count

Telemetry must never contain raw business content.

---

# Architectural Decisions

## ADR-001 (v2.0.0)

The Ingestion Service performs intake validation only; all parsing and interpretation logic moved to Document Processing and Knowledge Extraction.

Reason:

Version 1.0.0 duplicated pipeline stages already owned by downstream services, creating two competing architectures for the same responsibility. A single entry gatekeeper is simpler to reason about, test, and scale independently from heavier processing workloads.

---

## ADR-002

Duplicate detection at ingestion is based on raw source identity (file hash / URL), not semantic content.

Reason:

Semantic duplicate detection is a knowledge-governance concern and belongs to the Knowledge Management Service, not to intake.

---

# MVP Scope

Included:

- File upload intake (PDF, DOCX, Markdown, Plain Text)
- Single Website URL intake (one page per job; no recursive crawling)
- Format/size/encoding validation
- Duplicate upload detection
- Forwarding to Document Processing Service

---

# Deferred Features

Post-MVP:

- Audio / Video / Image intake
- OCR pre-check
- Advanced content-disarm/reconstruction (basic malware scanning is a file-import launch gate)
- CRM / API integrations
- Scheduled or batch imports

---

# Definition of Done

The Ingestion Service is complete when:

- All supported source types can be submitted and validated.
- Invalid input is rejected before reaching Document Processing.
- Every artifact carries a Correlation ID usable across the full pipeline.
- No parsing, extraction, or authoritative business-knowledge persistence logic exists in this service; raw intake storage remains required.
- Every intake request creates exactly one traceable Intake Job.
- Documentation is synchronized with Document Processing, Knowledge Extraction, and Knowledge Management specs.

Implementation containing any parsing or entity extraction logic is considered a violation of this specification.

---

# Related Documents

`02_DOCUMENT_PROCESSING_SERVICE.md`

`01_BRAND_BRAIN_PRD.md`

`03_ENGINEERING_BIBLE.md`

---

# Version History

## Version 2.0.0

Reduced scope to thin intake layer. Removed parsing, entity extraction, relationship extraction, validation, deduplication-of-knowledge, and persistence responsibilities — all reassigned to their correct owning services.

## Version 1.0.0 (Superseded)

Initial draft. Incorrectly scoped as a full knowledge pipeline.

---

# Status

Draft — Supersedes v1.0.0

Version

2.0.0

Effective Date

2026-07-01

---

## Conversation deletion and retention contract

Imported Raw Intake and Document ownership is independent of Workspace conversations. Conversation purge must not delete import sources through a shared correlation or ancestry link. Source bytes and temporary intake files follow an independently approved source retention policy; dedicated source/account erasure is separate.

Canonical lifecycle: [DATA_LIFECYCLE.md](../DATA_LIFECYCLE.md). Proposed active-system removal within 30 days requires legal and operational approval; backups expire separately. Normal service access cannot bypass deletedAt, retry/exception retention remains inaccessible, and purge completion requires verified inventory cleanup. This specifies planned behavior, not an implemented purge process.

---

## Current backend and authentication boundary

Implementation target: NestJS dependency-injected core module with Prisma/PostgreSQL persistence behind its permitted application boundary, per [ADR-009](../domain/08_BACKEND_AUTH_AND_CONSTRAINTS_ADR.md). The service does not create public login endpoints, issue user tokens, or choose an identity vendor. Receive validated principal/Organization context, enforce tenant ownership for reads/writes and pass deletion/readiness guards where relevant. Provider/API credentials remain server-side configuration and are distinct from user sessions; never persist access/refresh tokens in artifacts or knowledge. SQL list cardinality/NOT NULL guards supplement, rather than replace, approved-field/provenance validation. These are planned contracts, not implemented-provider claims.

---

# END OF DOCUMENT


# Task 10 — Security launch contract

Own authenticated intake, quarantined tenant-bound object keys and the restricted URL-fetch adapter. SEC-T02/03 require destination validation bound to actual connections at every redirect/retry, restricted egress, finite resource budgets, signature/type checks and malware scan before parsing. Server checks remain mandatory even when the UI rejects a file. Fetching validated bytes is acquisition, not document interpretation; downstream parsers cannot fetch arbitrary links.

[SECURITY_THREAT_MODEL.md](../SECURITY_THREAT_MODEL.md) defines mandatory SEC-01–06, threat controls SEC-T01–08 and acceptance scenarios SEC-AT-01–08. These are specified launch gates, not implemented controls or a new approval. Security/Engineering must record enabled-path evidence and resolve provider, parser/limit and operational decisions D-SEC-01/02/03 before release. Optional later defenses cannot replace mandatory isolation, authorization or human approval.


# Task 12 — Lean MVP deployment boundary

Run as an internal NestJS module, not a public independently deployed service. Hand accepted operations to the durable PostgreSQL queue through the reviewed atomic enqueue adapter; return correlation for existing polling. Keep fetch policy and quarantine checks. A queue receipt never authorizes a tenant or implies knowledge approval.

[ADR-010](../domain/09_LEAN_MVP_ARCHITECTURE_ADR.md) recommends one backend codebase/release with API and worker roles, PostgreSQL-backed jobs, private object storage and isolated parsers. Redis/BullMQ, Qdrant, Go application workers and independent domain microservices are conditional future alternatives. No infrastructure migration or runtime verification is claimed; D-ARCH-01/02 and existing security/policy gates remain pending.


## Task18 — Import admission and lifecycle ownership

[ADR-012](../domain/11_IMPORT_LIFECYCLE_ADR.md) owns aggregate status and closure. Ingestion produces existing RAW_INTAKE checkpoints and safe failures only; its success or queue completion never closes an import. KnowledgeImportModule/KM records proposed admission/control events under Brand lock; Ingestion validates current tenant/source/claim and fence before durable writes. Unsafe input leads to controlled failure closure, not provider/parser bypass. One active import through READY_FOR_REVIEW remains D-IMP-02 proposed Founder policy.
