# Database Design — AI Brand OS

Document

04_DATABASE_DESIGN.md

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

The schema itself is delivered as three Prisma files (see Related Documents). This document explains the reasoning behind them so a future engineer — or a future session of this AI — does not have to reverse-engineer intent from table definitions alone.

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
schema_pass1_platform_and_brand.prisma
schema_pass2_core_domain_and_artifacts.prisma
schema_pass3_ai_workspace.prisma
```

This document is downstream of all five source documents above. Where this document's schema deviates from a literal reading of a source document, the deviation is recorded explicitly in the Architectural Decisions section below — never silently.

---

# Design Principles

## Boring Over Clever

Match `03_ENGINEERING_BIBLE.md`'s "prefer boring, proven technologies" principle: standard relational tables for business state, one polymorphic JSONB table for pipeline lineage — not seven speculative micro-schemas or premature table-per-artifact-type normalization.

## One Concept, One Table

Per Domain Model's "Single Meaning" principle: no business or pipeline concept is modeled twice in two different tables. This directly motivated collapsing `AIRequest`/`AIResponse` (AI Workspace PRD) into the existing Artifact Model tables rather than duplicating them.

## Current State vs. History Are Different Tables

Business-facing tables (`products`, `services`, `audiences`, `competitors`, `documents`, `knowledge_index`) hold **current validated state** — what the UI reads on every page load. The `artifacts` table holds **full immutable history** — how that state came to be, for audit and lineage. Conflating these two concerns into one table would force every UI read to filter/reduce JSONB history on every request.

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
| `organizations` | Tenant root. Every other table traces back here. |
| `organization_members` | User ↔ Organization membership with role. |
| `brands` | MVP: exactly 1 per Organization (enforced via `@unique` on `organizationId`). |
| `brand_voices` | 1:1 with Brand. `toneAttributes` is manual-only — enforced at the service layer, not by this table alone. |

## Pass 2 — Core Domain + Artifact Model

| Table | Purpose |
| --- | --- |
| `artifacts` | Single polymorphic table implementing all 7 artifact types from `02_ARTIFACT_MODEL.md`. Discriminated by `artifactType`, payload in JSONB. |
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
| `feedback` | 1:1 with Message (MVP: single-user per conversation, no per-user vote tracking needed). |
| `export_jobs` | Tracks conversation export requests. |

---

# Architectural Decisions

## ADR-001 — Single Polymorphic `artifacts` Table

**Decision:** All 7 artifact types defined in `02_ARTIFACT_MODEL.md` (Raw Intake, Processing Intermediate, Structured Document, Knowledge Candidate, Approved Knowledge, Prompt Context, Prompt, Response) live in one table, discriminated by `artifactType`, with a JSONB `payload` column.

**Reason:** `02_ARTIFACT_MODEL.md` ADR-001 already decided this at the domain-contract level — a single base contract shared across all 6 producing services, explicitly so lineage-tracing and observability tooling is built once. Seven separate tables would duplicate every base column seven times and contradict that ADR. This is also the direct payoff of the PostgreSQL-over-MySQL decision (`03_ENGINEERING_BIBLE.md` ADR, 2026-07-02) — JSONB with GIN indexing is what makes one polymorphic table performant instead of an anti-pattern.

**Trade-off accepted:** Cross-tenant lineage integrity (`parentArtifactId` referencing a different `organizationId`) cannot be expressed as a native Postgres FK constraint on a self-referencing polymorphic table. Enforced at the NestJS service layer for MVP; a DB trigger is the correct upgrade path if an incident ever proves the service-layer check insufficient.

---

## ADR-002 — `knowledge_index` as the Materialized Knowledge Entity

**Decision:** Introduce a `knowledge_index` table not explicitly named as a table in any source document, representing the Domain Model / Ontology's `Knowledge` entity as a first-class, independently queryable record.

**Reason:** `Knowledge` has its own lifecycle (`Extracted → Reviewed → Approved → Versioned → Deprecated`) distinct from the business tables it describes (e.g., a `Product`'s own lifecycle is `Draft → Active → Updated → Retired`). Without this table, the Context Engine would need to UNION across `products`, `services`, `audiences`, `competitors`, and `brand_voices` to answer "what does the brand know," which contradicts the Context Engine's own Non-Responsibility list ("must never... access Business Ontology" directly — it should query one clean index instead).

---

## ADR-003 — No `WorkspaceSession` Table

**Decision:** The `WorkspaceSession` entity listed in `02_AI_WORKSPACE_PRD.md`'s Domain Model is not implemented as a table.

**Reason:** No Functional Requirement or Acceptance Criterion in that PRD reads or writes a Workspace Session. The actual state it would hold (current User + Organization + Brand selection) is satisfied by the authenticated session/JWT plus the `organizationId`/`brandId` already present on `conversations`. Building it now would be schema-level feature creep — directly contradicting Project Bible Rule 6.

**Follow-up required:** `02_AI_WORKSPACE_PRD.md`'s Domain Model and Entity Relationships sections should be corrected to remove `WorkspaceSession` in a documentation pass. Not done in this session to avoid scope creep beyond Database Design.

---

## ADR-004 — No Separate `AIRequest` / `AIResponse` Tables

**Decision:** `02_AI_WORKSPACE_PRD.md`'s `AI Request` and `AI Response` domain entities are not implemented as separate tables. `messages.correlationId` and `messages.responseArtifactId` reference the existing `artifacts` table instead.

**Reason:** These entities are, structurally, the same pipeline already fully specified in `02_ARTIFACT_MODEL.md` as Prompt Context Artifact → Prompt Artifact → Response Artifact (including token usage, latency, cost, model, and validation result). Two documents independently modeling the same concept violates the Domain Model's "Single Meaning" principle. `messages` supplies the workspace-facing display record (conversation membership, ordering, rendered text); `artifacts` supplies the full execution record.

**Follow-up required:** Same as ADR-003 — `02_AI_WORKSPACE_PRD.md` should be updated to reference Artifact Model entities directly rather than defining parallel ones. Flagged, not yet corrected.

---

## ADR-005 — ORM Selection: Prisma over TypeORM

**Decision:** Prisma is the ORM for the NestJS backend. (Engineering Bible v1.1.0 had left this "deferred to Database Design phase.")

**Reason:** Prisma's schema-first `.prisma` files are declarative and readable without prior backend framework knowledge, versus TypeORM's decorator-heavy entity classes. Given the founder's background (9 years frontend/TypeScript, new to backend — see `03_ENGINEERING_BIBLE.md` NestJS ADR, 2026-07-02), minimizing unfamiliar syntax while learning backend *concepts* was the deciding factor. Prisma also has first-class PostgreSQL JSONB support, which `artifacts.payload` depends on directly.

---

## ADR-006 — Soft Deletes for Conversations, Hard Cascade for Messages

**Decision:** `conversations.deletedAt` is a nullable soft-delete marker. `messages` are hard-deleted via `onDelete: Cascade` when their parent Conversation row is eventually purged.

**Reason:** `03_ENGINEERING_BIBLE.md`'s Database Principles state "soft deletes where appropriate." Conversation deletion (FR-007) requires immediate disappearance from the UI, which a soft-delete flag satisfies without losing recoverability. Messages have no independent lifecycle outside their conversation, so cascading is correct once the parent is actually purged.

---

# Flagged Gaps (Not Blocking, Require Follow-Up)

1. **Role enum inconsistency.** `02_AI_WORKSPACE_PRD.md` lists `Owner / Admin / Member`; `03_ENGINEERING_BIBLE.md` lists `Owner / Admin / Editor / Viewer`. The schema (`organization_members.role`) implements the Engineering Bible's version as canonical. The PRD needs a corresponding correction.

2. **`Brand` has no defined lifecycle.** `01_DOMAIN_MODEL.md`'s Entity Lifecycle section defines lifecycles for Organization, Product, Service, Audience, Persona, Brand Voice, Campaign, Content, Asset, Document, and Knowledge — but not for `Brand` itself. This leaves Edge Case EC-005 in the AI Workspace PRD ("Brand deleted during conversation") without a concrete mechanism. The current schema uses `onDelete: Restrict` on `conversations.brandId` as a conservative placeholder. Needs a Product decision: does Brand get an `Active/Archived` status, or is hard deletion genuinely intended?

3. **`WorkspaceSession`, `AIRequest`, `AIResponse` in `02_AI_WORKSPACE_PRD.md`** should be corrected to match ADR-003 and ADR-004 above.

None of these block MVP schema implementation; all three should be resolved in a documentation correction pass before onboarding another engineer.

---

# MVP Scope

Included in this Database Design:

- Platform Services: Users, Organizations, Membership
- Core Domain: Brand, BrandVoice, Product, Service, Audience, Competitor, Document, Knowledge Index
- Artifact Model: unified `artifacts` table covering all 7 artifact types
- AI Workspace: Conversation, Message, Feedback, ExportJob

---

# Deferred

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

`schema_pass1_platform_and_brand.prisma`

`schema_pass2_core_domain_and_artifacts.prisma`

`schema_pass3_ai_workspace.prisma`

---

# Version History

## Version 1.0.0

Initial production-ready Database Design document.

Defines:

- Full schema overview across 3 passes (14 tables)
- 6 Architectural Decisions, including the two decisions that deviate from
  a literal reading of `02_AI_WORKSPACE_PRD.md`
- 3 explicitly flagged documentation gaps requiring follow-up
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

# END OF DOCUMENT
