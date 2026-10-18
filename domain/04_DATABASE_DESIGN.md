# Database Design — AI Brand OS

> Approval evidence audit (2026-10-13): [DECISION_REGISTER.md](../DECISION_REGISTER.md). Recorded baseline engineering decisions are preserved. Approved labels do not sign off pending import product choices D-IMP-01/02/03, later integrated PRD revisions, or proposed legal/operational retention periods. Dependency/release gates remain disclosed.

> Scope authority (2026-10-13): [MVP_SCOPE.md](../MVP_SCOPE.md). This document specifies intended behavior; design approval does not establish implementation. Historical decisions and long-term concepts do not expand MVP.

Document

[04_DATABASE_DESIGN.md](04_DATABASE_DESIGN.md)

Version

1.0.0

Status

Draft — Pending Architecture Review

Owner

Architecture

Priority

P0

Last Updated

2026-07-02

---

# Purpose

This document is the authoritative record of the physical database design for AI Brand OS: which tables exist, why they exist in that shape, and which architectural decisions were made translating `01_DOMAIN_MODEL.md`, `02_ARTIFACT_MODEL.md`, and `03_BUSINESS_ONTOLOGY.md` into a concrete PostgreSQL schema.

It does not redefine business meaning — that belongs to the Domain Model and Business Ontology. This document defines **how** those already-approved concepts are stored, queried, and related at the database layer.

The canonical planned schema is the single schema.prisma; retired pass files are historical inputs, not current artifacts. The SQL supplement is sql/MVP_CONSTRAINTS.sql (see ADR-009). This document explains the reasoning behind them so a future engineer — or a future session of this AI — does not have to reverse-engineer intent from table definitions alone.

---

# Mission

Translate the Domain Model, Business Ontology, and Artifact Model into a PostgreSQL schema that is simple enough for a solo founder learning backend development to operate confidently, while remaining structurally correct enough to not require a rewrite when Phase 2 (multi-brand, team collaboration) begins.

---

# Relationship to Other Documents

```text
01_DOMAIN_MODEL.md          (business entities, narrative)
02_ARTIFACT_MODEL.md        (pipeline artifact contract)
03_BUSINESS_ONTOLOGY.md     (formal entity/relationship/attribute schema)
01_BRAND_BRAIN_PRD.md       (field-level data model for Brand Brain)
02_AI_WORKSPACE_PRD.md      (AI Workspace domain entities)
        │
        ▼
04_DATABASE_DESIGN.md   ← this document
        │
        ▼
schema.prisma (single canonical schema; former pass files retired)
```

This document is downstream of all five source documents above. Where this document's schema deviates from a literal reading of a source document, the deviation is recorded explicitly in the Architectural Decisions section below — never silently.

---

# Design Principles

## Boring Over Clever

Match `03_ENGINEERING_BIBLE.md`'s "prefer boring, proven technologies" principle: standard relational tables for business state, one polymorphic JSONB table for pipeline lineage — not seven speculative micro-schemas or premature table-per-artifact-type normalization.

## One Concept, One Table

Per Domain Model's "Single Meaning" principle: no business or pipeline concept is modeled twice in two different tables. This directly motivated collapsing `AIRequest`/`AIResponse` (AI Workspace PRD) into the existing Artifact Model tables rather than duplicating them.

## Current State vs. History Are Different Tables

Business-facing tables (`products`, `services`, `audiences`, `competitors`, `documents`, `knowledge_index`) hold **current validated state** — what the UI reads on every page load. The artifacts table holds canonical approved full Brand Brain snapshots and provisional pipeline history. BrandBrainRevision stores approval/order/completeness metadata; Brand.currentRevisionId selects the authoritative snapshot. Business tables and KnowledgeIndex are its transactionally updated read projections. Conflating these two concerns into one table would force every UI read to filter/reduce JSONB history on every request.

## MVP Discipline Applies to Schema Too

Tables are added only when a Functional Requirement or Acceptance Criterion actually reads or writes them. `WorkspaceSession` was proposed in a source PRD but never used by any FR — it was not built. This is the same discipline `01_PROJECT_BIBLE.md` Rule 6 (Protect Simplicity) applies to features, applied to schema.

## Founder-Learning-Aware

