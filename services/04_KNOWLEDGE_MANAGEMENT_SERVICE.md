# Service Specification — Knowledge Management Service

> Task16 (2026-10-17): [canonical Artifact v2 contracts](../contracts/artifacts/README.md) and the [registered schemas](../contracts/artifacts/2.0.0/artifact.schema.json) define exact envelope/payload/stage/status/error structure. This service emits KNOWLEDGE_CANDIDATE / APPROVED_KNOWLEDGE, variants governance_stage / candidate_decision / manual_commit / publication_attempt / approved_snapshot. D-AUD-04 is specified with conformance evidence, **pending Architecture/Engineering review**, not Approved. Existing product/provider/history/policy decisions remain open.

> Final audit (2026-10-16): D-AUD-03 tracks confidence/trust formulas and field vocabulary; D-AUD-06 tracks persisted ontology relationships. Approved means reviewed and structurally validated, not objectively true. [ADR-012](../domain/11_IMPORT_LIFECYCLE_ADR.md) specifies R23 / D-AUD-07 whole-import completion, pending Product/Architecture review. See [final-audit decisions](../DECISION_REGISTER.md#final-audit-decisions) for options and ownership.

> Final audit (2026-10-16): “Intake/Processing/Extraction/Knowledge Management/Context Assembly/AI Execution Job” means a logical correlated operation/status view, not an additional Prisma domain table. Queue transport state is infrastructure-owned under [ADR-010](../domain/09_LEAN_MVP_ARCHITECTURE_ADR.md). Current working text requires integrated review; historical approval footers are not current sign-off.

> Approval evidence audit (2026-10-13): [DECISION_REGISTER.md](../DECISION_REGISTER.md). Recorded baseline engineering decisions are preserved. Approved labels do not sign off pending import product choices D-IMP-01/02/03, later integrated PRD revisions, or proposed legal/operational retention periods. Dependency/release gates remain disclosed.

> Scope authority (2026-10-13): [MVP_SCOPE.md](../MVP_SCOPE.md). This document specifies intended behavior; design approval does not establish implementation. Historical decisions and long-term concepts do not expand MVP.

Document

[04_KNOWLEDGE_MANAGEMENT_SERVICE.md](04_KNOWLEDGE_MANAGEMENT_SERVICE.md)

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

The Knowledge Management Service is responsible for validating, governing, versioning and persisting business knowledge within the Knowledge Domain.

It transforms provisional Knowledge Candidate Artifacts into trusted organizational knowledge.

This service is the guardian of knowledge quality.

---

# Mission

Maintain a trustworthy, consistent and continuously evolving knowledge base for every organization.

---

# Responsibilities

The Knowledge Management Service is responsible for:

- Candidate validation
- Business rule validation
- Ontology validation
- Duplicate detection
- Conflict detection
- Knowledge merging
- Version management
- Confidence calculation
- Approval workflow
- Persistence
- Knowledge Graph updates
- Audit logging
- Domain event publication
- Creating a Knowledge Management Job

---

# Non-Responsibilities

The service must never:

- Parse documents
- Extract information
- Interpret semantics
- Generate AI responses
- Retrieve context
- Select AI providers

Those responsibilities belong to upstream and downstream services.

---

# Input

Accepted input

Knowledge Candidate Artifact

Containing

- Candidate Entities
- Candidate Relationships
- Provenance
- Extraction Confidence
- Processing Metadata

---

# Output

Emit KNOWLEDGE_CANDIDATE / APPROVED_KNOWLEDGE using [canonical Artifact v2 contracts](../contracts/artifacts/README.md) and the [typed payload schema](../contracts/artifacts/2.0.0/knowledge_candidate.schema.json). Result fields live in payload.data; IDs/correlation/producer/stage/schemaVersion/ArtifactStatus live in the envelope. Registered variants: governance_stage / candidate_decision / manual_commit / publication_attempt / approved_snapshot. Every checkpoint has exact operationStatus PENDING/PARTIAL/SUCCEEDED/FAILED/CANCELLED/TIMEOUT where allowed by its schema; terminal commits and approved snapshots are SUCCEEDED only. Final downstream use requires VALID + SUCCEEDED and the appropriate final variant, never a partial/error record or eligibility-only knowledge approval. No service-specific payload/error enum may be invented.

---

# Core Principle

Knowledge is earned, not extracted.

Extraction proposes.

Management validates.

---

# Management Pipeline

```
Knowledge Candidate Artifact
            │
            ▼
Business Validation
            │
            ▼
Ontology Validation
            │
            ▼
Duplicate Detection
            │
            ▼
Conflict Detection
            │
            ▼
Knowledge Merge
            │
            ▼
Confidence Calculation
            │
            ▼
Governance Eligibility
            │
            ▼
Owner Review and Confirmation (MVP)
            │
            ▼
Persistence
            │
            ▼
Knowledge Graph Update
            │
            ▼
Approved Knowledge Artifact
```

Every stage must complete successfully before persistence.

---

# Design Principles

Trust First

Protect knowledge quality above ingestion speed.

---

Deterministic Governance

Business rules always take precedence over probabilistic AI output.

---

Immutable History

Knowledge evolves through versions, never by overwriting history.

---

Explainable Decisions

Every approval, rejection and merge decision must be explainable.

---

Traceable

Every knowledge record must preserve complete provenance.

---

# Success Criteria

The Knowledge Management Service succeeds when:

- Knowledge consistency improves over time.
- Duplicate information decreases.
- Conflicting information is detected automatically.
- Version history remains complete.
- Every approved fact is fully traceable.
- The Knowledge Domain remains internally consistent.
- Every Knowledge Candidate Artifact receives exactly one governance decision.

---

Status

Draft

---

# Knowledge Management Pipeline

Every Knowledge Candidate Artifact follows the same governance pipeline.

```
Knowledge Candidate Artifact
            │
            ▼
Schema Validation
            │
            ▼
Business Rule Validation
            │
            ▼
Ontology Validation
            │
            ▼
Duplicate Detection
            │
            ▼
Conflict Detection
            │
            ▼
Knowledge Merge
            │
            ▼
Knowledge Confidence Calculation
            │
            ▼
Policy Engine
            │
            ├──────── Auto Approve
            ├──────── Human Review
            ├──────── Needs More Evidence
            └──────── Reject
                    │
                    ▼
Owner Confirmation (required for eligible candidates; rejected candidates stop)
                    │
                    ▼
Persistence
                    │
                    ▼
Knowledge Graph Update
                    │
                    ▼
Approved Knowledge Artifact
```

The pipeline is deterministic whenever deterministic rules are available. The diagram includes future policy routing; MVP pauses eligible candidates for Owner confirmation and stops rejected candidates before authoritative persistence.

---

# Stage 1 — Schema Validation

Purpose

Ensure candidate artifacts conform to the expected schema.

Validation includes:

- Required fields
- Entity schema
- Relationship schema
- Metadata completeness
- Artifact version compatibility

Invalid artifacts are rejected immediately.

---

# Stage 2 — Business Rule Validation

Purpose

Validate candidates against business constraints.

Examples

- Required business profile fields
- Product ownership consistency
- Invalid pricing models
- Invalid lifecycle states
- Domain-specific constraints

Business rules always take precedence over AI output.

---

# Stage 3 — Ontology Validation

Purpose

Ensure extracted knowledge conforms to the Business Ontology.

Validation includes:

- Allowed entity types
- Allowed relationships
- Required attributes
- Cardinality rules
- Domain constraints

Ontology violations prevent approval.

---

# Stage 4 — Duplicate Detection

Purpose

Detect semantically equivalent knowledge.

Detection signals

- Canonical entity name
- Alias mapping
- Ontology identity
- Semantic similarity
- Provenance comparison

Duplicates are not automatically rejected.

They proceed to merge evaluation.

---

# Stage 5 — Conflict Detection

Purpose

Identify contradictory knowledge.

Examples

Old Pricing

↓

$99/month

New Pricing

↓

$149/month

Mission Statement A

↓

"Helping startups"

Mission Statement B

↓

"Serving enterprise companies"

Conflict detection never resolves conflicts automatically.

It produces structured conflict records.

---

# Stage 6 — Knowledge Merge

Purpose

Merge compatible knowledge into a single authoritative representation.

MVP merge behavior is an Owner-reviewed proposal: keep approved, replace, edit, or combine values with retained field/list-item evidence. Higher confidence, newer extraction or an automatic merge never replaces approved facts. Compare against current head; require expectedRevisionId and idempotency. Revalidate edited candidates before approving a new full snapshot. Contradictions are displayed side by side and unknown/stale verification produces review flags.

---

# Knowledge Confidence

Knowledge Confidence measures trustworthiness rather than extraction quality.

Inputs

- Extraction Confidence
- Source Reliability
- Source Freshness
- Cross-source Agreement
- Historical Stability
- Human Approval
- Ontology Consistency

Range

0–100

Knowledge Confidence is recalculated whenever knowledge changes.

---

# Policy Engine

Purpose

Determine the final governance decision.

Long-term policy outcomes (MVP uses eligibility or rejection followed by Owner confirmation; delegated Human Review and Needs More Evidence routing are future designs)

Auto Approve

Human Review

Needs More Evidence

Reject

Policies are configurable.

Organization-specific policies and delegated review routing are Phase 2 or later. MVP uses shared deterministic eligibility rules and mandatory Owner confirmation.

---

# Governance Principles

Knowledge is governed rather than accepted.

Every approval decision must be:

- Explainable
- Traceable
- Auditable
- Reproducible

---

# Processing Guarantees

The service guarantees:

- No invalid knowledge enters the Knowledge Domain.
- Knowledge history remains immutable.
- Every governance decision is explainable.
- Policy execution is deterministic.
- All changes are auditable.
- Idempotent governance decisions

---

Status

Draft

---

# Persistence Model

Provisional candidates and audit artifacts may be stored, but only human-approved knowledge may enter authoritative business state or KnowledgeIndex. Auto Approve is a governance eligibility result; it must pause before Persistence until the Owner confirms. Manual edits are explicit Owner approval and use the same validation/versioning path. The approval transaction creates a full APPROVED_KNOWLEDGE Artifact snapshot plus BrandBrainRevision metadata/completeness, updates current projections and KnowledgeIndex, and switches Brand.currentRevisionId under lock. Field origins/evidence and introducing/superseded/verification revision refs are preserved. No projection can be independently edited. Context Engine and Brand Brief may read only that approved state.

Persistence targets:

- Knowledge Domain
- Knowledge Graph
- Audit Store
- Version Store

Candidate Artifacts are never persisted as authoritative knowledge.

---

# Versioning Strategy

Knowledge is immutable.

Every approved modification or explicit field verification creates a new BrandBrainRevision and full approved Artifact snapshot. Inspect/diff historical versions; restoration creates a new revision linked to both previous head and restored source, never overwrites or pointer rollback. Resolve each field’s approver/time and last verification from its revision references.

Version metadata includes:

- Version ID
- Previous Version ID
- Artifact ID
- Change Type
- Change Reason
- Approved At
- Approved By (MVP: authenticated Owner ID)
- Ontology Version

History must never be overwritten.

---

# Audit Trail

Every governance action generates an immutable audit record.

Minimum audit fields:

- Audit ID
- Candidate ID
- Decision
- Policy Version
- Timestamp
- Correlation ID
- Source References
- Confidence Scores

Audit records are append-only.

---

# Knowledge Graph Update

After successful persistence, the Knowledge Graph is synchronized.

Operations include:

- Create Entity
- Update Entity Version
- Create Relationship
- Retire Relationship
- Update Relationship Version

Graph updates must be transactional with persistence.

---

# Domain Events

The service emits domain events after successful governance.

Core events:

- KnowledgeApproved
- KnowledgeRejected
- KnowledgeUpdated
- KnowledgeMerged
- KnowledgeArchived
- KnowledgeConflictDetected

Events are immutable and versioned.

---

# Source Trust Model

Every source has an associated Trust Score.

MVP

Static trust values configured by policy.

Future

Dynamic trust based on:

- Historical accuracy
- Cross-source agreement
- Human feedback
- Consistency over time
- Organization-specific policies

Trust Score contributes to Knowledge Confidence.

---

# Security Requirements

The service must enforce:

- Immutable knowledge history
- Immutable audit records
- Policy version tracking
- Encryption at rest
- Authorization for governance operations
- Tamper detection for persisted artifacts

---

# Observability

Operational metrics include:

- Approval Rate
- Rejection Rate
- Human Review Rate
- Conflict Rate
- Duplicate Rate
- Merge Success Rate
- Average Knowledge Confidence
- Governance Latency
- Governance Success Rate
- Policy Evaluation Duration

Business content must never be included in telemetry.

---

# Architectural Decisions

## ADR-001

Knowledge validation is separated from knowledge extraction.

Reason:

Extraction proposes facts; governance establishes trust.

---

## ADR-002

Approval decisions are delegated to a Policy Engine.

Reason:

Governance rules evolve independently from processing logic.

---

## ADR-003

Knowledge is immutable.

Reason:

Immutability guarantees traceability, reproducibility and complete history.

---

## ADR-004

Knowledge Confidence is distinct from Extraction Confidence.

Reason:

Correct extraction does not imply trustworthy knowledge.

---

## ADR-005

Source Trust Score influences Knowledge Confidence.

Reason:

Different sources have different levels of reliability, and trust should evolve over time.

---

# MVP Scope

Included:

- Schema validation
- Business rule validation
- Ontology validation
- Duplicate detection
- Conflict detection
- Static Trust Score
- Knowledge Confidence calculation
- Policy Engine (deterministic eligibility or rejection; Auto Approve means eligible, not persisted)
- Single-owner human review and approval before authoritative persistence
- Versioning
- Audit Trail
- Knowledge Graph synchronization
- Domain events

---

# Deferred Features

Post-MVP:

- Delegated/team human review workflow (Phase 2; single-owner review is MVP)
- Dynamic Trust Score
- Multi-stage approval
- Organization-specific governance policies
- Temporal conflict resolution
- ML-assisted trust calibration
- Collaborative knowledge review

These capabilities extend the governance model without changing the public contracts.

---

# Definition of Done

The Knowledge Management Service is complete when:

- Only validated knowledge is persisted.
- Version history is immutable.
- Audit records are complete.
- Knowledge Graph stays synchronized.
- Policy Engine governs every approval decision.
- Knowledge Confidence is calculated consistently.
- Domain events are emitted successfully.
- Documentation is synchronized.
- Every governance request produces exactly one traceable governance record.

Implementation without immutable version history is considered incomplete.

---

# Related Documents

docs/services/03_KNOWLEDGE_EXTRACTION_SERVICE.md

docs/services/05_CONTEXT_ENGINE.md

docs/domain/02_ARTIFACT_MODEL.md

docs/domain/03_BUSINESS_ONTOLOGY.md

[03_ENGINEERING_BIBLE.md](../BIBLE/03_ENGINEERING_BIBLE.md)

---

# Version History

## Version 1.0.0

Initial design baseline; production readiness was not verified. Original specification for the Knowledge Management Service.

Defines:

- Governance pipeline
- Policy Engine
- Versioning strategy
- Audit model
- Knowledge Confidence
- Source Trust Model
- Persistence model
- Domain events

---

# Status

Draft — current integrated Architecture/Engineering review pending; historical baseline evidence retained

Version

1.0.0

Effective Date

2026-06-30

---

## Conversation deletion and retention contract

Conversation purge preserves imported and approved Brand Brain knowledge, current business state, KnowledgeIndex and independent version/provenance records. Never treat retrieved context or generation ancestry as knowledge ownership. Immutability describes ordinary updates, not an exemption from legally approved erasure. Audit retention is separately approved and content-minimized; do not retain conversation payloads by relabeling them as audit data.

Canonical lifecycle: [DATA_LIFECYCLE.md](../DATA_LIFECYCLE.md). Proposed active-system removal within 30 days requires legal and operational approval; backups expire separately. Normal service access cannot bypass deletedAt, retry/exception retention remains inaccessible, and purge completion requires verified inventory cleanup. This specifies planned behavior, not an implemented purge process.

---

## Field provenance, conflict review and completeness contract

[KNOWLEDGE_PROVENANCE.md](../KNOWLEDGE_PROVENANCE.md) is the normative approval/verification/restore contract. Validate typed field origin/evidence/input refs; coordinate locks with reference-aware retention; preserve full historical snapshots. Imported source facts and approved revisions cannot reference conversation-owned generation payloads. Conflict detection proposes changes for Owner review; stale/unknown verification warns without fabricated freshness or silent replacement. Approval atomically stores the versioned completeness snapshot, missing mandatory paths and calculation time; effective generation readiness remains separate. Its sample records, migration checks and edge-case scenarios are required acceptance specifications, not executed tests.

---

## Versioned completeness measurement

[PRODUCT_METRICS.md](../PRODUCT_METRICS.md) defines calculation v2 weights and separate readiness. Persist the v2 snapshot in the approved revision transaction; emit BrandBrainRevisionApproved and BrandBrainReadinessEvaluated only after commit. Historical v1 results are immutable; reevaluation creates a new approved revision. Candidate approval eligibility, score ≥70 and optional recommendation points never bypass mandatory approved facts.

---

## Current backend and authentication boundary

Implementation target: NestJS dependency-injected core module with Prisma/PostgreSQL persistence behind its permitted application boundary, per [ADR-009](../domain/08_BACKEND_AUTH_AND_CONSTRAINTS_ADR.md). The service does not create public login endpoints, issue user tokens, or choose an identity vendor. Receive validated principal/Organization context, enforce tenant ownership for reads/writes and pass deletion/readiness guards where relevant. Provider/API credentials remain server-side configuration and are distinct from user sessions; never persist access/refresh tokens in artifacts or knowledge. SQL list cardinality/NOT NULL guards supplement, rather than replace, approved-field/provenance validation. These are planned contracts, not implemented-provider claims.

---

# END OF DOCUMENT


# Task 10 — Security launch contract

SEC-T04/05/07 require server-side current Owner authorization, same-tenant evidence, expected-head conflict checks and atomic publication of explicitly human-approved revisions. Automated eligibility/legacy Auto Approve labels never mean approved business knowledge. Candidate storage remains logically separate from generation-eligible approved state. Audit mutations with content-minimized actor/revision records; review contradictions and stale facts without replacing approved state.

[SECURITY_THREAT_MODEL.md](../SECURITY_THREAT_MODEL.md) defines mandatory SEC-01–06, threat controls SEC-T01–08 and acceptance scenarios SEC-AT-01–08. These are specified launch gates, not implemented controls or a new approval. Security/Engineering must record enabled-path evidence and resolve provider, parser/limit and operational decisions D-SEC-01/02/03 before release. Optional later defenses cannot replace mandatory isolation, authorization or human approval.


# Task 11 — Approval-based knowledge improvement

Knowledge Management owns explicit review decisions, atomic publication, decision/reason audit, rebase conflicts and measurable revision outcomes. Reuse KNOWLEDGE_CANDIDATE decision variants and BrandBrainRevision; ratings, confidence and policy eligibility cannot publish. The logical review queue is a bounded derived view, not a parallel truth store. Adopt the candidate/decision payload and metric event contracts; do not add automatic interaction mining.

[KNOWLEDGE_LEARNING_LIFECYCLE.md](../KNOWLEDGE_LEARNING_LIFECYCLE.md) defines the MVP/later boundary, minimum payload/API contracts, correction acceptance, independently reviewed factual accuracy, staleness and paired repeated-error metrics, plus KL-AT-01–14 acceptance scenarios. This is specified behavior pending review/implementation evidence, not a claim of training, automatic accuracy improvement or new approval.


# Task 12 — Lean MVP deployment boundary

Keep authorization and atomic revision/head/projection publication in one NestJS/PostgreSQL transaction boundary. Queue transport does not own approval or import-domain state. Emit/enqueue durable downstream work using reviewed same-transaction integration or outbox/reconciliation; never acknowledge acceptance with unrecoverable enqueue-after-commit. Preserve provenance, audit and revision integrity.

[ADR-010](../domain/09_LEAN_MVP_ARCHITECTURE_ADR.md) recommends one backend codebase/release with API and worker roles, PostgreSQL-backed jobs, private object storage and isolated parsers. Redis/BullMQ, Qdrant, Go application workers and independent domain microservices are conditional future alternatives. No infrastructure migration or runtime verification is claimed; D-ARCH-01/02 and existing security/policy gates remain pending.


## Task17 — Provider success is never governance approval

[ADR-011](../domain/10_AI_PROVIDER_GATEWAY_ADR.md) keeps Gateway outside the knowledge authority. KM has no Gateway/vendor dependency. Extraction validates typed proposals and genuine evidence, emits existing candidate variants, and cannot approve. Only complete VALID + SUCCEEDED extraction results enter the normal governance flow; partial deterministic results after required model assistance fails remain partial, not complete imports. Aggregate partial/closure UX remains D-AUD-07/D-IMP-02. Gateway SUCCEEDED does not satisfy approval, verification or final publication. Recheck human authorization, source/tenant lifecycle and expected head in the existing atomic publication transaction; no new approval table or Artifact v2 change.


## Task18 — Candidate decisions, publication and closure

[ADR-012](../domain/11_IMPORT_LIFECYCLE_ADR.md) is canonical for candidate identity/disposition, deterministic aggregate state, control ordering and closure. Proposed [Artifact2.1 import_control](../contracts/artifacts/2.1.0/README.md) is appended by KM for authorized KnowledgeImportModule commands under the Brand lock; it contains references, not another approval/value ledger. Original v2 terminal decisions/snapshots remain unchanged. Each CONFIRM/edit publishes atomically with required projections/index/completeness; REJECT never advances head. Last terminal decision appends CLOSED only after full frozen-set coverage and verified actual publications. All rejected → COMPLETED/NOTHING_ACCEPTED; zero eligible → REJECTED_NO_CANDIDATES/NOTHING_EXTRACTED. No undecided auto-approval, expiry, bulk discard or late reopening. Replay receipt lookup precedes stale-head rejection but follows current authorization. D-AUD-07/D-IMP-LC-01 review and D-LEARN-02 facade integration remain pending.
