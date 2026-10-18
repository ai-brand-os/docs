# Service Specification — Document Processing Service

> Task16 (2026-10-17): [canonical Artifact v2 contracts](../contracts/artifacts/README.md) and the [registered schemas](../contracts/artifacts/2.0.0/artifact.schema.json) define exact envelope/payload/stage/status/error structure. This service emits PROCESSING_INTERMEDIATE / STRUCTURED_DOCUMENT, variants processing_stage / structured_document. D-AUD-04 is specified with conformance evidence, **pending Architecture/Engineering review**, not Approved. Existing product/provider/history/policy decisions remain open.

> Final audit (2026-10-16): D-AUD-05 tracks source-location mapping through normalization: preserve original evidence; no invented currency/date interpretation or fabricated original offsets. Location availability and transformation maps require an explicit contract. See [final-audit decisions](../DECISION_REGISTER.md#final-audit-decisions) for options and ownership.

> Final audit (2026-10-16): “Intake/Processing/Extraction/Knowledge Management/Context Assembly/AI Execution Job” means a logical correlated operation/status view, not an additional Prisma domain table. Queue transport state is infrastructure-owned under [ADR-010](../domain/09_LEAN_MVP_ARCHITECTURE_ADR.md). Current working text requires integrated review; historical approval footers are not current sign-off.

> Approval evidence audit (2026-10-13): [DECISION_REGISTER.md](../DECISION_REGISTER.md). Recorded baseline engineering decisions are preserved. Approved labels do not sign off pending import product choices D-IMP-01/02/03, later integrated PRD revisions, or proposed legal/operational retention periods. Dependency/release gates remain disclosed.

> Scope authority (2026-10-13): [MVP_SCOPE.md](../MVP_SCOPE.md). This document specifies intended behavior; design approval does not establish implementation. Historical decisions and long-term concepts do not expand MVP.

Document

[02_DOCUMENT_PROCESSING_SERVICE.md](02_DOCUMENT_PROCESSING_SERVICE.md)

Version

1.0.0

Status

Draft

Owner

Architecture

Priority

P0

---

# Purpose

The Document Processing Service transforms raw imported content into standardized, structured documents ready for knowledge extraction.

It is responsible for content preparation only.

The service does not understand business meaning.

It prepares content for downstream intelligence services.

---

# Mission

Convert heterogeneous documents into a consistent, machine-processable representation.

---

# Responsibilities

The Document Processing Service is responsible for:

- Reading imported content
- Content cleaning
- Text normalization
- Language detection
- Metadata extraction
- Structure analysis
- Chunk generation
- Chunk optimization
- Processing quality validation
- Creating a Processing Job

---

# Non-Responsibilities

The service must never:

- Extract business entities
- Understand business concepts
- Generate embeddings
- Validate knowledge
- Modify Brand Brain
- Build AI context
- Call LLM providers

---

# Core Principle

Every downstream service should receive identical document structures regardless of the original source format.

---

# Input

Supported inputs:

- HTML
- PDF
- DOCX
- Markdown
- Plain Text

Future:

- Images
- OCR
- Audio
- Video
- Email
- Rich Text Editors

---

# Output

Emit PROCESSING_INTERMEDIATE / STRUCTURED_DOCUMENT using [canonical Artifact v2 contracts](../contracts/artifacts/README.md) and the [typed payload schema](../contracts/artifacts/2.0.0/processing_intermediate.schema.json). Result fields live in payload.data; IDs/correlation/producer/stage/schemaVersion/ArtifactStatus live in the envelope. Registered variants: processing_stage / structured_document. Every checkpoint has exact operationStatus PENDING/PARTIAL/SUCCEEDED/FAILED/CANCELLED/TIMEOUT where allowed by its schema; terminal commits and approved snapshots are SUCCEEDED only. Final downstream use requires VALID + SUCCEEDED and the appropriate final variant, never a partial/error record or eligibility-only knowledge approval. No service-specific payload/error enum may be invented.

---

# Processing Architecture

The service is designed as a configurable processing pipeline.

Each stage performs one responsibility.

Pipeline stages remain independent.

Stages may be added, removed or reordered through configuration without affecting the public API.

---

# Pipeline Overview

```
Reader
    ↓
Cleaner
    ↓
Normalizer
    ↓
Language Detector
    ↓
Metadata Extractor
    ↓
Structure Analyzer
    ↓
Chunk Generator
    ↓
Chunk Optimizer
    ↓
Quality Validator
```

Every stage receives one input and produces one output.

Stages must be deterministic whenever possible.

---

# Processing Guarantees

The pipeline guarantees:

- Deterministic processing
- Immutable intermediate results
- Complete traceability
- Recoverable failures
- Configurable stages
- Source-independent output
- Idempotent processing

---

# Success Criteria

The service succeeds when:

- Different document formats produce a consistent internal structure.
- Processing stages remain independent.
- New processors can be introduced without changing existing APIs.
- Structured documents are suitable for Knowledge Extraction.

---

Status

Draft

---

# Processing Pipeline

Every document passes through a configurable processing pipeline.

```
Raw Document
      │
      ▼
Reader
      │
      ▼
Cleaner
      │
      ▼
Normalizer
      │
      ▼
Language Detector
      │
      ▼
Metadata Extractor
      │
      ▼
Structure Analyzer
      │
      ▼
Chunk Generator
      │
      ▼
Chunk Optimizer
      │
      ▼
Quality Validator
      │
      ▼
Structured Document
```

Every stage receives exactly one input and produces exactly one output.

Stages must never mutate previous outputs.

---

# Pipeline Stage — Reader

Purpose

Load the original content into the processing pipeline.

Responsibilities

- Read uploaded files
- Read website content
- Detect encoding
- Detect file format
- Validate readability

Output

Raw Text Document

Failure Examples

- Unsupported encoding
- Corrupted file
- Missing content

---

# Pipeline Stage — Cleaner

Purpose

Remove irrelevant or noisy content.

Responsibilities

- Remove duplicate whitespace
- Remove hidden characters
- Remove unsupported control characters
- Normalize line endings
- Remove empty structural elements

The Cleaner must never remove meaningful business information.

---

# Pipeline Stage — Normalizer

Purpose

Standardize textual representation.

Normalization includes

- Unicode normalization
- Date normalization
- Currency normalization
- URL normalization
- Phone number normalization
- Number normalization
- Punctuation normalization

Normalization should preserve semantic meaning.

---

# Pipeline Stage — Language Detector

Purpose

Identify document language.

Outputs

- Primary language
- Secondary languages
- Confidence score

Future versions may support multilingual segmentation.

---

# Pipeline Stage — Metadata Extractor

Purpose

Extract document metadata.

Examples

- Title
- Author
- Publication Date
- Source URL
- File Size
- MIME Type
- Document Version
- Last Modified

Metadata is operational, not business knowledge.

---

# Pipeline Stage — Structure Analyzer

Purpose

Understand document layout.

Extracted structures

- Sections
- Headings
- Paragraphs
- Lists
- Tables
- Links
- Code Blocks
- Quotes
- Images (reference only)

The analyzer should preserve hierarchical relationships.

---

# Pipeline Stage — Chunk Generator

Purpose

Split content into logical processing units.

Chunking Strategy

Priority order

1. Section
2. Heading
3. Paragraph
4. Sentence

Chunk boundaries should follow semantic meaning whenever possible.

Fixed-size chunking should be avoided unless explicitly configured.

---

# Chunk Metadata

Every chunk contains

- Chunk ID
- Parent Document ID
- Parent Section ID
- Sequence Number
- Language
- Estimated Token Count
- Character Count
- Source Offset

Chunks are immutable.

---

# Pipeline Stage — Chunk Optimizer

Purpose

Improve chunk quality for downstream processing.

Optimization includes

- Merge undersized chunks
- Split oversized chunks
- Preserve semantic boundaries
- Remove redundant overlaps
- Balance token distribution

The optimizer should maximize extraction quality rather than token efficiency alone.

---

# Pipeline Stage — Quality Validator

Purpose

Verify processing quality before output.

Validation checks

- Empty chunks
- Invalid structure
- Missing metadata
- Duplicate chunks
- Encoding consistency
- Structural integrity
- Chunk ordering

Documents failing validation must not continue to downstream services.

---

# Processing Principles

The pipeline must satisfy the following principles:

- Deterministic execution
- Immutable outputs
- Stage isolation
- Full traceability
- Recoverable failures
- Configurable processing order

---

# Error Handling

Use the exact codes and closed error object in [canonical Artifact v2 contracts](../contracts/artifacts/README.md). Failed/cancelled/timeout checkpoints are INVALID with typed fragment or null data; no raw exception/provider body or stack trace belongs in public error/telemetry. Diagnostic ID and safe paths link restricted operator detail. Retries append artifacts, preserve correlation, obey reviewed budgets and never mutate previous results.

---

# Service Interfaces

The Document Processing Service exposes application interfaces for processing imported documents.

Primary operations:

- Process Document
- Get Processing Job Status
- Retry Processing
- Cancel Processing

The service exposes only processing capabilities.

It never exposes internal pipeline stages directly.

---

# Upstream Dependencies

The service accepts requests only from:

- Ingestion Service

Future:

- Batch Import Service
- Scheduled Import Service

Direct user access is prohibited.

---

# Downstream Integrations

The service forwards successfully processed artifacts to:

- Knowledge Extraction Service

The service must never communicate directly with:

- Brand Brain
- Context Engine
- AI Orchestrator
- LLM Providers

---

# Pipeline Configuration

Pipeline stages are configuration-driven.

Each stage supports:

- Enabled / Disabled
- Execution Order
- Timeout
- Retry Policy
- Stage-specific Configuration

Pipeline configuration must be versioned.

---

# Extensibility Model

Every processing stage implements a common contract.

Each stage must:

- Accept exactly one input artifact
- Produce exactly one output artifact
- Be independently testable
- Be replaceable without changing downstream services

New stages may be introduced without breaking existing pipelines.

---

# Artifact Contract

Emit PROCESSING_INTERMEDIATE / STRUCTURED_DOCUMENT using [canonical Artifact v2 contracts](../contracts/artifacts/README.md) and the [typed payload schema](../contracts/artifacts/2.0.0/processing_intermediate.schema.json). Result fields live in payload.data; IDs/correlation/producer/stage/schemaVersion/ArtifactStatus live in the envelope. Registered variants: processing_stage / structured_document. Every checkpoint has exact operationStatus PENDING/PARTIAL/SUCCEEDED/FAILED/CANCELLED/TIMEOUT where allowed by its schema; terminal commits and approved snapshots are SUCCEEDED only. Final downstream use requires VALID + SUCCEEDED and the appropriate final variant, never a partial/error record or eligibility-only knowledge approval. No service-specific payload/error enum may be invented. Quality Validator emits STRUCTURED_DOCUMENT; the first eight stages use PROCESSING_INTERMEDIATE. Chunk parentDocumentId references the actual Document row. Source-offset mapping remains D-AUD-05; explicit unavailable locations are supported.

---

# Processing Metrics

The service should record operational metrics for every pipeline execution.

Examples:

- Total Processing Time
- Stage Duration
- Average Chunk Size
- Chunk Count
- Validation Failure Rate
- Language Distribution
- Pipeline Throughput
- Processing Success Rate
- Retry Rate

Metrics must not contain business-sensitive content.

---

# Security Requirements

The service must enforce:

- Immutable processing artifacts
- Encrypted temporary storage
- Secure deletion of temporary files
- Processing isolation
- Input sanitization
- Resource limits

Temporary artifacts should have configurable retention policies.

---

# Failure Recovery

Pipeline execution must support:

- Safe retry
- Partial restart from the failed stage
- Failure diagnostics
- Idempotent restart
- Correlation tracing

Successfully completed stages should not execute again unless explicitly requested.

---

# Observability

Every processing request should generate:

- Correlation ID
- Pipeline Version
- Stage Timeline
- Processing Duration
- Error Details
- Resource Usage

Observability data should support production diagnostics without exposing document content.

---

# Architectural Decisions

## ADR-001

The service uses a configurable pipeline instead of source-specific processing flows.

Reason:

Different document formats should converge into the same internal representation.

---

## ADR-002

Each stage is isolated and independently replaceable.

Reason:

Future improvements (e.g. OCR, semantic chunking, multilingual processing) should not require rewriting the pipeline.

---

## ADR-003

Processing artifacts are immutable.

Reason:

Immutability improves traceability, debugging and reproducibility.

---

# MVP Scope

The MVP includes:

- HTML parsing
- PDF parsing
- DOCX parsing
- Markdown parsing
- Plain text parsing
- Language detection
- Metadata extraction
- Structure analysis
- Semantic chunk generation
- Quality validation

---

# Deferred Features

Post-MVP capabilities include:

- OCR
- Image processing
- Audio transcription
- Video transcription
- Incremental processing
- AI-assisted document cleanup
- Automatic table understanding
- Layout reconstruction

These features should extend the existing pipeline rather than replace it.

---

# Definition of Done

The Document Processing Service is complete when:

- Supported document formats are processed successfully.
- Pipeline stages execute deterministically.
- Structured Documents conform to the Artifact Contract.
- Validation rules are enforced.
- Processing metrics are available.
- Security requirements are satisfied.
- Observability is operational.
- Every processing request produces exactly one Processing Job.
- Documentation is synchronized.

Implementation without pipeline observability is considered incomplete.

---

# Related Documents

docs/services/01_INGESTION_SERVICE.md

docs/services/03_KNOWLEDGE_EXTRACTION_SERVICE.md

docs/domain/01_DOMAIN_MODEL.md

docs/domain/02_ARTIFACT_MODEL.md

[03_ENGINEERING_BIBLE.md](../BIBLE/03_ENGINEERING_BIBLE.md)

---

# Version History

## Version 1.0.0

Initial design baseline; production readiness was not verified. Original specification for the Document Processing Service.

Defines:

- Processing pipeline
- Stage responsibilities
- Pipeline configuration
- Artifact contract
- Security model
- Operational metrics
- Architectural decisions

---

# Status

Draft — current integrated Architecture/Engineering review pending; historical baseline evidence retained

Version

1.0.0

Effective Date

2026-06-30

---

## Conversation deletion and retention contract

Structured Documents, source chunks and processing lineage remain independent of a Conversation that later retrieves them. Conversation purge removes only owned copies/transient working payloads; it never recursively erases imported source lineage. Temporary-file cleanup must respect retained references and approved source retention, with reviewed provenance repair where needed.

Canonical lifecycle: [DATA_LIFECYCLE.md](../DATA_LIFECYCLE.md). Proposed active-system removal within 30 days requires legal and operational approval; backups expire separately. Normal service access cannot bypass deletedAt, retry/exception retention remains inaccessible, and purge completion requires verified inventory cleanup. This specifies planned behavior, not an implemented purge process.

---

## Current backend and authentication boundary

Implementation target: NestJS dependency-injected core module with Prisma/PostgreSQL persistence behind its permitted application boundary, per [ADR-009](../domain/08_BACKEND_AUTH_AND_CONSTRAINTS_ADR.md). The service does not create public login endpoints, issue user tokens, or choose an identity vendor. Receive validated principal/Organization context, enforce tenant ownership for reads/writes and pass deletion/readiness guards where relevant. Provider/API credentials remain server-side configuration and are distinct from user sessions; never persist access/refresh tokens in artifacts or knowledge. SQL list cardinality/NOT NULL guards supplement, rather than replace, approved-field/provenance validation. These are planned contracts, not implemented-provider claims.

---

# END OF DOCUMENT


# Task 10 — Security launch contract

Consume only policy-validated fetched bytes or scanned quarantine objects. SEC-T03 requires patched non-root isolated parsers without network/credentials, bounded expansion/pages/text/CPU/memory/time, disabled active content and external references, and monitored scratch cleanup. Treat extracted text/metadata as hostile data; normalization does not establish trust or approval.

[SECURITY_THREAT_MODEL.md](../SECURITY_THREAT_MODEL.md) defines mandatory SEC-01–06, threat controls SEC-T01–08 and acceptance scenarios SEC-AT-01–08. These are specified launch gates, not implemented controls or a new approval. Security/Engineering must record enabled-path evidence and resolve provider, parser/limit and operational decisions D-SEC-01/02/03 before release. Optional later defenses cannot replace mandatory isolation, authorization or human approval.


# Task 12 — Lean MVP deployment boundary

Run orchestration in the NestJS worker role from the same backend release; execute untrusted parsers/scanners in restricted subprocess/container sandboxes, not on the API event loop. Preserve module input/output artifacts. No Go worker or network microservice boundary is required. Resource limits, no-network parsing, scanning and cleanup remain launch requirements.

[ADR-010](../domain/09_LEAN_MVP_ARCHITECTURE_ADR.md) recommends one backend codebase/release with API and worker roles, PostgreSQL-backed jobs, private object storage and isolated parsers. Redis/BullMQ, Qdrant, Go application workers and independent domain microservices are conditional future alternatives. No infrastructure migration or runtime verification is claimed; D-ARCH-01/02 and existing security/policy gates remain pending.


## Task18 — Processing success is not import completion

[ADR-012](../domain/11_IMPORT_LIFECYCLE_ADR.md) selects authorized stage attempts/prefixes and defines recoverable versus terminal import failure. Processing emits unchanged PROCESSING_INTERMEDIATE/STRUCTURED_DOCUMENT; only complete VALID+SUCCEEDED structured_document advances extraction. Failed/partial records remain diagnostics, not candidate approval/closure. Recheck current grant/source/lease/fence before writes; expired workers cannot publish late results. No new status table or parser format.
