# Service Specification — Knowledge Extraction Service

> Task16 (2026-10-17): [canonical Artifact v2 contracts](../contracts/artifacts/README.md) and the [registered schemas](../contracts/artifacts/2.0.0/artifact.schema.json) define exact envelope/payload/stage/status/error structure. This service emits KNOWLEDGE_CANDIDATE, variants extraction_stage / extraction. D-AUD-04 is specified with conformance evidence, **pending Architecture/Engineering review**, not Approved. Existing product/provider/history/policy decisions remain open.

> Task17 (2026-10-18): D-AUD-02 is **Specified — Pending Architecture/Security Review**. [ADR-011](../domain/10_AI_PROVIDER_GATEWAY_ADR.md) and [Gateway DTO contracts](../contracts/ai-provider/README.md) define the DI-only provider route. Extraction owns deterministic-first logic, extraction templates and semantic/evidence validation; Gateway enforces provider policy and invokes its adapters. No Orchestrator dependency, direct-provider bypass or approval authority is added.

> Final audit (2026-10-16): “Intake/Processing/Extraction/Knowledge Management/Context Assembly/AI Execution Job” means a logical correlated operation/status view, not an additional Prisma domain table. Queue transport state is infrastructure-owned under [ADR-010](../domain/09_LEAN_MVP_ARCHITECTURE_ADR.md). Current working text requires integrated review; historical approval footers are not current sign-off.

> Approval evidence audit (2026-10-13): [DECISION_REGISTER.md](../DECISION_REGISTER.md). Recorded baseline engineering decisions are preserved. Approved labels do not sign off pending import product choices D-IMP-01/02/03, later integrated PRD revisions, or proposed legal/operational retention periods. Dependency/release gates remain disclosed.

> Scope authority (2026-10-13): [MVP_SCOPE.md](../MVP_SCOPE.md). This document specifies intended behavior; design approval does not establish implementation. Historical decisions and long-term concepts do not expand MVP.

Document

[03_KNOWLEDGE_EXTRACTION_SERVICE.md](03_KNOWLEDGE_EXTRACTION_SERVICE.md)

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

Emit KNOWLEDGE_CANDIDATE using [canonical Artifact v2 contracts](../contracts/artifacts/README.md) and the [typed payload schema](../contracts/artifacts/2.0.0/knowledge_candidate.schema.json). Result fields live in payload.data; IDs/correlation/producer/stage/schemaVersion/ArtifactStatus live in the envelope. Registered variants: extraction_stage / extraction. Every checkpoint has exact operationStatus PENDING/PARTIAL/SUCCEEDED/FAILED/CANCELLED/TIMEOUT where allowed by its schema; terminal commits and approved snapshots are SUCCEEDED only. Final downstream use requires VALID + SUCCEEDED and the appropriate final variant, never a partial/error record or eligibility-only knowledge approval. No service-specific payload/error enum may be invented.

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
- Each completed extraction invocation has one final extraction outcome; additional typed stage/checkpoint artifacts preserve progress and internal retries.

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

Knowledge Management checks ontology, eligibility and explicit human approval; neither service proves objective truth.

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

The internal AI Provider Gateway is an infrastructure dependency for authorized model assistance, not a downstream business-result consumer. Successful extraction results are forwarded only to:

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

For MVP, one explicitly configured provider must pass D-SEC-02 review; none is selected or approved here. Additional providers are future options. Extraction invokes only the shared internal AI Provider Gateway through [ADR-011](../domain/10_AI_PROVIDER_GATEWAY_ADR.md); Gateway selects the extraction model under reviewed purpose policy. Extraction never calls AI Orchestrator or a vendor adapter directly. No provider/model/region fallback is permitted.

---

# Candidate Artifact

Emit KNOWLEDGE_CANDIDATE using [canonical Artifact v2 contracts](../contracts/artifacts/README.md) and the [typed payload schema](../contracts/artifacts/2.0.0/knowledge_candidate.schema.json). Result fields live in payload.data; IDs/correlation/producer/stage/schemaVersion/ArtifactStatus live in the envelope. Registered variants: extraction_stage / extraction. Every checkpoint has exact operationStatus PENDING/PARTIAL/SUCCEEDED/FAILED/CANCELLED/TIMEOUT where allowed by its schema; terminal commits and approved snapshots are SUCCEEDED only. Final downstream use requires VALID + SUCCEEDED and the appropriate final variant, never a partial/error record or eligibility-only knowledge approval. No service-specific payload/error enum may be invented. Use stable candidateItems item IDs and exact KnowledgeEntityType names. Illustrative Business Profile/Offering/Customer Segment/Brand Identity and Solves/Consumes examples elsewhere are semantic explanations, not wire discriminators; only active ontology-eligible fields/relationships can be serialized. Extraction stages may not fabricate manual-only values, approval, verification or source IDs.

