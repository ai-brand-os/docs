# Service Specification — Knowledge Extraction Service

Document

03_KNOWLEDGE_EXTRACTION_SERVICE.md

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

The Knowledge Extraction Service transforms processed documents into structured candidate knowledge.

It identifies business concepts, interprets their meaning and constructs a semantic representation suitable for validation by the Knowledge Management Service.

The service produces knowledge candidates.

It never creates approved business knowledge.

---

# Mission

Transform processed information into structured business understanding.

---

# Responsibilities

The Knowledge Extraction Service is responsible for:

- Information extraction
- Semantic interpretation
- Entity recognition
- Entity normalization
- Relationship construction
- Entity classification
- Candidate generation
- Extraction confidence calculation
- Provenance tracking
- Creating an Extraction Job

---

# Non-Responsibilities

The service must never:

- Approve knowledge
- Resolve conflicts
- Merge duplicates
- Persist Brand Brain
- Retrieve context
- Generate AI responses

These responsibilities belong to downstream services.

---

# Input

Accepted input:

Processed Artifact

The artifact contains:

- Clean content
- Structural metadata
- Chunks
- Language
- Processing metadata

---

# Output

The service produces:

Knowledge Candidate Artifact

Containing:

- Candidate Entities
- Candidate Relationships
- Candidate Metadata
- Provenance
- Extraction Confidence
- Extraction Status

The output remains provisional until validated.

---

# Core Principle

Extraction discovers knowledge.

Validation determines trust.

These responsibilities remain intentionally separated.

---

# Extraction Pipeline

```
Processed Artifact
        ↓
Information Extraction
        ↓
Semantic Interpretation
        ↓
Entity Classification
        ↓
Relationship Builder
        ↓
Candidate Builder
        ↓
Knowledge Candidate Artifact
```

---

# Design Principles

Semantic First

Understand meaning before classification.

---

Deterministic Where Possible

Rule-based extraction takes precedence when confidence is high.

LLMs should augment, not replace, deterministic logic.

---

Explainable

Every extracted entity must reference the source evidence.

---

Traceable

Every candidate must retain provenance to its originating document and chunk.

---

Composable

Extraction stages must be independently replaceable and testable.

---

# Success Criteria

The Knowledge Extraction Service succeeds when:

- Business entities are extracted accurately.
- Relationships preserve business meaning.
- Provenance is maintained.
- Candidate knowledge is structurally complete.
- Downstream validation requires minimal manual correction.
- Every processed artifact produces exactly one Knowledge Candidate Artifact.

---

Status

Draft

---

# Extraction Pipeline

Every Processed Artifact follows the same semantic extraction pipeline.

```
Processed Artifact
        │
        ▼
Information Extraction
        │
        ▼
Entity Normalization
        │
        ▼
Semantic Interpretation
        │
        ▼
Entity Classification
        │
        ▼
Relationship Builder
        │
        ▼
Candidate Builder
        │
        ▼
Knowledge Candidate Artifact
```

Each stage produces a new immutable artifact.

---

# Stage 1 — Information Extraction

Purpose

Extract explicit facts from processed content without interpretation.

Examples

Input

"Our product AI Brand OS helps marketing agencies automate content."

Extracted facts

- Product = AI Brand OS
- Audience = Marketing Agencies
- Capability = Content Automation

No business reasoning occurs during this stage.

---

# Stage 2 — Entity Normalization

Purpose

Normalize extracted values into canonical representations.

Examples

```
AI Brand OS
AIBrandOS
AI BrandOS
```

↓

```
AI Brand OS
```

Normalization includes:

- Text normalization
- Case normalization
- Alias resolution
- Whitespace normalization
- Canonical naming

Normalization must never change semantic meaning.

---

# Stage 3 — Semantic Interpretation

Purpose

Interpret the business meaning of extracted information.

Example

```
"Our platform helps startups create marketing content."
```

Interpretation

Business Capability

↓

Content Generation

Target Market

↓

Startups

Business Goal

↓

Marketing Automation

Interpretation may use deterministic rules, ontology lookup or LLM reasoning.

---

# Stage 4 — Entity Classification

Purpose

Assign interpreted entities to Brand Brain aggregates.

Examples

Mission

↓

Business Profile

Product

↓

Offering

Audience

↓

Customer Segment

Brand Voice

↓

Brand Identity

Classification priority

1. Rule-based
2. Ontology-based
3. AI-assisted

---

# Stage 5 — Relationship Builder

Purpose

Construct semantic relationships between entities.

Relationship examples

Product

↓

Solves

↓

Customer Problem

Audience

↓

Consumes

↓

Content Type

Campaign

↓

Supports

↓

Business Goal

Relationships are explicit domain objects.

---

# Stage 6 — Candidate Builder

Purpose

Assemble extracted entities into a candidate knowledge artifact.

Candidate contains:

- Entity Set
- Relationship Set
- Provenance
- Extraction Metadata
- Extraction Confidence
- Processing Version

Candidates remain mutable only within the current pipeline execution.

After emission they become immutable.

---

# Provenance Model

Every extracted element must retain its origin.

Minimum provenance:

- Source Document
- Chunk ID
- Character Offset
- Extraction Method
- Pipeline Version
- Timestamp

