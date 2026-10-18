# Service Specification — Context Engine

> Task16 (2026-10-17): [canonical Artifact v2 contracts](../contracts/artifacts/README.md) and the [registered schemas](../contracts/artifacts/2.0.0/artifact.schema.json) define exact envelope/payload/stage/status/error structure. This service emits PROMPT_CONTEXT, variants context_stage / context. D-AUD-04 is specified with conformance evidence, **pending Architecture/Engineering review**, not Approved. Existing product/provider/history/policy decisions remain open.

> Final audit (2026-10-16): D-AUD-01 tracks conversation-history selection/limits, which are not settled by a persistent Conversation. ADR-015 specifies D-AUD-03 with Product/Architecture review pending; D-KQ-05 gates ranking/coverage and no score gate is approved; neither confidence nor score proves truth or overrides mandatory readiness. See [final-audit decisions](../DECISION_REGISTER.md#final-audit-decisions) for options and ownership.

> Final audit (2026-10-16): “Intake/Processing/Extraction/Knowledge Management/Context Assembly/AI Execution Job” means a logical correlated operation/status view, not an additional Prisma domain table. Queue transport state is infrastructure-owned under [ADR-010](../domain/09_LEAN_MVP_ARCHITECTURE_ADR.md). Current working text requires integrated review; historical approval footers are not current sign-off.

> Approval evidence audit (2026-10-13): [DECISION_REGISTER.md](../DECISION_REGISTER.md). Recorded baseline engineering decisions are preserved. Approved labels do not sign off pending import product choices D-IMP-01/02/03, later integrated PRD revisions, or proposed legal/operational retention periods. Dependency/release gates remain disclosed.

> Scope authority (2026-10-13): [MVP_SCOPE.md](../MVP_SCOPE.md). This document specifies intended behavior; design approval does not establish implementation. Historical decisions and long-term concepts do not expand MVP.

Document

[05_CONTEXT_ENGINE.md](05_CONTEXT_ENGINE.md)

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

The Context Engine assembles the optimal business context for AI execution.

It retrieves, ranks, enriches and compresses organizational knowledge into a structured Prompt Context Artifact.

The service never generates prompts or AI responses.

---

# Mission

Deliver the smallest, highest-quality context that maximizes AI response quality.

---

# Responsibilities

The Context Engine is responsible for:

- Intent analysis
- Retrieval planning
- Knowledge retrieval
- Context ranking
- Business rule injection
- Brand voice injection
- Organization memory selection
- Context compression
- Context scoring
- Prompt Context Artifact generation
- Creating a Context Assembly Job

---

# Non-Responsibilities

The service must never:

- Generate prompts
- Select AI providers
- Call LLM APIs
- Produce AI responses
- Validate business knowledge
- Persist knowledge

---

# Input

Accepted inputs:

- User Request
- Approved Knowledge Artifacts
- Organization Memory
- Business Rules
- Conversation Context (Future)

---

# Output

Emit PROMPT_CONTEXT using [canonical Artifact v2 contracts](../contracts/artifacts/README.md) and the [typed payload schema](../contracts/artifacts/2.0.0/prompt_context.schema.json). Result fields live in payload.data; IDs/correlation/producer/stage/schemaVersion/ArtifactStatus live in the envelope. Registered variants: context_stage / context. Every checkpoint has exact operationStatus PENDING/PARTIAL/SUCCEEDED/FAILED/CANCELLED/TIMEOUT where allowed by its schema; terminal commits and approved snapshots are SUCCEEDED only. Final downstream use requires VALID + SUCCEEDED and the appropriate final variant, never a partial/error record or eligibility-only knowledge approval. No service-specific payload/error enum may be invented.

---

# Core Principle

Retrieval finds information.

Context Assembly prepares intelligence.

These are different responsibilities.

---

# Context Assembly Pipeline

```
User Request
        │
        ▼
Intent Analyzer
        │
        ▼
Retrieval Planner
        │
        ▼
Knowledge Retrieval
        │
        ▼
Context Ranking
        │
        ▼
Business Rule Injection
        │
        ▼
Brand Voice Injection
        │
        ▼
Memory Selection
        │
        ▼
Context Compression
        │
        ▼
Prompt Context Artifact
```

---

# Design Principles

Quality over quantity.

Only relevant knowledge should enter the context.

---

Composable.

Every stage operates independently.

---

Deterministic where possible.

Ranking should rely on deterministic scoring before AI reasoning.

---

Provider Independent.

The Context Engine must remain independent from any LLM vendor.

---

Explainable.

Every context element must preserve provenance.

---

# Success Criteria

The Context Engine succeeds when:

- Retrieved context is relevant.
- Context size is minimized.
- Business rules are preserved.
- Brand voice remains consistent.
- Provenance is maintained.
- Prompt Context Artifacts are reusable.
- Each completed context invocation has one final context outcome; additional context_stage checkpoints retain progress/retries.

---

Status

Draft

---

# Context Assembly Pipeline

Every request follows the same context assembly pipeline.

```
User Request
        │
        ▼
Intent Analyzer
        │
        ▼
Retrieval Planner
        │
        ▼
Knowledge Retrieval
        │
        ▼
Context Ranking
        │
        ▼
Business Rule Injection
        │
        ▼
Brand Voice Injection
        │
        ▼
Memory Selection
        │
        ▼
Context Compression
        │
        ▼
Context Validation
        │
        ▼
Prompt Context Artifact
```

Each stage produces a new immutable Context Artifact.

---

# Stage 1 — Intent Analyzer

Purpose

Understand the objective of the user request.

Outputs

- Intent
- Required knowledge domains
- Required business entities
- Required memory types
- Retrieval strategy

Intent analysis should be deterministic whenever possible.

---

# Stage 2 — Retrieval Planner

Purpose

Create an optimized retrieval plan.

Planner decisions include:

- Which indexes to search
- Retrieval depth
- Graph traversal
- Semantic search
- Hybrid search
- Metadata filters

The planner optimizes quality before speed.

---

# Stage 3 — Knowledge Retrieval

Purpose

Retrieve candidate knowledge.

Possible retrieval strategies

- Vector Search
- Bounded approved snapshot relationship lookup (conditional D-REL-02; no graph DB)
- Keyword Search
- Metadata Filtering
- Hybrid Retrieval

The service may combine multiple retrieval methods.

---

# Stage 4 — Context Ranking

Purpose

Rank retrieved knowledge by usefulness.

Proposed rank/1.0.0 uses eligibility, required profile facts, requested entity match, literal-token overlap and stable typed identity tie-breaks. ADR-015 specifies exact ordering/fallback; D-KQ-05 review required. Semantic relevance, numeric confidence/trust weights, freshness decay and arbitrary business priority are not enabled inputs.

---

# Stage 5 — Business Rule Injection

Purpose

Inject mandatory organizational rules.

Examples

- Compliance policies
- Writing restrictions
- Legal requirements
- Product limitations
- Organization guidelines

Business rules always override retrieved knowledge when conflicts occur.

---

# Stage 6 — Brand Voice Injection

Purpose

Inject organization-specific communication style.

Examples

- Tone
- Personality
- Vocabulary
- Writing conventions
- Messaging principles

Brand Voice is retrieved from the Knowledge Domain.

---

# Stage 7 — Memory Selection

Purpose

Select additional contextual memory.

Memory Types

Knowledge Memory

Approved organizational knowledge.

Working Memory

Temporary execution state for the current request.

Conversation Memory

Multi-turn conversational history.

Organizational Memory

Reusable organizational preferences and reusable assets.

The MVP includes:

- Knowledge Memory
- Working Memory

---

# Stage 8 — Context Compression

Purpose

Reduce context size without losing important information.

Compression strategies

- Remove redundancy
- Merge similar facts
- Summarize low-priority knowledge
- Preserve critical evidence
- Preserve provenance

Compression must never change business meaning.

---

# Stage 9 — Context Validation

Purpose

Validate the final Prompt Context Artifact.

Validation includes

- Required business rules
- Required brand voice
- Required provenance
- Context size limits
- Duplicate removal
- Missing mandatory entities

Invalid contexts must never be sent downstream.

---

# Prompt Context Artifact

Emit PROMPT_CONTEXT using [canonical Artifact v2 contracts](../contracts/artifacts/README.md) and the [typed payload schema](../contracts/artifacts/2.0.0/prompt_context.schema.json). Result fields live in payload.data; IDs/correlation/producer/stage/schemaVersion/ArtifactStatus live in the envelope. Registered variants: context_stage / context. Every checkpoint has exact operationStatus PENDING/PARTIAL/SUCCEEDED/FAILED/CANCELLED/TIMEOUT where allowed by its schema; terminal commits and approved snapshots are SUCCEEDED only. Final downstream use requires VALID + SUCCEEDED and the appropriate final variant, never a partial/error record or eligibility-only knowledge approval. No service-specific payload/error enum may be invented. Canonical result fields/closed nested memory/fact-reference types are defined once in the schemas. D-AUD-01 history selection, D-AUD-03 score policy and D-AUD-06 graph projection remain separate decisions; a schema does not enable new retrieval infrastructure.

---

# Context Quality Score

A context may expose proposed context-coverage/1.0.0, a required-fact coverage proxy. D-KQ-05 review is pending; default NOT_EVALUATED. Unknown request requirements are UNKNOWN, not zero; missing manifest and no applicable requirements differ. Exact formula/inputs/rounding and versioned assessment are in ADR-015/quality1.0. It is monitoring metadata, not a quality/readiness/approval gate, semantic accuracy or compression-quality measurement.

---

# Processing Guarantees

The Context Engine guarantees:

- Explainable context assembly
- Full provenance
- Provider independence
- Deterministic execution where possible
- Minimal redundant context
- Immutable Prompt Context Artifacts
- Idempotent context assembly

---

Status

Draft

---

# Service Interfaces

The Context Engine exposes application interfaces for context assembly.

Primary operations:

- Build Context
- Get Context Assembly Job Status
- Rebuild Context

The service never exposes internal retrieval or ranking stages.

---

# Upstream Dependencies

The service accepts requests only from:

- AI Orchestrator

Future:

- Workflow Engine
- Agent Runtime

Direct user access is prohibited.

---

# Downstream Integrations

The Context Engine produces Prompt Context Artifacts for:

- AI Orchestrator

The service must never communicate directly with:

- LLM Providers
- Prompt Templates
- User Interfaces

---

# Retrieval Strategy

The retrieval strategy is configurable.

Strategy extension points (not all required or delivered in MVP):

- Vector Retrieval
- Pinned approved snapshot relationship lookup (conditional D-REL-02)
- Keyword Retrieval
- Metadata Filtering
- Hybrid Retrieval

The Retrieval Planner selects one or more strategies for every request.

---

# Context Profiles

The Context Engine supports configurable Context Profiles.

Examples:

- Marketing
- Customer Support
- Sales
- Product
- Executive

Each profile defines:

- Retrieval priorities
- Preferred knowledge domains
- Business rules
- Brand Voice configuration
- Memory selection policy

MVP:

Context Profiles are configurable but optional.

---

# Context Budget

Every Prompt Context Artifact must respect a configurable context budget.

The budget includes:

- Maximum tokens
- Maximum knowledge artifacts
- Maximum memory artifacts
- Maximum business rules
- Maximum evidence references

Context Compression is responsible for enforcing these limits.

---

# Artifact Contract

Emit PROMPT_CONTEXT using [canonical Artifact v2 contracts](../contracts/artifacts/README.md) and the [typed payload schema](../contracts/artifacts/2.0.0/prompt_context.schema.json). Result fields live in payload.data; IDs/correlation/producer/stage/schemaVersion/ArtifactStatus live in the envelope. Registered variants: context_stage / context. Every checkpoint has exact operationStatus PENDING/PARTIAL/SUCCEEDED/FAILED/CANCELLED/TIMEOUT where allowed by its schema; terminal commits and approved snapshots are SUCCEEDED only. Final downstream use requires VALID + SUCCEEDED and the appropriate final variant, never a partial/error record or eligibility-only knowledge approval. No service-specific payload/error enum may be invented. Canonical result fields/closed nested memory/fact-reference types are defined once in the schemas. D-AUD-01 history selection, D-AUD-03 score policy and D-AUD-06 graph projection remain separate decisions; a schema does not enable new retrieval infrastructure.

---

# Security Requirements

The service must enforce:

- Authorization
- Provenance integrity
- Retrieval isolation
- Secure memory access
- Context size enforcement

Sensitive organizational knowledge must never leak across organizations.

---

# Observability

Operational metrics include:

- Retrieval latency
- Ranking latency
- Compression latency
- Context size
- Context Quality Score
- Context Assembly Success Rate
- Average Context Build Time
- Retrieval source distribution
- Cache hit ratio (Future)

Telemetry must never expose confidential organizational content.

---

# Architectural Decisions

## ADR-001

Context Assembly is separated from Prompt Generation.

Reason:

Context quality and prompt quality evolve independently.

---

## ADR-002

Retrieval is only one stage of Context Assembly.

Reason:

High-quality AI responses require more than document retrieval.

---

## ADR-003

Memory is modeled as multiple independent memory types.

Reason:

Different memory categories have different lifecycles and retrieval strategies.

---

## ADR-004

Context Profiles are configuration-driven.

Reason:

Organizations should customize context behavior without changing service logic.

---

# MVP Scope

Included:

- Intent Analysis
- Retrieval Planning
- Hybrid Retrieval
- Context Ranking
- Business Rule Injection
- Brand Voice Injection
- Knowledge Memory
- Working Memory
- Context Compression
- Context Validation
- Prompt Context Artifact generation

---

# Deferred Features

Post-MVP:

- Conversation Memory
- Organizational Memory
- Adaptive Context Profiles
- Predictive Retrieval
- Cache-aware Retrieval
- Personalized Context Assembly
- Multi-agent Context Sharing

---

# Definition of Done

The Context Engine is complete when:

- Prompt Context Artifacts are generated successfully.
- Context coverage is specified as a reproducible proxy; semantic quality remains empirically unverified.
- Business Rules are injected correctly.
- Brand Voice remains consistent.
- Context size respects configured budgets.
- Provenance is preserved.
- Retrieval strategies are configurable.
- Every context assembly request produces exactly one traceable Context Assembly Job.
- Documentation is synchronized.

Implementation without explainable context assembly is considered incomplete.

---

# Related Documents

docs/services/04_KNOWLEDGE_MANAGEMENT_SERVICE.md

docs/services/06_AI_ORCHESTRATOR.md

docs/domain/02_ARTIFACT_MODEL.md

docs/domain/03_BUSINESS_ONTOLOGY.md

[03_ENGINEERING_BIBLE.md](../BIBLE/03_ENGINEERING_BIBLE.md)

---

# Version History

## Version 1.0.0

Initial design baseline; production readiness was not verified. Original specification for the Context Engine.

Defines:

- Context Assembly pipeline
- Retrieval strategies
- Memory model
- Context Profiles
- Artifact contract
- Context Quality Score
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

Every generation Prompt Context artifact and working-memory/cache/index entry carries the owning Conversation and Organization identifiers. Retrieval checks the Conversation tombstone before use/publication. Conversation deletion invalidates operational entries immediately and purges owned copies within the proposed active target. Knowledge Memory referencing independent approved Brand Brain facts remains intact; future Conversation Memory must inherit this lifecycle, and organizational memory must separate independently approved facts from conversation-owned content.

Canonical lifecycle: [DATA_LIFECYCLE.md](../DATA_LIFECYCLE.md). Proposed active-system removal within 30 days requires legal and operational approval; backups expire separately. Normal service access cannot bypass deletedAt, retry/exception retention remains inaccessible, and purge completion requires verified inventory cleanup. This specifies planned behavior, not an implemented purge process.

---

## Approved revision consumption

Read Brand.currentRevisionId and transactionally consistent approved projections/KnowledgeIndex via Knowledge Management. Pin generation context to that revision and its field evidence. Pending candidates, incomplete repeatable records and draft skeleton fields do not enter approved business context. Apply effective readiness independently of persisted completeness; show stale/unknown verification warnings without claiming fresh facts. See [KNOWLEDGE_PROVENANCE.md](../KNOWLEDGE_PROVENANCE.md).

---

## Readiness and first-value safeguards

Apply [PRODUCT_METRICS.md](../PRODUCT_METRICS.md): mandatory approved facts and effective readiness gate new business-aware generation. Empty/invalid approved context produces an explicit recoverable limitation, not an ungrounded response counted as value. Complete members only; pin approved revision and supporting fact keys for output qualification. Partial approved Brief presentation is independent of generation readiness.

---

## Context stages versus Workspace lifecycle

Context assembly stages are internal work for one assistant attempt’s PREPARING_CONTEXT phase, not Conversation states. Successful assembly allows that Message to proceed to GENERATING; missing/invalid required context ends that attempt as FAILED with an explicit recoverable limitation. The Conversation remains a multi-turn container; deletion independently prevents late publication. Canonical transitions: [Workspace State Management](../prd/02_AI_WORKSPACE_PRD.md#state-management). ArtifactStatus and contextAssemblyStatus are separate artifact/service contracts, not substitutes for MessageStatus.

---

## Current backend and authentication boundary

Implementation target: NestJS dependency-injected core module with Prisma/PostgreSQL persistence behind its permitted application boundary, per [ADR-009](../domain/08_BACKEND_AUTH_AND_CONSTRAINTS_ADR.md). The service does not create public login endpoints, issue user tokens, or choose an identity vendor. Receive validated principal/Organization context, enforce tenant ownership for reads/writes and pass deletion/readiness guards where relevant. Provider/API credentials remain server-side configuration and are distinct from user sessions; never persist access/refresh tokens in artifacts or knowledge. SQL list cardinality/NOT NULL guards supplement, rather than replace, approved-field/provenance validation. These are planned contracts, not implemented-provider claims.

---

# END OF DOCUMENT


# Task 10 — Security launch contract

SEC-T01/04/06/07 require tenant/Brand/current-approved-revision filters before ranking and verification of every result, cache scoping and source integrity. Exclude candidates and superseded/tombstoned content. Business Rule/Brand Voice Injection headings mean assembly of approved business data, never promotion to system-policy authority. Retrieved facts, memory and prior responses cannot override authorization, approval or tool policy.

[SECURITY_THREAT_MODEL.md](../SECURITY_THREAT_MODEL.md) defines mandatory SEC-01–06, threat controls SEC-T01–08 and acceptance scenarios SEC-AT-01–08. These are specified launch gates, not implemented controls or a new approval. Security/Engineering must record enabled-path evidence and resolve provider, parser/limit and operational decisions D-SEC-01/02/03 before release. Optional later defenses cannot replace mandatory isolation, authorization or human approval.


# Task 11 — Approval-based knowledge improvement

Memory selection is retrieval, not model training or approval. Approved Brand Voice belongs to business knowledge; inferred personal preferences are future scope. Each generation pins the current approved revision at context preparation and records it in the context artifact; an older in-flight attempt may finish on its pinned revision. New requests cannot mix old caches with the new head. No standalone Memory Engine contract or hidden preference store is implied.

[KNOWLEDGE_LEARNING_LIFECYCLE.md](../KNOWLEDGE_LEARNING_LIFECYCLE.md) defines the MVP/later boundary, minimum payload/API contracts, correction acceptance, independently reviewed factual accuracy, staleness and paired repeated-error metrics, plus KL-AT-01–14 acceptance scenarios. This is specified behavior pending review/implementation evidence, not a claim of training, automatic accuracy improvement or new approval.


# Task 12 — Lean MVP deployment boundary

Use bounded approved-revision structured/keyword/metadata retrieval in PostgreSQL first. Vector/graph/hybrid strategies described above are extension capabilities, not all implemented or mandatory MVP dependencies. If semantic retrieval is required by evaluation, prefer pgvector in PostgreSQL; Qdrant requires a later measured decision. KnowledgeIndex is not an embedding table. Any derived embedding projection requires a separate schema/migration contract and the same tenant/head/deletion guards.

[ADR-010](../domain/09_LEAN_MVP_ARCHITECTURE_ADR.md) recommends one backend codebase/release with API and worker roles, PostgreSQL-backed jobs, private object storage and isolated parsers. Redis/BullMQ, Qdrant, Go application workers and independent domain microservices are conditional future alternatives. No infrastructure migration or runtime verification is claimed; D-ARCH-01/02 and existing security/policy gates remain pending.


## Task20 — Relationship persistence and lifecycle

**Specified — Pending Architecture/Product Review (D-AUD-06).** [ADR-014](../domain/13_ONTOLOGY_RELATIONSHIP_PERSISTENCE_ADR.md) and [canonical registry/contracts](../contracts/ontology-relations/README.md) define the versioned mapping.

MVP relationship retrieval is bounded JSON lookup from one authorized approved snapshot/revision, not graph-search infrastructure. Proposed final context2.3 selects exact edge/rule refs with truncation metadata; earlier lifecycle/checkpoint/errors remain2.0. Explicit predicate use and derived USES are disabled until D-REL-02; global approved Voice injection remains unchanged. Apply active member/current deletion/Brand archival guards, stale-support filtering and tenant checks; never consume candidates or mixed-revision row values. One-hop ≤32 edges/32 nodes with deterministic type/ID ordering, subject to review. Reject stale/orphan cache authority and use canonical fallback or fail safely. Supporting facts/evidence retain their approved references. Existing approved structured keyword/metadata retrieval still works without explicit edges.


## Task21 — Taxonomy and knowledge-quality contracts

**Specified — Pending Product/Architecture Review (D-AUD-03).** [ADR-015](../domain/14_KNOWLEDGE_QUALITY_AND_TAXONOMY_ADR.md) and [canonical quality1.0 contracts](../contracts/knowledge-quality/README.md) define semantics, versions, calculations and review gates.

Context ranking is proposed rank/1.0.0: eligibility first, required-manifest fact flag, requested entity flag, literal-token overlap, then UTF8 typed identity. No unsupported confidence/trust/semantic/freshness coefficients. Missing query/profile uses deterministic identity fallback; unknown required manifest means unknown coverage. Proposed context-coverage/1.0.0 is required-ref intersection/required-ref count, integer half-up, monitoring only. Diversity/freshness are separate descriptive signals, business priority needs actual profile inputs, semantic/compression quality is not evaluated. Prefer whole-fact selection/omission, no claim summarization preserves all meaning. One approved revision pins facts and Task20 relationship refs; current auth/readiness/source/deletion/security gates always apply. No valid context fails safely, never unapproved/generic fallback. Existing D-AUD-01 history and D-GW-01 budgets stay pending.