Where a defensible choice exists between "more correct, more complex" (e.g., DB triggers enforcing cross-tenant lineage integrity) and "good enough, simpler to reason about while learning" (e.g., enforcing the same rule at the NestJS service layer), this document defaults to the simpler option for MVP and flags the more rigorous alternative for later.

---

# Schema Overview

## Pass 1 — Platform Services + Brand

| Table | Purpose |
| --- | --- |
| `users` | Authentication identity. Platform Service, not Core Domain. |
| `auth_sessions` | Planned JWT refresh token-family hash, expiry, rotation and revocation state; not WorkspaceSession. |
| `organizations` | Tenant root. Every other table traces back here. |
| `organization_members` | User ↔ Organization membership with role. |
| `brands` | MVP: exactly 1 per Organization (enforced via `@unique` on `organizationId`). |
| `brand_voices` | 1:1 with Brand. `toneAttributes` is manual-only — enforced at the service layer, not by this table alone. |

## Pass 2 — Core Domain + Artifact Model

| Table | Purpose |
| --- | --- |
| `artifacts` | Single polymorphic table implementing all 8 ArtifactType discriminators (seven numbered catalog families) from `02_ARTIFACT_MODEL.md`. Discriminated by `artifactType`, payload in JSONB. |
| `products` | Current validated Product state. |
| `services` | Current validated Service state. |
| `audiences` | Current validated Audience state. |
| `competitors` | Current validated Competitor state. |
| `documents` | Current validated Document state; points to its latest `STRUCTURED_DOCUMENT` artifact. |
| `knowledge_index` | Materialization of the Domain Model's `Knowledge` entity — one row per approved piece of knowledge, polymorphically pointing at the business table it describes. Exists so Context Engine can query knowledge generically without per-entity-type joins. |

## Pass 3 — AI Workspace Domain

| Table | Purpose |
| --- | --- |
| `conversations` | Belongs to exactly one Organization + Brand (BR-001, BR-002). |
| `messages` | User and Assistant turns. Assistant messages link to `artifacts` via `correlationId` / `responseArtifactId` rather than duplicating execution metadata. |
| `feedback` | 1:1 with Message; physical Message deletion cascades Feedback, while tombstone denies access first. |
| `conversation_purges` | Independent durable deletion work and minimal receipt; conversationId intentionally has no Conversation FK. |

---

# Architectural Decisions

## ADR-001 — Single Polymorphic `artifacts` Table

**Decision:** All 8 ArtifactType discriminators (seven numbered catalog families) defined in `02_ARTIFACT_MODEL.md` (Raw Intake, Processing Intermediate, Structured Document, Knowledge Candidate, Approved Knowledge, Prompt Context, Prompt, Response) live in one table, discriminated by `artifactType`, with a JSONB `payload` column.

**Reason:** `02_ARTIFACT_MODEL.md` ADR-001 already decided this at the domain-contract level — a single base contract shared across all 6 producing services, explicitly so lineage-tracing and observability tooling is built once. Seven separate tables would duplicate every base column seven times and contradict that ADR. This is also the direct payoff of the PostgreSQL-over-MySQL decision (`03_ENGINEERING_BIBLE.md` ADR, 2026-07-02) — JSONB with GIN indexing is what makes one polymorphic table performant instead of an anti-pattern.

**Trade-off accepted:** The current single-ID FK does not enforce cross-tenant lineage integrity (`parentArtifactId` referencing a different `organizationId`). Composite tenant-aware FKs or triggers are possible designs, but are not declared in this schema. Enforced at the NestJS service layer for MVP; a DB trigger is the correct upgrade path if an incident ever proves the service-layer check insufficient.

---

## ADR-002 — `knowledge_index` as the Materialized Knowledge Entity

**Decision:** Introduce a `knowledge_index` table not explicitly named as a table in any source document, as an entity-retrieval projection of the selected approved Brand Brain snapshot, per ADR-007 and KNOWLEDGE_PROVENANCE.md.

**Reason:** Context Engine needs one tenant/Brand-scoped entity retrieval index rather than reconstructing current knowledge by UNION across business tables. **Superseded interpretation:** this index no longer owns an independent approval/version lifecycle; immutable approved artifacts and BrandBrainRevision do, with Brand.currentRevisionId selecting current state (ADR-007).