Provenance enables explainability and auditing.

---

# Confidence Model

The extraction service calculates only:

Extraction Confidence

Confidence reflects:

- Extraction quality
- Parsing certainty
- Rule confidence
- LLM confidence
- Evidence completeness

The service never determines whether knowledge is true.

That responsibility belongs to the Knowledge Management Service.

---

# Deterministic First Strategy

Extraction priority:

1. Exact Rules
2. Pattern Matching
3. Ontology Lookup
4. LLM Reasoning

AI should be used only when deterministic methods cannot confidently resolve ambiguity.

---

# Processing Guarantees

The service guarantees:

- Immutable candidate artifacts
- Full provenance
- Repeatable execution
- Explainable extraction
- Independent stages
- Source traceability

---

Status

Draft

---

# Service Interfaces

The Knowledge Extraction Service exposes application interfaces for semantic extraction.

Primary operations:

- Extract Knowledge
- Get Extraction Job Status
- Retry Extraction

The service does not expose internal extraction stages.

---

# Upstream Dependencies

The service accepts requests only from:

- Document Processing Service

Future:

- Email Processing Service
- Audio Processing Service
- Video Processing Service

Direct user access is prohibited.

---

# Downstream Integrations

Successful extraction results are forwarded only to:

- Knowledge Management Service

Direct communication with the following services is prohibited:

- Brand Brain
- Context Engine
- AI Orchestrator

---

# AI Strategy

The service follows a deterministic-first strategy.

Priority:

1. Rule Engine
2. Pattern Matching
3. Business Ontology
4. LLM-assisted Reasoning

LLMs should enhance extraction quality, never replace deterministic logic where reliable rules exist.

---

# Prompt Management

Extraction prompts must be:

- Versioned
- Tested
- Observable
- Replaceable

Prompt changes must never require application code changes.

Prompt templates should be managed independently from service logic.

---

# Model Independence

The service must not depend on a specific LLM provider.

Supported providers may include:

- OpenAI
- Anthropic
- Google Gemini
- Future providers

Provider selection is handled exclusively by the AI Orchestrator.

---

# Candidate Artifact

Every extraction produces a Knowledge Candidate Artifact.

Minimum contents:

- Candidate ID
- Entities
- Relationships
- Provenance
- Extraction Confidence
- Processing Version
- Ontology Version
- Timestamp

Candidate Artifacts are immutable.

---

# Security Requirements

The service must enforce:

- Provenance integrity
- Immutable artifacts
- Prompt version tracking
- Input validation
- Output schema validation

Sensitive prompts must never be exposed outside the platform.

---

# Observability

Every extraction execution should expose:

- Extraction Duration
- Entity Count
- Relationship Count
- Rule Usage
- LLM Usage
- Confidence Distribution
- Failure Reasons
- Extraction Success Rate
- Retry Count

Operational telemetry must never contain confidential business content.

---

# Architectural Decisions

## ADR-001

Semantic interpretation is separated from information extraction.

Reason:

Extracting facts and understanding their business meaning are different responsibilities with different evolution rates.

---

## ADR-002

Extraction produces candidate knowledge only.

Reason:

Business validation belongs to the Knowledge Management Service.

---

## ADR-003

The service is provider-independent.

Reason:

Changing LLM vendors must not affect extraction logic or downstream services.

---

## ADR-004

Business Ontology is used as the semantic reference model.

Reason:

A shared ontology ensures consistent interpretation and classification across all services.

---

# MVP Scope

Included:

- Rule-based extraction
- LLM-assisted extraction
- Entity normalization
- Semantic interpretation
- Relationship construction
- Candidate artifact generation
- Provenance tracking
- Extraction confidence

---

# Deferred Features

Post-MVP:

- Multi-document reasoning
- Cross-document entity linking
- Temporal reasoning
- Knowledge inference
- Active learning
- Human-in-the-loop extraction
- Custom ontology extensions

---

# Definition of Done

The Knowledge Extraction Service is complete when:

- Candidate Artifacts are generated successfully.
- Provenance is preserved.
- Extraction remains explainable.
- Entity classification follows the Business Ontology.
- Prompt versions are traceable.
- Provider independence is maintained.
- Operational metrics are available.
- Every extraction request creates exactly one Extraction Job.
- Documentation is synchronized.

Implementation without provenance tracking is considered incomplete.

---

# Related Documents

docs/services/02_DOCUMENT_PROCESSING_SERVICE.md

docs/services/04_KNOWLEDGE_MANAGEMENT_SERVICE.md

docs/domain/01_DOMAIN_MODEL.md

docs/domain/02_ARTIFACT_MODEL.md

docs/domain/03_BUSINESS_ONTOLOGY.md

03_ENGINEERING_BIBLE.md

---

# Version History

## Version 1.0.0

Initial production-ready specification for the Knowledge Extraction Service.

Defines:

- Extraction pipeline
- Semantic interpretation
- AI strategy
- Candidate artifact
- Provenance model
- Provider independence
- Architectural decisions

---

# Status

Approved for Architecture & Engineering Design

Version

1.0.0

Effective Date

2026-06-30

---

# END OF DOCUMENT
