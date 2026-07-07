# Service Specification — Ingestion Service

Document

01_INGESTION_SERVICE.md

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

Version 2.0.0 reduces the Ingestion Service to its correct, minimal responsibility: **accepting and validating raw input before handing it to the Document Processing Service.** No processing, interpretation, or persistence logic belongs here.

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
- Accepting website URLs for crawling
- Basic input validation (format, size, encoding, emptiness)
- Duplicate upload detection (same file/URL submitted twice)
- Malware scanning (future)
- Assigning a Source ID and correlation ID
- Forwarding validated input to the Document Processing Service
- Reporting ingestion status back to the caller
- Creating an Intake Job record

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
- Website URL (single page or shallow crawl, per Brand Brain PRD Step 2)

Future:

- Audio
- Video
- Images (OCR)
- Email
- API integrations
- CRM integrations

Every input is treated as untrusted until it passes validation.

---

# Output

The service produces a **Raw Intake Artifact**, containing:

- Source ID
- Correlation ID
- Source Type (file / URL)
- Original filename or URL
- Raw bytes / raw HTML reference (stored, not parsed)
- Validation Result
- Intake Status
- Timestamp

The Raw Intake Artifact contains no interpreted content. It is the input to the Document Processing Service, not to Knowledge Extraction.

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
Malware Scan (future)
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
- Malware scanning (future)
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
- Website URL intake
- Format/size/encoding validation
- Duplicate upload detection
- Forwarding to Document Processing Service

---

# Deferred Features

Post-MVP:

- Audio / Video / Image intake
- OCR pre-check
- Malware scanning
- CRM / API integrations
- Scheduled or batch imports

---

# Definition of Done

The Ingestion Service is complete when:

- All supported source types can be submitted and validated.
- Invalid input is rejected before reaching Document Processing.
- Every artifact carries a Correlation ID usable across the full pipeline.
- No parsing, extraction, or persistence logic exists in this service.
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

# END OF DOCUMENT