---

## ADR-003 — No `WorkspaceSession` Table

**Decision:** The `WorkspaceSession` entity listed in `02_AI_WORKSPACE_PRD.md`'s Domain Model is not implemented as a table.

**Reason:** No Functional Requirement or Acceptance Criterion in that PRD reads or writes a Workspace Session. The actual state it would hold (current User + Organization + Brand selection) is satisfied by the authenticated session/JWT plus the `organizationId`/`brandId` already present on `conversations`. Building it now would be schema-level feature creep — directly contradicting Project Bible Rule 6.

**Reconciliation: fixed.** The current Workspace PRD explicitly excludes WorkspaceSession as a persisted aggregate; authenticated context and Conversation ownership supply the required state. No follow-up removal remains.

---

## ADR-004 — No Separate `AIRequest` / `AIResponse` Tables

**Decision:** `02_AI_WORKSPACE_PRD.md`'s `AI Request` and `AI Response` domain entities are not implemented as separate tables. `messages.correlationId` traces generation and `messages.responseArtifactId` is an explicit restricted FK to the existing artifacts table. Artifact.conversationId separately records generation ownership for purge; correlation/lineage is not an ownership boundary.

**Reason:** These entities are, structurally, the same pipeline already fully specified in `02_ARTIFACT_MODEL.md` as Prompt Context Artifact → Prompt Artifact → Response Artifact (including token usage, latency, cost, model, and validation result). Two documents independently modeling the same concept violates the Domain Model's "Single Meaning" principle. `messages` supplies the workspace-facing display record (conversation membership, ordering, rendered text); `artifacts` supplies the full execution record.

**Reconciliation: fixed.** The Workspace PRD maps AI request/response execution to Prompt Context/Prompt/Response artifacts and Message references; it defines no duplicate request/response tables.

---

## ADR-005 — ORM Selection: Prisma over TypeORM

**Decision:** Prisma is the ORM for the NestJS backend. (Engineering Bible v1.1.0 had left this "deferred to Database Design phase.")

**Reason:** Prisma's schema-first `.prisma` files are declarative and readable without prior backend framework knowledge, versus TypeORM's decorator-heavy entity classes. Given the founder's background (9 years frontend/TypeScript, new to backend — see `03_ENGINEERING_BIBLE.md` NestJS ADR, 2026-07-02), minimizing unfamiliar syntax while learning backend *concepts* was the deciding factor. Prisma also has first-class PostgreSQL JSONB support, which `artifacts.payload` depends on directly.

---

## ADR-006 — Conversation Tombstone and Verified Physical Purge

**Decision (2026-10-13):** Conversation.deletedAt records pending physical deletion and immediately denies every normal read/write/retrieval route. It is not erasure completion and does not expose restore/undo. A separate ConversationPurge stores durable work, leases, retries, exception reference, verification status and a minimal receipt, independent of the removed Conversation.

Generation artifacts use nullable Artifact.conversationId ownership (required at the application layer for generation types; absent for independent source/knowledge artifacts). Message.responseArtifactId becomes an explicit Restrict FK. Artifact lineage and conversation ownership use Restrict; purge Messages/Feedback first, then exclusively owned artifacts child-before-parent, then Conversation. Physical Conversation deletion cascades Messages and Message deletion cascades Feedback; tombstone updates cascade nothing. Conversation’s Organization, Brand and creator, Artifact’s Organization, and purge receipt’s Organization use Restrict to avoid root deletes bypassing cleanup.

**Policy:** [DATA_LIFECYCLE.md](../DATA_LIFECYCLE.md) defines proposed active removal within 30 days, separately proposed backup expiry, reference inventory, external cleanup, race controls, holds, retries and acceptance scenarios. All policy periods await legal/operational approval. No database cascade alone can erase object storage, memory or backups.

**Migration prerequisites:** Add/backfill explicit ownership using tenant-scoped Conversation/Message generation records; never infer destructive ownership solely from correlationId or ancestry. Reconcile existing responseArtifactId values (type, tenant, owner, orphans) before adding FK constraints. Unresolved/shared historical references block purge and require reviewed repair; no automatic detach/delete. These are planned schema changes, not an executed migration.

---