---

# Security Requirements

The service must enforce:

- Provenance integrity
- Immutable artifacts
- Prompt version tracking
- Input validation
- Output schema validation

Sensitive prompts may leave the platform only for explicitly reviewed, minimized provider processing under the [security provider contract](../SECURITY_THREAT_MODEL.md#upload-quarantine-and-provider-contracts); prevent all unauthorized disclosure.

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
- Interactive extraction-stage corrections (later phase; post-extraction human review remains MVP)
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

[03_ENGINEERING_BIBLE.md](../BIBLE/03_ENGINEERING_BIBLE.md)

---

# Version History

## Version 1.0.0

Initial design baseline; production readiness was not verified. Original specification for the Knowledge Extraction Service.

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

Draft — current integrated Architecture/Engineering review pending; historical baseline evidence retained

Version

1.0.0

Effective Date

2026-06-30

---

## Conversation deletion and retention contract

Knowledge candidates and their source provenance are independently owned import/knowledge records. Conversation deletion does not erase them. Conversation-owned copies of extraction results inside generation context are purged; source retention/erasure requires its own authorized workflow and protected-reference review.

Canonical lifecycle: [DATA_LIFECYCLE.md](../DATA_LIFECYCLE.md). Proposed active-system removal within 30 days requires legal and operational approval; backups expire separately. Normal service access cannot bypass deletedAt, retry/exception retention remains inaccessible, and purge completion requires verified inventory cleanup. This specifies planned behavior, not an implemented purge process.

---

## Material fact evidence contract

Extraction proposes typed fact keys and MANUAL/IMPORTED/DERIVED origins under [KNOWLEDGE_PROVENANCE.md](../KNOWLEDGE_PROVENANCE.md); it cannot claim Owner approval or verification. Every imported proposed value carries source Artifact/Document and available location, or an explicit location-unavailable reason. Inferred claims are DERIVED with pinned evidence/input lineage, not disguised imports; automatic knowledge inference remains deferred. Knowledge Management compares proposals with current approved facts and presents conflicts; extraction never writes projections or history heads.

---

## Current backend and authentication boundary

Implementation target: NestJS dependency-injected core module with Prisma/PostgreSQL persistence behind its permitted application boundary, per [ADR-009](../domain/08_BACKEND_AUTH_AND_CONSTRAINTS_ADR.md). The service does not create public login endpoints, issue user tokens, or choose an identity vendor. Receive validated principal/Organization context, enforce tenant ownership for reads/writes and pass deletion/readiness guards where relevant. Provider/API credentials remain server-side configuration and are distinct from user sessions; never persist access/refresh tokens in artifacts or knowledge. SQL list cardinality/NOT NULL guards supplement, rather than replace, approved-field/provenance validation. These are planned contracts, not implemented-provider claims.

---

# END OF DOCUMENT


# Task 10 — Security launch contract

SEC-T01/06/07 require source text separated from application instructions, bounded schema-validated output, genuine source references and reviewed provider disclosure. Extraction can create candidates only; it cannot approve, write authoritative projections, fetch model-proposed URLs or change tenant context. Reject forged approval fields and fabricated attribution.

[SECURITY_THREAT_MODEL.md](../SECURITY_THREAT_MODEL.md) defines mandatory SEC-01–06, threat controls SEC-T01–08 and acceptance scenarios SEC-AT-01–08. These are specified launch gates, not implemented controls or a new approval. Security/Engineering must record enabled-path evidence and resolve provider, parser/limit and operational decisions D-SEC-01/02/03 before release. Optional later defenses cannot replace mandatory isolation, authorization or human approval.


# Task 11 — Approval-based knowledge improvement

Owner-requested single-source import extraction is the scoped MVP candidate-generation exception. Automatic extraction of facts from conversations/ratings and background inference are later-phase. Preserve confidence basis and evidence, never fabricate approval or treat confidence as calibrated accuracy; candidates require explicit authorized review.

[KNOWLEDGE_LEARNING_LIFECYCLE.md](../KNOWLEDGE_LEARNING_LIFECYCLE.md) defines the MVP/later boundary, minimum payload/API contracts, correction acceptance, independently reviewed factual accuracy, staleness and paired repeated-error metrics, plus KL-AT-01–14 acceptance scenarios. This is specified behavior pending review/implementation evidence, not a claim of training, automatic accuracy improvement or new approval.


# Task 12 — Lean MVP deployment boundary

Run import extraction asynchronously in the shared NestJS worker role through the internal AI Provider Gateway and its replaceable reviewed adapters. Durable attempts, schema validation, tenant/evidence checks and operation idempotency remain mandatory. No separate extraction deployment, model service, Go runtime or vector database is required.

[ADR-010](../domain/09_LEAN_MVP_ARCHITECTURE_ADR.md) recommends one backend codebase/release with API and worker roles, PostgreSQL-backed jobs, private object storage and isolated parsers. Redis/BullMQ, Qdrant, Go application workers and independent domain microservices are conditional future alternatives. No infrastructure migration or runtime verification is claimed; D-ARCH-01/02 and existing security/policy gates remain pending.


## Task17 — Canonical provider invocation and acceptance

[ADR-011](../domain/10_AI_PROVIDER_GATEWAY_ADR.md) defines exact extraction/generation sequences, responsibility/policy matrix, partial/failure handling, safe error mapping, total retry/cost limits, lease fencing and cancellation/authorization rechecks before publication. [Gateway DTO contracts](../contracts/ai-provider/README.md) defines exact request/response/null/schema rules and AT-17-01–17. Gateway success is neither human approval nor Message completion. Extraction emits only existing KNOWLEDGE_CANDIDATE; Context/Prompt/Response remain their existing producers. v2.0.0 and Prisma are unchanged. Provider execution metadata absent from extraction payloads belongs only in reviewed content-free operational telemetry, never a new ledger.

One reviewed MVP provider is required, none selected here. D-AUD-02 review, D-SEC-02 disclosure/privacy, D-GW-01 numeric policies and actual runtime/tenant/queue integration evidence remain launch dependencies. Standalone fixture tests do not demonstrate deployed controls. No new endpoint, microservice or product capability is introduced.


## Task18 — Selected extraction and review closure

[ADR-012](../domain/11_IMPORT_LIFECYCLE_ADR.md) specifies aggregate lifecycle, selected stage bindings and frozen review candidates pending D-AUD-07 review. Keep Artifact2.0 and Gateway1.0 serialization unchanged. Required-model failure with deterministic fragments remains PARTIAL plus safe failed-stage evidence; no eligible review set or full-success fallback. Retry within current authorized claim/budget or close failure through the application/KM control boundary. Extraction cannot approve facts, close review or release admission by emitting SUCCEEDED. Partial acceptance policy remains D-IMP-LC-02 pending.


## Task19 — Literal evidence proposals

[ADR-013](../domain/12_SOURCE_EVIDENCE_MAPPING_ADR.md) requires proposals to preserve genuine source/Document/chunk identity and literal support; model pages/quotes/offsets are untrusted and must verify. Normalized text is not original text, disjoint spans are not one quote, and `$149`/ambiguous dates cannot gain unsupported meaning. Extraction may propose locator/support inputs for KM validation but cannot write authoritative verification/approval or fetch URLs. Existing v2 evidence DTO remains closed; proposed2.2 binding attaches typed evidence by original candidate key/hash. Missing original precision can be warning review with genuine support, invalid references/digests/quotes cannot. Parser retry/stale evidence follows ADR-012 selected attempts and frozen review; mapping success never makes partial extraction complete or approves a fact.


## Task20 — Relationship persistence and lifecycle

**Specified — Pending Architecture/Product Review (D-AUD-06).** [ADR-014](../domain/13_ONTOLOGY_RELATIONSHIP_PERSISTENCE_ADR.md) and [canonical registry/contracts](../contracts/ontology-relations/README.md) define the versioned mapping.

Extraction may emit existing v2 candidateRelationships only as untrusted proposals. Never create approved edges, infer TARGETS from co-membership or convert approval of an entity field into predicate approval. Retain original proposal DTO digest/Artifact and actual source references; no fabricated evidence offsets/relationship fields. Imported TARGETS needs actual approved supporting fact/value refs and validated Task19 binding, then separate Owner review under D-REL-02. Competitor import remains excluded. Gateway/source-evidence/import contract bundles are unchanged; source deletion/precision remains ADR-013 policy.