# Reconciled Items and Migration Prerequisites

- Organization roles use the canonical enum; MVP access is Owner-only, with delegated roles reserved for Phase 2.
- Brand lifecycle is Draft → Active → Archived; EC-005 uses archival, while Restrict protects physical deletion from bypassing the purge lifecycle.
- WorkspaceSession is not a separate table; request/response execution uses artifacts, explicit generation ownership and the restricted Message response-artifact FK.
- Before deployment, approve DATA_LIFECYCLE.md policy intervals, backfill generation ownership, reconcile legacy response references and shared dependencies, and implement/validate purge and backup-replay operations. These remain planned work; schema declarations alone do not satisfy them.

---

# MVP Scope

Included in this Database Design:

- Platform Services: Users, AuthSession (planned refresh/revocation security state), Organizations, Membership
- Core Domain: Brand, BrandVoice, Product, Service, Audience, Competitor, Document, Knowledge Index; BrandBrainRevision metadata and Brand.currentRevisionId support field history/restoration and persisted completeness
- Artifact Model: unified `artifacts` table covering all 8 ArtifactType discriminators (seven numbered catalog families)
- AI Workspace: Conversation, Message, Feedback, ConversationPurge (supporting deletion infrastructure)

---

# Deferred

- Phase 2 file exports and conversation PDF/DOCX exports: proposed design in [06_FUTURE_EXPORT_DESIGN.md](06_FUTURE_EXPORT_DESIGN.md); no ExportJob table in MVP.
- Phase 2 multiple Organizations and team roles: membership structure is retained for tenant ownership only in MVP; per-account limits are application constraints.

Post-MVP, consistent with `02_PRODUCT_BIBLE.md` Phase 2+ roadmap:

- Multi-brand support (`brands.organizationId` unique constraint removal — Ontology cardinality change from `1→1` to `1→1..N`, a MINOR ontology version bump)
- Persona, Campaign, Asset, Channel tables (currently Reserved, not Active, in the Business Ontology — must not be built until promoted)
- Conversation Memory / Organizational Memory tables (Context Engine Deferred Features)
- Dynamic Trust Score tables (Knowledge Management Service Deferred Features)
- Cross-tenant lineage enforcement via DB trigger (currently service-layer only, per ADR-001 trade-off)

---

# Definition of Done

The Database Design is complete when:

- Every Active entity type in `03_BUSINESS_ONTOLOGY.md` has a corresponding table or is explicitly and correctly materialized through another table (as `Knowledge` is via `knowledge_index`).
- Every artifact type in `02_ARTIFACT_MODEL.md`'s catalog is representable in the `artifacts` table without schema changes.
- Every Functional Requirement in `01_BRAND_BRAIN_PRD.md` and `02_AI_WORKSPACE_PRD.md` is satisfiable by the schema as written.
- All deviations from source documents are recorded as ADRs in this document, not left implicit in code comments only.
- Flagged Gaps are either resolved or explicitly carried forward with an owner and reason.
- Prisma schema files are merged into a single `schema.prisma` and run successfully against a PostgreSQL instance.

---

# Related Documents

`01_DOMAIN_MODEL.md`

`02_ARTIFACT_MODEL.md`

`03_BUSINESS_ONTOLOGY.md`

`01_BRAND_BRAIN_PRD.md`

`02_AI_WORKSPACE_PRD.md`

`03_ENGINEERING_BIBLE.md`

[schema.prisma](../schema.prisma)

[SQL migration supplement](../sql/MVP_CONSTRAINTS.sql)

[ADR-009](08_BACKEND_AUTH_AND_CONSTRAINTS_ADR.md)

---

# Version History

## Version 1.0.0

Initial design baseline; production readiness was not verified. Original Database Design document.

Defines:

- Full schema overview across 3 passes (14 tables)
- 6 Architectural Decisions, including the two decisions that deviate from
  a literal reading of `02_AI_WORKSPACE_PRD.md`
- Historical three documentation gaps later fixed; current open/superseded items are classified in DOCUMENTATION_CHANGELOG.md
- MVP scope and deferred items, cross-referenced to Business Ontology
  Reserved entity types and Product Bible Phase 2+ roadmap

---

# Status

Draft — Pending Architecture Review

Version

1.0.0

Effective Date

Pending

---

## ADR-007 — Field Provenance, Approved Snapshots and Persisted Completeness

Decision (2026-10-13): [KNOWLEDGE_PROVENANCE.md](../KNOWLEDGE_PROVENANCE.md) defines canonical field values in full APPROVED_KNOWLEDGE Artifact snapshots. BrandBrainRevision contains unique artifact, Brand, approver, prior/restored references and persisted score/missingMandatoryFields/ontologyVersion/calculationVersion/calculatedAt plus approval-time readiness. Brand.currentRevisionId is the single active selector. No Fact value table or independently updated Brand score is added. All projections and KnowledgeIndex change atomically with that selector.

Product/Service/Audience/Competitor sourceArtifactId, Document.latestArtifactId and KnowledgeIndex.latestArtifactId are restricted FKs with tenant/type checks. RecordSource/source entity labels are removed; sourceArtifactId is last materialization, not field origin. Nested evidence/input references are intentionally typed JSON with shared write/erase locks, historical/current reference scanning, integrity checks and approved repair requirements. Polymorphic entity IDs remain application-validated, including restore recreation/type/collision checks.

Required migrations: reconcile orphan/type/tenant/duplicate pointers before FK/unique constraints, backfill or require Owner reapproval for unknown historical provenance, add pinned revision metadata and head, apply score/number/time/self-link SQL checks, migrate readers, then remove old source labels. No migration has run. Statement of canonical history applies to intended design, not a claim that the schema was deployed.

---

## Measurement contract integration

BrandBrainRevision’s existing score/missing-fields/ontology/calculation/time/readiness columns support PRODUCT_METRICS.md calculation v2. No extra score source or onboarding-metric table is added here. Emit committed snapshot/readiness events through the application outbox; retain privacy-safe onboarding/output events under approved telemetry policy, separate from canonical business facts. Preserve v1 history and require an approved v2 reevaluation for current selection.

---

## ADR-008 — Per-Assistant MessageStatus and Independent Conversation Lifecycle

Decision (2026-10-13): the nine MessageStatus values in schema.prisma describe one assistant Message generation attempt, exactly as the Workspace PRD State Management table/diagram specifies. USER Messages are COMPLETED on acceptance; ASSISTANT placeholders explicitly start DRAFT. Completion/failure/cancellation/timeout is terminal only for the attempt; retry creates a new assistant Message/correlationId, never resets a terminal row. A completed response cannot terminate the persistent multi-turn Conversation.

Conversation has no generation-status column. Its lifecycle is derived from existence/deletedAt: Active → PendingPhysicalDeletion → verified physical removal, with independent ConversationPurge bookkeeping (ADR-006/DATA_LIFECYCLE.md). Archival/readiness restrictions are access conditions while the container persists. Guard generation transitions atomically by expected MessageStatus and parent tombstone; late callbacks cannot publish after deletion. No enum value or schema relation changes are required for this documentation reconciliation.

Resolution and remaining issues: [DOCUMENTATION_CHANGELOG.md](../DOCUMENTATION_CHANGELOG.md). Lifecycle acceptance scenarios are in the PRD; runtime implementations, concrete timeout/cancel policy and migration/configuration checks remain unproven.

---

## ADR-009 — Backend/Auth/NULL-safe SQL Consolidation

[Full decision and rationale](08_BACKEND_AUTH_AND_CONSTRAINTS_ADR.md): current NestJS modular monolith + Prisma 7 + PostgreSQL; TypeORM is rejected, not undecided. Planned local JWT authentication uses AuthSession security state distinct from the rejected WorkspaceSession. Datasource connection URL moves out of schema.prisma into runtime config; exact schema validation now passes.

Prisma-generated PostgreSQL scalar-list columns are nullable even for required list fields; SQL explicitly sets all ten NOT NULL. Tone uses cardinality(tone_attributes) BETWEEN 2 AND 4 plus non-NULL/list-shape safeguards. Required scalar score/number/date checks reject NULL; optional ancestry/vision/revocation NULL is intentional. Additional score/readiness/purge/auth metadata checks are authoritative in [MVP_CONSTRAINTS.sql](../sql/MVP_CONSTRAINTS.sql), not duplicated ad hoc in Prisma comments. Artifact.payload GIN index is declared once in Prisma.

Deploy custom checks/NOT NULL only through reviewed migrations with data reconciliation and shadow/replay testing. Direct db push is not an approved deployment path for these custom constraints; do not assume schema-only generation preserves all supplement rules. SQL validation covers database rules, not complete tenant/provenance/auth behavior; application-only checks remain required. [Validation results](../validation/TASK08_RESULTS.md) distinguish executed checks from implementation and production migration.

---

# END OF DOCUMENT


# Task 11 — Approval-based knowledge improvement

Task 11 requires no additional Prisma entity: candidates/immutable decisions already use Artifact JSON and approved state uses BrandBrainRevision/currentRevisionId. Version payloads and validate references/concurrency before enabling readers/writers. No persisted preference or training store is added; schema presence cannot imply automatic learning.

[KNOWLEDGE_LEARNING_LIFECYCLE.md](../KNOWLEDGE_LEARNING_LIFECYCLE.md) defines the MVP/later boundary, minimum payload/API contracts, correction acceptance, independently reviewed factual accuracy, staleness and paired repeated-error metrics, plus KL-AT-01–14 acceptance scenarios. This is specified behavior pending review/implementation evidence, not a claim of training, automatic accuracy improvement or new approval.


## ADR-010 deployment integration — recommended, not migrated

[Lean MVP ADR-010](09_LEAN_MVP_ARCHITECTURE_ADR.md) retains PostgreSQL/Prisma and immutable business contracts. A maintained PostgreSQL-backed queue (pg-boss recommended pending review) owns a separate infrastructure schema, installed/upgraded by controlled deployment migrations rather than new business Prisma models. Queue state is transport only, not a new import status/approval source; ConversationPurge stays the deletion ledger. Same-transaction enqueue or durable outbox recovery is required before launch. Pool/concurrency limits protect business transactions from queue load.

KnowledgeIndex remains the relational approved-entity projection. No vector column/extension is currently specified in schema.prisma. Start with scoped structured/keyword retrieval; pgvector needs a separately reviewed derived-projection migration if evaluation requires it, and Qdrant is conditional future scope. No Redis/Go infrastructure or database migration is performed by this recommendation. See ADR-010 for compatibility, restore, scaling and rollback gates.


## Task18 — Brand-serialized import control and publication

[ADR-012](11_IMPORT_LIFECYCLE_ADR.md) and [proposed Artifact2.1 controls](../contracts/artifacts/2.1.0/README.md) specify admission, selected attempts, review manifest and durable closure inside existing Artifact storage. No Prisma/SQL business migration is proposed. Serialize all admission/control/item-publication writers under the same Brand row lock; check chain head/unique sequence and child, current tenant/Owner/source and expected revision plus worker fence where applicable. JSON uniqueness is an application invariant under lock, not an existing Prisma unique index guarantee. Candidate decision, approved Artifact, BrandBrainRevision/completeness, head, relational projections, KnowledgeIndex and last-item closure commit atomically. Required projections cannot be deferred; optional future search indexes use approved revision-scoped rebuild/outbox. Library-owned queue/outbox migrations remain D-ARCH-01; no custom queue/status authority or external I/O in the transaction. PostgreSQL fixture probes test mechanisms, not the actual schema/application handler.


## Task19 — Evidence storage and reference integrity

[ADR-013](12_SOURCE_EVIDENCE_MAPPING_ADR.md) uses existing Artifact JSON with [proposed2.2 attachments](../contracts/artifacts/2.2.0/README.md), existing sourceArtifactId/sourceDocumentId and private immutable bytes/text refs. No Prisma migration/model is proposed. Shared Brand/source/candidate write locks enforce one binding per original candidate and exact tuple-hash coverage before eligibility; actual SQL/Prisma has no new JSON uniqueness guarantee. Retention scans historical/current introducing decisions, bindings, maps and representation refs and coordinates deletion with new writers. Content digests are tenant-scoped consistency checks, never cross-tenant dedup authority. Missing/digest-invalid refs block new publication/restore; authorized historical reads mark availability rather than silently rewiring provenance. Reference lookup/index/legacy rollout work needs D-EVID-01 and existing D-POL-01 review.
